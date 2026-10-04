// EP12 — Broken solenoid valve: burned coil (OPL 5-B-4). Shared by s1 (title), s2 (phenomenon), s3 (causes 1–3),
// s4 (causes 4–5 + why the coil overheats), s5 (early signs).
//
// The valve drawing is copied from EP06 (training/hydraulic-series/ep06/lib.js) so the two episodes look like a pair,
// with these additions for the trouble case (PDF p.16 figure: coil, central core of iron, push rod, spring, spool):
//   · a fixed iron core in each solenoid; the plunger sits 50 units from it when off (the air gap) and closes the gap
//     when the spool travels its full stroke; `gap[side]` is a red overlay showing the gap that is still open
//   · heat / burn overlays on the coil windings, heat waves and smoke
//
// Cross-section, local units (draw into a <g> that is already translated/scaled):
//   solenoid "a" housing x 5–170 · body x 170–720 (y 20–270) · solenoid "b" housing x 720–885
//   plunger a x 60–96 at rest, iron core a x 146–172 (mirrored for b: core 718–744, plunger 794–830)
//   bore x 190–700, y 115–205 (axis y 160) · ports at the bottom: T 208, A 325, P 445, B 565 (width 36)
//   spool lands 300–350 (covers A) and 540–590 (covers B); stroke s = 50 each way.
//   Spool right (+1): P→B, A→T.  Spool left (−1): P→A, B→T.  Centre (0): every port covered — closed centre.

const V12 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", hatch: "#ada38d", spool: "#b4bcc6", dark: "#8f969f",
  iron: "#6b727b", paper: "#fffdf8", air: "#ece7db", oil: "#f6e6ad", pr: "#ef7d1a", rt: "#7fb2e6", copper: "#c48a52",
  glow: "#ffd23f", yel: "#f2a900", blue: "#1f5fbf", green: "#178a4e", red: "#d0233a",
  hot: "#e2452b", char: "#2f2622", smoke: "#6f747b",
  s: 50, pw: 36, port: { T: 208, A: 325, P: 445, B: 565 },
};

// Coil spring between x0 and x1 on the valve axis (same command list for any x0/x1 → tweenable).
H.v12SpringD = (x0, x1, yc = 160, amp = 30, n = 6) => {
  const f = H.f, k = 2 * n;
  let d = `M ${f(x0)} ${yc}`;
  for (let i = 1; i < k; i++) d += ` L ${f(x0 + ((x1 - x0) * i) / k)} ${i % 2 ? yc - amp : yc + amp}`;
  d += ` L ${f(x1)} ${yc}`;
  d += ` M ${f(x0)} ${yc - amp - 6} L ${f(x0)} ${yc + amp + 6} M ${f(x1)} ${yc - amp - 6} L ${f(x1)} ${yc + amp + 6}`;
  return d;
};

// Filled arrowhead (triangle) pointing in direction dir ("up" | "down" | "left" | "right") with its tip at (x, y).
H.v12Head = (parent, x, y, dir, o = {}) => {
  const L = o.len ?? 26, W = o.w ?? 15, f = H.f;
  const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  const bx = x - v[0] * L, by = y - v[1] * L, px = -v[1], py = v[0];
  return H.el("path", { d: `M ${f(x)} ${f(y)} L ${f(bx + px * W)} ${f(by + py * W)} L ${f(bx - px * W)} ${f(by - py * W)} Z`, fill: o.fill || "#ffffff", stroke: o.stroke || V12.ink, "stroke-width": o.sw ?? 3, "stroke-linejoin": "round" }, parent);
};

// Dashes along a path (oil flow, current, heat shimmer), moving forward while their group is visible.
H.v12Flow = (parent, d, o = {}) =>
  H.el("path", { d, fill: "none", stroke: o.color || "#ffffff", "stroke-width": o.w ?? 6, "stroke-dasharray": o.dash || "14 12", "stroke-linecap": "butt", "stroke-linejoin": "round" }, parent);
