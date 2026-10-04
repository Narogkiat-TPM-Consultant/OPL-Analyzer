// Operation (p.27 steps 1–4 / p.8): closed → poppet opens → piston lifts, oil to tank → reseats, pressure constant.
{
  const V = RV.section("s3-v-rv", "s3-v-x");
  const O = H.$("s3-v-ov"), c = T.cues;
  // chamber letters and ports
  RV.mark(O, "s3-v-mA", 532, 404, "A");
  RV.mark(O, "s3-v-mB", 532, 222, "B", 490, 222);
  H.text(O, 22, 492, "จากปั๊ม", { size: 26 });
  H.text(O, 478, 612, "ไปถัง", { size: 26 });
  // pressure in A and B (bars)
  H.text(O, 998, 296, "แรงดันในห้อง", { size: 24, anchor: "middle" });
  const bar = (k, x) => {
    H.el("rect", { x, y: 318, width: 52, height: 232, rx: 4, fill: RV.paper, stroke: RV.ink, "stroke-width": 3 }, O);
    const r = H.el("rect", { id: `s3-v-bar${k}`, x: x + 3, y: 547, width: 46, height: 0, fill: RV.pHi }, O);
    H.text(O, x + 26, 590, k, { size: 30, anchor: "middle" });
    return r;
  };
  const bA = bar("A", 938), bB = bar("B", 1016);
  const lv = (v) => ({ y: H.f(547 - 226 * v), height: H.f(226 * v) });
  let seen = new Set();
  const barTo = (r, v0, v1, t, d = 0.6) => {
    tl.fromTo(r, { attr: lv(v0) }, { attr: lv(v1), duration: d, ease: "power2.inOut", immediateRender: !seen.has(r) }, t);
    seen.add(r);
  };
  // piston-lift arrow and poppet ring
  const up = H.el("path", { id: "s3-v-up", d: H.arrowD(560, 345, 560, 262, 24), fill: "none", stroke: RV.blue, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, O);
  RV.ring(O, "s3-v-rp", 362, 130, 40);
  RV.ring(O, "s3-v-rs", 133, 200, 26, RV.blue);

  const G = V.G, n = (v) => G.rot(v);
  const needle = (v0, v1, t, d, ease = "power2.inOut", first = false) =>
    tl.fromTo(G.needle, { rotation: n(v0), svgOrigin: G.origin }, { rotation: n(v1), svgOrigin: G.origin, duration: d, ease, immediateRender: first }, t);

  // ① pump delivers: pressure builds in A and B together; poppet and piston stay closed
  RV.flow(V.f.inlet, b + 0.3, b + D - 0.1, false);
  RV.flow(V.f.choke, b + c[0] + 0.3, b + c[3] + 0.5);
  tl.fromTo([V.z.A, V.z.B], { fill: RV.pLo }, { fill: RV.pHi, duration: 2.2 }, b + c[0] + 0.2);
  tl.fromTo(V.choke, { stroke: RV.pLo }, { stroke: RV.pHi, duration: 2.2 }, b + c[0] + 0.2);
  needle(0, 4.8, b + c[0] + 0.2, 3.0, "power1.out", true);
  barTo(bA, 0.08, 0.6, b + c[0] + 0.2, 3.0); barTo(bB, 0.08, 0.6, b + c[0] + 0.2, 3.0);

  // ② pressure exceeds the pilot spring → poppet opens, oil of B runs through the piston centre to tank
  needle(4.8, 6.4, b + c[1] + 0.1, 1.0, "power1.in");
  barTo(bA, 0.6, 0.78, b + c[1] + 0.1, 1.0); barTo(bB, 0.6, 0.78, b + c[1] + 0.1, 1.0);
  const tp = b + c[1] + 1.1;
  tl.fromTo(V.pop, { x: 0 }, { x: 16, duration: 0.35, ease: "power2.out" }, tp);
  tl.fromTo(V.psp, { attr: { d: V.pspD(0) } }, { attr: { d: V.pspD(16) }, duration: 0.35, ease: "power2.out" }, tp);
  RV.pulse("s3-v-rp", tp, 2);
  RV.flow(V.f.pilot, tp + 0.2, b + c[3] + 0.5);
  tl.fromTo(V.z.B, { fill: RV.pHi }, { fill: RV.pMid, duration: 0.8, immediateRender: false }, tp + 0.3);
  barTo(bB, 0.78, 0.45, tp + 0.3, 0.8);

  // ③ B lower than A → the difference lifts the piston; circuit oil goes straight to tank; pressure falls to the setting
  const tl3 = b + c[2] + 0.3;
  tl.fromTo(up, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, tl3);
  tl.fromTo(V.pis, { y: 0 }, { y: -45, duration: 0.6, ease: "power2.out" }, tl3 + 0.2);
  tl.fromTo(V.usp, { attr: { d: V.uspD(0) } }, { attr: { d: V.uspD(45) }, duration: 0.6, ease: "power2.out" }, tl3 + 0.2);
  RV.flow(V.f.main, tl3 + 0.6, b + c[3] + 0.4);
  needle(6.4, 6.0, tl3 + 0.7, 0.8);
  barTo(bA, 0.78, 0.72, tl3 + 0.7, 0.8);

  // ④ at the setting the piston reseats, poppet closes; circuit pressure stays at the setting
  const t4 = b + c[3] + 0.3;
  tl.fromTo(up, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t4);
  tl.fromTo(V.pis, { y: -45 }, { y: 0, duration: 0.6, ease: "power2.in", immediateRender: false }, t4);
  tl.fromTo(V.usp, { attr: { d: V.uspD(45) } }, { attr: { d: V.uspD(0) }, duration: 0.6, ease: "power2.in", immediateRender: false }, t4);
  tl.fromTo(V.pop, { x: 16 }, { x: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, t4 + 0.2);
  tl.fromTo(V.psp, { attr: { d: V.pspD(16) } }, { attr: { d: V.pspD(0) }, duration: 0.3, ease: "power2.in", immediateRender: false }, t4 + 0.2);
  tl.fromTo(V.z.B, { fill: RV.pMid }, { fill: RV.pHi, duration: 0.8, immediateRender: false }, t4 + 0.4);
  barTo(bB, 0.45, 0.72, t4 + 0.4, 0.8);
  RV.pulse("s3-v-rs", t4 + 0.9, 2);
}
