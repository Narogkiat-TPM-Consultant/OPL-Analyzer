// EP19 — Simple function check: relief valve (OPL 5-C-8, p.28) + solenoid valve (OPL 5-C-9, p.30).
// Drawings copied from EP05 (relief valve, RV.*) and EP06 (solenoid valve, V6 / H.v6*) so the episodes pair up.
// Changes to the copies: EP06's <pattern> hatch is replaced by explicit hatch lines; EP19 additions at the end
// (subplate + mounting bolts + connectors/cables on the solenoid valve, oil drops, rag, sound waves, card minis).

// ============================================================ copied from ep05/lib.js
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

// ============================================================ copied from ep06/lib.js
// EP06 — 4-port, 3-position, double-solenoid, spring-centred, closed-centre direction valve
// (OPL 5-A-7 / 5-C-9). Shared by s1 (title), s2 (structure), s3 (operation), s4 (symbol).
//
// Cross-section, local units (draw into a <g> that is already translated/scaled):
//   solenoid "a" housing x 5–170 · body x 170–720 (y 20–270) · solenoid "b" housing x 720–885
//   bore x 190–700, y 115–205 (axis y 160) · ports at the bottom: T 208, A 325, P 445, B 565 (width 36)
//   spool lands 300–350 (covers A) and 540–590 (covers B); stroke s = 50 each way.
//   Spool right (+1): P→B, A→T (left chamber → T).  Spool left (−1): P→A, B→T (right chamber →
//   top gallery → left chamber → T).  Centre (0): every port covered — closed centre.

const V6 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", hatch: "#ada38d", spool: "#b4bcc6", dark: "#8f969f",
  paper: "#fffdf8", air: "#ece7db", oil: "#f6e6ad", pr: "#ef7d1a", rt: "#7fb2e6", copper: "#c48a52",
  glow: "#ffd23f", yel: "#f2a900", blue: "#1f5fbf",
  s: 50, pw: 36, port: { T: 208, A: 325, P: 445, B: 565 },
};

// Coil spring between x0 and x1 on the valve axis (same command list for any x0/x1 → tweenable).
H.v6SpringD = (x0, x1, yc = 160, amp = 30, n = 6) => {
  const f = H.f, k = 2 * n;
  let d = `M ${f(x0)} ${yc}`;
  for (let i = 1; i < k; i++) d += ` L ${f(x0 + ((x1 - x0) * i) / k)} ${i % 2 ? yc - amp : yc + amp}`;
  d += ` L ${f(x1)} ${yc}`;
  d += ` M ${f(x0)} ${yc - amp - 6} L ${f(x0)} ${yc + amp + 6} M ${f(x1)} ${yc - amp - 6} L ${f(x1)} ${yc + amp + 6}`;
  return d;
};

// Filled arrowhead (triangle) pointing in direction dir ("up" | "down" | "left" | "right") with its tip at (x, y).
H.v6Head = (parent, x, y, dir, o = {}) => {
  const L = o.len ?? 26, W = o.w ?? 15, f = H.f;
  const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  const bx = x - v[0] * L, by = y - v[1] * L, px = -v[1], py = v[0];
  return H.el("path", { d: `M ${f(x)} ${f(y)} L ${f(bx + px * W)} ${f(by + py * W)} L ${f(bx - px * W)} ${f(by - py * W)} Z`, fill: o.fill || "#ffffff", stroke: o.stroke || V6.ink, "stroke-width": o.sw ?? 3, "stroke-linejoin": "round" }, parent);
};

// Oil-flow dashes along a path (white dashes, moving forward along the path while visible).
H.v6Flow = (parent, d, o = {}) =>
  H.el("path", { d, fill: "none", stroke: o.color || "#ffffff", "stroke-width": o.w ?? 6, "stroke-dasharray": "14 12", "stroke-linecap": "butt", "stroke-linejoin": "round" }, parent);
