// Title: the unit runs (oil flows, rod strokes, needle on the gauge), then the machine stops at work end:
// the flow stops and the needle falls to 0 (green ring). With "หารอยรั่ว" an oil streak on the tank and a spot
// on the floor show up, ringed red.
{
  const S = H.k16Unit("s1-v-unit", "s1-v-u", { value: 6 });
  const fx = H.$("s1-v-fx");
  const c = T.cues;
  const tStop = b + 1.7;
  H.k16Flow(S, b + 0.15, tStop);
  H.k16Run(S, b + 0.15, tStop);
  // needle falls to 0 after the stop
  tl.fromTo(S.gauge.needle, { rotation: S.gauge.rot(6), svgOrigin: S.gauge.origin }, { rotation: S.gauge.rot(0), svgOrigin: S.gauge.origin, duration: 1.1, ease: "power2.inOut" }, tStop + 0.2);
  const ok = H.el("circle", { cx: 300, cy: 104, r: 58, fill: "none", stroke: K6.green, "stroke-width": 7, opacity: 0 }, fx);
  tl.fromTo(ok, { opacity: 0, scale: 1.3, svgOrigin: "300 104" }, { opacity: 1, scale: 1, svgOrigin: "300 104", duration: 0.35, ease: "back.out(2)" }, tStop + 1.35);
  // "… และหารอยรั่ว": the leak marks appear late in the narration
  const tLeak = b + c[0] + Math.max(2.6, (D - c[0] - 0.8) * 0.72);
  tl.fromTo([S.streak, S.puddle], { opacity: 0 }, { opacity: 1, duration: 0.4 }, tLeak);
  H.k16Ring(fx, "s1-v-r1", 340, 452, 38, 70, tLeak + 0.3, { n: 2 });
  H.k16Ring(fx, "s1-v-r2", 598, 590, 86, 24, tLeak + 0.5, { n: 2 });
}
