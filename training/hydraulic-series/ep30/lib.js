// EP30 — Air tube binding (OPL 5'-C-4, PDF p.47): shared drawings.
// Air tubes (side view + cross-section), binder = cable tie, lock band (P-clip) on a frame plate, a tube-binding
// band (two-piece holder), labels, stamps and seek-safe parametric tweens. Part D colours (pneumatic series).
// hyd_lib.js is loaded first (HC, H.hyd* are taken), so everything here is prefixed at / AT.

const AT = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", pipe: "#1f5fbf", air: "#2a8fc9", tint: "#dff1fb",
  green: "#178a4e", red: "#d0233a", yellow: "#f2a900", dirt: "#7a5c3a", paper: "#fffdf8", bg: "#f5f1e8",
  wall: "#e2dccd", line: "#d6cdb9", nylon: "#f7f4ec",
};

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

H.atOp = (el, a, z, t, d = 0.3) => tl.fromTo(el, { opacity: a }, { opacity: z, duration: d, immediateRender: false }, t);
H.atHide = (...els) => els.forEach((e) => e.setAttribute("opacity", 0));
H.atG = (parent, x, y, k = 1, extra = {}) => H.el("g", { transform: `translate(${x} ${y}) scale(${k})`, ...extra }, parent);

// Seek-safe parametric animation. items = [[element, q => {attr: value, …}], …]; q runs q0 → q1 over dur,
// eased (power2.inOut), as n linear steps — every frame depends on time only.
H.atQ = (items, q0, q1, t, dur, n = 8) => {
  const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
  for (let k = 0; k < n; k++) {
    const qa = q0 + (q1 - q0) * ease(k / n), qb = q0 + (q1 - q0) * ease((k + 1) / n);
    for (const [el, fn] of items) tl.fromTo(el, { attr: fn(qa) }, { attr: fn(qb), duration: dur / n, ease: "none", immediateRender: false }, t + (k * dur) / n);
  }
};

// Text label with a halo; optional leader line ending in a dot. o: { size, anchor, fill, halo, line:[x1,y1,x2,y2], lineColor, weight }
H.atLabel = (parent, x, y, str, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  if (o.line) {
    const [x1, y1, x2, y2] = o.line;
    H.el("line", { x1, y1, x2, y2, stroke: o.lineColor || AT.ink, "stroke-width": 3 }, g);
    H.el("circle", { cx: x2, cy: y2, r: 5.5, fill: o.lineColor || AT.ink }, g);
  }
  const t = H.text(g, x, y, str, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || AT.ink, weight: o.weight || 800 });
  t.setAttribute("stroke", o.halo || AT.paper);
  t.setAttribute("stroke-width", 7);
  t.setAttribute("stroke-linejoin", "round");
  t.setAttribute("paint-order", "stroke");
  return g;
};

