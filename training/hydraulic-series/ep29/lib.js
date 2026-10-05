// EP29 — ตรวจระบบลม 3 เดือน / 1 ปี (OPL 5'-C-2, 5'-C-3; PDF p.45–46).
// Shared drawings for this episode, pneumatic series colours (brief Part D):
//   H.pnCircuit — the air circuit the inspector walks, in a 1760 × 740 frame: shop-air drop pipe (flange,
//     welded joint, stop valve, union) → FRL (filter with auto drain · regulator with knob + front gauge ·
//     lubricator with sight dome) → 5-port solenoid valve with exhaust silencers → speed adjust valve →
//     air cylinder. Returns handles for animation.
//   H.pnDial — gauge face with only the 0 mark + kgf/cm² (the deck gives no set value).
//   Timeline helpers: pnTW (text width), pnTag (numbered two-line tag), pnLens (magnifier), pnFlowOn,
//   pnPuff / pnPuffAt (exhaust puff with oil mist), pnHiss (leak marks), pnKnurl (turning knob).
const PN = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", knob: "#4a5058", pipe: "#1f5fbf",
  flow: "#2a8fc9", air: "#dff1fb", water: "#3b7dd8", oil: "#f2c94c", dirt: "#7a5c3a", bowl: "#eef6fb",
  paper: "#fffdf8", red: "#d0233a", green: "#178a4e", warn: "#f2a900", pale: "#eef3fb", steel: "#d9dde2",
};

// rough text width (Thai marks have no width) for sizing tags
H.pnTW = (s, size) => {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c === 0x0e31 || (c >= 0x0e34 && c <= 0x0e3a) || (c >= 0x0e47 && c <= 0x0e4e)) continue;
    if (c >= 0x0e00 && c <= 0x0e7f) w += 0.6;
    else if (ch === " ") w += 0.28;
    else if (/[A-Z0-9]/.test(ch)) w += 0.66;
    else if (/[a-z]/.test(ch)) w += 0.55;
    else w += 0.42;
  }
  return w * size;
};

H.pnDropD = (cx, cy, s = 1) => {
  const f = H.f;
  return `M ${f(cx)} ${f(cy - 11 * s)} C ${f(cx + 3 * s)} ${f(cy - 5 * s)} ${f(cx + 7 * s)} ${f(cy - 1 * s)} ${f(cx + 7 * s)} ${f(cy + 3 * s)} ` +
    `A ${f(7 * s)} ${f(7 * s)} 0 0 1 ${f(cx - 7 * s)} ${f(cy + 3 * s)} C ${f(cx - 7 * s)} ${f(cy - 1 * s)} ${f(cx - 3 * s)} ${f(cy - 5 * s)} ${f(cx)} ${f(cy - 11 * s)} Z`;
};

// numbered two-line tag (top-left x, y); starts hidden
H.pnTag = (parent, id, x, y, n, title, sub, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const size = o.size || 25;
  const w = Math.max(H.pnTW(title, size), H.pnTW(sub, size)) + 84, h = 2 * size + 34;
  H.el("rect", { x, y, width: H.f(w), height: h, rx: 12, fill: PN.paper, stroke: o.stroke || PN.pipe, "stroke-width": 3 }, g);
  H.el("circle", { cx: x + 32, cy: y + h / 2, r: 20, fill: o.stroke || PN.pipe }, g);
  H.text(g, x + 32, y + h / 2 + 9, String(n), { size: 26, anchor: "middle", fill: "#ffffff" });
  H.text(g, x + 64, y + size + 6, title, { size, fill: PN.pipe });
  H.text(g, x + 64, y + 2 * size + 17, sub, { size, fill: PN.ink, weight: 700 });
  g.pnW = w; g.pnH = h;
  return g;
};

