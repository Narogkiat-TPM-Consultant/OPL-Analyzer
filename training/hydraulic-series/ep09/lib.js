// EP09 — Oil leak loss (OPL 5-B-1, p.13): drawings shared by the title, phenomenon, HFI and judgment scenes.
// hyd_lib.js is loaded first; names here must not clash with it (HC, H.hyd* are taken).

const E9 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", hose: "#3b4048", card: "#fffdf8",
  line: "#d6cdb9", paper: "#f5f1e8", blue: "#1f5fbf", green: "#178a4e", red: "#d0233a", yellow: "#f2a900",
  oil: "#f2c94c", oilBg: "#fbe7a1", oilDk: "#c99a1c", water: "#dfe8f6",
};

// Oil drop hanging from a nozzle: tip at (x, y), body radius s. Total height = 2.75 s, width = 2 s.
H.e9DropD = (x, y, s) => {
  const f = H.f, cy = y + 1.5 * s;
  return `M ${f(x)} ${f(y)} C ${f(x + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x + s)} ${f(cy - 0.3 * s)} ${f(x + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(cy + 0.25 * s)} C ${f(x - s)} ${f(cy - 0.3 * s)} ${f(x - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x)} ${f(y)} Z`;
};
H.e9Drop = (parent, x, y, s, o = {}) =>
  H.el("path", { d: H.e9DropD(x, y, s), fill: E9.oil, stroke: E9.ink, "stroke-width": o.sw ?? Math.max(2, s * 0.22), ...(o.id ? { id: o.id } : {}), ...(o.cls ? { class: o.cls } : {}) }, parent);

// Side view of a pressure line: steel pipe from the left, union fitting (two hex nuts) centred on fx,
// crimped hose to the right. k = scale (1 → nuts 72 units tall). Returns { g, drip: [x, y] } where the
// drip point is the underside of the left nut, the usual weeping spot.
H.e9Line = (parent, x0, x1, y, fx, o = {}) => {
  const k = o.k ?? 1, f = H.f, sw = Math.max(3, 4 * k);
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const R = (xa, xb, half, fill, extra = {}) =>
    H.el("rect", { x: f(xa), y: f(y - half), width: f(xb - xa), height: f(2 * half), rx: f(3 * k), fill, stroke: E9.ink, "stroke-width": f(sw), ...extra }, g);
  // pipe and hose first, fitting on top
  R(x0, fx - 70 * k, 13 * k, E9.metal, { rx: 0 });
  H.el("line", { x1: f(x0), y1: f(y - 5 * k), x2: f(fx - 72 * k), y2: f(y - 5 * k), stroke: "#ffffff", "stroke-width": f(3 * k), opacity: 0.6 }, g);
  R(fx + 128 * k, x1, 19 * k, E9.hose, { rx: 0 });
  for (let x = fx + 150 * k; x < x1 - 10 * k; x += 26 * k)
    H.el("line", { x1: f(x), y1: f(y - 17 * k), x2: f(x + 12 * k), y2: f(y + 17 * k), stroke: "#59606a", "stroke-width": f(2 * k) }, g);
  R(fx + 74 * k, fx + 130 * k, 25 * k, E9.dark);
  for (const dx of [88, 102, 116]) H.el("line", { x1: f(fx + dx * k), y1: f(y - 25 * k), x2: f(fx + dx * k), y2: f(y + 25 * k), stroke: E9.ink, "stroke-width": f(1.6 * k), opacity: 0.55 }, g);
  // union: nut | body | nut (side view: hex facets as two vertical lines per nut)
  const nut = (xa) => {
    R(xa, xa + 50 * k, 36 * k, E9.metal);
    for (const t of [0.27, 0.73]) H.el("line", { x1: f(xa + 50 * k * t), y1: f(y - 36 * k), x2: f(xa + 50 * k * t), y2: f(y + 36 * k), stroke: E9.ink, "stroke-width": f(1.8 * k), opacity: 0.6 }, g);
  };
  R(fx - 26 * k, fx + 26 * k, 26 * k, E9.dark);
  nut(fx - 76 * k);
  nut(fx + 26 * k);
  if (o.wet) H.el("path", { d: `M ${f(fx - 72 * k)} ${f(y + 36 * k)} Q ${f(fx - 51 * k)} ${f(y + 44 * k)} ${f(fx - 30 * k)} ${f(y + 36 * k)}`, fill: E9.oil, stroke: E9.oilDk, "stroke-width": f(2 * k) }, g);
  return { g, drip: [fx - 51 * k, y + 36 * k] };
};

