// EP27 — lubrication of the air line (OPL 5'-B-3, PDF p.43).
// Drawings shared by the title, purposes, compare and defect scenes: an air-cylinder cut-away, a magnified
// view of the piston seal on the tube wall, and a small spool valve. hyd_lib.js is loaded first (HC, H.hyd*
// are taken); everything here is prefixed P27 / H.p27*. Colours follow the Part D (pneumatic) palette.

const P27 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", steel: "#b3b9c1", hatch: "#a99f88",
  pipe: "#1f5fbf", air: "#2a8fc9", tint: "#dff1fb", bowl: "#eef6fb", oil: "#f2c94c", oilDk: "#b98a00",
  water: "#3b7dd8", rust: "#7a5c3a", rubber: "#2b2f35", copper: "#c48a52", paper: "#fffdf8",
  red: "#d0233a", green: "#178a4e", blue: "#1f5fbf",
};

// Text label with a paper halo, optional leader line ending in a dot. o: { id, size, anchor, fill, line, lineColor, opacity }
H.p27Label = (parent, x, y, str, o = {}) => {
  const g = H.el("g", { ...(o.id ? { id: o.id } : {}), ...(o.opacity !== undefined ? { opacity: o.opacity } : {}) }, parent);
  if (o.line) {
    const [x1, y1, x2, y2] = o.line;
    H.el("line", { x1, y1, x2, y2, stroke: o.lineColor || P27.ink, "stroke-width": 3 }, g);
    H.el("circle", { cx: x2, cy: y2, r: 5.5, fill: o.lineColor || P27.ink }, g);
  }
  const t = H.text(g, x, y, str, { size: o.size || 28, anchor: o.anchor || "start", fill: o.fill || P27.ink });
  t.setAttribute("stroke", P27.paper);
  t.setAttribute("stroke-width", 7);
  t.setAttribute("stroke-linejoin", "round");
  t.setAttribute("paint-order", "stroke");
  return g;
};

// Number in a filled circle (purpose / defect 1–4).
H.p27Badge = (parent, x, y, n, o = {}) => {
  const g = H.el("g", { ...(o.id ? { id: o.id } : {}), opacity: o.opacity ?? 1 }, parent);
  const r = o.r || 20;
  H.el("circle", { cx: x, cy: y, r, fill: o.color || P27.blue, stroke: P27.paper, "stroke-width": 4 }, g);
  H.text(g, x, y + r * 0.42, String(n), { size: Math.round(r * 1.25), anchor: "middle", fill: "#ffffff" });
  return g;
};

// Filled arrowhead pointing from (x1,y1) towards (x2,y2), tip at (x2,y2).
H.p27HeadD = (x1, y1, x2, y2, h = 18) => {
  const a = Math.atan2(y2 - y1, x2 - x1), f = H.f;
  const p = (da) => `${f(x2 - h * Math.cos(a + da))} ${f(y2 - h * Math.sin(a + da))}`;
  return `M ${p(0.5)} L ${f(x2)} ${f(y2)} L ${p(-0.5)} Z`;
};

// Air pipe: blue wall with a compressed-air core, so the air-flow dashes inside stay readable.
H.p27Pipe = (parent, d, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const w = o.w ?? 18;
  H.el("path", { d, fill: "none", stroke: P27.pipe, "stroke-width": w, "stroke-linejoin": "round" }, g);
  H.el("path", { d, fill: "none", stroke: P27.tint, "stroke-width": w - 8, "stroke-linejoin": "round" }, g);
  return g;
};

