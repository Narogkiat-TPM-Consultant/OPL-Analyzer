// EP20 — hydraulic cylinder: structure & simple inspection (OPL 5-C-10, PDF p.31).
// Drawings shared by the title, method and judgment scenes. Style and helpers follow EP07
// (cylinder & cushion) so the two episodes pair. hyd_lib.js is loaded first (HC, H.hyd* are taken);
// everything here is prefixed C20 / H.c20*.

const C20 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", steel: "#b3b9c1",
  blue: "#1f5fbf", oil: "#f2c94c", oilBg: "#fbe7a1", oilDk: "#b98a00", paper: "#fffdf8",
  red: "#d0233a", green: "#178a4e", tube: "#dfe8f6", yellow: "#f2a900", rubber: "#2b2f35",
  grime: "#7d6b4f", rag: "#f4f6fb",
};

// Text label with a paper halo, optional leader line ending in a dot. o: { id, size, anchor, fill, line: [x1,y1,x2,y2] }
H.c20Label = (parent, x, y, str, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  if (o.line) {
    const [x1, y1, x2, y2] = o.line;
    H.el("line", { x1, y1, x2, y2, stroke: o.lineColor || C20.ink, "stroke-width": 3 }, g);
    H.el("circle", { cx: x2, cy: y2, r: 5.5, fill: o.lineColor || C20.ink }, g);
  }
  const t = H.text(g, x, y, str, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || C20.ink });
  t.setAttribute("stroke", C20.paper);
  t.setAttribute("stroke-width", 7);
  t.setAttribute("stroke-linejoin", "round");
  t.setAttribute("paint-order", "stroke");
  return g;
};

// Number in a filled circle (check point 1–4).
H.c20Badge = (parent, x, y, n, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const r = o.r || 20;
  H.el("circle", { cx: x, cy: y, r, fill: o.color || C20.blue, stroke: C20.paper, "stroke-width": 4 }, g);
  H.text(g, x, y + r * 0.42, String(n), { size: Math.round(r * 1.25), anchor: "middle", fill: "#ffffff" });
  return g;
};

// Filled arrowhead pointing from (x1,y1) towards (x2,y2), tip at (x2,y2).
H.c20HeadD = (x1, y1, x2, y2, h = 22) => {
  const a = Math.atan2(y2 - y1, x2 - x1), f = H.f;
  const p = (da) => `${f(x2 - h * Math.cos(a + da))} ${f(y2 - h * Math.sin(a + da))}`;
  return `M ${p(0.5)} L ${f(x2)} ${f(y2)} L ${p(-0.5)} Z`;
};

