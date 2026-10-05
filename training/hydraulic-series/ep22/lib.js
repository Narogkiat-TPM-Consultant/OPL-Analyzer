// EP22 — pneumatic drawings (Part D shared look). hyd_lib.js is loaded first: names here avoid HC / H.hyd*.
// Parts are drawn in their own local units inside a translated/scaled wrapper <g>; animate only the children
// (svgOrigin values are local units). Colours follow the Part D palette.
const PN = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", paper: "#fffdf8", line: "#d6cdb9",
  pipe: "#1f5fbf", dash: "#2a8fc9", air: "#dff1fb", air2: "#a9d6f0", water: "#3b7dd8", oil: "#f2c94c",
  dirt: "#7a5c3a", bowl: "#eef6fb", blue: "#1f5fbf", green: "#178a4e", red: "#d0233a", yellow: "#f2a900",
  orange: "#ef7d1a", puff: "#9cc9e6", elem: "#e6dfcf", coil: "#59606a", barrel: "#e9eef3",
};

const pnR = (pa, x, y, w, h, fill, o = {}) =>
  H.el("rect", { x, y, width: w, height: h, rx: o.rx ?? 6, fill, stroke: o.stroke ?? PN.ink, "stroke-width": o.sw ?? 4, ...(o.id ? { id: o.id } : {}) }, pa);
H.pnWrap = (parent, x, y, s = 1, id) => H.el("g", { transform: `translate(${x} ${y}) scale(${s})`, ...(id ? { id } : {}) }, parent);

// Drop (tip up) centred on (cx, cy), size s.
H.pnDropD = (cx, cy, s) => {
  const f = H.f;
  return `M ${f(cx)} ${f(cy - 1.5 * s)} C ${f(cx + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx + s)} ${f(cy - 0.3 * s)} ${f(cx + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(cx - s)} ${f(cy + 0.25 * s)} C ${f(cx - s)} ${f(cy - 0.3 * s)} ${f(cx - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx)} ${f(cy - 1.5 * s)} Z`;
};
// Flame standing on (cx, by), height ≈ 2.4 s.
H.pnFlameD = (cx, by, s) => {
  const f = H.f;
  return `M ${f(cx)} ${f(by)} C ${f(cx - 1.15 * s)} ${f(by)} ${f(cx - 1.2 * s)} ${f(by - 1.1 * s)} ${f(cx - 0.55 * s)} ${f(by - 1.75 * s)} ` +
    `C ${f(cx - 0.5 * s)} ${f(by - 1.2 * s)} ${f(cx - 0.2 * s)} ${f(by - 1.05 * s)} ${f(cx - 0.05 * s)} ${f(by - 2.4 * s)} ` +
    `C ${f(cx + 0.35 * s)} ${f(by - 1.8 * s)} ${f(cx + 1.2 * s)} ${f(by - 1.45 * s)} ${f(cx + 0.95 * s)} ${f(by - 0.6 * s)} ` +
    `C ${f(cx + 0.85 * s)} ${f(by - 0.15 * s)} ${f(cx + 0.45 * s)} ${f(by)} ${f(cx)} ${f(by)} Z`;
};
// Check mark (drawn as a path — the fonts may not carry ✓).
H.pnCheckD = (cx, cy, s) => `M ${H.f(cx - s)} ${H.f(cy)} L ${H.f(cx - 0.3 * s)} ${H.f(cy + 0.7 * s)} L ${H.f(cx + s)} ${H.f(cy - 0.7 * s)}`;

