// Safety icon: the rod strokes in and out; a hand reaching for it is crossed out (no hands in the stroke path).
{
  const g = H.$("s3-v-icon");
  const DK = "#121417", SK = "#f5f1e8";
  // cylinder end + rod (rod moves)
  const rod = H.el("g", { id: "s3-v-rod" }, g);
  H.el("rect", { x: 40, y: 198, width: 236, height: 30, fill: C20.steel, stroke: DK, "stroke-width": 4 }, rod);
  H.el("rect", { x: 42, y: 203, width: 232, height: 6, fill: "#ffffff", opacity: 0.6 }, rod);
  H.el("rect", { x: 14, y: 156, width: 66, height: 114, rx: 6, fill: C20.metal, stroke: DK, "stroke-width": 4 }, g);
  H.el("rect", { x: 78, y: 192, width: 9, height: 42, rx: 3, fill: C20.rubber, stroke: DK, "stroke-width": 2 }, g);
  // stroke path
  H.el("path", { d: H.dimD(100, 268, 278, 268, 16), fill: "none", stroke: C20.yellow, "stroke-width": 6 }, g);
  H.text(g, 189, 316, "ช่วงชัก", { size: 34, anchor: "middle", fill: C20.yellow });
  // hand reaching down to the rod
  const hand = H.el("g", { id: "s3-v-hand" }, g);
  H.el("rect", { x: 170, y: 42, width: 40, height: 30, rx: 6, fill: C20.blue, stroke: DK, "stroke-width": 3 }, hand);
  H.el("rect", { x: 160, y: 66, width: 60, height: 54, rx: 16, fill: SK, stroke: DK, "stroke-width": 3 }, hand);
  for (const x of [161, 175, 189, 203]) H.el("rect", { x, y: 104, width: 14, height: 46, rx: 7, fill: SK, stroke: DK, "stroke-width": 3 }, hand);
  H.el("rect", { x: 140, y: 82, width: 14, height: 40, rx: 7, fill: SK, stroke: DK, "stroke-width": 3, transform: "rotate(-28 147 102)" }, hand);
  const no = H.noSign(g, 186, 100, 74, "s3-v-no");

  tl.fromTo(rod, { x: 0 }, { x: -46, duration: 0.45, ease: "power1.inOut", yoyo: true, repeat: 7 }, b + 0.3);
  tl.fromTo(hand, { y: -18 }, { y: 0, duration: 0.4, ease: "power2.out" }, b + 0.2);
  tl.fromTo(no, { scale: 1.6, opacity: 0, svgOrigin: "186 100" }, { scale: 1, opacity: 1, svgOrigin: "186 100", duration: 0.35, ease: "back.out(2)" }, b + 0.6);
}
