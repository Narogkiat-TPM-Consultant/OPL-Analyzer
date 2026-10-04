// EP18 — Pressure gauge (Bourdon tube) + meter colour marking (OPL 5-C-6, 5-C-7).
// Shared drawings: the gauge front (title, range, marking, judgment), colour bands, marker pen, marks.

const K18 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", rim: "#80878f", paper: "#fffdf8",
  blue: "#1f5fbf", blueLt: "#a9c3ea", green: "#178a4e", red: "#d0233a", yellow: "#f2a900", oil: "#f2c94c",
  gold: "#e3b44a", goldHi: "#f8e2a0", glass: "#dbe8f5",
};

// Pressure-gauge front view. Layers: socket → case → face → colour-band layer (empty, see g18Band) → ticks +
// numbers → needle → glass (bezel ring + glass) on top, so the glass can be lifted off.
// Scale min..max over 270° (min at 7:30, max at 4:30), same angles as H.gauge.
// o: { id, min=0, max=6, minor=5 (minor steps per unit), labels=[values] (default every unit), labelSize,
//      unit="kgf/cm²" (false = none), value=min, glass=true, socket=0 (length below the case) }
// → { g, bands, needle, glass, ang(v), rot(v), origin, cx, cy, r, br, bw, pt(v, rr) }
H.g18Dial = (parent, cx, cy, r, o = {}) => {
  const f = H.f, min = o.min ?? 0, max = o.max ?? 6, id = o.id;
  const ang = (v) => 135 + (270 * (v - min)) / (max - min);
  const pt = (v, rr) => {
    const a = (ang(v) * Math.PI) / 180;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  };
  const sw = (k) => f(Math.max(1.5, r * k));
  const g = H.el("g", { id }, parent);
  if (o.socket) {
    const s = o.socket;
    H.el("rect", { x: f(cx - r * 0.1), y: f(cy + r * 0.9), width: f(r * 0.2), height: f(r * 0.1 + s * 0.32), fill: K18.metal, stroke: K18.ink, "stroke-width": sw(0.018) }, g);
    H.el("path", { d: `M ${f(cx - r * 0.2)} ${f(cy + r + s * 0.3)} H ${f(cx + r * 0.2)} V ${f(cy + r + s * 0.66)} H ${f(cx - r * 0.2)} Z M ${f(cx - r * 0.07)} ${f(cy + r + s * 0.3)} V ${f(cy + r + s * 0.66)} M ${f(cx + r * 0.07)} ${f(cy + r + s * 0.3)} V ${f(cy + r + s * 0.66)}`, fill: K18.dark, stroke: K18.ink, "stroke-width": sw(0.018), "stroke-linejoin": "round" }, g);
    H.el("rect", { x: f(cx - r * 0.085), y: f(cy + r + s * 0.66), width: f(r * 0.17), height: f(s * 0.34), fill: K18.metal, stroke: K18.ink, "stroke-width": sw(0.016) }, g);
    for (let i = 1; i < 4; i++) {
      const y = cy + r + s * (0.66 + 0.085 * i);
      H.el("line", { x1: f(cx - r * 0.085), y1: f(y), x2: f(cx + r * 0.085), y2: f(y + s * 0.05), stroke: K18.ink, "stroke-width": sw(0.01) }, g);
    }
  }
  H.el("circle", { cx, cy, r, fill: K18.rim, stroke: K18.ink, "stroke-width": sw(0.025) }, g);
  H.el("circle", { cx, cy, r: f(r * 0.9), fill: K18.paper, stroke: K18.ink, "stroke-width": sw(0.012) }, g);
  const bands = H.el("g", { id: `${id}-bands` }, g);
  const minor = o.minor ?? 5;
  for (let k = 0; k <= (max - min) * minor; k++) {
    const v = min + k / minor, major = k % minor === 0;
    const [x1, y1] = pt(v, r * 0.86), [x2, y2] = pt(v, r * (major ? 0.7 : 0.77));
    H.el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: K18.ink, "stroke-width": major ? sw(0.024) : sw(0.011) }, g);
  }
  const ls = o.labelSize ?? Math.round(r * 0.15);
  const labels = o.labels ?? Array.from({ length: max - min + 1 }, (_, i) => min + i);
  for (const v of labels) {
    const [x, y] = pt(v, r * 0.55);
    H.text(g, x, y + ls * 0.36, String(v), { size: ls, anchor: "middle" });
  }
  if (o.unit !== false) H.text(g, cx, cy + r * 0.42, o.unit ?? "kgf/cm²", { size: Math.round(r * 0.11), anchor: "middle", fill: K18.muted, weight: 600 });
  const needle = H.el("g", { id: `${id}-needle` }, g);
  H.el("path", { d: `M ${f(cx - r * 0.17)} ${f(cy - r * 0.035)} L ${f(cx + r * 0.8)} ${f(cy - r * 0.008)} L ${f(cx + r * 0.8)} ${f(cy + r * 0.008)} L ${f(cx - r * 0.17)} ${f(cy + r * 0.035)} Z`, fill: K18.ink }, needle);
  H.el("circle", { cx, cy, r: f(r * 0.075), fill: K18.ink }, g);
  const origin = `${cx} ${cy}`;
  gsap.set(needle, { rotation: ang(o.value ?? min), svgOrigin: origin });
  let glass = null;
  if (o.glass !== false) {
    glass = H.el("g", { id: `${id}-glass` }, g);
    H.el("circle", { cx, cy, r: f(r * 0.9), fill: K18.glass, opacity: 0.2 }, glass);
    H.el("path", { d: H.arcD(cx, cy, r * 0.8, 196, 236), fill: "none", stroke: "#ffffff", "stroke-width": sw(0.045), "stroke-linecap": "round", opacity: 0.8 }, glass);
    H.el("path", { d: H.arcD(cx, cy, r * 0.68, 204, 222), fill: "none", stroke: "#ffffff", "stroke-width": sw(0.022), "stroke-linecap": "round", opacity: 0.7 }, glass);
    H.el("circle", { cx, cy, r: f(r * 0.95), fill: "none", stroke: K18.metal, "stroke-width": sw(0.1) }, glass);
    H.el("circle", { cx, cy, r, fill: "none", stroke: K18.ink, "stroke-width": sw(0.025) }, glass);
    H.el("circle", { cx, cy, r: f(r * 0.9), fill: "none", stroke: K18.ink, "stroke-width": sw(0.012) }, glass);
  }
  return { g, bands, needle, glass, ang, rot: ang, origin, cx, cy, r, br: r * 0.79, bw: r * 0.14, pt };
};

