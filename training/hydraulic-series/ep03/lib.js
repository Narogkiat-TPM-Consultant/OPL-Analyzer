// EP03 — hydraulic sign (symbol) circuit vs actual circuit, after the figure of OPL 5-A-4 (PDF p.6).
// S3.* = symbols in ISO 1219 / JIS B 0125 style, P3.* = simplified pictorial parts.
// Every drawer draws around its own origin into group g; place it with G3(parent, x, y, scale).
// H.signCircuit / H.actualCircuit lay the same components out the same way (cylinder top, flow valves,
// direction valve, gauge + relief valve, pump + motor, tank) so the oil path can be traced on both.

const K3 = {
  ink: "#1a1d21", muted: "#59606a", metal: "#c9c1ae", dark: "#9aa1aa", steel: "#d9dde3", blue: "#1f5fbf",
  ret: "#6f9be0", oil: "#f2c94c", oilBg: "#fbe7a1", paper: "#fffdf8", tube: "#dfe8f6", yellow: "#f2a900",
  line: "#d6cdb9", sheet: "#ffffff", sheetLine: "#c9d6ea", chamber: "#9dbbe8",
};
const SW3 = 4.5; // symbol line width (local units)

const G3 = (parent, x, y, k = 1, id) => H.el("g", { ...(id ? { id } : {}), transform: `translate(${H.f(x)} ${H.f(y)}) scale(${k})` }, parent);
const L3 = (g, d, o = {}) => H.el("path", {
  d, fill: "none", stroke: o.c || K3.ink, "stroke-width": o.w || SW3, "stroke-linejoin": "round", "stroke-linecap": "butt",
  ...(o.dash ? { "stroke-dasharray": o.dash } : {}), ...(o.id ? { id: o.id } : {}),
}, g);
const R3 = (g, x, y, w, h, fill, o = {}) => H.el("rect", {
  x, y, width: w, height: h, rx: o.rx || 0, fill, stroke: o.stroke || K3.ink, "stroke-width": o.sw ?? 4, ...(o.id ? { id: o.id } : {}),
}, g);
const C3 = (g, cx, cy, r, fill, o = {}) => H.el("circle", {
  cx, cy, r, fill, stroke: o.stroke || K3.ink, "stroke-width": o.sw ?? SW3, ...(o.id ? { id: o.id } : {}),
}, g);
// Open arrowhead at (x, y) pointing along angle a (radians).
const head3 = (x, y, a, s = 13) => {
  const p = (da) => `${H.f(x - s * Math.cos(a + da))} ${H.f(y - s * Math.sin(a + da))}`;
  return `M ${p(0.45)} L ${H.f(x)} ${H.f(y)} L ${p(-0.45)}`;
};
// Text made of differently coloured parts: parts = [[text, fill, weight?], ...]
const T3 = (g, x, y, parts, o = {}) => {
  const t = H.text(g, x, y, "", o);
  for (const [s, fill, w] of parts) {
    const ts = H.el("tspan", { fill: fill || K3.ink, ...(w ? { "font-weight": w } : {}) }, t);
    ts.textContent = s;
  }
  return t;
};

