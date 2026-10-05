// EP31 — Visual check of the pneumatic 3-point set (FRL) · OPL 5'-C-5 (PDF p.48–49).
// H.frl draws the set left → right like the figure on p.49: inlet → Air filter (bowl + manual drain at the bottom)
// → Regulator (T-handle + lock nut on top, pressure gauge on the front) → Lubricator (sight dome on top, oil bowl)
// → outlet. Local units: pipe centre line y = 0; module centres F = 0, R = 230, L = 460; extents about
// x −175 … 668, y −172 … 345. Scenes place it with o.transform. Part drawers (H.frlF / frlR / frlL) are also used
// alone, scaled, in the judgment cards.
const FC = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", paper: "#fffdf8",
  pipe: "#1f5fbf", flow: "#2a8fc9", air: "#dff1fb", water: "#3b7dd8", oil: "#f2c94c", oilEdge: "#c9971b",
  dirt: "#7a5c3a", bowl: "#eef6fb", milky: "#f1ece0", red: "#d0233a", green: "#178a4e", blue: "#1f5fbf", warn: "#f2a900",
};
const FK = { F: 0, R: 230, L: 460, bowlTop: 76, bowlStraight: 232, bowlBot: 272, wEmpty: 276, wNG: 214, oilY: 128 };
// Thai base characters (vowels / tone marks take no width) — for sizing label boxes
H.frlN = (s) => String(s).replace(/[ัิ-ฺ็-๎]/g, "").length;

const frRect = (par, x, y, w, h, fill, a = {}) =>
  H.el("rect", { x: H.f(x), y: H.f(y), width: H.f(w), height: H.f(h), rx: a.rx ?? 6, fill, stroke: FC.ink, "stroke-width": a.sw ?? 4, ...(a.attr || {}) }, par);
const frPath = (par, d, a = {}) => H.el("path", { d, fill: "none", stroke: FC.ink, "stroke-width": 3, ...a }, par);
// transparent bowl outline (straight walls, rounded bottom)
H.frlBowlD = (cx, w = 104) => {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = FK.bowlTop, y1 = FK.bowlStraight, yb = FK.bowlBot;
  return `M ${x0} ${y0} L ${x0} ${y1} C ${x0} ${y1 + 28} ${cx - 24} ${yb} ${cx} ${yb} C ${cx + 24} ${yb} ${x1} ${y1 + 28} ${x1} ${y1} L ${x1} ${y0} Z`;
};
// knurled guard ring under a head
const frRing = (par, cx) => {
  frRect(par, cx - 62, 50, 124, 28, FC.dark, { rx: 6 });
  const d = [];
  for (let x = cx - 52; x <= cx + 52; x += 13) d.push(`M ${x} 54 L ${x} 74`);
  frPath(par, d.join(" "), { "stroke-width": 2.5, opacity: 0.6 });
};
// head block with side port bosses
const frHead = (par, cx, w = 150) => {
  frRect(par, cx - w / 2 - 8, -22, 10, 44, FC.dark, { sw: 3, rx: 2 });
  frRect(par, cx + w / 2 - 2, -22, 10, 44, FC.dark, { sw: 3, rx: 2 });
  frRect(par, cx - w / 2, -50, w, 100, FC.metal, { rx: 10 });
};
const frClip = (par, id, d) => {
  const defs = H.el("defs", {}, par);
  H.el("path", { d }, H.el("clipPath", { id }, defs));
  return H.el("g", { "clip-path": `url(#${id})` }, par);
};
const frLayers = (g, L) => L || { back: g, mid: g, front: g };

