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

  // OK: a tick beside the gauge
  const ok = E19.tick(A.g, 440, 30, 16, { opacity: 0 });
  E19.op(ok, 0, 1, b + st[0] + 0.2);

  // NG leak: drops under the lock nut and at the port joint
  const d1 = E19.drop(B.g, 234, 100, 0.8);
  const d2 = E19.drop(B.g, 50, 122, 0.8);
  E19.drip(d1, b + st[1] + 0.1, b + D, 44, 1.1);
  E19.drip(d2, b + st[1] + 0.6, b + D, 28, 1.1);

  // NG pressure: needle swings while the machine works
  const sw = [8.3, 4.1, 7.7, 4.6, 8.1, 3.9, 7.4, 4.8];
  let v = 6, t = b + st[2] + 0.1, i = 0;
  while (t < b + D - 0.4) {
    const nv = sw[i % sw.length];
    tl.fromTo(C.G.needle, { rotation: C.G.rot(v), svgOrigin: C.G.origin }, { rotation: C.G.rot(nv), svgOrigin: C.G.origin, duration: 0.38, ease: "sine.inOut", immediateRender: false }, t);
    v = nv; t += 0.4; i++;
  }
}