// ------------------------------------------------------------------ symbols (ISO 1219 / JIS B 0125 style)
const S3 = {
  // pump: circle + filled triangle pointing out (outlet up). Ports (0,-36) out, (0,36) in.
  pump(g) {
    C3(g, 0, 0, 36, K3.paper);
    H.el("path", { d: "M 0 -36 L -14 -12 L 14 -12 Z", fill: K3.ink }, g);
  },
  // electric motor: circle + M
  motor(g) {
    C3(g, 0, 0, 36, K3.paper);
    H.text(g, 0, 13, "M", { size: 38, anchor: "middle" });
  },
  // rotation arrow between motor and pump (as drawn on the deck)
  drive(g) {
    L3(g, "M 6 24 Q -12 0 6 -24", { w: 3.5 });
    L3(g, head3(6, -24, Math.atan2(-24, 18), 12), { w: 3.5 });
  },
  // filter: diamond + dashed element line across the flow. Ports (0,±30).
  filter(g) {
    H.el("path", { d: "M 0 -30 L 30 0 L 0 30 L -30 0 Z", fill: K3.paper, stroke: K3.ink, "stroke-width": SW3, "stroke-linejoin": "round" }, g);
    L3(g, "M -30 0 L 30 0", { w: 3.5, dash: "7 5" });
  },
  // air breather on the tank lid (origin = foot of the stem)
  breather(g) {
    L3(g, "M 0 0 L 0 -32");
    L3(g, "M -18 -32 L 18 -32", { w: 3.5, dash: "6 4" });
    L3(g, "M -34 -26 Q 0 -74 34 -26");
  },
  // pressure gauge: circle + arrow. Port (0,30).
  gauge(g) {
    C3(g, 0, 0, 30, K3.paper);
    L3(g, H.arrowD(-18, 18, 19, -19, 12), { w: 3.5 });
  },
  // stop valve (gauge cock) as drawn on the deck: throttle )( + arrow. Ports (0,±19).
  stop(g) {
    L3(g, "M 0 -19 L 0 19");
    L3(g, "M -12 -14 Q -2 0 -12 14 M 12 -14 Q 2 0 12 14", { w: 3.5 });
    L3(g, H.arrowD(-22, 14, 22, -14, 10), { w: 3 });
  },
  // pressure regulating (relief) valve: box, arrow offset from the ports (normally closed), spring below,
  // dashed pilot line from the inlet on top. Ports (±40, 8): inlet right, outlet left.
  relief(g, p) {
    R3(g, -40, -26, 80, 52, K3.paper, { sw: SW3, id: p + "-box" });
    L3(g, H.arrowD(28, -10, -28, -10, 13), { w: 3.5 });
    L3(g, "M 0 26 L -14 31 L 14 37 L -14 43 L 14 49 L -14 55 L 0 60", { w: 3.5 });
    L3(g, "M 0 -26 L 0 -50 L 80 -50 L 80 8", { w: 3.5, dash: "9 6" });
  },
  // 4-port 3-position solenoid direction valve, spring centred. Origin = centre of the middle box.
  // Ports A(-22,-46) B(22,-46) P(-22,46) T(22,46). The spool group (boxes + solenoids + springs) slides ±86.
  dir(g, p) {
    const sp = H.el("g", { id: p + "-spool" }, g);
    const boxes = [-129, -43, 43].map((x, i) => R3(sp, x, -32, 86, 64, K3.paper, { sw: SW3, id: `${p}-bx${i}` }));
    const aL = H.el("g", { id: p + "-al" }, sp);
    L3(aL, H.arrowD(-108, 24, -108, -24, 13), { w: 3.5 });
    L3(aL, H.arrowD(-64, -24, -64, 24, 13), { w: 3.5 });
    L3(sp, "M -22 32 L -22 14 M -33 14 L -11 14 M -22 -32 L -22 -8 L 22 -8 M 22 -32 L 22 32", { w: 3.5 });
    C3(sp, 22, -8, 4.5, K3.ink, { sw: 0 });
    const aR = H.el("g", { id: p + "-ar" }, sp);
    L3(aR, H.arrowD(64, 24, 108, -24, 13), { w: 3.5 });
    L3(aR, H.arrowD(64, -24, 108, 24, 13), { w: 3.5 });
    const ends = [-1, 1].map((s) => {
      const x0 = s * 129, e = H.el("g", { id: `${p}-e${s < 0 ? "l" : "r"}` }, sp);
      L3(e, `M ${x0} -14 L ${x0 + s * 7} -25 L ${x0 + s * 15} -4 L ${x0 + s * 23} -25 L ${x0 + s * 31} -4 L ${x0 + s * 39} -25 L ${x0 + s * 46} -14`, { w: 3.2 });
      const sol = R3(e, s < 0 ? x0 - 46 : x0, 2, 46, 28, K3.paper, { sw: 3.5, id: `${p}-sol${s < 0 ? "l" : "r"}` });
      L3(e, s < 0 ? `M ${x0 - 40} 26 L ${x0 - 8} 6` : `M ${x0 + 8} 26 L ${x0 + 40} 6`, { w: 3 });
      return { e, sol };
    });
    L3(g, "M -22 -32 L -22 -46 M 22 -32 L 22 -46 M -22 32 L -22 46 M 22 32 L 22 46");
    return { spool: sp, boxes, aL, aR, endL: ends[0].e, endR: ends[1].e, solL: ends[0].sol, solR: ends[1].sol };
  },
  // flow regulating valve: variable throttle )( with arrow across + check valve in the bypass
  // (ball lifts upward = free flow toward the cylinder). Ports (0,±80).
  flow(g, p) {
    L3(g, "M 0 -80 L 0 80");
    L3(g, "M 0 -50 L 80 -50 L 80 -15 M 80 12 L 80 50 L 0 50");
    const adj = H.el("g", { id: p + "-adj" }, g);
    L3(adj, "M -14 -24 Q -2 0 -14 24 M 14 -24 Q 2 0 14 24", { w: 3.5 });
    L3(adj, H.arrowD(-36, 28, 34, -26, 14), { w: 3.5 });
    const chk = H.el("g", { id: p + "-chk" }, g);
    L3(chk, "M 64 -12 L 80 12 L 96 -12", { w: 3.5 });
    C3(chk, 80, -6, 9, K3.paper, { sw: 3.5 });
    return { adj, chk };
  },
  // double-acting cylinder: barrel, piston, rod. Ports (±128, 44). Returns the moving rod group and the
  // cap-side oil chamber (width grows with the stroke).
  cyl(g, p) {
    R3(g, -170, -30, 340, 60, K3.paper, { sw: SW3 });
    const ch = H.el("rect", { id: p + "-ch", x: -168, y: -27, width: 52, height: 54, fill: K3.chamber, opacity: 0 }, g);
    const rod = H.el("g", { id: p + "-rod" }, g);
    H.el("rect", { x: -116, y: -30, width: 12, height: 60, fill: K3.ink }, rod);
    R3(rod, -104, -7, 334, 14, K3.paper, { sw: 3.5 });
    L3(g, "M -128 30 L -128 44 M 128 30 L 128 44");
    return { rod, ch, chW: 52 };
  },
  // open tank (U)
  tank(g, x1, x2, y1, y2) {
    L3(g, `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2} L ${x2} ${y1}`);
  },
};

