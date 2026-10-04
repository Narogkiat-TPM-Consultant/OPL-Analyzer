// Title: the unit runs; the three senses check it one after another — eye on the level glass,
// ear on the pump / coupling (noise arcs), hand on the tank.
const U = H.dcUnit("s1-v-u", "s1-v-un", { labels: [] });
const fx = H.$("s1-v-fx");
tl.fromTo(U.flow, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, b + 0.3);
tl.fromTo(U.flow, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((D - 0.3) * 3), duration: D - 0.3, ease: "none", immediateRender: false }, b + 0.3);
const marks = [["eye", 636, 470, 0.8], ["ear", 350, 186, 1.3], ["hand", 230, 492, 1.8]];
marks.forEach(([k, x, y, t], i) => {
  const g = H.dcBadge(fx, `s1-v-b${i}`, k, x, y, 46);
  tl.fromTo(g, { opacity: 0, scale: 0.4, svgOrigin: `${x} ${y}` }, { opacity: 1, scale: 1, svgOrigin: `${x} ${y}`, duration: 0.35, ease: "back.out(2)" }, b + t);
});
H.ring(fx, "s1-v-r1", 710, 500, 44, b + 1.0, 3, DC.blue);
H.dcFlash(U.noise, b + 1.5, D - 1.8);
tl.fromTo("#s1-v-b2", { y: 0 }, { y: 8, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, b + 2.2);