// ---- Air filter -------------------------------------------------------------------------------------------
// o: { water: y of the water surface (FK.wEmpty = none), dirt: 0..1 element clogging }
H.frlF = (g, cx, p, o = {}, L) => {
  L = frLayers(g, L);
  const S = {};
  const bd = H.frlBowlD(cx);
  H.el("path", { d: bd, fill: FC.bowl, stroke: "none" }, L.back);
  const cg = frClip(L.back, `${p}-fclip`, bd);
  const wy = o.water ?? FK.wEmpty;
  S.water = H.el("rect", { id: `${p}-water`, x: cx - 60, y: wy, width: 120, height: FK.wEmpty + 2 - wy, fill: FC.water, opacity: 0.8 }, cg);
  S.wsurf = H.el("line", { id: `${p}-wsurf`, x1: cx - 60, y1: wy, x2: cx + 60, y2: wy, stroke: "#1d4f9a", "stroke-width": 3, opacity: wy < FK.wEmpty ? 1 : 0 }, cg);
  // filter element (mesh) + clogging overlay
  frRect(L.back, cx - 26, 72, 52, 102, "#f6f2e6", { sw: 3, rx: 3 });
  const mesh = [];
  for (let x = cx - 18; x <= cx + 18; x += 8) mesh.push(`M ${x} 76 L ${x} 170`);
  frPath(L.back, mesh.join(" "), { stroke: FC.muted, "stroke-width": 1.8, opacity: 0.7 });
  S.dirt = H.el("g", { id: `${p}-dirt`, opacity: o.dirt ?? 0 }, L.back);
  H.el("rect", { x: cx - 25, y: 73, width: 50, height: 100, rx: 3, fill: FC.dirt, opacity: 0.78 }, S.dirt);
  for (const [dx, dy, r] of [[-14, 92, 4], [8, 108, 5], [-6, 136, 4], [13, 150, 3.5], [-15, 160, 3], [4, 84, 3]])
    H.el("circle", { cx: cx + dx, cy: dy, r, fill: "#4a3622" }, S.dirt);
  frRect(L.back, cx - 30, 172, 60, 8, FC.dark, { sw: 2.5, rx: 2 });
  // baffle (bubble plate) below the element
  frPath(L.back, `M ${cx} 180 L ${cx} 198 M ${cx - 36} 198 L ${cx + 36} 198`, { "stroke-width": 4 });
  H.el("path", { d: bd, fill: "none", stroke: FC.ink, "stroke-width": 4 }, L.back);
  // manual drain valve at the bottom: body, knob (ribbed — scaleX turns it), nozzle
  frRect(L.back, cx - 10, FK.bowlBot - 4, 20, 16, FC.dark, { sw: 3, rx: 2 });
  S.drain = H.el("g", { id: `${p}-drain` }, L.back);
  frRect(S.drain, cx - 20, FK.bowlBot + 12, 40, 18, FC.metal, { sw: 3, rx: 5 });
  frPath(S.drain, `M ${cx - 10} ${FK.bowlBot + 14} L ${cx - 10} ${FK.bowlBot + 28} M ${cx} ${FK.bowlBot + 14} L ${cx} ${FK.bowlBot + 28} M ${cx + 10} ${FK.bowlBot + 14} L ${cx + 10} ${FK.bowlBot + 28}`, { "stroke-width": 2 });
  frRect(L.back, cx - 4, FK.bowlBot + 30, 8, 9, FC.dark, { sw: 2, rx: 1 });
  S.drainOrigin = `${cx} ${FK.bowlBot + 21}`;
  // head + guard ring
  frHead(L.front, cx);
  frRing(L.front, cx);
  S.spot = { bowl: [cx, 200], water: [cx, 240], element: [cx, 122], drain: [cx, FK.bowlBot + 22], nozzle: [cx, FK.bowlBot + 40] };
  return S;
};
// water surface → y (rect + surface line)
H.frlWater = (S, y, t, dur = 1.2, ease = "power1.inOut") => {
  tl.to(S.water, { attr: { y, height: FK.wEmpty + 2 - y }, duration: dur, ease }, t);
  tl.to(S.wsurf, { attr: { y1: y, y2: y }, opacity: y < FK.wEmpty - 1 ? 1 : 0, duration: dur, ease }, t);
};

