// EP17 — Oil tank structure & easy check (OPL 5-C-4, 5-C-5, 5-C-7).
// H.t17Unit: hydraulic power unit, front view with the tank cut open, modelled on the figure of OPL 5-C-4:
//   tank body + baffle plate + suction filter, lid with pump · motor · air breather · replenish port · temperature
//   gauge, oil level meter on the left wall, manhole cover on the right wall, return pipe from the circuit.
//   Local coordinates (about 20..800 × 20..520); scenes place it with o.transform.
// Small parts for insets / judgment cards: sight glass, breather cut-away, palm, label chips, rings.
const TC = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", blue: "#1f5fbf", paper: "#fffdf8",
  air: "#fffaf0", oil: "#f5dc8a", surf: "#c9971b", red: "#d0233a", green: "#178a4e", warn: "#f2a900",
  dirt: "#5b4a2e", glass: "#eef4f6", newOil: "#f8f0cf", brown: "#93602a", black: "#2a231c",
};
// level of the oil surface: pump stopped (= upper limit of the level meter) / pump running
const TK = { up: 262, run: 300, bot: 497, gTop: 232, gBot: 464 };
// Thai base characters (vowel / tone marks take no width) — for sizing label boxes
H.t17n = (s) => String(s).replace(/[ัิ-ฺ็-๎]/g, "").length;

