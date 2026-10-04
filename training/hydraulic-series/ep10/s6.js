// Checklist icons (viewBox 150 × 104): ① noisy pump / shaking gauge ② oil-level glass low + clogged breather
// ③ hot pump with front/back cover bolts.
{
  // ① gauge with the needle below the green band + noise arcs
  const g = H.$("s6-v-i1");
  const G = H.gauge(g, 52, 54, 42, { id: "s6-v-g1", min: 0, max: 10, ok: [5, 7.5], ticks: 5, labelEvery: 99, value: 3.2 });
  const arcs = [24, 38].map((r, i) => {
    const a = H.el("g", { id: `s6-v-n${i}`, opacity: 0.35 }, g);
    H.el("path", { d: H.arcD(108, 54, r, -50, 50), fill: "none", stroke: PC.ink, "stroke-width": 5, "stroke-linecap": "round" }, a);
    return a;
  });
  H.el("circle", { cx: 108, cy: 54, r: 7, fill: PC.ink }, g);
  const t = b + T.items[0];
  tl.fromTo(arcs, { opacity: 0.35 }, { opacity: 1, duration: 0.25, stagger: 0.12, yoyo: true, repeat: 7, immediateRender: false }, t + 0.2);
  H.psNeedle(G, (tt) => 3.2 + 0.7 * H.env(tt, t, t + 3.2, 0.3) * H.wob(tt, 0.2), t, t + 3.4);
}
{
  // ② level glass (oil below L) + air breather with dirt
  const g = H.$("s6-v-i2");
  H.el("rect", { x: 14, y: 8, width: 30, height: 88, rx: 7, fill: PC.paper, stroke: PC.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: 19, y: 66, width: 20, height: 26, rx: 2, fill: PC.oil }, g);
  H.el("path", { d: "M 8 28 L 50 28 M 8 50 L 50 50", fill: "none", stroke: PC.ink, "stroke-width": 3 }, g);
  H.text(g, 56, 35, "H", { size: 18, anchor: "start" });
  H.text(g, 56, 57, "L", { size: 18, anchor: "start" });
  H.el("rect", { x: 107, y: 62, width: 14, height: 30, fill: PC.dark, stroke: PC.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: 88, y: 30, width: 52, height: 34, rx: 10, fill: PC.metal, stroke: PC.ink, "stroke-width": 4 }, g);
  H.el("path", { d: "M 97 39 L 131 39 M 97 47 L 131 47 M 97 55 L 131 55", fill: "none", stroke: PC.ink, "stroke-width": 2.5 }, g);
  const dirt = H.el("rect", { id: "s6-v-dirt", x: 88, y: 30, width: 52, height: 34, rx: 10, fill: PC.dirt, opacity: 0 }, g);
  tl.fromTo(dirt, { opacity: 0 }, { opacity: 0.7, duration: 0.6 }, b + T.items[1] + 1.4);
}
{
  // ③ pump body with front / back covers and their bolts, heat waves above
  const g = H.$("s6-v-i3");
  H.el("rect", { x: 34, y: 44, width: 82, height: 52, rx: 8, fill: PC.dark, stroke: PC.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: 22, y: 40, width: 14, height: 60, rx: 3, fill: PC.metal, stroke: PC.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: 114, y: 40, width: 14, height: 60, rx: 3, fill: PC.metal, stroke: PC.ink, "stroke-width": 3 }, g);
  for (const [x, y] of [[29, 50], [29, 90], [121, 50], [121, 90]]) H.el("path", { d: H.hexD(x, y, 5), fill: PC.ink }, g);
  const heat = H.el("g", { id: "s6-v-heat", opacity: 0.35 }, g);
  for (const x of [52, 75, 98]) H.el("path", { d: `M ${x} 36 C ${x - 8} 30 ${x + 8} 22 ${x} 16 C ${x - 7} 10 ${x + 6} 8 ${x} 4`, fill: "none", stroke: PC.red, "stroke-width": 4, "stroke-linecap": "round" }, heat);
  tl.fromTo(heat, { opacity: 0.35, y: 4 }, { opacity: 1, y: 0, duration: 0.4, yoyo: true, repeat: 5, immediateRender: false }, b + T.items[2] + 0.2);
}
