// EP15 — Daily checking of hydraulic device (2): check items while the machine is running (OPL 5-C-3, PDF p.19).
// Shared drawings (viewBox units):
//   H.runUnit(parent, p, o) — a running hydraulic unit, 1100 × 640: tank cut open (oil, baffle, strainer), pump +
//     coupling + motor on the lid, pressure gauge on the discharge line, solenoid valve, cylinder + rod + load.
//     Tank / pump / motor / gauge geometry copied from EP10's H.pumpStation (ep10/lib.js); valve + cylinder are new.
//   H.hand15  — operator's hand seen from the back, fingers down; fingertips at the given point.
//   H.ear15   — ear icon (sound check).
//   H.dial15  — half dial with the green ±3 band around the normal reading (judgment cards).
//   H.fnTo / H.env / H.wob — seek-safe "value = f(time)" tweens (copied from EP10).
const C15 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", blue: "#1f5fbf", oil: "#f2c94c",
  oilBg: "#fbe7a1", paper: "#fffdf8", red: "#d0233a", air: "#fffaf0", green: "#178a4e", warn: "#f2a900",
  tube: "#dfe8f6", skin: "#f1c7a1", sleeve: "#59606a", heat: "#e8771e",
};
// One scale for every gauge in this episode: 0–30 units, normal reading N = 15, OPL band ±3 kgf/cm².
// No numbers are printed on the dials: the OPL gives the band, not a working pressure.
const G15 = { min: 0, max: 30, N: 15, band: 3 };

// Tween a numeric property along fn(t) (t = absolute seconds) between tA and tB — every frame is a function of
// time only, so the timeline stays seekable. o.attr = SVG attribute; o.extra = constant props (svgOrigin);
// o.ir = immediateRender.
H.fnTo = (el, prop, fn, tA, tB, o = {}) => {
  const d = Math.max(0.001, tB - tA), v0 = fn(tA);
  const wrap = (v) => (o.attr ? { attr: { [prop]: v } } : { [prop]: v });
  tl.fromTo(el, { ...wrap(v0), ...(o.extra || {}) }, { ...wrap(v0 + 1), ...(o.extra || {}), duration: d, ease: (q) => fn(tA + q * d) - v0, immediateRender: o.ir ?? false }, tA);
};
// 0 → 1 → 0 envelope with ramps of r seconds at both ends of [t0, t1]
H.env = (t, t0, t1, r = 0.3) => Math.max(0, Math.min(1, (t - t0) / r, (t1 - t) / r));
// deterministic jitter in [-1, 1]
H.wob = (t, k = 0) => 0.6 * Math.sin(2 * Math.PI * 5.3 * t + k) + 0.4 * Math.sin(2 * Math.PI * 8.7 * t + 1.3 + k);
// cylinder cycle 0 → 1 → 0 over one period (out 40 %, hold 10 %, back 40 %, hold 10 %)
H.cyc15 = (ph) => {
  const u = ((ph % 1) + 1) % 1, s = (x) => x * x * (3 - 2 * x);
  if (u < 0.4) return s(u / 0.4);
  if (u < 0.5) return 1;
  if (u < 0.9) return 1 - s((u - 0.5) / 0.4);
  return 0;
};
const clamp01 = (x) => Math.max(0, Math.min(1, x));
// H.gauge without any printed numbers (H.gauge always labels the first major tick "0"; the OPL gives no scale).
H.gauge15 = (parent, cx, cy, r, o = {}) => {
  const G = H.gauge(parent, cx, cy, r, { min: G15.min, max: G15.max, ok: [G15.N - G15.band, G15.N + G15.band], ticks: 6, labelEvery: 99, ...o });
  G.g.querySelectorAll("text").forEach((n) => n.remove());
  return G;
};

