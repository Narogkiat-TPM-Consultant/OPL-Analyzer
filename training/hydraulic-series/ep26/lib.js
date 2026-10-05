// EP26 — contaminants in compressed air + drain: drawings shared by s1–s5.
// Part D (pneumatic) shared colours: air-flow dashes #2a8fc9 on pipes #1f5fbf, compressed-air tint #dff1fb,
// water/drain #3b7dd8, oil mist #f2c94c, dirt/rust #7a5c3a, metal #c9c1ae / #9aa1aa, bowls #eef6fb.
// (hyd_lib.js is loaded first; HC is taken there, so this file uses P26.)

const P26 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", card: "#fffdf8", line: "#d6cdb9",
  paper: "#f5f1e8", pipe: "#1f5fbf", flow: "#2a8fc9", air: "#dff1fb", water: "#3b7dd8", oil: "#f2c94c",
  oilDk: "#b8860b", rust: "#7a5c3a", bowl: "#eef6fb", red: "#d0233a", green: "#178a4e", yellow: "#f2a900",
  body: "#ebe6db", hatch: "#b7ac94",
};

// Water drop, tip up, centred on (cx, cy), size s (≈ 2.5 s tall).
P26.dropD = (cx, cy, s) => {
  const f = H.f;
  return `M ${f(cx)} ${f(cy - 1.5 * s)} C ${f(cx + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx + s)} ${f(cy - 0.3 * s)} ${f(cx + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(cx - s)} ${f(cy + 0.25 * s)} C ${f(cx - s)} ${f(cy - 0.3 * s)} ${f(cx - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(cx)} ${f(cy - 1.5 * s)} Z`;
};
P26.drop = (pa, cx, cy, s, o = {}) => H.el("path", { d: P26.dropD(cx, cy, s), fill: P26.water, stroke: P26.ink, "stroke-width": o.sw ?? 2, ...(o.attrs || {}) }, pa);

// Dust / rust grain: irregular hexagon of size s.
P26.grainD = (cx, cy, s, k = 0) => {
  const f = H.f, r = [1, 0.7, 1.05, 0.8, 0.95, 0.65];
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + k * 0.4, rr = s * r[(i + k) % 6];
    d += `${i ? " L" : "M"} ${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`;
  }
  return d + " Z";
};
P26.grain = (pa, cx, cy, s, k = 0, o = {}) => H.el("path", { d: P26.grainD(cx, cy, s, k), fill: P26.rust, stroke: o.stroke ?? "#4d3a24", "stroke-width": o.sw ?? 1.5, ...(o.attrs || {}) }, pa);

// Oil mist droplet.
P26.mist = (pa, cx, cy, r, o = {}) => H.el("circle", { cx, cy, r, fill: P26.oil, stroke: P26.oilDk, "stroke-width": o.sw ?? 2, ...(o.attrs || {}) }, pa);

// Horizontal cut-away pipe: walls (blue bands) above and below an air-tinted bore.
// gaps: [[x0, x1], …] openings in the bottom wall (for a drop leg / branch).
P26.tubeH = (pa, x1, x2, y1, y2, o = {}) => {
  const w = o.wall ?? 10, g = H.el("g", o.id ? { id: o.id } : {}, pa);
  const bore = H.el("rect", { x: x1, y: y1, width: x2 - x1, height: y2 - y1, fill: P26.air }, g);
  H.el("rect", { x: x1, y: y1 - w, width: x2 - x1, height: w, fill: P26.pipe }, g);
  let x = x1;
  for (const [a, c] of [...(o.gaps || []), [x2, x2]]) {
    if (a > x) H.el("rect", { x, y: y2, width: a - x, height: w, fill: P26.pipe }, g);
    x = c;
  }
  return { g, bore };
};
// Vertical cut-away pipe (bore x1..x2), from y1 down to y2.
P26.tubeV = (pa, x1, x2, y1, y2, o = {}) => {
  const w = o.wall ?? 10, g = H.el("g", o.id ? { id: o.id } : {}, pa);
  const bore = H.el("rect", { x: x1, y: y1, width: x2 - x1, height: y2 - y1, fill: P26.air }, g);
  H.el("rect", { x: x1 - w, y: y1, width: w, height: y2 - y1, fill: P26.pipe }, g);
  H.el("rect", { x: x2, y: y1, width: w, height: y2 - y1, fill: P26.pipe }, g);
  return { g, bore };
};