// Show a flow group from t0 to t1 (seconds, absolute) and run its dashes.
H.v6Run = (group, lines, t0, t1) => {
  tl.fromTo(group, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t0);
  const dur = Math.max(0.5, t1 - t0);
  for (const ln of lines) tl.fromTo(ln, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round(dur * 2.6), duration: dur, ease: "none", immediateRender: false }, t0);
  tl.fromTo(group, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, t1);
};
// Colour change of an SVG attribute (fill / stroke), seek-safe.
H.v6Col = (el, attr, from, to, t, dur = 0.35) =>
  tl.fromTo(el, { attr: { [attr]: from } }, { attr: { [attr]: to }, duration: dur, immediateRender: false }, t);

// The valve cross-section. o: { stub (port stub length below the body, default 30), letters (T A P B, default true),
//   pills ("full" → "โซลินอยด์ a" | "short" → "a" | false) }.
// Returns handles + helpers: shift(from, to, t, dur), coil(side, on, t).
H.v6Valve = (parent, p, o = {}) => {
  const C = V6, s = C.s, stub = o.stub ?? 30, f = H.f;
  const g = H.el("g", { id: p }, parent);
  // (EP19: the <pattern> hatch of EP06 is drawn below as explicit lines, see RV.hatchD)
  const R = (x, y, w, h, a, par = g) => H.el("rect", { x: f(x), y: f(y), width: f(w), height: f(h), ...a }, par);

  // --- solenoid housings (coil windings + plunger channel)
  const glow = {}, ring = {}, pill = {};
  for (const side of ["a", "b"]) {
    const mx = (x, w) => (side === "a" ? x : 890 - x - w); // mirror a rect's x for side b
    const hg = H.el("g", { id: `${p}-sol${side}` }, g);
    ring[side] = R(mx(-1, 177), 64, 177, 192, { rx: 26, fill: "none", stroke: C.yel, "stroke-width": 10, opacity: 0 }, hg);
    R(mx(5, 165), 70, 165, 180, { rx: 22, fill: C.metal, stroke: C.ink, "stroke-width": 4 }, hg);
    for (const y of [84, 186]) {
      R(mx(22, 128), y, 128, 50, { fill: C.copper, stroke: C.ink, "stroke-width": 2.5 }, hg);
      for (let k = 1; k < 6; k++) H.el("line", { x1: f(mx(24, 124)), x2: f(mx(24, 124) + 124), y1: y + k * 8.3, y2: y + k * 8.3, stroke: "#8a5a2c", "stroke-width": 1.6 }, hg);
    }
    glow[side] = H.el("g", { opacity: 0 }, hg);
    for (const y of [84, 186]) R(mx(22, 128), y, 128, 50, { fill: C.glow, opacity: 0.85 }, glow[side]);
    R(mx(22, 150), 134, 150, 52, { fill: C.air }, hg);
    if (o.pills !== false) {
      const full = o.pills === "full";
      const w = full ? 168 : 56;
      const cx = side === "a" ? 87.5 : 802.5;
      pill[side] = R(cx - w / 2, 22, w, 40, { rx: 20, fill: C.paper, stroke: C.ink, "stroke-width": 3 }, hg);
      H.text(hg, cx, 52, full ? `โซลินอยด์ ${side}` : side, { size: full ? 26 : 30, anchor: "middle" });
    }
  }

  // --- body (hatched cut face) and the oil passages
  R(170, 20, 550, 250, { rx: 6, fill: C.metal });
  H.el("path", { d: RV.hatchD([[172, 22, 546, 246]]), fill: "none", stroke: C.hatch, "stroke-width": 3 }, g);
  R(170, 20, 550, 250, { rx: 6, fill: "none", stroke: C.ink, "stroke-width": 5 });
  const passages = (a) => {
    R(190, 115, 510, 90, a);
    H.el("path", { d: "M 190 40 L 700 40 L 700 115 L 664 115 L 664 72 L 226 72 L 226 115 L 190 115 Z", ...a }, g);
    for (const k of ["T", "A", "P", "B"]) R(C.port[k] - 18, 200, 36, 70 + stub, a);
    R(164, 152, 30, 16, a); R(696, 152, 30, 16, a);
  };
  passages({ fill: C.oil, stroke: C.ink, "stroke-width": 6 });
  passages({ fill: C.oil });
  // colourable overlays (start as plain oil)
  const leftCh = R(190, 115, 110, 90, { fill: C.oil });
  const rightCh = R(590, 115, 110, 90, { fill: C.oil });
  const gal = H.el("path", { d: "M 193 43 L 697 43 L 697 115 L 667 115 L 667 69 L 223 69 L 223 115 L 193 115 Z", fill: C.oil }, g);
  const ports = {};
  for (const k of ["T", "A", "P", "B"]) ports[k] = R(C.port[k] - 15, 203, 30, 67 + stub - (stub ? 3 : 0), { fill: C.oil });

  // --- moving assembly: plunger a + push rod a + spool + push rod b + plunger b
  const spool = H.el("g", { id: `${p}-spool` }, g);
  const mid = R(350, 115, 190, 90, { fill: C.oil }, spool);
  R(350, 151, 190, 18, { fill: C.spool, stroke: C.ink, "stroke-width": 2.5 }, spool);
  R(106, 154, 194, 12, { fill: C.spool, stroke: C.ink, "stroke-width": 2 }, spool);
  R(590, 154, 194, 12, { fill: C.spool, stroke: C.ink, "stroke-width": 2 }, spool);
  const landA = R(300, 117, 50, 86, { fill: C.spool, stroke: C.ink, "stroke-width": 3.5 }, spool);
  const landB = R(540, 117, 50, 86, { fill: C.spool, stroke: C.ink, "stroke-width": 3.5 }, spool);
  const plA = R(70, 141, 36, 38, { fill: C.dark, stroke: C.ink, "stroke-width": 3 }, spool);
  const plB = R(784, 141, 36, 38, { fill: C.dark, stroke: C.ink, "stroke-width": 3 }, spool);

  // --- centering springs (left: wall 190 → land face 300; right: land face 590 → wall 700)
  const sp = { fill: "none", stroke: C.ink, "stroke-width": 4, "stroke-linejoin": "round" };
  const springL = H.el("path", { d: H.v6SpringD(190, 300), ...sp }, g);
  const springR = H.el("path", { d: H.v6SpringD(590, 700), ...sp }, g);

  // --- port letters
  if (o.letters !== false) for (const k of ["T", "A", "P", "B"]) H.text(g, C.port[k] - 26, 300, k, { size: 32, anchor: "end" });

  const flows = H.el("g", { id: `${p}-flows` }, g);

  // spool position k ∈ {-1, 0, 1}; tween every geometry that follows the spool
  const lEnd = (k) => 300 + Math.min(0, k) * s, rEnd = (k) => 590 + Math.max(0, k) * s;
  const shift = (from, to, t, dur = 0.6) => {
    const e = { duration: dur, ease: "power2.inOut", immediateRender: false };
    tl.fromTo(spool, { x: from * s }, { x: to * s, ...e }, t);
    tl.fromTo(springL, { attr: { d: H.v6SpringD(190, lEnd(from)) } }, { attr: { d: H.v6SpringD(190, lEnd(to)) }, ...e }, t);
    tl.fromTo(springR, { attr: { d: H.v6SpringD(rEnd(from), 700) } }, { attr: { d: H.v6SpringD(rEnd(to), 700) }, ...e }, t);
    tl.fromTo(leftCh, { attr: { width: 110 + from * s } }, { attr: { width: 110 + to * s }, ...e }, t);
    tl.fromTo(rightCh, { attr: { x: 590 + from * s, width: 110 - from * s } }, { attr: { x: 590 + to * s, width: 110 - to * s }, ...e }, t);
  };
  const coil = (side, on, t) => {
    tl.fromTo([glow[side], ring[side]], { opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0, duration: 0.3, immediateRender: false }, t);
    if (pill[side]) H.v6Col(pill[side], "fill", on ? C.paper : C.glow, on ? C.glow : C.paper, t, 0.3);
  };
  return { g, spool, mid, landA, landB, plA, plB, springL, springR, leftCh, rightCh, gal, ports, flows, glow, ring, pill, shift, coil };
};