// ---- Regulator --------------------------------------------------------------------------------------------
// o: { value: gauge needle (0..10 scale, no numbers), nutGap: lock-nut lift (px) }
H.frlR = (g, cx, p, o = {}, L) => {
  L = frLayers(g, L);
  const S = {};
  const F = L.front;
  // adjusting screw (threads), bonnet, body
  frRect(F, cx - 7, -156, 14, 66, FC.dark, { sw: 3, rx: 2 });
  const th = [];
  for (let y = -146; y <= -96; y += 7) th.push(`M ${cx - 7} ${y + 3} L ${cx + 7} ${y}`);
  frPath(F, th.join(" "), { "stroke-width": 1.8, opacity: 0.7 });
  H.el("path", { d: `M ${cx - 58} -48 L ${cx - 40} -90 L ${cx + 40} -90 L ${cx + 58} -48 Z`, fill: FC.metal, stroke: FC.ink, "stroke-width": 4, "stroke-linejoin": "round" }, F);
  frRect(F, cx - 78, -22, 10, 44, FC.dark, { sw: 3, rx: 2 });
  frRect(F, cx + 68, -22, 10, 44, FC.dark, { sw: 3, rx: 2 });
  frRect(F, cx - 70, -50, 140, 100, FC.metal, { rx: 10 });
  // lock nut (hex seen from the side) — lifts when loose
  S.nut = H.el("g", { id: `${p}-nut` }, F);
  frRect(S.nut, cx - 27, -107, 54, 17, FC.dark, { sw: 3.5, rx: 3 });
  frPath(S.nut, `M ${cx - 10} -105 L ${cx - 10} -92 M ${cx + 10} -105 L ${cx + 10} -92`, { "stroke-width": 2.2 });
  if (o.nutGap) gsap.set(S.nut, { y: -o.nutGap });
  // T-handle (bar scaleX ≈ turning)
  S.handle = H.el("g", { id: `${p}-handle` }, F);
  frRect(S.handle, cx - 12, -164, 24, 14, FC.dark, { sw: 3, rx: 3 });
  frRect(S.handle, cx - 54, -178, 108, 16, FC.ink, { sw: 2, rx: 8 });
  S.handleOrigin = `${cx} -170`;
  // pressure gauge on the front
  H.el("circle", { cx, cy: 0, r: 46, fill: FC.dark, stroke: FC.ink, "stroke-width": 4 }, F);
  const G = H.gauge(F, cx, 0, 39, { id: `${p}-g`, min: 0, max: 10, ticks: 5, minor: 1, labels: false, value: o.value ?? 6 });
  S.needle = G.needle; S.origin = G.origin; S.rot = G.rot; S.gauge = G;
  S.spot = { gauge: [cx, 0], nut: [cx, -99], handle: [cx, -170] };
  return S;
};

