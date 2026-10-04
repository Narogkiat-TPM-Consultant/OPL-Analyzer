// Cause map (OPL 5-B-2, "Large vibrating pressure / Huge noise"): the pump unit on the left, four cause groups
// light up on it in step with the narration, and a card per group on the right gives cause → countermeasure in
// the deck's wording. On the drawing each cause is shown happening:
//  ① suction side: strainer clogs · suction tube "too thin" · joint seal leaks
//  ② tank: air breather clogs · oil level drops · return outlet ends above the oil and splashes bubbles in
//  ③ oil: viscosity (oil turns darker/thicker)
//  ④ pump + coupling: coupling wobbles (misalignment) · RPM too high · shaft seal draws air
const c = T.cues;
const f = H.f;
const OXs = 10, OYs = 24; // station offset inside the 1760 × 740 view
const S = H.pumpStation("s4-v-st", "s4-v-s", { labels: ["gauge", "breather", "strainer", "suction", "return", "level", "circuit"],
  lpos: { breather: [150, 326, "end"], strainer: [246, 592, "start"], suction: [220, 494, "start", "ท่อดูด"] }, transform: `translate(${OXs} ${OYs})` });
const hl = H.el("g", { transform: `translate(${OXs} ${OYs})` }, "s4-v-hl");
H.hydFlow(S.flows, b + 0.3, D - 0.3);
const show = (el, t, d = 0.35) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: d }, b + t);

// timing (seconds from scene start), from the narration segments
const TT = {
  g1: c[0] + 1.0, strainer: c[0] + 1.8, thin: c[0] + 2.55, seal: c[0] + 3.45,
  g2: c[1] + 0.3, breather: c[1] + 0.8, level: c[1] + 1.6, ret: c[1] + 2.1,
  g3: c[2] + 0.15, visc: c[2] + 0.6,
  g4: c[3] + 0.35, cpl: c[3] + 0.75, rpm: c[3] + 1.6, sseal: c[3] + 2.05,
};

// ---- group boxes + number badges on the drawing
const box = (id, rects, badges) => {
  const g = H.el("g", { id, opacity: 0 }, hl);
  for (const [x, y, w, h] of rects) H.el("rect", { x, y, width: w, height: h, rx: 16, fill: "rgba(31,95,191,0.07)", stroke: PC.blue, "stroke-width": 4, "stroke-dasharray": "13 9" }, g);
  for (const [x, y, n] of badges) {
    H.el("circle", { cx: x, cy: y, r: 21, fill: PC.blue, stroke: "#ffffff", "stroke-width": 3 }, g);
    H.text(g, x, y + 9, String(n), { size: 26, anchor: "middle", fill: "#ffffff" });
  }
  return g;
};
const B1 = box("s4-v-b1", [[150, 362, 192, 252]], [[150, 452, 1]]);
const B2 = box("s4-v-b2", [[78, 340, 64, 56], [640, 404, 300, 210]], [[56, 368, 2], [940, 404, 2]]);
const B3 = box("s4-v-b3", [[354, 452, 276, 160]], [[405, 452, 3]]);
const B4 = box("s4-v-b4", [[166, 248, 520, 110]], [[166, 248, 4]]);

// ---- cards (cause → countermeasure, deck wording)
const cards = H.$("s4-v-cards");
const CX = 1118, CW = 630, LH = 40;
const cardDefs = [
  { n: 1, title: "ด้านดูด (Suction side)", lines: [
    ["Strainer / ท่อดูดตัน", "→ ทำความสะอาด", TT.strainer],
    ["ท่อดูดเล็ก + ยาวเกิน", "→ เปลี่ยนท่อ", TT.thin],
    ["ซีลท่อดูดเสีย", "→ ซ่อมเกลียว / Packing", TT.seal]], t: TT.g1 },
  { n: 2, title: "ถังน้ำมัน (Tank) — ฟองอากาศ", lines: [
    ["Air breather ตัน", "→ ทำความสะอาด", TT.breather],
    ["น้ำมันต่ำ", "→ เติมถึงระดับมาตรฐาน", TT.level],
    ["ฟองในถัง: ท่อกลับไหลแรง", "→ วางใต้ผิวน้ำมัน", TT.ret]], t: TT.g2 },
  { n: 3, title: "น้ำมัน (Oil)", lines: [
    ["ความหนืดสูงเกิน", "→ เปลี่ยนให้ถูกความหนืด", TT.visc]], t: TT.g3 },
  { n: 4, title: "ปั๊ม + Coupling", lines: [
    ["Coupling มีเสียง", "→ ตั้งศูนย์ใหม่ (Centering)", TT.cpl],
    ["รอบเกินกำหนด", "→ เดินในรอบที่กำหนด", TT.rpm],
    ["Shaft seal ดูดอากาศ", "→ เปลี่ยน Shaft seal", TT.sseal]], t: TT.g4 },
];
let y = 14;
for (const d of cardDefs) {
  const h = 58 + d.lines.length * LH + 12;
  const g = H.el("g", { id: `s4-v-c${d.n}`, opacity: 0 }, cards);
  H.el("rect", { x: CX, y, width: CW, height: h, rx: 18, fill: PC.paper, stroke: "#d6cfbf", "stroke-width": 3 }, g);
  H.el("circle", { cx: CX + 34, cy: y + 31, r: 20, fill: PC.blue }, g);
  H.text(g, CX + 34, y + 40, String(d.n), { size: 26, anchor: "middle", fill: "#ffffff" });
  H.text(g, CX + 66, y + 41, d.title, { size: 30, fill: PC.blue });
  show(g, d.t);
  d.lines.forEach(([cause, act, t], i) => {
    const ly = y + 58 + i * LH + 28;
    const tx = H.el("text", { id: `s4-v-c${d.n}l${i}`, x: CX + 30, y: ly, class: "svg-label", "font-size": 27, "font-weight": 600, fill: PC.ink, opacity: 0 }, g);
    const t1 = H.el("tspan", {}, tx); t1.textContent = "• " + cause + " ";
    const t2 = H.el("tspan", { fill: PC.blue, "font-weight": 800 }, tx); t2.textContent = act;
    tl.fromTo(tx, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.3 }, b + t);
  });
  y += h + 12;
}

