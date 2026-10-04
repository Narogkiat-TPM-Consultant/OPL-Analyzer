// Sound map (OPL 5-C-2 p.18, table "Types of abnormal sound of hydraulic device"): three pump-side sounds,
// each pinned to its source on the unit with its tone written in Thai + the deck's spelling.
//  1 Cavitation "Ga-……" (continuous): waves pulse steadily at the pump; the suction strainer clogs; the oil
//    turns dark/thick (low oil temperature = viscosity too high)
//  2 Air sound "plock, plock……" (intermittent): bursts at the suction-tube joint, bubbles drawn in; oil level drops
//  3 Coupling "Cata, Cata……" (continuous): the coupling wobbles (centering defect), waves below it
const c = T.cues;
const L = [c[1] - c[0] - 0.3, c[2] - c[1] - 0.3, D - 0.8 - c[2]]; // segment lengths
const at = (k, fr) => b + c[k] + L[k] * fr; // absolute time at a fraction of segment k
const tEnd = b + D;
const OX = 10, OY = 40;
const S = H.suStation("s6-v-st", "s6-v-s", { labels: ["tank", "strainer", "level", "pump", "motor", "circuit"], lpos: { strainer: [164, 578, "end"] }, transform: `translate(${OX} ${OY})` });
gsap.set(S.gauge.needle, { rotation: S.gauge.rot(6), svgOrigin: S.gauge.origin }); // running at the set pressure
const fx = H.el("g", { transform: `translate(${OX} ${OY})` }, "s6-v-fx");
SU.cplTurn(S, b, tEnd);
SU.flow(S.flowEls, b + 0.2, D - 0.2);

// tag on the drawing: number badge + tone text (starts hidden)
const tag = (id, x, y, n, str) => {
  const g = H.el("g", { id, opacity: 0 }, fx);
  const size = 26, w = str.replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "").length * size * 0.55 + 58, h = 48;
  H.el("rect", { x: H.f(x - w / 2), y: y - h / 2, width: H.f(w), height: h, rx: 25, fill: SC.paper, stroke: SC.blue, "stroke-width": 3.5 }, g);
  H.el("circle", { cx: H.f(x - w / 2 + 24), cy: y, r: 16, fill: SC.blue }, g);
  H.text(g, x - w / 2 + 24, y + 8, String(n), { size: 21, anchor: "middle", fill: "#ffffff" });
  H.text(g, x - w / 2 + 46, y + 9, str, { size, anchor: "start", fill: SC.blue });
  return g;
};
const pop = (el, t) => tl.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, t);

// ---- 1 Cavitation (continuous) at the pump
const tg1 = tag("s6-v-t1", 112, 198, 1, "ก้า…");
pop(tg1, at(0, 0.16));
const W1 = SU.waves(fx, "s6-v-w1", 235, 312, -150, { r0: 66, dr: 16, n: 3, w: 6 });
SU.steady(W1, at(0, 0.18), b + c[1], 0.5, 1);
tl.fromTo(S.clog, { opacity: 0 }, { opacity: 0.78, duration: 0.6 }, at(0, 0.58));
SU.ring(fx, "s6-v-r1", 210, 570, 40, at(0, 0.58), 2);
tl.to([S.oil, S.glass], { fill: SC.thick, duration: 0.8 }, at(0, 0.8));
const cold = SU.chip(fx, "s6-v-cold", 600, 520, "น้ำมันเย็น · หนืด", { size: 24, anchor: "middle", color: SC.blue, stroke: SC.blue });
SU.show(cold, at(0, 0.8));

// ---- 2 Air sound (intermittent) at the suction-tube joint
const tg2 = tag("s6-v-t2", 90, 302, 2, "ป๊อก ป๊อก");
pop(tg2, at(1, 0.03));
const W2 = SU.waves(fx, "s6-v-w2", 210, 376, 180, { r0: 24, dr: 13, n: 3, w: 5, span: 40 });
SU.bursts(W2, at(1, 0.06), b + c[2], 0.9);
const bub = H.el("g", { id: "s6-v-bub" }, fx);
for (let i = 0; i < 9; i++) {
  const t = at(1, 0.4) + i * 0.38;
  if (t + 0.9 > tEnd) break;
  const e = H.el("circle", { cx: 246, cy: 372, r: 5.5, fill: "#ffffff", stroke: SC.blue, "stroke-width": 2.5, opacity: 0 }, bub);
  tl.fromTo(e, { opacity: 1, x: 0, y: 0 }, { x: -36, duration: 0.35, ease: "power1.in", immediateRender: false }, t);
  tl.fromTo(e, { x: -36, y: 0 }, { y: -40, duration: 0.4, ease: "none", immediateRender: false }, t + 0.35);
  tl.fromTo(e, { opacity: 1 }, { opacity: 0, duration: 0.1, immediateRender: false }, t + 0.72);
}
SU.ring(fx, "s6-v-r2", 210, 373, 24, at(1, 0.4), 2);
SU.level(S, SL.low, at(1, 0.78), 0.9);
{
  const r = H.el("rect", { id: "s6-v-r2b", x: 781, y: 412, width: 42, height: 196, rx: 14, fill: "none", stroke: SC.blue, "stroke-width": 5, opacity: 0 }, fx);
  tl.fromTo(r, { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 5 }, at(1, 0.8));
}