// ---- Lubricator -------------------------------------------------------------------------------------------
// o: { milky: 0..1, drop: false hides the drop }
H.frlL = (g, cx, p, o = {}, L) => {
  L = frLayers(g, L);
  const S = {};
  const bd = H.frlBowlD(cx);
  H.el("path", { d: bd, fill: FC.bowl, stroke: "none" }, L.back);
  const cg = frClip(L.back, `${p}-lclip`, bd);
  S.oil = H.el("rect", { id: `${p}-oil`, x: cx - 60, y: FK.oilY, width: 120, height: FK.bowlBot + 2 - FK.oilY, fill: FC.oil }, cg);
  S.milky = H.el("g", { id: `${p}-milky`, opacity: o.milky ?? 0 }, cg);
  H.el("rect", { x: cx - 60, y: FK.oilY, width: 120, height: FK.bowlBot + 2 - FK.oilY, fill: FC.milky }, S.milky);
  for (const [y, a] of [[160, 8], [196, -7], [232, 6]])
    frPath(S.milky, `M ${cx - 44} ${y} Q ${cx - 22} ${y - a} ${cx} ${y} T ${cx + 44} ${y}`, { stroke: "#ffffff", "stroke-width": 5, "stroke-linecap": "round", opacity: 0.9 });
  S.wdrops = H.el("g", { id: `${p}-wd`, opacity: o.milky ?? 0 }, cg);
  for (const [dx, dy, r] of [[-30, 176, 5], [18, 150, 4], [26, 214, 5], [-12, 246, 4], [-34, 222, 3.5], [6, 186, 3.5]])
    H.el("circle", { cx: cx + dx, cy: dy, r, fill: FC.water }, S.wdrops);
  H.el("line", { x1: cx - 60, y1: FK.oilY, x2: cx + 60, y2: FK.oilY, stroke: FC.oilEdge, "stroke-width": 3 }, cg);
  // siphon tube from the head down into the oil
  frRect(L.back, cx + 18, 76, 7, 180, "rgba(255,255,255,0.4)", { sw: 2, rx: 2 });
  H.el("path", { d: bd, fill: "none", stroke: FC.ink, "stroke-width": 4 }, L.back);
  // head, guard ring, adjusting screw, sight dome with drip tube
  frHead(L.front, cx);
  frRing(L.front, cx);
  frRect(L.front, cx + 46, -64, 12, 16, FC.dark, { sw: 2.5, rx: 2 });
  frRect(L.front, cx + 40, -76, 24, 13, FC.metal, { sw: 2.5, rx: 3 });
  frRect(L.front, cx - 64, -60, 22, 12, FC.dark, { sw: 2.5, rx: 2 });
  H.el("path", { d: `M ${cx - 28} -54 L ${cx - 28} -84 Q ${cx - 28} -112 ${cx} -112 Q ${cx + 28} -112 ${cx + 28} -84 L ${cx + 28} -54 Z`, fill: FC.bowl, stroke: FC.ink, "stroke-width": 4 }, L.front);
  frRect(L.front, cx - 4, -110, 8, 22, FC.dark, { sw: 2, rx: 1 });
  S.drop = H.el("path", { id: `${p}-drop`, d: H.frlDropD(cx, -80, 6.5), fill: FC.oil, stroke: FC.ink, "stroke-width": 1.8, opacity: 0 }, L.front);
  frRect(L.front, cx - 38, -60, 76, 12, FC.dark, { sw: 3, rx: 3 });
  S.spot = { dome: [cx, -82], bowl: [cx, 200], oil: [cx, 190] };
  return S;
};
// teardrop, tip up, centre of the round part at (x, y)
H.frlDropD = (x, y, r) =>
  `M ${H.f(x)} ${H.f(y - r * 2.1)} Q ${H.f(x + r * 0.9)} ${H.f(y - r * 0.9)} ${H.f(x + r)} ${H.f(y)} A ${r} ${r} 0 1 1 ${H.f(x - r)} ${H.f(y)} Q ${H.f(x - r * 0.9)} ${H.f(y - r * 0.9)} ${H.f(x)} ${H.f(y - r * 2.1)} Z`;
// oil drips inside the sight dome: n drops from t, one every `gap` s (each falls 0.45 s)
H.frlDrip = (drop, t, n, gap = 0.7) => {
  for (let i = 0; i < n; i++) {
    const t0 = t + i * gap;
    tl.fromTo(drop, { y: 0, opacity: 1 }, { y: 20, duration: 0.42, ease: "power2.in", immediateRender: false }, t0);
    tl.to(drop, { opacity: 0, duration: 0.06 }, t0 + 0.4);
  }
};

