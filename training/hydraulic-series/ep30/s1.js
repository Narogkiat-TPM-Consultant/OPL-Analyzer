// Title: a neat bundle of air tubes held by two binders, air flowing; a lens shows the cross-section at a tie —
// tubes round, the tie snug with room to spare (the goal of this OPL).
const art = H.$("s1-v-art"), f = H.f;
const S = H.atSide(H.atG(art, 0, 150), { x0: 40, x1: 720, ties: [210, 530], q: 0.7, slack: 9, tail: 22, tailAng: 60 });
H.atFlow(S.flows, b + 0.4, b + D, 55);

// lens on the right-hand binder
const lx = 400, ly = 425, lr = 150, P = [530, 232];
const dx = P[0] - lx, dy = P[1] - ly, dist = Math.hypot(dx, dy), th = Math.atan2(dy, dx), be = Math.acos(lr / dist);
const cone = H.el("g", { opacity: 0 }, art);
for (const s of [-1, 1]) {
  const a = th + s * be;
  H.el("line", { x1: P[0], y1: P[1], x2: f(lx + lr * Math.cos(a)), y2: f(ly + lr * Math.sin(a)), stroke: AT.muted, "stroke-width": 3, "stroke-dasharray": "8 7" }, cone);
}
const lens = H.el("g", { opacity: 0 }, art);
H.el("circle", { cx: lx, cy: ly, r: lr, fill: AT.paper }, lens);
const X = H.atXsec(H.atG(lens, lx, ly, 0.88), 0, 0, { q: 0, slack: 18, tail: 14, room: true });
H.el("circle", { cx: lx, cy: ly, r: lr, fill: "none", stroke: AT.ink, "stroke-width": 6 }, lens);

H.atOp(cone, 0, 1, b + 0.7, 0.3);
tl.fromTo(lens, { opacity: 0, scale: 0.3, svgOrigin: `${lx} ${ly}` }, { opacity: 1, scale: 1, svgOrigin: `${lx} ${ly}`, duration: 0.45, ease: "back.out(1.5)", immediateRender: false }, b + 0.8);
X.run(0, 0.5, b + 1.5, 0.9);
tl.fromTo(X.room, { opacity: 0 }, { opacity: 0.3, duration: 0.4, immediateRender: false }, b + 2.4);
H.atCheck(art, lx + 128, ly - 118, 1.3, b + 2.6);