// Pulsing ring (finite repeat), hidden until t.
H.atRing = (parent, cx, cy, rx, ry, t, n = 3, o = {}) => {
  const e = H.el("ellipse", { cx, cy, rx, ry: ry ?? rx, fill: "none", stroke: o.color || AT.red, "stroke-width": o.w ?? 6, opacity: 0 }, parent);
  H.atOp(e, 0, 1, t, 0.2);
  tl.fromTo(e, { scale: 1, svgOrigin: `${cx} ${cy}` }, { scale: 1.12, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t + 0.1);
  return e;
};

// Check mark (drawn as a path, the fonts may lack ✓), hidden until t when t is given.
H.atCheck = (parent, x, y, s = 1, t = null, col = AT.green) => {
  const f = H.f;
  const e = H.el("path", { d: `M ${f(x - 16 * s)} ${f(y)} L ${f(x - 4 * s)} ${f(y + 12 * s)} L ${f(x + 18 * s)} ${f(y - 14 * s)}`, fill: "none", stroke: col, "stroke-width": f(8 * s), "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
  if (t != null) {
    e.setAttribute("opacity", 0);
    tl.fromTo(e, { opacity: 0, scale: 0.4, svgOrigin: `${f(x)} ${f(y)}` }, { opacity: 1, scale: 1, svgOrigin: `${f(x)} ${f(y)}`, duration: 0.3, ease: "back.out(2)", immediateRender: false }, t);
  }
  return e;
};

// Number badge (matches the numbered points of the panel).
H.atBadge = (parent, x, y, n, o = {}) => {
  const g = H.el("g", {}, parent);
  H.el("circle", { cx: x, cy: y, r: o.r ?? 22, fill: o.fill || AT.pipe }, g);
  H.text(g, x, y + 10, String(n), { size: 28, anchor: "middle", fill: "#ffffff" });
  return g;
};

// Straight arrow with a filled head (for "pull", "air in").
H.atArrow = (parent, x1, y1, x2, y2, o = {}) => {
  const g = H.el("g", {}, parent), f = H.f, col = o.color || AT.ink, hd = o.head ?? 16, w = o.w ?? 5;
  const a = Math.atan2(y2 - y1, x2 - x1), c = Math.cos(a), s = Math.sin(a);
  H.el("line", { x1: f(x1), y1: f(y1), x2: f(x2 - c * hd * 0.8), y2: f(y2 - s * hd * 0.8), stroke: col, "stroke-width": w }, g);
  H.el("path", { d: `M ${f(x2)} ${f(y2)} L ${f(x2 - c * hd - s * hd * 0.6)} ${f(y2 - s * hd + c * hd * 0.6)} L ${f(x2 - c * hd + s * hd * 0.6)} ${f(y2 - s * hd - c * hd * 0.6)} Z`, fill: col }, g);
  return g;
};

// Frame plate (wall) seen in section: rect with explicit hatch lines (SVG <pattern> does not render in frames).
// Hatch lines are cut to the rectangle exactly (no clip-path, so layout checks see the true extent).
H.atWall = (parent, x, y, w, h) => {
  const g = H.el("g", {}, parent), f = H.f;
  H.el("rect", { x, y, width: w, height: h, fill: AT.wall }, g);
  for (let Y0 = y + 6; Y0 < y + h + w; Y0 += 14) {
    const s0 = Math.max(0, Y0 - y - h), s1 = Math.min(w, Y0 - y);
    if (s1 - s0 > 2) H.el("line", { x1: f(x + s0), y1: f(Y0 - s0), x2: f(x + s1), y2: f(Y0 - s1), stroke: AT.muted, "stroke-width": 2.5, opacity: 0.6 }, g);
  }
  H.el("line", { x1: x + w, y1: y, x2: x + w, y2: y + h, stroke: AT.ink, "stroke-width": 4 }, g);
  return g;
};

// ---------------------------------------------------------------------------------------------------------------
// Air tube, side view, constant width (stroked path): blue wall + compressed-air tint inside.
H.atTubeS = (parent, d, o = {}) => {
  const w = o.w ?? 22, wall = o.wall ?? 5, g = H.el("g", {}, parent);
  const mk = (stroke, sw) => H.el("path", { d, fill: "none", stroke, "stroke-width": sw, "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
  const paths = [mk(AT.ink, w + 3), mk(AT.pipe, w), mk(AT.tint, w - 2 * wall)];
  return { g, paths };
};

// Side view of a bundle of n tubes along x0..x1 (bundle centre line y = 0) held by binders (cable ties) at o.ties.
// q: 0 = ties loose (slack), 1 = snug on the tubes, 2 = over-tightened (tubes pinched at the ties, bore narrowed).
// Every shape is a function of q with a fixed command structure → H.atQ morphs them directly.
// → { g, flows: [path], items, set }   (flows = air-dash centre lines, one per tube)
H.atSide = (parent, o = {}) => {
  const n = o.n ?? 3, h = o.h ?? 20, wall = o.wall ?? 6, sp = o.sp ?? 41, x0 = o.x0 ?? 0, x1 = o.x1 ?? 700;
  const ties = o.ties ?? [300], sg = o.sg ?? 26, slack = o.slack ?? 9, ko = 0.55, kc = 0.45, Tt = 6, f = H.f;
  const L0 = o.tail ?? 30, kL = o.tailGrow ?? 1.2, ang = ((o.tailAng ?? 50) * Math.PI) / 180;
  const xs = [x0];
  for (const tx of ties) for (let x = tx - 3 * sg; x <= tx + 3 * sg + 0.01; x += 6) if (x > x0 + 1 && x < x1 - 1) xs.push(x);
  xs.push(x1);
  xs.sort((a, b) => a - b);
  const gs = (x) => Math.max(...ties.map((tx) => Math.exp(-(((x - tx) / sg) ** 2))));
  const pp = (q) => Math.max(0, Math.min(1, q - 1));
  const yi = (i) => (i - (n - 1) / 2) * sp;
  const cy = (i, x, p) => yi(i) * (1 - kc * p * gs(x));
  const ho = (x, p) => h * (1 - ko * p * gs(x));
  const outlineD = (i, q, inner) => {
    const p = pp(q), hw = (x) => Math.max(0.8, ho(x, p) - (inner ? wall : 0));
    const top = xs.map((x) => `${f(x)} ${f(cy(i, x, p) - hw(x))}`);
    const bot = xs.map((x) => `${f(x)} ${f(cy(i, x, p) + hw(x))}`).reverse();
    return `M ${top.join(" L ")} L ${bot.join(" L ")} Z`;
  };
  const midD = (i, q) => "M " + xs.map((x) => `${f(x)} ${f(cy(i, x, pp(q)))}`).join(" L ");
  const ext = (q) => { const p = pp(q); return yi(n - 1) * (1 - kc * p) + h * (1 - ko * p) + Math.max(0, 1 - q) * slack + 1; };
  const tailD = (tx, q) => {
    const yT = -(ext(q) + Tt) - 20, L = L0 + kL * (ext(0) - ext(q));
    return `M ${f(tx + 4)} ${f(yT + 2)} L ${f(tx + 4 + L * Math.sin(ang))} ${f(yT + 2 - L * Math.cos(ang))}`;
  };
  const q0 = o.q ?? 0;
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const items = [], flows = [];
  for (let i = 0; i < n; i++) {
    const out = H.el("path", { d: outlineD(i, q0, false), fill: AT.pipe, stroke: AT.ink, "stroke-width": 2.5, "stroke-linejoin": "round" }, g);
    const inn = H.el("path", { d: outlineD(i, q0, true), fill: AT.tint }, g);
    const fl = H.el("path", { d: midD(i, q0), fill: "none", stroke: AT.air, "stroke-width": 3.5, "stroke-dasharray": "12 12", "stroke-linecap": "butt", opacity: 0 }, g);
    flows.push(fl);
    items.push([out, (q) => ({ d: outlineD(i, q, false) })], [inn, (q) => ({ d: outlineD(i, q, true) })], [fl, (q) => ({ d: midD(i, q) })]);
  }
  for (const tx of ties) {
    const tail = H.el("g", {}, g);
    const ta = H.el("path", { d: tailD(tx, q0), fill: "none", stroke: AT.ink, "stroke-width": 12, "stroke-linecap": "butt" }, tail);
    const tb = H.el("path", { d: tailD(tx, q0), fill: "none", stroke: AT.nylon, "stroke-width": 7, "stroke-linecap": "butt" }, tail);
    const band = H.el("rect", { x: tx - 8, y: f(-(ext(q0) + Tt)), width: 16, height: f(2 * (ext(q0) + Tt)), rx: 3, fill: AT.nylon, stroke: AT.ink, "stroke-width": 3 }, g);
    const head = H.el("rect", { x: tx - 13, y: f(-(ext(q0) + Tt) - 22), width: 26, height: 24, rx: 4, fill: AT.nylon, stroke: AT.ink, "stroke-width": 3 }, g);
    items.push([ta, (q) => ({ d: tailD(tx, q) })], [tb, (q) => ({ d: tailD(tx, q) })]);
    items.push([band, (q) => ({ y: f(-(ext(q) + Tt)), height: f(2 * (ext(q) + Tt)) })]);
    items.push([head, (q) => ({ y: f(-(ext(q) + Tt) - 22) })]);
  }
  return { g, flows, items, ext, tailD, run: (qa, qb, t, dur, steps = 8) => H.atQ(items, qa, qb, t, dur, steps) };
};

// Air-flow dashes: appear at t0, run at speed v0 until tc, then at v1 until t1 (seek-safe, piecewise linear).
// o: { w1, op1 } = dash width / opacity after tc.
H.atFlow = (els, t0, t1, v0 = 60, tc = null, v1 = null, o = {}) => {
  const c = tc ?? t1, off1 = -v0 * (c - t0);
  for (const el of els) {
    H.atOp(el, 0, 0.95, t0, 0.3);
    tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: off1, duration: Math.max(0.01, c - t0), ease: "none", immediateRender: false }, t0);
    if (tc != null && t1 > tc) {
      tl.fromTo(el, { strokeDashoffset: off1 }, { strokeDashoffset: off1 - (v1 ?? v0) * (t1 - tc), duration: t1 - tc, ease: "none", immediateRender: false }, tc);
      if (o.w1 != null) tl.fromTo(el, { attr: { "stroke-width": 3.5 } }, { attr: { "stroke-width": o.w1 }, duration: 0.8, immediateRender: false }, tc);
      if (o.op1 != null) tl.fromTo(el, { opacity: 0.95 }, { opacity: o.op1, duration: 0.8, immediateRender: false }, tc + 0.02);
    }
  }
};

// Cross-section of 3 tubes inside a binder (cable tie loop), centred (cx, cy).
// q: 0 = tie loose (slack), 1 = snug, 2 = over-tightened (tubes squashed to ovals, bores narrowed).
// → { g, tubes:[{outer, inner}], items, geo(q), run(qa, qb, t, dur) }
H.atXsec = (parent, cx, cy, o = {}) => {
  const r = o.r ?? 40, wall = o.wall ?? 13, slack = o.slack ?? 14, T = 12, f = H.f;
  const L0 = o.tail ?? 30, kL = o.tailGrow ?? 1.2, th = o.headAng ?? 40;
  const memo = {};
  const geo = (q) => {
    const key = q.toFixed(4);
    if (memo[key]) return memo[key];
    const p = Math.max(0, Math.min(1, q - 1)), s = Math.max(0, 1 - q) * slack;
    const a = r * (1 + 0.375 * p), bb = r * (1 - 0.45 * p);
    const rho = (a * bb) / Math.sqrt((bb * Math.cos(Math.PI / 6)) ** 2 + (a * 0.5) ** 2);
    const d = (2 * rho) / Math.sqrt(3) + 0.5;
    let m = 0;
    for (let k = 0; k <= 90; k++) { const ph = (k / 90) * Math.PI; m = Math.max(m, Math.hypot(a * Math.cos(ph), d + bb * Math.sin(ph))); }
    return (memo[key] = { a, bb, d, R: m + T / 2 + s, hull: m });
  };
  const q0 = o.q ?? 0, G0 = geo(q0), Rmax = geo(0).R;
  const tailD = (q) => {
    const R = geo(q).R, L = L0 + kL * (Rmax - R), y0 = cy - R - T / 2 - 18;
    return `M ${f(cx)} ${f(y0)} L ${f(cx)} ${f(y0 - L)}`;
  };
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const room = o.room ? H.el("circle", { cx, cy, r: f((G0.hull + G0.R - T / 2) / 2), fill: "none", stroke: AT.green, "stroke-width": f(Math.max(0.5, G0.R - T / 2 - G0.hull)), opacity: 0 }, g) : null;
  const items = [];
  const tubes = [0, 120, 240].map((ang) => {
    const tg = H.el("g", { transform: `rotate(${ang} ${cx} ${cy})` }, g);
    const outer = H.el("ellipse", { cx, cy: f(cy - G0.d), rx: f(G0.a), ry: f(G0.bb), fill: AT.pipe, stroke: AT.ink, "stroke-width": 3 }, tg);
    const inner = H.el("ellipse", { cx, cy: f(cy - G0.d), rx: f(G0.a - wall), ry: f(Math.max(1.5, G0.bb - wall)), fill: AT.tint }, tg);
    items.push([outer, (q) => { const G = geo(q); return { cy: f(cy - G.d), rx: f(G.a), ry: f(G.bb) }; }]);
    items.push([inner, (q) => { const G = geo(q); return { cy: f(cy - G.d), rx: f(G.a - wall), ry: f(Math.max(1.5, G.bb - wall)) }; }]);
    return { tg, outer, inner };
  });
  const loopA = H.el("circle", { cx, cy, r: f(G0.R), fill: "none", stroke: AT.ink, "stroke-width": T + 4 }, g);
  const loopB = H.el("circle", { cx, cy, r: f(G0.R), fill: "none", stroke: AT.nylon, "stroke-width": T - 2 }, g);
  items.push([loopA, (q) => ({ r: f(geo(q).R) })], [loopB, (q) => ({ r: f(geo(q).R) })]);
  const hg = H.el("g", { transform: `rotate(${th} ${cx} ${cy})` }, g);
  const ta = H.el("path", { d: tailD(q0), fill: "none", stroke: AT.ink, "stroke-width": 13, "stroke-linecap": "butt" }, hg);
  const tb = H.el("path", { d: tailD(q0), fill: "none", stroke: AT.nylon, "stroke-width": 8, "stroke-linecap": "butt" }, hg);
  const head = H.el("rect", { x: cx - 16, y: f(cy - G0.R - T / 2 - 20), width: 32, height: 26, rx: 5, fill: AT.nylon, stroke: AT.ink, "stroke-width": 3 }, hg);
  items.push([ta, (q) => ({ d: tailD(q) })], [tb, (q) => ({ d: tailD(q) })], [head, (q) => ({ y: f(cy - geo(q).R - T / 2 - 20) })]);
  if (room) items.push([room, (q) => { const G = geo(q); return { r: f((G.hull + G.R - T / 2) / 2), "stroke-width": f(Math.max(0.5, G.R - T / 2 - G.hull)) }; }]);
  return { g, tubes, items, geo, room, run: (qa, qb, t, dur, steps = 8) => H.atQ(items, qa, qb, t, dur, steps) };
};

// Lock band (P-clip) on a frame plate, seen along the tubes. The plate surface is the vertical line x = wx;
// the loop's centre height is yc. kind: "ok" (band fits 1 tube), "small" (band smaller than the tube),
// "two" (band for 1 tube, 2 tubes put in). q: 0 = band not yet screwed to the plate (gap), 1 = screwed tight.
// → { g, items, run, tubeAt(q) }
H.atClip = (parent, wx, yc, kind, o = {}) => {
  const f = H.f, wall = o.wall ?? 13, gap0 = o.gap ?? 16, id = o.id || "atclip";
  const S = {
    ok: (q) => ({ tubes: [[0, 40, 40]], lx: 45, ly: 45 }),
    small: (q) => { const rx = 40 - 12 * q, ry = 40 + 10 * q; return { tubes: [[0, rx, ry]], lx: rx + 5, ly: ry + 5 }; },
    two: (q) => { const rx = 30 + 7 * q, ry = 30 - 9 * q, dy = 31 - 9 * q; return { tubes: [[-dy, rx, ry], [dy, rx, ry]], lx: rx + 5, ly: dy + ry + 5 }; },
  }[kind];
  const lyMax = Math.max(S(0).ly, S(1).ly), ys = yc - lyMax - 24;
  const g = H.el("g", o.gid ? { id: o.gid } : {}, parent);
  H.atWall(g, wx - 28, ys - 16, 28, 2 * (yc - ys) + 32);
  const gap = (q) => gap0 * (1 - q);
  const ccx = (q) => wx + 4 + gap(q) + S(q).lx;
  const tabD = (q) => `M ${f(wx + 5)} ${f(ys - 12)} L ${f(wx + 5)} ${f(ys + 4)} L ${f(wx + 5 + gap(q))} ${f(yc)}`;
  const items = [];
  const tubes = S(0).tubes.map((_, k) => {
    const tq = (q) => S(q).tubes[k];
    const outer = H.el("ellipse", { cx: f(ccx(0)), cy: f(yc + tq(0)[0]), rx: tq(0)[1], ry: tq(0)[2], fill: AT.pipe, stroke: AT.ink, "stroke-width": 3 }, g);
    const inner = H.el("ellipse", { cx: f(ccx(0)), cy: f(yc + tq(0)[0]), rx: tq(0)[1] - wall, ry: tq(0)[2] - wall, fill: AT.tint }, g);
    items.push([outer, (q) => ({ cx: f(ccx(q)), cy: f(yc + tq(q)[0]), rx: f(tq(q)[1]), ry: f(tq(q)[2]) })]);
    items.push([inner, (q) => ({ cx: f(ccx(q)), cy: f(yc + tq(q)[0]), rx: f(tq(q)[1] - wall), ry: f(Math.max(1.5, tq(q)[2] - wall)) })]);
    return { outer, inner };
  });
  const tabA = H.el("path", { d: tabD(0), fill: "none", stroke: AT.ink, "stroke-width": 15, "stroke-linejoin": "round" }, g);
  const tabB = H.el("path", { d: tabD(0), fill: "none", stroke: AT.dark, "stroke-width": 9, "stroke-linejoin": "round" }, g);
  const loopA = H.el("ellipse", { cx: f(ccx(0)), cy: yc, rx: S(0).lx, ry: S(0).ly, fill: "none", stroke: AT.ink, "stroke-width": 12 }, g);
  const loopB = H.el("ellipse", { cx: f(ccx(0)), cy: yc, rx: S(0).lx, ry: S(0).ly, fill: "none", stroke: AT.dark, "stroke-width": 6 }, g);
  items.push([tabA, (q) => ({ d: tabD(q) })], [tabB, (q) => ({ d: tabD(q) })]);
  items.push([loopA, (q) => ({ cx: f(ccx(q)), rx: f(S(q).lx), ry: f(S(q).ly) })], [loopB, (q) => ({ cx: f(ccx(q)), rx: f(S(q).lx), ry: f(S(q).ly) })]);
  // screw through the tab into the plate (shank dashed inside the plate, head on the tab)
  H.el("line", { x1: wx - 24, y1: ys, x2: wx + 2, y2: ys, stroke: AT.muted, "stroke-width": 5, "stroke-dasharray": "5 4" }, g);
  H.el("rect", { x: wx + 11, y: ys - 14, width: 13, height: 28, rx: 3, fill: AT.metal, stroke: AT.ink, "stroke-width": 3 }, g);
  return { g, items, tubes, ccx, S, ys, run: (qa, qb, t, dur, steps = 6) => H.atQ(items, qa, qb, t, dur, steps) };
};

// Band made for tube binding: two-piece holder with a round pocket per tube (tubes stay round).
// Centre (cx, cy) = the parting line. → { g, top } (move `top` with y to close it)
H.atHolder = (parent, cx, cy, o = {}) => {
  const n = o.n ?? 3, r = o.r ?? 34, wall = o.wall ?? 11, sp = o.sp ?? 2 * r + 18, R = r + 2, Hh = R + 16, f = H.f;
  const W = sp * (n - 1) + 2 * R + 64, x0 = cx - W / 2, x1 = cx + W / 2;
  const xsT = Array.from({ length: n }, (_, i) => cx + (i - (n - 1) / 2) * sp);
  const half = (dir) => {
    let d = `M ${f(x0)} ${f(cy)}`;
    for (const x of xsT) d += ` L ${f(x - R)} ${f(cy)} A ${R} ${R} 0 0 ${dir > 0 ? 0 : 1} ${f(x + R)} ${f(cy)}`;
    return d + ` L ${f(x1)} ${f(cy)} L ${f(x1)} ${f(cy + dir * Hh)} L ${f(x0)} ${f(cy + dir * Hh)} Z`;
  };
  const g = H.el("g", {}, parent);
  H.el("path", { d: half(1), fill: AT.metal, stroke: AT.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  const tubes = xsT.map((x) => {
    H.el("circle", { cx: f(x), cy, r, fill: AT.pipe, stroke: AT.ink, "stroke-width": 3 }, g);
    return H.el("circle", { cx: f(x), cy, r: r - wall, fill: AT.tint }, g);
  });
  const top = H.el("g", {}, g);
  H.el("path", { d: half(-1), fill: AT.metal, stroke: AT.ink, "stroke-width": 4, "stroke-linejoin": "round" }, top);
  for (const x of [x0 + 22, x1 - 22]) {
    H.el("path", { d: H.hexD(x, cy - Hh - 1, 12), fill: AT.dark, stroke: AT.ink, "stroke-width": 3 }, top);
    H.el("line", { x1: f(x), y1: f(cy - Hh + 10), x2: f(x), y2: f(cy + Hh - 8), stroke: AT.muted, "stroke-width": 4, "stroke-dasharray": "5 4" }, g);
  }
  return { g, top, tubes, x0, x1, Hh };
};

// "Substitute" binding (wire twisted round a tube) — shown crossed out.
H.atSubst = (parent, cx, cy, s, id) => {
  const g = H.atG(parent, cx, cy, s), f = H.f;
  H.el("circle", { cx: 0, cy: 0, r: 30, fill: AT.pipe, stroke: AT.ink, "stroke-width": 3 }, g);
  H.el("circle", { cx: 0, cy: 0, r: 15, fill: AT.tint }, g);
  H.el("path", { d: "M -10 -27 C -30 -40 -44 -4 -32 16 C -20 36 18 40 32 14 C 40 -4 30 -30 10 -31", fill: "none", stroke: AT.muted, "stroke-width": 5 }, g);
  H.el("path", { d: "M -10 -31 L -2 -44 L 6 -33 L 13 -46 L 20 -36", fill: "none", stroke: AT.muted, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  H.noSign(g, 0, 0, 52, id);
  return g;
};

// Block arrow for "air that gets through"; th = shaft thickness (morphable: same commands for every th).
H.atFlowArrowD = (x0, x1, yc, th) => {
  const f = H.f, hh = th * 0.75 + 16, hl = 66;
  return `M ${f(x0)} ${f(yc - th / 2)} L ${f(x1 - hl)} ${f(yc - th / 2)} L ${f(x1 - hl)} ${f(yc - hh)} L ${f(x1)} ${f(yc)} L ${f(x1 - hl)} ${f(yc + hh)} L ${f(x1 - hl)} ${f(yc + th / 2)} L ${f(x0)} ${f(yc + th / 2)} Z`;
};
