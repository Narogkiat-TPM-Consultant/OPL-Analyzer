// EP10 — Hydraulic pump malfunction (OPL 5-B-2): noise / vibrating pressure / lack of pressure.
// H.pumpStation: a hydraulic power unit seen from the side with the tank cut open — motor + coupling + pump on the
//   tank lid, suction tube + strainer, return tube, baffle plate, air breather, oil-level glass, pressure gauge.
//   Used by the title (s1), the phenomenon (s2) and the cause map (s4). Coordinates: 1100 × 640.
// H.vanePump / H.vpSpin: vane-pump cross-section copied from EP04 (cam-ring hatch drawn as lines), used by s3.
const PC = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", blue: "#1f5fbf", oil: "#f2c94c",
  oilBg: "#fbe7a1", paper: "#fffdf8", red: "#d0233a", air: "#fffaf0", dirt: "#4b3d24", warn: "#f2a900", green: "#178a4e",
};
// tank geometry shared by the drawing and the level tween
const PS = { lvl: 445, low: 515, oilBot: 612, glassBot: 596 };

// Tween any numeric property along a pure function of time fn(t) (t = absolute seconds) between tA and tB.
// Every frame is a function of time only, so the timeline stays seekable. `o.attr` = tween an SVG attribute;
// `o.extra` = constant props for both ends (e.g. svgOrigin); `o.ir` = immediateRender.
H.fnTo = (el, prop, fn, tA, tB, o = {}) => {
  const d = Math.max(0.001, tB - tA), v0 = fn(tA);
  const wrap = (v) => (o.attr ? { attr: { [prop]: v } } : { [prop]: v });
  tl.fromTo(el, { ...wrap(v0), ...(o.extra || {}) }, { ...wrap(v0 + 1), ...(o.extra || {}), duration: d, ease: (q) => fn(tA + q * d) - v0, immediateRender: o.ir ?? false }, tA);
};
// 0 → 1 → 0 envelope with ramps of r seconds at both ends of [t0, t1]
H.env = (t, t0, t1, r = 0.3) => Math.max(0, Math.min(1, (t - t0) / r, (t1 - t) / r));
// deterministic jitter in [-1, 1]
H.wob = (t, k = 0) => 0.6 * Math.sin(2 * Math.PI * 5.3 * t + k) + 0.4 * Math.sin(2 * Math.PI * 8.7 * t + 1.3 + k);

