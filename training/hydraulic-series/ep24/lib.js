// EP24 — FRL 3-point set: Regulator (OPL 5'-A-5, PDF p.39). Drawings shared by s1–s5.
// Part D look: pipes #1f5fbf, air-flow dashes #2a8fc9, compressed-air tint #dff1fb, metal #c9c1ae / #9aa1aa,
// transparent bowls #eef6fb with #1a1d21 outline, oil #f2c94c, water #3b7dd8.
// Cross-section after the p.39 figure: handle + adjusting screw + lock nut on top, adjust spring in the bonnet,
// diaphragm between bonnet and body, stem down to the valve under the seat; IN on the left, OUT on the right.

const AR = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", knob: "#59606a", paper: "#fffdf8",
  body: "#ebe6db", hatch: "#b7ac94", tube: "#1f5fbf", stream: "#2a8fc9", air: "#dff1fb", airHi: "#a6d3f1",
  airUp: "#c4e3f7", airLo: "#f7fbfd", bowl: "#eef6fb", oil: "#f2c94c", water: "#3b7dd8", green: "#178a4e",
  red: "#d0233a", yellow: "#f2a900", blue: "#1f5fbf", brass: "#d9c27a", rubber: "#3a3f46", SET: 5,
};

// ---------------------------------------------------------------- small helpers
// Zigzag spring (vertical); the command list depends only on n, so two lengths can be tweened with attr:{d}.
AR.springV = (x, y0, y1, amp, n) => {
  const f = H.f, st = (y1 - y0) / (2 * n);
  let d = `M ${f(x)} ${f(y0)}`;
  for (let i = 1; i <= 2 * n; i++) d += ` L ${f(x + (i % 2 ? -amp : amp))} ${f(y0 + st * (i - 0.5))}`;
  return d + ` L ${f(x)} ${f(y1)}`;
};
// Cut-face hatch drawn as explicit 45° lines on one global grid (SVG <pattern> does not render in frames).
AR.hatchD = (rects, gap = 16) => {
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
AR.bodyCut = (g, outline, rects) => {
  H.el("path", { d: outline, fill: AR.body }, g);
  H.el("path", { d: AR.hatchD(rects), fill: "none", stroke: AR.hatch, "stroke-width": 2.5 }, g);
  H.el("path", { d: outline, fill: "none", stroke: AR.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
};
// Cavities: ink outline pass, then one fill group per zone (joints between rects stay clean).
AR.cavities = (g, p, zones) => {
  const out = H.el("g", {}, g);
  for (const z in zones) for (const [x, y, w, h] of zones[z].r) H.el("rect", { x, y, width: w, height: h, fill: "none", stroke: AR.ink, "stroke-width": 8 }, out);
  const groups = {};
  for (const z in zones) {
    groups[z] = H.el("g", { id: `${p}-z${z}`, fill: zones[z].fill }, g);
    for (const [x, y, w, h] of zones[z].r) H.el("rect", { x, y, width: w, height: h }, groups[z]);
  }
  return groups;
};
// Air pipe: blue tube with a tinted core; returns the core path (tween its stroke for pressure).
AR.pipe = (g, d, w = 60, core = AR.airLo, id) =>
  (H.el("path", { d, fill: "none", stroke: AR.tube, "stroke-width": w, "stroke-linejoin": "round" }, g),
  H.el("path", { ...(id ? { id } : {}), d, fill: "none", stroke: core, "stroke-width": w - 14, "stroke-linejoin": "round" }, g));
// Air-flow dashes (start hidden). AR.flow(ids, t0, t1) shows them running from t0 to t1.
AR.dash = (g, id, d, w = 7) => H.el("path", { id, d, fill: "none", stroke: AR.stream, "stroke-width": w, "stroke-dasharray": "14 12", "stroke-linecap": "butt", opacity: 0 }, g);
AR.flow = (ids, t0, t1, fadeOut = true) => {
  for (const id of [].concat(ids)) {
    tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t0);
    tl.fromTo(`#${id}`, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((t1 - t0) * 2.6), duration: t1 - t0, ease: "none", immediateRender: false }, t0);
    if (fadeOut) tl.fromTo(`#${id}`, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t1);
  }
};
// Every scene tween goes through AR.ft: start values are set by the drawing, so no tween renders early.
AR.ft = (el, from, to, t, d = 0.4, ease = "power2.inOut") => tl.fromTo(el, from, { ...to, duration: d, ease, immediateRender: false }, t);
AR.op = (el, a, z, t, d = 0.3) => AR.ft(el, { opacity: a }, { opacity: z }, t, d, "power1.out");
AR.ring = (g, id, cx, cy, r, color = AR.yellow) => H.el("circle", { id, cx, cy, r, fill: "none", stroke: color, "stroke-width": 7, opacity: 0 }, g);
AR.pulse = (id, t, n = 2) => {
  tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, t);
  tl.fromTo(`#${id}`, { scale: 0.85, transformOrigin: "50% 50%" }, { scale: 1.12, transformOrigin: "50% 50%", duration: 0.35, yoyo: true, repeat: 2 * n - 1, immediateRender: false }, t);
  tl.fromTo(`#${id}`, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t + 0.7 * n + 0.2);
};
// Label with a leader line ending in a dot; o.bg = width of a paper box behind the text.
AR.label = (g, id, x, y, s, lx, ly, o = {}) => {
  const m = H.el("g", { id, ...(o.hidden ? { opacity: 0 } : {}) }, g);
  if (lx != null) {
    H.el("path", { d: `M ${o.fx ?? x} ${o.fy ?? y - 9} L ${lx} ${ly}`, fill: "none", stroke: AR.ink, "stroke-width": 2.5 }, m);
    H.el("circle", { cx: lx, cy: ly, r: 5, fill: AR.ink }, m);
  }
  if (o.bg) {
    const w = o.bg, x0 = o.anchor === "middle" ? x - w / 2 : o.anchor === "end" ? x - w + 8 : x - 8;
    H.el("rect", { x: x0, y: y - 27, width: w, height: 37, rx: 8, fill: AR.paper, stroke: AR.ink, "stroke-width": 2 }, m);
  }
  H.text(m, x, y, s, { size: o.size || 26, anchor: o.anchor || "start", fill: o.fill || AR.ink });
  return m;
};
// Rounded status chip (text + border colour); starts hidden.
AR.chip = (g, id, x, y, w, s, color, o = {}) => {
  const m = H.el("g", { id, opacity: 0 }, g);
  H.el("rect", { x, y, width: w, height: o.h || 50, rx: (o.h || 50) / 2, fill: o.fill || AR.paper, stroke: color, "stroke-width": 4 }, m);
  H.text(m, x + w / 2, y + (o.h || 50) / 2 + 10, s, { size: o.size || 27, anchor: "middle", fill: color });
  return m;
};
// Vertical force arrow that grows from its tip (len = shaft + head); same command list for every length.
AR.forceD = (x, tipY, len, dir) => H.arrowD(x, tipY - dir * len, x, tipY, 22);

