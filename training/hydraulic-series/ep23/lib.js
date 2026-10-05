// EP23 — FRL set (1): Air filter (OPL 5'-A-4, PDF p.38). Drawings shared by s1–s5.
// AF.section: simplified cross-section after the p.38 figure — IN port → down-passage → deflector (louvre ring)
//   → bowl (swirl, matter thrown to the wall, falls) → filter element (outside → core) → up the core → OUT port;
//   baffle plate under the element, drain collected at the bottom, drain cock. Coordinates: viewBox 0 0 1100 640.
// AF.frl: the 3-point set Filter → Regulator → Lubricator for the title (viewBox 0 0 800 560).
// Part D colours: air dashes #2a8fc9 on pipes #1f5fbf, air tint #dff1fb, water/drain #3b7dd8, oil #f2c94c,
// dirt/rust #7a5c3a, metal #c9c1ae / #9aa1aa, bowls #eef6fb outlined #1a1d21.
// Names must not clash with hyd_lib.js (HC, H.hyd* are taken).

const AF = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", paper: "#fffdf8",
  pipeC: "#1f5fbf", flowC: "#2a8fc9", air: "#dff1fb", water: "#3b7dd8", oil: "#f2c94c", oilDk: "#c99a1c",
  dirt: "#7a5c3a", dust: "#a08b6d", bowl: "#eef6fb", red: "#d0233a", green: "#178a4e", yellow: "#f2a900",
  body: "#d9d3c4", hatch: "#aaa18b", elem: "#e6e1d3", pool: "#b9d3f2", blue: "#1f5fbf",
};

// Tween one numeric property along a pure function of absolute time fn(t) between tA and tB (seekable).
// o.attr → SVG attribute; o.ir → immediateRender (true for the first tween of that property).
AF.fn = (el, prop, fn, tA, tB, o = {}) => {
  const d = Math.max(0.001, tB - tA), v0 = fn(tA);
  const wrap = (v) => (o.attr ? { attr: { [prop]: v } } : { [prop]: v });
  tl.fromTo(el, wrap(v0), { ...wrap(v0 + 1), duration: d, ease: (q) => fn(tA + q * d) - v0, immediateRender: o.ir ?? false }, tA);
};
AF.clamp = (v) => Math.max(0, Math.min(1, v));

