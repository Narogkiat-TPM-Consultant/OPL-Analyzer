// EP05 — Relief valve (balance piston type): drawings shared by s2–s4.
// Simplified cross-section after OPL 5-A-6 (p.8) and 5-C-8 (p.27): pilot head on top (poppet + pilot spring,
// adjusting screw, lock nut, handle), balance piston + upper spring in the middle, pressure port on the side
// (chamber A), tank port at the bottom. Coordinates: viewBox 0 0 1100 640.
// Chamber names follow p.8: A = pressure side (p.27 calls it Z), B = above the piston (p.27: X).

const RV = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", knob: "#59606a",
  blue: "#1f5fbf", paper: "#fffdf8", body: "#ebe6db", hatch: "#b7ac94", yellow: "#f2a900",
  pLo: "#dbe6f7", pHi: "#7ea2df", pMid: "#bcd0f0", tank: "#fbe7a1",
};

// Zigzag springs; the command list depends only on n, so two lengths can be tweened with attr:{d}.
RV.springH = (x0, x1, y, amp, n) => {
  const f = H.f, st = (x1 - x0) / (2 * n);
  let d = `M ${f(x0)} ${f(y)}`;
  for (let i = 1; i <= 2 * n; i++) d += ` L ${f(x0 + st * (i - 0.5))} ${f(y + (i % 2 ? -amp : amp))}`;
  return d + ` L ${f(x1)} ${f(y)}`;
};
RV.springV = (x, y0, y1, amp, n) => {
  const f = H.f, st = (y1 - y0) / (2 * n);
  let d = `M ${f(x)} ${f(y0)}`;
  for (let i = 1; i <= 2 * n; i++) d += ` L ${f(x + (i % 2 ? -amp : amp))} ${f(y0 + st * (i - 0.5))}`;
  return d + ` L ${f(x)} ${f(y1)}`;
};

// Cut-face hatch as explicit 45° lines (an SVG <pattern> fill did not render its lines in the video capture).
// Lines sit on one global grid (x + y = k·gap), so overlapping rectangles share the same lines.
RV.hatchD = (rects, gap = 16) => {
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
RV.bodyCut = (g, outline, rects) => {
  H.el("path", { d: outline, fill: RV.body }, g);
  H.el("path", { d: RV.hatchD(rects), fill: "none", stroke: RV.hatch, "stroke-width": 2.5 }, g);
  H.el("path", { d: outline, fill: "none", stroke: RV.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
};

// Cavities: outline pass (wide ink stroke) then fill pass per pressure zone, so joints stay clean.
RV.cavities = (g, p, zones) => {
  const out = H.el("g", {}, g);
  for (const z in zones) for (const [x, y, w, h] of zones[z].r) H.el("rect", { x, y, width: w, height: h, fill: "none", stroke: RV.ink, "stroke-width": 8 }, out);
  const groups = {};
  for (const z in zones) {
    groups[z] = H.el("g", { id: `${p}-z${z}`, fill: zones[z].fill }, g);
    for (const [x, y, w, h] of zones[z].r) H.el("rect", { x, y, width: w, height: h }, groups[z]);
  }
  return groups;
};

// White oil-flow dashes (start hidden). RV.flow(ids, t0, t1) shows them running from t0 to t1.
RV.dash = (g, id, d, w = 5) => H.el("path", { id, d, fill: "none", stroke: "#ffffff", "stroke-width": w, "stroke-dasharray": "10 14", "stroke-linecap": "butt", opacity: 0 }, g);
RV.flow = (ids, t0, t1, fadeOut = true) => {
  for (const id of [].concat(ids)) {
    tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 0.95, duration: 0.3, immediateRender: false }, t0);
    tl.fromTo(`#${id}`, { strokeDashoffset: 0 }, { strokeDashoffset: -24 * Math.round((t1 - t0) * 2.5), duration: t1 - t0, ease: "none", immediateRender: false }, t0);
    if (fadeOut) tl.fromTo(`#${id}`, { opacity: 0.95 }, { opacity: 0, duration: 0.3, immediateRender: false }, t1);
  }
};
// hide all flow dashes at build time (they start at opacity 0 already; this keeps seeks clean)
RV.ring = (g, id, cx, cy, r, color = RV.yellow) => H.el("circle", { id, cx, cy, r, fill: "none", stroke: color, "stroke-width": 7, opacity: 0 }, g);
RV.pulse = (id, t, n = 2) => {
  tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, t);
  tl.fromTo(`#${id}`, { scale: 0.85, transformOrigin: "50% 50%" }, { scale: 1.12, transformOrigin: "50% 50%", duration: 0.35, yoyo: true, repeat: 2 * n - 1, immediateRender: false }, t);
  tl.fromTo(`#${id}`, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t + 0.7 * n + 0.2);
};