// Pressure gauge (no numbers — the deck gives none) with the GREEN marking at the set pressure (p.39 maint. 1).
// o: { id, value, set (false = no mark), bezel } → H.gauge handle + { mark, ndl(v0, v1, t, d, ease) }.
AR.gauge = (g, cx, cy, r, o = {}) => {
  if (o.bezel !== false) H.el("circle", { cx, cy, r: H.f(r * 1.12), fill: AR.dark, stroke: AR.ink, "stroke-width": H.f(Math.max(2.5, r * 0.04)) }, g);
  const G = H.gauge(g, cx, cy, r, { id: o.id, min: 0, max: 10, ticks: 5, minor: 1, labels: false, value: o.value ?? 0 });
  if (o.set !== false) {
    const a = G.rot(o.set ?? AR.SET);
    G.mark = H.el("path", { id: `${o.id}-set`, d: H.arcD(cx, cy, r * 0.8, a - 8, a + 8), fill: "none", stroke: AR.green, "stroke-width": H.f(r * 0.2) }, G.g);
    G.g.insertBefore(G.mark, G.needle);
  }
  G.ndl = (v0, v1, t, d = 0.8, ease = "power2.inOut") =>
    tl.fromTo(G.needle, { rotation: G.rot(v0), svgOrigin: G.origin }, { rotation: G.rot(v1), svgOrigin: G.origin, duration: d, ease, immediateRender: false }, t);
  return G;
};

