// EP28 — Pneumatic: daily / weekly inspection (OPL 5'-C-1, PDF p.44).
// Drawings shared by the title, drain, daily-check and weekly scenes. Pneumatic series colours (brief Part D):
// air-flow dashes on blue pipes, air tint, water drops, oil, transparent bowls. hyd_lib.js is loaded first;
// everything here is prefixed P28 / H.p28*.

const P28 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", pipe: "#1f5fbf", flow: "#2a8fc9",
  air: "#dff1fb", water: "#3b7dd8", oil: "#f2c94c", oilDk: "#b98a00", dirt: "#7a5c3a", bowl: "#eef6fb",
  paper: "#fffdf8", red: "#d0233a", green: "#178a4e", yellow: "#f2a900", blue: "#1f5fbf", grid: "#e3ddd0",
};

// Text with a paper halo so it stays readable over drawings. o: { id, size, anchor, fill, weight, halo }
H.p28Label = (parent, x, y, str, o = {}) => {
  const t = H.text(parent, x, y, str, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || P28.ink, weight: o.weight, id: o.id });
  t.setAttribute("stroke", o.halo || P28.paper);
  t.setAttribute("stroke-width", o.haloW ?? 7);
  t.setAttribute("stroke-linejoin", "round");
  t.setAttribute("paint-order", "stroke");
  return t;
};

// Number in a filled circle (check point 1–4).
H.p28Badge = (parent, x, y, n, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const r = o.r || 22;
  H.el("circle", { cx: x, cy: y, r, fill: o.color || P28.blue, stroke: P28.paper, "stroke-width": 4 }, g);
  H.text(g, x, y + r * 0.42, String(n), { size: Math.round(r * 1.25), anchor: "middle", fill: "#ffffff" });
  return g;
};

// Green OK disc with a white check mark (drawn as a path — no font glyph needed).
H.p28Tick = (parent, cx, cy, r, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent), f = H.f;
  H.el("circle", { cx, cy, r, fill: o.color || P28.green, stroke: o.ring || P28.paper, "stroke-width": o.ringW ?? 3 }, g);
  H.el("path", { d: `M ${f(cx - r * 0.45)} ${f(cy + r * 0.02)} L ${f(cx - r * 0.1)} ${f(cy + r * 0.36)} L ${f(cx + r * 0.48)} ${f(cy - r * 0.34)}`, fill: "none", stroke: "#ffffff", "stroke-width": f(r * 0.22), "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  return g;
};

// Warning triangle (small, for "dangerous while running" rows).
H.p28Warn = (parent, cx, cy, s, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent), f = H.f;
  H.el("path", { d: `M ${f(cx)} ${f(cy - s)} L ${f(cx + s * 1.1)} ${f(cy + s * 0.8)} L ${f(cx - s * 1.1)} ${f(cy + s * 0.8)} Z`, fill: P28.yellow, stroke: P28.ink, "stroke-width": 3, "stroke-linejoin": "round" }, g);
  H.el("rect", { x: f(cx - s * 0.1), y: f(cy - s * 0.45), width: f(s * 0.2), height: f(s * 0.7), rx: 2, fill: P28.ink }, g);
  H.el("circle", { cx, cy: f(cy + s * 0.5), r: f(s * 0.12), fill: P28.ink }, g);
  return g;
};

// Water / oil drop hanging from (x, y) (tip), body radius s.
H.p28DropD = (x, y, s) => {
  const f = H.f, cy = y + 1.5 * s;
  return `M ${f(x)} ${f(y)} C ${f(x + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x + s)} ${f(cy - 0.3 * s)} ${f(x + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(cy + 0.25 * s)} C ${f(x - s)} ${f(cy - 0.3 * s)} ${f(x - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x)} ${f(y)} Z`;
};

