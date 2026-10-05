// Judgment 4–5 (p.49): oil drips in the sight glass (OK) / no drip → oil does not reach all areas → adjust + repair /
// bowl oil milky white → water mixed in → replace with new oil.
const st = T.stamps;
const lab = (g, x, y, s, fill = FC.muted) => H.text(g, x, y, s, { size: 23, anchor: "middle", fill, weight: 700 });

// card 1 — OK: drops fall inside the sight dome (inset)
{
  const g = H.$("s6-v-c1");
  const L = H.frlMini(g, "L", "s6-v-l1", 100, 60, 0.42);
  const I = H.frlInset(g, "s6-v-i1", 330, 95, 80, L.pg(0, -84));
  const drop = H.frlDome(I, "s6-v-d1", 330, 128, 1.7);
  H.frlDrip(drop, b + st[0] + 0.1, Math.max(2, Math.floor((D - st[0] - 0.5) / 0.75)), 0.75);
}
// card 2 — NG: no drop (dashed outline, red slash)
{
  const g = H.$("s6-v-c2");
  const L = H.frlMini(g, "L", "s6-v-l2", 100, 60, 0.42);
  const I = H.frlInset(g, "s6-v-i2", 330, 95, 80, L.pg(0, -84));
  H.frlDome(I, "s6-v-d2", 330, 128, 1.7);
  const none = H.el("g", { id: "s6-v-none", opacity: 0 }, I);
  H.el("path", { d: H.frlDropD(330, 92, 11), fill: "none", stroke: FC.muted, "stroke-width": 3, "stroke-dasharray": "5 4" }, none);
  H.el("path", { d: "M 304 118 L 356 62", fill: "none", stroke: FC.red, "stroke-width": 6, "stroke-linecap": "round" }, none);
  tl.fromTo(none, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + st[1] + 0.2);
}
// card 3 — NG: bowl oil milky white (water mixed in); clear oil drop vs milky drop
{
  const g = H.$("s6-v-c3");
  const L = H.frlMini(g, "L", "s6-v-l3", 100, 60, 0.42, { milky: 1 });
  const P = (x, fill, s, labFill) => {
    H.el("path", { d: H.frlDropD(x, 100, 30), fill, stroke: FC.ink, "stroke-width": 4 }, g);
    lab(g, x, 172, s, labFill);
  };
  P(262, FC.oil, "ปกติ");
  H.el("path", { d: H.arrowD(304, 92, 346, 92, 14), fill: "none", stroke: FC.muted, "stroke-width": 5 }, g);
  const mk = H.el("g", { id: "s6-v-mk", opacity: 0 }, g);
  H.el("path", { d: H.frlDropD(392, 100, 30), fill: FC.milky, stroke: FC.ink, "stroke-width": 4 }, mk);
  for (const [dx, dy, r] of [[-10, 96, 5], [9, 108, 6], [-2, 120, 4], [12, 88, 3.5]]) H.el("circle", { cx: 392 + dx, cy: dy, r, fill: FC.water }, mk);
  lab(mk, 392, 172, "มีน้ำปน", FC.red);
  tl.fromTo(mk, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + st[2] + 0.2);
}