// Floor strip with an oil puddle (ellipse) centred on cx. Returns the puddle element.
H.e9Floor = (parent, x0, x1, y, cx, o = {}) => {
  H.el("rect", { x: x0, y, width: x1 - x0, height: o.h ?? 14, fill: "#e6dfd0" }, parent);
  H.el("line", { x1: x0, y1: y, x2: x1, y2: y, stroke: E9.ink, "stroke-width": o.sw ?? 5 }, parent);
  return H.el("ellipse", { cx, cy: y, rx: o.rx ?? 40, ry: o.ry ?? 9, fill: E9.oil, stroke: E9.oilDk, "stroke-width": 3, ...(o.id ? { id: o.id } : {}) }, parent);
};

// Top-up oil can (jerrycan) with its bottom-left corner at (x, y + h). Returns the group.
H.e9Can = (parent, x, y, w, h, o = {}) => {
  const f = H.f, g = H.el("g", o.id ? { id: o.id } : {}, parent);
  H.el("path", { d: `M ${f(x + 0.12 * w)} ${f(y + 0.24 * h)} L ${f(x)} ${f(y + 0.02 * h)} L ${f(x + 0.12 * w)} ${f(y)} L ${f(x + 0.3 * w)} ${f(y + 0.2 * h)} Z`, fill: E9.dark, stroke: E9.ink, "stroke-width": 2.5 }, g);
  H.el("rect", { x: f(x + 0.08 * w), y: f(y + 0.18 * h), width: f(0.92 * w), height: f(0.82 * h), rx: f(0.1 * w), fill: E9.oil, stroke: E9.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: f(x + 0.55 * w), y: f(y + 0.06 * h), width: f(0.34 * w), height: f(0.16 * h), rx: f(0.05 * w), fill: "none", stroke: E9.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: f(x + 0.24 * w), y: f(y + 0.45 * h), width: f(0.6 * w), height: f(0.34 * h), rx: 3, fill: E9.card, opacity: 0.85 }, g);
  return g;
};

// Oil tank with oil up to `level` (0–1) and a sight gauge on the right.
H.e9Tank = (parent, x, y, w, h, level, o = {}) => {
  const f = H.f, g = H.el("g", o.id ? { id: o.id } : {}, parent);
  H.el("rect", { x, y, width: w, height: h, rx: 8, fill: E9.oilBg, stroke: E9.ink, "stroke-width": 5 }, g);
  const oy = y + h * (1 - level);
  H.el("rect", { x: x + 5, y: f(oy), width: w - 10, height: f(y + h - 5 - oy), fill: E9.oil }, g);
  H.el("rect", { x: x + w - 46, y: y + 20, width: 22, height: h - 40, rx: 6, fill: E9.card, stroke: E9.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: x + w - 43, y: f(Math.max(oy, y + 23)), width: 16, height: f(y + h - 23 - Math.max(oy, y + 23)), fill: E9.oilDk }, g);
  H.el("rect", { x: x + 0.3 * w, y: y - 16, width: 0.24 * w, height: 16, rx: 3, fill: E9.dark, stroke: E9.ink, "stroke-width": 3 }, g);
  return g;
};

// Drops falling from a nozzle at (x, y) to y + dist: a new drop every `period` s from t0 until t1.
// Each drop swells at the nozzle, then falls (fall s). Several drop elements cycle when period < fall.
H.e9Drip = (parent, x, y, s, dist, period, t0, t1, o = {}) => {
  const fall = o.fall ?? 0.5;
  const n = Math.max(1, Math.ceil((fall + 0.05) / period));
  const cycle = n * period, grow = cycle - fall;
  const els = [];
  for (let i = 0; i < n; i++) {
    const d = H.e9Drop(parent, x, y, s, { sw: o.sw });
    els.push(d);
    const start = t0 + i * period;
    const reps = Math.ceil((t1 - start) / cycle) - 1;
    if (reps < 0) { d.setAttribute("opacity", 0); continue; }
    const sub = gsap.timeline({ repeat: reps });
    sub.fromTo(d, { scale: 0.25, y: 0, opacity: 1, svgOrigin: `${x} ${y}` }, { scale: 1, svgOrigin: `${x} ${y}`, duration: grow, ease: "power1.in" });
    sub.to(d, { y: dist, opacity: o.endOpacity ?? 0, duration: fall, ease: "power2.in" });
    tl.add(sub, start);
  }
  return els;
};
