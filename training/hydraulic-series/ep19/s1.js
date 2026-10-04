// Title: the two valves this OPL checks. Relief valve pilot head (EP05 drawing) with the circuit-pressure gauge on its
// line; solenoid valve (EP06 drawing) on its subplate with connectors. The handle is turned in → the gauge rises,
// then back to the setting; solenoid a switches on and the spool shifts.
{
  const art = H.$("s1-v-art");
  // main line from the pump, the relief valve branch and the gauge stem
  E19.pipe(art, "M 30 228 H 780", 12);
  E19.pipe(art, "M 65 176 V 228", 10);
  E19.pipe(art, "M 712 194 V 228", 10);
  const flow = RV.dash(art, "s1-v-flow", "M 34 228 H 776", 4);

  const Z = H.el("g", { transform: "translate(-214 -4) scale(0.9)" }, art);
  const P = RV.pilot(Z, "s1-v-rv", { standalone: true });
  const G = H.gauge(art, 712, 116, 76, { id: "s1-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, marks: [{ v: 6, color: RV.blue }], value: 6 });
  H.text(art, 20, 32, "Relief valve", { size: 28 });
  H.text(art, 82, 214, "จากปั๊ม →", { size: 24, fill: RV.muted });

  const S = H.el("g", { transform: "translate(90 290) scale(0.6)" }, art);
  const SV = H.e19Sol(S, "s1-v-sol", { boxLabel: "ตู้ควบคุม" });
  H.text(art, 357, 530, "Solenoid valve", { size: 28, anchor: "middle" });

  // rotation mark beside the handle
  const aIn = H.el("path", { d: "M 596 60 A 26 50 0 0 1 596 164 M 610 154 L 596 164 L 597 147", fill: "none", stroke: RV.blue, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, art);

  RV.flow("s1-v-flow", b + 0.3, b + D, false);
  // handle in → circuit pressure up; back to the setting
  const t1 = 1.0, t2 = Math.max(2.8, D - 2.2);
  E19.op(aIn, 0, 1, b + t1 - 0.2);
  tl.fromTo(P.adj, { x: 0 }, { x: -20, duration: 0.9, ease: "power2.inOut" }, b + t1);
  tl.fromTo(P.psp, { attr: { d: P.pspD(0, 0) } }, { attr: { d: P.pspD(0, -20) }, duration: 0.9, ease: "power2.inOut" }, b + t1);
  tl.fromTo(G.needle, { rotation: G.rot(6), svgOrigin: G.origin }, { rotation: G.rot(7.8), svgOrigin: G.origin, duration: 0.9, ease: "power2.inOut" }, b + t1);
  E19.op(aIn, 1, 0, b + t2 - 0.3);
  tl.fromTo(P.adj, { x: -20 }, { x: 0, duration: 0.9, ease: "power2.inOut", immediateRender: false }, b + t2);
  tl.fromTo(P.psp, { attr: { d: P.pspD(0, -20) } }, { attr: { d: P.pspD(0, 0) }, duration: 0.9, ease: "power2.inOut", immediateRender: false }, b + t2);
  tl.fromTo(G.needle, { rotation: G.rot(7.8), svgOrigin: G.origin }, { rotation: G.rot(6), svgOrigin: G.origin, duration: 0.9, ease: "power2.inOut", immediateRender: false }, b + t2);

  // solenoid a on → spool to the right (P→B, A→T)
  const V = SV.V, ts = 1.8;
  V.mid.setAttribute("fill", V6.pr);
  V.ports.P.setAttribute("fill", V6.pr);
  V.coil("a", true, b + ts);
  V.shift(0, 1, b + ts + 0.25, 0.6);
  H.v6Paint(V, 0, 1, b + ts + 0.7);
}
