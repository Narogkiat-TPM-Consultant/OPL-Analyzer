// Judgment on the marked dial (green 2–4, red 0–2 / 4–6): each card's needle moves when its stamp lands.
// OK = needle settles in green · NG = needle runs into red · zero check: no pressure, needle drops below 0.
{
  const K = K18, st = T.stamps;
  const mini = (pid, id, cx = 230) => {
    const G = H.g18Dial(H.$(pid), cx, 86, 76, { id, value: 0, minor: 2, labels: [0, 2, 4, 6], labelSize: 17, unit: false });
    H.g18Marked(G);
    return G;
  };
  // OK — in the green band
  const A = mini("s6-v-ok", "s6-v-a");
  H.g18Needle(A, 0, 3.0, b + st[0] + 0.15, 0.9, "power2.out");
  // NG — in the red band
  const B = mini("s6-v-ng", "s6-v-b");
  H.g18Needle(B, 0, 5.2, b + st[1] + 0.15, 1.0, "power2.out");
  H.g18Ring(H.$("s6-v-ng"), ...B.pt(5.2, B.r * 0.62), 20, K.red, b + st[1] + 1.1, 2, 4);
  // zero point — no pressure: the needle must sit on 0; here it sinks below 0 (needs repair)
  const Z = mini("s6-v-zero", "s6-v-z", 250);
  const zg = H.$("s6-v-zero");
  H.text(zg, 70, 80, "P = 0", { size: 30, anchor: "middle", fill: K.blue });
  H.text(zg, 70, 112, "ไม่มีแรงดัน", { size: 20, anchor: "middle", fill: K.muted, weight: 600 });
  H.text(zg, 392, 80, "จุด 0", { size: 24, anchor: "middle", fill: K.blue });
  H.text(zg, 392, 108, "ตรงไหม?", { size: 24, anchor: "middle", fill: K.blue });
  H.g18Needle(Z, 0, -0.45, b + st[2] + 0.3, 0.8, "power2.inOut");
  H.g18Ring(zg, ...Z.pt(-0.2, Z.r * 0.7), 18, K.red, b + st[2] + 1.1, 2, 4);
}
