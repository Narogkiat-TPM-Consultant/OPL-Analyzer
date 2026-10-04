// Structure of the oil tank (OPL 5-C-4 figure). The pump runs all scene; parts are labelled as they are spoken.
//  seg 1 — tank body, manhole (cleaning the inside), replenish port
//  seg 2 — air breather (breathes as the level moves) + oil level meter (amount and colour)
//  seg 3 — baffle plate: return oil releases its bubbles, dirt settles, the oil travels over the plate and cools
const c = T.cues;
const TX = 150, TY = 80, SC = 0.95;
const S = H.t17Unit("s2-v-unit", "s2-v-u", { transform: `translate(${TX} ${TY}) scale(${SC})` });
const ug = S.g, fx = H.$("s2-v-fx");
const pg = (lx, ly) => [TX + SC * lx, TY + SC * ly];

// pump runs: flow dashes
H.t17Flow(S.flows, b + 0.3, D - 0.3);

// static labels (other parts named in the figure)
H.t17Lab(ug, "s2-v-ldis", 248, 46, "ไปวงจร", { size: 22, shown: true });
H.t17Lab(ug, "s2-v-lret", 754, 46, "จากวงจร", { size: 22, shown: true });
H.t17Lab(ug, "s2-v-ltg", 762, 118, "Temp. gauge", { size: 22, shown: true, leader: [718, 128] });
H.t17Lab(ug, "s2-v-lfil", 304, 465, "Filter", { size: 22, shown: true });

// seg 1
const L1 = [
  H.t17Lab(ug, "s2-v-ltank", 610, 455, "ถังน้ำมัน (Tank body)", { size: 24, anchor: "middle" }),
  H.t17Lab(ug, "s2-v-lman", 806, 300, ["Manhole", "(ล้างภายใน)"], { size: 23 }),
  H.t17Lab(ug, "s2-v-lfill", 640, 102, "ช่องเติม", { size: 24, leader: [626, 156] }),
];
L1.forEach((el, i) => H.t17Show(el, b + c[0] + 0.15 + 0.7 * i));
H.t17Ring(fx, "s2-v-rman", ...pg(778, 376), 48, b + c[0] + 0.85, 2);
// replenish: a few oil drops fall into the port
for (let k = 0; k < 3; k++) {
  const [dx, dy] = pg(622, 112);
  const d = H.el("path", { d: `M ${H.f(dx)} ${H.f(dy - 16)} Q ${H.f(dx + 9)} ${H.f(dy)} ${H.f(dx)} ${H.f(dy + 6)} Q ${H.f(dx - 9)} ${H.f(dy)} ${H.f(dx)} ${H.f(dy - 16)} Z`, fill: TC.oil, stroke: TC.surf, "stroke-width": 2, opacity: 0 }, fx);
  tl.fromTo(d, { opacity: 0, y: -10 }, { opacity: 1, y: 28, duration: 0.45, ease: "power1.in" }, b + c[0] + 1.6 + 0.35 * k);
  tl.to(d, { opacity: 0, duration: 0.12 }, b + c[0] + 2.05 + 0.35 * k);
}