// ---- 3 Coupling (continuous): the coupling wobbles
const tg3 = tag("s6-v-t3", 280, 182, 3, "กะตะ กะตะ");
pop(tg3, at(2, 0.03));
H.el("path", { id: "s6-v-l3", d: "M 300 206 L 310 288", fill: "none", stroke: SC.blue, "stroke-width": 3, opacity: 0 }, fx);
SU.show("#s6-v-l3", at(2, 0.03));
const W3 = SU.waves(fx, "s6-v-w3", 312, 318, 90, { r0: 26, dr: 13, n: 3, w: 5, span: 32 });
SU.steady(W3, at(2, 0.1), tEnd, 0.4, 1);
H.fnTo(S.cpl, "rotation", (t) => 7 * H.env(t, at(2, 0.1), tEnd - 0.1, 0.3) * Math.sin(2 * Math.PI * 3.2 * (t - b)), at(2, 0.1), tEnd, { extra: { svgOrigin: "312 312" } });

// ---- cards (right): tone big, sound type + classification, presumed causes (deck wording)
const cards = H.$("s6-v-cards");
const CX = 1128, CW = 618, CH = 196, GAP = 14;
const defs = [
  { n: 1, tone: "ก้า… (Ga)", kind: "Cavitation · เสียงโพรงอากาศ", cls: "ต่อเนื่อง", t: at(0, 0.16),
    lines: [["Suction filter ตัน · ท่อดูดเล็ก / ยาว", at(0, 0.58)], ["น้ำมันเย็น → หนืดเกิน (Low oil temp)", at(0, 0.8)]] },
  { n: 2, tone: "ป๊อก ป๊อก (plock)", kind: "Air sound · เสียงอากาศ", cls: "เป็นช่วงๆ", t: at(1, 0.03),
    lines: [["อากาศรั่วเข้าที่ข้อต่อท่อ · Oil seal ปั๊มสึก", at(1, 0.4)], ["น้ำมันขาด (Out of oil) · ท่อกลับผิดปกติ", at(1, 0.78)]] },
  { n: 3, tone: "กะตะ กะตะ (Cata)", kind: "Coupling · เสียงคัปปลิ้ง", cls: "ต่อเนื่อง", t: at(2, 0.03),
    lines: [["เยื้องศูนย์ (Centering) · Key สึก", at(2, 0.45)], ["ขาดจาระบี · โซ่ (Chain) สึก", at(2, 0.72)]] },
];
defs.forEach((d, i) => {
  const y = 44 + i * (CH + GAP);
  const g = H.el("g", { id: `s6-v-c${d.n}`, opacity: 0 }, cards);
  H.el("rect", { x: CX, y, width: CW, height: CH, rx: 18, fill: SC.paper, stroke: "#d6cfbf", "stroke-width": 3 }, g);
  H.el("circle", { cx: CX + 36, cy: y + 38, r: 21, fill: SC.blue }, g);
  H.text(g, CX + 36, y + 47, String(d.n), { size: 26, anchor: "middle", fill: "#ffffff" });
  H.text(g, CX + 70, y + 50, d.tone, { size: 36, fill: SC.blue });
  const cw = [...d.cls].length * 22 * 0.5 + 34;
  H.el("rect", { x: H.f(CX + CW - 20 - cw), y: y + 20, width: H.f(cw), height: 38, rx: 19, fill: "none", stroke: SC.muted, "stroke-width": 2.5 }, g);
  H.text(g, CX + CW - 20 - cw / 2, y + 46, d.cls, { size: 22, anchor: "middle", fill: SC.muted });
  H.text(g, CX + 30, y + 96, d.kind, { size: 26, fill: SC.ink });
  tl.fromTo(g, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, d.t);
  d.lines.forEach(([s, t], k) => {
    const tx = H.text(g, CX + 30, y + 138 + k * 40, "• " + s, { size: 26, fill: SC.muted, id: `s6-v-c${d.n}l${k}` });
    tl.fromTo(tx, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.3 }, t);
  });
});