// Air-flow dashes (start hidden); P26.dashRun shows them running from t for dur seconds.
P26.dash = (pa, d, o = {}) => H.el("path", { d, fill: "none", stroke: P26.flow, "stroke-width": o.w ?? 5, "stroke-dasharray": "16 14", "stroke-linecap": "butt", opacity: 0, ...(o.id ? { id: o.id } : {}) }, pa);
P26.dashRun = (els, t, dur, speed = 1) => {
  for (const el of els) {
    tl.fromTo(el, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, t);
    tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -30 * Math.round(dur * 3 * speed), duration: dur, ease: "none", immediateRender: false }, t);
  }
};

// Particles carried along a pipe: each element is drawn at the pipe's start (x = 0 of its own frame) and slides
// right by (phase + v·t) mod W, so the stream loops seamlessly and stays seekable.
P26.stream = (els, W, t, dur, v = 120, off = 0) => {
  els.forEach((el, i) => {
    const ph = off + (W * i) / els.length;
    tl.fromTo(el, { x: ph }, {
      x: ph + v * dur, duration: dur, ease: "none",
      modifiers: { x: gsap.utils.unitize((x) => ((parseFloat(x) % W) + W) % W) },
    }, t);
  });
};

// Numbered marker (blue disc, white number) like the panel numbers.
P26.badge = (pa, cx, cy, n, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, pa);
  H.el("circle", { cx, cy, r: o.r ?? 22, fill: o.fill ?? P26.pipe, stroke: "#ffffff", "stroke-width": 3 }, g);
  H.text(g, cx, cy + 9, String(n), { size: o.size ?? 26, fill: o.color ?? "#ffffff", anchor: "middle" });
  return g;
};

// Cut-face hatch as explicit 45° lines (pattern fills do not render in the capture).
P26.hatchD = (rects, gap = 16) => {
  const f = H.f;
  let d = "";
  for (const [x0, y0, w, h] of rects) {
    const x1 = x0 + w, y1 = y0 + h;
    for (let c = Math.ceil((x0 + y0) / gap) * gap; c <= x1 + y1; c += gap) {
      const ax = Math.max(x0, c - y1), bx = Math.min(x1, c - y0);
      if (bx - ax > 0.5) d += `M ${f(ax)} ${f(c - ax)} L ${f(bx)} ${f(c - bx)} `;
    }
  }
  return d.trim();
};
// Hatched metal block (cut face).
P26.block = (pa, x, y, w, h, o = {}) => {
  const g = H.el("g", {}, pa);
  H.el("rect", { x, y, width: w, height: h, fill: P26.body }, g);
  H.el("path", { d: P26.hatchD([[x, y, w, h]]), fill: "none", stroke: P26.hatch, "stroke-width": 2.5 }, g);
  H.el("rect", { x, y, width: w, height: h, fill: "none", stroke: P26.ink, "stroke-width": o.sw ?? 4 }, g);
  return g;
};

// Small ball-valve drain cock on a vertical pipe end at (cx, y): body + lever (lever group returned to rotate).
P26.drainCock = (pa, cx, y, p, w = 52) => {
  const g = H.el("g", { id: p }, pa);
  H.el("rect", { x: cx - w / 2, y, width: w, height: 40, rx: 6, fill: P26.dark, stroke: P26.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: cx - 9, y: y + 40, width: 18, height: 16, fill: P26.dark, stroke: P26.ink, "stroke-width": 3 }, g);
  const lever = H.el("g", { id: p + "-lev" }, g);
  H.el("rect", { x: cx - 4, y: y + 12, width: Math.max(74, w / 2 + 36), height: 14, rx: 7, fill: P26.yellow, stroke: P26.ink, "stroke-width": 3 }, lever);
  H.el("circle", { cx, cy: y + 19, r: 8, fill: P26.ink }, g);
  return { g, lever, origin: `${cx} ${y + 19}`, outY: y + 56 };
};
