// Title: OPL 5-C-13 ⑤ — pressure rises on the gauge and the hose bend moves from its pressure-0 position
// (dashed ghost) to the pressurised position; pressure drops and rises again.
const art = H.$("s1-v-art");
const G = H.gauge(art, 560, 118, 98, { id: "s1-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, labelSize: 34 });
H.text(art, 446, 128, "เกจแรงดัน", { size: 30, anchor: "end", fill: Z.muted, weight: 600 });
const R = H.hzRig(art, "s1-v-rig", { transform: "translate(-185 233) scale(1.3)", bg: Z.bg });
const lab0 = H.hzLabel(R.g, 150, 16, "แรงดัน 0", { size: 27, fill: Z.muted, halo: Z.bg, line: [262, 10, 314, 80], lineColor: Z.muted });
const lab1 = H.hzLabel(R.g, 316, 222, "ขณะมีแรงดัน", { size: 27, fill: Z.blue, halo: Z.bg, line: [380, 198, 386, 116], lineColor: Z.blue });
lab0.setAttribute("opacity", 0);
lab1.setAttribute("opacity", 0);

const up = (t, dur) => {
  tl.fromTo(G.needle, { rotation: G.rot(0), svgOrigin: G.origin }, { rotation: G.rot(7), svgOrigin: G.origin, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
  H.hzMorph(R.hose.paths, R.d(0), R.d(1), t, dur);
};
const down = (t, dur) => {
  tl.fromTo(G.needle, { rotation: G.rot(7), svgOrigin: G.origin }, { rotation: G.rot(0), svgOrigin: G.origin, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
  H.hzMorph(R.hose.paths, R.d(1), R.d(0), t, dur);
};
H.hzOp(R.ghost, 0, 1, b + 0.5, 0.3);
up(b + 0.9, 1.1);
H.hzOp(lab0, 0, 1, b + 2.1, 0.3);
H.hzOp(lab1, 0, 1, b + 2.3, 0.3);
if (D > 4.2) down(b + 3.0, 0.8);
if (D > 5.2) up(b + 4.0, 0.8);
