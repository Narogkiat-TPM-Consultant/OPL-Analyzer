// Phenomenon (OPL 5-B-3, p.15): the three symptoms as seen on the pressure gauge.
// A: needle rises but stops short of the setting · B: needle swings · C: fine tremor + high-pitched "ปี๊~".
{
  const st = T.stamps; // card i lights up (stamp) when its narration segment starts
  const mk = (id, legend = true) => {
    const D = RV.dial(id, `${id}-d`, 230, 160, 132, { set: 6, value: 0 });
    if (legend) RV.setLegend(H.$(id), 6, 32, 22);
    return D;
  };

  // A — pressure does not rise to the setting
  const A = mk("s2-v-a");
  const gap = H.el("path", { id: "s2-v-agap", d: H.arcD(230, 160, 132 * 0.48, A.rot(3.7) + 4, A.rot(6) - 2), fill: "none", stroke: RV.muted, "stroke-width": 6, "stroke-dasharray": "8 8", opacity: 0 }, "s2-v-a");
  const tA = b + st[0];
  RV.needlePath(A, [[3.7, 1.1]], tA, 0, true, "power2.out");
  RV.needlePath(A, [[4.0, 0.35], [3.6, 0.45], [3.9, 0.35], [3.7, 0.45]], tA + 1.2, 3.7);
  tl.fromTo(gap, { opacity: 0 }, { opacity: 1, duration: 0.4 }, tA + 1.1);

  // B — pressure unstable: the needle swings
  const B = mk("s2-v-b");
  const tB = b + st[1];
  RV.needlePath(B, [[6, 0.5]], tB, 0, true, "power2.out");
  RV.swing(B, tB + 0.5, b + D, 6, 4.1, 7.6);

  // C — fine vibration with a high-pitched sound
  const C = mk("s2-v-c");
  const W = RV.waves("s2-v-c", "s2-v-cw", 380, 92, -20, { r0: 14, dr: 15, span: 34 });
  const pii = H.text("s2-v-c", 396, 40, "ปี๊~", { size: 30, id: "s2-v-pii" });
  pii.setAttribute("opacity", 0);
  const tC = b + st[2];
  RV.needlePath(C, [[6, 0.45]], tC, 0, true, "power2.out");
  RV.tremor(C, 6, 0.22, tC + 0.45, b + D, 0.06);
  RV.wavePulse(W, tC + 0.3, b + D, 0.5);
  tl.fromTo(pii, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tC + 0.3);
}
