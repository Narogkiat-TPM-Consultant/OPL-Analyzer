// Judgment for the solenoid valve check (OPL 5-C-9, p.30): all 4 points normal = OK; any one of them = NG.
// Same installed valve in both cards. OK: switches cleanly. NG: the four signs — leak at the joint, loose bolt,
// "boon" while ON, damaged cable. (Actions on the cards are proposals: p.30 gives none.)
{
  const st = T.stamps;
  const mini = (id, p) => {
    const g = H.el("g", { transform: "translate(214 30) scale(0.42)" }, H.$(id));
    return H.e19Sol(g, p, { boxLabel: "" });
  };
  const L = (x, y) => [214 + 0.42 * x, 30 + 0.42 * y];

  // OK
  const A = mini("s6-v-c1", "s6-v-a");
  A.V.mid.setAttribute("fill", V6.pr);
  A.V.ports.P.setAttribute("fill", V6.pr);
  A.V.coil("a", true, b + st[0] + 0.2);
  A.V.shift(0, 1, b + st[0] + 0.45, 0.5);
  H.v6Paint(A.V, 0, 1, b + st[0] + 0.8);
  const ok = E19.tick(H.$("s6-v-c1"), 690, 95, 30, { opacity: 0 });
  E19.op(ok, 0, 1, b + st[0] + 0.3);

  // NG: four signs
  const N = mini("s6-v-c2", "s6-v-n");
  const G = H.$("s6-v-c2"), t0 = b + st[1] + 0.15;
  N.V.coil("a", true, t0);
  const wv = E19.waves(G, 211, 97, 180, { r: [14, 25, 36], span: 36, w: 4 });
  wv.run(t0 + 0.2, b + D);
  const [jx, jy] = L(640, 292);
  const drop = E19.drop(G, jx, jy, 0.6);
  E19.drip(drop, t0 + 0.1, b + D, 20, 1.0);
  tl.fromTo(N.bolts[1], { rotation: 0, y: 0, svgOrigin: "710 20" }, { rotation: -16, y: -8, svgOrigin: "710 20", duration: 0.35, ease: "back.out(2)" }, t0 + 0.2);
  // cable b broken: a gap with a spark
  const [cx, cy] = L(884, 6);
  const brk = H.el("g", { opacity: 0 }, G);
  H.el("rect", { x: cx - 6, y: cy - 5, width: 12, height: 10, fill: E19.paper }, brk);
  H.el("path", { d: `M ${cx - 12} ${cy - 10} L ${cx - 2} ${cy - 2} L ${cx - 9} ${cy + 1} L ${cx + 4} ${cy + 11}`, fill: "none", stroke: E19.yel, "stroke-width": 4, "stroke-linejoin": "round" }, brk);
  E19.op(brk, 0, 1, t0 + 0.25, 0.2);
  // tags
  const tag = (s, x, y, lx, ly, anchor = "start") => {
    const g = H.el("g", { opacity: 0 }, G);
    H.el("path", { d: `M ${anchor === "start" ? x - 6 : x + 6} ${y - 8} L ${lx} ${ly}`, fill: "none", stroke: E19.muted, "stroke-width": 2.5 }, g);
    H.text(g, x, y, s, { size: 25, anchor });
    return g;
  };
  const [bx, by] = L(710, -6);
  const tags = [
    tag("เสียงบูน", 158, 70, 186, 84, "end"),
    tag("สายชำรุด", 622, 30, cx + 8, cy),
    tag("น็อตหลวม", 622, 78, bx + 10, by + 4),
    tag("รั่ว", 622, 160, jx + 10, jy),
  ];
  tags.forEach((g, i) => E19.op(g, 0, 1, t0 + 0.35 + 0.15 * i, 0.25));
}