// Air tube: blue wall, light bore, and a hidden dash path (returned) for the air flow. Draw d in the air direction.
H.pnTube = (parent, d, o = {}) => {
  const w = o.w ?? 14;
  H.el("path", { d, fill: "none", stroke: PN.pipe, "stroke-width": w, "stroke-linejoin": "round" }, parent);
  H.el("path", { d, fill: "none", stroke: PN.air, "stroke-width": H.f(w * 0.45), "stroke-linejoin": "round" }, parent);
  return H.el("path", { d, fill: "none", stroke: PN.dash, "stroke-width": H.f(w * 0.42), "stroke-dasharray": "10 12", "stroke-linecap": "butt", "stroke-linejoin": "round", opacity: 0 }, parent);
};
// Air dashes run from t0 for dur seconds (absolute times); optional fade-out at `off`.
H.pnFlow = (dashes, t0, dur, o = {}) => {
  for (const el of [].concat(dashes)) {
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t0);
    tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -22 * Math.max(1, Math.round(dur * (o.speed ?? 3))), duration: dur, ease: "none", immediateRender: false }, t0);
    if (o.off != null) tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, o.off);
  }
};
// Spin a part (n turns per second) from t for dur seconds.
H.pnSpin = (el, origin, t, dur, rps = 1.5) =>
  tl.fromTo(el, { rotation: 0, svgOrigin: origin }, { rotation: 360 * Math.max(1, Math.round(dur * rps)), svgOrigin: origin, duration: dur, ease: "none" }, t);
// Exhaust puffs (small rings) below (cx, cy) inside parent; returns the puff elements. Animate with H.pnPuff.
H.pnPuffs = (parent, cx, cy, n = 3) => {
  const out = [];
  for (let i = 0; i < n; i++) out.push(H.el("circle", { cx: cx + (i - 1) * 9, cy, r: 7, fill: "none", stroke: PN.puff, "stroke-width": 4, opacity: 0 }, parent));
  return out;
};
H.pnPuff = (puffs, t, dur, dy = 34) => {
  const reps = Math.max(1, Math.round(dur / 0.6) - 1);
  puffs.forEach((el, i) => tl.fromTo(el, { opacity: 0.9, y: 0, scale: 0.6, transformOrigin: "50% 50%" },
    { opacity: 0, y: dy, scale: 1.5, transformOrigin: "50% 50%", duration: 0.6, ease: "power1.out", repeat: reps, immediateRender: false }, t + i * 0.2));
};
// Spanner: open jaw at (0,0) facing −x, handle along +x; drawn inside a static wrapper at (cx, cy) rotated by ang.
// Returns the inner group (rotate it with svgOrigin "0 0").
H.pnWrench = (parent, cx, cy, s, ang) => {
  const w = H.el("g", { transform: `translate(${cx} ${cy}) rotate(${ang}) scale(${s})` }, parent);
  const g = H.el("g", {}, w);
  H.el("path", { d: H.arcD(0, 0, 27, 222, 498), fill: "none", stroke: PN.muted, "stroke-width": 15 }, g);
  H.el("line", { x1: 36, y1: 0, x2: 150, y2: 0, stroke: PN.muted, "stroke-width": 22, "stroke-linecap": "round" }, g);
  return g;
};
// Blue number badge.
H.pnBadge = (parent, cx, cy, n, r = 17) => {
  const g = H.el("g", {}, parent);
  H.el("circle", { cx, cy, r, fill: PN.blue, stroke: "#ffffff", "stroke-width": 3 }, g);
  H.text(g, cx, cy + r * 0.45, String(n), { size: Math.round(r * 1.3), fill: "#ffffff", anchor: "middle" });
  return g;
};