// magnifier centred on (0,0): place it with x / y / scale tweens
H.pnLens = (parent, id) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  H.el("line", { x1: 38, y1: 38, x2: 74, y2: 74, stroke: PN.ink, "stroke-width": 13, "stroke-linecap": "round" }, g);
  H.el("circle", { cx: 0, cy: 0, r: 52, fill: "rgba(31,95,191,0.07)", stroke: PN.pipe, "stroke-width": 7 }, g);
  H.el("circle", { cx: 0, cy: 0, r: 58, fill: "none", stroke: "#ffffff", "stroke-width": 3, opacity: 0.9 }, g);
  return g;
};

// flow dashes on between t0 and t1 (absolute); `again` = this element was tweened before
H.pnFlowOn = (el, t0, t1, again = false) => {
  const d = Math.max(0.3, t1 - t0);
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: !again }, t0);
  tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -24 * Math.round(d * 4), duration: d, ease: "none", immediateRender: false }, t0);
  tl.to(el, { opacity: 0, duration: 0.2 }, t0 + d);
};

// exhaust puff: air bubbles + oil-mist dots, below (x, y); `mist` 0..2 = none / normal / heavy
H.pnPuff = (parent, id, x, y, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const s = o.s || 1, mist = o.mist ?? 1;
  [[-14, 14, 13], [12, 22, 15], [-4, 40, 17], [18, 50, 12], [-20, 52, 11]].forEach(([dx, dy, r]) =>
    H.el("circle", { cx: H.f(x + dx * s), cy: H.f(y + dy * s), r: H.f(r * s), fill: PN.air, stroke: PN.flow, "stroke-width": 2.5 }, g));
  const dots = mist === 0 ? [] : mist === 1 ? [[-8, 24], [10, 38], [-14, 46], [4, 56]] :
    [[-10, 14], [6, 18], [-16, 28], [12, 30], [-4, 34], [18, 42], [-12, 44], [2, 48], [-20, 56], [14, 58], [-6, 62], [8, 66]];
  dots.forEach(([dx, dy]) => H.el("circle", { cx: H.f(x + dx * s), cy: H.f(y + dy * s), r: H.f((mist === 2 ? 6 : 4.5) * s), fill: PN.oil, stroke: "#b8921c", "stroke-width": 1.2 }, g));
  g.pnO = `${x} ${y}`;
  return g;
};
H.pnPuffAt = (g, t, again = true, dur = 0.85) => {
  tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.06, immediateRender: !again }, t);
  tl.fromTo(g, { y: -6, scale: 0.55, svgOrigin: g.pnO }, { y: 18, scale: 1.25, svgOrigin: g.pnO, duration: dur, ease: "power1.out", immediateRender: !again }, t);
  tl.to(g, { opacity: 0, duration: dur * 0.5, ease: "power1.in" }, t + dur * 0.5);
};

// leak mark: three arcs radiating from (x, y) towards angle `ang` (degrees, 0 = right)
H.pnHiss = (parent, id, x, y, ang = 0, s = 1, col = PN.flow) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  const f = H.f;
  H.el("circle", { cx: x, cy: y, r: H.f(9 * s), fill: "#ffffff", stroke: PN.ink, "stroke-width": H.f(2.5 * s) }, g);
  [16, 28, 40].forEach((r) => {
    const a0 = ((ang - 40) * Math.PI) / 180, a1 = ((ang + 40) * Math.PI) / 180, R = r * s;
    const d = `M ${f(x + R * Math.cos(a0))} ${f(y + R * Math.sin(a0))} A ${f(R)} ${f(R)} 0 0 1 ${f(x + R * Math.cos(a1))} ${f(y + R * Math.sin(a1))}`;
    H.el("path", { d, fill: "none", stroke: "#ffffff", "stroke-width": H.f(9 * s), "stroke-linecap": "round" }, g);
    H.el("path", { d, fill: "none", stroke: col, "stroke-width": H.f(5 * s), "stroke-linecap": "round" }, g);
  });
  g.pnO = `${x} ${y}`;
  return g;
};