// ------------------------------------------------------------------ pictorial parts
const P3 = {
  // tank, top centre at origin
  tank(g, w, h) {
    R3(g, -w / 2, 0, w, h, K3.oilBg, { rx: 8, sw: 5 });
    H.el("rect", { x: -w / 2 + 4, y: H.f(h * 0.3), width: w - 8, height: H.f(h * 0.7 - 4), fill: K3.oil }, g);
    H.el("line", { x1: -w / 2 + 4, y1: H.f(h * 0.3), x2: w / 2 - 4, y2: H.f(h * 0.3), stroke: "#d9a92a", "stroke-width": 3 }, g);
  },
  // suction filter (mesh element), outlet on top at (0,-36)
  filter(g) {
    R3(g, -20, -28, 40, 56, "#c3c9d0", { rx: 8, sw: 3.5 });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) H.el("circle", { cx: -11 + c * 11, cy: -18 + r * 9, r: 2.6, fill: K3.ink, opacity: 0.55 }, g);
    R3(g, -14, -36, 28, 8, K3.dark, { sw: 3 });
  },
  // air breather cap, standing on the tank top at the origin
  breather(g) {
    R3(g, -9, -12, 18, 12, K3.dark, { sw: 3 });
    R3(g, -26, -34, 52, 22, K3.steel, { rx: 8, sw: 3.5 });
    for (const x of [-14, -5, 4, 13]) H.el("line", { x1: x, y1: -30, x2: x, y2: -16, stroke: K3.ink, "stroke-width": 2, opacity: 0.5 }, g);
    H.el("path", { d: "M -22 -34 Q 0 -48 22 -34 Z", fill: K3.steel, stroke: K3.ink, "stroke-width": 3 }, g);
  },
  // pump (front view, rotor visible). Ports (0,-42) out, (0,42) in.
  pump(g, p) {
    R3(g, -10, -42, 20, 12, K3.dark, { sw: 3 });
    R3(g, -10, 30, 20, 12, K3.dark, { sw: 3 });
    R3(g, -32, -30, 64, 60, K3.dark, { rx: 16, sw: 4 });
    C3(g, 0, 0, 22, K3.steel, { sw: 3 });
    const rotor = H.el("g", { id: p + "-rot" }, g);
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i + Math.PI / 4;
      H.el("line", { x1: 0, y1: 0, x2: H.f(19 * Math.cos(a)), y2: H.f(19 * Math.sin(a)), stroke: K3.ink, "stroke-width": 3.5 }, rotor);
    }
    C3(rotor, 0, 0, 5, K3.ink, { sw: 0 });
    return { rotor, origin: "0 0" };
  },
  // electric motor, shaft to the left (toward the pump)
  motor(g) {
    R3(g, -64, -6, 16, 12, K3.dark, { sw: 2.5 });
    R3(g, -40, 36, 100, 10, K3.dark, { sw: 3 });
    R3(g, -50, -36, 120, 72, K3.metal, { rx: 10, sw: 4 });
    for (let i = 0; i < 9; i++) H.el("line", { x1: -38 + i * 12, y1: -30, x2: -38 + i * 12, y2: 30, stroke: K3.ink, "stroke-width": 2, opacity: 0.45 }, g);
    R3(g, 70, -30, 18, 60, K3.steel, { rx: 6, sw: 3.5 });
    R3(g, -18, -50, 34, 14, K3.metal, { sw: 3 });
  },
  // pump (0,0) + coupling + motor (130,0) on a base plate. Returns the pump rotor.
  pumpSet(g, p) {
    const pu = P3.pump(g, p);
    R3(g, 32, -16, 34, 32, "#6b7280", { sw: 3 });
    P3.motor(G3(g, 130, 0));
    R3(g, -44, 46, 270, 14, K3.steel, { sw: 3 });
    return pu;
  },
  // relief valve: body, spring bonnet (cut-away spring), lock nut, adjusting screw.
  // Ports: inlet (52,0) right, outlet (0,34) bottom.
  relief(g) {
    R3(g, 40, -8, 12, 16, K3.dark, { sw: 3 });
    R3(g, -8, 22, 16, 12, K3.dark, { sw: 3 });
    R3(g, -40, -22, 80, 44, K3.metal, { rx: 6, sw: 4 });
    R3(g, -17, -74, 34, 52, K3.steel, { rx: 4, sw: 4 });
    H.el("rect", { x: -10, y: -69, width: 20, height: 42, fill: "#f4f1ea" }, g);
    L3(g, "M 0 -28 L -8 -33 L 8 -39 L -8 -45 L 8 -51 L -8 -57 L 8 -63 L 0 -68", { w: 2.5 });
    R3(g, -13, -84, 26, 10, K3.dark, { sw: 3 });
    R3(g, -6, -100, 12, 16, K3.dark, { sw: 3 });
  },
  // stop valve (hand wheel) with the pressure gauge on top. Port (0,26) bottom.
  gaugeStop(g, p) {
    R3(g, -6, 16, 12, 10, K3.dark, { sw: 2.5 });
    R3(g, -5, -40, 10, 22, K3.steel, { sw: 3 });
    R3(g, -36, -6, 20, 8, K3.dark, { sw: 2.5 });
    const wheel = H.el("g", { id: p + "-wh" }, g);
    C3(wheel, -46, -2, 15, "none", { sw: 5 });
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3;
      H.el("line", { x1: -46, y1: -2, x2: H.f(-46 + 14 * Math.cos(a)), y2: H.f(-2 + 14 * Math.sin(a)), stroke: K3.ink, "stroke-width": 3 }, wheel);
    }
    R3(g, -16, -18, 32, 34, K3.metal, { rx: 5, sw: 4 });
    C3(g, 0, -74, 36, K3.paper, { sw: 6 });
    for (let i = 0; i <= 6; i++) {
      const a = ((135 + 45 * i) * Math.PI) / 180;
      H.el("line", { x1: H.f(28 * Math.cos(a)), y1: H.f(-74 + 28 * Math.sin(a)), x2: H.f(33 * Math.cos(a)), y2: H.f(-74 + 33 * Math.sin(a)), stroke: K3.ink, "stroke-width": 3 }, g);
    }
    const needle = H.el("g", { id: p + "-nd" }, g);
    const a0 = (135 * Math.PI) / 180;
    H.el("line", { x1: 0, y1: -74, x2: H.f(26 * Math.cos(a0)), y2: H.f(-74 + 26 * Math.sin(a0)), stroke: K3.ink, "stroke-width": 4.5, "stroke-linecap": "round" }, needle);
    C3(g, 0, -74, 5, K3.ink, { sw: 0 });
    return { needle, origin: "0 -74" };
  },
  // solenoid direction valve: body + two solenoid coils. Ports A(-22,-40) B(22,-40) P(-22,40) T(22,40).
  dirValve(g, p) {
    for (const x of [-22, 22]) { R3(g, x - 7, -40, 14, 10, K3.dark, { sw: 2.5 }); R3(g, x - 7, 30, 14, 10, K3.dark, { sw: 2.5 }); }
    R3(g, -80, -30, 160, 60, K3.metal, { rx: 6, sw: 4 });
    R3(g, -42, -20, 84, 24, K3.paper, { rx: 4, sw: 3 });
    for (const y of [-12, -4]) H.el("line", { x1: -32, y1: y, x2: 32, y2: y, stroke: K3.muted, "stroke-width": 2.5 }, g);
    const side = (s) => {
      const coil = R3(g, s < 0 ? -148 : 80, -25, 68, 50, K3.steel, { rx: 12, sw: 4, id: `${p}-c${s < 0 ? "l" : "r"}` });
      R3(g, s < 0 ? -158 : 148, -9, 10, 18, K3.dark, { sw: 3 });
      R3(g, s < 0 ? -132 : 98, -42, 34, 17, K3.dark, { rx: 3, sw: 3 });
      const lamp = C3(g, s * 115, -33.5, 5, "#5b6168", { sw: 0, id: `${p}-lp${s < 0 ? "l" : "r"}` });
      return { coil, lamp };
    };
    const L = side(-1), Rr = side(1);
    return { coilL: L.coil, lampL: L.lamp, coilR: Rr.coil, lampR: Rr.lamp };
  },
  // flow regulating valve: block + adjusting knob. Ports (0,±40).
  flowValve(g, p) {
    R3(g, -7, -40, 14, 10, K3.dark, { sw: 2.5 });
    R3(g, -7, 30, 14, 10, K3.dark, { sw: 2.5 });
    R3(g, -36, -30, 72, 60, K3.metal, { rx: 6, sw: 4 });
    const knob = H.el("g", { id: p + "-kn" }, g);
    C3(knob, 0, 0, 21, K3.dark, { sw: 3.5 });
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      H.el("line", { x1: H.f(16 * Math.cos(a)), y1: H.f(16 * Math.sin(a)), x2: H.f(21 * Math.cos(a)), y2: H.f(21 * Math.sin(a)), stroke: K3.ink, "stroke-width": 2 }, knob);
    }
    H.el("line", { x1: 0, y1: 0, x2: 0, y2: -14, stroke: K3.paper, "stroke-width": 4, "stroke-linecap": "round" }, knob);
    return { knob, origin: "0 0" };
  },
  // hydraulic cylinder (tie-rod type): tube, end caps, piston + rod (moving group). Ports (±165,60).
  cylinder(g, p) {
    R3(g, -173, 46, 16, 14, K3.dark, { sw: 2.5 });
    R3(g, 157, 46, 16, 14, K3.dark, { sw: 2.5 });
    R3(g, -176, -43, 352, 6, K3.steel, { sw: 2 });
    R3(g, -176, 37, 352, 6, K3.steel, { sw: 2 });
    R3(g, -150, -32, 300, 64, K3.tube, { rx: 3, sw: 4 });
    const ch = H.el("rect", { id: p + "-ch", x: -148, y: -29, width: 20, height: 58, fill: K3.chamber, opacity: 0 }, g);
    const rod = H.el("g", { id: p + "-rod" }, g);
    R3(rod, -128, -30, 14, 60, K3.dark, { sw: 3 });
    R3(rod, -114, -9, 354, 18, K3.steel, { sw: 3 });
    R3(rod, 240, -15, 18, 30, K3.dark, { sw: 3 });
    R3(rod, 258, -10, 18, 20, K3.metal, { sw: 3 });
    R3(g, -182, -46, 32, 92, K3.metal, { rx: 4, sw: 4 });
    R3(g, 150, -46, 32, 92, K3.metal, { rx: 4, sw: 4 });
    for (const x of [-166, 166]) for (const y of [-36, 36]) H.el("circle", { cx: x, cy: y, r: 4, fill: K3.ink }, g);
    return { rod, ch, chW: 20 };
  },
};

