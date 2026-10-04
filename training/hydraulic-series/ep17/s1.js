// Title: the hydraulic unit (pump stopped) — the four easy-check spots light up one after another:
// 1 level (upper-limit mark), 2 oil colour in the level meter, 3 air breather, 4 oil temperature.
const S = H.t17Unit("s1-v-unit", "s1-v-u", { transform: "translate(14 22)" });
const fx = H.$("s1-v-fx");
const at = (lx, ly) => [14 + lx, 22 + ly];
const spots = [
  [at(56, 200), at(56, TK.up)],      // 1 level: marker above the meter
  [at(56, 512), at(56, 400)],        // 2 colour: marker below the meter
  [at(545, 84), at(545, 149)],       // 3 breather
  [at(690, 62), at(690, 132)],       // 4 temperature gauge
];
spots.forEach(([[mx, my], [sx, sy]], i) => {
  const t = b + 2.0 + 0.45 * i;
  const ring = H.el("circle", { cx: sx, cy: sy, r: i < 2 ? 30 : 40, fill: "none", stroke: TC.blue, "stroke-width": 5, opacity: 0 }, fx);
  tl.fromTo(ring, { opacity: 0, scale: 1.6, svgOrigin: `${sx} ${sy}` }, { opacity: 1, scale: 1, svgOrigin: `${sx} ${sy}`, duration: 0.35, ease: "power2.out" }, t);
  H.t17Num(fx, `s1-v-n${i + 1}`, mx, my, i + 1, t, 24);
});
