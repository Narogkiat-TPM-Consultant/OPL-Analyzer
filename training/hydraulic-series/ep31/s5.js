// Judgment 1–3 (p.49): filter bowl clear / water in the bowl → open the manual drain /
// needle swings (element clogged) → replace element / lock nut loose → re-tighten.
const st = T.stamps;
const lab = (g, x, y, s) => H.text(g, x, y, s, { size: 25, anchor: "middle", fill: FC.muted, weight: 700 });

// card 1 — OK: bowl clear, needle steady
{
  const g = H.$("s5-v-c1");
  H.frlMini(g, "F", "s5-v-f1", 92, 34, 0.46);
  H.frlDial(g, "s5-v-g1", 262, 80, 54);
  lab(g, 262, 178, "เกจ Regulator");
}
// card 2 — NG: water in the bowl → open the manual drain valve (inset), water runs out
{
  const g = H.$("s5-v-c2");
  const F = H.frlMini(g, "F", "s5-v-f2", 88, 34, 0.46, { water: FK.wNG });
  const I = H.frlInset(g, "s5-v-i2", 268, 92, 76, F.pg(0, FK.bowlBot + 22));
  H.el("rect", { x: 250, y: 18, width: 36, height: 44, fill: FC.bowl, stroke: FC.ink, "stroke-width": 4 }, I);
  const iw = H.el("rect", { x: 251, y: 30, width: 34, height: 31, fill: FC.water, opacity: 0.8 }, I);
  H.el("rect", { x: 246, y: 58, width: 44, height: 18, rx: 3, fill: FC.dark, stroke: FC.ink, "stroke-width": 3 }, I);
  const knob = H.el("g", { id: "s5-v-knob" }, I);
  H.el("rect", { x: 232, y: 74, width: 72, height: 34, rx: 9, fill: FC.metal, stroke: FC.ink, "stroke-width": 4 }, knob);
  H.el("path", { d: "M 248 78 L 248 104 M 260 78 L 260 104 M 272 78 L 272 104 M 284 78 L 284 104", fill: "none", stroke: FC.ink, "stroke-width": 2.5, opacity: 0.6 }, knob);
  H.el("rect", { x: 260, y: 106, width: 16, height: 16, rx: 2, fill: FC.dark, stroke: FC.ink, "stroke-width": 3 }, I);
  const turn = H.el("path", { d: H.frlTurnD(268, 91, 48, 205, 335), fill: "none", stroke: FC.blue, "stroke-width": 5, "stroke-linecap": "round", opacity: 0 }, I);
  const t = b + st[1] + 0.2;
  tl.fromTo(turn, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t);
  tl.fromTo(knob, { scaleX: 1, svgOrigin: "268 91" }, { scaleX: 0.3, svgOrigin: "268 91", duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut" }, t + 0.1);
  const n = Math.max(3, Math.floor((D - st[1] - 1.2) / 0.32));
  for (let i = 0; i < n; i++) {
    const d = H.el("path", { d: H.frlDropD(268, 132, 6), fill: FC.water, stroke: "#1d4f9a", "stroke-width": 1.2, opacity: 0 }, I);
    tl.fromTo(d, { y: 0, opacity: 1 }, { y: 34, opacity: 0.2, duration: 0.4, ease: "power2.in", immediateRender: false }, t + 0.9 + i * 0.32);
    tl.to(d, { opacity: 0, duration: 0.05 }, t + 1.3 + i * 0.32);
  }
  const dr = Math.min(3, D - st[1] - 1.4);
  H.frlWater(F, FK.wEmpty, t + 1.0, dr, "none");
  tl.to(iw, { attr: { y: 61, height: 0 }, duration: dr, ease: "none" }, t + 1.0);
}
// card 3 — NG: needle swings while running → element clogged
{
  const g = H.$("s5-v-c3");
  H.frlMini(g, "F", "s5-v-f3", 92, 34, 0.46, { dirt: 1 });
  const G = H.frlDial(g, "s5-v-g3", 262, 80, 54);
  lab(g, 262, 178, "เกจ Regulator");
  H.frlSwing(G, 4.2, 7.9, b + st[2] + 0.1, D - st[2] - 0.6, 6);
}
// card 4 — NG: lock nut loose → set pressure moves
{
  const g = H.$("s5-v-c4");
  const R = H.frlMini(g, "R", "s5-v-r4", 88, 128, 0.64);
  const t = b + st[3] + 0.1;
  tl.fromTo(R.nut, { y: 0 }, { y: -14, duration: 0.6, ease: "power2.out", immediateRender: false }, t);
  const [nx, ny] = R.pg(0, -106);
  const ring = H.el("ellipse", { cx: nx, cy: H.f(ny), rx: 30, ry: 18, fill: "none", stroke: FC.red, "stroke-width": 4, opacity: 0 }, g);
  tl.fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.5);
  const G = H.frlDial(g, "s5-v-g4", 268, 80, 54, { set: 6 });
  tl.to(G.needle, { rotation: G.rot(4.3), svgOrigin: G.origin, duration: 1.0, ease: "power1.inOut" }, t + 0.7);
  lab(g, 268, 178, "ค่าตั้ง = เส้นฟ้า");
}
