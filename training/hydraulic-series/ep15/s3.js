// Method (OPL 5-C-3, p.19): the four checks while the unit runs, each shown as it is spoken.
// cue 0 why (unit running) · 1 sound: ear + sound arcs at the pump · 2 gauge: magnified, the needle swings a little
// inside the green band · 3 vibration / heat: a hand visits pump → motor → tube → valve · 4 movement: a stopwatch
// times each cylinder cycle; equal bars = smooth (the comparison of cycle times is a proposal, see caption).
{
  const c = T.cues;
  const S = H.runUnit("s3-v-unit", "s3-v-u");
  const fx = H.$("s3-v-fx");

  // the unit runs for the whole scene: oil flows, coupling turns, gauge needle swings slightly
  H.hydFlow(S.flows, b + 0.3, D - 0.3);
  H.spin15(S, b, b + D);
  const val = (t) => G15.N + 1.2 * H.wob(t * 0.3, 0.2);
  H.needle15(S.gauge, val, b, b + D, true);

  // cylinder cycles with period P; one cycle starts exactly when the stopwatch starts (tc)
  const tc = b + c[4] + 0.35;
  const P = Math.max(1.3, Math.min(1.8, (b + D - tc - 1.3) / 2));
  H.fnTo(S.rod, "x", (t) => 50 * H.cyc15((t - tc) / P), b, b + D, { ir: true });

  // ① sound: ear + sound arcs from the pump
  const ear = H.ear15(fx, "s3-v-ear", 86, 214, 0.85, { hidden: true });
  tl.fromTo(ear, { opacity: 0, scale: 0.6, svgOrigin: "86 214" }, { opacity: 1, scale: 1, svgOrigin: "86 214", duration: 0.35, ease: "back.out(2)" }, b + c[1] + 0.1);
  H.noise15(S.noise, b + c[1] + 0.2, c[2] - c[1] - 0.2);

  // ② gauge: highlight + magnified inset (green band = normal ±3)
  const inset = H.el("g", { id: "s3-v-inset", opacity: 0 }, fx);
  H.el("path", { d: "M 420 66 L 615 16 M 420 190 L 615 184", fill: "none", stroke: C15.blue, "stroke-width": 3, "stroke-dasharray": "9 7" }, inset);
  H.el("circle", { cx: 420, cy: 128, r: 60, fill: "none", stroke: C15.blue, "stroke-width": 4 }, inset);
  H.el("circle", { cx: 615, cy: 100, r: 84, fill: C15.paper }, inset);
  const GI = H.gauge15(inset, 615, 100, 74, { id: "s3-v-gi", minor: 1, value: G15.N, marks: [{ v: G15.N, color: C15.blue, id: "s3-v-gin" }] });
  H.el("circle", { cx: 615, cy: 100, r: 84, fill: "none", stroke: C15.blue, "stroke-width": 5 }, inset);
  H.needle15(GI, val, b, b + D, true);
  tl.fromTo(inset, { opacity: 0 }, { opacity: 1, duration: 0.35 }, b + c[2] + 0.1);

  // ③ vibration / heat, in the spoken order: a hand visits pump → motor → valve from above, then touches the tube
  //    from below; short heat lines at each spot
  const sp = [S.spot.pump, S.spot.motor, S.spot.valve, S.spot.tube];
  const handT = H.hand15(fx, "s3-v-hand", sp[0][0], sp[0][1], 0.6);
  const handB = H.hand15(fx, "s3-v-hand2", sp[3][0], sp[3][1], 0.6, 180);
  handT.setAttribute("opacity", 0);
  handB.setAttribute("opacity", 0);
  const t3 = b + c[3] + 0.1, step = Math.max(0.6, (c[4] - c[3] - 0.3) / 4);
  tl.fromTo(handT, { opacity: 0, x: 0, y: -40 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power2.out" }, t3);
  sp.forEach(([x, y], k) => {
    const hg = H.el("g", { id: `s3-v-heat${k}`, opacity: 0 }, fx);
    const yb = k === 3 ? y - 10 : y - 4;
    for (const dx of [-38, 38]) H.el("path", { d: H.heatD(x + dx, yb, 34), fill: "none", stroke: C15.heat, "stroke-width": 5, "stroke-linecap": "round" }, hg);
    const ta = t3 + k * step;
    if (k === 1 || k === 2) {
      const [px, py] = sp[k - 1];
      tl.fromTo(handT, { x: px - sp[0][0], y: py - sp[0][1] }, { x: x - sp[0][0], y: y - sp[0][1], duration: 0.32, ease: "power2.inOut", immediateRender: false }, ta - 0.32);
    }
    if (k === 3) {
      tl.fromTo(handT, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, ta - 0.3);
      tl.fromTo(handB, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, ta - 0.1);
    }
    tl.fromTo(hg, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25 }, ta);
    tl.fromTo(hg, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, ta + step - 0.35);
  });
  tl.fromTo(handB, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, b + c[4] - 0.05);

  // ④ movement: stopwatch times two cylinder cycles; equal bars = same cycle time = smooth
  const wg = H.el("g", { id: "s3-v-wg", opacity: 0 }, fx);
  const W = H.stopwatch(wg, 1000, 300, 46, { id: "s3-v-w", color: C15.blue });
  tl.fromTo(wg, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[4] + 0.05);
  for (let k = 0; k < 2; k++) {
    const t = tc + k * P, y = 380 + k * 42;
    tl.fromTo(W.ring, { strokeDashoffset: W.offset(0) }, { strokeDashoffset: W.offset(1), duration: P, ease: "none", immediateRender: false }, t);
    tl.fromTo(W.hand, { rotation: 0, svgOrigin: W.origin }, { rotation: 360, svgOrigin: W.origin, duration: P, ease: "none", immediateRender: false }, t);
    const bar = H.el("rect", { id: `s3-v-bar${k}`, x: 952, y, width: 0, height: 22, rx: 4, fill: C15.blue }, fx);
    const lab = H.text(fx, 942, y + 20, `รอบ ${k + 1}`, { size: 22, anchor: "end", id: `s3-v-barl${k}` });
    lab.setAttribute("opacity", 0);
    tl.fromTo(bar, { attr: { width: 0 } }, { attr: { width: 120 }, duration: 0.3, ease: "power2.out" }, t + P - 0.05);
    tl.fromTo(lab, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t + P - 0.05);
  }
  const eq = H.text(fx, 1084, 490, "เวลาเท่ากัน = ราบรื่น", { size: 22, anchor: "end", fill: C15.green, id: "s3-v-eq" });
  eq.setAttribute("opacity", 0);
  tl.fromTo(eq, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, tc + 2 * P + 0.1);
}
