// EP25 — Lubricator (3rd unit of the FRL set): drawings shared by the scenes.
// After OPL 5'-A-6 (p.40): oil drop window (sight dome) on top, drop adjust screw, oil cap, bowl with oil,
// a pipe from the bowl up to the drip nozzle, air passage IN → OUT with a narrow valve under the window.
// LU.unit draws in a local 800 × 640 frame; place it inside a translate/scale group.
// Part D colours: air dashes #2a8fc9 on pipes #1f5fbf, compressed-air tint #dff1fb, oil / mist #f2c94c,
// metal #c9c1ae / #9aa1aa, transparent bowl #eef6fb with #1a1d21 outline.

const LU = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", knob: "#59606a",
  pipe: "#1f5fbf", air: "#2a8fc9", tint: "#dff1fb", bowl: "#eef6fb", oil: "#f2c94c", oilEdge: "#c99a1c",
  body: "#ebe6db", hatch: "#b7ac94", paper: "#fffdf8", yellow: "#f2a900", red: "#d0233a", green: "#178a4e",
};

// Seeded pseudo-random numbers (deterministic frames).
LU.rng = (seed) => { let s = seed % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// Cut-face hatch as explicit 45° lines (SVG <pattern> fills do not render in the capture).
LU.hatchD = (rects, gap = 16) => {
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

// Hanging oil drop, tip at (0,0), round end below.
LU.dropD = (r = 9, x = 0, y = 0) => {
  const f = H.f, P = (dx, dy) => `${f(x + dx)} ${f(y + dy)}`;
  return `M ${P(0, 0)} C ${P(r * 0.55, r * 0.9)} ${P(r, r * 1.45)} ${P(r, r * 2)} A ${r} ${r} 0 0 1 ${P(-r, r * 2)} C ${P(-r, r * 1.45)} ${P(-r * 0.55, r * 0.9)} ${P(0, 0)} Z`;
};

// Moving dashes along a path (air: blue dashes; start hidden). speed in units per second.
LU.dash = (g, id, d, o = {}) => H.el("path", { id, d, fill: "none", stroke: o.color || LU.air, "stroke-width": o.w || 5, "stroke-dasharray": o.dash || "14 12", "stroke-linecap": o.cap || "butt", opacity: 0 }, g);
LU.flow = (ids, t0, t1, o = {}) => {
  const speed = o.speed || 70, period = o.period || 26;
  for (const id of [].concat(ids)) {
    const sel = typeof id === "string" ? `#${id}` : id;
    tl.fromTo(sel, { opacity: 0 }, { opacity: o.op ?? 0.95, duration: 0.3, immediateRender: false }, t0);
    const dist = period * Math.max(1, Math.round((speed * (t1 - t0)) / period));
    tl.fromTo(sel, { strokeDashoffset: 0 }, { strokeDashoffset: -dist, duration: t1 - t0, ease: "none", immediateRender: false }, t0);
    if (o.fadeOut) tl.fromTo(sel, { opacity: o.op ?? 0.95 }, { opacity: 0, duration: 0.3, immediateRender: false }, t1);
  }
};
// Show / hide helpers (seek-safe, never render before their time).
LU.show = (sel, t, d = 0.4) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d, immediateRender: false }, t);
LU.hide = (sel, t, d = 0.3) => tl.fromTo(sel, { opacity: 1 }, { opacity: 0, duration: d, immediateRender: false }, t);

// Tube (pipe) with blue walls and tinted inside, along path d.
LU.tube = (g, d, w = 22) => {
  H.el("path", { d, fill: "none", stroke: LU.pipe, "stroke-width": w, "stroke-linejoin": "round" }, g);
  H.el("path", { d, fill: "none", stroke: LU.tint, "stroke-width": w - 10, "stroke-linejoin": "round" }, g);
};