// Oil colours inside the valve for spool position k (pressure = orange from P, return = blue to T).
// The space between the lands (V.mid) always holds P; paint it once with H.v6Col(V.mid, "fill", …).
H.v6Colors = (k) => {
  const C = V6;
  if (k === 1) return { A: C.rt, B: C.pr, T: C.rt, leftCh: C.rt, rightCh: C.oil, gal: C.oil };
  if (k === -1) return { A: C.pr, B: C.rt, T: C.rt, leftCh: C.rt, rightCh: C.rt, gal: C.rt };
  return { A: C.oil, B: C.oil, T: C.oil, leftCh: C.oil, rightCh: C.oil, gal: C.oil };
};
H.v6Paint = (V, from, to, t, extra = {}) => {
  const a = H.v6Colors(from), z = H.v6Colors(to);
  const el = { A: V.ports.A, B: V.ports.B, T: V.ports.T, leftCh: V.leftCh, rightCh: V.rightCh, gal: V.gal };
  for (const k in el) {
    const list = [el[k], ...(extra[k] || [])];
    for (const e of list) if (a[k] !== z[k]) H.v6Col(e, e.tagName === "path" && e.getAttribute("fill") === "none" ? "stroke" : "fill", a[k], z[k], t);
  }
};

// ISO-style symbol of the same valve: 3 boxes (left = crossed, centre = closed, right = parallel),
// spring + solenoid at each end, ports A B (top) / P T (bottom) fixed at the centre box position.
// Box size bw × bh, centre box at x cx − bw/2 … cx + bw/2, top y0. The moving group slides ±bw.
H.v6Symbol = (parent, p, o = {}) => {
  const C = V6, f = H.f, cx = o.cx ?? 550, y0 = o.y0 ?? 300, bw = o.bw ?? 170, bh = o.bh ?? 130, sw = o.sw ?? 5;
  const g = H.el("g", { id: p }, parent);
  const xL = cx - bw / 2, x1 = xL + bw / 3, x2 = xL + (2 * bw) / 3, yB = y0 + bh;
  // fixed: highlight window at the port position, port stubs
  const win = H.el("rect", { x: f(xL), y: y0, width: bw, height: bh, fill: "#fff1c2" }, g);
  const mv = H.el("g", { id: `${p}-mv` }, g);
  const line = (d, par, a = {}) => H.el("path", { d, fill: "none", stroke: C.ink, "stroke-width": sw, "stroke-linecap": "butt", "stroke-linejoin": "miter", ...a }, par);
  for (let i = -1; i <= 1; i++) H.el("rect", { x: f(xL + i * bw), y: y0, width: bw, height: bh, fill: "none", stroke: C.ink, "stroke-width": sw }, mv);
  const arrow = (xa, ya, xb, yb, par) => line(H.arrowD(xa, ya, xb, yb, o.head ?? 20), par);
  const off = 10; // keep arrow tips inside the box
  // left box (spool right, solenoid a): P → B and A → T, crossed
  const bl = H.el("g", {}, mv), dx = -bw;
  const aPB_L = arrow(x1 + dx, yB - off, x2 + dx, y0 + off, bl);
  const aAT_L = arrow(x1 + dx, y0 + off, x2 + dx, yB - off, bl);
  // centre box: all four ports blocked (T-stubs)
  const bc = H.el("g", {}, mv), st = bh * 0.22, bar = bw * 0.11;
  for (const [x, y, dir] of [[x1, y0, 1], [x2, y0, 1], [x1, yB, -1], [x2, yB, -1]]) {
    line(`M ${f(x)} ${f(y)} L ${f(x)} ${f(y + dir * st)} M ${f(x - bar)} ${f(y + dir * st)} L ${f(x + bar)} ${f(y + dir * st)}`, bc);
  }
  // right box (spool left, solenoid b): P → A and B → T, parallel
  const br = H.el("g", {}, mv);
  const aPA_R = arrow(x1 + bw, yB - off, x1 + bw, y0 + off, br);
  const aBT_R = arrow(x2 + bw, y0 + off, x2 + bw, yB - off, br);
  // springs + solenoids at both ends
  const sol = {};
  for (const side of ["a", "b"]) {
    const sg = side === "a" ? -1 : 1, xe = cx + sg * 1.5 * bw; // outer edge of the end box
    const zl = bw * 0.3, ym = y0 + bh / 2, zz = bh * 0.22;
    let d = `M ${f(xe)} ${f(ym)}`;
    [0.125, 0.375, 0.625, 0.875].forEach((u, i) => { d += ` L ${f(xe + sg * zl * u)} ${f(ym + (i % 2 ? zz : -zz))}`; });
    d += ` L ${f(xe + sg * zl)} ${f(ym)}`;
    line(d, mv, { "stroke-width": sw * 0.8 });
    const sx = xe + sg * zl, w = bw * 0.32, h = bh * 0.46;
    const rx = sg < 0 ? sx - w : sx;
    sol[side] = H.el("rect", { x: f(rx), y: f(ym - h / 2), width: f(w), height: f(h), fill: C.paper, stroke: C.ink, "stroke-width": sw * 0.8 }, mv);
    line(`M ${f(rx)} ${f(ym + h / 2)} L ${f(rx + w)} ${f(ym - h / 2)}`, mv, { "stroke-width": sw * 0.7 });
    H.text(mv, rx + w / 2, ym - h / 2 - 12, side, { size: o.letter ?? 34, anchor: "middle" });
  }
  // port stubs (fixed)
  const pl = o.portLen ?? 50;
  const stubs = {
    A: line(`M ${f(x1)} ${y0} L ${f(x1)} ${f(y0 - pl)}`, g), B: line(`M ${f(x2)} ${y0} L ${f(x2)} ${f(y0 - pl)}`, g),
    P: line(`M ${f(x1)} ${f(yB)} L ${f(x1)} ${f(yB + pl)}`, g), T: line(`M ${f(x2)} ${f(yB)} L ${f(x2)} ${f(yB + pl)}`, g),
  };
  if (o.letters !== false) {
    const ls = o.portSize ?? 30;
    H.text(g, x1 - 12, y0 - pl + ls * 0.8, "A", { size: ls, anchor: "end" });
    H.text(g, x2 + 12, y0 - pl + ls * 0.8, "B", { size: ls, anchor: "start" });
    H.text(g, x1 - 12, yB + pl - 4, "P", { size: ls, anchor: "end" });
    H.text(g, x2 + 12, yB + pl - 4, "T", { size: ls, anchor: "start" });
  }
  g.appendChild(mv); // keep the moving boxes above the window and stubs
  const slide = (from, to, t, dur = 0.6) => tl.fromTo(mv, { x: from * bw }, { x: to * bw, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
  return { g, mv, win, sol, stubs, arrows: { PB: aPB_L, AT: aAT_L, PA: aPA_R, BT: aBT_R }, x1, x2, y0, yB, bw, bh, slide };
};

// ============================================================ EP19 additions
const E19 = {
  ink: "#1a1d21", muted: "#59606a", blue: "#1f5fbf", green: "#178a4e", red: "#d0233a", yel: "#f2a900",
  oil: "#c8961e", dirt: "#7a6744", rag: "#e4ecf7", cable: "#2b3036", conn: "#3d434b", pipeC: "#7ea2df", paper: "#fffdf8",
};

// Oil drop (teardrop) whose round bottom sits at (x, y); absolute coordinates so GSAP can move it with x / y.
E19.drop = (parent, x, y, s = 1, o = {}) => {
  const f = H.f, q = (dx, dy) => `${f(x + dx * s)} ${f(y + dy * s)}`;
  return H.el("path", {
    ...(o.id ? { id: o.id } : {}),
    d: `M ${q(0, -24)} C ${q(5, -15)} ${q(10, -9)} ${q(10, -4)} A ${f(10 * s)} ${f(10 * s)} 0 0 1 ${q(-10, -4)} C ${q(-10, -9)} ${q(-5, -15)} ${q(0, -24)} Z`,
    fill: E19.oil, stroke: E19.ink, "stroke-width": o.sw ?? 2, opacity: o.opacity ?? 0,
  }, parent);
};
// A drop that forms at its spot and falls `fall` units, again and again from t0 until t1 (absolute seconds).
E19.drip = (drop, t0, t1, fall = 60, cycle = 1.1) => {
  const n = Math.max(1, Math.floor((t1 - t0) / cycle));
  for (let i = 0; i < n; i++) {
    const t = t0 + i * cycle;
    tl.fromTo(drop, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t);
    tl.fromTo(drop, { y: 0 }, { y: fall, duration: 0.45, ease: "power2.in", immediateRender: false }, t + 0.5);
    tl.fromTo(drop, { opacity: 1 }, { opacity: 0, duration: 0.12, immediateRender: false }, t + 0.85);
  }
};
// Opacity change, seek-safe (from must equal the element's state before t).
E19.op = (el, from, to, t, dur = 0.3) => tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur, immediateRender: false }, t);
// Sound waves: arcs around (x, y) facing direction `dir` (degrees, clockwise from 3 o'clock); they blink from t0 to t1.
E19.waves = (parent, x, y, dir, o = {}) => {
  const g = H.el("g", { ...(o.id ? { id: o.id } : {}) }, parent);
  const arcs = (o.r || [26, 44, 62]).map((r) => H.el("path", { d: H.arcD(x, y, r, dir - (o.span ?? 32), dir + (o.span ?? 32)), fill: "none", stroke: o.color || E19.blue, "stroke-width": o.w ?? 6, "stroke-linecap": "round", opacity: 0 }, g));
  // fade in, pulse between full and faint (so a still frame always shows them), fade out at t1 (if given)
  g.run = (t0, t1) => arcs.forEach((a, i) => {
    const s = t0 + i * 0.12, per = 0.45, m = Math.max(2, 2 * Math.floor((t1 - s - 0.45) / per / 2));
    tl.fromTo(a, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, s);
    tl.fromTo(a, { opacity: 1 }, { opacity: 0.35, duration: per, yoyo: true, repeat: m - 1, ease: "sine.inOut", immediateRender: false }, s + 0.2);
    if (o.fadeOut !== false) tl.fromTo(a, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, t1);
  });
  return g;
};
// Green tick in a circle (drawn as paths: the fonts may lack ✓).
E19.tick = (parent, cx, cy, r, o = {}) => {
  const g = H.el("g", { ...(o.id ? { id: o.id } : {}), opacity: o.opacity ?? 1 }, parent), f = H.f;
  H.el("circle", { cx, cy, r, fill: o.fill || E19.green }, g);
  H.el("path", { d: `M ${f(cx - r * 0.45)} ${f(cy + r * 0.02)} L ${f(cx - r * 0.12)} ${f(cy + r * 0.34)} L ${f(cx + r * 0.48)} ${f(cy - r * 0.32)}`, fill: "none", stroke: "#ffffff", "stroke-width": f(r * 0.22), "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  return g;
};
// Pipe (ink outline + light-blue oil) along path d.
E19.pipe = (parent, d, w = 12) => {
  H.el("path", { d, fill: "none", stroke: E19.ink, "stroke-width": w + 6, "stroke-linejoin": "round" }, parent);
  return H.el("path", { d, fill: "none", stroke: E19.pipeC, "stroke-width": w, "stroke-linejoin": "round" }, parent);
};

// Solenoid valve (EP06 drawing) as installed: on a subplate (the mounting of p.30), two mounting bolts, a connector with
// a fixing screw on each solenoid and the cables to the control panel. Local units as H.v6Valve:
//   subplate x 130–760, y 268–330 (the ports run through it; body/subplate joint = y 270)
//   bolts at x 180 / 710 (heads y −8…14, washer 14–20) · connectors x 50–126 (a) / 764–840 (b), y 24–72, screw on top
//   cables up to y −40 → control panel box x 372–518, y −64…−16.  o.pipes: port pipes below the subplate (y 330–366).
// Returns { w, V, sub, bolts[2], conns[2], screws[2], cables[2], box }.
H.e19Sol = (parent, p, o = {}) => {
  const C = V6, f = H.f;
  const w = H.el("g", { id: `${p}-w` }, parent);
  const sub = H.el("g", { id: `${p}-sub` }, w);
  H.el("rect", { x: 130, y: 268, width: 630, height: 62, fill: C.metal }, sub);
  H.el("path", { d: RV.hatchD([[132, 270, 626, 58]]), fill: "none", stroke: C.hatch, "stroke-width": 3 }, sub);
  H.el("rect", { x: 130, y: 268, width: 630, height: 62, fill: "none", stroke: C.ink, "stroke-width": 5 }, sub);
  if (o.pipes) for (const k of ["T", "A", "P", "B"]) H.el("rect", { x: C.port[k] - 15, y: 330, width: 30, height: 36, fill: C.oil, stroke: C.ink, "stroke-width": 4 }, sub);
  const V = H.v6Valve(w, p, { pills: false, letters: false, stub: 60 });
  // mounting bolts (side view: hex head on a washer)
  const bolts = [180, 710].map((x, i) => {
    const bg = H.el("g", { id: `${p}-bolt${i + 1}` }, w);
    H.el("rect", { x: x - 22, y: 13, width: 44, height: 8, rx: 2, fill: C.dark, stroke: C.ink, "stroke-width": 2.5 }, bg);
    H.el("rect", { x: x - 17, y: -9, width: 34, height: 23, rx: 2, fill: "#9aa1aa", stroke: C.ink, "stroke-width": 3 }, bg);
    H.el("path", { d: `M ${x - 6} -9 V 14 M ${x + 6} -9 V 14`, stroke: C.ink, "stroke-width": 2 }, bg);
    return bg;
  });
  // cables (behind the connectors) + control panel box
  const cabD = {
    a: "M 36 48 H 24 Q 6 48 6 30 V -22 Q 6 -40 24 -40 H 372",
    b: "M 854 48 H 866 Q 884 48 884 30 V -22 Q 884 -40 866 -40 H 518",
  };
  const cables = ["a", "b"].map((s) => H.el("path", { id: `${p}-cab${s}`, d: cabD[s], fill: "none", stroke: E19.cable, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, w));
  const box = H.el("g", { id: `${p}-box` }, w);
  H.el("rect", { x: 372, y: -64, width: 146, height: 48, rx: 8, fill: E19.paper, stroke: C.ink, "stroke-width": 3 }, box);
  H.text(box, 445, -31, o.boxLabel ?? "ตู้ควบคุม", { size: 25, anchor: "middle" });
  const conns = [], screws = [];
  for (const side of ["a", "b"]) {
    const x0 = side === "a" ? 50 : 764;
    const cg = H.el("g", { id: `${p}-con${side}` }, w);
    const gx = side === "a" ? x0 - 14 : x0 + 76;
    H.el("rect", { x: gx, y: 36, width: 14, height: 24, rx: 3, fill: C.muted, stroke: C.ink, "stroke-width": 2.5 }, cg);
    H.el("rect", { x: x0, y: 24, width: 76, height: 48, rx: 8, fill: E19.conn, stroke: C.ink, "stroke-width": 3 }, cg);
    H.el("path", { d: `M ${x0 + 14} 38 H ${x0 + 62} M ${x0 + 14} 50 H ${x0 + 62}`, stroke: "#59606a", "stroke-width": 3 }, cg);
    screws.push(H.el("rect", { x: x0 + 27, y: 13, width: 22, height: 12, rx: 2, fill: "#c9ced4", stroke: C.ink, "stroke-width": 2.5 }, cg));
    conns.push(cg);
  }
  return { w, V, sub, bolts, conns, screws, cables, box };
};

// Relief valve pilot head (EP05 drawing) + the circuit pressure gauge on its line, for a 460 × 170 card slot.
// The blue mark on the gauge is the setting pressure (no numbers: the deck gives none). Returns { g, P, G }.
H.e19RvMini = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  E19.pipe(g, "M 31 100 V 142 H 322", 8);
  const z = H.el("g", { transform: "translate(-99 15) scale(0.42)" }, g);
  const P = RV.pilot(z, `${p}-x`, { standalone: true });
  const G = H.gauge(g, 372, 90, 70, { id: `${p}-g`, min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, marks: [{ v: 6, color: RV.blue }], value: 6 });
  return { g, P, G };
};
