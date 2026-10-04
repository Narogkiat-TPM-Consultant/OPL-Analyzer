// EP21 — Inspection of high-pressure hose piping (OPL 5-C-12, 5-C-13; PDF p.33–34): shared drawings.
// Hose (stroked path, morphable), crimped hose fitting, NG/OK panels + stamps, labels with a halo,
// the "bend under pressure" rig of OPL 5-C-13 ⑤ (title + scene 5) and seek-safe time-function tweens.
// hyd_lib.js is loaded first (HC, H.hyd* are taken), so everything here is prefixed hz / Z.

const Z = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", steel: "#b3b9c1", hose: "#3b4048",
  blue: "#1f5fbf", green: "#178a4e", red: "#d0233a", yellow: "#f2a900", oil: "#f2c94c", paper: "#fffdf8",
  bg: "#f5f1e8", line: "#d6cdb9", wall: "#e2dccd", skin: "#f0c8a0",
};

// Tween any numeric property along a pure function of absolute time fn(t) between tA and tB (from EP10):
// every frame depends on time only, so the timeline stays seekable.
H.hzFn = (el, prop, fn, tA, tB, o = {}) => {
  const d = Math.max(0.001, tB - tA), v0 = fn(tA);
  const wrap = (v) => (o.attr ? { attr: { [prop]: v } } : { [prop]: v });
  tl.fromTo(el, { ...wrap(v0), ...(o.extra || {}) }, { ...wrap(v0 + 1), ...(o.extra || {}), duration: d, ease: (q) => fn(tA + q * d) - v0, immediateRender: o.ir ?? false }, tA);
};
H.hzEnv = (t, t0, t1, r = 0.3) => Math.max(0, Math.min(1, (t - t0) / r, (t1 - t) / r));
H.hzWob = (t, k = 0) => 0.6 * Math.sin(2 * Math.PI * 5.3 * t + k) + 0.4 * Math.sin(2 * Math.PI * 8.7 * t + 1.3 + k);

// Fade/opacity helper (fromTo, never renders before its time).
H.hzOp = (el, a, z, t, d = 0.3) => tl.fromTo(el, { opacity: a }, { opacity: z, duration: d, immediateRender: false }, t);

// Hose: outline + rubber body + soft centre highlight, all on the same path d → morph all three together.
// o: { w = 30, id, color, edge }  → { g, paths }
H.hzHose = (parent, d, o = {}) => {
  const w = o.w ?? 30, g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const mk = (stroke, sw, extra = {}) =>
    H.el("path", { d, fill: "none", stroke, "stroke-width": H.f(sw), "stroke-linecap": "butt", "stroke-linejoin": "round", ...extra }, g);
  const paths = [mk(o.edge || Z.ink, w + 7), mk(o.color || Z.hose, w), mk("#ffffff", w * 0.26, { opacity: 0.16 })];
  return { g, paths };
};
// Morph hose paths (or any path list) between two d strings of identical command structure.
H.hzMorph = (paths, d0, d1, t, dur, ease = "power2.inOut", extra = {}) =>
  tl.fromTo(paths, { attr: { d: d0 } }, { attr: { d: d1 }, duration: dur, ease, immediateRender: false, ...extra }, t);
// Morph through a sequence of d strings (one per step), each step linear — for shapes that follow a rotation.
H.hzSteps = (paths, ds, t, dur) => {
  const n = ds.length - 1, st = dur / n;
  for (let i = 0; i < n; i++) H.hzMorph(paths, ds[i], ds[i + 1], t + i * st, st, "none");
};