// ------------------------------------------------------------------ helpers
// Steel pipe (actual circuit)
const pipe3 = (g, d) => {
  H.el("path", { d, fill: "none", stroke: K3.muted, "stroke-width": 13, "stroke-linejoin": "round" }, g);
  H.el("path", { d, fill: "none", stroke: K3.steel, "stroke-width": 7, "stroke-linejoin": "round" }, g);
};
// Highlight frame (starts hidden). Inside a scaled group pass k so the frame keeps a constant line width.
H.e3ring = (g, x, y, w, h, k = 1, id) => H.el("rect", {
  ...(id ? { id } : {}), x, y, width: w, height: h, rx: H.f(14 / k), fill: "rgba(31,95,191,0.10)",
  stroke: K3.blue, "stroke-width": H.f(5 / k), "stroke-dasharray": `${H.f(12 / k)} ${H.f(8 / k)}`, opacity: 0,
}, g);
// show a highlight from t for `hold` seconds
H.e3flash = (el, t, hold = 1.6) => {
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, t);
  tl.to(el, { opacity: 0, duration: 0.35, ease: "power2.in" }, t + 0.25 + hold);
};
// time inside narration segment k (1-based) of the current scene, frac 0..1 of its spoken length
H.e3seg = (T, D, k, frac) => {
  const c = T.cues, s = c[k - 1], e = k < c.length ? c[k] - 0.3 : D - 0.8;
  return s + frac * (e - s);
};
// geometric length (fallback when getTotalLength is unavailable)
const len3 = (el) => {
  let L = 0;
  try { L = el.getTotalLength(); } catch (e) { L = 0; }
  if (L > 0) return L;
  const n = (a) => +el.getAttribute(a) || 0;
  if (el.tagName === "rect") return 2 * (n("width") + n("height"));
  if (el.tagName === "circle") return 2 * Math.PI * n("r");
  if (el.tagName === "line") return Math.hypot(n("x2") - n("x1"), n("y2") - n("y1"));
  return 400;
};
// Draw a group on stroke by stroke: solid strokes draw on, dashed strokes / fills / text fade in.
H.e3draw = (root, t0, span, each = 0.5) => {
  const els = [...root.querySelectorAll("path, line, rect, circle, text")];
  els.filter((el) => el.getAttribute("opacity") !== "0").forEach((el, i, arr) => {
    const t = t0 + (span * i) / Math.max(1, arr.length - 1);
    const stroke = el.getAttribute("stroke"), fill = el.getAttribute("fill");
    if (el.tagName !== "text" && stroke && stroke !== "none" && !el.getAttribute("stroke-dasharray") && +el.getAttribute("stroke-width") > 0) {
      const L = len3(el);
      el.setAttribute("stroke-dasharray", `${H.f(L + 1)} ${H.f(L + 1)}`);
      tl.fromTo(el, { strokeDashoffset: L + 1 }, { strokeDashoffset: 0, duration: each, ease: "power1.inOut" }, t);
      if (fill && fill !== "none") tl.fromTo(el, { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.3 }, t + each * 0.6);
    } else {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35 }, t);
    }
  });
};
// Oil flowing along path d: the coloured line advances from t for dur, then dashes run until tEnd.
H.e3flow = (g, id, d, color, w, t, dur, tEnd) => {
  const base = H.el("path", { id, d, fill: "none", stroke: color, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "butt" }, g);
  const L = len3(base);
  base.setAttribute("stroke-dasharray", `${H.f(L + 1)} ${H.f(L + 1)}`);
  tl.fromTo(base, { strokeDashoffset: L + 1 }, { strokeDashoffset: 0, duration: dur, ease: "none" }, t);
  const run = H.el("path", { id: id + "-r", d, fill: "none", stroke: "#ffffff", "stroke-width": H.f(w * 0.42), "stroke-dasharray": "9 15", opacity: 0 }, g);
  const t1 = t + dur, len = Math.max(0.5, tEnd - t1);
  tl.fromTo(run, { opacity: 0 }, { opacity: 0.95, duration: 0.25 }, t1);
  tl.fromTo(run, { strokeDashoffset: 0 }, { strokeDashoffset: -24 * Math.round(len * 2.5), duration: len, ease: "none", immediateRender: false }, t1);
  return base;
};
// numbered badge (starts hidden)
H.e3badge = (g, cx, cy, n, o = {}) => {
  const b = H.el("g", { ...(o.id ? { id: o.id } : {}), opacity: 0 }, g);
  C3(b, cx, cy, o.r || 24, o.fill || K3.blue, { sw: 3, stroke: "#ffffff" });
  H.text(b, cx, cy + (o.size || 30) * 0.36, String(n), { size: o.size || 30, anchor: "middle", fill: "#ffffff" });
  return b;
};