// seg 2
const L2 = [
  H.t17Lab(ug, "s2-v-lbr", 470, 50, "Air breather", { size: 24, leader: [530, 128] }),
  H.t17Lab(ug, "s2-v-lmet", 70, 552, "เกจระดับ (Oil level meter)", { size: 24, leader: [56, 474] }),
];
L2.forEach((el, i) => H.t17Show(el, b + c[1] + 0.15 + 1.0 * i));
H.t17Ring(fx, "s2-v-rbr", ...pg(545, 149), 52, b + c[1] + 0.2, 2);
const mr = H.el("rect", { x: H.f(TX + SC * 24), y: H.f(TY + SC * 212), width: H.f(SC * 64), height: H.f(SC * 272), rx: 14, fill: "none", stroke: TC.blue, "stroke-width": 5, opacity: 0 }, fx);
tl.fromTo(mr, { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, b + c[1] + 1.2);
// the breather breathes: air arrows in / out of the cap
const air = H.el("g", { opacity: 0 }, fx);
for (const [x1, y1, x2, y2] of [[455, 108, 505, 136], [635, 108, 585, 136]]) {
  const [a, bb] = pg(x1, y1), [c2, d2] = pg(x2, y2);
  H.el("path", { d: H.arrowD(a, bb, c2, d2, 13), fill: "none", stroke: TC.blue, "stroke-width": 4 }, air);
}
tl.fromTo(air, { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, b + c[1] + 0.3);

// seg 3 — baffle plate
const L3 = H.t17Lab(ug, "s2-v-lbaf", 470, 300, "Baffle plate (แผ่นกั้น)", { size: 24, leader: [470, 336] });
H.t17Show(L3, b + c[2] + 0.15);
// flow path: return outlet → along the bottom → over the plate → to the suction filter
const path = "M 728 432 C 650 470 560 440 520 380 C 500 345 480 318 450 330 C 400 350 330 400 300 438";
const fp = H.el("path", { id: "s2-v-fpath", d: path, fill: "none", stroke: TC.blue, "stroke-width": 5, "stroke-dasharray": "14 10", opacity: 0 }, ug);
const ah = H.el("path", { d: "M 312 418 L 296 442 L 324 440", fill: "none", stroke: TC.blue, "stroke-width": 5, "stroke-linejoin": "round", opacity: 0 }, ug);
tl.fromTo([fp, ah], { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, b + c[2] + 0.4);
tl.fromTo(fp, { strokeDashoffset: 0 }, { strokeDashoffset: -24 * 8, duration: D - c[2] - 0.4, ease: "none", immediateRender: false }, b + c[2] + 0.4);
// bubbles leave the return oil and rise to the surface (return side)
const tB = c[2] + 0.3, nB = 9;
for (let k = 0; k < nB; k++) {
  const bx = 690 + ((k * 23) % 56), r = 6 + (k % 3) * 2;
  const bub = H.el("circle", { cx: bx, cy: 418, r, fill: "#ffffff", stroke: TC.blue, "stroke-width": 2.5, opacity: 0 }, ug);
  const t0 = b + tB + 0.28 * k;
  tl.fromTo(bub, { opacity: 0, y: 0 }, { opacity: 1, y: -40, duration: 0.25, ease: "none", immediateRender: false }, t0);
  tl.to(bub, { y: -(418 - TK.up - 4), duration: 1.0, ease: "power1.in" }, t0 + 0.25);
  tl.to(bub, { opacity: 0, duration: 0.15 }, t0 + 1.2);
}
// dirt settles to the bottom on the return side (far from the suction filter)
const dots = [[520, 462], [556, 470], [598, 458], [632, 468], [668, 460], [706, 466], [540, 452], [650, 448]];
dots.forEach(([dx, dy], k) => {
  const p0 = H.el("circle", { cx: dx, cy: dy - 60, r: 5, fill: TC.dirt, opacity: 0 }, S.dirtG);
  const t0 = b + c[2] + 1.0 + 0.12 * k;
  tl.fromTo(p0, { opacity: 0, y: 0 }, { opacity: 1, y: 30, duration: 0.3, ease: "none", immediateRender: false }, t0);
  tl.to(p0, { y: 494 - (dy - 60) - 4, duration: 1.0, ease: "power1.out" }, t0 + 0.3);
});
// cooling: heat leaves through the tank wall
const heat = H.el("g", { opacity: 0 }, fx);
for (const ly of [470, 490]) {
  const [hx, hy] = pg(784, ly);
  H.el("path", { d: `M ${H.f(hx)} ${H.f(hy)} q 10 -8 20 0 t 20 0 t 20 0`, fill: "none", stroke: TC.red, "stroke-width": 3.5, "stroke-linecap": "round", opacity: 0.8 }, heat);
}
tl.fromTo(heat, { opacity: 0, x: 0 }, { opacity: 1, x: 14, duration: 0.6, yoyo: true, repeat: 3, immediateRender: false }, b + c[2] + 1.6);