// ---- parts ---------------------------------------------------------------------------------------------
// Compressor: motor + belt + flywheel + finned head on a horizontal receiver tank. (x, y) = top-left.
// Local box 0–262 × 18–198; outlet on the tank's right end at local (262, 142).
H.pnCompressor = (parent, x, y, s = 1, id) => {
  const g = H.pnWrap(parent, x, y, s, id);
  pnR(g, 34, 180, 26, 18, PN.dark, { rx: 2, sw: 3 });
  pnR(g, 190, 180, 26, 18, PN.dark, { rx: 2, sw: 3 });
  pnR(g, 0, 100, 250, 84, PN.metal, { rx: 42 });
  H.el("line", { x1: 60, y1: 104, x2: 60, y2: 180, stroke: PN.ink, "stroke-width": 2, opacity: 0.35 }, g);
  H.el("line", { x1: 190, y1: 104, x2: 190, y2: 180, stroke: PN.ink, "stroke-width": 2, opacity: 0.35 }, g);
  pnR(g, 248, 132, 14, 20, PN.dark, { rx: 2, sw: 3 });
  pnR(g, 10, 42, 96, 56, PN.dark, { rx: 8 });
  for (let i = 0; i < 6; i++) H.el("line", { x1: 22 + i * 14, y1: 48, x2: 22 + i * 14, y2: 92, stroke: PN.ink, "stroke-width": 2, opacity: 0.45 }, g);
  pnR(g, 208, 30, 38, 70, PN.metal, { rx: 4 });
  for (let i = 0; i < 5; i++) H.el("line", { x1: 202, y1: 38 + i * 13, x2: 252, y2: 38 + i * 13, stroke: PN.ink, "stroke-width": 4, "stroke-linecap": "round" }, g);
  H.el("path", { d: "M 60 55 L 165 18 M 60 83 L 165 98", stroke: PN.ink, "stroke-width": 5, fill: "none" }, g);
  const mp = H.el("g", {}, g);
  H.el("circle", { cx: 60, cy: 69, r: 14, fill: PN.paper, stroke: PN.ink, "stroke-width": 3 }, mp);
  H.el("line", { x1: 48, y1: 69, x2: 72, y2: 69, stroke: PN.ink, "stroke-width": 3 }, mp);
  const fw = H.el("g", {}, g);
  H.el("circle", { cx: 165, cy: 58, r: 40, fill: PN.paper, stroke: PN.ink, "stroke-width": 4 }, fw);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (Math.PI / 2) * i;
    H.el("line", { x1: 165, y1: 58, x2: H.f(165 + 36 * Math.cos(a)), y2: H.f(58 + 36 * Math.sin(a)), stroke: PN.ink, "stroke-width": 4 }, fw);
  }
  H.el("circle", { cx: 165, cy: 58, r: 8, fill: PN.ink }, g);
  return { g, fw, mp, fwO: "165 58", mpO: "60 69", out: [x + 262 * s, y + 142 * s] };
};

const PN_BOWL = "M 14 30 L 14 104 Q 14 128 46 128 Q 78 128 78 104 L 78 30 Z";
// Air filter: body (inlet at local (0,0), outlet (92,0)), transparent bowl with element + water, drain cock.
H.pnFilter = (parent, x, y, s = 1, id) => {
  const g = H.pnWrap(parent, x, y, s, id);
  H.el("path", { d: PN_BOWL, fill: PN.bowl, stroke: PN.ink, "stroke-width": 4 }, g);
  pnR(g, 34, 40, 24, 56, PN.elem, { rx: 3, sw: 3 });
  for (let i = 0; i < 3; i++) H.el("line", { x1: 40 + i * 6, y1: 44, x2: 40 + i * 6, y2: 92, stroke: PN.muted, "stroke-width": 2 }, g);
  H.el("path", { d: "M 22 34 L 70 34 L 62 44 L 30 44 Z", fill: PN.dark, stroke: PN.ink, "stroke-width": 2 }, g);
  const water = H.el("path", { d: "M 16 106 Q 18 125 46 125 Q 74 125 76 106 Z", fill: PN.water, opacity: 0.85 }, g);
  pnR(g, 40, 127, 12, 15, PN.dark, { rx: 2, sw: 3 });
  const drop = H.el("path", { d: H.pnDropD(46, 154, 6), fill: PN.water, opacity: 0 }, g);
  pnR(g, 0, -32, 92, 64, PN.metal, { rx: 6 });
  H.el("path", { d: "M 28 0 L 62 0 M 52 -9 L 63 0 L 52 9", stroke: PN.ink, "stroke-width": 3, fill: "none" }, g);
  return { g, water, drop };
};