H.runUnit = (parent, p, o = {}) => {
  const lab = o.labels ?? ["tank", "pump", "motor", "gauge", "valve", "cyl", "tube"];
  const has = (k) => lab.includes(k);
  const g = H.el("g", { id: p }, parent);
  const rect = (x, y, w, h, fill, a = {}, par = g) =>
    H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 6, fill, stroke: C15.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, par);
  const T = (x, y, s, a = {}) => H.text(a.par || g, x, y, s, { size: a.size || 23, anchor: a.anchor || "middle", fill: a.fill || C15.ink });
  const pipe = (d, w, col, id) => H.el("path", { ...(id ? { id } : {}), d, fill: "none", stroke: col, "stroke-width": w, "stroke-linejoin": "round" }, g);
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", "stroke-linecap": "butt", opacity: 0 }, g);
  const S = { g };

  // tank (cut open): air space, oil, baffle plate, strainer on the end of the suction tube
  H.el("rect", { x: 40, y: 404, width: 640, height: 211, fill: C15.air, stroke: C15.ink, "stroke-width": 5 }, g);
  H.el("rect", { x: 43, y: 445, width: 634, height: 167, fill: C15.oil }, g);
  H.el("line", { x1: 43, y1: 445, x2: 677, y2: 445, stroke: "#c9971b", "stroke-width": 3 }, g);
  rect(430, 470, 10, 142, C15.metal, { sw: 3, rx: 1 });
  rect(180, 540, 60, 60, "#ebe6da", { rx: 8 });
  const mesh = [];
  for (let x = 188; x < 240; x += 8) mesh.push(`M ${x} 544 L ${x} 596`);
  for (let y = 548; y < 600; y += 8) mesh.push(`M 184 ${y} L 236 ${y}`);
  H.el("path", { d: mesh.join(" "), fill: "none", stroke: C15.ink, "stroke-width": 1.6, opacity: 0.55 }, g);

  // lid, then the pipes (drawn over the lid where they pass through it)
  rect(28, 392, 664, 12, C15.metal, { rx: 3 });
  pipe("M 210 540 L 210 352", 12, C15.blue, `${p}-suc`);
  pipe("M 860 244 L 860 342 L 640 342 L 640 500", 8, C15.muted, `${p}-ret`);
  pipe("M 235 272 L 235 215 L 760 215", 11, C15.blue, `${p}-dis`);
  pipe("M 420 215 L 420 176", 7, C15.blue);
  pipe("M 785 190 L 785 150 L 755 150 L 755 124", 8, C15.blue, `${p}-pa`);
  pipe("M 885 190 L 885 150 L 940 150 L 940 124", 8, C15.blue, `${p}-pb`);
  S.flows = [
    flow(`${p}-f1`, "M 210 540 L 210 352"),
    flow(`${p}-f2`, "M 235 272 L 235 215 L 760 215"),
    flow(`${p}-f3`, "M 860 244 L 860 342 L 640 342 L 640 500"),
  ].map((n) => n.id);
  rect(192, 366, 36, 6, C15.metal, { sw: 2, rx: 1 });
  rect(192, 374, 36, 6, C15.metal, { sw: 2, rx: 1 });

  // pump (group) + foot, shaft, coupling (stripes scroll = turning), motor
  rect(250, 352, 30, 40, C15.metal, { sw: 3, rx: 2 });
  S.pump = H.el("g", { id: `${p}-pump` }, g);
  rect(180, 272, 110, 80, C15.dark, { rx: 10 }, S.pump);
  if (has("pump")) T(235, 321, "ปั๊ม", { size: 28, par: S.pump });
  rect(286, 306, 50, 12, C15.dark, { sw: 2, rx: 2 });
  rect(286, 300, 8, 24, C15.ink, { sw: 0, rx: 2 });
  S.cpl = H.el("g", { id: `${p}-cpl` }, g);
  rect(294, 292, 17, 40, C15.metal, { sw: 3, rx: 3 }, S.cpl);
  rect(313, 292, 17, 40, C15.metal, { sw: 3, rx: 3 }, S.cpl);
  const cp = H.el("clipPath", { id: `${p}-cclip` }, H.el("defs", {}, g));
  H.el("rect", { x: 296, y: 294, width: 32, height: 36 }, cp);
  const sg = H.el("g", { "clip-path": `url(#${p}-cclip)` }, g);
  S.stripes = H.el("g", { id: `${p}-stripes` }, sg);
  const st = [];
  for (let y = 280; y <= 340; y += 10) st.push(`M 296 ${y} L 309 ${y} M 315 ${y} L 328 ${y}`);
  H.el("path", { d: st.join(" "), fill: "none", stroke: C15.ink, "stroke-width": 3, opacity: 0.55 }, S.stripes);
  rect(330, 262, 210, 96, C15.metal, { rx: 10 });
  const fins = [];
  for (let x = 346; x <= 526; x += 15) fins.push(`M ${x} 268 L ${x} 352`);
  H.el("path", { d: fins.join(" "), fill: "none", stroke: C15.ink, "stroke-width": 2, opacity: 0.4 }, g);
  rect(540, 278, 18, 64, C15.dark, { sw: 3, rx: 4 });
  rect(350, 358, 30, 34, C15.metal, { sw: 3, rx: 2 });
  rect(490, 358, 30, 34, C15.metal, { sw: 3, rx: 2 });
  if (has("motor")) {
    rect(383, 291, 104, 38, C15.paper, { sw: 2, rx: 6 });
    T(435, 318, "มอเตอร์", { size: 24 });
  }

  // pressure gauge on the discharge line: green band = normal reading ±3 (no numbers)
  S.gauge = H.gauge15(g, 420, 128, 50, { id: `${p}-g`, minor: 1, value: G15.N });

  // solenoid valve (3 boxes + coil); P from the left, A / B up to the cylinder, T down to the tank
  rect(760, 190, 150, 54, C15.paper, { rx: 4 });
  H.el("path", { d: "M 810 190 L 810 244 M 860 190 L 860 244", fill: "none", stroke: C15.ink, "stroke-width": 3 }, g);
  H.el("path", { d: "M 824 236 L 846 200 M 836 200 L 846 200 L 846 210 M 874 200 L 896 236 M 886 236 L 896 236 L 896 226", fill: "none", stroke: C15.blue, "stroke-width": 3 }, g);
  rect(910, 197, 38, 40, C15.dark, { rx: 4 });
  H.el("path", { d: "M 918 207 L 940 207 M 918 217 L 940 217 M 918 227 L 940 227", fill: "none", stroke: C15.ink, "stroke-width": 2.5 }, g);

  // cylinder: barrel, rod group (piston + rod + load) slides out, head cap over the rod
  rect(740, 60, 220, 64, C15.tube);
  S.rod = H.el("g", { id: `${p}-rod` }, g);
  rect(790, 84, 214, 16, C15.dark, { sw: 3, rx: 2 }, S.rod);
  rect(768, 63, 22, 58, C15.dark, { sw: 3, rx: 2 }, S.rod);
  rect(1000, 64, 34, 56, C15.metal, { rx: 6 }, S.rod);
  rect(948, 60, 14, 64, C15.metal, { sw: 3, rx: 2 });
  rect(732, 56, 12, 72, C15.metal, { sw: 3, rx: 2 });

  // labels
  if (has("tank")) T(560, 596, "ถังน้ำมัน (Oil tank)", { size: 24 });
  if (has("gauge")) T(348, 122, "เกจวัดแรงดัน", { size: 23, anchor: "end" });
  if (has("valve")) T(958, 228, "วาล์ว (Valve)", { size: 22, anchor: "start" });
  if (has("cyl")) T(850, 44, "กระบอกสูบ (Cylinder)", { size: 22 });
  if (has("tube")) T(705, 258, "ท่อ (Tube)", { size: 22 });

  // sound arcs on the upper left of the pump (start hidden)
  S.noise = [80, 102, 124].map((r, i) => {
    const a = H.el("g", { id: `${p}-n${i}`, opacity: 0 }, g);
    for (const [col, w] of [["#ffffff", 11], [C15.ink, 5]])
      H.el("path", { d: H.arcD(235, 312, r, 200, 250), fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" }, a);
    return a;
  });
  // fingertip points for the touch check, and other spots
  S.spot = { pump: [205, 274], motor: [495, 264], tube: [600, 222], valve: [835, 192], gauge: [420, 128], coupling: [312, 312] };
  return S;
};

// Coupling stripes scroll from t0 to t1 (looks like the coupling turning). Finite repeat → seekable.
H.spin15 = (S, t0, t1, step = 0.12) => {
  const n = Math.max(1, Math.round((t1 - t0) / step));
  tl.fromTo(S.stripes, { y: 0 }, { y: 10, duration: step, ease: "none", repeat: n - 1 }, t0);
};
// Sound arcs flash outward from t for about `dur` seconds (finite repeat)
// (a top-level repeat repeats the whole staggered sequence: one pass = 0.25 + 0.1·(arcs − 1) seconds)
H.noise15 = (arcs, t, dur) => {
  const pass = 0.25 + 0.1 * (arcs.length - 1), n = Math.max(1, Math.floor(dur / (2 * pass)));
  tl.fromTo(arcs, { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.1, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t);
};
// Gauge needle: value(t) on the gauge scale between t0 and t1
H.needle15 = (G, valueFn, t0, t1, ir = false) => H.fnTo(G.needle, "rotation", (t) => G.rot(valueFn(t)), t0, t1, { extra: { svgOrigin: G.origin }, ir });

// Hand seen from the back, fingers pointing down; fingertips at (x, y). Outer group (returned) is free for GSAP.
H.hand15 = (parent, id, x, y, s = 1, rot = 0) => {
  const g = H.el("g", { id }, parent);
  const k = H.el("g", { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` }, g);
  const shapes = [
    { x: -34, y: -126, width: 68, height: 80, rx: 20 },
    { x: -33, y: -66, width: 15, height: 54, rx: 7.5 },
    { x: -16.5, y: -66, width: 15, height: 66, rx: 7.5 },
    { x: 0, y: -66, width: 15, height: 62, rx: 7.5 },
    { x: 16.5, y: -66, width: 15, height: 48, rx: 7.5 },
    { x: -8, y: 0, width: 16, height: 50, rx: 8, transform: "translate(-30 -112) rotate(28)" },
  ];
  // outline pass, then fill pass: one clean silhouette without inner seams
  for (const a of shapes) H.el("rect", { ...a, fill: C15.ink, stroke: C15.ink, "stroke-width": 7, "stroke-linejoin": "round" }, k);
  for (const a of shapes) H.el("rect", { ...a, fill: C15.skin }, k);
  H.el("path", { d: "M -17.25 -60 L -17.25 -18 M -0.75 -60 L -0.75 -8 M 15.75 -60 L 15.75 -22", fill: "none", stroke: C15.ink, "stroke-width": 2.5, opacity: 0.5 }, k);
  H.el("rect", { x: -38, y: -174, width: 76, height: 54, rx: 6, fill: C15.sleeve, stroke: C15.ink, "stroke-width": 5 }, k);
  return g;
};

// Ear icon, centred on (x, y), about 76 × 84 at s = 1.
H.ear15 = (parent, id, x, y, s = 1, o = {}) => {
  const g = H.el("g", { id, ...(o.hidden ? { opacity: 0 } : {}) }, parent);
  const k = H.el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g);
  H.el("path", { d: "M 2 -40 C 28 -40 40 -20 38 0 C 36 17 23 23 19 36 C 15 49 -3 49 -7 36 C -11 23 -24 12 -24 -6 C -24 -27 -13 -40 2 -40 Z", fill: C15.skin, stroke: C15.ink, "stroke-width": 5, "stroke-linejoin": "round" }, k);
  H.el("path", { d: "M -9 -12 C -7 -26 15 -26 19 -9 C 21 4 8 8 8 19", fill: "none", stroke: C15.ink, "stroke-width": 4.5, "stroke-linecap": "round" }, k);
  return g;
};

// Half dial (left → top → right), scale G15; green band N ± 3, blue mark = normal reading N.
H.dial15 = (parent, p, cx, cy, r, o = {}) => {
  const g = H.el("g", { id: p }, parent), f = H.f;
  const ang = (v) => 180 + (180 * (v - G15.min)) / (G15.max - G15.min);
  const pt = (v, k) => {
    const a = (ang(v) * Math.PI) / 180;
    return [f(cx + Math.cos(a) * r * k), f(cy + Math.sin(a) * r * k)];
  };
  H.el("path", { d: `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`, fill: C15.paper, stroke: C15.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  H.el("path", { id: `${p}-band`, d: H.arcD(cx, cy, r * 0.8, ang(G15.N - G15.band), ang(G15.N + G15.band)), fill: "none", stroke: C15.green, "stroke-width": f(r * 0.16) }, g);
  for (let v = G15.min; v <= G15.max; v++) {
    const major = v % 5 === 0;
    const [x1, y1] = pt(v, 0.95), [x2, y2] = pt(v, major ? 0.74 : 0.85);
    H.el("line", { x1, y1, x2, y2, stroke: C15.ink, "stroke-width": major ? 4.5 : 2.2 }, g);
  }
  const [sx1, sy1] = pt(G15.N, 0.62), [sx2, sy2] = pt(G15.N, 0.99);
  H.el("line", { x1: sx1, y1: sy1, x2: sx2, y2: sy2, stroke: C15.blue, "stroke-width": 8, "stroke-linecap": "butt" }, g);
  const needle = H.el("g", { id: `${p}-n` }, g);
  H.el("path", { d: `M ${f(cx - r * 0.1)} ${f(cy - r * 0.045)} L ${f(cx + r * 0.8)} ${cy} L ${f(cx - r * 0.1)} ${f(cy + r * 0.045)} Z`, fill: C15.ink }, needle);
  H.el("circle", { cx, cy, r: f(r * 0.075), fill: C15.ink }, g);
  const origin = `${cx} ${cy}`;
  gsap.set(needle, { rotation: ang(o.value ?? 0), svgOrigin: origin });
  return { g, needle, rot: ang, origin, pt };
};
// Legend line: short coloured bar + text
H.legend15 = (parent, x, y, color, str, size = 26, w = 30) => {
  H.el("line", { x1: x, y1: y - size * 0.35, x2: x + w, y2: y - size * 0.35, stroke: color, "stroke-width": 10 }, parent);
  return H.text(parent, x + w + 10, y, str, { size, fill: C15.ink });
};
// Heat squiggle (rising wavy line) with its bottom at (x, y), height h
H.heatD = (x, y, h = 30) => `M ${x} ${y} C ${x - 7} ${y - h * 0.2} ${x + 7} ${y - h * 0.45} ${x} ${y - h * 0.6} C ${x - 6} ${y - h * 0.75} ${x + 5} ${y - h * 0.9} ${x} ${y - h}`;
