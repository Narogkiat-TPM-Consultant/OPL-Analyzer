// EP13 — Daily check vs Regular check (OPL 5-C-1, PDF p.17).
// H.dcUnit: a hydraulic power unit seen from the front, as the operator sees it on the daily round: tank with
//   level glass (H / L), motor + coupling + pump on the lid, discharge line with a tube fitting, pressure gauge,
//   relief valve with pressure-adjust handle + lock nut, line to the circuit, return line. Coordinates 1100 × 640.
// H.dcSense: eye / ear / hand icons for the three senses. H.dcReg: icons of the 4 regular-check items.
// Small timeline helpers (fnTo, env, wob, ring, chip) are copied from EP10 so this episode stands alone.
const DC = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", tank: "#ddd6c6", dark: "#9aa1aa", blue: "#1f5fbf",
  oil: "#f2c94c", oilBg: "#fbe7a1", paper: "#fffdf8", red: "#d0233a", green: "#178a4e", warn: "#f2a900",
  dirt: "#4b3d24", line: "#d6cdb9", pale: "#eef3fb",
};
// level glass: normal level between H and L, low level below L
const DU = { lvl: 486, low: 556, bot: 579, H: 452, L: 530 };

H.fnTo = (el, prop, fn, tA, tB, o = {}) => {
  const d = Math.max(0.001, tB - tA), v0 = fn(tA);
  const wrap = (v) => (o.attr ? { attr: { [prop]: v } } : { [prop]: v });
  tl.fromTo(el, { ...wrap(v0), ...(o.extra || {}) }, { ...wrap(v0 + 1), ...(o.extra || {}), duration: d, ease: (q) => fn(tA + q * d) - v0, immediateRender: o.ir ?? false }, tA);
};
H.env = (t, t0, t1, r = 0.3) => Math.max(0, Math.min(1, (t - t0) / r, (t1 - t) / r));
H.wob = (t, k = 0) => 0.6 * Math.sin(2 * Math.PI * 5.3 * t + k) + 0.4 * Math.sin(2 * Math.PI * 8.7 * t + 1.3 + k);
// shake an element in x between t0 and t1 (deterministic)
H.dcShake = (el, t0, t1, amp = 2.4) => H.fnTo(el, "x", (t) => amp * H.env(t, t0, t1, 0.2) * H.wob(t * 1.9, 0.7), t0, t1);
// pulsing red ring on a spot (finite repeat)
H.ring = (parent, id, cx, cy, r, t, n = 3, col = DC.red) => {
  const c = H.el("circle", { id, cx, cy, r, fill: "none", stroke: col, "stroke-width": 6, opacity: 0 }, parent);
  tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t);
  tl.fromTo(c, { scale: 1, svgOrigin: `${cx} ${cy}` }, { scale: 1.16, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t + 0.1);
  return c;
};
// label chip (box + text), starts hidden
H.chip = (parent, id, x, y, str, o = {}) => {
  const g = H.el("g", { id, opacity: o.opacity ?? 0 }, parent);
  const size = o.size || 23, w = o.w || str.length * size * 0.56 + 26, h = size + 16;
  const x0 = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  H.el("rect", { x: H.f(x0), y: H.f(y - h / 2), width: H.f(w), height: h, rx: 8, fill: o.fill || DC.paper, stroke: o.stroke || DC.ink, "stroke-width": o.sw || 2.5 }, g);
  H.text(g, x0 + w / 2, y + size * 0.36, str, { size, anchor: "middle", fill: o.color || DC.ink });
  return g;
};
// oil drop, tip up, centred on (cx, cy), size s
H.dcDropD = (cx, cy, s) => {
  const f = H.f;
  return `M ${f(cx)} ${f(cy - 1.5 * s)} C ${f(cx + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx + s)} ${f(cy - 0.3 * s)} ${f(cx + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(cx - s)} ${f(cy + 0.25 * s)} C ${f(cx - s)} ${f(cy - 0.3 * s)} ${f(cx - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx)} ${f(cy - 1.5 * s)} Z`;
};
// irregular dirt smudge around (cx, cy)
H.dcBlobD = (cx, cy, rx, ry, k = 0) => {
  const f = H.f, n = 9, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n, w = 1 + 0.22 * Math.sin(3 * a + k) + 0.12 * Math.cos(5 * a + 2 * k);
    pts.push([cx + rx * w * Math.cos(a), cy + ry * w * Math.sin(a)]);
  }
  let d = `M ${f((pts[0][0] + pts[1][0]) / 2)} ${f((pts[0][1] + pts[1][1]) / 2)}`;
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n], q = pts[(i + 1) % n];
    d += ` Q ${f(p[0])} ${f(p[1])} ${f((p[0] + q[0]) / 2)} ${f((p[1] + q[1]) / 2)}`;
  }
  return d + " Z";
};