// Cut-face hatch as explicit 45° lines (SVG <pattern> fills do not render in frames).
AF.hatchD = (rects, gap = 16) => {
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

// Air pipe: blue wall, light air inside. Returns the group.
AF.pipe = (g, d, w = 44, wall = 6) => {
  const p = H.el("g", {}, g);
  H.el("path", { d, fill: "none", stroke: AF.pipeC, "stroke-width": w + 2 * wall, "stroke-linejoin": "round" }, p);
  H.el("path", { d, fill: "none", stroke: AF.air, "stroke-width": w, "stroke-linejoin": "round" }, p);
  return p;
};
// Air-flow dashes (hidden until AF.flow runs them).
AF.dash = (g, id, d, w = 5) => H.el("path", { id, d, fill: "none", stroke: AF.flowC, "stroke-width": w, "stroke-dasharray": "12 14", "stroke-linecap": "butt", "stroke-linejoin": "round", opacity: 0 }, g);
AF.flow = (ids, t0, t1, o = {}) => {
  for (const id of [].concat(ids)) {
    const sel = typeof id === "string" ? `#${id}` : id;
    tl.fromTo(sel, { opacity: 0 }, { opacity: o.op ?? 1, duration: 0.3, immediateRender: false }, t0);
    tl.fromTo(sel, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((t1 - t0) * (o.speed ?? 3)), duration: t1 - t0, ease: "none", immediateRender: false }, t0);
    if (o.fadeOut) tl.fromTo(sel, { opacity: o.op ?? 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t1);
  }
};

// Drop shape hanging from (x, y), body radius s.
AF.dropD = (x, y, s) => {
  const f = H.f, cy = y + 1.5 * s;
  return `M ${f(x)} ${f(y)} C ${f(x + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x + s)} ${f(cy - 0.3 * s)} ${f(x + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(cy + 0.25 * s)} C ${f(x - s)} ${f(cy - 0.3 * s)} ${f(x - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x)} ${f(y)} Z`;
};
// Contaminant particle centred on (0, 0); move it with x / y. kind: water | oil | dust | rust.
AF.KINDS = ["oil", "water", "dust", "rust"];
AF.particle = (parent, kind, s = 1, attrs = {}) => {
  const g = H.el("g", attrs, parent);
  const k = H.el("g", { transform: `scale(${s})` }, g);
  if (kind === "water") H.el("path", { d: AF.dropD(0, -9, 6.5), fill: AF.water, stroke: "#1d4f9a", "stroke-width": 1.5 }, k);
  if (kind === "oil") H.el("path", { d: AF.dropD(0, -9, 6.5), fill: AF.oil, stroke: AF.oilDk, "stroke-width": 1.8 }, k);
  if (kind === "dust") for (const [x, y, r] of [[-4, -2, 3.6], [4, -3, 2.8], [1, 4, 3.2]]) H.el("circle", { cx: x, cy: y, r, fill: AF.dust, stroke: "#5f4d33", "stroke-width": 1 }, k);
  if (kind === "rust") H.el("path", { d: "M -8 -3 L -2 -8 L 7 -5 L 8 3 L 1 8 L -7 5 Z", fill: AF.dirt, stroke: "#4a3722", "stroke-width": 1.5, "stroke-linejoin": "round" }, k);
  return g;
};

// Yellow highlight ring that pulses n times, then fades.
AF.ring = (g, id, cx, cy, rx, ry = rx, color = AF.yellow) => H.el("ellipse", { id, cx, cy, rx, ry, fill: "none", stroke: color, "stroke-width": 7, opacity: 0 }, g);
AF.pulse = (el, t, n = 2, cx, cy) => {
  const o = `${cx} ${cy}`;
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, t);
  tl.fromTo(el, { scale: 0.88, svgOrigin: o }, { scale: 1.1, svgOrigin: o, duration: 0.35, yoyo: true, repeat: 2 * n - 1, immediateRender: false }, t);
  tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t + 0.7 * n + 0.2);
};

// Label with a leader line (start hidden; AF.show reveals it). o: { size, anchor, bg, fill, sub }
AF.label = (g, id, x, y, s, lx, ly, o = {}) => {
  const m = H.el("g", { id, opacity: 0 }, g);
  if (lx != null) {
    H.el("path", { d: `M ${o.fx ?? x} ${o.fy ?? y - 9} L ${lx} ${ly}`, fill: "none", stroke: AF.ink, "stroke-width": 2.5 }, m);
    H.el("circle", { cx: lx, cy: ly, r: 5.5, fill: AF.ink }, m);
  }
  if (o.bg) {
    const w = o.bg, h = o.sub ? 70 : 40;
    const x0 = o.anchor === "middle" ? x - w / 2 : o.anchor === "end" ? x - w + 10 : x - 10;
    H.el("rect", { x: x0, y: y - 29, width: w, height: h, rx: 8, fill: AF.paper, stroke: o.stroke || AF.ink, "stroke-width": 2.5 }, m);
  }
  H.text(m, x, y, s, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || AF.ink });
  if (o.sub) H.text(m, x, y + 31, o.sub, { size: o.subSize || 22, anchor: o.anchor || "start", fill: AF.muted });
  return m;
};
AF.show = (el, t, dy = 12) => tl.fromTo(el, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);