// ------------------------------------------------------------------ full circuits (same layout)
// Sign circuit, local box ≈ 28..830 × 38..842.
H.signCircuit = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  const at = (x, y, k = 1) => G3(g, x, y, k);
  // drawn in oil order: tank → filter → pump → pressure line → relief/gauge → direction valve → flow valves → cylinder
  S3.tank(g, 40, 820, 740, 840);
  L3(g, "M 40 740 L 88 740");
  S3.breather(at(64, 740));
  S3.filter(at(520, 790));
  L3(g, "M 520 760 L 520 696");
  S3.pump(at(520, 660));
  S3.drive(at(580, 660));
  S3.motor(at(640, 660));
  L3(g, "M 520 624 L 520 540 L 438 540 L 438 466");
  L3(g, "M 520 590 L 210 590");
  C3(g, 520, 590, 5, K3.ink, { sw: 0 });
  C3(g, 330, 590, 5, K3.ink, { sw: 0 });
  S3.relief(at(170, 582), p + "-rv");
  L3(g, "M 130 590 L 110 590 L 110 830");
  L3(g, "M 330 590 L 330 574");
  S3.stop(at(330, 555));
  S3.gauge(at(330, 506));
  const dv = S3.dir(at(460, 420), p + "-dv");
  L3(g, "M 482 466 L 482 496");
  S3.tank(g, 462, 502, 484, 502);
  L3(g, "M 438 374 L 438 355 L 322 355 L 322 335");
  L3(g, "M 482 374 L 482 355 L 578 355 L 578 335");
  const fa = S3.flow(at(322, 255), p + "-fa");
  const fb = S3.flow(at(578, 255), p + "-fb");
  L3(g, "M 322 175 L 322 114 M 578 175 L 578 114");
  const cy = S3.cyl(at(450, 70), p + "-cy");
  const routes = {
    suc: "M 520 815 L 520 696",
    press: "M 520 624 L 520 540 L 438 540 L 438 466",
    br: "M 520 590 L 210 590",
    gauge: "M 330 590 L 330 536",
    a: "M 438 466 L 438 374 L 438 355 L 322 355 L 322 100",
    ret: "M 578 100 L 578 355 L 482 355 L 482 498",
  };
  const badges = { 1: [[578, 806]], 2: [[452, 660]], 3: [[250, 398]], 4: [[452, 255], [706, 255]], 5: [[238, 70]] };
  return { g, dv, fa, fb, cy, routes, badges, stroke: 150, cyStroke: 150 };
};

