// Check 1 — pressure gauge at work end: the unit runs, the machine is stopped ("หยุดเครื่อง" chip), the flow
// stops and the needle falls to 0, magnified in an inset. Cue 1: green "no residual pressure"; cue 2: the 0 mark
// (criterion) pulses.
{
  const S = H.k16Unit("s3-v-unit", "s3-v-u", { value: 6, labels: ["gauge", "pump", "motor", "tank", "cyl"] });
  const fx = H.$("s3-v-fx");
  const c = T.cues;
  const tStop = b + c[0] + Math.min(1.7, Math.max(1.0, (c[1] - c[0]) * 0.4));
  H.k16Flow(S, b + 0.2, tStop);
  H.k16Run(S, b + 0.2, tStop);
  const stop = H.k16Chip(fx, "s3-v-stop", 332, 262, "หยุดเครื่อง", { anchor: "middle", size: 24, fill: K6.ink, stroke: K6.ink, color: "#ffffff" });
  tl.fromTo(stop, { opacity: 0, scale: 1.3, svgOrigin: "332 262" }, { opacity: 1, scale: 1, svgOrigin: "332 262", duration: 0.3, ease: "back.out(2)" }, tStop - 0.1);

  // magnified gauge (inset), linked to the gauge on the P line
  const inset = H.el("g", { id: "s3-v-inset", opacity: 0 }, fx);
  H.el("circle", { cx: 300, cy: 104, r: 54, fill: "none", stroke: K6.blue, "stroke-width": 4 }, inset);
  H.el("path", { d: "M 354 110 L 860 150", fill: "none", stroke: K6.blue, "stroke-width": 3, "stroke-dasharray": "9 7" }, inset);
  H.el("circle", { cx: 960, cy: 150, r: 104, fill: K6.paper, stroke: K6.blue, "stroke-width": 5 }, inset);
  const GI = H.gauge(inset, 960, 150, 94, { id: "s3-v-gi", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, labelSize: 30, value: 6, unit: "kgf/cm²" });
  const zero = H.el("path", { d: H.arcD(960, 150, 94 * 0.8, GI.rot(0) - 7, GI.rot(0) + 7), fill: "none", stroke: K6.green, "stroke-width": 14, opacity: 0 }, inset);
  tl.fromTo(inset, { opacity: 0 }, { opacity: 1, duration: 0.35 }, tStop - 0.2);
  const fall = { duration: 1.2, ease: "power2.inOut" };
  tl.fromTo(S.gauge.needle, { rotation: S.gauge.rot(6), svgOrigin: S.gauge.origin }, { rotation: S.gauge.rot(0), svgOrigin: S.gauge.origin, ...fall }, tStop + 0.3);
  tl.fromTo(GI.needle, { rotation: GI.rot(6), svgOrigin: GI.origin }, { rotation: GI.rot(0), svgOrigin: GI.origin, ...fall }, tStop + 0.3);

  // cue 1: no residual pressure (green)
  const t1 = b + c[1];
  const okc = H.k16Chip(fx, "s3-v-ok", 725, 58, "0 = ไม่มีแรงดันค้าง", { anchor: "middle", size: 24, stroke: K6.green, color: K6.green });
  tl.fromTo(okc, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, t1 + 0.2);
  tl.fromTo(zero, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 0.2);
  // cue 2: the criterion — the 0 mark pulses
  tl.fromTo(zero, { scale: 1, svgOrigin: "960 150" }, { scale: 1.08, svgOrigin: "960 150", duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, b + c[2] + 0.2);
}