// Show a flow group from t0 to t1 (seconds, absolute) and run its dashes.
H.v12Run = (group, lines, t0, t1, o = {}) => {
  tl.fromTo(group, { opacity: 0 }, { opacity: o.op ?? 1, duration: 0.3, immediateRender: false }, t0);
  const dur = Math.max(0.5, t1 - t0), per = o.per ?? 26, sp = o.speed ?? 2.6;
  for (const ln of lines) tl.fromTo(ln, { strokeDashoffset: 0 }, { strokeDashoffset: -per * Math.round(dur * sp), duration: dur, ease: "none", immediateRender: false }, t0);
  if (!o.keep) tl.fromTo(group, { opacity: o.op ?? 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, t1);
};
// Colour change of an SVG attribute (fill / stroke), seek-safe.
H.v12Col = (el, attr, from, to, t, dur = 0.35) =>
  tl.fromTo(el, { attr: { [attr]: from } }, { attr: { [attr]: to }, duration: dur, immediateRender: false }, t);
// Opacity change, seek-safe (from must equal the element's state before t).
H.v12Op = (el, from, to, t, dur = 0.3) =>
  tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur, immediateRender: false }, t);

// Smoke rising from (x, y) between t0 and t1 (absolute seconds): puffs of three circles that drift up, swell and fade.
// Only translate (x / y), opacity and the circles' radius are tweened. Every puff starts and ends invisible (seek-safe).
H.v12Smoke = (parent, x, y, t0, t1, o = {}) => {
  const g = H.el("g", {}, parent), n = o.n ?? 4, rise = o.rise ?? 95, cyc = o.cycle ?? 1.6, r0 = o.r ?? 9;
  const dx = [0, -10, 9, -4, 12];
  for (let i = 0; i < n; i++) {
    const px = x + dx[i % dx.length];
    const pf = H.el("g", { opacity: 0 }, g);
    const cs = [[-r0 * 0.8, 0, 1], [r0 * 0.8, -r0 * 0.2, 0.85], [0, -r0 * 0.9, 0.9]].map(([ox, oy, k]) =>
      [H.el("circle", { cx: px + ox, cy: y + oy, r: r0 * k * 0.6, fill: o.color || V12.smoke }, pf), r0 * k]);
    const sw = (i % 2 ? -1 : 1) * 6;
    let first = true;
    for (let t = t0 + i * (cyc / n); t + cyc <= t1 + 0.01; t += cyc) {
      const ir = first ? {} : { immediateRender: false };
      first = false;
      tl.fromTo(pf, { y: 0, x: 0, opacity: 0 }, { y: -rise * 0.3, x: sw, opacity: o.op ?? 0.6, duration: cyc * 0.3, ease: "power1.out", ...ir }, t);
      tl.fromTo(pf, { y: -rise * 0.3, x: sw, opacity: o.op ?? 0.6 }, { y: -rise, x: -sw, opacity: 0, duration: cyc * 0.7, ease: "power1.in", immediateRender: false }, t + cyc * 0.3);
      for (const [c, r] of cs) tl.fromTo(c, { attr: { r: r * 0.6 } }, { attr: { r: r * 1.7 }, duration: cyc, ease: "none", immediateRender: false }, t);
    }
  }
  return g;
};

// Heat shimmer: wavy vertical lines above (x, y), shown from t0 to t1 (absolute seconds).
H.v12Heatwave = (parent, x, y, t0, t1, o = {}) => {
  const g = H.el("g", { opacity: 0 }, parent), h = o.h ?? 60, gap = o.gap ?? 26, n = o.n ?? 3, f = H.f;
  const lines = [];
  for (let i = 0; i < n; i++) {
    const x0 = x + (i - (n - 1) / 2) * gap;
    let d = `M ${f(x0)} ${f(y)}`;
    for (let k = 1; k <= 6; k++) d += ` Q ${f(x0 + (k % 2 ? 8 : -8))} ${f(y - (k - 0.5) * (h / 6))} ${f(x0)} ${f(y - k * (h / 6))}`;
    lines.push(H.v12Flow(g, d, { color: o.color || V12.hot, w: o.w ?? 5, dash: "12 8" }));
  }
  H.v12Run(g, lines, t0, t1, { per: 20, speed: 2 });
  return g;
};