// Regulator: body (inlet local (0,0), outlet (92,0)), spring bonnet + adjusting knob on top. The gauge on the
// front is a separate wrapper (gg) so it can be highlighted on its own (pressure gauge = accessory).
H.pnRegulator = (parent, x, y, s = 1, id) => {
  const g = H.pnWrap(parent, x, y, s, id);
  H.el("path", { d: "M 16 -32 L 26 -66 L 66 -66 L 76 -32 Z", fill: PN.metal, stroke: PN.ink, "stroke-width": 4 }, g);
  const knob = H.el("g", {}, g);
  pnR(knob, 16, -100, 60, 36, PN.dark, { rx: 8 });
  const grips = [];
  for (let i = 0; i < 5; i++) grips.push(H.el("line", { x1: 26 + i * 10, y1: -94, x2: 26 + i * 10, y2: -70, stroke: PN.ink, "stroke-width": 3 }, knob));
  pnR(g, 0, -32, 92, 64, PN.metal, { rx: 6 });
  pnR(g, 24, 32, 44, 18, PN.metal, { rx: 4 });
  const gg = H.pnWrap(parent, x, y, s, id ? id + "-gauge" : undefined);
  H.el("circle", { cx: 46, cy: 0, r: 25, fill: PN.paper, stroke: PN.ink, "stroke-width": 4 }, gg);
  for (let i = 0; i <= 4; i++) {
    const a = ((150 + i * 60) * Math.PI) / 180;
    H.el("line", { x1: H.f(46 + 15 * Math.cos(a)), y1: H.f(15 * Math.sin(a)), x2: H.f(46 + 21 * Math.cos(a)), y2: H.f(21 * Math.sin(a)), stroke: PN.ink, "stroke-width": 2.5 }, gg);
  }
  const needle = H.el("line", { x1: 46, y1: 0, x2: H.f(46 + 16 * Math.cos((150 * Math.PI) / 180)), y2: H.f(16 * Math.sin((150 * Math.PI) / 180)), stroke: PN.ink, "stroke-width": 3.5, "stroke-linecap": "round" }, gg);
  H.el("circle", { cx: 46, cy: 0, r: 4, fill: PN.ink }, gg);
  return { g, gg, knob, grips, needle, nO: "46 0" };
};

// Lubricator: body (inlet local (0,0), outlet (92,0)), sight dome with a dripping oil drop, oil bowl + siphon tube.
H.pnLubricator = (parent, x, y, s = 1, id) => {
  const g = H.pnWrap(parent, x, y, s, id);
  H.el("path", { d: PN_BOWL, fill: PN.bowl, stroke: PN.ink, "stroke-width": 4 }, g);
  H.el("path", { d: "M 16 62 L 76 62 L 76 104 Q 76 126 46 126 Q 16 126 16 104 Z", fill: PN.oil }, g);
  H.el("line", { x1: 46, y1: 32, x2: 46, y2: 116, stroke: PN.ink, "stroke-width": 3, opacity: 0.55 }, g);
  pnR(g, 40, -78, 12, 14, PN.dark, { rx: 2, sw: 3 });
  H.el("path", { d: "M 22 -32 L 22 -44 A 24 22 0 0 1 70 -44 L 70 -32 Z", fill: PN.bowl, stroke: PN.ink, "stroke-width": 4 }, g);
  H.el("line", { x1: 46, y1: -66, x2: 46, y2: -57, stroke: PN.ink, "stroke-width": 3 }, g);
  const drop = H.el("path", { d: H.pnDropD(46, -50, 4.5), fill: PN.oil, stroke: PN.ink, "stroke-width": 1.5, opacity: 0 }, g);
  pnR(g, 0, -32, 92, 64, PN.metal, { rx: 6 });
  return { g, drop };
};

