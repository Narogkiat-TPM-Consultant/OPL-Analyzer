// Safety icon: air is released (puffs), the gauge needle falls to 0, then the "0" is ringed green.
// Below the gauge: a filter bowl — the part that can blow off if opened with residual pressure (OPL 5'-A-4).
{
  const g = H.$("s3-v-icon"), f = H.f;
  const G = H.gauge(g, 150, 112, 92, { id: "s3-v-g", min: 0, max: 10, value: 6, ticks: 5, minor: 1, labels: false });
  const a0 = (104 * Math.PI) / 180;   // just clockwise of the 0 mark, clear of the needle
  const zx = 150 + Math.cos(a0) * 92 * 0.6, zy = 112 + Math.sin(a0) * 92 * 0.6;
  H.text(g, zx, zy + 11, "0", { size: 32, anchor: "middle" });
  // stem + bowl (head piece, transparent bowl with a little water, drain at the bottom)
  H.el("rect", { x: 141, y: 203, width: 18, height: 26, fill: P28.metal, stroke: "#121417", "stroke-width": 4 }, g);
  H.el("rect", { x: 92, y: 228, width: 116, height: 30, rx: 6, fill: P28.metal, stroke: "#121417", "stroke-width": 4 }, g);
  H.el("path", { d: "M 108 258 L 108 312 Q 108 344 150 344 Q 192 344 192 312 L 192 258 Z", fill: P28.bowl, stroke: P28.yellow, "stroke-width": 6, "stroke-linejoin": "round" }, g);
  H.el("path", { d: "M 112 318 Q 150 326 188 318 L 188 320 Q 186 340 150 340 Q 114 340 112 320 Z", fill: P28.water, opacity: 0.85 }, g);
  // release valve on the head: puffs of air
  H.el("rect", { x: 208, y: 236, width: 18, height: 14, rx: 3, fill: P28.dark, stroke: "#121417", "stroke-width": 3 }, g);
  const puffs = [0, 1, 2].map(() => H.el("circle", { cx: 236, cy: 242, r: 9, fill: "#ffffff", opacity: 0 }, g));
  puffs.forEach((p, k) => tl.fromTo(p, { x: 0, y: 0, opacity: 0.9, scale: 0.6, svgOrigin: "236 242" }, { x: 44, y: -26, opacity: 0, scale: 1.6, svgOrigin: "236 242", duration: 0.7, ease: "power1.out", repeat: 1, repeatDelay: 0.25 }, b + 0.45 + k * 0.3));
  tl.fromTo(G.needle, { rotation: G.rot(6), svgOrigin: G.origin }, { rotation: G.rot(0), svgOrigin: G.origin, duration: 1.3, ease: "power2.inOut" }, b + 0.6);
  const ring = H.el("circle", { cx: f(zx), cy: f(zy), r: 24, fill: "none", stroke: "#3ccf7e", "stroke-width": 6, opacity: 0 }, g);
  H.p28Pop(ring, b + 2.0, zx, zy, 1.8, 0.3);
}
