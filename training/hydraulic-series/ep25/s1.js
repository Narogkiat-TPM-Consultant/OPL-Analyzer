// Title: the lubricator seen from outside — air runs IN → OUT, oil drops fall in the sight dome at a steady
// rhythm, and oil mist leaves with the air at OUT. Top-left: the FRL set with L (this OPL) highlighted.
{
  const root = H.$("s1-v-art");
  // FRL set strip
  const S = H.el("g", { id: "s1-v-frl" }, root);
  H.el("path", { d: "M 30 72 H 312", stroke: LU.pipe, "stroke-width": 8 }, S);
  [["F", 40], ["R", 132], ["L", 224]].forEach(([k, x]) => {
    const on = k === "L";
    H.el("rect", { x, y: 44, width: 72, height: 56, rx: 10, fill: on ? "#fbe7a1" : LU.metal, stroke: on ? LU.yellow : LU.ink, "stroke-width": on ? 6 : 4 }, S);
    H.text(S, x + 36, 84, k, { size: 32, anchor: "middle", fill: on ? LU.ink : LU.muted });
  });
  const g = H.el("g", { transform: "translate(30 40)" }, root);
  const U = LU.unit(g, "s1-v-u", { cut: false });
  const L = H.el("g", {}, root);
  LU.port(L, 34, 150, 282, "IN");
  LU.port(L, 712, 828, 282, "OUT");
  LU.label(L, "s1-v-lw", 40, 166, "Oil drop window", 371, 186, { size: 26, sub: "หน้าต่างดูหยด", fx: 262, fy: 157 });
  tl.fromTo(S, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.4 }, b + 0.9);
  LU.flow([U.air.in, U.air.out], b + 0.3, b + D, { speed: 80 });
  LU.drops(U, "s1-v-u", LU.every(b + 0.5, b + D - 1.2, 1.15), { outside: [672, 285], mistTo: 790, n: 8, seed: 11 });
}