// knurled knob face: lines inside a clip; returns the mover (tween its x to show turning)
H.pnKnurl = (parent, id, x, y, w, h, step = 9) => {
  H.el("rect", { x, y, width: w, height: h, rx: 7, fill: PN.knob, stroke: PN.ink, "stroke-width": 4 }, parent);
  const cp = H.el("clipPath", { id: `${id}-clip` }, parent);
  H.el("rect", { x: x + 3, y: y + 3, width: w - 6, height: h - 6, rx: 5 }, cp);
  const clip = H.el("g", { "clip-path": `url(#${id}-clip)` }, parent);
  const mover = H.el("g", { id }, clip);
  for (let lx = x - 4 * step; lx <= x + w + 4 * step; lx += step)
    H.el("line", { x1: lx, y1: y + 5, x2: lx, y2: y + h - 5, stroke: "#aab0b8", "stroke-width": 3 }, mover);
  return mover;
};

// gauge face: 270° sweep, ticks, "0" and the unit only. The needle is drawn at half scale (pointing up);
// rot(f) = needle rotation for fraction f of full scale (rot(0.5) = 0).
H.pnDial = (parent, cx, cy, r, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const f = H.f, A = (fr) => 135 + 270 * fr;
  H.el("circle", { cx, cy, r, fill: PN.paper, stroke: PN.ink, "stroke-width": o.sw || 4 }, g);
  const n = o.ticks || 10;
  for (let i = 0; i <= n; i++) {
    const a = (A(i / n) * Math.PI) / 180, r1 = r * (i % 5 === 0 ? 0.7 : 0.78), r2 = r * 0.88;
    H.el("line", { x1: f(cx + r1 * Math.cos(a)), y1: f(cy + r1 * Math.sin(a)), x2: f(cx + r2 * Math.cos(a)), y2: f(cy + r2 * Math.sin(a)), stroke: PN.ink, "stroke-width": i % 5 === 0 ? 3.5 : 2 }, g);
  }
  if (o.zero) {
    const a = (A(0) * Math.PI) / 180;
    H.text(g, cx + r * 0.5 * Math.cos(a) + r * 0.06, cy + r * 0.5 * Math.sin(a) + r * 0.04, "0", { size: Math.round(r * 0.3), anchor: "middle", id: o.id ? `${o.id}-0` : undefined });
  }
  if (o.unit) H.text(g, cx, cy + r * 0.64, "kgf/cm²", { size: Math.round(r * 0.21), anchor: "middle", fill: PN.muted, weight: 700 });
  const needle = H.el("g", o.id ? { id: `${o.id}-n` } : {}, g);
  H.el("path", { d: `M ${f(cx)} ${f(cy + r * 0.12)} L ${f(cx)} ${f(cy - r * 0.8)}`, stroke: o.needle || PN.ink, "stroke-width": Math.max(3, r * 0.07), "stroke-linecap": "round" }, needle);
  H.el("circle", { cx, cy, r: H.f(Math.max(4, r * 0.1)), fill: PN.ink }, g);
  const zs = Math.round(r * 0.3), za = (A(0) * Math.PI) / 180;
  const zeroAt = [cx + r * 0.5 * Math.cos(za) + r * 0.06, cy + r * 0.5 * Math.sin(za) + r * 0.04 - 0.36 * zs];
  return { g, needle, origin: `${cx} ${cy}`, rot: (fr) => 270 * fr - 135, zeroAt };
};