// ------------------------------------------------------------------------------------------------------------
// Cross-section (viewBox 1100 × 640). Bowl axis x = 540.
// Returns handles: { g, top (layer over the element for front arcs/particles), parts:{…}, f:{…}, geom }
AF.section = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  const cx = 540;
  // pipes (IN left, OUT right) at port height y = 120
  AF.pipe(g, "M 24 120 H 376");
  AF.pipe(g, "M 704 120 H 1076");

  // bowl (transparent) — drawn before the head so the head overlaps its rim
  const bowlD = "M 418 196 V 498 Q 418 568 482 570 H 598 Q 662 568 662 498 V 196";
  H.el("path", { d: bowlD + " Z", fill: AF.bowl }, g);
  // drain pool (collected water + dirt) in the bowl bottom
  const pool = H.el("path", { id: `${p}-pool`, d: "M 422 506 H 658 V 500 Q 658 563 598 565 H 482 Q 422 563 422 500 Z", fill: AF.pool }, g);
  const poolTop = H.el("path", { d: "M 424 506 H 656", stroke: AF.water, "stroke-width": 3, opacity: 0.8 }, g);
  const specks = H.el("g", { id: `${p}-specks` }, g);
  [[456, 534, "dust"], [566, 548, "rust"], [622, 530, "water"]]
    .forEach(([x, y, k]) => AF.particle(specks, k, 0.8, { transform: `translate(${x} ${y})` }));

  // head body (cut face) with cavities: inlet (horizontal + down-passage), outlet (core riser + horizontal),
  // right-hand annulus pocket (the inlet ring continues around the element, out of the cut plane)
  const head = H.el("g", { id: `${p}-head` }, g);
  const headD = "M 372 58 H 708 V 196 H 372 Z";
  H.el("path", { d: headD, fill: AF.body }, head);
  H.el("path", { d: AF.hatchD([[372, 58, 336, 138]]), fill: "none", stroke: AF.hatch, "stroke-width": 2.5 }, head);
  const cav = [[368, 98, 106, 44], [432, 98, 42, 102], [516, 98, 196, 44], [516, 98, 48, 102], [606, 158, 42, 42]];
  for (const [x, y, w, h] of cav) H.el("rect", { x, y, width: w, height: h, fill: "none", stroke: AF.ink, "stroke-width": 8 }, head);
  for (const [x, y, w, h] of cav) H.el("rect", { x, y, width: w, height: h, fill: AF.air }, head);
  H.el("path", { d: headD, fill: "none", stroke: AF.ink, "stroke-width": 5, "stroke-linejoin": "round" }, head);
  // clear the cavity openings through the outline (ports and bottom openings)
  for (const [x, y, w, h] of [[365, 101, 14, 38], [701, 101, 14, 38], [435, 188, 36, 18], [519, 188, 42, 18], [609, 188, 36, 18]])
    H.el("rect", { x, y, width: w, height: h, fill: AF.air }, head);
  // bowl ring (section of the bowl guard / ring nut) and the bowl outline
  H.el("path", { d: bowlD, fill: "none", stroke: AF.ink, "stroke-width": 6, "stroke-linejoin": "round" }, g);
  for (const x of [398, 662]) H.el("rect", { x, y: 190, width: 20, height: 46, rx: 3, fill: AF.metal, stroke: AF.ink, "stroke-width": 3.5 }, g);

  // drain cock under the bowl
  const cock = H.el("g", { id: `${p}-cock` }, g);
  H.el("rect", { x: 527, y: 568, width: 26, height: 30, fill: AF.metal, stroke: AF.ink, "stroke-width": 3.5 }, cock);
  H.el("rect", { x: 514, y: 596, width: 52, height: 20, rx: 6, fill: AF.dark, stroke: AF.ink, "stroke-width": 3.5 }, cock);

  // swirl ellipses — back halves behind the element
  const sw = [262, 322];
  const swBack = sw.map((y, i) => H.el("path", { id: `${p}-swb${i}`, d: `M ${cx + 106} ${y} A 106 19 0 0 0 ${cx - 106} ${y}`, fill: "none", stroke: AF.flowC, "stroke-width": 4, "stroke-dasharray": "10 10", opacity: 0 }, g));

  // filter element (porous walls, hollow core) hanging from the head; bottom cap, stem, baffle plate
  const el = H.el("g", { id: `${p}-elem` }, g);
  H.el("rect", { x: 494, y: 196, width: 92, height: 226, fill: AF.elem, stroke: AF.ink, "stroke-width": 4 }, el);
  H.el("rect", { x: 516, y: 188, width: 48, height: 234, fill: AF.air }, el);
  H.el("path", { d: "M 516 188 V 422 M 564 188 V 422", stroke: AF.ink, "stroke-width": 3 }, el);
  for (let y = 210; y <= 414; y += 12)
    for (const x0 of [499, 569]) for (let k = 0; k < 3; k++)
      H.el("circle", { cx: x0 + 6 * k + ((y / 12) % 2 ? 3 : 0), cy: y, r: 1.8, fill: AF.dark }, el);
  H.el("rect", { x: 488, y: 418, width: 104, height: 16, rx: 3, fill: AF.metal, stroke: AF.ink, "stroke-width": 3.5 }, el);
  H.el("rect", { x: 534, y: 434, width: 12, height: 34, fill: AF.dark, stroke: AF.ink, "stroke-width": 3 }, el);
  const baffle = H.el("path", { id: `${p}-baf`, d: "M 466 482 L 540 462 L 614 482 L 614 490 L 540 470 L 466 490 Z", fill: AF.metal, stroke: AF.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);

  // deflector: louvre ring around the element top (slanted vanes give the air its swirl)
  const def = H.el("g", { id: `${p}-def` }, g);
  for (const m of [1, -1]) {
    const X = (x) => (m > 0 ? x : 2 * cx - x);
    H.el("path", { d: `M ${X(428)} 236 H ${X(492)}`, stroke: AF.ink, "stroke-width": 5 }, def);
    for (const x of [444, 457, 470, 483])
      H.el("path", { d: `M ${X(x)} 200 L ${X(x + 8)} 200 L ${X(x - 4)} 236 L ${X(x - 12)} 236 Z`, fill: AF.dark, stroke: AF.ink, "stroke-width": 2, "stroke-linejoin": "round" }, def);
  }

  // top layer: front swirl arcs, flow dashes, particles, labels
  const top = H.el("g", {}, g);
  const swFront = sw.map((y, i) => H.el("path", { id: `${p}-swf${i}`, d: `M ${cx - 106} ${y} A 106 19 0 0 0 ${cx + 106} ${y}`, fill: "none", stroke: AF.flowC, "stroke-width": 5, "stroke-dasharray": "14 9", opacity: 0 }, top));
  const swHead = sw.map((y, i) => H.el("path", { id: `${p}-swh${i}`, d: `M ${cx + 90} ${y + 6} L ${cx + 106} ${y} L ${cx + 105} ${y + 17}`, fill: "none", stroke: AF.flowC, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, top));
  const f = {
    inlet: AF.dash(top, `${p}-fin`, "M 24 120 H 452 V 206").id,
    core: AF.dash(top, `${p}-fcore`, "M 540 418 V 120 H 1076").id,
  };
  // inward arrows through the element walls (clean air), hidden
  const inward = H.el("g", { id: `${p}-inw`, opacity: 0 }, top);
  for (const y of [282, 342, 398]) {
    H.el("path", { d: H.arrowD(462, y, 530, y, 12), fill: "none", stroke: AF.flowC, "stroke-width": 4.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, inward);
    H.el("path", { d: H.arrowD(618, y, 550, y, 12), fill: "none", stroke: AF.flowC, "stroke-width": 4.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, inward);
  }
  const parts = { pool, poolTop, specks, head, cock, el, baffle, def, inward, swBack, swFront, swHead };
  return { g, top, parts, f, geom: { cx, wallL: 424, wallR: 656, poolY: 506, sw } };
};

// Particle trajectory through the filter (absolute times). P: { t0, kind, yo (offset in the pipe), loop (true =
// one full turn incl. the back → lands on the left wall), rest: [x, y] in the pool }.
// Phases: pipe 1.0 s → down-passage 0.35 s → swirl 0.9 s (1.4 s for a full turn) → slides down the wall 0.8 s
// → sinks to its rest spot 0.5 s. Returns the particle group.
AF.track = (parent, P, cx = 540) => {
  const g = AF.particle(parent, P.kind, P.s ?? 1.15, { opacity: 0 });
  const tA = P.t0, tB = tA + 1.0, tC = tB + 0.35, swirl = P.loop ? 1.4 : 0.9, tD = tC + swirl, tE = tD + 0.8, tF = tE + 0.5;
  const phi0 = Math.PI, phi1 = P.loop ? -Math.PI : 0;
  const r0 = 88, r1 = 110, y0 = 216, y1 = P.loop ? 300 : 270;
  const sw = (u) => {
    const phi = phi0 + (phi1 - phi0) * u, r = r0 + (r1 - r0) * u, yc = y0 + (y1 - y0) * u;
    return [cx + r * Math.cos(phi), yc + 0.2 * r * Math.sin(phi), phi];
  };
  const wallX = sw(1)[0], wallY = sw(1)[1];
  const pos = (t) => {
    if (t <= tB) { const u = AF.clamp((t - tA) / (tB - tA)); return [24 + (452 - 24) * u, 120 + P.yo]; }
    if (t <= tC) { const u = (t - tB) / (tC - tB); return [452, 120 + P.yo + (216 - 120 - P.yo) * u]; }
    if (t <= tD) { const s = sw((t - tC) / (tD - tC)); return [s[0], s[1]]; }
    if (t <= tE) { const u = (t - tD) / (tE - tD); return [wallX, wallY + (500 - wallY) * u * u]; }
    const u = AF.clamp((t - tE) / (tF - tE)), e = 1 - (1 - u) * (1 - u);
    return [wallX + (P.rest[0] - wallX) * e, 500 + (P.rest[1] - 500) * e];
  };
  // hidden while it passes behind the element (back half of the swirl, inside the element's width)
  const vis = (t) => {
    if (t < tA) return 0;
    if (t > tC && t < tD) { const s = sw((t - tC) / (tD - tC)); if (Math.sin(s[2]) < 0 && Math.abs(s[0] - cx) < 52) return 0; }
    return 1;
  };
  const tEnd = tF + 0.01;
  AF.fn(g, "x", (t) => pos(t)[0], tA, tEnd, { ir: true });
  AF.fn(g, "y", (t) => pos(t)[1], tA, tEnd, { ir: true });
  AF.fn(g, "opacity", vis, tA - 0.01, tD + 0.01);
  return g;
};

// ------------------------------------------------------------------------------------------------------------
// FRL set for the title (viewBox 800 × 560): pipe at y = 170; Filter (x 170) → Regulator (400) → Lubricator (630).
// Returns { g, units: [F, R, L], flows: [ids], bowlF: {x0, x1, y0, y1}, hi } — hi = highlight frame (hidden).
AF.frl = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  const Y = 170;
  const segs = [[16, 108], [232, 338], [462, 568], [692, 784]];
  segs.forEach(([a, b]) => AF.pipe(g, `M ${a} ${Y} H ${b}`, 26, 5));
  const flows = segs.map(([a, b], i) => AF.dash(g, `${p}-fl${i}`, `M ${a} ${Y} H ${b}`, 4).id);
  const head = (G, x0) => {
    H.el("rect", { x: x0, y: 128, width: 130, height: 84, rx: 8, fill: AF.metal, stroke: AF.ink, "stroke-width": 4.5 }, G);
    H.el("rect", { x: x0 - 6, y: 155, width: 10, height: 30, fill: AF.dark, stroke: AF.ink, "stroke-width": 3 }, G);
    H.el("rect", { x: x0 + 126, y: 155, width: 10, height: 30, fill: AF.dark, stroke: AF.ink, "stroke-width": 3 }, G);
  };
  // Filter: head + transparent bowl, element, baffle, drain pool, drain cock
  const F = H.el("g", { id: `${p}-F` }, g);
  head(F, 105);
  H.el("path", { d: "M 120 212 V 382 Q 120 432 162 432 H 178 Q 220 432 220 382 V 212 Z", fill: AF.bowl, stroke: AF.ink, "stroke-width": 4.5, "stroke-linejoin": "round" }, F);
  H.el("path", { d: "M 123 392 H 217 V 386 Q 217 428 178 429 H 162 Q 123 428 123 386 Z", fill: AF.pool }, F);
  H.el("rect", { x: 152, y: 214, width: 36, height: 118, fill: AF.elem, stroke: AF.ink, "stroke-width": 3 }, F);
  H.el("path", { d: "M 140 360 L 170 350 L 200 360 L 200 365 L 170 355 L 140 365 Z", fill: AF.metal, stroke: AF.ink, "stroke-width": 2.5 }, F);
  H.el("rect", { x: 162, y: 432, width: 16, height: 22, fill: AF.dark, stroke: AF.ink, "stroke-width": 3 }, F);
  [[140, 410, "dust"], [168, 418, "rust"], [196, 408, "water"]].forEach(([x, y, k]) => AF.particle(F, k, 0.75, { transform: `translate(${x} ${y})` }));
  // Regulator: handle on top, gauge on the front
  const R = H.el("g", { id: `${p}-R` }, g);
  H.el("path", { d: "M 368 128 L 380 88 H 420 L 432 128 Z", fill: AF.metal, stroke: AF.ink, "stroke-width": 4, "stroke-linejoin": "round" }, R);
  H.el("rect", { x: 372, y: 46, width: 56, height: 44, rx: 8, fill: AF.muted, stroke: AF.ink, "stroke-width": 4 }, R);
  for (let x = 382; x <= 418; x += 9) H.el("line", { x1: x, y1: 52, x2: x, y2: 84, stroke: "#c9ced4", "stroke-width": 2.5 }, R);
  head(R, 335);
  H.el("rect", { x: 372, y: 212, width: 56, height: 40, rx: 6, fill: AF.metal, stroke: AF.ink, "stroke-width": 4 }, R);
  H.el("circle", { cx: 400, cy: 170, r: 30, fill: AF.paper, stroke: AF.ink, "stroke-width": 4 }, R);
  H.el("path", { d: H.arcD(400, 170, 21, 150, 390), fill: "none", stroke: AF.dark, "stroke-width": 3 }, R);
  H.el("line", { x1: 400, y1: 170, x2: 414, y2: 155, stroke: AF.ink, "stroke-width": 3.5 }, R);
  // Lubricator: sight dome on top, oil bowl
  const L = H.el("g", { id: `${p}-L` }, g);
  H.el("path", { d: "M 606 130 A 24 24 0 0 1 654 130 Z", fill: AF.bowl, stroke: AF.ink, "stroke-width": 4 }, L);
  H.el("path", { d: AF.dropD(630, 110, 5), fill: AF.oil, stroke: AF.oilDk, "stroke-width": 1.5 }, L);
  head(L, 565);
  H.el("path", { d: "M 580 212 V 372 Q 580 418 622 418 H 638 Q 680 418 680 372 V 212 Z", fill: AF.bowl, stroke: AF.ink, "stroke-width": 4.5, "stroke-linejoin": "round" }, L);
  H.el("path", { d: "M 583 282 H 677 V 372 Q 677 415 638 415 H 622 Q 583 415 583 372 Z", fill: AF.oil, opacity: 0.85 }, L);
  H.el("line", { x1: 630, y1: 212, x2: 630, y2: 396, stroke: AF.ink, "stroke-width": 3 }, L);
  // labels under each unit
  const lab = (G, x, n, en, th) => {
    H.el("circle", { cx: x, cy: 480, r: 20, fill: AF.blue }, G);
    H.text(G, x, 489, n, { size: 26, anchor: "middle", fill: "#ffffff" });
    H.text(G, x, 530, en, { size: 28, anchor: "middle" });
  };
  lab(g, 170, "1", "Filter"); lab(g, 400, "2", "Regulator"); lab(g, 630, "3", "Lubricator");
  H.text(g, 16, 126, "IN", { size: 26, fill: AF.muted });
  H.text(g, 784, 126, "OUT", { size: 26, anchor: "end", fill: AF.muted });
  const hi = H.el("rect", { id: `${p}-hi`, x: 84, y: 92, width: 172, height: 462, rx: 18, fill: "rgba(31,95,191,0.07)", stroke: AF.blue, "stroke-width": 5, "stroke-dasharray": "14 10", opacity: 0 }, g);
  g.insertBefore(hi, g.firstChild);
  return { g, units: [F, R, L], flows, hi };
};
