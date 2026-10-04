// EP14 — Daily checking (1): start-up (OPL 5-C-2, p.18). Shared drawings for all scenes.
// H.suStation: hydraulic power unit seen from the side with the tank cut open (after EP10's pump station):
//   motor + coupling + pump on the lid, suction tube + strainer, pressure gauge with the blue set-pressure mark,
//   return line with an inline filter + clogging indicator, oil-level glass, air breather. Coordinates 1100 × 640.
// SU.dial / SU.indicator: gauge (blue set mark, no numbers — the deck gives no value) and filter indicator
//   (green = normal, red = clogged). SU.ear, SU.waves (+ steady / intermittent pulses), SU.mini (small unit for
//   the compare cards), SU.pumpIcon (judgment cards).
const SC = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", blue: "#1f5fbf", oil: "#f2c94c",
  oilBg: "#fbe7a1", paper: "#fffdf8", red: "#d0233a", air: "#fffaf0", dirt: "#4b3d24", warn: "#f2a900",
  green: "#178a4e", skin: "#f1d6bf", thick: "#d99a14",
};
const SL = { lvl: 445, low: 530, oilBot: 612, glassBot: 596 };
const SU = {};

// ---- seekable helpers (from EP10) ------------------------------------------------------------------------
// Tween a numeric property along a pure function of absolute time fn(t) between tA and tB.
H.fnTo = (el, prop, fn, tA, tB, o = {}) => {
  const d = Math.max(0.001, tB - tA), v0 = fn(tA);
  const wrap = (v) => (o.attr ? { attr: { [prop]: v } } : { [prop]: v });
  tl.fromTo(el, { ...wrap(v0), ...(o.extra || {}) }, { ...wrap(v0 + 1), ...(o.extra || {}), duration: d, ease: (q) => fn(tA + q * d) - v0, immediateRender: o.ir ?? false }, tA);
};
H.env = (t, t0, t1, r = 0.3) => Math.max(0, Math.min(1, (t - t0) / r, (t1 - t) / r));
H.wob = (t, k = 0) => 0.6 * Math.sin(2 * Math.PI * 5.3 * t + k) + 0.4 * Math.sin(2 * Math.PI * 8.7 * t + 1.3 + k);
// Oil-flow dashes along paths from t for dur seconds; speed = dash travel per second (thick oil = slow).
SU.flow = (els, t, dur, speed = 78) => {
  for (const el of els) {
    tl.fromTo(el, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, t);
    tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -speed * dur, duration: dur, ease: "none", immediateRender: false }, t);
  }
};
// Spin a group about origin: rpsFn(t) not needed — constant turns per second from tA to tB.
SU.spin = (el, origin, tA, tB, tps = 2) =>
  tl.fromTo(el, { rotation: 0, svgOrigin: origin }, { rotation: 360 * Math.max(1, Math.round((tB - tA) * tps)), svgOrigin: origin, duration: tB - tA, ease: "none" }, tA);
SU.show = (el, t, d = 0.35) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: d }, t);

