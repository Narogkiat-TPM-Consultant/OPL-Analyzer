// EP07 — hydraulic cylinder & cushion: shared helpers for this episode's scenes
// (palette, labels with leader lines, letter badges, oil-flow dashes, arrowheads, springs).

const C7 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", steel: "#b3b9c1",
  blue: "#1f5fbf", oil: "#fbe7a1", paper: "#fffdf8", paper2: "#ebe5d6",
  red: "#d0233a", green: "#178a4e", tube: "#dfe8f6", yellow: "#f2a900",
};

// Text label (white halo for legibility over drawings), optional leader line ending in a dot.
// o: { id, size, anchor, fill, line: [x1, y1, x2, y2] }
H.c7Label = (parent, x, y, str, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  if (o.line) {
    const [x1, y1, x2, y2] = o.line;
    H.el("line", { x1, y1, x2, y2, stroke: C7.ink, "stroke-width": 3 }, g);
    H.el("circle", { cx: x2, cy: y2, r: 5.5, fill: C7.ink }, g);
  }
  const t = H.text(g, x, y, str, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || C7.ink });
  t.setAttribute("stroke", C7.paper);
  t.setAttribute("stroke-width", 7);
  t.setAttribute("stroke-linejoin", "round");
  t.setAttribute("paint-order", "stroke");
  return g;
};

// Letter in a circle (chamber / passage names A–E of the OPL figure).
H.c7Badge = (parent, x, y, s, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const r = o.r || 22;
  H.el("circle", { cx: x, cy: y, r, fill: o.bg || C7.paper, stroke: o.color || C7.ink, "stroke-width": 4 }, g);
  H.text(g, x, y + r * 0.45, s, { size: Math.round(r * 1.3), anchor: "middle", fill: o.color || C7.ink });
  return g;
};

// Filled arrowhead pointing from (x1,y1) towards (x2,y2), tip at (x2,y2).
H.c7HeadD = (x1, y1, x2, y2, h = 22) => {
  const a = Math.atan2(y2 - y1, x2 - x1), f = H.f;
  const p = (da) => `${f(x2 - h * Math.cos(a + da))} ${f(y2 - h * Math.sin(a + da))}`;
  return `M ${p(0.5)} L ${f(x2)} ${f(y2)} L ${p(-0.5)} Z`;
};

// Oil-flow group: dashed path (+ optional arrowhead). Starts hidden; returns { g, path }.
// o: { w, dash, period, color, head: [x1, y1, x2, y2], headSize }
H.c7Flow = (parent, id, d, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const path = H.el("path", { id: id + "-d", d, fill: "none", stroke: o.color || C7.blue, "stroke-width": o.w || 8, "stroke-dasharray": o.dash || "16 14", "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
  if (o.head) H.el("path", { d: H.c7HeadD(...o.head, o.headSize || 24), fill: o.color || C7.blue }, g);
  return { g, path, period: o.period || 30 };
};

// Show a flow from t for dur seconds; dashes run at `speed` units/s (whole periods → seamless).
H.c7Run = (F, t, dur, speed = 150, fadeOut = true) => {
  const n = Math.max(1, Math.round((speed * dur) / F.period));
  tl.fromTo(F.g, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
  tl.fromTo(F.path, { strokeDashoffset: 0 }, { strokeDashoffset: -n * F.period, duration: dur, ease: "none" }, t);
  if (fadeOut) tl.to(F.g, { opacity: 0, duration: 0.3 }, t + dur - 0.3);
};

// Zig-zag spring between y0 (top) and y1 (bottom) at centre x, half-width w — same command list for any
// y0/y1, so attr:{d} can be tweened (compress / extend).
H.c7SpringD = (x, y0, y1, w = 9, n = 6) => {
  const f = H.f, step = (y1 - y0) / (2 * n);
  let d = `M ${f(x)} ${f(y0)}`;
  for (let i = 1; i <= 2 * n; i++) d += ` L ${f(x + (i === 2 * n ? 0 : i % 2 ? w : -w))} ${f(y0 + i * step)}`;
  return d;
};
