// EP16 — Daily check (3): work end, device stopped (OPL 5-C-3, PDF p.20).
// H.k16Unit: side view of a hydraulic power unit (tank with cleaning cover + level glass, pump, motor, pressure
//   gauge, valve block) piped to a cylinder on a machine frame, standing on the floor. Used by the title (s1),
//   the gauge check (s3) and the cleaning route (s5). Coordinates: 1100 × 640.
//   The three after-work check spots of the deck are built in: oil leak on the tank (streak under the lid seam),
//   oil on the floor around the machine (puddle), dirt on the sliding area (cylinder rod).
// H.k16Mini: the same spots as a small picture for the judgment cards (360 × 200).
// Names here must not clash with hyd_lib.js (HC, H.hyd* are taken).
const K6 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", steel: "#b9bfc7", tank: "#ddd6c4",
  blue: "#1f5fbf", oil: "#f2c94c", oilDk: "#c99a1c", oilBg: "#fbe7a1", paper: "#fffdf8", red: "#d0233a",
  green: "#178a4e", dirt: "#4b3d24", dust: "#8a7d63", floor: "#e6dfd0", rag: "#e4ecf8", tube: "#dfe8f6",
};

// Tween one numeric property along a pure function of absolute time fn(t) between tA and tB (seekable).
// o.attr → SVG attribute; o.extra → constant props on both ends (e.g. svgOrigin).
H.k16Fn = (el, prop, fn, tA, tB, o = {}) => {
  const d = Math.max(0.001, tB - tA), v0 = fn(tA);
  const wrap = (v) => (o.attr ? { attr: { [prop]: v } } : { [prop]: v });
  tl.fromTo(el, { ...wrap(v0), ...(o.extra || {}) }, { ...wrap(v0 + 1), ...(o.extra || {}), duration: d, ease: (q) => fn(tA + q * d) - v0, immediateRender: o.ir ?? false }, tA);
};
H.k16Clamp = (v) => Math.max(0, Math.min(1, v));

// Oil drop hanging from (x, y), body radius s (from EP09).
H.k16DropD = (x, y, s) => {
  const f = H.f, cy = y + 1.5 * s;
  return `M ${f(x)} ${f(y)} C ${f(x + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x + s)} ${f(cy - 0.3 * s)} ${f(x + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(cy + 0.25 * s)} C ${f(x - s)} ${f(cy - 0.3 * s)} ${f(x - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x)} ${f(y)} Z`;
};

// Wet oil streak running down a wall from (x, y0) to y1, width w; ends in a hanging drop.
H.k16Streak = (parent, x, y0, y1, w, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent), f = H.f, h = w / 2;
  H.el("path", { d: `M ${f(x - h)} ${y0} C ${f(x - h)} ${f(y0 + (y1 - y0) * 0.4)} ${f(x - h * 0.4)} ${f(y0 + (y1 - y0) * 0.75)} ${f(x - h * 0.3)} ${y1} L ${f(x + h * 0.3)} ${y1} C ${f(x + h * 0.5)} ${f(y0 + (y1 - y0) * 0.7)} ${f(x + h)} ${f(y0 + (y1 - y0) * 0.35)} ${f(x + h)} ${y0} Z`, fill: K6.oil, stroke: K6.oilDk, "stroke-width": o.sw ?? 2.5 }, g);
  H.el("path", { d: `M ${f(x - h * 0.3)} ${f(y0 + 6)} L ${f(x - h * 0.15)} ${f(y1 - 10)}`, fill: "none", stroke: "#ffffff", "stroke-width": o.shine ?? 2.5, opacity: 0.75 }, g);
  H.el("path", { d: H.k16DropD(x, y1 - 2, o.drop ?? w * 0.42), fill: K6.oil, stroke: K6.oilDk, "stroke-width": o.sw ?? 2.5 }, g);
  return g;
};

// Dirt specks on a surface (deterministic positions inside x0..x1, y0..y1).
H.k16Specks = (parent, x0, x1, y0, y1, n, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent), f = H.f;
  for (let i = 0; i < n; i++) {
    const u = (i * 0.618034 + 0.13) % 1, v = (i * 0.414214 + 0.37) % 1;
    const r = (o.r ?? 3.2) * (0.7 + 0.6 * ((i * 0.7548) % 1));
    H.el("ellipse", { cx: f(x0 + u * (x1 - x0)), cy: f(y0 + v * (y1 - y0)), rx: f(r * 1.3), ry: f(r), fill: o.fill || K6.dirt, opacity: o.op ?? 0.9 }, g);
  }
  return g;
};

