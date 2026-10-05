// Functions of the three units (p.48): factory air in → filter catches dust + water → regulator lowers the
// pressure to a steady set value → lubricator drips oil that leaves as mist with the air.
const c = T.cues;
const SC = 1.12, TX = 273, TY = 226;
const U = H.frl("s2-v-unit", "s2-v-u", { transform: `translate(${TX} ${TY}) scale(${SC})`, R: { value: 8.6 } });
const fx = H.$("s2-v-fx");
const pg = (lx, ly) => [TX + SC * lx, TY + SC * ly];

// seg 1: factory air flows in
const t1 = b + c[0] + 0.2;
H.frlFlow(U, t1, D - c[0] - 0.2);
const [ix, iy] = pg(-150, 0);
const chAir = H.frlLab(fx, "s2-v-cair", 30, 120, ["ลมโรงงาน", "(Factory air)"], { size: 26, color: FC.blue, stroke: FC.blue, leader: [ix + 30, iy - 12] });
H.frlShow(chAir, t1 + 0.2);

// seg 2: air filter — dust + water ride in, drop into the bowl; a little water collects
const t2 = b + c[1] + 0.2;
const parts = [[-6, "d", 0], [5, "w", 0.25], [-3, "d", 0.5], [6, "w", 0.75], [-5, "w", 1.0], [2, "d", 1.25]];
parts.forEach(([dy, k, dt], i) => {
  const el = k === "d"
    ? H.el("circle", { cx: -170, cy: dy, r: 7.5, fill: FC.dirt, stroke: "#4a3622", "stroke-width": 1.5, opacity: 0 }, U.mid)
    : H.el("path", { d: H.frlDropD(-170, dy, 8), fill: FC.water, stroke: "#1d4f9a", "stroke-width": 1.5, opacity: 0 }, U.mid);
  const t = t2 + dt, dx = (i % 3) * 22 - 22;
  tl.fromTo(el, { x: 0, y: 0, opacity: 0 }, { x: 110, opacity: 1, duration: 0.7, ease: "none", immediateRender: false }, t);
  tl.fromTo(el, { x: 170 + dx, y: 84 }, { y: k === "w" ? 236 : 262, duration: 0.7, ease: "power2.in", immediateRender: false }, t + 0.7);
  tl.to(el, { opacity: 0, duration: 0.25 }, t + 1.35);
});
H.frlWater(U.F, 246, t2 + 1.2, 1.4);
const [fbx, fby] = pg(-50, 150);
const chF = H.frlLab(fx, "s2-v-cf", 30, 330, ["ดักฝุ่น · น้ำ", "ลงถ้วย"], { size: 27, leader: [fbx, fby] });
H.frlShow(chF, t2 + 0.9);

// seg 3: regulator — the needle comes down from factory pressure to the steady set value
const t3 = b + c[2] + 0.2;
tl.to(U.R.needle, { rotation: U.R.rot(6), svgOrigin: U.R.origin, duration: 1.1, ease: "back.out(1.4)" }, t3 + 0.3);
const chR = H.frlLab(fx, "s2-v-cr", pg(230, 0)[0], 412, ["ลดแรงดันลง", "→ คงที่ตามใช้งาน"], { size: 27, anchor: "middle", color: FC.blue, stroke: FC.blue });
H.frlShow(chR, t3 + 0.5);

// seg 4: lubricator — oil drips in the sight dome, then leaves as mist with the air
const t4 = b + c[3] + 0.2;
H.frlDrip(U.L.drop, t4, 4, 0.75);
for (let i = 0; i < 12; i++) {
  const m = H.el("circle", { cx: 540, cy: ((i * 7) % 11) - 5, r: 7.5, fill: FC.oil, stroke: "#8a6a10", "stroke-width": 2, opacity: 0 }, U.mid);
  const t = t4 + 0.6 + i * 0.26;
  tl.fromTo(m, { x: 0, opacity: 0 }, { x: 118, opacity: 1, duration: 0.9, ease: "none", immediateRender: false }, t);
  tl.to(m, { opacity: 0, duration: 0.2 }, t + 0.75);
}
const [ox, oy] = pg(590, -14);
const chL = H.frlLab(fx, "s2-v-cl", 1084, 70, ["ละอองน้ำมัน", "(Oil mist)"], { size: 27, anchor: "end", color: "#8a6a10", stroke: FC.oilEdge, fill: "#fff8e1", leader: [ox, oy] });
H.frlShow(chL, t4 + 0.8);