// Air pipe: blue wall with the compressed-air tint inside. Returns the group.
H.p28Pipe = (parent, d, o = {}) => {
  const w = o.w || 16;
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  H.el("path", { d, fill: "none", stroke: P28.pipe, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": o.cap || "butt" }, g);
  H.el("path", { d, fill: "none", stroke: P28.air, "stroke-width": Math.max(3, w - 8), "stroke-linejoin": "round", "stroke-linecap": o.cap || "butt" }, g);
  return g;
};

// Air-flow dashes along a pipe (starts hidden). Returns { g, path, period }.
H.p28Flow = (parent, id, d, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const path = H.el("path", { d, fill: "none", stroke: P28.flow, "stroke-width": o.w || 5, "stroke-dasharray": o.dash || "10 14", "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
  return { g, path, period: o.period || 24 };
};
// Run a flow from t for dur seconds (whole dash periods → seamless). keep: stay visible at the end.
H.p28Run = (F, t, dur, o = {}) => {
  const n = Math.max(1, Math.round(((o.speed || 110) * dur) / F.period));
  tl.fromTo(F.g, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, t);
  tl.fromTo(F.path, { strokeDashoffset: 0 }, { strokeDashoffset: -n * F.period, duration: dur, ease: "none", immediateRender: false }, t);
  if (!o.keep) tl.to(F.g, { opacity: 0, duration: 0.25 }, t + dur - 0.25);
};

// Pop-in (scale + fade) about a point given in the element's own coordinates.
H.p28Pop = (el, t, x, y, from = 1.5, d = 0.3) => {
  const org = `${H.f(x)} ${H.f(y)}`;
  tl.fromTo(el, { opacity: 0, scale: from, svgOrigin: org }, { opacity: 1, scale: 1, svgOrigin: org, duration: d, ease: "back.out(2)" }, t);
};

// ---------------------------------------------------------------- FRL units (local units, port axis y = 0)
// Filter  x 0–84: head, transparent bowl with element, baffle, water (clipped) and a drain cock + lever.
H.p28FUnit = (g, id, o = {}) => {
  const R = (x, y, w, h, fill, rx = 6, sw = 4) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: P28.ink, "stroke-width": sw }, g);
  const bowl = "M 12 35 L 12 168 Q 12 200 42 200 Q 72 200 72 168 L 72 35 Z";
  const cp = H.el("clipPath", { id: `${id}-cf` }, g);
  H.el("path", { d: bowl }, cp);
  H.el("path", { d: bowl, fill: P28.bowl }, g);
  H.el("rect", { x: 28, y: 44, width: 28, height: 84, rx: 4, fill: P28.metal, stroke: P28.ink, "stroke-width": 3 }, g);
  for (let y = 54; y < 128; y += 10) H.el("line", { x1: 28, y1: y, x2: 56, y2: y, stroke: P28.ink, "stroke-width": 1.5, opacity: 0.45 }, g);
  H.el("rect", { x: 40, y: 128, width: 4, height: 16, fill: P28.ink }, g);
  H.el("rect", { x: 20, y: 144, width: 44, height: 6, rx: 2, fill: P28.dark, stroke: P28.ink, "stroke-width": 2 }, g);
  const wl = o.water || 0;
  const water = H.el("rect", { x: 8, y: 200 - wl, width: 68, height: wl + 4, fill: P28.water, opacity: 0.85, "clip-path": `url(#${id}-cf)` }, g);
  H.el("path", { d: bowl, fill: "none", stroke: P28.ink, "stroke-width": 4 }, g);
  // deflector vanes just under the head
  for (const x of [18, 60]) H.el("line", { x1: x, y1: 37, x2: x + (x < 40 ? 8 : -8), y2: 46, stroke: P28.ink, "stroke-width": 3 }, g);
  R(0, -35, 84, 70, P28.metal);
  // drain cock + lever (horizontal = closed; rotate ~50° to open)
  R(36, 199, 12, 15, P28.metal, 2, 3);
  R(39, 222, 6, 12, P28.metal, 1, 2);
  const lever = H.el("g", { id: `${id}-lev` }, g);
  H.el("rect", { x: 40, y: 214, width: 32, height: 8, rx: 4, fill: P28.dark, stroke: P28.ink, "stroke-width": 2.5 }, lever);
  H.el("circle", { cx: 42, cy: 218, r: 6, fill: P28.dark, stroke: P28.ink, "stroke-width": 2.5 }, g);
  return { water, lever, leverOrigin: "42 218", nozzle: [42, 234], waterBase: 200 };
};

// Regulator x 92–172: handle on top, gauge on the front, bonnet below. Gauge has a green normal band, no numbers.
H.p28RUnit = (g, id, o = {}) => {
  const R = (x, y, w, h, fill, rx = 6, sw = 4) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: P28.ink, "stroke-width": sw }, g);
  H.el("path", { d: "M 104 35 L 104 50 Q 132 70 160 50 L 160 35 Z", fill: P28.metal, stroke: P28.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  R(92, -35, 80, 70, P28.metal);
  R(125, -52, 14, 17, P28.metal, 2, 3);
  R(108, -84, 48, 32, P28.dark, 8, 4);
  for (let x = 116; x <= 148; x += 8) H.el("line", { x1: x, y1: -80, x2: x, y2: -56, stroke: P28.ink, "stroke-width": 2, opacity: 0.55 }, g);
  const G = H.gauge(g, 132, 0, 27, { id: `${id}-g`, min: 0, max: 10, ok: o.ok || [4, 7], value: o.gv ?? 5.5, ticks: 5, labels: false });
  return { gauge: G };
};

// Lubricator x 182–262: sight dome (drip window) + fill cap on top, oil bowl with siphon tube.
H.p28LUnit = (g, id, o = {}) => {
  const R = (x, y, w, h, fill, rx = 6, sw = 4) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: P28.ink, "stroke-width": sw }, g);
  const bowl = "M 192 35 L 192 160 Q 192 188 222 188 Q 252 188 252 160 L 252 35 Z";
  const cp = H.el("clipPath", { id: `${id}-cl` }, g);
  H.el("path", { d: bowl }, cp);
  H.el("path", { d: bowl, fill: P28.bowl }, g);
  const lvl = o.oil ?? 100;
  const oil = H.el("rect", { x: 188, y: 188 - lvl, width: 68, height: lvl + 4, fill: P28.oil, "clip-path": `url(#${id}-cl)` }, g);
  H.el("line", { x1: 222, y1: 38, x2: 222, y2: 176, stroke: P28.ink, "stroke-width": 3 }, g);
  H.el("path", { d: bowl, fill: "none", stroke: P28.ink, "stroke-width": 4 }, g);
  R(182, -35, 80, 70, P28.metal);
  H.el("path", { d: "M 210 -35 L 210 -45 Q 228 -66 246 -45 L 246 -35 Z", fill: P28.bowl, stroke: P28.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);
  const drip = H.el("path", { d: H.p28DropD(228, -54, 4), fill: P28.oil, stroke: P28.oilDk, "stroke-width": 1.5 }, g);
  R(188, -46, 16, 11, P28.dark, 2, 3);
  return { oil, oilBase: 188, drip, cap: [196, -46] };
};

// Whole FRL set (Filter → Regulator → Lubricator), placed with translate/scale.
// o: { id, x, y (port axis), s, water, oil, gv, ok } → handles + at(x,y) local→parent, inX, outX.
H.p28Frl = (parent, o) => {
  const s = o.s || 1;
  const g = H.el("g", { id: o.id, transform: `translate(${o.x} ${o.y}) scale(${s})` }, parent);
  for (const x of [82, 170]) H.el("rect", { x, y: -20, width: 12, height: 40, fill: P28.dark, stroke: P28.ink, "stroke-width": 3 }, g);
  const F = H.p28FUnit(g, o.id, o), Rg = H.p28RUnit(g, o.id, o), L = H.p28LUnit(g, o.id, o);
  return { g, ...F, ...Rg, ...L, s, at: (x, y) => [o.x + x * s, o.y + y * s], inX: o.x, outX: o.x + 262 * s };
};

// Air cylinder (side view). o: { id, x, y, L, h, rod, ports: "top"|"bottom" } → { g, rod, portA, portB, travel }.
H.p28Cyl = (parent, o) => {
  const g = H.el("g", { id: o.id }, parent);
  const { x, y, L } = o, h = o.h || 60, rodLen = o.rod || 80;
  const cy = y + h / 2;
  H.el("rect", { x: x + 18, y, width: L - 36, height: h, fill: P28.air, stroke: P28.ink, "stroke-width": 4 }, g);
  const rod = H.el("g", { id: `${o.id}-rod` }, g);
  H.el("rect", { x: x + 24, y: y + 5, width: 14, height: h - 10, rx: 2, fill: P28.dark, stroke: P28.ink, "stroke-width": 3 }, rod);
  H.el("rect", { x: x + 38, y: cy - 8, width: L - 38 + rodLen, height: 16, fill: "#b3b9c1", stroke: P28.ink, "stroke-width": 3 }, rod);
  H.el("rect", { x: x + L + rodLen, y: cy - 24, width: 34, height: 48, rx: 5, fill: P28.metal, stroke: P28.ink, "stroke-width": 4 }, rod);
  for (const cx of [x, x + L - 22]) H.el("rect", { x: cx, y: y - 7, width: 22, height: h + 14, rx: 4, fill: P28.dark, stroke: P28.ink, "stroke-width": 4 }, g);
  const py = o.ports === "bottom" ? y + h + 7 : y - 7;
  return { g, rod, portA: [x + 11, py], portB: [x + L - 11, py], travel: L - 36 - 14 - 12 };
};

// 5-port solenoid valve (simplified): body with two positions, coil box, silencer below, A/B on top, P on the left.
H.p28Valve = (parent, o) => {
  const g = H.el("g", { id: o.id }, parent);
  const { x, y } = o, w = o.w || 150, h = o.h || 60, f = H.f;
  H.el("rect", { x: x + w / 2 - 11, y: y + h, width: 22, height: 20, rx: 3, fill: P28.dark, stroke: P28.ink, "stroke-width": 3 }, g);
  for (let k = 0; k < 3; k++) H.el("line", { x1: x + w / 2 - 11, y1: y + h + 5 + k * 5, x2: x + w / 2 + 11, y2: y + h + 5 + k * 5, stroke: P28.ink, "stroke-width": 1.5 }, g);
  H.el("rect", { x, y, width: w, height: h, rx: 6, fill: P28.paper, stroke: P28.ink, "stroke-width": 4 }, g);
  H.el("line", { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: P28.ink, "stroke-width": 3 }, g);
  H.el("path", { d: `M ${f(x + w * 0.12)} ${f(y + h * 0.75)} L ${f(x + w * 0.38)} ${f(y + h * 0.25)} M ${f(x + w * 0.62)} ${f(y + h * 0.25)} L ${f(x + w * 0.88)} ${f(y + h * 0.75)}`, fill: "none", stroke: P28.blue, "stroke-width": 4 }, g);
  H.el("rect", { x: x + w, y: y + 6, width: o.coil || 50, height: h - 12, rx: 4, fill: "#5d646d", stroke: P28.ink, "stroke-width": 4 }, g);
  for (let k = 1; k < 4; k++) H.el("line", { x1: x + w + k * (o.coil || 50) / 4, y1: y + 10, x2: x + w + k * (o.coil || 50) / 4, y2: y + h - 10, stroke: "#9aa1aa", "stroke-width": 2 }, g);
  return { g, A: [x + w * 0.3, y], B: [x + w * 0.7, y], P: [x, y + h / 2] };
};
