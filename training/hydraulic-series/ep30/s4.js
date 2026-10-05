// NG ② (OPL 5'-C-4 Fig 2): lock band used wrongly — band smaller than the tube, or more tubes than the band is
// made for. Screwing the band to the frame squeezes the tube(s) → deformed, same result as NG ①.
const f = H.f;

// Left: band smaller than the tube
{
  const L = H.$("s4-v-l"), t0 = b + T.left;
  const C = H.atClip(L, 170, 124, "small", { id: "s4-v-c1" });
  const p = H.atArrow(L, 268, 44, 212, 44, { color: AT.ink, w: 5, head: 16 });
  H.atHide(p);
  H.atOp(p, 0, 1, t0 + 0.6, 0.25);
  C.run(0, 1, t0 + 0.9, 1.0);
  H.atOp(p, 1, 0, t0 + 2.0, 0.25);
  const cx1 = C.ccx(1);
  const ghost = H.el("circle", { cx: f(cx1), cy: 124, r: 40, fill: "none", stroke: AT.muted, "stroke-width": 3, "stroke-dasharray": "7 6", opacity: 0 }, L);
  H.atOp(ghost, 0, 1, t0 + 1.9, 0.3);
  H.atRing(L, f(cx1), 124, 52, 70, t0 + 2.1, 3);
  // size comparison: band ring vs tube ring
  const cmp = H.el("g", {}, L);
  H.el("circle", { cx: 450, cy: 112, r: 30, fill: "none", stroke: AT.ink, "stroke-width": 11 }, cmp);
  H.el("circle", { cx: 450, cy: 112, r: 30, fill: "none", stroke: AT.dark, "stroke-width": 5 }, cmp);
  H.el("circle", { cx: 620, cy: 112, r: 40, fill: AT.pipe, stroke: AT.ink, "stroke-width": 3 }, cmp);
  H.el("circle", { cx: 620, cy: 112, r: 27, fill: AT.tint }, cmp);
  H.text(cmp, 535, 126, "<", { size: 44, anchor: "middle", fill: AT.red });
  H.text(cmp, 450, 196, "Band", { size: 26, anchor: "middle", fill: AT.muted });
  H.text(cmp, 620, 196, "สาย", { size: 26, anchor: "middle", fill: AT.muted });
}

// Right: band made for 1 tube, 2 tubes put in
{
  const R = H.$("s4-v-r"), t0 = b + T.right;
  const C = H.atClip(R, 170, 124, "two", { id: "s4-v-c2", wall: 10 });
  const p = H.atArrow(R, 268, 40, 212, 40, { color: AT.ink, w: 5, head: 16 });
  H.atHide(p);
  H.atOp(p, 0, 1, t0 + 0.6, 0.25);
  C.run(0, 1, t0 + 0.9, 1.0);
  H.atOp(p, 1, 0, t0 + 2.0, 0.25);
  H.atRing(R, f(C.ccx(1)), 124, 58, 66, t0 + 2.0, 3);
  const tag = H.el("g", {}, R);
  H.el("rect", { x: 400, y: 58, width: 300, height: 52, rx: 10, fill: AT.paper, stroke: AT.muted, "stroke-width": 3 }, tag);
  H.text(tag, 550, 94, "Band สำหรับ 1 สาย", { size: 27, anchor: "middle", fill: AT.ink });
  const two = H.atLabel(R, 550, 166, "ใส่ 2 สาย → บีบ", { size: 30, anchor: "middle", fill: AT.red });
  H.atHide(two);
  H.atOp(two, 0, 1, t0 + 1.4);
}