// ---------------------------------------------------------------- exterior views (local units, x centred on 0)
// Regulator from the front: T-handle, screw, lock nut, bonnet, flange, body with IN/OUT bosses, gauge on the front.
// Ports centre at local y = 250. Returns { g, handle, hub, nut, G, port: [x, y] (local) }.
AR.regExt = (parent, cx, y0, s, p, o = {}) => {
  const g = H.el("g", { id: p, transform: `translate(${cx} ${y0}) scale(${s})` }, parent);
  const st = { stroke: AR.ink, "stroke-width": 4, "stroke-linejoin": "round" };
  H.el("rect", { x: -8, y: 18, width: 16, height: 34, fill: AR.metal, ...st, "stroke-width": 3 }, g);
  const handle = H.el("g", { id: `${p}-h` }, g);
  H.el("rect", { x: -72, y: 0, width: 144, height: 22, rx: 10, fill: AR.knob, ...st }, handle);
  for (const x of [-56, -44, 44, 56]) H.el("line", { x1: x, y1: 4, x2: x, y2: 18, stroke: "#c9ced4", "stroke-width": 2.5 }, handle);
  H.el("circle", { cx: 0, cy: 11, r: 16, fill: AR.knob, ...st }, handle);
  const nut = H.el("g", { id: `${p}-nut` }, g);
  H.el("rect", { x: -26, y: 46, width: 52, height: 20, rx: 2, fill: AR.brass, ...st, "stroke-width": 3 }, nut);
  H.el("line", { x1: -9, y1: 46, x2: -9, y2: 66, stroke: AR.ink, "stroke-width": 2 }, nut);
  H.el("line", { x1: 9, y1: 46, x2: 9, y2: 66, stroke: AR.ink, "stroke-width": 2 }, nut);
  H.el("path", { d: "M -28 66 H 28 L 34 86 L 66 114 V 190 H -66 V 114 L -34 86 Z", fill: AR.metal, ...st }, g);
  H.el("path", { d: "M -40 100 L -50 110 V 180", fill: "none", stroke: AR.paper, "stroke-width": 5, opacity: 0.7, "stroke-linecap": "round" }, g);
  H.el("rect", { x: -80, y: 186, width: 160, height: 18, rx: 4, fill: AR.dark, ...st }, g);
  H.el("rect", { x: -100, y: 224, width: 200, height: 52, rx: 4, fill: AR.dark, ...st }, g);
  H.el("rect", { x: -82, y: 204, width: 164, height: 96, rx: 10, fill: AR.metal, ...st }, g);
  const G = AR.gauge(g, 0, 252, o.gr ?? 40, { id: `${p}-g`, value: o.value ?? 0, set: o.set });
  return { g, handle, nut, G, port: [100, 250] };
};
// Air filter: head block, transparent bowl with a little water, drain at the bottom (dimmed beside the regulator).
AR.filterExt = (parent, cx, y0, s, p) => {
  const g = H.el("g", { id: p, transform: `translate(${cx} ${y0}) scale(${s})` }, parent);
  const st = { stroke: AR.ink, "stroke-width": 4, "stroke-linejoin": "round" };
  H.el("rect", { x: -90, y: 224, width: 180, height: 52, rx: 4, fill: AR.dark, ...st }, g);
  H.el("rect", { x: -70, y: 206, width: 140, height: 84, rx: 8, fill: AR.metal, ...st }, g);
  H.el("path", { d: "M -56 290 V 400 Q -56 430 -26 430 H 26 Q 56 430 56 400 V 290 Z", fill: AR.bowl, ...st }, g);
  H.el("path", { d: "M -52 392 V 400 Q -52 426 -26 426 H 26 Q 52 426 52 400 V 392 Z", fill: AR.water, opacity: 0.45 }, g);
  H.el("rect", { x: -22, y: 300, width: 44, height: 70, rx: 4, fill: "none", stroke: AR.muted, "stroke-width": 3, "stroke-dasharray": "6 5" }, g);
  H.el("rect", { x: -10, y: 430, width: 20, height: 22, fill: AR.dark, ...st, "stroke-width": 3 }, g);
  return { g, port: [90, 250] };
};
// Lubricator: sight dome on top, head block, oil bowl.
AR.lubeExt = (parent, cx, y0, s, p) => {
  const g = H.el("g", { id: p, transform: `translate(${cx} ${y0}) scale(${s})` }, parent);
  const st = { stroke: AR.ink, "stroke-width": 4, "stroke-linejoin": "round" };
  H.el("path", { d: "M -26 206 V 186 Q -26 160 0 160 Q 26 160 26 186 V 206 Z", fill: AR.bowl, ...st }, g);
  H.el("circle", { cx: 0, cy: 190, r: 6, fill: AR.oil, stroke: AR.ink, "stroke-width": 2 }, g);
  H.el("rect", { x: -90, y: 224, width: 180, height: 52, rx: 4, fill: AR.dark, ...st }, g);
  H.el("rect", { x: -70, y: 206, width: 140, height: 84, rx: 8, fill: AR.metal, ...st }, g);
  H.el("path", { d: "M -56 290 V 400 Q -56 430 -26 430 H 26 Q 56 430 56 400 V 290 Z", fill: AR.bowl, ...st }, g);
  H.el("path", { d: "M -52 340 V 400 Q -52 426 -26 426 H 26 Q 52 426 52 400 V 340 Z", fill: AR.oil, opacity: 0.85 }, g);
  return { g, port: [90, 250] };
};