H.t17Unit = (parent, p, o = {}) => {
  const g = H.el("g", { id: p, ...(o.transform ? { transform: o.transform } : {}) }, parent);
  const R = (x, y, w, h, fill, a = {}, par = g) =>
    H.el("rect", { x, y, width: w, height: h, rx: a.rx ?? 6, fill, stroke: TC.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, par);
  const P = (d, a = {}, par = g) => H.el("path", { d, fill: "none", stroke: TC.ink, "stroke-width": 3, ...a }, par);
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", "stroke-linecap": "butt", opacity: 0 }, g);
  const S = { g };

  // feet, tank body (cut open): air space, oil, baffle plate, suction filter
  R(118, 496, 50, 24, TC.dark, { rx: 3 });
  R(692, 496, 50, 24, TC.dark, { rx: 3 });
  H.el("rect", { x: 100, y: 200, width: 660, height: 300, fill: TC.air, stroke: TC.ink, "stroke-width": 6 }, g);
  S.oil = H.el("rect", { id: `${p}-oil`, x: 103, y: TK.up, width: 654, height: TK.bot - TK.up, fill: TC.oil }, g);
  S.surf = H.el("line", { id: `${p}-surf`, x1: 103, y1: TK.up, x2: 757, y2: TK.up, stroke: TC.surf, "stroke-width": 3 }, g);
  S.dirtG = H.el("g", { id: `${p}-dirt` }, g);
  S.baffle = R(465, 330, 10, 167, TC.metal, { sw: 3, rx: 1, attr: { id: `${p}-baffle` } });
  // suction pipe + filter (mesh drawn as lines)
  H.el("path", { id: `${p}-suc`, d: "M 230 444 L 230 182", fill: "none", stroke: TC.blue, "stroke-width": 12 }, g);
  R(166, 444, 128, 42, "#ebe6da", { rx: 16 });
  const mesh = [];
  for (let x = 176; x <= 284; x += 9) mesh.push(`M ${x} 448 L ${x} 482`);
  for (let y = 453; y <= 478; y += 8) mesh.push(`M 170 ${y} L 290 ${y}`);
  P(mesh.join(" "), { "stroke-width": 1.6, opacity: 0.5 });
  R(222, 436, 16, 12, TC.metal, { sw: 2, rx: 2 });
  // return pipe from the circuit, outlet below the oil surface
  H.el("path", { id: `${p}-ret`, d: "M 742 30 L 742 420", fill: "none", stroke: TC.muted, "stroke-width": 9 }, g);
  R(733, 416, 18, 8, TC.metal, { sw: 2, rx: 1 });
  // temperature-gauge stem (into the oil)
  R(686, 160, 8, 190, TC.metal, { sw: 2, rx: 2 });
  // lid
  R(88, 188, 684, 12, TC.metal, { rx: 3 });
  // discharge pipe to the circuit
  H.el("path", { id: `${p}-dis`, d: "M 230 116 L 230 34", fill: "none", stroke: TC.blue, "stroke-width": 10 }, g);
  H.el("path", { d: "M 216 44 L 230 22 L 244 44 Z", fill: TC.blue }, g);
  S.flows = [
    flow(`${p}-f1`, "M 230 444 L 230 182"),
    flow(`${p}-f2`, "M 230 116 L 230 40"),
    flow(`${p}-f3`, "M 742 30 L 742 420"),
  ].map((n) => n.id);

  // pump + coupling + motor on the lid
  R(212, 178, 36, 12, TC.metal, { sw: 3, rx: 2 });
  S.pump = R(190, 116, 80, 64, TC.dark, { rx: 10 });
  H.text(g, 230, 158, "ปั๊ม", { size: 26, anchor: "middle" });
  R(270, 134, 15, 30, TC.metal, { sw: 3, rx: 3 });
  R(285, 134, 15, 30, TC.metal, { sw: 3, rx: 3 });
  R(318, 174, 30, 16, TC.metal, { sw: 3, rx: 2 });
  R(432, 174, 30, 16, TC.metal, { sw: 3, rx: 2 });
  R(300, 104, 180, 72, TC.metal, { rx: 10 });
  const fins = [];
  for (let x = 314; x <= 466; x += 13) fins.push(`M ${x} 110 L ${x} 170`);
  P(fins.join(" "), { "stroke-width": 2, opacity: 0.4 });
  R(480, 118, 14, 44, TC.dark, { sw: 3, rx: 4 });
  R(342, 124, 96, 34, TC.paper, { sw: 2, rx: 6 });
  H.text(g, 390, 148, "มอเตอร์", { size: 22, anchor: "middle" });

  // air breather (cap with louvres; `bclog` darkens it)
  R(538, 168, 14, 22, TC.dark, { sw: 2, rx: 1 });
  S.breather = R(510, 128, 70, 42, TC.metal, { rx: 16, attr: { id: `${p}-br` } });
  P("M 522 140 L 568 140 M 522 149 L 568 149 M 522 158 L 568 158", { "stroke-width": 2.5 });
  S.bclog = R(510, 128, 70, 42, TC.dirt, { sw: 0, rx: 16, attr: { id: `${p}-bclog`, opacity: 0 } });
  // replenish port (filler neck + cap)
  R(608, 170, 28, 20, TC.metal, { sw: 3, rx: 2 });
  R(600, 156, 44, 16, TC.dark, { sw: 3, rx: 5 });
  P("M 610 160 L 610 168 M 618 160 L 618 168 M 626 160 L 626 168 M 634 160 L 634 168", { "stroke-width": 2 });
  // temperature gauge (dial on the lid, red mark = 55 °C criterion; no scale numbers at this size)
  R(683, 164, 14, 26, TC.metal, { sw: 2, rx: 2 });
  S.temp = H.gauge(g, 690, 132, 30, { id: `${p}-tg`, min: 0, max: 100, ticks: 5, minor: 1, labelEvery: 99, marks: [{ v: 55 }], value: 38 });

  // oil level meter on the left wall: frame, glass, oil column, ticks, upper-limit mark
  R(78, 236, 24, 14, TC.metal, { sw: 3, rx: 2 });
  R(78, 444, 24, 14, TC.metal, { sw: 3, rx: 2 });
  R(34, 222, 44, 252, TC.metal, { rx: 10 });
  H.el("rect", { x: 45, y: TK.gTop, width: 22, height: TK.gBot - TK.gTop, rx: 3, fill: TC.glass, stroke: TC.ink, "stroke-width": 2 }, g);
  S.glass = H.el("rect", { id: `${p}-glass`, x: 46, y: TK.up, width: 20, height: TK.gBot - 1 - TK.up, fill: TC.oil }, g);
  S.gsurf = H.el("line", { id: `${p}-gsurf`, x1: 46, y1: TK.up, x2: 66, y2: TK.up, stroke: TC.surf, "stroke-width": 3 }, g);
  const tk = [];
  for (let y = 286; y <= 446; y += 32) tk.push(`M 67 ${y} L 74 ${y}`);
  P(tk.join(" "), { "stroke-width": 2 });
  H.el("path", { d: `M 38 ${TK.up} L 76 ${TK.up}`, fill: "none", stroke: TC.ink, "stroke-width": 4 }, g);
  H.el("path", { d: `M 22 ${TK.up - 9} L 34 ${TK.up} L 22 ${TK.up + 9} Z`, fill: TC.ink }, g);
  H.el("rect", { x: 49, y: TK.gTop + 6, width: 4, height: TK.gBot - TK.gTop - 12, fill: "#ffffff", opacity: 0.7 }, g);

  // manhole cover on the right wall (bolted plate + handle)
  R(760, 296, 14, 160, TC.metal, { sw: 3, rx: 2 });
  for (const y of [308, 346, 406, 444]) R(774, y - 5, 8, 10, TC.dark, { sw: 2, rx: 1 });
  P("M 774 360 L 794 360 L 794 392 L 774 392", { "stroke-width": 5 });

  S.spot = { meter: [56, 300], mark: [56, TK.up], breather: [545, 149], fill: [622, 164], temp: [690, 132], manhole: [770, 376],
    baffle: [470, 340], filter: [230, 465], outlet: [742, 420], wall: [757, 470], pump: [230, 148] };
  return S;
};

// Oil level → y (tank oil, surface line, level-meter column together)
H.t17Level = (S, y, t, dur = 0.9) => {
  const e = { duration: dur, ease: "power1.inOut" };
  tl.to(S.oil, { attr: { y, height: TK.bot - y }, ...e }, t);
  tl.to(S.surf, { attr: { y1: y, y2: y }, ...e }, t);
  tl.to(S.glass, { attr: { y, height: TK.gBot - 1 - y }, ...e }, t);
  tl.to(S.gsurf, { attr: { y1: y, y2: y }, ...e }, t);
};
// Oil-flow dashes on, from t until t + dur (then fade out when `stop` is true)
H.t17Flow = (ids, t, dur, stop = false) => {
  for (const id of ids) {
    tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 0.95, duration: 0.3, immediateRender: false }, t);
    tl.fromTo(`#${id}`, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round(dur * 3), duration: dur, ease: "none", immediateRender: false }, t);
    if (stop) tl.to(`#${id}`, { opacity: 0, duration: 0.3 }, t + dur - 0.3);
  }
};