// ---- Whole set ----------------------------------------------------------------------------------------------
// o: { transform, labels: true, io: true } → { g, F, R, L, flow, over, mid, spot }
H.frl = (parent, p, o = {}) => {
  const g = H.el("g", { id: p, ...(o.transform ? { transform: o.transform } : {}) }, parent);
  const pipe = H.el("g", {}, g), back = H.el("g", {}, g), mid = H.el("g", { id: `${p}-mid` }, g), front = H.el("g", {}, g);
  const L = { back, mid, front };
  // air line: blue pipe, compressed-air tint inside, flow dashes (start hidden)
  const run = "M -175 0 L 640 0";
  H.el("path", { d: run, fill: "none", stroke: FC.pipe, "stroke-width": 26 }, pipe);
  H.el("path", { d: run, fill: "none", stroke: FC.air, "stroke-width": 15 }, pipe);
  const flow = H.el("path", { id: `${p}-flow`, d: run, fill: "none", stroke: FC.flow, "stroke-width": 6, "stroke-dasharray": "12 16", "stroke-linecap": "butt", opacity: 0 }, pipe);
  H.el("path", { d: "M 638 -24 L 670 0 L 638 24 Z", fill: FC.pipe }, pipe);
  const S = { g, mid, flow, L };
  S.F = H.frlF(g, FK.F, `${p}-f`, o.F || {}, L);
  S.R = H.frlR(g, FK.R, `${p}-r`, o.R || {}, L);
  S.L = H.frlL(g, FK.L, `${p}-l`, o.L || {}, L);
  S.over = H.el("g", { id: `${p}-over` }, g);
  if (o.io !== false) {
    H.text(front, -170, -26, "IN", { size: 26, fill: FC.pipe });
    H.text(front, 668, -30, "OUT", { size: 26, fill: FC.pipe, anchor: "end" });
  }
  if (o.labels !== false) {
    H.text(front, FK.F, 342, "Air filter", { size: 30, anchor: "middle" });
    H.text(front, FK.R, 96, "Regulator", { size: 30, anchor: "middle" });
    H.text(front, FK.L, 342, "Lubricator", { size: 30, anchor: "middle" });
  }
  S.spot = {
    fBowl: S.F.spot.bowl, element: S.F.spot.element, drain: S.F.spot.drain,
    gauge: [FK.R, 0], nut: S.R.spot.nut, handle: S.R.spot.handle,
    dome: S.L.spot.dome, lBowl: S.L.spot.bowl,
  };
  return S;
};
// air-flow dashes on from t for dur seconds (fade out at the end when stop)
H.frlFlow = (S, t, dur, stop = false) => {
  tl.fromTo(S.flow, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t);
  tl.fromTo(S.flow, { strokeDashoffset: 0 }, { strokeDashoffset: -28 * Math.round(dur * 4), duration: dur, ease: "none", immediateRender: false }, t);
  if (stop) tl.to(S.flow, { opacity: 0, duration: 0.3 }, t + dur - 0.3);
};

