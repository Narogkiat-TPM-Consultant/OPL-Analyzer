// Title: air flows through the FRL set; an eye moves F → R → L and frames each unit in turn; oil drips in the dome.
const SC = 1, TX = 148, TY = 284;
const U = H.frl("s1-v-unit", "s1-v-u", { transform: `translate(${TX} ${TY}) scale(${SC})`, x0: -128, x1: 598 });
const fx = H.$("s1-v-fx");
const pg = (lx, ly) => [TX + SC * lx, TY + SC * ly];
H.frlFlow(U, b + 0.4, D - 0.4);
// frames around the three units (page coordinates)
const boxes = [[-82, -62, 164, 368], [148, -186, 164, 244], [378, -124, 164, 430]].map(([x, y, w, h], i) => {
  const [px, py] = pg(x, y);
  return H.el("rect", { id: `s1-v-box${i}`, x: H.f(px), y: H.f(py), width: H.f(w * SC), height: H.f(h * SC), rx: 14, fill: "rgba(31,95,191,0.07)", stroke: FC.blue, "stroke-width": 4, "stroke-dasharray": "12 9", opacity: 0 }, fx);
});
const tops = [[0, -62], [230, -186], [460, -124]].map(([x, y]) => pg(x, y));
const EY = 50;
const sight = H.el("path", { id: "s1-v-sight", d: `M ${H.f(tops[0][0])} ${EY + 34} L ${H.f(tops[0][0])} ${H.f(tops[0][1])}`, fill: "none", stroke: FC.blue, "stroke-width": 3, "stroke-dasharray": "8 7", opacity: 0 }, fx);
const eye = H.frlEye(fx, "s1-v-eye", 0, EY, 1.1);
const stops = [0.6, 1.9, 3.2];
tl.fromTo(eye, { x: tops[0][0], opacity: 0 }, { x: tops[0][0], opacity: 1, duration: 0.3 }, b + stops[0] - 0.2);
stops.forEach((t, i) => {
  const [x, y] = tops[i];
  if (i > 0) {
    tl.to(eye, { x, duration: 0.55, ease: "power2.inOut" }, b + t - 0.55);
    tl.to(boxes[i - 1], { opacity: 0, duration: 0.25 }, b + t - 0.55);
    tl.to(sight, { opacity: 0, duration: 0.15 }, b + t - 0.55);
  }
  tl.set(sight, { attr: { d: `M ${H.f(x)} ${EY + 34} L ${H.f(x)} ${H.f(y)}` } }, b + t - 0.05);
  tl.to(sight, { opacity: 1, duration: 0.2 }, b + t);
  tl.fromTo(boxes[i], { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + t + 0.05);
});
// regulator needle settles, lubricator drips
tl.fromTo(U.R.needle, { rotation: U.R.rot(8.4), svgOrigin: U.R.origin }, { rotation: U.R.rot(6), svgOrigin: U.R.origin, duration: 0.9, ease: "back.out(1.6)" }, b + stops[1] + 0.1);
H.frlDrip(U.L.drop, b + stops[2] + 0.1, Math.max(1, Math.floor((D - stops[2] - 0.6) / 0.7)));
