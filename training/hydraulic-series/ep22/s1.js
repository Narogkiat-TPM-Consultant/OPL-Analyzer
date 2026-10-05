// Title: the example circuit runs — compressor turns, air flows through the FRL, the valve switches, the cylinder extends.
{
  const K = H.pnCircuit("s1-v-art", "s1-v-c", { labels: false });
  H.pnSpin(K.Cm.fw, K.Cm.fwO, b, D, 1.5);
  H.pnSpin(K.Cm.mp, K.Cm.mpO, b, D, 4);
  H.pnFlow(K.dash.S, b + 0.4, D - 0.4);
  H.pnFlow([K.dash.FR, K.dash.RL, K.dash.LV], b + 0.8, D - 0.8);
  tl.fromTo(K.L.drop, { opacity: 1, y: 0 }, { opacity: 0, y: 16, duration: 0.6, ease: "power1.in", repeat: 4, repeatDelay: 0.3, immediateRender: false }, b + 1.0);
  H.pnValveOn(K.V, b + 1.6);
  H.pnFlow(K.dash.A, b + 1.8, D - 1.8);
  H.pnFlow(K.dash.B, b + 1.9, 1.6, { off: b + 3.6 });
  H.pnCylMove(K.C, 0, 1, b + 1.9, 1.5);
  H.pnPuff(K.V.puffs, b + 2.0, 1.6);
}