// Label chip with an optional leader line; starts hidden (reveal with H.t17Show). o: { size, anchor, leader:[x,y], fill, color, w }
H.t17Lab = (parent, id, x, y, str, o = {}) => {
  const g = H.el("g", { id, opacity: o.shown ? 1 : 0 }, parent);
  const size = o.size || 24, lines = [].concat(str);
  const w = o.w || Math.max(...lines.map((s) => H.t17n(s))) * size * 0.56 + 24, h = lines.length * size * 1.25 + 12;
  const x0 = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  if (o.leader) {
    const [lx, ly] = o.leader, cx = Math.max(x0, Math.min(x0 + w, lx)), cy = Math.max(y - h / 2, Math.min(y + h / 2, ly));
    H.el("path", { d: `M ${H.f(cx)} ${H.f(cy)} L ${H.f(lx)} ${H.f(ly)}`, fill: "none", stroke: TC.ink, "stroke-width": 2.5 }, g);
    H.el("circle", { cx: lx, cy: ly, r: 5, fill: TC.ink }, g);
  }
  H.el("rect", { x: H.f(x0), y: H.f(y - h / 2), width: H.f(w), height: H.f(h), rx: 8, fill: o.fill || TC.paper, stroke: o.stroke || TC.ink, "stroke-width": 2 }, g);
  lines.forEach((s, i) => H.text(g, x0 + w / 2, y - h / 2 + 6 + size * (1.25 * i + 1) - size * 0.12, s, { size, anchor: "middle", fill: o.color || TC.ink, weight: o.weight }));
  return g;
};
H.t17Show = (el, t, d = 0.3) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: d, immediateRender: false }, t);
H.t17Hide = (el, t, d = 0.3) => tl.to(el, { opacity: 0, duration: d }, t);