// Small label chip (white box + text), hidden at start. o: { size, anchor, num (blue number disc), color, w }
H.k16Chip = (parent, id, x, y, str, o = {}) => {
  const g = H.el("g", { id, opacity: o.show ? 1 : 0 }, parent);
  const size = o.size || 24, num = o.num != null, w = o.w || str.length * size * 0.5 + 28 + (num ? size + 14 : 0), h = size + 18;
  const x0 = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  H.el("rect", { x: H.f(x0), y: H.f(y - h / 2), width: H.f(w), height: h, rx: 10, fill: o.fill || K6.paper, stroke: o.stroke || K6.ink, "stroke-width": 3 }, g);
  let tx = x0 + 14;
  if (num) {
    H.el("circle", { cx: H.f(tx + size / 2), cy: y, r: H.f(size * 0.62), fill: K6.blue }, g);
    H.text(g, tx + size / 2, y + size * 0.36, String(o.num), { size: Math.round(size * 0.9), anchor: "middle", fill: "#ffffff" });
    tx += size + 14;
  }
  H.text(g, tx, y + size * 0.36, str, { size, anchor: "start", fill: o.color || K6.ink });
  return g;
};

// Red ring that pops on and pulses a few times (finite).
H.k16Ring = (parent, id, cx, cy, rx, ry, t, o = {}) => {
  const c = H.el("ellipse", { id, cx, cy, rx, ry, fill: "none", stroke: o.color || K6.red, "stroke-width": o.sw ?? 6, opacity: 0 }, parent);
  tl.fromTo(c, { opacity: 0, scale: 1.25, svgOrigin: `${cx} ${cy}` }, { opacity: 1, scale: 1, svgOrigin: `${cx} ${cy}`, duration: 0.35, ease: "back.out(2)" }, t);
  if (o.pulse !== false)
    tl.to(c, { scale: 1.1, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: (o.n ?? 2) * 2 - 1, ease: "sine.inOut" }, t + 0.4);
  return c;
};