// Actual circuit (simplified pictorial), local box ≈ 30..850 × 40..866.
H.actualCircuit = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  P3.tank(G3(g, 440, 740), 820, 126); // tank first: pipes inside it stay visible (cut-away view)
  const pipes = H.el("g", {}, g);
  const flow = H.el("g", { id: p + "-flow" }, g);
  const parts = H.el("g", {}, g);
  const at = (x, y, k = 1) => G3(parts, x, y, k);
  [
    "M 510 786 L 510 714", "M 510 630 L 510 530 L 418 530 L 418 440", "M 510 585 L 218 585", "M 166 619 L 166 806",
    "M 418 360 L 418 330 L 275 330 L 275 300", "M 462 360 L 462 330 L 605 330 L 605 300",
    "M 275 220 L 275 150", "M 605 220 L 605 150", "M 462 440 L 462 490",
  ].forEach((d) => pipe3(pipes, d));
  L3(pipes, "M 462 490 L 462 512", { w: 5 });
  L3(pipes, head3(462, 514, Math.PI / 2, 15), { w: 5 });
  H.text(pipes, 478, 512, "ไปถัง", { size: 30, fill: K3.muted });
  P3.breather(at(80, 740));
  P3.filter(at(510, 822));
  const pu = P3.pumpSet(at(510, 672), p + "-pu");
  P3.relief(at(166, 585));
  const gs = P3.gaugeStop(at(300, 559), p + "-gs");
  const dv = P3.dirValve(at(440, 400), p + "-dv");
  const fa = P3.flowValve(at(275, 260), p + "-fa");
  const fb = P3.flowValve(at(605, 260), p + "-fb");
  const cy = P3.cylinder(at(440, 90), p + "-cy");
  const routes = {
    suc: "M 510 845 L 510 714",
    press: "M 510 630 L 510 530 L 418 530 L 418 440",
    br: "M 510 585 L 218 585",
    a: "M 418 440 L 418 360 L 418 330 L 275 330 L 275 150",
    ret: "M 605 150 L 605 330 L 462 330 L 462 506",
  };
  const badges = { 1: [[566, 808]], 2: [[452, 660]], 3: [[244, 400]], 4: [[342, 260], [672, 260]], 5: [[214, 90]] };
  return { g, flow, pu, gs, dv, fa, fb, cy, routes, badges };
};