// 5-port single-solenoid valve. (x, y) = body top-left; body 170 × 70, coil on the right, return spring left.
// Ports: A (local x 60) and B (105) on top; R1 (25), P (85), R2 (145) at the bottom; silencers on R1/R2 (wrapper gs).
H.pnValve = (parent, x, y, s = 1, id) => {
  const g = H.pnWrap(parent, x, y, s, id);
  for (const px of [60, 105]) pnR(g, px - 10, -12, 20, 14, PN.dark, { rx: 2, sw: 3 });
  for (const px of [25, 85, 145]) pnR(g, px - 10, 68, 20, 14, PN.dark, { rx: 2, sw: 3 });
  pnR(g, -24, 14, 26, 42, PN.metal, { rx: 4, sw: 3 });
  H.el("path", { d: "M -20 35 L -17 23 L -12 47 L -7 23 L -2 47 L 1 35", fill: "none", stroke: PN.ink, "stroke-width": 2.5 }, g);
  pnR(g, 0, 0, 170, 70, PN.metal, { rx: 6 });
  pnR(g, 18, 22, 134, 26, PN.paper, { rx: 3, sw: 3 });
  const spool = H.el("g", {}, g);
  H.el("rect", { x: 26, y: 32, width: 112, height: 6, fill: PN.muted }, spool);
  for (const lx of [24, 72, 120]) pnR(spool, lx, 25, 18, 20, PN.dark, { rx: 2, sw: 2 });
  const coil = pnR(g, 170, 6, 54, 58, PN.coil, { rx: 6 });
  H.text(g, 197, 42, "SOL", { size: 17, fill: "#ffffff", anchor: "middle" });
  const led = H.el("circle", { cx: 214, cy: 15, r: 5, fill: PN.dark, stroke: PN.ink, "stroke-width": 1.5 }, g);
  const gs = H.pnWrap(parent, x, y, s, id ? id + "-sil" : undefined);
  for (const px of [25, 145]) {
    pnR(gs, px - 11, 82, 22, 34, PN.elem, { rx: 8, sw: 3 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) H.el("circle", { cx: px - 4 + c * 8, cy: 91 + r * 9, r: 2, fill: PN.muted }, gs);
  }
  const puffs = H.pnPuffs(gs, 145, 126, 3);
  const P = (lx, ly) => [x + lx * s, y + ly * s];
  return { g, gs, spool, coil, led, puffs, A: P(60, -12), B: P(105, -12), Pp: P(85, 82), shift: 12 };
};
// Energise the valve coil at t: coil turns yellow, LED on, spool shifts (seek-safe).
H.pnValveOn = (V, t) => {
  tl.fromTo(V.coil, { attr: { fill: PN.coil } }, { attr: { fill: PN.yellow }, duration: 0.25, immediateRender: false }, t);
  tl.fromTo(V.led, { attr: { fill: PN.dark } }, { attr: { fill: "#ffd23f" }, duration: 0.2, immediateRender: false }, t);
  tl.fromTo(V.spool, { x: 0 }, { x: V.shift, duration: 0.3, ease: "power2.out", immediateRender: false }, t + 0.1);
};

// Speed controller (flow control with a needle-valve knob). (x, y) = centre; knob on top or on the right.
H.pnSpeed = (parent, x, y, s = 1, id, side = "top") => {
  const g = H.pnWrap(parent, x, y, s, id);
  const knob = H.el("g", {}, g);
  if (side === "right") { pnR(knob, 22, -8, 12, 16, PN.dark, { rx: 2, sw: 3 }); pnR(knob, 34, -14, 18, 28, PN.dark, { rx: 4, sw: 3 }); }
  else { pnR(knob, -8, -34, 16, 14, PN.dark, { rx: 2, sw: 3 }); pnR(knob, -14, -52, 28, 18, PN.dark, { rx: 4, sw: 3 }); }
  pnR(g, -24, -20, 48, 40, PN.metal, { rx: 5 });
  H.el("path", { d: "M -14 12 L 12 -10 M 2 -11 L 12 -10 L 11 0", fill: "none", stroke: PN.ink, "stroke-width": 3 }, g);
  return { g, knob };
};

// Air cylinder, cut away: cap cover, barrel, piston + rod + rod end (mov), rod cover. (x, y) = top-left.
// Local 0–300 × 0–80 plus the rod (to 376 retracted); ports below the covers at local x 15 (cap) and 285 (rod).
H.pnCylinder = (parent, x, y, s = 1, id, S = 120) => {
  const g = H.pnWrap(parent, x, y, s, id);
  H.el("line", { x1: 10, y1: 5, x2: 290, y2: 5, stroke: PN.ink, "stroke-width": 3 }, g);
  H.el("line", { x1: 10, y1: 75, x2: 290, y2: 75, stroke: PN.ink, "stroke-width": 3 }, g);
  pnR(g, 26, 10, 248, 60, PN.barrel, { rx: 2 });
  const air = H.el("rect", { x: 30, y: 13, width: 6, height: 54, fill: PN.air2 }, g);
  const mov = H.el("g", {}, g);
  pnR(mov, 56, 31, 290, 18, PN.metal, { rx: 2, sw: 3 });
  pnR(mov, 346, 14, 30, 52, PN.metal, { rx: 4 });
  pnR(mov, 36, 13, 20, 54, PN.dark, { rx: 2, sw: 3 });
  pnR(g, 7, 78, 16, 14, PN.dark, { rx: 2, sw: 3 });
  pnR(g, 277, 78, 16, 14, PN.dark, { rx: 2, sw: 3 });
  pnR(g, 0, 0, 30, 80, PN.dark, { rx: 4 });
  pnR(g, 270, 0, 30, 80, PN.dark, { rx: 4 });
  const P = (lx, ly) => [x + lx * s, y + ly * s];
  return { g, mov, air, S, cap: P(15, 92), rod: P(285, 92) };
};
// Move the cylinder from fraction a to fraction b of its stroke (piston and the cap-side air chamber together).
H.pnCylMove = (C, a, b, t, dur, ease = "power2.inOut") => {
  tl.fromTo(C.mov, { x: a * C.S }, { x: b * C.S, duration: dur, ease, immediateRender: false }, t);
  tl.fromTo(C.air, { attr: { width: 6 + a * C.S } }, { attr: { width: 6 + b * C.S }, duration: dur, ease, immediateRender: false }, t);
};

// ---- the example circuit of OPL 5'-A-2 (viewBox 0 0 1100 640) -----------------------------------------------
// compressor → filter → regulator → lubricator → solenoid valve → speed controllers → cylinder.
// o.labels: draw part names. Returns every handle; `groups` lists the wrappers of each functional group 1–4.
H.pnCircuit = (parent, p, o = {}) => {
  const root = H.el("g", { id: p }, parent);
  const tubes = H.el("g", { id: `${p}-tubes` }, root);
  const yF = 384;
  // tubes first (parts sit on top of them)
  const dS = H.pnTube(tubes, `M 298 516 L 318 516 L 318 ${yF} L 342 ${yF}`);
  const dFR = H.pnTube(tubes, `M 426 ${yF} L 472 ${yF}`);
  const dRL = H.pnTube(tubes, `M 556 ${yF} L 602 ${yF}`);
  const dLV = H.pnTube(tubes, `M 686 ${yF} L 702 ${yF} L 702 612 L 825 612 L 825 520`);
  const dA = H.pnTube(tubes, "M 800 428 L 800 232 L 575 232 L 575 132");
  const dB = H.pnTube(tubes, "M 845 132 L 845 428");
  const Cm = H.pnCompressor(root, 38, 374, 1.0, `${p}-comp`);
  const F = H.pnFilter(root, 338, yF, 1.0, `${p}-filt`);
  const Rg = H.pnRegulator(root, 468, yF, 1.0, `${p}-reg`);
  const L = H.pnLubricator(root, 598, yF, 1.0, `${p}-lub`);
  const V = H.pnValve(root, 740, 440, 1.0, `${p}-valve`);
  const SA = H.pnSpeed(root, 688, 232, 1.0, `${p}-sca`, "top");
  const SB = H.pnSpeed(root, 845, 318, 1.0, `${p}-scb`, "right");
  const C = H.pnCylinder(root, 560, 40, 1.0, `${p}-cyl`, 120);
  const lab = H.el("g", { id: `${p}-labels` }, root);
  const badges = { 1: [], 2: [], 3: [], 4: [] };
  if (o.labels) {
    // badge + name: the badge sits at (x, y - 8), the name starts right of it
    const bl = (k, x, y, s) => { badges[k].push(H.pnBadge(lab, x, y - 8, k, 15)); if (s) H.text(lab, x + 21, y, s, { size: 24 }); };
    bl(1, 82, 362, "Compressor");
    bl(2, 352, 338, "Filter");
    bl(3, 462, 270, "Regulator");
    bl(2, 600, 296, "Lubricator");
    bl(4, 434, 92, "Cylinder");
    bl(3, 1004, 470, "Solenoid");
    H.text(lab, 1025, 498, "valve", { size: 24 });
    bl(3, 912, 312, "Speed");
    H.text(lab, 933, 340, "controller", { size: 24 });
    bl(2, 545, 364);   // pressure gauge on the regulator
    bl(3, 652, 204);   // second speed controller
  }
  const groups = { 1: [Cm.g], 2: [F.g, L.g, Rg.gg], 3: [Rg.g, V.g, V.gs, SA.g, SB.g], 4: [C.g] };
  return { root, tubes, lab, badges, Cm, F, Rg, L, V, SA, SB, C, groups, dash: { S: dS, FR: dFR, RL: dRL, LV: dLV, A: dA, B: dB } };
};