// ---------------------------------------------------------------- cross-section (viewBox 1100 × 640)
// Moving parts: handle group (handle, screw, upper spring seat) by sd (down = screw in); valve group
// (diaphragm plate, stem, valve) by dv (down = valve open). Spring / diaphragm / valve-spring paths morph.
AR.X = 380;
AR.section = (parent, p, o = {}) => {
  const X = AR.X, g = H.el("g", { id: p }, parent);
  // body + bonnet (cut faces)
  AR.bodyCut(g, "M 150 326 H 580 V 596 H 150 Z", [[150, 326, 430, 270]]);
  AR.bodyCut(g, `M ${X - 36} 106 H ${X + 36} V 138 H ${X + 96} V 300 H ${X + 136} V 326 H ${X - 136} V 300 H ${X - 96} V 138 H ${X - 36} Z`,
    [[X - 36, 106, 72, 32], [X - 96, 138, 192, 162], [X - 136, 300, 272, 26]]);
  const z = AR.cavities(g, p, {
    S: { fill: AR.paper, r: [[X - 76, 138, 152, 188], [X - 11, 106, 22, 34]] },
    O: { fill: AR.airLo, r: [[X - 96, 326, 192, 46], [X - 44, 372, 88, 120], [X + 44, 420, 156, 60], [X - 24, 488, 48, 22]] },
    I: { fill: AR.airHi, r: [[150, 420, 80, 60], [190, 420, 40, 136], [190, 516, 140, 40], [X - 60, 508, 120, 52], [X - 22, 558, 44, 26]] },
  });
  // external pipes over the body edge (open ports): IN from the compressor side, OUT to the machine, gauge branch
  AR.pipe(g, "M 14 450 H 156", 60, AR.airHi);
  const pout = AR.pipe(g, "M 574 450 H 1086", 60, AR.airLo, `${p}-pout`);
  const pg = AR.pipe(g, "M 960 330 V 426", 22, AR.airLo, `${p}-pg`);

  // air-flow dashes (under the moving parts, so the stem and valve hide them where they cross)
  const fl = AR.dash(g, `${p}-fl`, "M 18 450 H 210 V 536 H 332 V 516 H 364 V 450 H 1082");

  // valve spring (under the valve) and the valve group
  const vspD = (dv = 0) => AR.springV(X, 524 + dv, 584, 13, 3);
  const vsp = H.el("path", { id: `${p}-vsp`, d: vspD(), fill: "none", stroke: AR.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);
  const valve = H.el("g", { id: `${p}-valve` }, g);
  H.el("rect", { x: X - 8, y: 322, width: 16, height: 190, fill: AR.dark, stroke: AR.ink, "stroke-width": 3 }, valve);
  H.el("rect", { x: X - 36, y: 508, width: 72, height: 17, rx: 3, fill: AR.metal, stroke: AR.ink, "stroke-width": 3.5 }, valve);
  H.el("rect", { x: X - 30, y: 508, width: 60, height: 6, fill: AR.rubber }, valve);
  H.el("rect", { x: X - 66, y: 308, width: 132, height: 15, rx: 3, fill: AR.metal, stroke: AR.ink, "stroke-width": 3.5 }, valve);

  // diaphragm (rubber membrane clamped between bonnet and body)
  const memD = (dv = 0) => {
    const y = H.f(326 + dv);
    return `M ${X - 136} 326 H ${X - 96} C ${X - 84} 326 ${X - 82} ${y} ${X - 70} ${y} H ${X + 70} C ${X + 82} ${y} ${X + 84} 326 ${X + 96} 326 H ${X + 136}`;
  };
  const mem = H.el("path", { id: `${p}-mem`, d: memD(), fill: "none", stroke: AR.rubber, "stroke-width": 7, "stroke-linejoin": "round" }, g);

  // adjust spring + handle group (handle, screw, upper spring seat)
  const spD = (sd = 0, dv = 0) => AR.springV(X, 164 + sd, 308 + dv, 52, 6);
  const sp = H.el("path", { id: `${p}-sp`, d: spD(), fill: "none", stroke: AR.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  const hg = H.el("g", { id: `${p}-hg` }, g);
  H.el("rect", { x: X - 9, y: 40, width: 18, height: 112, fill: AR.metal, stroke: AR.ink, "stroke-width": 3 }, hg);
  for (let y = 48; y <= 140; y += 9) H.el("line", { x1: X - 8, y1: y, x2: X + 8, y2: y + 5, stroke: AR.ink, "stroke-width": 1.5, opacity: 0.55 }, hg);
  H.el("rect", { x: X - 66, y: 150, width: 132, height: 14, rx: 3, fill: AR.dark, stroke: AR.ink, "stroke-width": 3.5 }, hg);
  const bar = H.el("g", { id: `${p}-bar` }, hg);
  H.el("rect", { x: X - 95, y: 20, width: 190, height: 24, rx: 11, fill: AR.knob, stroke: AR.ink, "stroke-width": 4 }, bar);
  for (const dx of [-78, -64, 64, 78]) H.el("line", { x1: X + dx, y1: 25, x2: X + dx, y2: 39, stroke: "#c9ced4", "stroke-width": 2.5 }, bar);
  H.el("circle", { cx: X, cy: 32, r: 18, fill: AR.knob, stroke: AR.ink, "stroke-width": 4 }, hg);
  // lock nut on the screw, sitting on the bonnet neck
  const nut = H.el("g", { id: `${p}-nut` }, g);
  H.el("rect", { x: X - 30, y: 84, width: 60, height: 22, rx: 2, fill: AR.brass, stroke: AR.ink, "stroke-width": 3.5 }, nut);
  H.el("line", { x1: X - 10, y1: 84, x2: X - 10, y2: 106, stroke: AR.ink, "stroke-width": 2 }, nut);
  H.el("line", { x1: X + 10, y1: 84, x2: X + 10, y2: 106, stroke: AR.ink, "stroke-width": 2 }, nut);

  // OUT pressure gauge with the green set-pressure marking
  const G = AR.gauge(g, 960, 236, 84, { id: `${p}-g`, value: 0 });

  // port words
  H.text(g, 22, 412, "IN", { size: 34, fill: AR.blue });
  H.text(g, 1082, 412, "OUT", { size: 34, anchor: "end", fill: AR.blue });

  // state helpers -------------------------------------------------
  const st = { sd: 0, dv: 0 };
  // move handle (screw) and/or valve to new positions from t over d seconds; morphs spring, diaphragm, valve spring
  const move = (to, t, d = 0.6, ease = "power2.inOut") => {
    const a = { ...st }, b2 = { sd: to.sd ?? st.sd, dv: to.dv ?? st.dv };
    if (b2.sd !== a.sd) AR.ft(hg, { y: a.sd }, { y: b2.sd }, t, d, ease);
    if (b2.dv !== a.dv) {
      AR.ft(valve, { y: a.dv }, { y: b2.dv }, t, d, ease);
      AR.ft(mem, { attr: { d: memD(a.dv) } }, { attr: { d: memD(b2.dv) } }, t, d, ease);
      AR.ft(vsp, { attr: { d: vspD(a.dv) } }, { attr: { d: vspD(b2.dv) } }, t, d, ease);
    }
    AR.ft(sp, { attr: { d: spD(a.sd, a.dv) } }, { attr: { d: spD(b2.sd, b2.dv) } }, t, d, ease);
    Object.assign(st, b2);
  };
  // OUT side pressure colour (zone + pipe cores)
  let outFill = AR.airLo;
  const outTo = (c, t, d = 0.8) => {
    AR.ft(z.O, { fill: outFill }, { fill: c }, t, d, "power1.inOut");
    AR.ft([pout, pg], { stroke: outFill }, { stroke: c }, t, d, "power1.inOut");
    outFill = c;
  };
  return { g, z, hg, bar, nut, valve, mem, sp, vsp, G, fl: fl.id, move, outTo, X };
};
