// EP04 — Vane pump cross-section (figure of OPL 5-A-5), shared by the title (s1) and the main diagram (s3).
// Local units: cam-ring centre O = (0, 0). The rotor centre O' = (-e, 0) sits left of O (eccentric), as in the
// deck figure: rotation is counter-clockwise, intake at the bottom, discharge at the top.
const VP = { R: 180, band: 22, Rc: 228, e: 32, rr: 145, N: 8, vw: 18, vl: 96, slot0: 42, shaft: 30, port: 64, wall: 20, out: 60 };
// Distance from the rotor centre to the ring along a slot whose absolute angle is `deg`
// (degrees clockwise from 3 o'clock, screen coordinates).
VP.tip = (deg) => {
  const t = (deg * Math.PI) / 180, e = VP.e, R = VP.R;
  return e * Math.cos(t) + Math.sqrt(R * R - e * e * Math.sin(t) ** 2);
};

// Draw the pump into `parent`; o = { x, y, s } places and scales it.
// o.chambers = vane indices k whose chamber (vane k → k+1) is highlighted (default [0]).
// Returns { g, rot, vanes, alpha, chamber, chambers, origin, flowIn, flowOut, headIn, headOut, pt(r, deg) }.
H.vanePump = (parent, p, o = {}) => {
  const { R, band, Rc, e, rr, N, vw, vl, slot0, shaft, port, wall, out } = VP;
  const f = H.f;
  const g = H.el("g", { id: p, transform: `translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})` }, parent);
  const defs = H.el("defs", {}, g);
  const pat = H.el("pattern", { id: `${p}-hatch`, patternUnits: "userSpaceOnUse", width: 12, height: 12, patternTransform: "rotate(45)" }, defs);
  H.el("rect", { width: 12, height: 12, fill: HC.paper }, pat);
  H.el("line", { x1: 0, y1: 0, x2: 0, y2: 12, stroke: HC.ink, "stroke-width": 3 }, pat);
  const cp = H.el("clipPath", { id: `${p}-clip` }, defs);
  H.el("circle", { cx: 0, cy: 0, r: R }, cp);

  // casing: round body + port bosses (outline pass, then fill pass → one outline around the union)
  const yEnd = Rc + out, bw = port + 2 * wall;
  const body = [["circle", { cx: 0, cy: 0, r: Rc }], ["rect", { x: -bw / 2, y: -yEnd, width: bw, height: 2 * yEnd, rx: 4 }]];
  for (const [t, a] of body) H.el(t, { ...a, fill: "none", stroke: HC.ink, "stroke-width": 8 }, g);
  for (const [t, a] of body) H.el(t, { ...a, fill: HC.metal }, g);

  // port channels (oil), open at the ends; discharge on top, intake at the bottom
  const chan = (y0, y1) => {
    H.el("rect", { x: -port / 2, y: Math.min(y0, y1), width: port, height: Math.abs(y1 - y0), fill: HC.oilBg }, g);
    for (const sx of [-1, 1]) H.el("line", { x1: (sx * port) / 2, y1: y0, x2: (sx * port) / 2, y2: y1, stroke: HC.ink, "stroke-width": 3 }, g);
  };
  chan(-yEnd - 4, -R); chan(R, yEnd + 4);
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: HC.blue, "stroke-width": 7, "stroke-dasharray": "14 16", "stroke-linecap": "butt", opacity: 0 }, g);
  const flowIn = flow(`${p}-fin`, `M 0 ${yEnd} L 0 ${R + band}`);
  const flowOut = flow(`${p}-fout`, `M 0 ${-R - band} L 0 ${-yEnd}`);
  const head = (id, y) => H.el("path", { id, d: `M -24 ${y + 26} L 0 ${y} L 24 ${y + 26} Z`, fill: HC.blue, opacity: 0 }, g);
  const headIn = head(`${p}-hin`, R + band + 12);
  const headOut = head(`${p}-hout`, -yEnd + 4);

  // inside the ring (clipped to the ring bore): oil, then the turning rotor group
  const inner = H.el("g", { "clip-path": `url(#${p}-clip)` }, g);
  H.el("circle", { cx: 0, cy: 0, r: R, fill: HC.oilBg }, inner);
  const rot = H.el("g", { id: `${p}-rot` }, inner);
  const pt = (r, a) => `${f(-e + r * Math.cos((a * Math.PI) / 180))} ${f(r * Math.sin((a * Math.PI) / 180))}`;
  const Rw = R + e + 12, a1 = 360 / N;
  // highlighted pump chambers (deep oil colour), each between vane k and vane k+1; they start hidden
  const chambers = (o.chambers || [0]).map((k, i) => {
    const q0 = k * a1, q1 = q0 + a1;
    return H.el("path", { id: `${p}-ch${i}`, d: `M ${pt(0, 0)} L ${pt(Rw, q0)} A ${Rw} ${Rw} 0 0 1 ${pt(Rw, q1)} Z`, fill: "#eda512", opacity: 0 }, rot);
  });
  const chamber = chambers[0];
  H.el("circle", { cx: -e, cy: 0, r: rr, fill: "#e4dfd2", stroke: HC.ink, "stroke-width": 4 }, rot);
  const vanes = [], alpha = [];
  for (let k = 0; k < N; k++) {
    const a = a1 * k;
    alpha.push(a);
    const sg = H.el("g", { transform: `rotate(${a} ${-e} 0)` }, rot);
    // slot: a groove (filled with oil) open at the rotor surface; the vane plate slides in it
    const sh = vw / 2 + 3;
    H.el("path", { d: `M ${-e + rr} ${-sh} L ${-e + slot0} ${-sh} L ${-e + slot0} ${sh} L ${-e + rr} ${sh}`, fill: HC.oilBg, stroke: HC.ink, "stroke-width": 2.5 }, sg);
    vanes.push(H.el("rect", { id: `${p}-v${k}`, x: -e + rr - vl, y: -vw / 2, width: vl, height: vw, fill: "#59606a", stroke: HC.ink, "stroke-width": 2 }, sg));
  }
  H.el("circle", { cx: -e, cy: 0, r: shaft, fill: "#9aa1aa", stroke: HC.ink, "stroke-width": 4 }, rot);
  H.el("rect", { x: -e - 7, y: -shaft - 1, width: 14, height: 15, fill: HC.ink }, rot);

  // cam ring (hatched band) on top
  const ann = (r1, r2) => `M ${r2} 0 A ${r2} ${r2} 0 1 1 ${-r2} 0 A ${r2} ${r2} 0 1 1 ${r2} 0 Z M ${r1} 0 A ${r1} ${r1} 0 1 0 ${-r1} 0 A ${r1} ${r1} 0 1 0 ${r1} 0 Z`;
  H.el("path", { d: ann(R, R + band), fill: `url(#${p}-hatch)`, "fill-rule": "evenodd", stroke: HC.ink, "stroke-width": 4 }, g);

  return { g, rot, vanes, alpha, chamber, chambers, origin: `${-e} 0`, flowIn, flowOut, headIn, headOut, pt };
};