// The valve cross-section. o: { stub (port stub length below the body, default 30), letters (T A P B, default true),
//   pills ("full" → "โซลินอยด์ a" | "short" → "a" | false) }.
// Returns handles + helpers: shift(from, to, t, dur), coil(side, on, t), heat(side, from, to, t, dur), burn(side, t, dur).
H.v12Valve = (parent, p, o = {}) => {
  const C = V12, s = C.s, stub = o.stub ?? 30, f = H.f;
  const g = H.el("g", { id: p }, parent);
  const R = (x, y, w, h, a, par = g) => H.el("rect", { x: f(x), y: f(y), width: f(w), height: f(h), ...a }, par);

  // --- solenoid housings (coil windings + plunger channel + fixed iron core)
  const glow = {}, ring = {}, pill = {}, hot = {}, char = {}, core = {};
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
    hot[side] = H.el("g", { opacity: 0 }, hg);
    char[side] = H.el("g", { opacity: 0 }, hg);
    for (const y of [84, 186]) {
      R(mx(22, 128), y, 128, 50, { fill: C.glow, opacity: 0.85 }, glow[side]);
      R(mx(22, 128), y, 128, 50, { fill: C.hot, opacity: 0.9 }, hot[side]);
      R(mx(22, 128), y, 128, 50, { fill: C.char, opacity: 0.94 }, char[side]);
      for (let k = 1; k < 6; k++) H.el("line", { x1: f(mx(30, 108)), x2: f(mx(30, 108) + (k % 2 ? 70 : 108)), y1: y + k * 8.3, y2: y + k * 8.3, stroke: "#5a4638", "stroke-width": 1.6 }, char[side]);
    }
    R(mx(22, 150), 134, 150, 52, { fill: C.air }, hg);
    core[side] = R(mx(146, 26), 136, 26, 48, { fill: C.iron, stroke: C.ink, "stroke-width": 3 }, hg);
    if (o.pills !== false) {
      const full = o.pills === "full";
      const w = full ? 168 : 56;
      const cx = side === "a" ? 87.5 : 802.5;
      pill[side] = R(cx - w / 2, 22, w, 40, { rx: 20, fill: C.paper, stroke: C.ink, "stroke-width": 3 }, hg);
      H.text(hg, cx, 52, full ? `โซลินอยด์ ${side}` : side, { size: full ? 26 : 30, anchor: "middle" });
    }
  }

  // --- body (hatched cut face, hatch lines drawn explicitly — <pattern> does not render in frames) and the oil passages
  R(170, 20, 550, 250, { rx: 6, fill: C.metal });
  const hatch = H.el("g", { stroke: C.hatch, "stroke-width": 3 }, g);
  for (let x = 170 - 250; x < 720; x += 22) {
    const x0 = Math.max(170, x), y0 = 270 - (x0 - x), x1 = Math.min(720, x + 250), y1 = 270 - (x1 - x);
    if (x1 > x0) H.el("line", { x1: f(x0), y1: f(y0), x2: f(x1), y2: f(y1) }, hatch);
  }
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

  // --- air gap between plunger and iron core (red overlay, hidden until used)
  const gap = {
    a: R(96, 137, 50, 46, { fill: C.red, opacity: 0 }),
    b: R(744, 137, 50, 46, { fill: C.red, opacity: 0 }),
  };

  // --- moving assembly: plunger a + push rod a + spool + push rod b + plunger b
  const spool = H.el("g", { id: `${p}-spool` }, g);
  const mid = R(350, 115, 190, 90, { fill: C.oil }, spool);
  R(350, 151, 190, 18, { fill: C.spool, stroke: C.ink, "stroke-width": 2.5 }, spool);
  R(96, 154, 204, 12, { fill: C.spool, stroke: C.ink, "stroke-width": 2 }, spool);
  R(590, 154, 204, 12, { fill: C.spool, stroke: C.ink, "stroke-width": 2 }, spool);
  const landA = R(300, 117, 50, 86, { fill: C.spool, stroke: C.ink, "stroke-width": 3.5 }, spool);
  const landB = R(540, 117, 50, 86, { fill: C.spool, stroke: C.ink, "stroke-width": 3.5 }, spool);
  const plA = R(60, 141, 36, 38, { fill: C.dark, stroke: C.ink, "stroke-width": 3 }, spool);
  const plB = R(794, 141, 36, 38, { fill: C.dark, stroke: C.ink, "stroke-width": 3 }, spool);

  // --- centering springs (left: wall 190 → land face 300; right: land face 590 → wall 700)
  const sp = { fill: "none", stroke: C.ink, "stroke-width": 4, "stroke-linejoin": "round" };
  const springL = H.el("path", { d: H.v12SpringD(190, 300), ...sp }, g);
  const springR = H.el("path", { d: H.v12SpringD(590, 700), ...sp }, g);

  // --- port letters
  if (o.letters !== false) for (const k of ["T", "A", "P", "B"]) H.text(g, C.port[k] - 26, 300, k, { size: 32, anchor: "end" });

  const flows = H.el("g", { id: `${p}-flows` }, g);

  // spool position k (−1 … 1, fractions allowed for a spool that stops part-way); tween everything that follows it
  const lEnd = (k) => 300 + Math.min(0, k) * s, rEnd = (k) => 590 + Math.max(0, k) * s;
  const gapA = (k) => ({ x: 96 + k * s, width: Math.max(0, 50 - k * s) });
  const gapB = (k) => ({ x: 744, width: Math.max(0, 50 + k * s) });
  const shift = (from, to, t, dur = 0.6, ease = "power2.inOut") => {
    const e = { duration: dur, ease, immediateRender: false };
    tl.fromTo(spool, { x: from * s }, { x: to * s, ...e }, t);
    tl.fromTo(springL, { attr: { d: H.v12SpringD(190, lEnd(from)) } }, { attr: { d: H.v12SpringD(190, lEnd(to)) }, ...e }, t);
    tl.fromTo(springR, { attr: { d: H.v12SpringD(rEnd(from), 700) } }, { attr: { d: H.v12SpringD(rEnd(to), 700) }, ...e }, t);
    tl.fromTo(leftCh, { attr: { width: 110 + from * s } }, { attr: { width: 110 + to * s }, ...e }, t);
    tl.fromTo(rightCh, { attr: { x: 590 + from * s, width: 110 - from * s } }, { attr: { x: 590 + to * s, width: 110 - to * s }, ...e }, t);
    tl.fromTo(gap.a, { attr: gapA(from) }, { attr: gapA(to), ...e }, t);
    tl.fromTo(gap.b, { attr: gapB(from) }, { attr: gapB(to), ...e }, t);
  };
  const coil = (side, on, t) => {
    tl.fromTo([glow[side], ring[side]], { opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0, duration: 0.3, immediateRender: false }, t);
    if (pill[side]) H.v12Col(pill[side], "fill", on ? C.paper : C.glow, on ? C.glow : C.paper, t, 0.3);
  };
  // heat level 0 … 1 of the coil windings (hot overlay opacity)
  const heat = (side, from, to, t, dur = 1.2) => H.v12Op(hot[side], from, to, t, dur);
  const burn = (side, t, dur = 0.8) => H.v12Op(char[side], 0, 1, t, dur);
  return { g, spool, mid, landA, landB, plA, plB, springL, springR, leftCh, rightCh, gal, ports, flows, glow, ring, pill, hot, char, core, gap, shift, coil, heat, burn };
};

