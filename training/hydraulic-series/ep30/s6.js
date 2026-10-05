// Operator check at the binding point: round tubes with room (OK) · tubes dented / flattened (NG) ·
// band of the wrong size or with too many tubes (NG). Each NG develops when its stamp lands.
const st = T.stamps, f = H.f;

// card 1 — OK: tubes round, tie snug with room
{
  const c = H.$("s6-v-c1");
  const S = H.atSide(H.atG(c, 18, 88, 0.6), { x0: 0, x1: 300, ties: [150], q: 1, tail: 16, tailAng: 65 });
  H.atFlow(S.flows, b + 0.2, b + D, 40);
  const X = H.atXsec(H.atG(c, 352, 92, 0.6), 0, 0, { q: 0.6, slack: 12, tail: 8, room: true });
  X.room.setAttribute("opacity", 0.35);
}

// card 2 — NG: tie too tight, tubes pinched at the tie
{
  const c = H.$("s6-v-c2"), t0 = b + st[1];
  const S = H.atSide(H.atG(c, 18, 88, 0.6), { x0: 0, x1: 300, ties: [150], q: 1, tail: 16, tailAng: 65 });
  const X = H.atXsec(H.atG(c, 352, 92, 0.6), 0, 0, { q: 1, slack: 12, tail: 8 });
  S.run(1, 2, t0 + 0.15, 0.9);
  X.run(1, 2, t0 + 0.15, 0.9);
  H.atRing(c, 108, 88, 34, 50, t0 + 1.1, 3);
}

// card 3 — NG: band smaller than the tube / more tubes than the band is made for
{
  const c = H.$("s6-v-c3"), t0 = b + st[2];
  const A = H.atClip(H.atG(c, 40, 0, 0.62), 40, 142, "small", { id: "s6-v-k1" });
  const B = H.atClip(H.atG(c, 245, 0, 0.62), 40, 142, "two", { id: "s6-v-k2", wall: 10 });
  A.run(0, 1, t0 + 0.15, 0.8);
  B.run(0, 1, t0 + 0.15, 0.8);
  H.atRing(c, f(40 + A.ccx(1) * 0.62), 88, 32, 44, t0 + 1.0, 3);
  H.atRing(c, f(245 + B.ccx(1) * 0.62), 88, 34, 42, t0 + 1.0, 3);
}