// ---- gauge with the set-pressure mark ---------------------------------------------------------------------
// 0..10 over 270° (135° → 405°, clockwise from 3 o'clock); blue bar = set pressure; no numbers.
SU.dial = (parent, p, cx, cy, r, o = {}) => {
  const g = H.el("g", { id: p }, parent), f = H.f;
  const ang = (v) => 135 + 27 * v;
  const pt = (v, k) => {
    const a = (ang(v) * Math.PI) / 180;
    return [f(cx + Math.cos(a) * r * k), f(cy + Math.sin(a) * r * k)];
  };
  H.el("circle", { cx, cy, r, fill: SC.paper, stroke: SC.ink, "stroke-width": f(Math.max(3, r * 0.08)) }, g);
  for (let v = 0; v <= 10; v++) {
    const [x1, y1] = pt(v, 0.86), [x2, y2] = pt(v, v % 2 ? 0.76 : 0.66);
    H.el("line", { x1, y1, x2, y2, stroke: SC.ink, "stroke-width": f(Math.max(1.5, r * (v % 2 ? 0.025 : 0.045))) }, g);
  }
  const [sx1, sy1] = pt(o.set ?? 6, 0.56), [sx2, sy2] = pt(o.set ?? 6, 0.96);
  H.el("line", { x1: sx1, y1: sy1, x2: sx2, y2: sy2, stroke: SC.blue, "stroke-width": f(Math.max(4, r * 0.1)) }, g);
  const needle = H.el("g", { id: `${p}-n` }, g);
  H.el("path", { d: `M ${f(cx - r * 0.16)} ${f(cy - r * 0.055)} L ${f(cx + r * 0.8)} ${cy} L ${f(cx - r * 0.16)} ${f(cy + r * 0.055)} Z`, fill: SC.ink }, needle);
  H.el("circle", { cx, cy, r: f(r * 0.09), fill: SC.ink }, g);
  const origin = `${cx} ${cy}`;
  gsap.set(needle, { rotation: ang(o.value ?? 0), svgOrigin: origin });
  return { g, needle, rot: ang, origin, pt };
};
// Needle from v0 to v1 over dur starting at t (first tween on this needle: immediateRender true).
SU.needle = (D, v0, v1, t, dur, first = false, ease = "power2.out") =>
  tl.fromTo(D.needle, { rotation: D.rot(v0), svgOrigin: D.origin }, { rotation: D.rot(v1), svgOrigin: D.origin, duration: dur, ease, immediateRender: first }, t);

// ---- filter clogging indicator ----------------------------------------------------------------------------
// Upper half dial: 0..10 = 180° → 360°; green band 0–5.5 (normal), red band 7–10 (clogged).
SU.indicator = (parent, p, cx, cy, r, o = {}) => {
  const g = H.el("g", { id: p }, parent), f = H.f;
  const ang = (v) => 180 + 18 * v;
  H.el("path", { d: `M ${f(cx - r)} ${f(cy + r * 0.18)} L ${f(cx - r)} ${cy} A ${r} ${r} 0 0 1 ${f(cx + r)} ${cy} L ${f(cx + r)} ${f(cy + r * 0.18)} Z`, fill: SC.paper, stroke: SC.ink, "stroke-width": f(Math.max(2.5, r * 0.07)), "stroke-linejoin": "round" }, g);
  H.el("path", { d: H.arcD(cx, cy, r * 0.72, ang(0.3), ang(5.5)), fill: "none", stroke: SC.green, "stroke-width": f(r * 0.26) }, g);
  H.el("path", { d: H.arcD(cx, cy, r * 0.72, ang(7), ang(9.7)), fill: "none", stroke: SC.red, "stroke-width": f(r * 0.26) }, g);
  const ptr = H.el("g", { id: `${p}-n` }, g);
  H.el("path", { d: `M ${f(cx - r * 0.1)} ${f(cy - r * 0.06)} L ${f(cx + r * 0.86)} ${cy} L ${f(cx - r * 0.1)} ${f(cy + r * 0.06)} Z`, fill: SC.ink }, ptr);
  H.el("circle", { cx, cy, r: f(r * 0.1), fill: SC.ink }, g);
  const origin = `${cx} ${cy}`;
  gsap.set(ptr, { rotation: ang(o.value ?? 0.3), svgOrigin: origin });
  return { g, needle: ptr, rot: ang, origin };
};