// Oil-flow dashes (white on a blue pipe, or blue in a passage). Starts hidden; returns { g, path, period }.
H.c20Flow = (parent, id, d, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const path = H.el("path", { d, fill: "none", stroke: o.color || "#ffffff", "stroke-width": o.w || 5, "stroke-dasharray": o.dash || "10 14", "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
  return { g, path, period: o.period || 24 };
};
// Run a flow from t for dur seconds (whole dash periods → seamless).
H.c20Run = (F, t, dur, speed = 120) => {
  const n = Math.max(1, Math.round((speed * dur) / F.period));
  tl.fromTo(F.g, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, t);
  tl.fromTo(F.path, { strokeDashoffset: 0 }, { strokeDashoffset: -n * F.period, duration: dur, ease: "none", immediateRender: false }, t);
  tl.to(F.g, { opacity: 0, duration: 0.25 }, t + dur - 0.25);
};

// Oil drop hanging from (x, y) (tip), body radius s (as EP09).
H.c20DropD = (x, y, s) => {
  const f = H.f, cy = y + 1.5 * s;
  return `M ${f(x)} ${f(y)} C ${f(x + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x + s)} ${f(cy - 0.3 * s)} ${f(x + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(cy + 0.25 * s)} C ${f(x - s)} ${f(cy - 0.3 * s)} ${f(x - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x)} ${f(y)} Z`;
};

// Hex nut / bolt head seen from the side: rect + two facet lines. axis "h" (tie-rod nut, facets run
// along x) or "v" (fitting nut, facets run along y).
H.c20Nut = (parent, x, y, w, h, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  H.el("rect", { x, y, width: w, height: h, rx: 2, fill: o.fill || C20.metal, stroke: C20.ink, "stroke-width": o.sw ?? 3 }, g);
  for (const t of [0.27, 0.73]) {
    const ln = o.axis === "v"
      ? { x1: H.f(x + w * t), y1: y, x2: H.f(x + w * t), y2: y + h }
      : { x1: x, y1: H.f(y + h * t), x2: x + w, y2: H.f(y + h * t) };
    H.el("line", { ...ln, stroke: C20.ink, "stroke-width": Math.max(1.5, (o.sw ?? 3) * 0.6), opacity: 0.55 }, g);
  }
  return g;
};

// Sparkle (4-point star) — "shines like a mirror".
H.c20Spark = (parent, x, y, r, o = {}) => {
  const f = H.f, q = r * 0.22;
  return H.el("path", {
    ...(o.id ? { id: o.id } : {}),
    d: `M ${f(x)} ${f(y - r)} Q ${f(x + q)} ${f(y - q)} ${f(x + r)} ${f(y)} Q ${f(x + q)} ${f(y + q)} ${f(x)} ${f(y + r)} Q ${f(x - q)} ${f(y + q)} ${f(x - r)} ${f(y)} Q ${f(x - q)} ${f(y - q)} ${f(x)} ${f(y - r)} Z`,
    fill: "#ffffff", stroke: C20.yellow, "stroke-width": o.sw ?? 2.5, opacity: o.opacity ?? 0,
  }, parent);
};

// Light gleam on a rod: a clip rect (x, y, w, h) in `parent` coordinates and a slanted white band inside.
// Sweep it with tl.fromTo(band, { x: 0, opacity: 0.9 }, { x: w + 60, … }).
H.c20Gleam = (parent, id, x, y, w, h) => {
  const svg = (typeof parent === "string" ? H.$(parent) : parent).ownerSVGElement;
  const defs = H.el("defs", {}, svg);
  const clip = H.el("clipPath", { id }, defs);
  H.el("rect", { x, y, width: w, height: h }, clip);
  const g = H.el("g", { "clip-path": `url(#${id})` }, parent);
  const f = H.f, k = h * 0.5;
  const band = H.el("path", { d: `M ${f(x - 30)} ${f(y - 2)} L ${f(x - 6)} ${f(y - 2)} L ${f(x - 6 - k)} ${f(y + h + 2)} L ${f(x - 30 - k)} ${f(y + h + 2)} Z`, fill: "#ffffff", opacity: 0 }, g);
  const band2 = H.el("path", { d: `M ${f(x + 2)} ${f(y - 2)} L ${f(x + 10)} ${f(y - 2)} L ${f(x + 10 - k)} ${f(y + h + 2)} L ${f(x + 2 - k)} ${f(y + h + 2)} Z`, fill: "#ffffff", opacity: 0 }, g);
  return { g, band: [band, band2], span: w + 60 + k };
};

// ---------------------------------------------------------------- external view of a tie-rod cylinder
// Side view, rod to the right. Local units: cap cover x 0–70, tube 70–390, rod cover 390–460, centre
// line y = 0; covers ±110, tube ±80, tie rods at ±92, rod Ø36. The rod is one long rigid body whose hidden
// part sits behind the tube, so stroking = moving the `rod` group in x.
// o: { id, x, y, s, rod (visible rod length), pipeTop, feet, grime }
// → { g, rod, gleam, x1 (rod end), nuts, fits, bolts, grime: [{el, x}], at(x, y) → parent coords }
H.c20Ext = (parent, o = {}) => {
  const id = o.id || "c20x", s = o.s ?? 1, ox = o.x ?? 0, oy = o.y ?? 0;
  const g = H.el("g", { id, transform: `translate(${ox} ${oy}) scale(${s})` }, parent);
  const R = (par, x, y, w, h, fill, extra = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: C20.ink, "stroke-width": 4, ...extra }, par);
  const rodLen = o.rod ?? 220, top = o.pipeTop ?? -230, x1 = 460 + rodLen;

  // pressure pipes to the two ports (behind everything)
  for (const x of [35, 425]) H.el("path", { d: `M ${x} -130 L ${x} ${top}`, stroke: C20.blue, "stroke-width": 16, fill: "none" }, g);

  // rod (+ rod eye), drawn first so the tube and covers hide its inner part
  const rod = H.el("g", { id: id + "-rod" }, g);
  R(rod, 60, -18, x1 - 60, 36, C20.steel, { "stroke-width": 3.5 });
  H.el("rect", { x: 62, y: -12, width: x1 - 64, height: 6, fill: "#ffffff", opacity: 0.6 }, rod);
  R(rod, x1, -13, 18, 26, C20.dark, { "stroke-width": 3.5 });
  H.el("circle", { cx: x1 + 40, cy: 0, r: 26, fill: C20.dark, stroke: C20.ink, "stroke-width": 4 }, rod);
  H.el("circle", { cx: x1 + 40, cy: 0, r: 9, fill: C20.paper, stroke: C20.ink, "stroke-width": 3 }, rod);
  const gleam = H.c20Gleam(rod, id + "-clip", 62, -16, x1 - 64, 32);

  // feet + mounting bolts
  const bolts = [];
  if (o.feet !== false) {
    for (const x0 of [6, 396]) {
      R(g, x0, 108, 58, 16, C20.metal, { "stroke-width": 3.5 });
      R(g, x0 - 22, 122, 102, 16, C20.metal, { "stroke-width": 3.5 });
      for (const bx of [x0 - 17, x0 + 61]) { H.c20Nut(g, bx, 108, 14, 14, { axis: "v", sw: 2.5, fill: C20.dark }); bolts.push([bx + 7, 115]); }
    }
  }

  // tube, tie rods, covers
  R(g, 70, -80, 320, 160, C20.tube);
  H.el("line", { x1: 76, y1: -54, x2: 384, y2: -54, stroke: "#ffffff", "stroke-width": 8, opacity: 0.75 }, g);
  for (const y of [-92, 92]) R(g, -27, y - 5, 514, 10, C20.dark, { "stroke-width": 3 });
  R(g, 0, -110, 70, 220, C20.metal, { rx: 6 });
  R(g, 390, -110, 70, 220, C20.metal, { rx: 6 });

  // tie-rod nuts on the outer faces, port fittings, dust seal where the rod leaves the rod cover
  const nuts = [];
  for (const x of [-20, 460]) for (const y of [-92, 92]) { H.c20Nut(g, x, y - 15, 20, 30); nuts.push([x + 10, y]); }
  const fits = [];
  for (const x of [35, 425]) { H.c20Nut(g, x - 18, -134, 36, 24, { axis: "v" }); fits.push([x, -122]); }
  R(g, 458, -25, 12, 50, C20.rubber, { rx: 4, "stroke-width": 3 });

  // dirt (for the wipe-first step)
  const grime = [];
  if (o.grime) {
    const spots = [[22, -66, 13], [40, 34, 10], [104, -46, 16], [150, 44, 12], [196, -22, 15], [238, 58, 11], [282, -58, 14],
      [322, 14, 13], [362, 50, 15], [414, -78, 12], [430, 36, 14], [124, 6, 10], [300, -30, 11], [222, 22, 12], [60, -2, 9], [176, -62, 9]];
    spots.forEach(([x, y, r], i) => {
      const el = H.el("ellipse", { cx: x, cy: y, rx: r, ry: H.f(r * 0.62), fill: C20.grime, opacity: 0.6, transform: `rotate(${(i * 37) % 50 - 25} ${x} ${y})` }, g);
      grime.push({ el, x });
    });
  }
  return { g, rod, gleam, x1, nuts, fits, bolts, grime, s, at: (x, y) => [ox + s * x, oy + s * y] };
};

// ---------------------------------------------------------------- dust seal seen end-on (rod cover face)
// Square cover face with 4 tie-rod nuts, the black dust-seal ring and the rod end. k = scale (1 → face 144).
// → { g, tear (group, hidden), ring } — show `tear` for the NG state (torn piece + crack + dust).
H.c20SealFace = (parent, cx, cy, k = 1, o = {}) => {
  const f = H.f, g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const a = 72 * k;
  H.el("rect", { x: f(cx - a), y: f(cy - a), width: f(2 * a), height: f(2 * a), rx: f(10 * k), fill: C20.metal, stroke: C20.ink, "stroke-width": f(4 * k) }, g);
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
    H.el("path", { d: H.hexD(cx + dx * 52 * k, cy + dy * 52 * k, 12 * k), fill: C20.dark, stroke: C20.ink, "stroke-width": f(3 * k) }, g);
  const ring = H.el("circle", { cx, cy, r: f(40 * k), fill: "none", stroke: C20.rubber, "stroke-width": f(16 * k) }, g);
  H.el("circle", { cx, cy, r: f(31 * k), fill: C20.steel, stroke: C20.ink, "stroke-width": f(3 * k) }, g);
  H.el("path", { d: H.arcD(cx, cy, 24 * k, 200, 300), fill: "none", stroke: "#ffffff", "stroke-width": f(5 * k), opacity: 0.8 }, g);
  H.el("circle", { cx, cy, r: f(9 * k), fill: C20.dark, stroke: C20.ink, "stroke-width": f(2.5 * k) }, g);
  // NG: a torn-out piece of the lip (cover colour shows through), jagged edges, dust going in
  const tear = H.el("g", { opacity: 0, ...(o.id ? { id: o.id + "-tear" } : {}) }, g);
  H.el("path", { d: H.arcD(cx, cy, 40 * k, -78, -30), fill: "none", stroke: C20.metal, "stroke-width": f(18 * k) }, tear);
  const P = (deg, r) => [cx + r * k * Math.cos((deg * Math.PI) / 180), cy + r * k * Math.sin((deg * Math.PI) / 180)];
  for (const [d0, s] of [[-78, 1], [-30, -1]]) {
    const p = [P(d0, 32), P(d0 + 6 * s, 36), P(d0 - 2 * s, 40), P(d0 + 7 * s, 44), P(d0, 48)];
    H.el("path", { d: "M " + p.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L "), fill: "none", stroke: C20.ink, "stroke-width": f(3 * k), "stroke-linejoin": "round" }, tear);
  }
  const crack = [P(-12, 48), P(-6, 44), P(-12, 40), P(-4, 35)];
  H.el("path", { d: "M " + crack.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L "), fill: "none", stroke: C20.paper, "stroke-width": f(2.5 * k) }, tear);
  for (const [deg, r, rr] of [[-60, 56, 4], [-46, 62, 3.2], [-68, 66, 3], [-52, 46, 3]]) {
    const [x, y] = P(deg, r);
    H.el("circle", { cx: f(x), cy: f(y), r: f(rr * k), fill: C20.grime }, tear);
  }
  return { g, tear, ring };
};

// ---------------------------------------------------------------- judgment card visuals (viewBox 340 × 190)
// Each returns { ng: [elements shown/animated for the NG state], … }.

// Rod-cover end: port fitting on top, dust seal where the rod leaves. NG = oil at the fitting and the seal.
H.c20CardLeak = (parent, ng) => {
  const g = typeof parent === "string" ? H.$(parent) : parent;
  const R = (x, y, w, h, fill, extra = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: C20.ink, "stroke-width": 3.5, ...extra }, g);
  H.el("path", { d: "M 108 30 L 108 10", stroke: C20.blue, "stroke-width": 14, fill: "none" }, g);
  R(14, 66, 52, 96, C20.tube);
  R(152, 94, 176, 34, C20.steel, { "stroke-width": 3 });
  H.el("rect", { x: 154, y: 100, width: 172, height: 5, fill: "#ffffff", opacity: 0.6 }, g);
  R(62, 50, 92, 124, C20.metal, { rx: 6 });
  H.c20Nut(g, 90, 30, 36, 20, { axis: "v" });
  R(150, 88, 11, 46, C20.rubber, { rx: 3, "stroke-width": 2.5 });
  const out = { ng: [] };
  if (ng) {
    const wet = H.el("g", { opacity: 0 }, g);
    H.el("path", { d: "M 92 50 L 124 50 Q 120 66 113 80 Q 108 90 103 80 Q 96 66 92 50 Z", fill: C20.oil, stroke: C20.oilDk, "stroke-width": 2.5 }, wet);
    H.el("path", { d: "M 161 128 Q 180 138 204 129 L 204 128 Z", fill: C20.oil, stroke: C20.oilDk, "stroke-width": 2.5 }, wet);
    H.el("path", { d: "M 150 134 L 161 134 Q 160 150 156 160 Q 153 166 151 160 Q 149 150 150 134 Z", fill: C20.oil, stroke: C20.oilDk, "stroke-width": 2.5 }, wet);
    const drop = H.el("path", { d: H.c20DropD(184, 134, 6), fill: C20.oil, stroke: C20.ink, "stroke-width": 2, opacity: 0 }, g);
    const rings = H.el("g", { opacity: 0 }, g);
    H.el("circle", { cx: 108, cy: 56, r: 32, fill: "none", stroke: C20.red, "stroke-width": 5 }, rings);
    H.el("ellipse", { cx: 166, cy: 128, rx: 38, ry: 42, fill: "none", stroke: C20.red, "stroke-width": 5 }, rings);
    out.ng = [wet, rings];
    out.wet = wet; out.drop = drop; out.rings = rings;
  }
  return out;
};

// Tie-rod nut on the cover face. NG = nut backed off, gap on the thread.
H.c20CardNut = (parent, ng) => {
  const g = typeof parent === "string" ? H.$(parent) : parent;
  H.el("rect", { x: 22, y: 18, width: 148, height: 156, rx: 6, fill: C20.metal, stroke: C20.ink, "stroke-width": 3.5 }, g);
  H.el("rect", { x: 170, y: 82, width: 154, height: 26, fill: C20.dark, stroke: C20.ink, "stroke-width": 3 }, g);
  for (let x = 176; x < 318; x += 10) H.el("line", { x1: x, y1: 84, x2: x + 6, y2: 106, stroke: C20.ink, "stroke-width": 1.6, opacity: 0.55 }, g);
  const nut = H.el("g", {}, g);
  H.c20Nut(nut, 170, 60, 46, 70, { sw: 3.5 });
  const out = { nut };
  if (ng) {
    out.ring = H.el("circle", { cx: 196, cy: 95, r: 50, fill: "none", stroke: C20.red, "stroke-width": 5, opacity: 0 }, g);
    out.gap = H.el("path", { d: H.dimD(172, 148, 194, 148, 8), fill: "none", stroke: C20.red, "stroke-width": 3, opacity: 0 }, g);
  }
  return out;
};

// A length of rod coming out of the rod cover. OK = mirror shine; NG = scratches, dull.
H.c20CardRod = (parent, ng, id) => {
  const g = typeof parent === "string" ? H.$(parent) : parent;
  H.el("rect", { x: 14, y: 26, width: 62, height: 138, rx: 6, fill: C20.metal, stroke: C20.ink, "stroke-width": 3.5 }, g);
  H.el("rect", { x: 80, y: 76, width: 248, height: 38, fill: C20.steel, stroke: C20.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: 82, y: 82, width: 244, height: 6, fill: "#ffffff", opacity: 0.6 }, g);
  H.el("rect", { x: 74, y: 68, width: 11, height: 54, rx: 3, fill: C20.rubber, stroke: C20.ink, "stroke-width": 2.5 }, g);
  const out = {};
  if (!ng) {
    out.gleam = H.c20Gleam(g, id + "-clip", 86, 78, 240, 34);
    out.sparks = [H.c20Spark(g, 150, 80, 15), H.c20Spark(g, 262, 92, 12)];
  } else {
    out.dull = H.el("rect", { x: 82, y: 78, width: 244, height: 34, fill: "#6d747d", opacity: 0 }, g);
    out.scr = [[118, 90, 176, 93], [150, 101, 232, 105], [196, 86, 246, 88], [214, 107, 292, 110], [262, 96, 306, 98]]
      .map(([xa, ya, xb, yb]) => H.el("path", { d: `M ${xa} ${ya} L ${xb} ${yb}`, fill: "none", stroke: C20.ink, "stroke-width": 3, "stroke-linecap": "butt" }, g));
    out.ring = H.el("ellipse", { cx: 212, cy: 98, rx: 108, ry: 44, fill: "none", stroke: C20.red, "stroke-width": 5, opacity: 0 }, g);
  }
  return out;
};