// Crimped hose fitting. The hose joins at (x, y) and leaves in direction `ang` (degrees, screen, clockwise);
// the fitting body (socket, neck, hex nut, thread) lies behind it. Length 160·k, socket height 44·k.
H.hzFit = (parent, x, y, ang, o = {}) => {
  const k = o.k ?? 1;
  const g = H.el("g", { transform: `translate(${H.f(x)} ${H.f(y)}) rotate(${H.f(ang)}) scale(${k})`, ...(o.id ? { id: o.id } : {}) }, parent);
  const R = (x0, y0, w, h, fill, rx = 4) => H.el("rect", { x: x0, y: y0, width: w, height: h, rx, fill, stroke: o.edge || Z.ink, "stroke-width": 4 }, g);
  const L = (x0, y0, x1, y1, op = 0.5) => H.el("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: o.edge || Z.ink, "stroke-width": 2.5, opacity: op }, g);
  R(-160, -15, 26, 30, Z.metal, 2);
  for (const xx of [-153, -146, -139]) L(xx, -15, xx - 3, 15, 0.45);
  R(-140, -28, 46, 56, Z.metal);
  for (const xx of [-127, -107]) L(xx, -28, xx, 28, 0.55);
  R(-96, -13, 18, 26, Z.metal, 2);
  R(-80, -22, 84, 44, Z.dark, 7);
  for (const xx of [-62, -44, -26]) L(xx, -22, xx, 22, 0.45);
  return g;
};

// Text label with a paper halo; optional leader line ending in a dot. o: { size, anchor, fill, halo, line:[x1,y1,x2,y2], id }
H.hzLabel = (parent, x, y, str, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  if (o.line) {
    const [x1, y1, x2, y2] = o.line;
    H.el("line", { x1, y1, x2, y2, stroke: o.lineColor || Z.ink, "stroke-width": 3 }, g);
    H.el("circle", { cx: x2, cy: y2, r: 5.5, fill: o.lineColor || Z.ink }, g);
  }
  const t = H.text(g, x, y, str, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || Z.ink });
  t.setAttribute("stroke", o.halo || Z.paper);
  t.setAttribute("stroke-width", 7);
  t.setAttribute("stroke-linejoin", "round");
  t.setAttribute("paint-order", "stroke");
  return g;
};