// Oil colours inside the valve for spool position k (pressure = orange from P, return = blue to T).
H.v12Colors = (k) => {
  const C = V12;
  if (k === 1) return { A: C.rt, B: C.pr, T: C.rt, leftCh: C.rt, rightCh: C.oil, gal: C.oil };
  if (k === -1) return { A: C.pr, B: C.rt, T: C.rt, leftCh: C.rt, rightCh: C.rt, gal: C.rt };
  return { A: C.oil, B: C.oil, T: C.oil, leftCh: C.oil, rightCh: C.oil, gal: C.oil };
};
H.v12Paint = (V, from, to, t, extra = {}) => {
  const a = H.v12Colors(from), z = H.v12Colors(to);
  const el = { A: V.ports.A, B: V.ports.B, T: V.ports.T, leftCh: V.leftCh, rightCh: V.rightCh, gal: V.gal };
  for (const k in el) {
    const list = [el[k], ...(extra[k] || [])];
    for (const e of list) if (a[k] !== z[k]) H.v12Col(e, e.tagName === "path" && e.getAttribute("fill") === "none" ? "stroke" : "fill", a[k], z[k], t);
  }
};

// ISO-style symbol of the same valve (copied from EP06): 3 boxes (left = crossed, centre = closed, right = parallel),
// spring + solenoid at each end, ports A B (top) / P T (bottom) fixed at the centre box position.
H.v12Symbol = (parent, p, o = {}) => {
  const C = V12, f = H.f, cx = o.cx ?? 550, y0 = o.y0 ?? 300, bw = o.bw ?? 170, bh = o.bh ?? 130, sw = o.sw ?? 5;
  const g = H.el("g", { id: p }, parent);
  const xL = cx - bw / 2, x1 = xL + bw / 3, x2 = xL + (2 * bw) / 3, yB = y0 + bh;
  const win = H.el("rect", { x: f(xL), y: y0, width: bw, height: bh, fill: "#fff1c2" }, g);
  const mv = H.el("g", { id: `${p}-mv` }, g);
  const line = (d, par, a = {}) => H.el("path", { d, fill: "none", stroke: C.ink, "stroke-width": sw, "stroke-linecap": "butt", "stroke-linejoin": "miter", ...a }, par);
  for (let i = -1; i <= 1; i++) H.el("rect", { x: f(xL + i * bw), y: y0, width: bw, height: bh, fill: "none", stroke: C.ink, "stroke-width": sw }, mv);
  const arrow = (xa, ya, xb, yb, par) => line(H.arrowD(xa, ya, xb, yb, o.head ?? 20), par);
  const off = 10;
  const bl = H.el("g", {}, mv), dx = -bw;
  const aPB_L = arrow(x1 + dx, yB - off, x2 + dx, y0 + off, bl);
  const aAT_L = arrow(x1 + dx, y0 + off, x2 + dx, yB - off, bl);
  const bc = H.el("g", {}, mv), st = bh * 0.22, bar = bw * 0.11;
  for (const [x, y, dir] of [[x1, y0, 1], [x2, y0, 1], [x1, yB, -1], [x2, yB, -1]]) {
    line(`M ${f(x)} ${f(y)} L ${f(x)} ${f(y + dir * st)} M ${f(x - bar)} ${f(y + dir * st)} L ${f(x + bar)} ${f(y + dir * st)}`, bc);
  }
  const br = H.el("g", {}, mv);
  const aPA_R = arrow(x1 + bw, yB - off, x1 + bw, y0 + off, br);
  const aBT_R = arrow(x2 + bw, y0 + off, x2 + bw, yB - off, br);
  const sol = {};
  for (const side of ["a", "b"]) {
    const sg = side === "a" ? -1 : 1, xe = cx + sg * 1.5 * bw;
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
  g.appendChild(mv);
  const slide = (from, to, t, dur = 0.6) => tl.fromTo(mv, { x: from * bw }, { x: to * bw, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
  return { g, mv, win, sol, stubs, arrows: { PB: aPB_L, AT: aAT_L, PA: aPA_R, BT: aBT_R }, x1, x2, y0, yB, bw, bh, slide };
};

// Red ring that pulses around a spot (absolute time t, finite repeats).
H.v12Ring = (parent, cx, cy, rx, ry, t, o = {}) => {
  const e = H.el("ellipse", { cx, cy, rx, ry, fill: "none", stroke: V12.red, "stroke-width": o.w ?? 7, opacity: 0 }, parent);
  tl.fromTo(e, { opacity: 0, attr: { rx: rx * 1.25, ry: ry * 1.25 } }, { opacity: 1, attr: { rx, ry }, duration: 0.35, ease: "power2.out" }, t);
  tl.fromTo(e, { attr: { rx, ry } }, { attr: { rx: rx * 1.08, ry: ry * 1.08 }, duration: 0.3, yoyo: true, repeat: o.repeat ?? 5, ease: "sine.inOut", immediateRender: false }, t + 0.4);
  return e;
};

// Red cross (drawn as paths, no glyph) centred at (x, y).
H.v12Cross = (parent, x, y, r, o = {}) =>
  H.el("path", { d: `M ${x - r} ${y - r} L ${x + r} ${y + r} M ${x + r} ${y - r} L ${x - r} ${y + r}`, fill: "none", stroke: o.color || V12.red, "stroke-width": o.w ?? 9, "stroke-linecap": "round", opacity: o.opacity ?? 1 }, parent);
// Check mark (path).
H.v12Check = (parent, x, y, r, o = {}) =>
  H.el("path", { d: `M ${x - r} ${y} L ${x - r * 0.3} ${y + r * 0.7} L ${x + r} ${y - r * 0.7}`, fill: "none", stroke: o.color || V12.green, "stroke-width": o.w ?? 10, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: o.opacity ?? 1 }, parent);