// Rag (cleaning cloth) centred on its own origin; move it with x / y. Stains start hidden.
H.k16Rag = (parent, id, o = {}) => {
  const s = o.s ?? 1, f = H.f;
  const g = H.el("g", { id, opacity: 0 }, parent);
  const inner = H.el("g", { transform: `scale(${s})` }, g);
  H.el("path", { d: "M -40 -22 Q -22 -34 0 -26 Q 24 -36 42 -20 Q 33 0 40 24 Q 16 33 -2 26 Q -24 36 -42 22 Q -33 0 -40 -22 Z", fill: K6.rag, stroke: K6.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, inner);
  const oil = H.el("path", { d: "M -26 6 Q -14 -6 4 2 Q 18 10 10 20 Q -6 26 -22 18 Q -32 12 -26 6 Z", fill: K6.oil, stroke: K6.oilDk, "stroke-width": 2, opacity: 0 }, inner);
  const dirt = H.el("path", { d: "M 4 -18 Q 22 -24 30 -12 Q 34 -2 22 2 Q 6 4 0 -6 Q -2 -14 4 -18 Z", fill: K6.dirt, opacity: 0 }, inner);
  H.el("path", { d: "M -24 -12 Q -4 -4 18 -14 M -20 12 Q 0 4 26 12", fill: "none", stroke: K6.muted, "stroke-width": 2.5, opacity: 0.6 }, inner);
  return { g, oil, dirt };
};

H.k16Unit = (parent, p, o = {}) => {
  const lab = o.labels || [];
  const has = (k) => lab.includes(k);
  const g = H.el("g", { id: p }, parent);
  const R = (x, y, w, h, fill, a = {}, par = g) =>
    H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 6, fill, stroke: K6.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, par);
  const T = (x, y, s, a = {}) => H.text(a.par || g, x, y, s, { size: a.size || 23, anchor: a.anchor || "middle", fill: a.fill || K6.ink });
  const pipe = (d, w, col) => H.el("path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linejoin": "round" }, g);
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", "stroke-linecap": "butt", opacity: 0 }, g);
  const S = { g };

  // floor
  H.el("rect", { x: 12, y: 590, width: 1076, height: 38, fill: K6.floor }, g);
  H.el("line", { x1: 12, y1: 590, x2: 1088, y2: 590, stroke: K6.ink, "stroke-width": 5 }, g);

  // pipes first (components are drawn over them): P → valve, gauge branch, A / B to the cylinder, T back to the tank
  const dP = "M 144 300 L 144 196 L 560 196", dA = "M 660 196 L 724 196 L 724 346", dB = "M 880 346 L 880 236 L 660 236", dT = "M 560 236 L 470 236 L 470 382";
  pipe(dP, 11, K6.blue); pipe("M 300 196 L 300 150", 7, K6.blue);
  pipe(dA, 10, K6.blue); pipe(dB, 10, K6.blue); pipe(dT, 8, K6.muted);
  S.flows = [flow(`${p}-f1`, dP), flow(`${p}-f2`, dA), flow(`${p}-f3`, dB), flow(`${p}-f4`, dT)].map((n) => n.id);

  // tank: body, cleaning cover with bolts, level glass, feet, lid
  R(40, 392, 470, 176, K6.tank, { sw: 5 });
  R(84, 428, 176, 102, K6.tank, { sw: 3, rx: 10 });
  for (const [x, y] of [[100, 444], [244, 444], [100, 514], [244, 514]]) H.el("circle", { cx: x, cy: y, r: 6, fill: K6.dark, stroke: K6.ink, "stroke-width": 2 }, g);
  R(418, 420, 30, 120, K6.paper, { sw: 3, rx: 6 });
  H.el("rect", { x: 422, y: 456, width: 22, height: 80, fill: K6.oil }, g);
  H.el("path", { d: "M 412 446 L 454 446 M 412 500 L 454 500", fill: "none", stroke: K6.ink, "stroke-width": 3 }, g);
  R(58, 568, 36, 22, K6.dark, { sw: 3, rx: 2 });
  R(456, 568, 36, 22, K6.dark, { sw: 3, rx: 2 });

  // oil streak on the tank wall, below the lid seam (shown when o.dirty, or animated by the scene)
  S.streak = H.k16Streak(g, 340, 395, 498, 18, { id: `${p}-streak` });
  if (!o.dirty) S.streak.setAttribute("opacity", 0);

  // dust on the tank wall (cleaning scene): clipped by a rect whose left edge follows the rag
  if (o.dust) {
    const defs = H.el("defs", {}, g);
    const cp = H.el("clipPath", { id: `${p}-dclip` }, defs);
    S.dclip = H.el("rect", { x: 43, y: 395, width: 464, height: 170 }, cp);
    S.dust = H.el("g", { id: `${p}-dust`, "clip-path": `url(#${p}-dclip)` }, g);
    H.el("rect", { x: 43, y: 395, width: 464, height: 170, fill: K6.dust, opacity: 0.55 }, S.dust);
    H.k16Specks(S.dust, 50, 500, 400, 560, 70, { r: 3.4, fill: "#5d523e", op: 0.55 });
  }
  R(28, 380, 494, 14, K6.metal, { rx: 3 });

  // pump + coupling + motor on the lid
  R(96, 300, 96, 80, K6.dark, { rx: 10 });
  R(192, 322, 22, 36, K6.metal, { sw: 3, rx: 3 });
  R(214, 322, 22, 36, K6.metal, { sw: 3, rx: 3 });
  R(236, 290, 190, 90, K6.metal, { rx: 10 });
  const fins = [];
  for (let x = 252; x <= 412; x += 16) fins.push(`M ${x} 296 L ${x} 374`);
  H.el("path", { d: fins.join(" "), fill: "none", stroke: K6.ink, "stroke-width": 2, opacity: 0.4 }, g);
  R(284, 316, 96, 36, K6.paper, { sw: 2, rx: 6 });
  if (has("motor")) T(332, 342, "มอเตอร์", { size: 22 });
  if (has("pump")) T(144, 348, "ปั๊ม", { size: 26 });

  // valve block (with solenoid) on the lines
  R(560, 176, 100, 80, K6.paper, { rx: 6 });
  H.el("path", { d: "M 593 176 L 593 256 M 627 176 L 627 256", fill: "none", stroke: K6.ink, "stroke-width": 3 }, g);
  R(572, 150, 36, 26, K6.dark, { sw: 3, rx: 4 });

  // pressure gauge on the P line
  S.gauge = H.gauge(g, 300, 104, 46, { id: `${p}-g`, min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, labelSize: 15, value: o.value ?? 0 });
  if (has("gauge")) T(238, 96, "เกจวัดแรงดัน", { size: 23, anchor: "end" });

  // machine frame + cylinder; the rod group carries the dirt specks of the sliding area
  R(670, 424, 410, 18, K6.metal, { rx: 3 });
  R(694, 442, 26, 148, K6.dark, { sw: 3, rx: 2 });
  R(1030, 442, 26, 148, K6.dark, { sw: 3, rx: 2 });
  H.el("line", { x1: 720, y1: 524, x2: 1030, y2: 524, stroke: K6.ink, "stroke-width": 6 }, g);
  S.rod = H.el("g", { id: `${p}-rod` }, g);
  R(780, 380, 262, 24, K6.steel, { sw: 3, rx: 2 }, S.rod);
  H.el("line", { x1: 784, y1: 387, x2: 1036, y2: 387, stroke: "#ffffff", "stroke-width": 3, opacity: 0.8 }, S.rod);
  R(1040, 366, 40, 52, K6.metal, { rx: 6 }, S.rod);
  S.dirt = H.k16Specks(S.rod, 934, 1032, 383, 401, 16, { id: `${p}-dirt`, r: 3.4 });
  if (!o.dirty) S.dirt.setAttribute("opacity", 0);
  R(690, 360, 214, 64, K6.tube, { sw: 5 });
  R(676, 352, 22, 80, K6.dark, { rx: 4 });
  R(896, 352, 26, 80, K6.dark, { rx: 4 });
  R(712, 342, 24, 18, K6.dark, { sw: 3, rx: 2 });
  R(868, 342, 24, 18, K6.dark, { sw: 3, rx: 2 });
  if (has("cyl")) T(802, 398, "กระบอกสูบ", { size: 22 });

  // oil on the floor around the machine (drawn over the floor line)
  S.puddle = H.el("ellipse", { id: `${p}-pud`, cx: 598, cy: 591, rx: 64, ry: 9, fill: K6.oil, stroke: K6.oilDk, "stroke-width": 3, opacity: o.dirty ? 1 : 0 }, g);

  if (has("tank")) T(176, 486, "ถังน้ำมัน", { size: 24 });
  S.spot = { tank: [340, 450], floor: [598, 591], rod: [983, 392], gauge: [300, 104] };
  return S;
};