// ---- ear (listening) --------------------------------------------------------------------------------------
// Drawn facing right (the sound source on the right); flip = true faces left. Local size ≈ 70 × 96.
SU.ear = (parent, id, x, y, s = 1, flip = false) => {
  const outer = H.el("g", { id }, parent); // animate this one; the inner group carries the placement
  const g = H.el("g", { transform: `translate(${x} ${y}) scale(${flip ? -s : s} ${s})` }, outer);
  H.el("path", { d: "M 8 40 C -14 34 -24 14 -24 -8 C -24 -36 -2 -52 22 -52 C 46 -52 60 -34 60 -12 C 60 8 46 14 40 26 C 34 38 34 50 18 52 C 8 53 4 47 4 40 Z", fill: SC.skin, stroke: SC.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  H.el("path", { d: "M -2 -10 C -2 -28 12 -36 24 -34 C 38 -32 42 -20 38 -10 C 34 -2 26 0 26 12", fill: "none", stroke: SC.ink, "stroke-width": 5, "stroke-linecap": "round" }, g);
  return outer;
};

// ---- sound waves ------------------------------------------------------------------------------------------
// n arcs around (cx, cy) facing dir (degrees, screen coords). Returns { g, arcs }.
SU.waves = (parent, id, cx, cy, dir = 0, o = {}) => {
  const w = H.el("g", { id }, parent), arcs = [];
  const r0 = o.r0 ?? 18, dr = o.dr ?? 16, span = o.span ?? 38;
  for (let i = 0; i < (o.n ?? 3); i++) {
    const a = H.el("g", { opacity: 0 }, w);
    const d = H.arcD(cx, cy, r0 + i * dr, dir - span, dir + span);
    if (o.halo !== false) H.el("path", { d, fill: "none", stroke: "#ffffff", "stroke-width": (o.w ?? 5) + 6, "stroke-linecap": "round" }, a);
    H.el("path", { d, fill: "none", stroke: o.color || SC.ink, "stroke-width": o.w ?? 5, "stroke-linecap": "round" }, a);
    arcs.push(a);
  }
  return { g: w, arcs };
};
// Continuous sound: arcs pulse outward steadily from t0 to t1 (finite repeats); peak = max opacity.
SU.steady = (W, t0, t1, period = 0.6, peak = 1) => {
  const n = Math.max(1, Math.floor((t1 - t0) / period) - 1);
  W.arcs.forEach((a, i) =>
    tl.fromTo(a, { opacity: 0 }, { opacity: peak, duration: period / 2, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t0 + (i * period) / 3));
};
// Intermittent sound: short bursts (all arcs together) every `every` seconds from t0 to t1.
SU.bursts = (W, t0, t1, every = 1.1) => {
  for (let t = t0; t + 0.5 <= t1; t += every)
    W.arcs.forEach((a, i) => {
      tl.fromTo(a, { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, t + i * 0.06);
      tl.fromTo(a, { opacity: 1 }, { opacity: 0, duration: 0.18, immediateRender: false }, t + i * 0.06 + 0.32);
    });
};

// Small label chip (white box + text), starts hidden. o: { size, anchor, fill, stroke, color, w }
SU.chip = (parent, id, x, y, str, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const size = o.size || 23, w = o.w || str.length * size * 0.56 + 26, h = size + 16;
  const x0 = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  H.el("rect", { x: H.f(x0), y: H.f(y - h / 2), width: H.f(w), height: h, rx: 8, fill: o.fill || SC.paper, stroke: o.stroke || SC.ink, "stroke-width": 2.5 }, g);
  H.text(g, x0 + w / 2, y + size * 0.36, str, { size, anchor: "middle", fill: o.color || SC.ink });
  return g;
};
// Numbered badge (blue disc + white number), starts hidden.
SU.badge = (parent, id, x, y, n, r = 21) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  H.el("circle", { cx: x, cy: y, r, fill: SC.blue, stroke: "#ffffff", "stroke-width": 3 }, g);
  H.text(g, x, y + r * 0.43, String(n), { size: Math.round(r * 1.25), anchor: "middle", fill: "#ffffff" });
  return g;
};
// Pulsing ring on a spot (finite repeat), colour default blue.
SU.ring = (parent, id, cx, cy, r, t, n = 3, col = SC.blue) => {
  const c = H.el("circle", { id, cx, cy, r, fill: "none", stroke: col, "stroke-width": 6, opacity: 0 }, parent);
  tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t);
  tl.fromTo(c, { scale: 1, svgOrigin: `${cx} ${cy}` }, { scale: 1.16, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t + 0.1);
  return c;
};

// ---- the hydraulic power unit -----------------------------------------------------------------------------
// o.labels: subset of ["tank","gauge","breather","strainer","suction","return","level","circuit","filter","pump","motor"]
// o.lpos: { key: [x, y, anchor, text] } overrides; o.transform: placement of the whole drawing.
H.suStation = (parent, p, o = {}) => {
  const lab = o.labels ?? ["tank", "gauge", "filter", "level", "circuit", "pump", "motor"];
  const has = (k) => lab.includes(k);
  const g = H.el("g", { id: p, ...(o.transform ? { transform: o.transform } : {}) }, parent);
  const rect = (x, y, w, h, fill, a = {}, par = g) =>
    H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 6, fill, stroke: SC.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, par);
  const T = (x, y, s, a = {}) => H.text(a.par || g, x, y, s, { size: a.size || 23, anchor: a.anchor || "middle", fill: a.fill || SC.ink });
  const pipe = (d, w, col, id) => H.el("path", { ...(id ? { id } : {}), d, fill: "none", stroke: col, "stroke-width": w, "stroke-linejoin": "round" }, g);
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", "stroke-linecap": "butt", opacity: 0 }, g);
  const lp = (k, x, y, s, anchor, size = 22) => {
    const q = (o.lpos || {})[k] || [];
    T(q[0] ?? x, q[1] ?? y, q[3] ?? s, { size, anchor: q[2] ?? anchor });
  };
  const S = { g };

  // tank (cut open): air space, oil, baffle plate, strainer on the end of the suction tube
  H.el("rect", { x: 40, y: 404, width: 740, height: 211, fill: SC.air, stroke: SC.ink, "stroke-width": 5 }, g);
  S.oil = H.el("rect", { id: `${p}-oil`, x: 43, y: SL.lvl, width: 734, height: SL.oilBot - SL.lvl, fill: SC.oil }, g);
  S.surf = H.el("line", { id: `${p}-surf`, x1: 43, y1: SL.lvl, x2: 777, y2: SL.lvl, stroke: "#c9971b", "stroke-width": 3 }, g);
  rect(470, 470, 10, 142, SC.metal, { sw: 3, rx: 1 });
  rect(180, 540, 60, 60, "#ebe6da", { rx: 8 });
  const mesh = [];
  for (let x = 188; x < 240; x += 8) mesh.push(`M ${x} 544 L ${x} 596`);
  for (let y = 548; y < 600; y += 8) mesh.push(`M 184 ${y} L 236 ${y}`);
  H.el("path", { d: mesh.join(" "), fill: "none", stroke: SC.ink, "stroke-width": 1.6, opacity: 0.55 }, g);
  S.clog = rect(180, 540, 60, 60, SC.dirt, { sw: 0, rx: 8, attr: { id: `${p}-clog`, opacity: 0 } });

  // lid, then the pipes (drawn over the lid where they pass through it)
  rect(28, 392, 764, 12, SC.metal, { rx: 3 });
  S.suc = pipe("M 210 540 L 210 352", 12, SC.blue, `${p}-suc`);
  S.ret = pipe("M 1010 250 L 1010 342 L 690 342 L 690 500", 8, SC.muted, `${p}-ret`);
  S.dis = pipe("M 235 272 L 235 215 L 880 215", 11, SC.blue, `${p}-dis`);
  pipe("M 420 215 L 420 176", 7, SC.blue);
  S.flowEls = [
    flow(`${p}-f1`, "M 210 540 L 210 352"),
    flow(`${p}-f2`, "M 235 272 L 235 215 L 880 215"),
    flow(`${p}-f3`, "M 1010 250 L 1010 342 L 690 342 L 690 500"),
  ];
  // suction-tube joint (screwed flange with packing)
  rect(192, 366, 36, 6, SC.metal, { sw: 2, rx: 1 });
  rect(192, 374, 36, 6, SC.metal, { sw: 2, rx: 1 });

  // inline return filter + clogging indicator on its head
  rect(818, 324, 104, 36, SC.dark, { rx: 12 });
  rect(808, 330, 12, 24, SC.metal, { sw: 3, rx: 2 });
  rect(920, 330, 12, 24, SC.metal, { sw: 3, rx: 2 });
  rect(858, 306, 24, 18, SC.metal, { sw: 3, rx: 2 });
  S.ind = SU.indicator(g, `${p}-ind`, 870, 300, 22, { value: 1.5 });
  if (has("filter")) lp("filter", 870, 394, "ฟิลเตอร์ (Filter)", "middle");

  // pump (group, may shake) + foot, shaft + shaft seal, coupling, motor
  rect(250, 352, 30, 40, SC.metal, { sw: 3, rx: 2 });
  S.pump = H.el("g", { id: `${p}-pump` }, g);
  rect(180, 272, 110, 80, SC.dark, { rx: 10 }, S.pump);
  if (has("pump")) T(235, 321, "ปั๊ม", { size: 28, par: S.pump });
  rect(286, 306, 50, 12, SC.dark, { sw: 2, rx: 2 });
  rect(286, 300, 8, 24, SC.ink, { sw: 0, rx: 2 });
  S.cpl = H.el("g", { id: `${p}-cpl` }, g);
  rect(294, 292, 17, 40, SC.metal, { sw: 3, rx: 3 }, S.cpl);
  rect(313, 292, 17, 40, SC.metal, { sw: 3, rx: 3 }, S.cpl);
  // coupling bolt marks: slide over the coupling face while it turns (side view of a rotating part)
  const cc = H.el("clipPath", { id: `${p}-cclip` }, g);
  H.el("rect", { x: 294, y: 294, width: 36, height: 36 }, cc);
  const cg = H.el("g", { "clip-path": `url(#${p}-cclip)` }, S.cpl);
  S.bolts = H.el("g", { id: `${p}-cb` }, cg);
  H.el("path", { d: [280, 304, 328, 352].map((y) => `M 298 ${y} L 307 ${y} M 317 ${y} L 326 ${y}`).join(" "), fill: "none", stroke: SC.ink, "stroke-width": 3 }, S.bolts);
  rect(330, 262, 210, 96, SC.metal, { rx: 10 });
  const fins = [];
  for (let x = 346; x <= 526; x += 15) fins.push(`M ${x} 268 L ${x} 352`);
  H.el("path", { d: fins.join(" "), fill: "none", stroke: SC.ink, "stroke-width": 2, opacity: 0.4 }, g);
  rect(540, 278, 18, 64, SC.dark, { sw: 3, rx: 4 });
  rect(350, 358, 30, 34, SC.metal, { sw: 3, rx: 2 });
  rect(490, 358, 30, 34, SC.metal, { sw: 3, rx: 2 });
  if (has("motor")) { rect(383, 291, 104, 38, SC.paper, { sw: 2, rx: 6 }); T(435, 318, "มอเตอร์", { size: 24 }); }

  // pressure gauge on the discharge line + circuit box
  S.gauge = SU.dial(g, `${p}-g`, 420, 128, 50, { set: 6, value: 0 });
  rect(880, 110, 200, 140, SC.paper, { rx: 14 });
  if (has("circuit")) { T(980, 172, "ไปวงจร", { size: 28 }); T(980, 208, "(วาล์ว · กระบอกสูบ)", { size: 21 }); }

  // oil-level glass on the tank wall (H / L marks), air breather on the lid
  rect(780, 428, 10, 6, SC.metal, { sw: 2, rx: 1 });
  rect(780, 588, 10, 6, SC.metal, { sw: 2, rx: 1 });
  rect(790, 420, 24, 180, SC.paper, { sw: 3, rx: 6 });
  S.glass = rect(794, SL.lvl, 16, SL.glassBot - SL.lvl, SC.oil, { sw: 0, rx: 2, attr: { id: `${p}-glass` } });
  H.el("path", { d: "M 786 440 L 818 440 M 786 480 L 818 480", fill: "none", stroke: SC.ink, "stroke-width": 3 }, g);
  T(824, 447, "H", { size: 20, anchor: "start" });
  T(824, 487, "L", { size: 20, anchor: "start" });
  rect(104, 372, 12, 20, SC.dark, { sw: 2, rx: 1 });
  rect(84, 344, 52, 30, SC.metal, { rx: 10 });
  H.el("path", { d: "M 94 352 L 126 352 M 94 359 L 126 359 M 94 366 L 126 366", fill: "none", stroke: SC.ink, "stroke-width": 2.5 }, g);

  // labels
  if (has("tank")) lp("tank", 625, 596, "ถังน้ำมัน (Oil tank)", "middle", 24);
  if (has("gauge")) lp("gauge", 358, 122, "เกจวัดแรงดัน", "end", 23);
  if (has("breather")) lp("breather", 110, 334, "Air breather", "middle");
  if (has("strainer")) lp("strainer", 172, 578, "Strainer", "end");
  if (has("suction")) lp("suction", 224, 494, "ท่อดูด (Suction)", "start");
  if (has("return")) T(704, 377, "ท่อกลับ (Return)", { size: 22, anchor: "start" });
  if (has("level")) lp("level", 824, 560, "ระดับน้ำมัน", "start", 21);

  S.spot = { pump: [235, 312], seal: [210, 373], strainer: [210, 570], breather: [110, 359], glass: [802, 470],
    coupling: [312, 312], motor: [435, 310], gauge: [420, 128], filter: [870, 342], ind: [870, 300] };
  return S;
};
// Coupling turning (side view): the bolt marks slide up and wrap around (seekable).
SU.cplTurn = (S, tA, tB, speed = 60) => H.fnTo(S.bolts, "y", (t) => -(((t - tA) * speed) % 24), tA, tB);
// Oil level → y (tank, surface line and level glass together)
SU.level = (S, y, t, dur = 0.9) => {
  const e = { duration: dur, ease: "power1.inOut" };
  tl.to(S.oil, { attr: { y, height: SL.oilBot - y }, ...e }, t);
  tl.to(S.surf, { attr: { y1: y, y2: y }, ...e }, t);
  tl.to(S.glass, { attr: { y, height: SL.glassBot - y }, ...e }, t);
};
// Pump body shakes (x jitter) between t0 and t1
SU.shake = (el, t0, t1, amp = 2.2) => H.fnTo(el, "x", (t) => amp * H.env(t, t0, t1, 0.25) * H.wob(t * 1.9, 0.7), t0, t1);

// ---- small pump unit for the "why" cards (viewBox 0 0 760 240) --------------------------------------------
// tank with oil, strainer, suction pipe, pump (turning rotor) + motor, discharge pipe. Returns handles.
SU.mini = (parent, p, o = {}) => {
  const g = H.el("g", { id: p }, parent), S = { g };
  const R = (x, y, w, h, fill, a = {}) => H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 6, fill, stroke: SC.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, a.par || g);
  R(24, 142, 440, 86, SC.air, { rx: 4 });
  S.oil = R(27, 160, 434, 65, o.oil || SC.oil, { sw: 0, rx: 2 });
  R(16, 134, 456, 10, SC.metal, { rx: 3 });
  R(136, 186, 48, 34, "#ebe6da", { rx: 6 });
  H.el("path", { d: "M 146 190 L 146 216 M 156 190 L 156 216 M 166 190 L 166 216 M 176 190 L 176 216 M 140 198 L 180 198 M 140 208 L 180 208", fill: "none", stroke: SC.ink, "stroke-width": 1.5, opacity: 0.5 }, g);
  const suc = "M 160 186 L 160 104", dis = "M 160 40 L 160 22 L 560 22";
  H.el("path", { d: suc, fill: "none", stroke: SC.blue, "stroke-width": 11 }, g);
  H.el("path", { d: dis, fill: "none", stroke: SC.blue, "stroke-width": 10, "stroke-linejoin": "round" }, g);
  S.flowEls = [suc, dis].map((d, i) => H.el("path", { id: `${p}-f${i}`, d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", opacity: 0 }, g));
  S.pump = H.el("g", { id: `${p}-pump` }, g);
  H.el("circle", { cx: 160, cy: 72, r: 36, fill: SC.dark, stroke: SC.ink, "stroke-width": 4 }, S.pump);
  S.rotor = H.el("g", { id: `${p}-rot` }, S.pump);
  H.el("circle", { cx: 160, cy: 72, r: 20, fill: SC.paper, stroke: SC.ink, "stroke-width": 3 }, S.rotor);
  H.el("path", { d: "M 142 72 L 178 72 M 160 54 L 160 90", fill: "none", stroke: SC.ink, "stroke-width": 3 }, S.rotor);
  R(198, 64, 18, 16, SC.ink, { sw: 0, rx: 2 });
  R(214, 40, 150, 64, SC.metal, { rx: 10 });
  const fins = [];
  for (let x = 228; x <= 350; x += 14) fins.push(`M ${x} 46 L ${x} 98`);
  H.el("path", { d: fins.join(" "), fill: "none", stroke: SC.ink, "stroke-width": 2, opacity: 0.4 }, g);
  R(222, 104, 22, 30, SC.metal, { sw: 3, rx: 2 });
  R(334, 104, 22, 30, SC.metal, { sw: 3, rx: 2 });
  S.origin = "160 72";
  return S;
};
// Thermometer (vertical) with a liquid column; returns the column for tweening.
SU.thermo = (parent, p, x, y0, y1, frac, col = SC.blue) => {
  const g = H.el("g", { id: p }, parent), f = H.f;
  H.el("rect", { x: x - 13, y: y0, width: 26, height: y1 - y0, rx: 13, fill: SC.paper, stroke: SC.ink, "stroke-width": 4 }, g);
  H.el("circle", { cx: x, cy: y1 + 10, r: 22, fill: col, stroke: SC.ink, "stroke-width": 4 }, g);
  const top = y1 - (y1 - y0 - 12) * frac;
  const col_ = H.el("rect", { x: x - 6, y: f(top), width: 12, height: f(y1 + 6 - top), fill: col }, g);
  for (let k = 1; k <= 4; k++) H.el("line", { x1: x + 13, y1: f(y0 + ((y1 - y0) * k) / 5), x2: x + 24, y2: f(y0 + ((y1 - y0) * k) / 5), stroke: SC.ink, "stroke-width": 3 }, g);
  return { g, col: col_ };
};

// Pump icon for the judgment cards: pump disc + coupling + motor (local size ≈ 150 × 80, origin = pump centre)
SU.pumpIcon = (parent, p, cx, cy) => {
  const g = H.el("g", { id: p }, parent);
  H.el("rect", { x: cx + 34, y: cy - 24, width: 92, height: 48, rx: 8, fill: SC.metal, stroke: SC.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: cx + 26, y: cy - 6, width: 10, height: 12, fill: SC.ink }, g);
  H.el("circle", { cx, cy, r: 30, fill: SC.dark, stroke: SC.ink, "stroke-width": 4 }, g);
  const rot = H.el("g", { id: `${p}-rot` }, g);
  H.el("circle", { cx, cy, r: 15, fill: SC.paper, stroke: SC.ink, "stroke-width": 3 }, rot);
  H.el("path", { d: `M ${cx - 13} ${cy} L ${cx + 13} ${cy} M ${cx} ${cy - 13} L ${cx} ${cy + 13}`, fill: "none", stroke: SC.ink, "stroke-width": 3 }, rot);
  return { g, rot, origin: `${cx} ${cy}` };
};