// ---- ① suction side
show(B1, TT.g1);
tl.fromTo(S.clog, { opacity: 0 }, { opacity: 0.8, duration: 0.7 }, b + TT.strainer);
tl.to("#s4-v-s-suc", { attr: { "stroke-width": 6 }, duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.6 }, b + TT.thin);
H.ring(hl, "s4-v-r1", 210, 373, 26, b + TT.seal, 3);

// ---- ② tank: breather clogs, level drops, the return outlet splashes bubbles into the oil
show(B2, TT.g2);
tl.fromTo(S.bclog, { opacity: 0 }, { opacity: 0.8, duration: 0.6 }, b + TT.breather);
H.psLevel(S, PS.low, b + TT.level, 0.9);
const jet = H.el("path", { id: "s4-v-jet", d: "M 690 500 L 690 520", fill: "none", stroke: "#d9a21b", "stroke-width": 8, opacity: 0 }, hl);
show(jet, TT.level + 0.8, 0.2);
const bub = H.el("g", { id: "s4-v-bub" }, hl);
for (let i = 0; i < 16; i++) {
  const t0 = TT.ret + 0.15 + i * 0.28, life = 1.5;
  if (t0 + 0.3 > D) break;
  const dx = -40 - 30 * Math.sin(i * 2.1), dy = 30 + 25 * Math.cos(i * 1.7), r = 5 + (i % 3) * 1.5;
  const el = H.el("circle", { cx: 690, cy: 528, r, fill: "#ffffff", stroke: PC.blue, "stroke-width": 2.5, opacity: 0 }, bub);
  tl.fromTo(el, { opacity: 1, x: 0, y: 0 }, { opacity: 0, x: dx, y: dy, duration: Math.min(life, D - t0), ease: "power1.out" }, b + t0);
}

// ---- ③ oil viscosity: the oil turns darker (thicker)
show(B3, TT.g3);
tl.to([S.oil, S.glass], { fill: "#d99a14", duration: 0.8 }, b + TT.visc);

// ---- ④ pump + coupling: coupling wobbles, RPM marker spins fast, shaft seal ring
show(B4, TT.g4);
H.fnTo(S.cpl, "rotation", (t) => 6 * H.env(t, b + TT.cpl, b + D - 0.2, 0.3) * Math.sin(2 * Math.PI * 3.2 * (t - b)), b + TT.cpl, b + D - 0.1, { extra: { svgOrigin: "312 312" } });
const rpm = H.el("g", { id: "s4-v-rpm", opacity: 0 }, hl);
const spin = H.el("g", {}, rpm);
for (const [col, w] of [["#ffffff", 10], [PC.ink, 5]]) {
  H.el("path", { d: H.arcD(600, 300, 24, -60, 215), fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" }, spin);
}
{
  const pt = (a) => [600 + 24 * Math.cos((a * Math.PI) / 180), 300 + 24 * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = pt(200), [x1, y1] = pt(222);
  for (const [col, w] of [["#ffffff", 10], [PC.ink, 5]])
    H.el("path", { d: H.arrowD(x0, y0, x1, y1, 13), fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, spin);
}
H.text(rpm, 632, 309, "RPM", { size: 22, anchor: "start" });
show(rpm, TT.rpm);
tl.fromTo(spin, { rotation: 0, svgOrigin: "600 300" }, { rotation: 360 * Math.round((D - TT.rpm) * 2.5), svgOrigin: "600 300", duration: D - TT.rpm, ease: "none" }, b + TT.rpm);
H.ring(hl, "s4-v-r4", 290, 312, 22, b + TT.sseal, 3);
