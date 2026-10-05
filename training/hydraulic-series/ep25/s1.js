// Title: the lubricator seen from outside — air runs IN → OUT, oil drops fall in the sight dome at a steady
// rhythm, and oil mist leaves with the air at OUT.
{
  const root = H.$("s1-v-art");
  const g = H.el("g", { transform: "translate(30 40)" }, root);
  const U = LU.unit(g, "s1-v-u", { cut: false });
  const L = H.el("g", {}, root);
  LU.port(L, 34, 150, 282, "IN");
  LU.port(L, 712, 828, 282, "OUT");
  LU.label(L, "s1-v-lw", 560, 120, "Oil drop window", 497, 170, { size: 26, sub: "หน้าต่างดูหยด", fx: 556, fy: 128 });
  LU.flow([U.air.in, U.air.out], b + 0.3, b + D, { speed: 80 });
  LU.drops(U, "s1-v-u", LU.every(b + 0.5, b + D - 1.2, 1.15), { outside: [672, 285], mistTo: 790, n: 8, seed: 11 });
}
