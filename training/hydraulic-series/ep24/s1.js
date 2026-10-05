// Title: regulator with its gauge on the front. Factory air comes in, the handle is turned,
// air goes out and the needle settles on the green set-pressure marking.
{
  const g = H.$("s1-v-reg");
  AR.pipe(g, "M 18 418 H 260", 56, AR.airHi);
  const pout = AR.pipe(g, "M 540 418 H 782", 56, AR.airLo);
  AR.dash(g, "s1-v-fi", "M 22 418 H 250");
  AR.dash(g, "s1-v-fo", "M 550 418 H 778");
  const R = AR.regExt(g, 400, 30, 1.55, "s1-v-r", { gr: 46 });
  H.text(g, 24, 378, "IN", { size: 34, fill: AR.blue });
  H.text(g, 776, 378, "OUT", { size: 34, anchor: "end", fill: AR.blue });
  const turn = H.el("path", { id: "s1-v-turn", d: "M 270 70 A 130 22 0 0 0 530 70 M 520 85 L 530 70 L 540 85", fill: "none", stroke: AR.blue, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
  // ring on the green marking (gauge centre in page units: 400, 30 + 252 × 1.55)
  AR.ring(g, "s1-v-rg", 400, 420.6, 92, AR.green);

  AR.flow("s1-v-fi", b + 0.3, b + D, false);
  AR.op(turn, 0, 1, b + 0.5);
  tl.fromTo(R.handle, { scaleX: 1, svgOrigin: "0 11" }, { scaleX: 0.3, svgOrigin: "0 11", duration: 0.2, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }, b + 0.6);
  AR.op(turn, 1, 0, b + 1.5);
  AR.flow("s1-v-fo", b + 1.3, b + D, false);
  AR.ft(pout, { stroke: AR.airLo }, { stroke: AR.air }, b + 1.3, 1.2);
  R.G.ndl(0, 5.5, b + 1.3, 1.4, "power1.out");
  R.G.ndl(5.5, 5, b + 2.7, 0.7, "power2.inOut");
  AR.pulse("s1-v-rg", b + 3.3, 2);
}
