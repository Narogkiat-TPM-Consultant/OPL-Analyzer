// Alert icon (dark scene): the filter still holds air pressure (gauge up, pressure arrows in the bowl);
// the bowl is loosened → it blows off with a burst (p.38 Maintenance 1: "the case might fly away").
{
  const ic = H.$("s4-v-icon"), lite = "#f5f1e8";
  // pipe stubs + head
  for (const x of [14, 226]) {
    H.el("rect", { x, y: 92, width: 60, height: 30, fill: AF.air, stroke: AF.pipeC, "stroke-width": 5 }, ic);
  }
  H.el("rect", { x: 146, y: 54, width: 8, height: 24, fill: AF.dark }, ic);
  H.el("rect", { x: 74, y: 76, width: 152, height: 62, rx: 8, fill: AF.metal, stroke: lite, "stroke-width": 3 }, ic);
  const G = H.gauge(ic, 150, 36, 30, { id: "s4-v-g", min: 0, max: 10, ticks: 5, minor: 0, labelEvery: 99, value: 7 });
  // bowl group (falls off)
  const bowl = H.el("g", { id: "s4-v-bowl" }, ic);
  H.el("path", { d: "M 92 138 V 250 Q 92 298 142 300 H 158 Q 208 298 208 250 V 138 Z", fill: AF.air, stroke: lite, "stroke-width": 4, "stroke-linejoin": "round" }, bowl);
  H.el("rect", { x: 84, y: 136, width: 132, height: 18, rx: 4, fill: AF.dark, stroke: lite, "stroke-width": 3 }, bowl);
  const arrows = H.el("g", {}, bowl);
  for (const [x1, y1, x2, y2] of [[150, 210, 110, 210], [150, 210, 190, 210], [150, 220, 150, 278], [150, 200, 120, 172], [150, 200, 180, 172]])
    H.el("path", { d: H.arrowD(x1, y1, x2, y2, 12), fill: "none", stroke: AF.water, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, arrows);
  // burst at the joint
  const burst = H.el("g", { opacity: 0 }, ic);
  for (const [x1, y1, x2, y2] of [[80, 150, 20, 140], [78, 162, 24, 186], [220, 150, 280, 140], [222, 162, 276, 186], [96, 170, 60, 220], [204, 170, 240, 220]])
    H.el("line", { x1, y1, x2, y2, stroke: AF.yellow, "stroke-width": 7, "stroke-linecap": "round" }, burst);

  tl.fromTo(G.needle, { rotation: G.rot(7), svgOrigin: G.origin }, { rotation: G.rot(7.4), svgOrigin: G.origin, duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut" }, b + 0.2);
  tl.fromTo(arrows, { scale: 0.85, svgOrigin: "150 215" }, { scale: 1.08, svgOrigin: "150 215", duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, b + 0.2);
  const tPop = b + 1.3;
  tl.fromTo(bowl, { y: 0, rotation: 0, svgOrigin: "150 220" }, { y: 30, rotation: 12, svgOrigin: "150 220", duration: 0.32, ease: "power3.out" }, tPop);
  tl.fromTo(burst, { opacity: 0, scale: 0.4, svgOrigin: "150 156" }, { opacity: 1, scale: 1, svgOrigin: "150 156", duration: 0.25, ease: "power2.out" }, tPop);
  tl.to(burst, { scale: 1.08, svgOrigin: "150 156", duration: 0.25, yoyo: true, repeat: 7, ease: "sine.inOut" }, tPop + 0.3);
}