// The lubricator. o.cut = cross-section (hatched body, air passage, valve, bowl feed); otherwise the outside view
// (solid body) with the transparent dome and bowl. o.oil = false leaves the oil pipe empty (to animate it filling).
// Returns { g, nozzle:[x,y], air:{in,throat,out,feed}, oilPath, oilLen, mist (group for mist dots), arrows }.
LU.unit = (parent, p, o = {}) => {
  const g = H.el("g", { id: p }, parent);
  const cut = !!o.cut, f = H.f;
  const tubeLine = (d, w = 16) => {
    H.el("path", { d, fill: "none", stroke: LU.ink, "stroke-width": w, "stroke-linejoin": "round" }, g);
    H.el("path", { d, fill: "none", stroke: LU.bowl, "stroke-width": w - 6, "stroke-linejoin": "round" }, g);
  };
  // IN / OUT pipe stubs
  for (const [x0, x1] of [[0, 132], [668, 800]]) {
    H.el("rect", { x: x0, y: 260, width: x1 - x0, height: 50, fill: LU.tint }, g);
    H.el("path", { d: `M ${x0} 258 H ${x1} M ${x0} 312 H ${x1}`, stroke: LU.pipe, "stroke-width": 8 }, g);
  }
  // pipe from the bowl up to the needle block (outside view: drawn first so the body hides its middle part)
  const pipeD = "M 500 600 V 78";
  if (!cut) tubeLine(pipeD);

  if (cut) {
    H.el("rect", { x: 130, y: 215, width: 540, height: 140, fill: LU.body }, g);
    H.el("path", { d: LU.hatchD([[130, 215, 540, 140]]), fill: "none", stroke: LU.hatch, "stroke-width": 2.5 }, g);
    // cavities: passage, drip hole, feed channel to the bowl
    for (const [x, y, w, h] of [[128, 262, 544, 46], [390, 213, 20, 50], [290, 306, 14, 52]]) H.el("rect", { x, y, width: w, height: h, fill: LU.tint }, g);
    H.el("path", { d: "M 130 262 H 390 M 410 262 H 670 M 130 308 H 290 M 304 308 H 670 M 390 215 V 262 M 410 215 V 262 M 290 308 V 355 M 304 308 V 355", fill: "none", stroke: LU.ink, "stroke-width": 4 }, g);
    H.el("path", { d: "M 130 262 V 215 H 670 V 262 M 670 308 V 355 H 130 V 308", fill: "none", stroke: LU.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
    // valve under the window: narrows the passage
    H.el("path", { d: "M 348 308 L 382 287 H 418 L 452 308 Z", fill: LU.dark, stroke: LU.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);
  } else {
    H.el("rect", { x: 130, y: 215, width: 540, height: 140, rx: 12, fill: LU.metal, stroke: LU.ink, "stroke-width": 5 }, g);
    for (const x of [130, 614]) {
      H.el("rect", { x, y: 228, width: 56, height: 114, rx: 8, fill: LU.dark, stroke: LU.ink, "stroke-width": 4 }, g);
      for (let k = 1; k < 5; k++) H.el("line", { x1: x + 11 * k, y1: 236, x2: x + 11 * k, y2: 334, stroke: LU.ink, "stroke-width": 2, opacity: 0.45 }, g);
    }
    H.el("line", { x1: 200, y1: 232, x2: 600, y2: 232, stroke: "#ffffff", "stroke-width": 4, opacity: 0.6 }, g);
  }

  // oil cap on the body top
  H.el("rect", { x: 192, y: 191, width: 56, height: 26, rx: 6, fill: LU.knob, stroke: LU.ink, "stroke-width": 3 }, g);
  for (let x = 200; x <= 240; x += 8) H.el("line", { x1: x, y1: 195, x2: x, y2: 213, stroke: "#c9ced4", "stroke-width": 2 }, g);

  // bowl guard ring (knurled), bowl, oil
  H.el("rect", { x: 255, y: 355, width: 290, height: 31, rx: 6, fill: LU.dark, stroke: LU.ink, "stroke-width": 4 }, g);
  for (let x = 268; x <= 534; x += 14) H.el("line", { x1: x, y1: 359, x2: x, y2: 382, stroke: LU.ink, "stroke-width": 2, opacity: 0.45 }, g);
  if (cut) {
    H.el("rect", { x: 290, y: 353, width: 14, height: 35, fill: LU.tint }, g);
    H.el("path", { d: "M 290 355 V 386 M 304 355 V 386", stroke: LU.ink, "stroke-width": 3 }, g);
  }
  H.el("path", { d: "M 270 386 V 560 Q 270 612 325 612 H 475 Q 530 612 530 560 V 386 Z", fill: LU.bowl, stroke: LU.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  H.el("path", { d: "M 274 468 V 560 Q 274 608 325 608 H 475 Q 526 608 526 560 V 468 Z", fill: LU.oil }, g);
  H.el("line", { x1: 274, y1: 468, x2: 526, y2: 468, stroke: LU.oilEdge, "stroke-width": 3 }, g);
  H.el("path", { d: "M 288 400 V 548", stroke: "#ffffff", "stroke-width": 6, opacity: 0.8, "stroke-linecap": "round" }, g);
  H.text(g, 380, 560, "OIL", { size: 30, anchor: "middle", fill: "#8a6d12" });
  if (cut) tubeLine(pipeD);
  else tubeLine("M 500 600 V 386");

  // dome (oil drop window) with its ring, top line, drip tube, needle block and drop adjust screw
  H.el("rect", { x: 322, y: 200, width: 156, height: 19, rx: 4, fill: LU.dark, stroke: LU.ink, "stroke-width": 3 }, g);
  H.el("path", { d: "M 335 202 V 140 Q 335 88 400 88 Q 465 88 465 140 V 202 Z", fill: LU.bowl, stroke: LU.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  H.el("path", { d: "M 350 188 V 142 Q 350 116 368 103", fill: "none", stroke: "#ffffff", "stroke-width": 5, opacity: 0.9, "stroke-linecap": "round" }, g);
  tubeLine("M 478 57 H 400 V 146", 14);
  H.el("rect", { x: 476, y: 38, width: 48, height: 42, rx: 4, fill: LU.metal, stroke: LU.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: 484, y: 8, width: 32, height: 30, rx: 5, fill: LU.knob, stroke: LU.ink, "stroke-width": 3 }, g);
  for (let x = 490; x <= 510; x += 5) H.el("line", { x1: x, y1: 12, x2: x, y2: 34, stroke: "#c9ced4", "stroke-width": 2 }, g);

  // oil column in the pipe (bowl → needle block → drip nozzle)
  const oilD = cut || o.oil === false ? "M 500 598 V 57 H 400 V 145" : "M 500 598 V 386 M 500 215 V 57 H 400 V 145";
  const oilPath = H.el("path", { id: `${p}-oil`, d: oilD, fill: "none", stroke: LU.oil, "stroke-width": 7, "stroke-linejoin": "round", "stroke-linecap": "butt" }, g);
  const oilLen = oilPath.getTotalLength();
  if (o.oil === false) oilPath.setAttribute("stroke-dasharray", `${f(oilLen)} ${f(oilLen)}`), oilPath.setAttribute("stroke-dashoffset", f(oilLen - 130));

  // air-flow dashes
  const fl = H.el("g", {}, g);
  const air = cut
    ? {
        in: LU.dash(fl, `${p}-ain`, "M 0 285 H 348").id,
        throat: LU.dash(fl, `${p}-ath`, "M 348 285 C 372 274 382 274 400 274 C 418 274 428 274 452 285").id,
        out: LU.dash(fl, `${p}-aout`, "M 452 285 H 800").id,
        feed: LU.dash(fl, `${p}-afd`, "M 297 290 V 404").id,
      }
    : { in: LU.dash(fl, `${p}-ain`, "M 0 285 H 132").id, out: LU.dash(fl, `${p}-aout`, "M 668 285 H 800").id };
  const mist = H.el("g", { id: `${p}-mist` }, g);
  return { g, nozzle: [400, 146], air, oilPath, oilLen, mist, cut };
};

// Drops at the nozzle: each grows, falls and vanishes; in the cut view it bursts into mist that rides the air to OUT.
// times = absolute timeline times. o: { fall (distance), seed, mistTo (x end), outside: [x0, y] mist start in the outside view }
LU.drops = (U, p, times, o = {}) => {
  const [nx, ny] = U.nozzle, f = H.f;
  const fall = o.fall ?? (U.cut ? 122 : 40);
  const rnd = LU.rng(o.seed || 7);
  times.forEach((t, k) => {
    const dg = H.el("g", { id: `${p}-d${k}`, opacity: 0 }, U.g);
    const dp = H.el("path", { d: LU.dropD(9, nx, ny), fill: LU.oil, stroke: LU.oilEdge, "stroke-width": 2 }, dg);
    tl.fromTo(dg, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, t);
    tl.fromTo(dp, { scale: 0.25, svgOrigin: `${nx} ${ny}` }, { scale: 1, svgOrigin: `${nx} ${ny}`, duration: 0.45, ease: "power1.in" }, t);
    tl.fromTo(dg, { y: 0 }, { y: fall, duration: 0.3, ease: "power2.in", immediateRender: false }, t + 0.47);
    tl.fromTo(dg, { opacity: 1 }, { opacity: 0, duration: 0.06, immediateRender: false }, t + 0.76);
    // mist burst
    const [mx, my] = U.cut ? [nx, ny + fall + 8] : o.outside || [672, 285];
    const x1 = o.mistTo ?? 790;
    const n = o.n ?? 10;
    for (let i = 0; i < n; i++) {
      const r = 2.5 + rnd() * 3.5;
      const c = H.el("circle", { cx: f(mx), cy: f(my), r: f(r), fill: LU.oil, stroke: LU.oilEdge, "stroke-width": 1, opacity: 0 }, U.mist);
      const t0 = t + 0.78 + (U.cut ? 0 : 0.25) + rnd() * 0.25;
      const dx = (x1 - mx) * (0.82 + rnd() * 0.18), dy = (rnd() - 0.4) * (U.cut ? 30 : 34);
      const dur = 0.9 + rnd() * 0.5;
      tl.fromTo(c, { opacity: 0 }, { opacity: 0.95, duration: 0.1, immediateRender: false }, t0);
      tl.fromTo(c, { x: 0, y: 0 }, { x: f(dx), y: f(dy), duration: dur, ease: "power1.in", immediateRender: false }, t0);
      tl.fromTo(c, { opacity: 0.95 }, { opacity: 0, duration: 0.2, immediateRender: false }, t0 + dur - 0.2);
    }
  });
};

// Evenly spaced times from t0 to t1 every `gap` seconds.
LU.every = (t0, t1, gap) => { const a = []; for (let t = t0; t <= t1 + 1e-6; t += gap) a.push(t); return a; };

// Label with a leader line and dot. o: { size, anchor, fill, fx, fy, sub (second line, muted), bg }
LU.label = (g, id, x, y, s, lx, ly, o = {}) => {
  const m = H.el("g", { id }, g);
  if (lx != null) {
    H.el("path", { d: `M ${o.fx ?? x} ${o.fy ?? y + 8} L ${lx} ${ly}`, fill: "none", stroke: LU.ink, "stroke-width": 2.5 }, m);
    H.el("circle", { cx: lx, cy: ly, r: 5, fill: LU.ink }, m);
  }
  if (o.bg) {
    const w = o.bg, h = o.sub ? 64 : 38;
    const x0 = o.anchor === "middle" ? x - w / 2 : o.anchor === "end" ? x - w + 8 : x - 10;
    H.el("rect", { x: x0, y: y - 28, width: w, height: h, rx: 8, fill: LU.paper, stroke: o.stroke || LU.ink, "stroke-width": 2.5 }, m);
  }
  H.text(m, x, y, s, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || LU.ink });
  if (o.sub) H.text(m, x, y + 28, o.sub, { size: (o.size || 26) - 4, anchor: o.anchor || "start", fill: LU.muted, weight: 600 });
  return m;
};

// Small flow arrow with a word (IN / OUT).
LU.port = (g, x1, x2, y, s) => {
  H.el("path", { d: H.arrowD(x1, y, x2, y, 18), fill: "none", stroke: LU.ink, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  H.text(g, (x1 + x2) / 2, y - 18, s, { size: 30, anchor: "middle" });
};

// Mini sight dome for the judgment cards (viewBox 460 × 170): returns { g, nozzle, fallTo }.
LU.miniDome = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  H.el("path", { d: "M 40 148 V 72 Q 40 30 90 30 Q 140 30 140 72 V 148 Z", fill: LU.bowl, stroke: LU.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  H.el("path", { d: "M 52 138 V 74 Q 52 52 66 42", fill: "none", stroke: "#ffffff", "stroke-width": 4, opacity: 0.9, "stroke-linecap": "round" }, g);
  H.el("rect", { x: 28, y: 146, width: 124, height: 16, rx: 4, fill: LU.dark, stroke: LU.ink, "stroke-width": 3 }, g);
  H.el("path", { d: "M 90 14 V 74", fill: "none", stroke: LU.ink, "stroke-width": 12 }, g);
  H.el("path", { d: "M 90 14 V 74", fill: "none", stroke: LU.oil, "stroke-width": 6 }, g);
  return { g, nozzle: [90, 74], fall: 58 };
};
LU.miniDrops = (D, p, times) => {
  const [nx, ny] = D.nozzle;
  times.forEach((t, k) => {
    const dg = H.el("g", { id: `${p}-d${k}`, opacity: 0 }, D.g);
    const dp = H.el("path", { d: LU.dropD(8, nx, ny), fill: LU.oil, stroke: LU.oilEdge, "stroke-width": 2 }, dg);
    tl.fromTo(dg, { opacity: 0 }, { opacity: 1, duration: 0.08, immediateRender: false }, t);
    tl.fromTo(dp, { scale: 0.25, svgOrigin: `${nx} ${ny}` }, { scale: 1, svgOrigin: `${nx} ${ny}`, duration: 0.2, ease: "power1.in" }, t);
    tl.fromTo(dg, { y: 0 }, { y: D.fall, duration: 0.16, ease: "power2.in", immediateRender: false }, t + 0.21);
    tl.fromTo(dg, { opacity: 1 }, { opacity: 0, duration: 0.05, immediateRender: false }, t + 0.37);
  });
};
// Counter digits that switch at the given times (seek-safe opacity swaps). Returns the group.
LU.counter = (parent, p, x, y, times, o = {}) => {
  const g = H.el("g", { id: p }, parent);
  const ts = [null, ...times];
  ts.forEach((t, k) => {
    const n = H.text(g, x, y, String(k), { size: o.size || 76, anchor: "middle", fill: o.fill || LU.ink, id: `${p}-n${k}` });
    n.setAttribute("opacity", k === 0 ? 1 : 0);
    if (t != null) tl.fromTo(n, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, t);
    if (k < times.length) tl.fromTo(n, { opacity: 1 }, { opacity: 0, duration: 0.05, immediateRender: false }, times[k]);
  });
  return g;
};