// Rod reciprocates (machine running) from t0; whole strokes, ends back at x = 0 exactly at t1.
H.k16Run = (S, t0, t1, stroke = -44) => {
  const n = Math.max(1, Math.round((t1 - t0) / 0.9));
  const d = (t1 - t0) / (2 * n);
  tl.fromTo(S.rod, { x: 0 }, { x: stroke, duration: d, ease: "sine.inOut", yoyo: true, repeat: 2 * n - 1 }, t0);
};
// Oil-flow dashes from t0, fading out at t1 (machine stops).
H.k16Flow = (S, t0, t1) => {
  for (const id of S.flows) {
    tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, t0);
    tl.fromTo(`#${id}`, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((t1 - t0) * 3), duration: t1 - t0, ease: "none", immediateRender: false }, t0);
    tl.to(`#${id}`, { opacity: 0, duration: 0.4 }, t1 - 0.2);
  }
};

// Judgment-card picture (360 × 200): tank + floor + cylinder on a stand. dirty → streak, puddle, dirt specks.
H.k16Mini = (parent, dirty) => {
  const P = typeof parent === "string" ? H.$(parent) : parent;
  const R = (x, y, w, h, fill, sw = 3.5, rx = 4) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: K6.ink, "stroke-width": sw }, P);
  H.el("rect", { x: 12, y: 176, width: 336, height: 14, fill: K6.floor }, P);
  H.el("line", { x1: 12, y1: 176, x2: 348, y2: 176, stroke: K6.ink, "stroke-width": 4 }, P);
  R(24, 74, 150, 92, K6.tank);
  R(32, 166, 18, 10, K6.dark, 2.5, 1); R(148, 166, 18, 10, K6.dark, 2.5, 1);
  R(16, 64, 166, 12, K6.metal, 3, 2);
  R(50, 30, 44, 34, K6.dark, 3, 6); R(96, 26, 66, 38, K6.metal, 3, 6);
  R(212, 108, 120, 10, K6.metal, 3, 2);
  R(222, 118, 14, 58, K6.dark, 2.5, 1); R(308, 118, 14, 58, K6.dark, 2.5, 1);
  R(272, 80, 76, 14, K6.steel, 2.5, 1);
  R(206, 66, 80, 40, K6.tube, 3.5, 4);
  const out = { spots: { tank: [118, 108], floor: [196, 177], rod: [318, 87] } };
  if (dirty) {
    H.k16Streak(P, 118, 77, 130, 12, { sw: 2, shine: 2, drop: 5 });
    out.puddle = H.el("ellipse", { cx: 196, cy: 177, rx: 26, ry: 5, fill: K6.oil, stroke: K6.oilDk, "stroke-width": 2.5 }, P);
    H.k16Specks(P, 292, 344, 82, 92, 8, { r: 2.6 });
  }
  return out;
};
