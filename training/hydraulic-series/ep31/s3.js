// Check route (p.49): the eye walks F → R → L; each spot gets its number and its abnormal condition is animated.
//  1 water collects in the filter bowl · 2 (running) regulator needle swings = element clogged
//  3 lock nut backs off → set pressure moves · 4 (running) oil drips in the sight dome · 5 bowl oil turns milky white
const c = T.cues;
const SC = 1.12, TX = 273, TY = 226;
const U = H.frl("s3-v-unit", "s3-v-u", { transform: `translate(${TX} ${TY}) scale(${SC})` });
const fx = H.$("s3-v-fx");
const pg = (lx, ly) => [TX + SC * lx, TY + SC * ly];
const at = (k, dt = 0) => b + c[k] + dt;

// spots: ring centre (local), ring r (page), eye position (page)
const SP = [
  { l: [0, 226], r: 74, eye: [96, 520] },
  { l: [230, 0], r: 60, eye: [404, 84] },
  { l: [230, -99], r: 42, eye: [672, 70] },
  { l: [460, -84], r: 48, eye: [954, 104] },
  { l: [460, 196], r: 74, eye: [990, 470] },
];
SP.forEach((s, i) => { s.p = pg(...s.l); });
const sight = H.el("path", { id: "s3-v-sight", d: "M 0 0 L 1 1", fill: "none", stroke: FC.blue, "stroke-width": 3, "stroke-dasharray": "8 7", opacity: 0 }, fx);
const eye = H.frlEye(fx, "s3-v-eye", 0, 0, 1.05);
SP.forEach((s, i) => {
  const t = at(i, 0.05), [ex, ey] = s.eye, [px, py] = s.p;
  // sight line from the eye to the ring edge
  const a = Math.atan2(py - ey, px - ex), x2 = px - Math.cos(a) * (s.r + 6), y2 = py - Math.sin(a) * (s.r + 6);
  const x1 = ex + Math.cos(a) * 40, y1 = ey + Math.sin(a) * 30;
  if (i === 0) tl.fromTo(eye, { x: ex, y: ey, opacity: 0 }, { x: ex, y: ey, opacity: 1, duration: 0.3 }, t);
  else {
    tl.to(sight, { opacity: 0, duration: 0.15 }, t - 0.05);
    tl.to(eye, { x: ex, y: ey, duration: 0.5, ease: "power2.inOut" }, t);
  }
  tl.set(sight, { attr: { d: `M ${H.f(x1)} ${H.f(y1)} L ${H.f(x2)} ${H.f(y2)}` } }, t + 0.45);
  tl.to(sight, { opacity: 1, duration: 0.2 }, t + 0.5);
  H.frlRing(fx, `s3-v-ring${i + 1}`, px, py, s.r, t + 0.45);
  const n = H.frlNum(fx, `s3-v-n${i + 1}`, H.f(px - s.r * 0.72), H.f(py - s.r * 0.72), i + 1, 21);
  tl.fromTo(n, { opacity: 0, scale: 0.4, svgOrigin: `${H.f(px - s.r * 0.72)} ${H.f(py - s.r * 0.72)}` }, { opacity: 1, scale: 1, svgOrigin: `${H.f(px - s.r * 0.72)} ${H.f(py - s.r * 0.72)}`, duration: 0.3, ease: "back.out(2)", immediateRender: false }, t + 0.5);
});
tl.to(sight, { opacity: 0, duration: 0.3 }, b + D - 0.6);

// "machine running" chip for checks 2 and 4 (air flows only then)
const run = H.frlLab(fx, "s3-v-run", 540, 596, "ขณะเครื่องเดิน (Running)", { size: 27, anchor: "middle", color: "#ffffff", fill: FC.blue, stroke: FC.blue });
[[1, 2], [3, 4]].forEach(([k0, k1]) => {
  const t0 = at(k0, 0.3), dur = c[k1] - c[k0] - 0.2;
  H.frlFlow(U, t0, dur, true);
  H.frlShow(run, t0);
  H.frlHide(run, t0 + dur - 0.3);
});

// 1 water collects in the filter bowl
for (let i = 0; i < 3; i++) {
  const d = H.el("path", { d: H.frlDropD(-18 + i * 18, 92, 6), fill: FC.water, stroke: "#1d4f9a", "stroke-width": 1.2, opacity: 0 }, U.mid);
  tl.fromTo(d, { y: 0, opacity: 1 }, { y: 120, duration: 0.6, ease: "power2.in", immediateRender: false }, at(0, 0.7 + i * 0.45));
  tl.to(d, { opacity: 0, duration: 0.1 }, at(0, 1.25 + i * 0.45));
}
H.frlWater(U.F, FK.wNG, at(0, 0.8), 1.8);

// 2 needle swings while running → element clogged
H.frlSwing(U.R, 4.3, 7.8, at(1, 0.8), c[2] - c[1] - 1.3, 6);
tl.fromTo(U.F.dirt, { opacity: 0 }, { opacity: 1, duration: 0.8, immediateRender: false }, at(1, 1.6));
const [ex, ey] = pg(-26, 120);
const chClog = H.frlLab(fx, "s3-v-cclog", 22, 330, ["ไส้กรอง", "ตัน"], { size: 26, color: FC.red, stroke: FC.red, leader: [ex, ey] });
H.frlShow(chClog, at(1, 1.8));

// 3 lock nut backs off: handle turns, nut lifts, set pressure drifts
tl.fromTo(U.R.handle, { scaleX: 1, svgOrigin: U.R.handleOrigin }, { scaleX: 0.25, svgOrigin: U.R.handleOrigin, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }, at(2, 0.6));
tl.fromTo(U.R.nut, { y: 0 }, { y: -13, duration: 0.7, ease: "power2.out", immediateRender: false }, at(2, 0.7));
tl.to(U.R.needle, { rotation: U.R.rot(4.6), svgOrigin: U.R.origin, duration: 1.0, ease: "power1.inOut" }, at(2, 1.6));
const [nx, ny] = pg(203, -100);
const chNut = H.frlLab(fx, "s3-v-cnut", 456, 66, ["หลวม", "→ ค่าตั้งเคลื่อน"], { size: 25, anchor: "end", leader: [nx, ny] });
H.frlShow(chNut, at(2, 1.0));
H.frlHide(chNut, at(3, -0.1));

// 4 oil drips in the sight dome while running
H.frlDrip(U.L.drop, at(3, 0.7), Math.max(2, Math.floor((c[4] - c[3] - 1.0) / 0.7)));

// 5 bowl oil: water mixes in → milky white
for (let i = 0; i < 3; i++) {
  const d = H.el("path", { d: H.frlDropD(442 + i * 18, 92, 5.5), fill: FC.water, stroke: "#1d4f9a", "stroke-width": 1.2, opacity: 0 }, U.mid);
  tl.fromTo(d, { y: 0, opacity: 1 }, { y: 60, duration: 0.45, ease: "power2.in", immediateRender: false }, at(4, 0.5 + i * 0.3));
  tl.to(d, { opacity: 0, duration: 0.15 }, at(4, 0.9 + i * 0.3));
}
tl.fromTo(U.L.wdrops, { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false }, at(4, 0.9));
tl.fromTo(U.L.milky, { opacity: 0 }, { opacity: 1, duration: 1.2, immediateRender: false }, at(4, 1.3));
