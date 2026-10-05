// Safety icon: pressure gauge needle falls to 0 (residual air released), then the padlock shackle snaps shut (LOTO).
{
  const g = H.$("s5-v-icon");
  const G = H.pnDial(g, 150, 122, 98, { id: "s5-v-g", zero: true, unit: true, ticks: 10, sw: 5 });
  tl.fromTo(G.needle, { rotation: G.rot(0.62), svgOrigin: G.origin }, { rotation: G.rot(0), svgOrigin: G.origin, duration: 1.2, ease: "power2.in" }, b + 0.45);
  const [zx, zy] = G.zeroAt;
  const ok = H.el("circle", { id: "s5-v-ok", cx: H.f(zx), cy: H.f(zy), r: 20, fill: "none", stroke: "#3ccf7e", "stroke-width": 6, opacity: 0 }, g);
  tl.fromTo(ok, { opacity: 0, scale: 1.6, svgOrigin: `${zx} ${zy}` }, { opacity: 1, scale: 1, svgOrigin: `${zx} ${zy}`, duration: 0.3, ease: "back.out(2)" }, b + 1.7);
  const lk = H.el("g", { id: "s5-v-lock" }, g);
  const sh = H.el("path", { id: "s5-v-sh", d: "M 126 292 L 126 268 A 24 24 0 0 1 174 268 L 174 292", fill: "none", stroke: "#d8d2c4", "stroke-width": 11 }, lk);
  H.el("rect", { x: 104, y: 284, width: 92, height: 68, rx: 10, fill: PN.warn, stroke: "#121417", "stroke-width": 4 }, lk);
  H.el("circle", { cx: 150, cy: 312, r: 8, fill: "#121417" }, lk);
  H.el("rect", { x: 146, y: 314, width: 8, height: 20, rx: 3, fill: "#121417" }, lk);
  tl.fromTo(sh, { y: -16 }, { y: 0, duration: 0.18, ease: "power4.in" }, b + 2.2);
}
