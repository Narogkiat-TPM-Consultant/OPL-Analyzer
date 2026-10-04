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
  const svg = g.ownerSVGElement;
  const defs = H.el("defs", {}, svg);
  const pat = H.el("pattern", { id: `${p}-hatch`, width: 16, height: 16, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  H.el("rect", { width: 16, height: 16, fill: C.metal }, pat);
  H.el("line", { x1: 0, y1: 0, x2: 0, y2: 16, stroke: C.hatch, "stroke-width": 3 }, pat);
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
  R(170, 20, 550, 250, { rx: 6, fill: `url(#${p}-hatch)`, stroke: C.ink, "stroke-width": 5 });
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
