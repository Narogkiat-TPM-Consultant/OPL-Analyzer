// Colour marking (OPL 5-A-10, Table 1 + Table 2): six material classes, each card = ring + dots + use.
const c2 = T.cues;
const seg2 = (k) => (k + 1 < c2.length ? c2[k + 1] - 0.3 : D - 0.8) - c2[k]; // length of segment k (0-based)
const at2 = (k, fr) => b + c2[k] + 0.1 + fr * seg2(k);

// classification row: size · material · hardness
const cls = H.$("s2-v-cls");
H.text(cls, 8, 54, "แบ่งชนิดตาม", { size: 34, fill: HC.ink });
const chips = [["ขนาด (mm / inch)", 300], ["วัสดุ (Material)", 270], ["ความแข็ง (Hardness)", 330]];
let cx2 = 230;
chips.forEach(([s, w], i) => {
  H.orPill(cls, cx2, 14, w, 56, s, { id: `s2-v-chip${i + 1}`, fill: HC.blue, size: 30 });
  cx2 += w + 18;
});
H.orPill(cls, 1300, 14, 452, 56, "วัสดุอื่น → ไม่มีเครื่องหมาย", { id: "s2-v-other", fill: "#ebe5d6", color: HC.ink, size: 30 });

// the six classes (code, hardness, use TH, use EN, dot colour, dots, colour text)
const CL = [
  ["1A", "แข็ง Hs70", "น้ำมันแร่", "Mineral oil", "blue", 1, "น้ำเงิน 1 จุด"],
  ["1B", "แข็ง Hs90", "น้ำมันแร่", "Mineral oil", "blue", 2, "น้ำเงิน 2 จุด"],
  ["2", "", "น้ำมันเบนซิน", "Gasoline", "red", 1, "แดง 1 จุด"],
  ["3", "", "น้ำมันสัตว์/พืช *", "Animal & vegetable oil", "yellow", 1, "เหลือง 1 จุด"],
  ["4C", "", "ทนความร้อน", "Heat-resistant", "", 0, "ไม่มีจุดสี"],
  ["4D", "", "ทนความร้อน", "Heat-resistant", "green", 1, "เขียว 1 จุด"],
];
const cards2 = H.$("s2-v-cards");
const cardG = CL.map(([code, hs, th, en, col, n, ctext], i) => {
  const x = i % 2 ? 888 : 8, y = 96 + Math.floor(i / 2) * 214;
  const outer = H.el("g", { transform: `translate(${x} ${y})` }, cards2);
  const g = H.el("g", { id: `s2-v-c${i + 1}` }, outer);
  H.el("rect", { x: 0, y: 0, width: 864, height: 196, rx: 22, fill: "#fffdf8", stroke: "#d6cdb9", "stroke-width": 4 }, g);
  const Tr = H.orTorus(g, 140, 100, 92, 0.42, 24, { sw: 4 });
  const dots = n ? H.orDots(Tr, g, OR_DOT[col], n, 12) : [];
  H.text(g, 290, 96, code, { size: 78, fill: HC.ink });
  if (hs) H.text(g, 292, 152, hs, { size: 30, fill: "#59606a" });
  H.text(g, 470, 78, th, { size: 42, fill: HC.ink });
  H.text(g, 470, 118, en, { size: 28, fill: "#59606a", weight: 600 });
  // colour legend: swatch dot(s) + words
  const lg = H.el("g", {}, g);
  if (n) for (let k = 0; k < n; k++) H.el("circle", { cx: 484 + k * 28, cy: 164, r: 11, fill: OR_DOT[col], stroke: HC.ink, "stroke-width": 2 }, lg);
  else H.el("circle", { cx: 484, cy: 164, r: 11, fill: "none", stroke: "#59606a", "stroke-width": 3, "stroke-dasharray": "5 4" }, lg);
  H.text(lg, 476 + Math.max(n, 1) * 28 + 8, 175, ctext, { size: 32, fill: HC.ink });
  return { g, dots, lg };
});

// timing: chips with segment 1, cards as each class is named
[0, 1, 2].forEach((i) => tl.fromTo(`#s2-v-chip${i + 1}`, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, at2(0, 0.12 + i * 0.2)));
const when = [at2(1, 0.12), at2(1, 0.62), at2(2, 0.0), at2(2, 0.42), at2(3, 0.22), at2(3, 0.48)];
cardG.forEach((C, i) => {
  tl.fromTo(C.g, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, when[i]);
  if (C.dots.length) tl.fromTo(C.dots, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(3)", stagger: 0.15 }, when[i] + 0.35);
  tl.fromTo(C.lg, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3 }, when[i] + 0.45);
});
tl.fromTo("#s2-v-other", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.35 }, at2(3, 0.72));
