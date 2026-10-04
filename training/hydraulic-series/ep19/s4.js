// OPL 5-C-8 (p.28) steps 3–4, the operator's part: oil leak from any part of the relief valve? circuit pressure
// steady while the machine works? Same mini drawing in all three cards (pilot head + gauge, blue mark = setting):
// OK = dry + needle on the setting · NG = oil dripping · NG = needle swinging while the machine works.
{
  const st = T.stamps;
  const A = H.e19RvMini(H.$("s4-v-c1"), "s4-v-m1");
  const B = H.e19RvMini(H.$("s4-v-c2"), "s4-v-m2");
  const C = H.e19RvMini(H.$("s4-v-c3"), "s4-v-m3");

  // flow on every card's line = pump running / machine working
  for (const [id, g] of [["s4-v-f1", A.g], ["s4-v-f2", B.g], ["s4-v-f3", C.g]]) {
    RV.dash(g, id, "M 31 104 V 142 H 318", 3);
    RV.flow(id, b + 0.4, b + D, false);
  }

  // NG leak: wet spots at the lock nut thread and the port joint, a puddle below, drops falling
  const wet = H.el("g", { opacity: 0 }, B.g);
  for (const [x, y, rx, ry] of [[234, 83, 9, 6], [38, 104, 9, 6], [234, 162, 30, 5], [46, 162, 18, 4]])
    H.el("ellipse", { cx: x, cy: y, rx, ry, fill: E19.oil, stroke: E19.ink, "stroke-width": 1.5 }, wet);
  E19.op(wet, 0, 1, b + st[1] + 0.1);
  const d1 = E19.drop(B.g, 234, 102, 0.8);
  const d2 = E19.drop(B.g, 46, 124, 0.8);
  E19.drip(d1, b + st[1] + 0.1, b + D, 50, 1.1);
  E19.drip(d2, b + st[1] + 0.6, b + D, 30, 1.1);

  // NG pressure: needle swings while the machine works
  const sw = [8.3, 4.1, 7.7, 4.6, 8.1, 3.9, 7.4, 4.8];
  let v = 6, t = b + st[2] + 0.1, i = 0;
  while (t < b + D - 0.4) {
    const nv = sw[i % sw.length];
    tl.fromTo(C.G.needle, { rotation: C.G.rot(v), svgOrigin: C.G.origin }, { rotation: C.G.rot(nv), svgOrigin: C.G.origin, duration: 0.38, ease: "sine.inOut", immediateRender: false }, t);
    v = nv; t += 0.4; i++;
  }
}