// ---- Overlay parts ----------------------------------------------------------------------------------------
// eye icon centred on (0, 0), ~64 units wide; place with transform
H.frlEye = (parent, id, cx, cy, s = 1) => {
  const g = H.el("g", { id }, parent);
  const e = H.el("g", { transform: `translate(${cx} ${cy}) scale(${s})` }, g);
  H.el("path", { d: "M -34 0 Q 0 -32 34 0 Q 0 32 -34 0 Z", fill: FC.paper, stroke: FC.ink, "stroke-width": 4, "stroke-linejoin": "round" }, e);
  H.el("circle", { cx: 0, cy: 0, r: 13, fill: FC.blue, stroke: FC.ink, "stroke-width": 2.5 }, e);
  H.el("circle", { cx: 0, cy: 0, r: 5.5, fill: FC.ink }, e);
  H.el("circle", { cx: 4, cy: -4, r: 2.5, fill: "#ffffff" }, e);
  return g;
};
// numbered marker (white halo + blue disc + number); starts hidden
H.frlNum = (parent, id, cx, cy, n, r = 22) => {
  const g = H.el("g", { id, opacity: 0 }, parent);
  H.el("circle", { cx, cy, r: r + 4, fill: "#ffffff" }, g);
  H.el("circle", { cx, cy, r, fill: FC.blue }, g);
  H.text(g, cx, cy + r * 0.42, String(n), { size: Math.round(r * 1.2), anchor: "middle", fill: "#ffffff" });
  return g;
};
// label chip with optional leader line; starts hidden. o: { size, anchor, leader:[x,y], fill, color, stroke, shown }
H.frlLab = (parent, id, x, y, str, o = {}) => {
  const g = H.el("g", { id, opacity: o.shown ? 1 : 0 }, parent);
  const size = o.size || 26, lines = [].concat(str);
  const w = o.w || Math.max(...lines.map((s) => H.frlN(s))) * size * 0.56 + 26, h = lines.length * size * 1.25 + 14;
  const x0 = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  if (o.leader) {
    const [lx, ly] = o.leader, cx = Math.max(x0, Math.min(x0 + w, lx)), cy = Math.max(y - h / 2, Math.min(y + h / 2, ly));
    H.el("path", { d: `M ${H.f(cx)} ${H.f(cy)} L ${H.f(lx)} ${H.f(ly)}`, fill: "none", stroke: o.stroke || FC.ink, "stroke-width": 2.5 }, g);
    H.el("circle", { cx: lx, cy: ly, r: 5, fill: o.stroke || FC.ink }, g);
  }
  H.el("rect", { x: H.f(x0), y: H.f(y - h / 2), width: H.f(w), height: H.f(h), rx: 9, fill: o.fill || FC.paper, stroke: o.stroke || FC.ink, "stroke-width": 2.5 }, g);
  lines.forEach((s, i) => H.text(g, x0 + w / 2, y - h / 2 + 7 + size * (1.25 * i + 1) - size * 0.12, s, { size, anchor: "middle", fill: o.color || FC.ink, weight: o.weight }));
  return g;
};
H.frlShow = (el, t, d = 0.3) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: d, immediateRender: false }, t);
H.frlHide = (el, t, d = 0.3) => tl.to(el, { opacity: 0, duration: d }, t);
// pulsing ring on a spot (finite)
H.frlRing = (parent, id, cx, cy, r, t, o = {}) => {
  const c = H.el("circle", { id, cx, cy, r, fill: "none", stroke: o.color || FC.blue, "stroke-width": o.sw || 5, "stroke-dasharray": o.dash || "none", opacity: 0 }, parent);
  tl.fromTo(c, { opacity: 0, scale: 1.25, svgOrigin: `${cx} ${cy}` }, { opacity: 1, scale: 1, svgOrigin: `${cx} ${cy}`, duration: 0.35, ease: "power2.out", immediateRender: false }, t);
  if (o.pulse) tl.to(c, { scale: 1.12, svgOrigin: `${cx} ${cy}`, duration: 0.3, yoyo: true, repeat: o.pulse * 2 - 1, ease: "sine.inOut" }, t + 0.4);
  if (o.hide) tl.to(c, { opacity: 0, duration: 0.3 }, o.hide);
  return c;
};
// needle swinging between two values (finite, ends back at `back`)
H.frlSwing = (S, lo, hi, t, dur, back) => {
  const n = Math.max(2, Math.round(dur / 0.28));
  tl.to(S.needle, { rotation: S.rot(hi), svgOrigin: S.origin, duration: 0.14, ease: "sine.out" }, t);
  tl.fromTo(S.needle, { rotation: S.rot(hi), svgOrigin: S.origin }, { rotation: S.rot(lo), svgOrigin: S.origin, duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: n - (n % 2) - 1, immediateRender: false }, t + 0.14);
  tl.to(S.needle, { rotation: S.rot(back), svgOrigin: S.origin, duration: 0.3, ease: "power2.out" }, t + 0.14 + 0.28 * (n - (n % 2)));
};