// Turn the rotor from absolute time tA to tB. rotFn(t) = rotor angle in degrees at absolute time t
// (GSAP rotation: negative = counter-clockwise). extFn(t) = how far the vanes are out (0 = in the slots,
// 1 = tips on the ring). Each value is a pure function of time (custom ease), so any frame can be seeked.
H.vpSpin = (P, tA, tB, rotFn, extFn = () => 1) => {
  const dur = tB - tA, r0 = rotFn(tA);
  tl.fromTo(P.rot, { rotation: r0, svgOrigin: P.origin }, { rotation: r0 + 1, svgOrigin: P.origin, duration: dur, ease: (q) => rotFn(tA + q * dur) - r0 }, tA);
  P.vanes.forEach((v, k) => {
    const xAt = (t) => { const ex = extFn(t); return ex * (VP.tip(P.alpha[k] + rotFn(t)) - VP.rr) - (1 - ex) * 4; };
    const x0 = xAt(tA);
    tl.fromTo(v, { x: x0 }, { x: x0 + 1, duration: dur, ease: (q) => xAt(tA + q * dur) - x0 }, tA);
  });
};

// Oil-flow dashes (and the arrowhead) in a port from time t for `dur` seconds.
H.vpFlow = (path, headEl, t, dur) => {
  tl.fromTo([path, headEl], { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
  tl.fromTo(path, { strokeDashoffset: 0 }, { strokeDashoffset: -30 * Math.round(dur * 2.5), duration: dur, ease: "none", immediateRender: false }, t);
};

// Smooth 0→1 step between t0 and t1 (for vane extension / angle schedules).
H.vpStep = (t, t0, t1) => (t <= t0 ? 0 : t >= t1 ? 1 : 0.5 - 0.5 * Math.cos((Math.PI * (t - t0)) / (t1 - t0)));
