// Judgment 3–4: air breather clean / dirty, oil temperature OK / too hot. Each card animates when its stamp lands.
const st = T.stamps;

// 3 OK — clean element, air passes freely
const g1 = H.$("s6-v-c1");
H.t17Breather(g1, 180, 20, 1.1);
const air = H.el("g", { opacity: 0 }, g1);
for (const [x1, y1, x2, y2] of [[40, 40, 92, 62], [320, 40, 268, 62]]) H.el("path", { d: H.arrowD(x1, y1, x2, y2, 14), fill: "none", stroke: TC.blue, "stroke-width": 5 }, air);
tl.fromTo(air, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + st[0] + 0.2);

// 3 NG — dirty element → wash with kerosene (tray) or replace
const g2 = H.$("s6-v-c2");
const BR = H.t17Breather(g2, 120, 20, 1.1);
tl.fromTo(BR.dirt, { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false }, b + st[1] + 0.1);
const tray = H.el("g", { opacity: 0 }, g2);
H.el("path", { d: "M 238 92 L 346 92 L 334 150 L 250 150 Z", fill: TC.paper, stroke: TC.ink, "stroke-width": 4, "stroke-linejoin": "round" }, tray);
H.el("path", { d: "M 243 112 L 341 112 L 334 146 L 250 146 Z", fill: "#dfe8f6" }, tray);
H.text(tray, 292, 180, "น้ำมันก๊าด", { size: 22, anchor: "middle" });
H.el("path", { d: H.arrowD(200, 90, 236, 106, 12), fill: "none", stroke: TC.ink, "stroke-width": 4 }, g2).setAttribute("opacity", 0);
const arr = g2.lastChild;
tl.fromTo([tray, arr], { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + st[1] + 0.6);

// 4 temperature gauge + palm (shared drawing)
const tcard = (id, needleTo, t, hot) => {
  const g = H.$(id);
  const G = H.gauge(g, 96, 100, 74, { id: `${id}-g`, min: 0, max: 100, ticks: 2, minor: 4, labelEvery: 1, labelSize: 19, marks: [{ v: 55 }], value: 20 });
  tl.to(G.needle, { rotation: G.rot(needleTo), svgOrigin: G.origin, duration: 0.8, ease: "power2.out" }, t);
  H.el("rect", { x: 200, y: 56, width: 150, height: 120, rx: 6, fill: TC.metal, stroke: TC.ink, "stroke-width": 4 }, g);
  const palm = H.t17Palm(g, 275, 122, 0.52);
  return { g, G, palm };
};
const T3 = tcard("s6-v-c3", 38, b + st[2] + 0.1);
T3.palm.setAttribute("opacity", 0);
tl.fromTo(T3.palm, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, immediateRender: false }, b + st[2] + 0.4);
const T4 = tcard("s6-v-c4", 72, b + st[3] + 0.1);
const heat = H.t17Heat(T4.g, 275, 52, 40, { w: 4 });
tl.fromTo(heat, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + st[3] + 0.4);
// the hand is pulled away at once
tl.fromTo(T4.palm, { y: 0, opacity: 1 }, { y: -36, opacity: 0.35, duration: 0.35, ease: "power3.out", immediateRender: false }, b + st[3] + 0.8);
