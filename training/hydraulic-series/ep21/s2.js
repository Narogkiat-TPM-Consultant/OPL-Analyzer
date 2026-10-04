// Alert icon: a hand reaching for a pressurised hose; oil jets from a pinhole into the fingertips;
// a prohibition sign snaps over it ("never touch a hose under pressure").
const ic = H.$("s2-v-icon");
const hz = H.hzHose(ic, "M 70 304 L 300 304", { w: 46, color: "#6b727c", edge: "#d8d2c4" });
H.hzFit(ic, 70, 304, 0, { k: 0.62 });
H.el("circle", { cx: 150, cy: 281, r: 4, fill: Z.ink }, ic);

// oil jet from the pinhole (yellow cone + moving streaks)
const jet = H.el("g", { opacity: 0 }, ic);
H.el("path", { d: "M 146 282 L 154 282 L 178 214 L 122 214 Z", fill: Z.oil, opacity: 0.95 }, jet);
const streaks = [[150, 136], [150, 150], [150, 164]].map(([x0, x1]) =>
  H.el("path", { d: `M ${x0} 280 L ${x1} 216`, fill: "none", stroke: "#ffffff", "stroke-width": 3, "stroke-dasharray": "10 12" }, jet));
H.hzOp(jet, 0, 1, b + 0.15, 0.2);
tl.fromTo(streaks, { strokeDashoffset: 0 }, { strokeDashoffset: 22 * Math.round(D * 4), duration: D - 0.15, ease: "none" }, b + 0.15);

// hand reaching down (sleeve, palm, fingers, thumb)
const hand = H.el("g", {}, ic);
const S = { fill: Z.skin, stroke: Z.ink, "stroke-width": 4 };
H.el("rect", { x: 108, y: 14, width: 84, height: 82, rx: 10, fill: Z.blue, stroke: Z.ink, "stroke-width": 4 }, hand);
[[106, 206], [129, 218], [152, 214], [175, 200]].forEach(([x, y1]) => H.el("rect", { x, y: 130, width: 21, height: y1 - 130, rx: 10.5, ...S }, hand));
H.el("rect", { x: 92, y: 112, width: 22, height: 64, rx: 11, transform: "rotate(28 103 116)", ...S }, hand);
H.el("rect", { x: 103, y: 84, width: 96, height: 76, rx: 24, ...S }, hand);
tl.fromTo(hand, { y: -26 }, { y: 0, duration: 0.45, ease: "power2.out" }, b + 0.05);

const no = H.noSign(ic, 150, 150, 112, "s2-v-no");
tl.fromTo(no, { opacity: 0, scale: 0.4, svgOrigin: "150 150" }, { opacity: 1, scale: 1, svgOrigin: "150 150", duration: 0.35, ease: "back.out(2)" }, b + 0.6);