// ---- Card parts (judgment scenes) -------------------------------------------------------------------------
// short air-line stub behind a mini part (local units of that part)
H.frlStub = (g, x0, x1) => {
  H.el("path", { d: `M ${x0} 0 L ${x1} 0`, fill: "none", stroke: FC.pipe, "stroke-width": 26 }, g);
  H.el("path", { d: `M ${x0} 0 L ${x1} 0`, fill: "none", stroke: FC.air, "stroke-width": 15 }, g);
};
// mini part group: kind F | R | L, placed at (x, y) with scale s; returns the part handles + g
H.frlMini = (parent, kind, p, x, y, s, o = {}) => {
  const g = H.el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  H.frlStub(g, kind === "R" ? -110 : -100, kind === "R" ? 110 : 100);
  const S = (kind === "F" ? H.frlF : kind === "R" ? H.frlR : H.frlL)(g, 0, p, o);
  S.g = g;
  S.pg = (lx, ly) => [x + s * lx, y + s * ly];
  return S;
};
// gauge with a dark bezel (no numbers); o.set draws a short blue mark at the set value
H.frlDial = (parent, id, cx, cy, r, o = {}) => {
  H.el("circle", { cx, cy, r: r + 7, fill: FC.dark, stroke: FC.ink, "stroke-width": 4 }, parent);
  const G = H.gauge(parent, cx, cy, r, { id, min: 0, max: 10, ticks: 5, minor: 1, labels: false, value: o.value ?? 6 });
  if (o.set != null) {
    const a = (G.rot(o.set) * Math.PI) / 180;
    H.el("path", { d: `M ${H.f(cx + Math.cos(a) * r * 0.62)} ${H.f(cy + Math.sin(a) * r * 0.62)} L ${H.f(cx + Math.cos(a) * r * 0.98)} ${H.f(cy + Math.sin(a) * r * 0.98)}`, fill: "none", stroke: FC.blue, "stroke-width": 6 }, parent);
  }
  return G;
};
// magnifier inset: circle at (cx, cy) radius r with a leader to `from`; returns the clipped inner group
H.frlInset = (parent, id, cx, cy, r, from) => {
  const g = H.el("g", { id }, parent);
  if (from) {
    const [fx, fy] = from, a = Math.atan2(fy - cy, fx - cx);
    H.el("path", { d: `M ${H.f(fx)} ${H.f(fy)} L ${H.f(cx + Math.cos(a) * r)} ${H.f(cy + Math.sin(a) * r)}`, fill: "none", stroke: FC.muted, "stroke-width": 2.5, "stroke-dasharray": "6 5" }, g);
    H.el("circle", { cx: fx, cy: fy, r: 13, fill: "none", stroke: FC.muted, "stroke-width": 2.5 }, g);
  }
  const defs = H.el("defs", {}, g);
  H.el("circle", { cx, cy, r }, H.el("clipPath", { id: `${id}-clip` }, defs));
  H.el("circle", { cx, cy, r, fill: FC.paper }, g);
  const inner = H.el("g", { "clip-path": `url(#${id}-clip)` }, g);
  H.el("circle", { cx, cy, r, fill: "none", stroke: FC.ink, "stroke-width": 4 }, g);
  return inner;
};
// big sight dome (for an inset): base centre (cx, by), scale k → drop path (hidden)
H.frlDome = (parent, id, cx, by, k = 2) => {
  const P = (x, y) => `${H.f(cx + x * k)} ${H.f(by + y * k)}`;
  H.el("path", { d: `M ${P(-60, 30)} L ${P(-60, 4)} L ${P(60, 4)} L ${P(60, 30)} Z`, fill: FC.metal, stroke: FC.ink, "stroke-width": 4 }, parent);
  H.el("path", { d: `M ${P(-28, 0)} L ${P(-28, -30)} Q ${P(-28, -58)} ${P(0, -58)} Q ${P(28, -58)} ${P(28, -30)} L ${P(28, 0)} Z`, fill: FC.bowl, stroke: FC.ink, "stroke-width": 4 }, parent);
  H.el("rect", { x: H.f(cx - 4 * k), y: H.f(by - 56 * k), width: H.f(8 * k), height: H.f(22 * k), rx: 2, fill: FC.dark, stroke: FC.ink, "stroke-width": 2.5 }, parent);
  H.el("rect", { x: H.f(cx - 38 * k), y: H.f(by - 6 * k), width: H.f(76 * k), height: H.f(12 * k), rx: 4, fill: FC.dark, stroke: FC.ink, "stroke-width": 3 }, parent);
  return H.el("path", { id, d: H.frlDropD(cx, by - 22 * k, 6.5 * k), fill: FC.oil, stroke: FC.ink, "stroke-width": 2, opacity: 0 }, parent);
};
// curved "turn" arrow around (cx, cy)
H.frlTurnD = (cx, cy, r, a0 = 200, a1 = 340) => {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x1, y1] = p(a1), [x0, y0] = p(a1 - 14);
  const tx = x1 - x0, ty = y1 - y0, L = Math.hypot(tx, ty), ux = tx / L, uy = ty / L, h = 14;
  return `${H.arcD(cx, cy, r, a0, a1)} M ${H.f(x1 - ux * h - uy * h * 0.6)} ${H.f(y1 - uy * h + ux * h * 0.6)} L ${H.f(x1)} ${H.f(y1)} L ${H.f(x1 - ux * h + uy * h * 0.6)} ${H.f(y1 - uy * h - ux * h * 0.6)}`;
};