// Pilot head: poppet + pilot spring + adjusting screw + lock nut + handle.
// o.standalone: draw its own body block and passage stubs (close-up in the adjustment scene).
// Returns { pop, psp, adj, nut, pspD(dxPoppet, dxScrew) }.
RV.pilot = (g, p, o = {}) => {
  if (o.standalone) {
    RV.bodyCut(g, "M 260 60 H 780 V 200 H 260 Z", [[260, 60, 520, 140]]);
    RV.cavities(g, p, {
      B: { fill: RV.pHi, r: [[300, 98, 20, 102], [300, 98, 32, 64], [330, 121, 16, 18]] },
      T: { fill: RV.tank, r: [[344, 98, 296, 64], [422, 160, 16, 40]] },
    });
  }
  const pspD = (dp = 0, ds = 0) => RV.springH(392 + dp, 600 + ds, 130, 19, 7);
  const psp = H.el("path", { id: `${p}-psp`, d: pspD(), fill: "none", stroke: RV.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  const pop = H.el("g", { id: `${p}-pop` }, g);
  H.el("path", { d: "M 326 130 L 356 114 L 356 146 Z", fill: RV.dark, stroke: RV.ink, "stroke-width": 3, "stroke-linejoin": "round" }, pop);
  H.el("rect", { x: 356, y: 114, width: 36, height: 32, fill: RV.dark, stroke: RV.ink, "stroke-width": 3 }, pop);
  const adj = H.el("g", { id: `${p}-adj` }, g);
  H.el("rect", { x: 600, y: 104, width: 12, height: 52, fill: RV.dark, stroke: RV.ink, "stroke-width": 3 }, adj);
  H.el("rect", { x: 612, y: 120, width: 236, height: 20, fill: RV.metal, stroke: RV.ink, "stroke-width": 3 }, adj);
  for (let x = 650; x <= 830; x += 12) H.el("line", { x1: x, y1: 121, x2: x + 6, y2: 139, stroke: RV.ink, "stroke-width": 1.5, opacity: 0.6 }, adj);
  H.el("rect", { x: 846, y: 66, width: 32, height: 128, rx: 8, fill: RV.knob, stroke: RV.ink, "stroke-width": 4 }, adj);
  for (let y = 80; y <= 180; y += 12) H.el("line", { x1: 850, y1: y, x2: 874, y2: y, stroke: "#c9ced4", "stroke-width": 2 }, adj);
  const nut = H.el("g", { id: `${p}-nut` }, g);
  H.el("rect", { x: 780, y: 106, width: 24, height: 48, rx: 2, fill: "#d9c27a", stroke: RV.ink, "stroke-width": 3 }, nut);
  H.el("line", { x1: 780, y1: 122, x2: 804, y2: 122, stroke: RV.ink, "stroke-width": 2 }, nut);
  H.el("line", { x1: 780, y1: 138, x2: 804, y2: 138, stroke: RV.ink, "stroke-width": 2 }, nut);
  return { pop, psp, adj, nut, pspD };
};

// Full cross-section with pressure gauge on the inlet. Returns handles for animation.
RV.section = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  RV.bodyCut(g, "M 200 190 H 260 V 60 H 780 V 200 H 700 V 570 H 200 Z", [[200, 190, 500, 380], [260, 60, 520, 140]]);
  const z = RV.cavities(g, p, {
    A: { fill: RV.pLo, r: [[18, 385, 184, 60], [200, 385, 92, 60], [290, 370, 280, 110], [98, 330, 14, 56]] },
    B: { fill: RV.pLo, r: [[370, 185, 120, 186], [300, 188, 72, 18], [300, 98, 20, 108], [300, 98, 32, 64], [330, 121, 16, 18]] },
    T: { fill: RV.tank, r: [[344, 98, 296, 64], [395, 479, 70, 92], [395, 569, 70, 59]] },
  });
  // seat edges (the piston closes here)
  H.el("path", { d: "M 380 480 H 395 M 465 480 H 480", stroke: RV.ink, "stroke-width": 6 }, g);

  // balance piston: two halves around a centre bore, choke hole in the left half
  const pis = H.el("g", { id: `${p}-pis` }, g);
  H.el("rect", { x: 418, y: 270, width: 24, height: 210, fill: RV.tank }, pis);
  H.el("rect", { x: 373, y: 270, width: 45, height: 210, fill: RV.metal, stroke: RV.ink, "stroke-width": 4 }, pis);
  H.el("rect", { x: 442, y: 270, width: 45, height: 210, fill: RV.metal, stroke: RV.ink, "stroke-width": 4 }, pis);
  const choke = H.el("path", { id: `${p}-chk`, d: "M 375 440 H 393 V 272", fill: "none", stroke: RV.pLo, "stroke-width": 9, "stroke-linejoin": "miter" }, pis);
  const fch = RV.dash(pis, `${p}-fch`, "M 377 440 H 393 V 274", 3);

  // drain tube from the pilot spring chamber down through the piston centre (fixed to the body)
  H.el("rect", { x: 422, y: 158, width: 16, height: 262, fill: RV.tank }, g);
  H.el("path", { d: "M 420 166 V 420 M 440 166 V 420", stroke: RV.ink, "stroke-width": 3 }, g);
  const uspD = (lift = 0) => RV.springV(430, 188, 268 - lift, 30, 5);
  const usp = H.el("path", { id: `${p}-usp`, d: uspD(), fill: "none", stroke: RV.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);

  const pl = RV.pilot(g, p);

  // pressure gauge on the inlet line (blue mark = setting)
  const G = H.gauge(g, 105, 255, 76, { id: `${p}-g`, min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, marks: [{ v: 6, color: RV.blue, id: `${p}-gset` }], value: 0 });
  H.text(g, 150, 174, "ค่าตั้ง", { size: 22, fill: RV.blue, id: `${p}-gsetl` });

  // oil-flow dashes
  const fl = H.el("g", {}, g);
  const f = {
    inlet: RV.dash(fl, `${p}-fin`, "M 22 415 H 300").id,
    pilot: RV.dash(fl, `${p}-fpi`, "M 400 197 H 310 V 130 H 340 L 350 104 H 430 V 626").id,
    main: [RV.dash(fl, `${p}-fm1`, "M 300 432 Q 395 455 413 495 V 626", 6).id, RV.dash(fl, `${p}-fm2`, "M 566 462 Q 472 464 447 497 V 626", 6).id],
    choke: fch.id,
  };
  return { g, z, pis, choke, usp, uspD, G, f, ...pl };
};

// Chamber letter marker (circle + letter), optional leader to (lx, ly).
RV.mark = (g, id, cx, cy, s, lx, ly) => {
  const m = H.el("g", { id }, g);
  if (lx != null) H.el("line", { x1: cx, y1: cy, x2: lx, y2: ly, stroke: RV.ink, "stroke-width": 3 }, m);
  H.el("circle", { cx, cy, r: 21, fill: RV.paper, stroke: RV.ink, "stroke-width": 3 }, m);
  H.text(m, cx, cy + 10, s, { size: 28, anchor: "middle" });
  return m;
};
// Label with a leader line; returns the group (start hidden by the caller's tween).
RV.label = (g, id, x, y, s, lx, ly, o = {}) => {
  const m = H.el("g", { id }, g);
  if (lx != null) H.el("path", { d: `M ${o.fx ?? x} ${o.fy ?? y + 8} L ${lx} ${ly}`, fill: "none", stroke: RV.ink, "stroke-width": 2.5 }, m);
  if (lx != null) H.el("circle", { cx: lx, cy: ly, r: 5, fill: RV.ink }, m);
  if (o.bg) {
    const w = o.bg;
    const x0 = o.anchor === "middle" ? x - w / 2 : o.anchor === "end" ? x - w : x - 8;
    H.el("rect", { x: x0, y: y - 26, width: w, height: 36, rx: 8, fill: RV.paper, stroke: RV.ink, "stroke-width": 2 }, m);
  }
  H.text(m, x, y, s, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || RV.ink });
  return m;
};
