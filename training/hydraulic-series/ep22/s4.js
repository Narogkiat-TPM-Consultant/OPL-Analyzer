// The example circuit of OPL 5'-A-2: the four groups light up with their numbered points and each does its job.
{
  const c = T.cues, G = [0, ...T.points.map((t) => b + t)];          // G[k] = when group k is named
  const segEnd = (k) => (k < c.length ? b + c[k] - 0.3 : b + D - 0.8); // end of narration segment k (1-based)
  const K = H.pnCircuit("s4-v-art", "s4-v-c", { labels: true });
  const all = [1, 2, 3, 4].flatMap((k) => K.groups[k]);
  // group 1: everything but the air source dims; each later group comes back to full strength when named
  tl.fromTo(all.filter((el) => !K.groups[1].includes(el)), { opacity: 1 }, { opacity: 0.25, duration: 0.4 }, G[1]);
  [2, 3, 4].forEach((k) => tl.fromTo(K.groups[k], { opacity: 0.25 }, { opacity: 1, duration: 0.4, immediateRender: false }, G[k]));
  [1, 2, 3, 4].forEach((k) => K.badges[k].forEach((bd, i) =>
    tl.fromTo(bd, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)" }, G[k] + 0.1 + i * 0.12)));

  // ① air source: the compressor runs, air goes into the line
  const a1 = G[1];
  H.pnSpin(K.Cm.fw, K.Cm.fwO, a1, b + D - a1, 1.5);
  H.pnSpin(K.Cm.mp, K.Cm.mpO, a1, b + D - a1, 4);
  H.pnFlow(K.dash.S, a1 + 0.5, b + D - a1 - 0.5);
  // ② accessories: air passes the FRL — the filter drains water, the lubricator drips oil, the gauge shows pressure
  const a2 = G[2], L2 = segEnd(2) - a2;
  H.pnFlow([K.dash.FR, K.dash.RL, K.dash.LV], a2 + 0.3, b + D - a2 - 0.3);
  tl.fromTo(K.F.drop, { opacity: 1, y: 0 }, { opacity: 0, y: 30, duration: 0.6, ease: "power1.in", repeat: 2, repeatDelay: 0.3, immediateRender: false }, a2 + 0.25 * L2);
  tl.fromTo(K.L.drop, { opacity: 1, y: 0 }, { opacity: 0, y: 16, duration: 0.55, ease: "power1.in", repeat: 7, repeatDelay: 0.35, immediateRender: false }, a2 + 0.55 * L2);
  tl.fromTo(K.Rg.needle, { rotation: 0, svgOrigin: K.Rg.nO }, { rotation: 110, svgOrigin: K.Rg.nO, duration: 0.9, ease: "power2.out" }, a2 + 0.8 * L2);
  // ③ controllers: regulator knob is turned (pressure set), speed controllers set, then the solenoid valve switches
  const a3 = G[3], L3 = segEnd(3) - a3;
  K.Rg.grips.forEach((gl) => tl.fromTo(gl, { x: 0 }, { x: 5, duration: 0.18, yoyo: true, repeat: 5, ease: "sine.inOut" }, a3 + 0.22 * L3));
  tl.to(K.Rg.needle, { rotation: 150, svgOrigin: K.Rg.nO, duration: 0.9, ease: "power2.inOut" }, a3 + 0.22 * L3 + 0.2);
  [K.SA.knob, K.SB.knob].forEach((kn, i) => tl.fromTo(kn, { opacity: 1 }, { opacity: 0.35, duration: 0.2, yoyo: true, repeat: 3 }, a3 + 0.5 * L3 + i * 0.15));
  H.pnValveOn(K.V, a3 + 0.8 * L3);
  // ④ actuator: air into the cap side, the cylinder extends; rod-side air exhausts through the silencer
  const a4 = G[4];
  H.pnFlow(K.dash.A, a4 + 0.1, b + D - a4 - 0.1);
  H.pnFlow(K.dash.B, a4 + 0.3, 1.8, { off: a4 + 2.1 });
  H.pnCylMove(K.C, 0, 1, a4 + 0.3, 1.8);
  H.pnPuff(K.V.puffs, a4 + 0.4, 1.8);
}