// NG / OK stamp (rounded box, slightly rotated), drawn in SVG so it scales with the drawing.
H.hzStamp = (parent, x, y, verdict, o = {}) => {
  const col = verdict === "OK" ? Z.green : Z.red, s = o.s ?? 1;
  const g = H.el("g", { transform: `translate(${x} ${y}) rotate(-5) scale(${s})`, ...(o.id ? { id: o.id } : {}) }, parent);
  H.el("rect", { x: 0, y: 0, width: 86, height: 50, rx: 11, fill: Z.paper, stroke: col, "stroke-width": 5.5 }, g);
  H.text(g, 43, 38, verdict, { size: 35, anchor: "middle", fill: col });
  return g;
};
// Panel (rounded card) at (x, y) with a stamp in its top-left corner. Draw into `art` (under the stamp).
H.hzPanel = (parent, x, y, w, h, verdict, o = {}) => {
  const g = H.el("g", { transform: `translate(${x} ${y})`, ...(o.id ? { id: o.id } : {}) }, parent);
  const edge = verdict === "OK" ? "#a6d3b8" : verdict === "NG" ? "#efb8bf" : Z.line;
  H.el("rect", { x: 0, y: 0, width: w, height: h, rx: 16, fill: Z.paper, stroke: edge, "stroke-width": 3 }, g);
  const art = H.el("g", {}, g);
  const st = verdict ? H.hzStamp(g, 12, 14, verdict) : null;
  return { g, art, st };
};
// Number badge for a row (matches the numbered points of the panel).
H.hzBadge = (parent, x, y, n, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  H.el("circle", { cx: x, cy: y, r: 24, fill: Z.blue }, g);
  H.text(g, x, y + 10, String(n), { size: 30, anchor: "middle", fill: "#ffffff" });
  return g;
};
// Pulsing red ring (finite repeat) — returns the element (hidden until t).
H.hzRing = (parent, cx, cy, rx, ry, t, n = 3, o = {}) => {
  const e = H.el("ellipse", { cx, cy, rx, ry: ry ?? rx, fill: "none", stroke: Z.red, "stroke-width": o.w ?? 6, opacity: 0, ...(o.id ? { id: o.id } : {}) }, parent);
  H.hzOp(e, 0, 1, t, 0.2);
  tl.fromTo(e, { scale: 1, svgOrigin: `${cx} ${cy}` }, { scale: 1.12, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t + 0.1);
  return e;
};
// Curved arrow along an arc (degrees, clockwise from 3 o'clock) with a filled head at the end.
H.hzArcArrow = (parent, cx, cy, r, a0, a1, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const col = o.color || Z.ink, f = H.f;
  H.el("path", { d: H.arcD(cx, cy, r, a0, a1), fill: "none", stroke: col, "stroke-width": o.w ?? 5 }, g);
  const a = (a1 * Math.PI) / 180, tx = cx + r * Math.cos(a), ty = cy + r * Math.sin(a);
  const dx = -Math.sin(a), dy = Math.cos(a), h = o.head ?? 16;
  H.el("path", { d: `M ${f(tx + dx * h)} ${f(ty + dy * h)} L ${f(tx - dy * h * 0.55)} ${f(ty + dx * h * 0.55)} L ${f(tx + dy * h * 0.55)} ${f(ty - dx * h * 0.55)} Z`, fill: col }, g);
  return g;
};

// ------------------------------------------------------------------------------------------------------------
// OPL 5-C-13 ⑤ rig: a hose rises from a fitting on the base plate, bends over and is clamped on top of the
// machine frame. Local box 0..700 × 0..300. k = 0 → position at pressure 0 (outer), k = 1 → under pressure
// (the bend moves inward, as in the deck's figure). The path is linear in k, so one morph is exact.
H.hzRigD = (k) => {
  const L = 120 - 70 * k, f = H.f;
  return `M 300 182 C 300 ${f(182 - L)} ${f(490 - L)} 60 490 60 L 580 60`;
};
H.hzRig = (parent, p, o = {}) => {
  const g = H.el("g", { id: p, ...(o.transform ? { transform: o.transform } : {}) }, parent);
  const R = (x, y, w, h, fill, sw = 4) => H.el("rect", { x, y, width: w, height: h, fill, stroke: Z.ink, "stroke-width": sw }, g);
  R(150, 262, 550, 28, Z.wall);
  R(450, 92, 250, 170, Z.wall);
  for (let i = 0; i < 5; i++) H.el("line", { x1: 470 + i * 48, y1: 250, x2: 510 + i * 48, y2: 104, stroke: "#c9c1ae", "stroke-width": 3 }, g);
  H.text(g, 575, 190, o.frameLabel ?? "โครงเครื่อง", { size: 24, anchor: "middle", fill: Z.muted, weight: 600 });
  R(660, 28, 40, 64, Z.dark);
  R(474, 82, 32, 12, Z.dark, 3);
  // ghost at pressure 0: dashed edges (thick dashed stroke, centre painted with the background)
  const ghost = H.el("g", { opacity: 0, ...(o.id0 ? { id: o.id0 } : {}) }, g);
  H.el("path", { d: H.hzRigD(0), fill: "none", stroke: Z.muted, "stroke-width": 36, "stroke-dasharray": "15 9" }, ghost);
  H.el("path", { d: H.hzRigD(0), fill: "none", stroke: o.bg || Z.paper, "stroke-width": 28 }, ghost);
  const hose = H.hzHose(g, H.hzRigD(0), { w: 28 });
  H.hzFit(g, 300, 182, -90, { k: 0.5 });
  H.hzFit(g, 580, 60, 180, { k: 0.5 });
  // clamp strap over the hose on its bracket
  H.el("rect", { x: 472, y: 37, width: 36, height: 46, rx: 9, fill: Z.metal, stroke: Z.ink, "stroke-width": 4 }, g);
  H.el("circle", { cx: 490, cy: 60, r: 5, fill: Z.ink }, g);
  return { g, hose, ghost, d: H.hzRigD };
};