// Colour band (marker / tape) on the scale ring from v0 to v1. o: { id, parent, width, radius, opacity }
// Returns the path; `len` = arc length for a draw-on (strokeDasharray = len, strokeDashoffset len → 0).
H.g18Band = (D, v0, v1, color, o = {}) => {
  const rr = o.radius ?? D.br;
  const p = H.el("path", { ...(o.id ? { id: o.id } : {}), d: H.arcD(D.cx, D.cy, rr, D.ang(v0), D.ang(v1)), fill: "none", stroke: color, "stroke-width": H.f(o.width ?? D.bw), "stroke-linecap": "butt", opacity: o.opacity ?? 1 }, o.parent || D.bands);
  p.len = (rr * Math.abs(D.ang(v1) - D.ang(v0)) * Math.PI) / 180;
  return p;
};

// Draw a band on: dash from its start to its end between t and t + dur.
H.g18Draw = (p, t, dur) => {
  tl.fromTo(p, { strokeDasharray: H.f(p.len + 2), strokeDashoffset: H.f(p.len + 2) }, { strokeDashoffset: 0, duration: dur, ease: "none" }, t);
};

// Marker pen: tip on the band radius at 3 o'clock, body leaning back; rotate about the dial centre
// (svgOrigin = D.origin) so the tip runs along the band. Starts hidden.
H.g18Pen = (parent, D, color, id) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const x = D.cx + D.br, y = D.cy, k = D.r / 240;
  const body = H.el("g", { transform: `translate(${H.f(x)} ${H.f(y)}) rotate(-38) scale(${H.f(k)})` }, g);
  H.el("path", { d: "M 0 0 L 20 -9 L 20 9 Z", fill: color, stroke: K18.ink, "stroke-width": 3, "stroke-linejoin": "round" }, body);
  H.el("rect", { x: 20, y: -13, width: 14, height: 26, fill: K18.dark, stroke: K18.ink, "stroke-width": 3 }, body);
  H.el("rect", { x: 34, y: -17, width: 82, height: 34, rx: 6, fill: K18.paper, stroke: K18.ink, "stroke-width": 4 }, body);
  H.el("rect", { x: 92, y: -17, width: 30, height: 34, rx: 6, fill: color, stroke: K18.ink, "stroke-width": 4 }, body);
  return g;
};