// ---------------------------------------------------------------------------------------------------------
// The circuit (1760 × 740 frame). o.transform places it; o.puffMist sets the oil mist of the exhaust puffs.
H.pnCircuit = (parent, p, o = {}) => {
  const g = H.el("g", { id: p, ...(o.transform ? { transform: o.transform } : {}) }, parent);
  const R = (x, y, w, h, fill = PN.metal, pg = g, rx = 6, sw = 4) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: PN.ink, "stroke-width": sw }, pg);
  const L = (x1, y1, x2, y2, sw = 3, col = PN.ink, pg = g) => H.el("line", { x1, y1, x2, y2, stroke: col, "stroke-width": sw }, pg);
  const tube = (d, w = 15) => {
    H.el("path", { d, fill: "none", stroke: PN.pipe, "stroke-width": w, "stroke-linejoin": "round" }, g);
    H.el("path", { d, fill: "none", stroke: PN.air, "stroke-width": w - 9, "stroke-linejoin": "round" }, g);
  };
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: PN.flow, "stroke-width": 4, "stroke-dasharray": "10 14", "stroke-linecap": "butt", opacity: 0 }, g);
  const MAIN = "M 50 60 L 50 410 L 680 410 L 680 620 L 1000 620 L 1000 452";
  const PA = "M 960 360 L 960 300 L 1190 300 L 1190 240";
  const PB = "M 1040 360 L 1040 335 L 1470 335 L 1470 240";
  tube(MAIN); tube(PA, 13); tube(PB, 13);
  const flows = { main: flow(`${p}-fm`, MAIN), a: flow(`${p}-fa`, PA), b: flow(`${p}-fb`, PB) };

  // ---- shop-air piping: flange, welded joint, stop valve (lever up = open), union
  R(22, 116, 56, 11, PN.dark, g, 2, 3); R(22, 129, 56, 11, PN.dark, g, 2, 3);
  for (const x of [28, 72]) L(x, 108, x, 148, 5, PN.ink);
  R(39, 198, 22, 15, PN.dark, g, 5, 3);
  L(43, 202, 57, 202, 2, PN.ink); L(43, 206, 57, 206, 2, PN.ink); L(43, 210, 57, 210, 2, PN.ink);
  R(28, 270, 44, 42, PN.metal, g, 9);
  const lever = H.el("g", { id: `${p}-sv` }, g);
  H.el("rect", { x: 45, y: 228, width: 10, height: 62, rx: 4, fill: PN.ink }, lever);
  H.el("rect", { x: 42, y: 222, width: 16, height: 30, rx: 6, fill: PN.warn, stroke: PN.ink, "stroke-width": 3 }, lever);
  H.el("circle", { cx: 50, cy: 290, r: 7, fill: PN.ink }, g);
  R(76, 395, 26, 30, PN.dark, g, 3, 3); L(84, 397, 84, 423, 2); L(94, 397, 94, 423, 2);

  // ---- FRL: Filter (x 170) — head, bowl, deflector, element, baffle, water, float, auto drain
  R(120, 380, 100, 60);
  H.el("path", { d: "M 132 440 L 132 560 Q 132 594 170 594 Q 208 594 208 560 L 208 440 Z", fill: PN.bowl, stroke: PN.ink, "stroke-width": 4 }, g);
  const waterD = (y) => `M 135 ${H.f(y)} L 205 ${H.f(y)} L 205 560 Q 205 591 170 591 Q 135 591 135 560 Z`;
  const water = H.el("path", { id: `${p}-w`, d: waterD(560), fill: PN.water, opacity: 0.5 }, g);
  H.el("path", { d: "M 140 444 L 200 444 L 189 455 L 151 455 Z", fill: PN.dark, stroke: PN.ink, "stroke-width": 2 }, g);
  R(151, 456, 38, 80, "#ece8dc", g, 4, 3);
  for (let x = 157; x <= 183; x += 6.5) L(x, 460, x, 532, 2, PN.dark);
  R(146, 538, 48, 7, PN.dark, g, 2, 2);
  const float = H.el("g", { id: `${p}-fl` }, g);
  H.el("rect", { x: 160, y: 553, width: 20, height: 12, rx: 6, fill: "#ffffff", stroke: PN.ink, "stroke-width": 2.5 }, float);
  R(156, 594, 28, 24, PN.dark, g, 4, 3);
  const plug = H.el("rect", { id: `${p}-pl`, x: 164, y: 616, width: 12, height: 14, rx: 2, fill: PN.dark, stroke: PN.ink, "stroke-width": 2.5 }, g);
  const drops = [0, 1, 2].map((i) => H.el("path", { id: `${p}-dr${i}`, d: H.pnDropD(170, 650, 0.9), fill: PN.water, opacity: 0 }, g));

  // ---- Regulator (x 360) — knob on top, bonnet, relief hole, head, body, gauge on the front
  const knurl = H.pnKnurl(g, `${p}-kn`, 326, 250, 68, 34, 9);
  R(352, 284, 16, 12, PN.dark, g, 2, 3);
  H.el("path", { d: "M 338 296 L 382 296 L 400 380 L 320 380 Z", fill: PN.metal, stroke: PN.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  H.el("circle", { cx: 384, cy: 352, r: 4.5, fill: PN.ink }, g);
  R(310, 380, 100, 60);
  R(328, 440, 64, 42);
  const gauge = H.pnDial(g, 360, 412, 31, { id: `${p}-g`, ticks: 10, sw: 3.5 });

  // ---- Lubricator (x 550) — drip knob, sight dome with oil drop, oil filler, head, bowl with oil, siphon
  R(541, 316, 18, 18, PN.knob, g, 4, 3);
  H.el("path", { d: "M 524 380 L 524 354 Q 524 332 550 332 Q 576 332 576 354 L 576 380 Z", fill: PN.bowl, stroke: PN.ink, "stroke-width": 4 }, g);
  L(550, 336, 550, 346, 3);
  const ldrop = H.el("path", { id: `${p}-ld`, d: H.pnDropD(550, 354, 0.7), fill: PN.oil, stroke: "#b8921c", "stroke-width": 1.5, opacity: 0 }, g);
  R(500, 380, 100, 60);
  H.el("path", { d: H.hexD(513, 372, 10), fill: PN.dark, stroke: PN.ink, "stroke-width": 3 }, g);
  H.el("path", { d: "M 512 440 L 512 548 Q 512 580 550 580 Q 588 580 588 548 L 588 440 Z", fill: PN.bowl, stroke: PN.ink, "stroke-width": 4 }, g);
  H.el("path", { d: "M 515 494 L 585 494 L 585 548 Q 585 577 550 577 Q 515 577 515 548 Z", fill: PN.oil }, g);
  L(550, 444, 550, 566, 3);

  // ---- 5-port solenoid valve: cable, connector + LED, coil, body with spool window, spring cap, silencers
  H.el("path", { d: "M 835 344 Q 835 316 805 316 L 748 316", fill: "none", stroke: PN.ink, "stroke-width": 5 }, g);
  R(814, 342, 42, 34, PN.knob, g, 5, 3);
  const led = H.el("circle", { id: `${p}-led`, cx: 835, cy: 359, r: 7, fill: "#2b2f35", stroke: PN.ink, "stroke-width": 2 }, g);
  R(800, 376, 70, 58, PN.knob, g, 6);
  for (let x = 812; x <= 858; x += 11.5) L(x, 382, x, 428, 2.5, "#7b828b");
  R(870, 368, 260, 74, PN.metal);
  R(886, 391, 228, 28, "#f4f1ea", g, 4, 2.5);
  const spool = H.el("g", { id: `${p}-sp` }, g);
  H.el("rect", { x: 892, y: 399, width: 192, height: 12, fill: PN.dark, stroke: PN.ink, "stroke-width": 2 }, spool);
  for (const x of [898, 960, 1022]) H.el("rect", { x, y: 393, width: 26, height: 24, rx: 3, fill: PN.steel, stroke: PN.ink, "stroke-width": 2.5 }, spool);
  R(1130, 382, 38, 46, PN.metal);
  H.el("path", { d: "M 1136 405 L 1141 394 L 1147 416 L 1153 394 L 1159 416 L 1163 405", fill: "none", stroke: PN.ink, "stroke-width": 2.5 }, g);
  for (const x of [950, 1030]) R(x, 356, 20, 12, PN.dark, g, 2, 2.5);
  for (const x of [920, 990, 1060]) R(x, 442, 20, 10, PN.dark, g, 2, 2.5);
  for (const x of [930, 1070]) {
    R(x - 13, 452, 26, 38, "#d9d4c7", g, 6, 3);
    for (let yy = 460; yy <= 482; yy += 7) for (let xx = x - 7; xx <= x + 7; xx += 7) H.el("circle", { cx: xx, cy: yy, r: 1.8, fill: PN.muted }, g);
  }

  // ---- speed adjust valve on line B (knob turns)
  R(1268, 318, 64, 34, PN.metal);
  H.el("path", { d: `${H.arrowD(1280, 346, 1320, 324, 11)}`, fill: "none", stroke: PN.ink, "stroke-width": 3 }, g);
  R(1294, 300, 12, 18, PN.dark, g, 2, 2.5);
  const scKnurl = H.pnKnurl(g, `${p}-sk`, 1282, 280, 36, 22, 7);

  // ---- air cylinder: tube, piston + rod + rod end (slides), covers, rod seal, ports
  R(1215, 148, 230, 74, "#e9eef3", g, 2);
  const rod = H.el("g", { id: `${p}-rod` }, g);
  R(1226, 151, 22, 68, PN.dark, rod, 3, 3);
  R(1248, 177, 314, 16, PN.steel, rod, 3, 3);
  H.el("rect", { x: 1252, y: 180, width: 306, height: 4, fill: "#ffffff", opacity: 0.7 }, rod);
  R(1560, 168, 32, 34, PN.metal, rod, 6, 3);
  H.el("circle", { cx: 1576, cy: 185, r: 6, fill: PN.paper, stroke: PN.ink, "stroke-width": 2.5 }, rod);
  R(1165, 140, 50, 90); R(1445, 140, 50, 90);
  R(1495, 175, 7, 20, "#2b2f35", g, 2, 2);
  for (const x of [1180, 1460]) R(x, 230, 20, 10, PN.dark, g, 2, 2.5);

  // exhaust puffs at R1 (A side) and R2 (B side)
  const mist = o.puffMist ?? 1;
  const puffA = H.pnPuff(g, `${p}-pa`, 930, 492, { mist });
  const puffB = H.pnPuff(g, `${p}-pb`, 1070, 492, { mist });

  return {
    g, flows, lever, water, waterD, float, plug, drops, knurl, gauge, ldrop, led, spool, scKnurl, rod, puffA, puffB,
    O: { lever: "50 290", stroke: 120, spool: 30 },
    // inspection spots (frame coordinates)
    at: { drain: [170, 604], knob: [360, 267], gauge: [360, 412], exhaust: [1000, 476], sc: [1300, 312], rodSeal: [1500, 185] },
  };
};

// Cylinder cycle on a circuit handle C: strokes alternate extend / retract starting at t0 (absolute),
// stroke time from durOf(t), dwell between strokes; stops before tEnd. Valve LED + spool, A/B flow, exhaust puffs.
H.pnCycle = (C, t0, tEnd, durOf, dwell = 0.45) => {
  let t = t0, ext = true, first = true, firstA = true, firstB = true, firstPA = true, firstPB = true;
  while (true) {
    const d = durOf(t);
    if (t + d > tEnd) break;
    const S = C.O.stroke;
    tl.fromTo(C.spool, { x: ext ? 0 : C.O.spool }, { x: ext ? C.O.spool : 0, duration: 0.14, ease: "power2.out", immediateRender: first }, t - 0.08);
    tl.fromTo(C.led, { attr: { fill: ext ? "#2b2f35" : PN.warn } }, { attr: { fill: ext ? PN.warn : "#2b2f35" }, duration: 0.05, immediateRender: first }, t - 0.08);
    tl.fromTo(C.rod, { x: ext ? 0 : S }, { x: ext ? S : 0, duration: d, ease: "power1.inOut", immediateRender: first }, t);
    if (ext) { H.pnFlowOn(C.flows.a, t, t + d, !firstA); firstA = false; H.pnPuffAt(C.puffB, t + 0.02, !firstPB); firstPB = false; }
    else { H.pnFlowOn(C.flows.b, t, t + d, !firstB); firstB = false; H.pnPuffAt(C.puffA, t + 0.02, !firstPA); firstPA = false; }
    first = false; ext = !ext; t += d + dwell;
  }
};