// Air-flow dashes along a path (+ optional arrowhead). Starts hidden; returns { g, path, period }.
H.p27Flow = (parent, d, o = {}) => {
  const g = H.el("g", { opacity: 0, ...(o.id ? { id: o.id } : {}) }, parent);
  const color = o.color || P27.air;
  const path = H.el("path", { d, fill: "none", stroke: color, "stroke-width": o.w ?? 5, "stroke-dasharray": o.dash || "10 12", "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
  if (o.head) H.el("path", { d: H.p27HeadD(...o.head, o.headSize || 18), fill: color }, g);
  return { g, path, period: o.period || 22 };
};
// Show a flow from t (absolute) for dur seconds; dashes advance a whole number of periods.
H.p27Run = (F, t, dur, speed = 120, fadeOut = true) => {
  const n = Math.max(1, Math.round((speed * dur) / F.period));
  tl.fromTo(F.g, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, t);
  tl.fromTo(F.path, { strokeDashoffset: 0 }, { strokeDashoffset: -n * F.period, duration: dur, ease: "none", immediateRender: false }, t);
  if (fadeOut) tl.to(F.g, { opacity: 0, duration: 0.25 }, t + dur - 0.25);
};

// Water drop hanging from (x, y) (tip at the top), body radius s.
H.p27DropD = (x, y, s) => {
  const f = H.f, cy = y + 1.5 * s;
  return `M ${f(x)} ${f(y)} C ${f(x + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x + s)} ${f(cy - 0.3 * s)} ${f(x + s)} ${f(cy + 0.25 * s)} ` +
    `A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(cy + 0.25 * s)} C ${f(x - s)} ${f(cy - 0.3 * s)} ${f(x - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x)} ${f(y)} Z`;
};

// Escaping-air puff: three short arcs fanning out from (x, y) in direction `ang` (degrees, 0 = right,
// −90 = up). Returns the group (hidden); animate with H.p27Puffs.
H.p27Puff = (parent, x, y, ang, o = {}) => {
  const g = H.el("g", { opacity: 0 }, parent), f = H.f, a = (ang * Math.PI) / 180;
  const arcs = [];
  for (let k = 0; k < 3; k++) {
    const r = 14 + k * 13, sp = 0.55;
    const p = (da) => [x + r * Math.cos(a + da), y + r * Math.sin(a + da)];
    const [ax, ay] = p(-sp), [bx, by] = p(sp);
    arcs.push(H.el("path", { d: `M ${f(ax)} ${f(ay)} A ${r} ${r} 0 0 1 ${f(bx)} ${f(by)}`, fill: "none", stroke: o.color || P27.air, "stroke-width": o.w ?? 5, "stroke-linecap": "round", opacity: 0 }, g));
  }
  return { g, arcs, x, y };
};
// Puff `n` times from t (absolute), one every `gap` seconds.
H.p27Puffs = (P, t, n = 3, gap = 0.5) => {
  tl.fromTo(P.g, { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, t);
  P.arcs.forEach((arc, k) => tl.fromTo(arc, { opacity: 0 }, { opacity: 1, duration: 0.12, yoyo: true, repeat: 2 * n - 1, repeatDelay: gap - 0.12, ease: "none", immediateRender: false }, t + k * 0.1));
  tl.to(P.g, { opacity: 0, duration: 0.15 }, t + n * gap + 0.3);
};

// ------------------------------------------------------------------- air cylinder, cut-away (side view)
// Local units, rod to the right, centre line y = 0:
//   head cover x 0–60 · tube 60–520 (walls ±75…±95, bore ±75) · rod cover 520–580 (rod hole ±20)
//   piston body x 70–130 (±65, gap to the wall exaggerated) with seals at x 72–88 and 112–128 (touching the wall)
//   rod Ø32 from the piston to 580 + rod, then a clevis. Ports on top at x 30 and 550 → bore at y −48.
// The piston, its seals and the rod are one rigid body: stroke = tween `pis` in x (max ≈ 380).
// o: { id, x, y, s, rod, pipeTop (number or [left, right]), oil (film visible, default true), rust (default false) }
// → { g, pis, film, rust, flowL, flowR, at(x, y) → parent coords, sealB: [x, y] (bottom seal of the head side) }
H.p27Cyl = (parent, o = {}) => {
  const id = o.id || "p27c", s = o.s ?? 1, ox = o.x ?? 0, oy = o.y ?? 0;
  const g = H.el("g", { id, transform: `translate(${ox} ${oy}) scale(${s})` }, parent);
  const R = (par, x, y, w, h, fill, ex = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: P27.ink, "stroke-width": ex.sw ?? 4, ...(ex.rx ? { rx: ex.rx } : {}) }, par);
  const rodLen = o.rod ?? 150;
  const [topL, topR] = Array.isArray(o.pipeTop) ? o.pipeTop : [o.pipeTop ?? -150, o.pipeTop ?? -150];

  // port pipes (behind the covers)
  if (topL < -95) H.p27Pipe(g, `M 30 ${topL} L 30 -92`);
  if (topR < -95) H.p27Pipe(g, `M 550 ${topR} L 550 -92`);
  // bore = compressed air
  H.el("rect", { x: 60, y: -75, width: 460, height: 150, fill: P27.tint }, g);
  // oil film on the bore wall
  const film = H.el("g", { id: id + "-film", opacity: o.oil === false ? 0 : 1 }, g);
  H.el("rect", { x: 60, y: -75, width: 460, height: 9, fill: P27.oil }, film);
  H.el("rect", { x: 60, y: 66, width: 460, height: 9, fill: P27.oil }, film);
  // rust spots on the bore wall
  const rust = H.el("g", { id: id + "-rust", opacity: o.rust ? 1 : 0 }, g);
  for (const [x, top, w] of [[190, 1, 30], [318, 0, 40], [430, 1, 24], [262, 1, 20], [470, 0, 26], [150, 0, 18]]) {
    H.el("ellipse", { cx: x, cy: top ? -72 : 72, rx: w / 2, ry: 6, fill: P27.rust }, rust);
    H.el("ellipse", { cx: x + w * 0.28, cy: top ? -69 : 69, rx: w / 5, ry: 3.5, fill: P27.rust, opacity: 0.8 }, rust);
  }

  // piston + rod (one rigid body)
  const pis = H.el("g", { id: id + "-pis" }, g);
  const x1 = 580 + rodLen;
  R(pis, 100, -16, x1 - 100, 32, P27.steel, { sw: 3.5 });
  H.el("rect", { x: 104, y: -11, width: x1 - 108, height: 6, fill: "#ffffff", opacity: 0.55 }, pis);
  R(pis, x1, -22, 20, 44, P27.dark, { sw: 3.5 });
  H.el("circle", { cx: x1 + 44, cy: 0, r: 25, fill: P27.dark, stroke: P27.ink, "stroke-width": 4 }, pis);
  H.el("circle", { cx: x1 + 44, cy: 0, r: 9, fill: P27.paper, stroke: P27.ink, "stroke-width": 3 }, pis);
  R(pis, 70, -65, 60, 130, P27.metal);
  H.el("line", { x1: 100, y1: -56, x2: 100, y2: 56, stroke: P27.ink, "stroke-width": 2, opacity: 0.35 }, pis);
  for (const x of [72, 112]) {
    R(pis, x, -75, 16, 18, P27.rubber, { sw: 2, rx: 3 });
    R(pis, x, 57, 16, 18, P27.rubber, { sw: 2, rx: 3 });
  }

  // head cover + air passage
  R(g, 0, -95, 60, 190, P27.metal);
  H.el("path", { d: "M 30 -97 L 30 -48 L 62 -48", fill: "none", stroke: P27.tint, "stroke-width": 12, "stroke-linejoin": "round" }, g);
  // tube walls
  R(g, 60, -95, 460, 20, P27.metal);
  R(g, 60, 75, 460, 20, P27.metal);
  // rod cover (two parts around the rod hole) + passage + rod seal
  R(g, 520, -95, 60, 75, P27.metal);
  R(g, 520, 20, 60, 75, P27.metal);
  H.el("path", { d: "M 550 -97 L 550 -48 L 518 -48", fill: "none", stroke: P27.tint, "stroke-width": 12, "stroke-linejoin": "round" }, g);
  R(g, 538, -21, 20, 6, P27.rubber, { sw: 1.5 });
  R(g, 538, 15, 20, 6, P27.rubber, { sw: 1.5 });

  // air dashes: into the head side / into the rod side (from the pipe top to the bore)
  const flowL = H.p27Flow(g, `M 30 ${topL} L 30 -48 L 74 -48`, { w: 6, dash: "12 12", period: 24 });
  const flowR = H.p27Flow(g, `M 550 ${topR} L 550 -48 L 506 -48`, { w: 6, dash: "12 12", period: 24 });

  const at = (x, y) => [ox + x * s, oy + y * s];
  return { g, pis, film, rust, flowL, flowR, at, s, x1, sealB: at(80, 75) };
};

// Stick-slip ("jerky") stroke of a rigid body `el` in x: from x0 to x1 in n jumps with pauses — the
// unstable movement of a dry seal. Returns the end time (absolute).
H.p27Jerky = (el, t, x0, x1, n = 4, jump = 0.18, pause = 0.32, extra = []) => {
  let x = x0, tt = t;
  for (let k = 1; k <= n; k++) {
    const nx = x0 + ((x1 - x0) * k) / n;
    tl.fromTo(el, { x }, { x: nx, duration: jump, ease: "power3.out", immediateRender: false }, tt);
    extra.forEach(([e, k0, k1]) => tl.fromTo(e, { x: x * k0 + k1 }, { x: nx * k0 + k1, duration: jump, ease: "power3.out", immediateRender: false }, tt));
    x = nx; tt += jump + pause;
  }
  return tt - pause;
};

// ------------------------------------------------------- magnified view: piston seal on the tube wall
// Local box 0..W × 0..Hh (clipped, rounded). Pressure side (head side) on the left. The wall at the bottom
// has a rough top surface (zig-zag, peaks y 213 / valleys 227); the oil film fills it up to y 199, and the
// seal lip (bottom y 205) rides in the film. Without oil, the tiny gaps under the lip stay open.
// o: { id, x, y, s, W, Hh, sx (seal left edge), oil (default true), tag }
// → { g, inner, wall (slide in x), film, lip (path), lipD(w), rust (on the wall), sx, W, Hh }
H.p27Zoom = (parent, o = {}) => {
  const id = o.id || "p27z", W = o.W ?? 1020, Hh = o.Hh ?? 290, sx = o.sx ?? 380, f = H.f;
  const g = H.el("g", { id, transform: `translate(${o.x ?? 0} ${o.y ?? 0}) scale(${o.s ?? 1})`, "data-layout-allow-overflow": "" }, parent);
  (typeof parent === "string" ? H.$(parent) : parent).setAttribute("data-layout-allow-overflow", "");
  const svg = g.ownerSVGElement;
  const defs = H.el("defs", {}, svg);
  const clip = H.el("clipPath", { id: id + "-clip" }, defs);
  H.el("rect", { x: 0, y: 0, width: W, height: Hh, rx: 18 }, clip);
  H.el("rect", { x: 0, y: 0, width: W, height: Hh, rx: 18, fill: P27.tint }, g);
  const inner = H.el("g", { "clip-path": `url(#${id}-clip)`, "data-layout-allow-overflow": "" }, g);

  // wall (slides under the seal): oil film, rough metal surface, explicit hatch lines, rust patch
  const X0 = -30, X1 = W + 560, PER = 26;                 // the wall only slides left (≤ 520)
  const wall = H.el("g", { id: id + "-wall" }, inner);
  const film = H.el("rect", { id: id + "-film", x: X0, y: 199, width: X1 - X0, height: 34, fill: P27.oil, opacity: o.oil === false ? 0 : 1 }, wall);
  let d = `M ${X0} ${Hh + 10} L ${X0} 213`;
  for (let x = X0, k = 0; x < X1; x += PER / 2, k++) d += ` L ${f(x + PER / 2)} ${k % 2 ? 213 : 227}`;
  d += ` L ${X1} ${Hh + 10} Z`;
  H.el("path", { d, fill: P27.metal, stroke: P27.ink, "stroke-width": 3, "stroke-linejoin": "round" }, wall);
  for (let x = X0; x < X1; x += 30) H.el("line", { x1: x, y1: Hh + 6, x2: x + 46, y2: 240, stroke: P27.hatch, "stroke-width": 3 }, wall);
  const rust = H.el("g", { id: id + "-rust", opacity: 0 }, wall);

  // piston body (fixed in this view) + seal lip
  H.el("rect", { x: sx - 50, y: -12, width: W - sx + 80, height: 132, fill: P27.metal, stroke: P27.ink, "stroke-width": 4 }, inner);
  const lipD = (w = 0) => `M ${sx} 58 L ${sx + 110} 58 L ${sx + 110} 128 L ${sx + 96} ${f(205 - 5 * w)} L ${sx + 70} ${f(205 - 13 * w)} ` +
    `L ${sx + 46} ${f(205 - 9 * w)} L ${sx + 14} ${f(205 - 17 * w)} L ${sx} 128 Z`;
  const lip = H.el("path", { id: id + "-lip", d: lipD(0), fill: P27.rubber, stroke: P27.ink, "stroke-width": 3, "stroke-linejoin": "round" }, inner);

  // frame + tag
  H.el("rect", { x: 0, y: 0, width: W, height: Hh, rx: 18, fill: "none", stroke: P27.ink, "stroke-width": 5 }, g);
  if (o.tag !== false) {
    const tg = H.el("g", {}, g);
    H.el("rect", { x: 14, y: 14, width: o.tagW ?? 168, height: 40, rx: 20, fill: P27.ink }, tg);
    H.text(tg, 14 + (o.tagW ?? 168) / 2, 43, o.tag || "ขยาย (Zoom)", { size: 24, anchor: "middle", fill: "#ffffff" });
  }
  return { g, inner, wall, film, lip, lipD, rust, sx, W, Hh };
};

// ------------------------------------------------------------- small spool valve, cut-away (side view)
// Local units: solenoid x 0–110 · body x 110–540 (y 0–150, bore y 45–105, axis 75) · spring cap 540–610.
// Spool lands at x 160–215, 300–355, 440–495 with rubber seals touching the bore. Ports: P on top at x 257
// (air + oil mist from the FRL), exhaust R on top at x 397 (with a silencer), A / B at the bottom at x 257 / 397.
// o: { id, x, y, s, pTop (pipe top, local), outBot (pipe stub bottom, local) }
// → { g, spool (tween x, stroke ≈ 40), spring(path), springD(dx), coil, at(x, y), puffR }
H.p27Valve = (parent, o = {}) => {
  const id = o.id || "p27v", s = o.s ?? 1, ox = o.x ?? 0, oy = o.y ?? 0, f = H.f;
  const g = H.el("g", { id, transform: `translate(${ox} ${oy}) scale(${s})` }, parent);
  const R = (par, x, y, w, h, fill, ex = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: P27.ink, "stroke-width": ex.sw ?? 4, ...(ex.rx ? { rx: ex.rx } : {}) }, par);
  const pTop = o.pTop ?? -70;
  // supply pipe P + exhaust stub R (with silencer)
  H.p27Pipe(g, `M 257 ${pTop} L 257 4`);
  H.p27Pipe(g, "M 397 -26 L 397 4");
  R(g, 377, -54, 40, 30, P27.dark, { rx: 6, sw: 3.5 });
  for (const x of [387, 397, 407]) H.el("line", { x1: x, y1: -50, x2: x, y2: -28, stroke: P27.ink, "stroke-width": 2, opacity: 0.6 }, g);
  // body + bore + port holes
  R(g, 110, 0, 430, 150, P27.metal, { rx: 6 });
  H.el("rect", { x: 122, y: 45, width: 410, height: 60, fill: P27.tint }, g);
  for (const x of [257, 397]) {
    H.el("rect", { x: x - 6, y: 2, width: 12, height: 45, fill: P27.tint }, g);
    H.el("rect", { x: x - 6, y: 103, width: 12, height: 45, fill: P27.tint }, g);
  }
  H.el("line", { x1: 122, y1: 45, x2: 532, y2: 45, stroke: P27.ink, "stroke-width": 3 }, g);
  H.el("line", { x1: 122, y1: 105, x2: 532, y2: 105, stroke: P27.ink, "stroke-width": 3 }, g);
  // spring cap (behind the spool end)
  R(g, 540, 25, 70, 100, P27.metal, { rx: 6 });
  H.el("rect", { x: 540, y: 47, width: 58, height: 56, fill: P27.tint }, g);
  const springD = (dx = 0) => {
    const x0 = 546 + dx, x1 = 596, n = 7;
    let dd = `M ${f(x0)} 75`;
    for (let i = 1; i < 2 * n; i++) dd += ` L ${f(x0 + ((x1 - x0) * i) / (2 * n))} ${i % 2 ? 54 : 96}`;
    return dd + ` L ${x1} 75`;
  };
  const spring = H.el("path", { d: springD(0), fill: "none", stroke: P27.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  // solenoid housing + coil
  R(g, 0, 18, 112, 114, P27.dark, { rx: 8 });
  const coil = H.el("g", {}, g);
  for (const y of [32, 94]) {
    R(coil, 14, y, 86, 24, P27.copper, { sw: 3 });
    for (let x = 24; x < 100; x += 12) H.el("line", { x1: x, y1: y + 2, x2: x, y2: y + 22, stroke: P27.ink, "stroke-width": 1.5, opacity: 0.5 }, coil);
  }
  H.text(g, 56, 13, "SOL", { size: 22, anchor: "middle", fill: P27.muted });
  // spool (plunger + shaft + lands + seals)
  const spool = H.el("g", { id: id + "-spool" }, g);
  R(spool, 24, 60, 100, 30, P27.steel, { sw: 3 });
  R(spool, 120, 66, 426, 18, P27.steel, { sw: 3 });
  for (const lx of [160, 300, 440]) {
    R(spool, lx, 48, 55, 54, P27.steel, { sw: 3 });
    R(spool, lx + 20, 44, 15, 8, P27.rubber, { sw: 1.5, rx: 2 });
    R(spool, lx + 20, 98, 15, 8, P27.rubber, { sw: 1.5, rx: 2 });
  }
  const at = (x, y) => [ox + x * s, oy + y * s];
  return { g, spool, spring, springD, coil, at };
};