// Pen writes a band: fade in, tip runs from v0 to v1 together with the draw-on, fade out.
H.g18Write = (pen, D, band, v0, v1, t, dur, first = true) => {
  tl.fromTo(pen, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: first }, t - 0.2);
  tl.fromTo(pen, { rotation: D.ang(v0), svgOrigin: D.origin }, { rotation: D.ang(v1), svgOrigin: D.origin, duration: dur, ease: "none", immediateRender: first }, t);
  H.g18Draw(band, t, dur);
  tl.fromTo(pen, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, t + dur + 0.05);
};

// Needle from v0 to v1.
H.g18Needle = (D, v0, v1, t, dur = 1, ease = "power2.inOut", first = true) =>
  tl.fromTo(D.needle, { rotation: D.ang(v0), svgOrigin: D.origin }, { rotation: D.ang(v1), svgOrigin: D.origin, duration: dur, ease, immediateRender: first }, t);

// Needle swinging between a and b from t until tEnd (finite repeats).
H.g18Swing = (D, a, b2, t, tEnd, half = 0.35) => {
  const n = Math.max(1, Math.floor((tEnd - t) / half) - 1);
  tl.fromTo(D.needle, { rotation: D.ang(a), svgOrigin: D.origin }, { rotation: D.ang(b2), svgOrigin: D.origin, duration: half, ease: "sine.inOut", yoyo: true, repeat: n, immediateRender: false }, t);
};

// Cross / check marks as paths (no glyphs).
H.g18Cross = (parent, x, y, r, o = {}) =>
  H.el("path", { d: `M ${H.f(x - r)} ${H.f(y - r)} L ${H.f(x + r)} ${H.f(y + r)} M ${H.f(x + r)} ${H.f(y - r)} L ${H.f(x - r)} ${H.f(y + r)}`, fill: "none", stroke: o.color || K18.red, "stroke-width": o.w ?? 9, "stroke-linecap": "round", opacity: o.opacity ?? 1 }, parent);
H.g18Check = (parent, x, y, r, o = {}) =>
  H.el("path", { d: `M ${H.f(x - r)} ${H.f(y)} L ${H.f(x - r * 0.3)} ${H.f(y + r * 0.7)} L ${H.f(x + r)} ${H.f(y - r * 0.7)}`, fill: "none", stroke: o.color || K18.green, "stroke-width": o.w ?? 10, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: o.opacity ?? 1 }, parent);

// Pulsing ring (finite).
H.g18Ring = (parent, x, y, r, color, t, n = 2, w = 6) => {
  const c = H.el("circle", { cx: H.f(x), cy: H.f(y), r: H.f(r), fill: "none", stroke: color, "stroke-width": w, opacity: 0 }, parent);
  tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t);
  tl.fromTo(c, { scale: 0.85, transformOrigin: "50% 50%" }, { scale: 1.12, transformOrigin: "50% 50%", duration: 0.3, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut" }, t);
  return c;
};

// Fade helper.
H.g18Op = (el, a, z, t, dur = 0.3, first = true) => tl.fromTo(el, { opacity: a }, { opacity: z, duration: dur, immediateRender: first }, t);

// Standard visual-control marking of the deck's example (set pressure 2–4 on a 0–6 scale):
// green 2–4 = normal, red 0–2 and 4–6 = abnormal, nothing beyond the scale ends.
H.g18Marked = (D) => ({
  green: H.g18Band(D, 2, 4, K18.green),
  red1: H.g18Band(D, 0, 2, K18.red),
  red2: H.g18Band(D, 4, 6, K18.red),
});
