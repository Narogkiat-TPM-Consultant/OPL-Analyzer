// Safety (OPL 5'-A-4, p.38): a bowl opened while air pressure is still inside can blow off.
// Pressure arrows push on the bowl, it shakes, then drops away with an air burst at the joint.
{
  const g = H.el("g", { transform: "translate(0 -16)" }, "s4-v-icon");
  const LT = "#e8e2d4";
  // air line + head + guard ring
  H.el("path", { d: "M 0 70 L 300 70", fill: "none", stroke: FC.pipe, "stroke-width": 24 }, g);
  H.el("path", { d: "M 0 70 L 300 70", fill: "none", stroke: FC.air, "stroke-width": 13 }, g);
  const bowl = H.el("g", { id: "s4-v-bowl" }, g);
  const bd = "M 85 132 L 85 256 C 85 290 125 318 150 318 C 175 318 215 290 215 256 L 215 132 Z";
  H.el("path", { d: bd, fill: FC.bowl, stroke: LT, "stroke-width": 5 }, bowl);
  H.el("rect", { x: 130, y: 318, width: 40, height: 18, rx: 5, fill: FC.dark, stroke: LT, "stroke-width": 3 }, bowl);
  // pressure arrows inside the bowl
  const arr = H.el("g", { id: "s4-v-parr", opacity: 0 }, bowl);
  for (const [x1, y1, x2, y2] of [[150, 200, 150, 290], [140, 210, 98, 210], [160, 210, 202, 210], [140, 250, 104, 275], [160, 250, 196, 275]])
    H.el("path", { d: H.arrowD(x1, y1, x2, y2, 14), fill: "none", stroke: FC.pipe, "stroke-width": 6, "stroke-linecap": "round" }, arr);
  H.text(arr, 150, 176, "P", { size: 40, anchor: "middle", fill: FC.pipe });
  H.el("rect", { x: 52, y: 30, width: 196, height: 80, rx: 12, fill: FC.metal, stroke: LT, "stroke-width": 4 }, g);
  H.el("rect", { x: 70, y: 108, width: 160, height: 28, rx: 6, fill: FC.dark, stroke: LT, "stroke-width": 4 }, g);
  // burst lines at the joint
  const burst = H.el("g", { id: "s4-v-burst", opacity: 0 }, g);
  for (const [x1, y1, x2, y2] of [[70, 150, 22, 140], [66, 170, 18, 190], [230, 150, 278, 140], [234, 170, 282, 190], [100, 172, 74, 214], [200, 172, 226, 214]])
    H.el("path", { d: `M ${x1} ${y1} L ${x2} ${y2}`, fill: "none", stroke: FC.warn, "stroke-width": 7, "stroke-linecap": "round" }, burst);
  tl.fromTo(arr, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + 0.5);
  tl.fromTo(bowl, { x: -3 }, { x: 3, duration: 0.07, yoyo: true, repeat: 7, ease: "none" }, b + 0.9);
  tl.to(bowl, { x: 0, duration: 0.05 }, b + 1.46);
  tl.to(bowl, { y: 24, rotation: 12, svgOrigin: "150 225", duration: 0.35, ease: "power3.in" }, b + 1.5);
  tl.fromTo(burst, { opacity: 0, scale: 0.6, svgOrigin: "150 150" }, { opacity: 1, scale: 1, svgOrigin: "150 150", duration: 0.25, ease: "power2.out" }, b + 1.55);
  tl.to(burst, { opacity: 0.35, duration: 0.25, yoyo: true, repeat: 3 }, b + 1.85);
}
