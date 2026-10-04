// Early sign for the operator (wording = proposal): OK = needle steady at the setting, no squeal;
// NG = below the setting / swinging / squeal → report to maintenance.
{
  const st = T.stamps;
  const ok = RV.dial("s6-v-ok", "s6-v-okd", 400, 172, 150, { set: 6, value: 0 });
  RV.setLegend(H.$("s6-v-ok"), 40, 40, 24);
  const ng = RV.dial("s6-v-ng", "s6-v-ngd", 400, 172, 150, { set: 6, value: 0 });
  RV.setLegend(H.$("s6-v-ng"), 40, 40, 24);
  const W = RV.waves("s6-v-ng", "s6-v-wv", 572, 92, -20, { r0: 16, dr: 17, span: 34 });
  const pii = H.text("s6-v-ng", 640, 50, "ปี๊~", { size: 34, id: "s6-v-pii" });
  pii.setAttribute("opacity", 0);

  // OK: the needle comes up to the setting and stays there
  RV.needlePath(ok, [[6, 0.9]], b + 0.3, 0, true, "power2.out");
  // NG: below the setting, swinging, with the squeal
  RV.needlePath(ng, [[4.2, 0.9]], b + 0.3, 0, true, "power2.out");
  const tN = b + st[1];
  RV.swing(ng, tN, b + D, 4.2, 3.2, 5.3);
  tl.fromTo(pii, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tN + 0.2);
  RV.wavePulse(W, tN + 0.2, b + D, 0.5);
}