H.pumpStation = (parent, p, o = {}) => {
  const lab = o.labels ?? ["tank", "gauge", "breather", "strainer", "suction", "return", "level", "circuit"];
  const has = (k) => lab.includes(k);
  const g = H.el("g", { id: p, ...(o.transform ? { transform: o.transform } : {}) }, parent);
  const rect = (x, y, w, h, fill, a = {}, par = g) =>
    H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 6, fill, stroke: PC.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, par);
  const T = (x, y, s, a = {}) => H.text(a.par || g, x, y, s, { size: a.size || 23, anchor: a.anchor || "middle", fill: a.fill || PC.ink });
  const pipe = (d, w, col, id) => H.el("path", { ...(id ? { id } : {}), d, fill: "none", stroke: col, "stroke-width": w, "stroke-linejoin": "round" }, g);
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", "stroke-linecap": "butt", opacity: 0 }, g);
  const S = { g };

  // tank (cut open): air space, oil, baffle plate, strainer on the end of the suction tube
  H.el("rect", { x: 40, y: 404, width: 740, height: 211, fill: PC.air, stroke: PC.ink, "stroke-width": 5 }, g);
  S.oil = H.el("rect", { id: `${p}-oil`, x: 43, y: PS.lvl, width: 734, height: PS.oilBot - PS.lvl, fill: PC.oil }, g);
  S.surf = H.el("line", { id: `${p}-surf`, x1: 43, y1: PS.lvl, x2: 777, y2: PS.lvl, stroke: "#c9971b", "stroke-width": 3 }, g);
  rect(470, 470, 10, 142, PC.metal, { sw: 3, rx: 1 });
  rect(180, 540, 60, 60, "#ebe6da", { rx: 8 });
  const mesh = [];
  for (let x = 188; x < 240; x += 8) mesh.push(`M ${x} 544 L ${x} 596`);
  for (let y = 548; y < 600; y += 8) mesh.push(`M 184 ${y} L 236 ${y}`);
  H.el("path", { d: mesh.join(" "), fill: "none", stroke: PC.ink, "stroke-width": 1.6, opacity: 0.55 }, g);
  S.clog = rect(180, 540, 60, 60, PC.dirt, { sw: 0, rx: 8, attr: { id: `${p}-clog`, opacity: 0 } });

  // lid, then the pipes (drawn over the lid where they pass through it)
  rect(28, 392, 764, 12, PC.metal, { rx: 3 });
  pipe("M 210 540 L 210 352", 12, PC.blue, `${p}-suc`);
  pipe("M 1000 300 L 1000 342 L 690 342 L 690 500", 8, PC.muted, `${p}-ret`);
  pipe("M 235 272 L 235 215 L 860 215", 11, PC.blue, `${p}-dis`);
  pipe("M 420 215 L 420 176", 7, PC.blue);
  S.flows = [
    flow(`${p}-f1`, "M 210 540 L 210 352"),
    flow(`${p}-f2`, "M 235 272 L 235 215 L 860 215"),
    flow(`${p}-f3`, "M 1000 300 L 1000 342 L 690 342 L 690 500"),
  ].map((n) => n.id);
  // suction-tube joint (screwed flange with packing)
  rect(192, 366, 36, 6, PC.metal, { sw: 2, rx: 1 });
  rect(192, 374, 36, 6, PC.metal, { sw: 2, rx: 1 });

  // pump (group, may shake) + foot, shaft + shaft seal, coupling, motor
  rect(250, 352, 30, 40, PC.metal, { sw: 3, rx: 2 });
  S.pump = H.el("g", { id: `${p}-pump` }, g);
  rect(180, 272, 110, 80, PC.dark, { rx: 10 }, S.pump);
  T(235, 321, "ปั๊ม", { size: 28, par: S.pump });
  rect(286, 306, 50, 12, PC.dark, { sw: 2, rx: 2 });
  rect(286, 300, 8, 24, PC.ink, { sw: 0, rx: 2 });
  S.cpl = H.el("g", { id: `${p}-cpl` }, g);
  rect(294, 292, 17, 40, PC.metal, { sw: 3, rx: 3 }, S.cpl);
  rect(313, 292, 17, 40, PC.metal, { sw: 3, rx: 3 }, S.cpl);
  H.el("path", { d: "M 298 300 L 307 300 M 317 300 L 326 300 M 298 324 L 307 324 M 317 324 L 326 324", fill: "none", stroke: PC.ink, "stroke-width": 3 }, S.cpl);
  rect(330, 262, 210, 96, PC.metal, { rx: 10 });
  const fins = [];
  for (let x = 346; x <= 526; x += 15) fins.push(`M ${x} 268 L ${x} 352`);
  H.el("path", { d: fins.join(" "), fill: "none", stroke: PC.ink, "stroke-width": 2, opacity: 0.4 }, g);
  rect(540, 278, 18, 64, PC.dark, { sw: 3, rx: 4 });
  rect(350, 358, 30, 34, PC.metal, { sw: 3, rx: 2 });
  rect(490, 358, 30, 34, PC.metal, { sw: 3, rx: 2 });
  rect(383, 291, 104, 38, PC.paper, { sw: 2, rx: 6 });
  T(435, 318, "มอเตอร์", { size: 24 });

  // pressure gauge on the discharge line (no scale numbers: the deck gives no value) + circuit box
  S.gauge = H.gauge(g, 420, 128, 50, { id: `${p}-g`, min: 0, max: 10, ok: [5, 7.5], ticks: 5, minor: 1, labelEvery: 99, value: 6.2 });
  rect(860, 140, 200, 160, PC.paper, { rx: 14 });
  if (has("circuit")) { T(960, 208, "ไปวงจร", { size: 28 }); T(960, 244, "(วาล์ว · กระบอกสูบ)", { size: 21 }); }

  // oil-level glass on the tank wall (H / L marks), air breather on the lid
  rect(780, 428, 10, 6, PC.metal, { sw: 2, rx: 1 });
  rect(780, 588, 10, 6, PC.metal, { sw: 2, rx: 1 });
  rect(790, 420, 24, 180, PC.paper, { sw: 3, rx: 6 });
  S.glass = rect(794, PS.lvl, 16, PS.glassBot - PS.lvl, PC.oil, { sw: 0, rx: 2, attr: { id: `${p}-glass` } });
  H.el("path", { d: "M 786 440 L 818 440 M 786 480 L 818 480", fill: "none", stroke: PC.ink, "stroke-width": 3 }, g);
  T(824, 447, "H", { size: 20, anchor: "start" });
  T(824, 487, "L", { size: 20, anchor: "start" });
  rect(104, 372, 12, 20, PC.dark, { sw: 2, rx: 1 });
  rect(84, 344, 52, 30, PC.metal, { rx: 10 });
  H.el("path", { d: "M 94 352 L 126 352 M 94 359 L 126 359 M 94 366 L 126 366", fill: "none", stroke: PC.ink, "stroke-width": 2.5 }, g);
  S.bclog = rect(84, 344, 52, 30, PC.dirt, { sw: 0, rx: 10, attr: { id: `${p}-bclog`, opacity: 0 } });

  // labels
  if (has("tank")) T(625, 596, "ถังน้ำมัน (Oil tank)", { size: 24 });
  if (has("gauge")) T(362, 122, "เกจวัดแรงดัน", { size: 23, anchor: "end" });
  if (has("breather")) T(110, 334, "Air breather", { size: 22 });
  if (has("strainer")) T(172, 578, "Strainer", { size: 22, anchor: "end" });
  if (has("suction")) T(224, 494, "ท่อดูด (Suction)", { size: 22, anchor: "start" });
  if (has("return")) T(704, 377, "ท่อกลับ (Return)", { size: 22, anchor: "start" });
  if (has("level")) T(824, 560, "ระดับน้ำมัน", { size: 21, anchor: "start" });

  // noise waves: three arcs on the upper left of the pump (start hidden)
  S.noise = [80, 102, 124].map((r, i) => {
    const a = H.el("g", { id: `${p}-n${i}`, opacity: 0 }, g);
    for (const [col, w] of [["#ffffff", 11], [PC.ink, 5]])
      H.el("path", { d: H.arcD(235, 312, r, 200, 250), fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" }, a);
    return a;
  });
  S.spot = { pump: [235, 312], seal: [210, 373], strainer: [210, 570], breather: [110, 359], outlet: [690, 500],
    glass: [802, 470], coupling: [312, 312], shaftSeal: [290, 312], motor: [435, 310], gauge: [420, 128] };
  return S;
};

// Oil level → y (tank, surface line and level glass together)
H.psLevel = (S, y, t, dur = 0.9) => {
  const e = { duration: dur, ease: "power1.inOut" };
  tl.to(S.oil, { attr: { y, height: PS.oilBot - y }, ...e }, t);
  tl.to(S.surf, { attr: { y1: y, y2: y }, ...e }, t);
  tl.to(S.glass, { attr: { y, height: PS.glassBot - y }, ...e }, t);
};
// Noise arcs flash outward from t for about `dur` seconds (finite repeat)
H.psNoise = (arcs, t, dur) => {
  const n = Math.max(1, Math.round(dur / 0.5));
  tl.fromTo(arcs, { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.1, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t);
};
// Gauge needle: value(t) on the gauge scale (e.g. drifting low + shaking) between t0 and t1
H.psNeedle = (G, valueFn, t0, t1) => H.fnTo(G.needle, "rotation", (t) => G.rot(valueFn(t)), t0, t1, { extra: { svgOrigin: G.origin } });
// Pump body shakes (x jitter) between t0 and t1
H.psShake = (el, t0, t1, amp = 2.2) => H.fnTo(el, "x", (t) => amp * H.env(t, t0, t1, 0.25) * H.wob(t * 1.9, 0.7), t0, t1);
// Pulsing red ring on a spot (finite repeat)
H.ring = (parent, id, cx, cy, r, t, n = 4) => {
  const c = H.el("circle", { id, cx, cy, r, fill: "none", stroke: PC.red, "stroke-width": 6, opacity: 0 }, parent);
  tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t);
  tl.fromTo(c, { scale: 1, svgOrigin: `${cx} ${cy}` }, { scale: 1.18, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t + 0.1);
  return c;
};
// Small label chip (white box + text) — returns the group (start hidden)
H.chip = (parent, id, x, y, str, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const size = o.size || 23, w = o.w || str.length * size * 0.56 + 26, h = size + 16;
  const x0 = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  H.el("rect", { x: H.f(x0), y: H.f(y - h / 2), width: H.f(w), height: h, rx: 8, fill: o.fill || PC.paper, stroke: o.stroke || PC.ink, "stroke-width": 2.5 }, g);
  H.text(g, x0 + w / 2, y + size * 0.36, str, { size, anchor: "middle", fill: o.color || PC.ink });
  return g;
};

// ---------------------------------------------------------------------------------------------------------------
// Vane pump cross-section (from EP04). Local units: cam-ring centre O = (0, 0); rotor centre O' = (-e, 0);
// rotation counter-clockwise, intake at the local bottom, discharge at the local top.
const VP = { R: 180, band: 22, Rc: 228, e: 32, rr: 145, N: 8, vw: 18, vl: 96, slot0: 42, shaft: 30, port: 64, wall: 20, out: 60 };
VP.tip = (deg) => {
  const t = (deg * Math.PI) / 180, e = VP.e, R = VP.R;
  return e * Math.cos(t) + Math.sqrt(R * R - e * e * Math.sin(t) ** 2);
};
// distance from the ring centre to the rotor surface in local direction th (degrees)
VP.dRotor = (th) => {
  const t = (th * Math.PI) / 180;
  return -VP.e * Math.cos(t) + Math.sqrt(VP.rr * VP.rr - VP.e * VP.e * Math.sin(t) ** 2);
};
// o = { x, y, s, rot } places, scales and rotates the pump. Returns { g, rot, vanes, alpha, origin, flowIn, flowOut, headIn, headOut }.
H.vanePump = (parent, p, o = {}) => {
  const { R, band, Rc, e, rr, N, vw, vl, slot0, shaft, port, wall, out } = VP;
  const g = H.el("g", { id: p, transform: `translate(${o.x || 0} ${o.y || 0}) rotate(${o.rot || 0}) scale(${o.s || 1})` }, parent);
  const defs = H.el("defs", {}, g);
  const cp = H.el("clipPath", { id: `${p}-clip` }, defs);
  H.el("circle", { cx: 0, cy: 0, r: R }, cp);
  const ann = (r1, r2) => `M ${r2} 0 A ${r2} ${r2} 0 1 1 ${-r2} 0 A ${r2} ${r2} 0 1 1 ${r2} 0 Z M ${r1} 0 A ${r1} ${r1} 0 1 0 ${-r1} 0 A ${r1} ${r1} 0 1 0 ${r1} 0 Z`;
  const cpr = H.el("clipPath", { id: `${p}-rclip` }, defs);
  H.el("path", { d: ann(R, R + band), "clip-rule": "evenodd" }, cpr);

  const yEnd = Rc + out, bw = port + 2 * wall;
  const body = [["circle", { cx: 0, cy: 0, r: Rc }], ["rect", { x: -bw / 2, y: -yEnd, width: bw, height: 2 * yEnd, rx: 4 }]];
  for (const [t, a] of body) H.el(t, { ...a, fill: "none", stroke: PC.ink, "stroke-width": 8 }, g);
  for (const [t, a] of body) H.el(t, { ...a, fill: PC.metal }, g);
  const chan = (y0, y1) => {
    H.el("rect", { x: -port / 2, y: Math.min(y0, y1), width: port, height: Math.abs(y1 - y0), fill: PC.oilBg }, g);
    for (const sx of [-1, 1]) H.el("line", { x1: (sx * port) / 2, y1: y0, x2: (sx * port) / 2, y2: y1, stroke: PC.ink, "stroke-width": 3 }, g);
  };
  chan(-yEnd - 4, -R); chan(R, yEnd + 4);

  const inner = H.el("g", { "clip-path": `url(#${p}-clip)` }, g);
  H.el("circle", { cx: 0, cy: 0, r: R, fill: PC.oilBg }, inner);
  const rot = H.el("g", { id: `${p}-rot` }, inner);
  H.el("circle", { cx: -e, cy: 0, r: rr, fill: "#e4dfd2", stroke: PC.ink, "stroke-width": 4 }, rot);
  const vanes = [], alpha = [], a1 = 360 / N;
  for (let k = 0; k < N; k++) {
    const a = a1 * k;
    alpha.push(a);
    const sg = H.el("g", { transform: `rotate(${a} ${-e} 0)` }, rot);
    const sh = vw / 2 + 3;
    H.el("path", { d: `M ${-e + rr} ${-sh} L ${-e + slot0} ${-sh} L ${-e + slot0} ${sh} L ${-e + rr} ${sh}`, fill: PC.oilBg, stroke: PC.ink, "stroke-width": 2.5 }, sg);
    vanes.push(H.el("rect", { id: `${p}-v${k}`, x: -e + rr - vl, y: -vw / 2, width: vl, height: vw, fill: "#59606a", stroke: PC.ink, "stroke-width": 2 }, sg));
  }
  H.el("circle", { cx: -e, cy: 0, r: shaft, fill: PC.dark, stroke: PC.ink, "stroke-width": 4 }, rot);
  H.el("rect", { x: -e - 7, y: -shaft - 1, width: 14, height: 15, fill: PC.ink }, rot);

  // cam ring: paper band with explicit 45° hatch lines (a <pattern> fill does not render in the video capture)
  H.el("path", { d: ann(R, R + band), fill: PC.paper, "fill-rule": "evenodd" }, g);
  const hg = H.el("g", { "clip-path": `url(#${p}-rclip)` }, g), hl = [], L = R + band + 4;
  for (let c = -2 * L; c <= 2 * L; c += 13) hl.push(`M ${H.f(c - L)} ${H.f(L)} L ${H.f(c + L)} ${H.f(-L)}`);
  H.el("path", { d: hl.join(" "), fill: "none", stroke: PC.ink, "stroke-width": 2.6 }, hg);
  H.el("path", { d: ann(R, R + band), fill: "none", "fill-rule": "evenodd", stroke: PC.ink, "stroke-width": 4 }, g);
  return { g, rot, vanes, alpha, origin: `${-e} 0` };
};
// Turn the rotor from tA to tB; rotFn(t) = rotor angle in degrees at absolute time t (negative = CCW).
H.vpSpin = (P, tA, tB, rotFn) => {
  const dur = tB - tA, r0 = rotFn(tA);
  tl.fromTo(P.rot, { rotation: r0, svgOrigin: P.origin }, { rotation: r0 + 1, svgOrigin: P.origin, duration: dur, ease: (q) => rotFn(tA + q * dur) - r0 }, tA);
  P.vanes.forEach((v, k) => {
    const xAt = (t) => VP.tip(P.alpha[k] + rotFn(t)) - VP.rr;
    const x0 = xAt(tA);
    tl.fromTo(v, { x: x0 }, { x: x0 + 1, duration: dur, ease: (q) => xAt(tA + q * dur) - x0 }, tA);
  });
};