// Numbered marker (blue disc + number) — starts hidden; pops at t
H.t17Num = (parent, id, cx, cy, n, t, r = 22) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  H.el("circle", { cx, cy, r: r + 3, fill: "#ffffff" }, g);
  H.el("circle", { cx, cy, r, fill: TC.blue }, g);
  H.text(g, cx, cy + r * 0.42, String(n), { size: Math.round(r * 1.2), anchor: "middle", fill: "#ffffff" });
  if (t != null) {
    tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false }, t);
    tl.fromTo(g, { scale: 1.8, svgOrigin: `${cx} ${cy}` }, { scale: 1, svgOrigin: `${cx} ${cy}`, duration: 0.35, ease: "back.out(2)", immediateRender: false }, t);
  }
  return g;
};
// Pulsing ring on a spot (finite repeat)
H.t17Ring = (parent, id, cx, cy, r, t, n = 3, col = TC.blue) => {
  const c = H.el("circle", { id, cx, cy, r, fill: "none", stroke: col, "stroke-width": 5, opacity: 0 }, parent);
  tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, t);
  tl.fromTo(c, { scale: 1, svgOrigin: `${cx} ${cy}` }, { scale: 1.15, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: 2 * n - 1, ease: "sine.inOut", immediateRender: false }, t + 0.1);
  return c;
};

// Stand-alone sight glass (for insets and cards). x,y = top-left of the frame; h = frame height.
// o: { level (0..1 of glass height, 1 = upper-limit mark), color, mark: true, w } → { g, oil, surf, yAt(f) }
H.t17Glass = (parent, x, y, h, o = {}) => {
  const g = H.el("g", {}, parent);
  const w = o.w || 46, gx = x + 10, gw = w - 20, gy0 = y + 12, gy1 = y + h - 12;
  const markY = gy0 + (gy1 - gy0) * 0.16;
  const yAt = (f) => gy1 - (gy1 - markY) * f;
  H.el("rect", { x, y, width: w, height: h, rx: 10, fill: TC.metal, stroke: TC.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: gx, y: gy0, width: gw, height: gy1 - gy0, rx: 3, fill: TC.glass, stroke: TC.ink, "stroke-width": 2 }, g);
  const lv = yAt(o.level ?? 1);
  const oil = H.el("rect", { x: gx + 1, y: H.f(lv), width: gw - 2, height: H.f(gy1 - lv), fill: o.color || TC.newOil }, g);
  const surf = H.el("line", { x1: gx + 1, y1: H.f(lv), x2: gx + gw - 1, y2: H.f(lv), stroke: o.surf || TC.surf, "stroke-width": 3 }, g);
  H.el("rect", { x: gx + 4, y: gy0 + 6, width: 4, height: gy1 - gy0 - 12, fill: "#ffffff", opacity: 0.75 }, g);
  if (o.mark !== false) {
    H.el("path", { d: `M ${x + 4} ${H.f(markY)} L ${x + w - 4} ${H.f(markY)}`, fill: "none", stroke: TC.ink, "stroke-width": 4 }, g);
    H.el("path", { d: `M ${x - 14} ${H.f(markY - 9)} L ${x - 2} ${H.f(markY)} L ${x - 14} ${H.f(markY + 9)} Z`, fill: TC.ink }, g);
  }
  return { g, oil, surf, yAt, markY, bottom: gy1 };
};
// Glass level tween (f = fraction, 1 = upper-limit mark)
H.t17GlassTo = (G, f, t, dur = 0.8) => {
  const y = G.yAt(f);
  tl.to(G.oil, { attr: { y, height: G.bottom - y }, duration: dur, ease: "power1.inOut" }, t);
  tl.to(G.surf, { attr: { y1: y, y2: y }, duration: dur, ease: "power1.inOut" }, t);
};

