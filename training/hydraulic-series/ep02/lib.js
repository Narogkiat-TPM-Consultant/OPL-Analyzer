// EP02 shared drawings: numbered tiles for the advantage / disadvantage grids, oil drop, flame.
// (hyd_lib.js is loaded first; names here must not clash with it — HC is taken.)
const E2 = { ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", card: "#fffdf8", line: "#d6cdb9", paper: "#f5f1e8", blue: "#1f5fbf", green: "#178a4e", red: "#d0233a", yellow: "#f2a900", oil: "#f2c94c", oilBg: "#fbe7a1", tube: "#dfe8f6", water: "#a9c8ee" };

// Numbered tile (rounded card + blue number badge + short title). Returns { g, rect }.
H.tile = (parent, id, x, y, w, h, n, title) => {
  const g = H.el("g", { id }, parent);
  const rect = H.el("rect", { id: id + "-r", x, y, width: w, height: h, rx: 20, fill: E2.card, stroke: E2.line, "stroke-width": 4 }, g);
  H.el("circle", { cx: x + 34, cy: y + 36, r: 21, fill: E2.blue }, g);
  H.text(g, x + 34, y + 45, String(n), { size: 26, fill: "#ffffff", anchor: "middle" });
  H.text(g, x + 66, y + 46, title, { size: 27 });
  return { g, rect };
};

// Light tile k up with its numbered point; a blue frame marks the tile being spoken about.
H.tileOn = (t, at, offAt) => {
  tl.fromTo(t.g, { opacity: 0.28 }, { opacity: 1, duration: 0.35 }, at);
  tl.fromTo(t.rect, { attr: { stroke: E2.line } }, { attr: { stroke: E2.blue }, duration: 0.25 }, at);
  if (offAt != null) tl.fromTo(t.rect, { attr: { stroke: E2.blue } }, { attr: { stroke: E2.line }, duration: 0.25, immediateRender: false }, offAt);
};

// Length of narration segment k (1-based) of a scene, from its cue times (0.3 s gap, 0.8 s tail).
H.segLen = (cues, D, k) => (k < cues.length ? cues[k] - cues[k - 1] - 0.3 : D - 0.8 - cues[k - 1]);

// Oil drop, tip up, centred on (cx, cy), size s.
H.dropD = (cx, cy, s) => {
  const f = H.f;
  return `M ${f(cx)} ${f(cy - 1.5 * s)} C ${f(cx + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx + s)} ${f(cy - 0.3 * s)} ${f(cx + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(cx - s)} ${f(cy + 0.25 * s)} C ${f(cx - s)} ${f(cy - 0.3 * s)} ${f(cx - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx)} ${f(cy - 1.5 * s)} Z`;
};

// Flame standing on (cx, by), height ≈ 2.4 s.
H.flameD = (cx, by, s) => {
  const f = H.f;
  return `M ${f(cx)} ${f(by)} C ${f(cx - 1.15 * s)} ${f(by)} ${f(cx - 1.2 * s)} ${f(by - 1.1 * s)} ${f(cx - 0.55 * s)} ${f(by - 1.75 * s)} ` +
    `C ${f(cx - 0.5 * s)} ${f(by - 1.2 * s)} ${f(cx - 0.2 * s)} ${f(by - 1.05 * s)} ${f(cx - 0.05 * s)} ${f(by - 2.4 * s)} ` +
    `C ${f(cx + 0.35 * s)} ${f(by - 1.8 * s)} ${f(cx + 1.2 * s)} ${f(by - 1.45 * s)} ${f(cx + 0.95 * s)} ${f(by - 0.6 * s)} ` +
    `C ${f(cx + 0.85 * s)} ${f(by - 0.15 * s)} ${f(cx + 0.45 * s)} ${f(by)} ${f(cx)} ${f(by)} Z`;
};

// Zig-zag spring between y0 (top) and y1 (bottom) around x = cx; same command list for any length (morphable).
H.springD = (cx, y0, y1, w = 14, n = 6) => {
  const f = H.f, step = (y1 - y0) / (2 * n);
  let d = `M ${f(cx)} ${f(y0)}`;
  for (let i = 1; i < 2 * n; i++) d += ` L ${f(cx + (i % 2 ? w : -w))} ${f(y0 + i * step)}`;
  return d + ` L ${f(cx)} ${f(y1)}`;
};