// ------------------------------------------------------------------ "actual → symbol" table (scenes 2 and 3)
// viewBox 1760 × 740, three rows: [badge] actual part (centre x 319) → symbol on a white sheet (centre x 858) | name + how to read
H.e3table = (parent, p) => {
  const g = H.$(parent);
  H.text(g, 319, 34, "ของจริง (Actual)", { size: 30, anchor: "middle", fill: K3.muted });
  H.text(g, 858, 34, "สัญลักษณ์ (Sign)", { size: 30, anchor: "middle", fill: K3.blue });
  H.text(g, 1116, 34, "ชื่อ · วิธีอ่านสัญลักษณ์", { size: 30, fill: K3.muted });
  return [0, 1, 2].map((i) => {
    const y = 52 + i * 228, cy = y + 109;
    const rg = H.el("g", { id: `${p}-r${i + 1}` }, g);
    R3(rg, 8, y, 1744, 218, K3.paper, { rx: 22, sw: 3, stroke: K3.line });
    R3(rg, 628, y + 12, 460, 194, K3.sheet, { rx: 14, sw: 3, stroke: K3.sheetLine });
    C3(rg, 44, cy, 26, K3.blue, { sw: 0 });
    H.text(rg, 44, cy + 11, String(i + 1), { size: 32, anchor: "middle", fill: "#ffffff" });
    const arrow = L3(rg, `M 566 ${cy} L 612 ${cy} ` + head3(614, cy, 0, 16), { c: K3.blue, w: 6, id: `${p}-ar${i + 1}` });
    const act = H.el("g", { id: `${p}-a${i + 1}` }, rg);
    const sym = H.el("g", { id: `${p}-s${i + 1}` }, rg);
    const txt = H.el("g", { id: `${p}-t${i + 1}` }, rg);
    return { g: rg, y, cy, act, sym, txt, arrow };
  });
};
// name (parts), second line, "how to read" line
H.e3rowText = (row, l1, l2, l3) => {
  T3(row.txt, 1116, row.y + 70, l1, { size: 38 });
  H.text(row.txt, 1116, row.y + 122, l2, { size: 30, fill: K3.muted, weight: 700 });
  T3(row.txt, 1116, row.y + 176, [["อ่าน: ", K3.muted], [l3, K3.blue]], { size: 31 });
};
// row k lights up at t: row from dim to full, symbol draws itself, arrow grows
H.e3rowOn = (row, t, drawSpan = 1.0) => {
  tl.fromTo(row.g, { opacity: 0.28 }, { opacity: 1, duration: 0.35 }, t);
  H.e3draw(row.sym, t + 0.15, drawSpan, 0.35);
  tl.fromTo(row.arrow, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, t + 0.1);
};