// Air breather cut open: cap, pleated element, (dirt overlay). cx = centre, y = top of cap, s = scale.
// → { g, dirt (group, opacity 0 unless o.dirty) }
H.t17Breather = (parent, cx, y, s = 1, o = {}) => {
  const g = H.el("g", { transform: `translate(${cx} ${y}) scale(${s})` }, parent);
  // neck + tank lid piece
  H.el("rect", { x: -80, y: 118, width: 160, height: 14, rx: 3, fill: TC.metal, stroke: TC.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: -14, y: 96, width: 28, height: 24, fill: TC.dark, stroke: TC.ink, "stroke-width": 3 }, g);
  // cap shell (cut open) and the element inside
  H.el("path", { d: "M -70 96 L -70 22 Q -70 0 -48 0 L 48 0 Q 70 0 70 22 L 70 96", fill: "none", stroke: TC.ink, "stroke-width": 7 }, g);
  H.el("rect", { x: -52, y: 18, width: 104, height: 70, rx: 6, fill: "#fbf8ee", stroke: TC.ink, "stroke-width": 3 }, g);
  const pl = [];
  for (let x = -44; x <= 44; x += 11) pl.push(`M ${x} 22 L ${x + 5.5} 30 L ${x} 38 L ${x + 5.5} 46 L ${x} 54 L ${x + 5.5} 62 L ${x} 70 L ${x + 5.5} 78 L ${x} 86`);
  H.el("path", { d: pl.join(" "), fill: "none", stroke: TC.muted, "stroke-width": 2 }, g);
  const dirt = H.el("g", { opacity: o.dirty ? 1 : 0 }, g);
  H.el("rect", { x: -52, y: 18, width: 104, height: 70, rx: 6, fill: TC.dirt, opacity: 0.55 }, dirt);
  const pts = [[-38, 30], [-20, 44], [6, 28], [26, 52], [40, 34], [-30, 66], [-6, 74], [18, 70], [34, 80], [-44, 50], [10, 46], [-14, 58]];
  for (const [px, py] of pts) H.el("circle", { cx: px, cy: py, r: 4.5, fill: "#3b2f1d" }, dirt);
  return { g, dirt };
};

// Open hand (palm facing the viewer), fingers up. cx, cy = palm centre; s = scale. → outer group
H.t17Palm = (parent, cx, cy, s = 1, o = {}) => {
  const outer = H.el("g", o.id ? { id: o.id } : {}, parent);
  const g = H.el("g", { transform: `translate(${cx} ${cy}) scale(${s})` }, outer);
  const skin = o.fill || "#f2c9a0", st = { fill: skin, stroke: TC.ink, "stroke-width": 4, "stroke-linejoin": "round" };
  // fingers (rounded rects), thumb, palm
  [[-33, -88, 20, 66], [-11, -100, 20, 78], [11, -96, 20, 74], [33, -82, 19, 60]].forEach(([x, y, w, h]) =>
    H.el("rect", { x: x - w / 2, y, width: w, height: h, rx: w / 2, ...st }, g));
  H.el("path", { d: "M -42 -10 Q -72 -34 -70 -48 Q -66 -60 -54 -50 L -34 -26 Z", ...st }, g);
  H.el("path", { d: "M -44 -36 L 44 -36 L 44 18 Q 44 52 0 52 Q -44 52 -44 18 Z", ...st }, g);
  H.el("path", { d: "M -22 -36 L -22 -30 M 0 -36 L 0 -30 M 22 -36 L 22 -30", fill: "none", stroke: TC.ink, "stroke-width": 3 }, g);
  return outer; // tween x / y / opacity on the outer group (the inner one carries the placement transform)
};
// Heat waves (three wavy lines rising), start hidden
H.t17Heat = (parent, x, y, h = 50, o = {}) => {
  const g = H.el("g", { opacity: 0, ...(o.id ? { id: o.id } : {}) }, parent);
  for (const dx of [-18, 0, 18]) {
    const d = [];
    for (let k = 0; k <= 4; k++) d.push(`${k ? "L" : "M"} ${H.f(x + dx + (k % 2 ? 6 : -6))} ${H.f(y - (h * k) / 4)}`);
    H.el("path", { d: d.join(" "), fill: "none", stroke: o.color || TC.red, "stroke-width": o.w || 4, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  }
  return g;
};
// Inset frame (rounded box with a dashed leader to a spot), start hidden. → group to draw into
H.t17Inset = (parent, id, x, y, w, h, spot, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  if (spot) {
    const [sx, sy] = spot, ax = Math.max(x, Math.min(x + w, sx)), ay = Math.max(y, Math.min(y + h, sy));
    H.el("path", { d: `M ${H.f(ax)} ${H.f(ay)} L ${H.f(sx)} ${H.f(sy)}`, fill: "none", stroke: TC.blue, "stroke-width": 3, "stroke-dasharray": "9 7" }, g);
    H.el("circle", { cx: sx, cy: sy, r: o.spotR || 26, fill: "none", stroke: TC.blue, "stroke-width": 4 }, g);
  }
  H.el("rect", { x, y, width: w, height: h, rx: 18, fill: TC.paper, stroke: TC.blue, "stroke-width": 4 }, g);
  return g;
};