H.dcUnit = (parent, p, o = {}) => {
  const lab = o.labels ?? ["tank", "pump", "motor", "relief", "gauge", "fitting", "level", "circuit"];
  const has = (k) => lab.includes(k);
  const g = H.el("g", { id: p, ...(o.transform ? { transform: o.transform } : {}) }, parent);
  const rect = (x, y, w, h, fill, a = {}, par = g) =>
    H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 6, fill, stroke: DC.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, par);
  const T = (x, y, s, a = {}) => H.text(a.par || g, x, y, s, { size: a.size || 22, anchor: a.anchor || "middle", fill: a.fill || DC.ink });
  const pipe = (d, w, col, a = {}, par = g) => H.el("path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linejoin": "round", ...a }, par);
  const S = { g };

  // floor, legs, tank front, lid
  H.el("line", { x1: 20, y1: 624, x2: 830, y2: 624, stroke: DC.muted, "stroke-width": 3 }, g);
  rect(66, 598, 30, 26, DC.dark, { sw: 3, rx: 2 });
  rect(744, 598, 30, 26, DC.dark, { sw: 3, rx: 2 });
  S.tank = rect(40, 400, 760, 200, DC.tank, { sw: 5, rx: 6 });
  rect(30, 388, 780, 14, DC.metal, { rx: 3 });
  if (has("tank")) T(330, 572, "ถังน้ำมัน (Oil tank)", { size: 26 });

  // return line from the circuit + relief-valve drain (dashed, behind everything)
  pipe("M 990 290 L 990 340 L 760 340", 8, DC.muted, { "stroke-dasharray": "12 9" });
  pipe("M 760 232 L 760 388", 8, DC.muted, { "stroke-dasharray": "12 9" });

  // pressure line: pump → fitting → gauge → relief valve → circuit
  const main = "M 420 296 L 420 196 L 900 196";
  pipe(main, 11, DC.blue);
  pipe("M 620 196 L 620 160", 7, DC.blue);
  S.flow = pipe(main, 4, "#ffffff", { id: `${p}-flow`, "stroke-dasharray": "8 18", "stroke-linecap": "butt", opacity: 0 });

  // air breather (filler) on the lid — not a check item here, so no label
  rect(633, 370, 14, 18, DC.dark, { sw: 2, rx: 1 });
  rect(618, 344, 44, 28, DC.metal, { rx: 9 });
  H.el("path", { d: "M 627 352 L 653 352 M 627 358 L 653 358 M 627 364 L 653 364", fill: "none", stroke: DC.ink, "stroke-width": 2.5 }, g);

  // motor (left) + shaft + coupling + pump (right)
  rect(132, 376, 30, 12, DC.metal, { sw: 3, rx: 2 });
  rect(268, 376, 30, 12, DC.metal, { sw: 3, rx: 2 });
  rect(405, 366, 30, 22, DC.metal, { sw: 3, rx: 2 });
  S.motor = H.el("g", { id: `${p}-motor` }, g);
  rect(110, 282, 210, 94, DC.metal, { rx: 10 }, S.motor);
  const fins = [];
  for (let x = 126; x <= 306; x += 15) fins.push(`M ${x} 288 L ${x} 370`);
  H.el("path", { d: fins.join(" "), fill: "none", stroke: DC.ink, "stroke-width": 2, opacity: 0.4 }, S.motor);
  rect(92, 298, 18, 62, DC.dark, { sw: 3, rx: 4 }, S.motor);
  rect(163, 310, 104, 38, DC.paper, { sw: 2, rx: 6 }, S.motor);
  if (has("motor")) T(215, 337, "มอเตอร์", { size: 24, par: S.motor });
  rect(318, 325, 62, 12, DC.dark, { sw: 2, rx: 2 });
  S.cpl = H.el("g", { id: `${p}-cpl` }, g);
  rect(332, 311, 17, 40, DC.metal, { sw: 3, rx: 3 }, S.cpl);
  rect(351, 311, 17, 40, DC.metal, { sw: 3, rx: 3 }, S.cpl);
  S.pump = H.el("g", { id: `${p}-pump` }, g);
  rect(370, 296, 100, 70, DC.dark, { rx: 10 }, S.pump);
  if (has("pump")) T(420, 341, "ปั๊ม", { size: 26, par: S.pump });

  // tube fitting on the pressure line (body-side nut + union nut that can loosen)
  rect(510, 183, 16, 26, DC.metal, { sw: 3, rx: 2 });
  S.gap = rect(525, 187, 9, 18, DC.red, { sw: 0, rx: 1, attr: { id: `${p}-gap`, opacity: 0 } });
  S.nut = H.el("g", { id: `${p}-nut` }, g);
  rect(526, 181, 20, 30, DC.dark, { sw: 3, rx: 2 }, S.nut);
  H.el("path", { d: "M 536 183 L 536 209", fill: "none", stroke: DC.ink, "stroke-width": 2 }, S.nut);
  if (has("fitting")) T(528, 166, "ข้อต่อท่อ", { size: 22 });
  // leak: drops falling from the fitting onto the lid + puddle
  S.drops = [0, 1, 2].map((i) => H.el("path", { id: `${p}-d${i}`, d: H.dcDropD(538, 226, 7), fill: DC.oil, stroke: DC.ink, "stroke-width": 2, opacity: 0 }, g));
  S.puddle = H.el("ellipse", { id: `${p}-pud`, cx: 538, cy: 386, rx: 30, ry: 5, fill: DC.oil, stroke: DC.ink, "stroke-width": 2, opacity: 0 }, g);

  // pressure gauge: blue mark = set pressure (ค่าตั้ง); the deck gives no number, so no scale values
  S.gauge = H.gauge(g, 620, 114, 44, { id: `${p}-g`, min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, value: 6, marks: [{ v: 6, color: DC.blue, id: `${p}-set` }] });
  if (has("gauge")) T(566, 120, "เกจวัดแรงดัน", { size: 22, anchor: "end" });

  // relief valve, drawn 1.5× around the pipe axis so the handle and lock nut can be seen
  const rv = H.el("g", { id: `${p}-rv`, transform: "translate(760 196) scale(1.5)" }, g);
  const r2 = (x, y, w, h, fill, a = {}, par = rv) => rect(x, y, w, h, fill, { sw: 2.7, rx: 3, ...a }, par);
  r2(-24, -20, 48, 44, DC.metal, { rx: 4 });
  r2(-10, -46, 20, 27, DC.metal, { rx: 2 });
  S.handle = H.el("g", { id: `${p}-hdl` }, rv);
  r2(-4, -92, 8, 42, DC.dark, { rx: 1 }, S.handle);
  r2(-24, -110, 48, 21, DC.muted, { rx: 5 }, S.handle);
  H.el("path", { d: "M -16 -107 L -16 -92 M -8 -107 L -8 -92 M 0 -107 L 0 -92 M 8 -107 L 8 -92 M 16 -107 L 16 -92", fill: "none", stroke: "#ffffff", "stroke-width": 1.6, opacity: 0.6 }, S.handle);
  S.lgap = r2(-13, -52, 26, 6, DC.red, { sw: 0, rx: 1, attr: { id: `${p}-lgap`, opacity: 0 } });
  S.lock = H.el("g", { id: `${p}-lock` }, rv);
  r2(-16, -60, 32, 14, DC.dark, { rx: 2 }, S.lock);
  H.el("path", { d: "M -6 -59 L -6 -47 M 6 -59 L 6 -47", fill: "none", stroke: DC.ink, "stroke-width": 1.6 }, S.lock);
  if (has("relief")) T(712, 256, "Relief valve", { size: 22, anchor: "end" });
  if (has("handle")) {
    T(818, 55, "มือหมุนปรับแรงดัน", { size: 22, anchor: "start" });
    T(818, 124, "Lock nut", { size: 22, anchor: "start" });
  }

  // line to the circuit
  rect(900, 140, 180, 150, DC.paper, { rx: 14 });
  if (has("circuit")) { T(990, 206, "ไปวงจร", { size: 28 }); T(990, 242, "(วาล์ว · กระบอกสูบ)", { size: 19 }); }

  // oil-level glass on the tank front (H / L)
  rect(690, 418, 40, 168, DC.paper, { rx: 8 });
  S.glass = rect(697, DU.lvl, 26, DU.bot - DU.lvl, DC.oil, { sw: 0, rx: 3, attr: { id: `${p}-glass` } });
  S.bub = H.el("g", { id: `${p}-bub`, opacity: 0 }, g);
  for (const [x, y, r] of [[703, 570, 4], [714, 560, 3], [709, 548, 4.5], [718, 538, 3], [704, 528, 3.5], [713, 516, 4], [706, 505, 3], [717, 498, 3.5]])
    H.el("circle", { cx: x, cy: y, r, fill: "#ffffff", stroke: DC.ink, "stroke-width": 1.5 }, S.bub);
  H.el("path", { d: `M 682 ${DU.H} L 738 ${DU.H} M 682 ${DU.L} L 738 ${DU.L}`, fill: "none", stroke: DC.ink, "stroke-width": 3 }, g);
  T(744, DU.H + 7, "H", { size: 20, anchor: "start" });
  T(744, DU.L + 7, "L", { size: 20, anchor: "start" });
  if (has("level")) T(668, 512, "ระดับน้ำมัน", { size: 21, anchor: "end" });

  // effect layers (all start hidden)
  S.dirt = H.el("g", { id: `${p}-dirt`, opacity: 0 }, g);
  for (const [cx, cy, rx, ry, k] of [[96, 438, 26, 14, 0], [168, 486, 34, 18, 1.3], [118, 540, 22, 13, 2.1], [236, 444, 20, 11, 0.6], [292, 520, 16, 10, 2.8], [140, 300, 18, 11, 1.7], [282, 358, 15, 9, 0.9]])
    H.el("path", { d: H.dcBlobD(cx, cy, rx, ry, k), fill: DC.dirt, opacity: 0.55 }, S.dirt);
  const arcs = (id, cx, cy, a0, a1, rs) => rs.map((r, i) => {
    const a = H.el("g", { id: `${id}${i}`, opacity: 0 }, g);
    for (const [col, w] of [["#ffffff", 10], [DC.ink, 5]])
      H.el("path", { d: H.arcD(cx, cy, r, a0, a1), fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" }, a);
    return a;
  });
  S.noise = arcs(`${p}-nz`, 350, 331, 235, 305, [40, 56, 72]);
  // abnormal noise: jagged strokes above the motor
  S.jag = [0, 1, 2].map((i) => {
    const a = H.el("g", { id: `${p}-jg${i}`, opacity: 0 }, g), x = 170 + i * 45, y = 262 - (i % 2) * 6;
    const d = `M ${x} ${y} L ${x + 8} ${y - 14} L ${x + 16} ${y - 2} L ${x + 24} ${y - 18} L ${x + 32} ${y - 6}`;
    for (const [col, w] of [["#ffffff", 9], [DC.ink, 4.5]]) H.el("path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }, a);
    return a;
  });
  // vibration marks on both sides of the pump
  S.vib = H.el("g", { id: `${p}-vib`, opacity: 0 }, g);
  for (const k of [0, 1]) {
    const x = 482 + 13 * k;
    H.el("path", { d: `M ${x} 312 Q ${x + 9} 331 ${x} 350`, fill: "none", stroke: DC.ink, "stroke-width": 4, "stroke-linecap": "round" }, S.vib);
  }
  // heat waves rising from the tank front (oil temperature)
  S.heat = H.el("g", { id: `${p}-heat`, opacity: 0 }, g);
  for (const x of [372, 402, 432])
    H.el("path", { d: `M ${x} 470 C ${x - 9} 462 ${x + 9} 452 ${x} 444 C ${x - 9} 436 ${x + 9} 426 ${x} 418`, fill: "none", stroke: DC.red, "stroke-width": 4.5, "stroke-linecap": "round" }, S.heat);

  // check spots (unit coordinates)
  S.spot = { dirt: [168, 486], leak: [536, 196], vib: [420, 331], noise: [350, 331], abn: [215, 329], temp: [402, 470], level: [710, 500],
    lock: [760, 112], gauge: [620, 114], glass: [710, 500] };
  return S;
};

// level glass → y (oil column top)
H.dcLevel = (S, y, t, dur = 0.9) => tl.to(S.glass, { attr: { y, height: DU.bot - y }, duration: dur, ease: "power1.inOut" }, t);
// leak: drops fall from the fitting onto the lid between t0 and t1 (pure function of time), puddle grows
H.dcLeak = (S, t0, t1) => {
  const cyc = 0.85, fall = 0.6 / cyc;
  S.drops.forEach((d, i) => {
    const ph = (t) => { const u = (t - t0 - i * 0.28) / cyc; return u < 0 ? -1 : u - Math.floor(u); };
    H.fnTo(d, "y", (t) => { const p = ph(t); return p < 0 || p > fall ? 0 : 150 * (p / fall) ** 2; }, t0, t1);
    H.fnTo(d, "opacity", (t) => { const p = ph(t); return t > t1 - 0.05 || p <= 0.02 || p > fall ? 0 : 1; }, t0, t1);
  });
  tl.fromTo(S.puddle, { opacity: 0, scaleX: 0.2, svgOrigin: "538 386" }, { opacity: 1, scaleX: 1, svgOrigin: "538 386", duration: 1.6, ease: "power1.out" }, t0 + 0.6);
};
// noise arcs flash outward from t for about dur seconds
H.dcFlash = (els, t, dur, step = 0.1) => {
  const n = Math.max(1, Math.round(dur / 0.5));
  tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: step, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t);
};
// bubbles rise in the level glass
H.dcBubbles = (S, t, dur) => {
  tl.fromTo(S.bub, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
  const kids = [...S.bub.children], n = Math.max(1, Math.round(dur / 0.9));
  tl.fromTo(kids, { y: 0 }, { y: -22, duration: 0.9, ease: "none", stagger: 0.07, repeat: n - 1, immediateRender: false }, t);
};

// Sense icons centred on (0, 0), about 64 units across. kind: eye | ear | hand | meter (complicated instrument)
H.dcSense = (parent, kind, cx, cy, s = 1, o = {}) => {
  const g = H.el("g", { transform: `translate(${cx} ${cy}) scale(${s})`, ...(o.id ? { id: o.id } : {}) }, parent);
  const ink = o.ink || DC.ink, fill = o.fill || DC.paper, sw = o.sw || 4;
  if (kind === "eye") {
    H.el("path", { d: "M -32 0 Q 0 -30 32 0 Q 0 30 -32 0 Z", fill, stroke: ink, "stroke-width": sw, "stroke-linejoin": "round" }, g);
    H.el("circle", { cx: 0, cy: 0, r: 12, fill: DC.blue, stroke: ink, "stroke-width": sw * 0.6 }, g);
    H.el("circle", { cx: 0, cy: 0, r: 5, fill: ink }, g);
  }
  if (kind === "ear") {
    H.el("path", { d: "M -2 -32 C 20 -32 30 -16 28 0 C 26 14 14 17 12 29 C 10 38 -2 40 -9 32 C -16 24 -18 10 -18 -4 C -18 -21 -12 -32 -2 -32 Z", fill, stroke: ink, "stroke-width": sw, "stroke-linejoin": "round" }, g);
    H.el("path", { d: "M -7 -15 C 4 -21 15 -12 13 -3 C 11 5 2 6 2 14", fill: "none", stroke: ink, "stroke-width": sw * 0.8, "stroke-linecap": "round" }, g);
  }
  if (kind === "hand") {
    const fing = [[-21, -20, 9, 36], [-11, -32, 9, 46], [-1, -34, 9, 48], [9, -30, 9, 44]];
    H.el("path", { d: "M -20 6 L -33 -9 C -37 -13 -32 -19 -27 -15 L -14 -3", fill, stroke: ink, "stroke-width": sw * 0.8, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
    for (const [x, y, w, h] of fing) H.el("rect", { x, y, width: w, height: h, rx: 4.5, fill, stroke: ink, "stroke-width": sw * 0.8 }, g);
    H.el("path", { d: "M -22 -2 L 19 -2 L 19 16 C 19 28 10 34 -1 34 C -13 34 -22 27 -22 16 Z", fill, stroke: ink, "stroke-width": sw * 0.8, "stroke-linejoin": "round" }, g);
  }
  if (kind === "meter") {
    H.el("rect", { x: -30, y: -26, width: 60, height: 52, rx: 8, fill, stroke: ink, "stroke-width": sw }, g);
    H.el("rect", { x: -20, y: -17, width: 40, height: 17, rx: 3, fill: "#dfe8f6", stroke: ink, "stroke-width": sw * 0.6 }, g);
    for (const x of [-14, 0, 14]) H.el("circle", { cx: x, cy: 13, r: 4.5, fill: ink }, g);
    H.el("path", { d: "M 22 -26 L 30 -44", fill: "none", stroke: ink, "stroke-width": sw * 0.8, "stroke-linecap": "round" }, g);
  }
  return g;
};
// round badge with a sense icon (paper disc + blue ring)
H.dcBadge = (parent, id, kind, cx, cy, r = 40, o = {}) => {
  const g = H.el("g", { id, ...(o.hidden ? { opacity: 0 } : {}) }, parent);
  H.el("circle", { cx, cy, r, fill: o.bg || DC.paper, stroke: o.ring || DC.blue, "stroke-width": o.rw || 5 }, g);
  H.dcSense(g, kind, cx, cy, (r * 0.78) / 34);
  return g;
};
// numbered blue disc (route / check-item number)
H.dcNum = (parent, id, cx, cy, n, o = {}) => {
  const g = H.el("g", { id, ...(o.hidden ? { opacity: 0 } : {}) }, parent);
  const r = o.r || 20;
  H.el("circle", { cx, cy, r, fill: o.fill || DC.blue, stroke: "#ffffff", "stroke-width": 3 }, g);
  H.text(g, cx, cy + r * 0.42, String(n), { size: Math.round(r * 1.2), anchor: "middle", fill: "#ffffff" });
  return g;
};

// Regular-check item icons, centred on (cx, cy), about 130 × 130 units.
// kind: oil (sample bottle with contamination) | filter (pleated element, dirty) | stopper (stopper bolt + lock nut) | seal (packing ring, cracked)
H.dcReg = (parent, kind, cx, cy, o = {}) => {
  const g = H.el("g", { transform: `translate(${cx} ${cy})`, ...(o.id ? { id: o.id } : {}) }, parent);
  const R = (x, y, w, h, fill, a = {}) => H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 4, fill, stroke: DC.ink, "stroke-width": a.sw ?? 3.5 }, g);
  const P = (d, a = {}) => H.el("path", { d, fill: "none", stroke: DC.ink, "stroke-width": 3, "stroke-linecap": "round", ...a }, g);
  const S = { g };
  if (kind === "oil") {
    R(-11, -58, 22, 12, DC.muted, { rx: 3 });
    H.el("path", { d: "M -9 -46 L -9 -36 C -30 -30 -32 -18 -32 -8 L -32 46 C -32 52 -28 56 -22 56 L 22 56 C 28 56 32 52 32 46 L 32 -8 C 32 -18 30 -30 9 -36 L 9 -46 Z", fill: DC.paper, stroke: DC.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);
    H.el("path", { d: "M -29 -2 L 29 -2 L 29 46 C 29 50 26 53 22 53 L -22 53 C -26 53 -29 50 -29 46 Z", fill: DC.oil }, g);
    S.dirt = H.el("g", { opacity: o.dirty ? 1 : 0 }, g);
    for (const [x, y, r] of [[-16, 10, 3.5], [6, 18, 3], [-4, 34, 4], [16, 40, 3], [-20, 44, 2.6], [14, 6, 2.6], [0, 24, 2.4]]) H.el("circle", { cx: x, cy: y, r, fill: DC.dirt }, S.dirt);
    H.el("path", { d: "M -29 -2 L 29 -2 L 29 46 C 29 50 26 53 22 53 L -22 53 C -26 53 -29 50 -29 46 Z", fill: DC.dirt, opacity: 0.25 }, S.dirt);
  }
  if (kind === "filter") {
    R(-38, -52, 76, 12, DC.dark, { rx: 3 });
    R(-38, 40, 76, 12, DC.dark, { rx: 3 });
    R(-32, -40, 64, 80, "#f4efe2", { rx: 2, sw: 3 });
    const pl = [];
    for (let x = -26; x <= 26; x += 8) pl.push(`M ${x} -40 L ${x} 40`);
    P(pl.join(" "), { "stroke-width": 2.2, opacity: 0.7 });
    S.dirt = H.el("g", { opacity: o.dirty ? 1 : 0 }, g);
    H.el("path", { d: H.dcBlobD(-6, 6, 24, 28, 0.8), fill: DC.dirt, opacity: 0.6 }, S.dirt);
    H.el("path", { d: H.dcBlobD(16, -20, 10, 12, 2.2), fill: DC.dirt, opacity: 0.55 }, S.dirt);
  }
  if (kind === "stopper") {
    // bracket (hatched block) + stopper bolt screwed in from the left + lock nut; slide block on the right
    R(-60, -40, 34, 80, DC.metal, { rx: 3 });
    R(34, -30, 30, 60, DC.dark, { rx: 4 });
    S.bolt = H.el("g", {}, g);
    H.el("rect", { x: -26, y: -7, width: 58, height: 14, fill: DC.dark, stroke: DC.ink, "stroke-width": 3 }, S.bolt);
    const th = [];
    for (let x = -22; x <= 28; x += 7) th.push(`M ${x} -7 L ${x + 4} 7`);
    H.el("path", { d: th.join(" "), fill: "none", stroke: DC.ink, "stroke-width": 1.6, opacity: 0.7 }, S.bolt);
    H.el("rect", { x: -78, y: -16, width: 18, height: 32, rx: 3, fill: DC.dark, stroke: DC.ink, "stroke-width": 3.5 }, S.bolt);
    S.lock = H.el("rect", { x: -26, y: -14, width: 12, height: 28, rx: 2, fill: DC.muted, stroke: DC.ink, "stroke-width": 3 }, g);
    S.gap = H.el("rect", { x: -26, y: -11, width: 7, height: 22, fill: DC.red, opacity: o.loose ? 1 : 0 }, g);
  }
  if (kind === "seal") {
    // packing ring seen at an angle: outer + inner ellipse, a crack and worn lip
    H.el("ellipse", { cx: 0, cy: 0, rx: 52, ry: 40, fill: "#59606a", stroke: DC.ink, "stroke-width": 3.5 }, g);
    H.el("ellipse", { cx: 0, cy: 0, rx: 32, ry: 23, fill: DC.paper, stroke: DC.ink, "stroke-width": 3.5 }, g);
    H.el("path", { d: "M -44 -14 Q 0 -44 44 -14", fill: "none", stroke: "#ffffff", "stroke-width": 2.4, opacity: 0.5 }, g);
    S.crack = H.el("path", { d: "M 30 22 L 38 28 L 34 33 L 44 39", fill: "none", stroke: DC.red, "stroke-width": 4, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: o.worn ? 1 : 0 }, g);
  }
  return S;
};
