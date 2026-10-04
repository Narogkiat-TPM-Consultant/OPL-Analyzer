// Method (OPL 5-C-2, p.18): the three start-up checks, cued with the narration.
// ① listen to the pump — it starts, runs quietly (soft blue waves, ear) and discharges (flow dashes, chip)
// ② the pressure gauge needle comes up to the set pressure (blue mark) — magnified inset
// ③ the filter indicator reads normal (green) — magnified inset
const S = H.suStation("s4-v-st", "s4-v-s", { labels: ["tank", "gauge", "filter", "circuit", "pump", "motor"], lpos: { filter: [870, 394, "middle", "ฟิลเตอร์"] } });
const fx = H.$("s4-v-fx");
const c = T.cues;
const t1 = b + c[0], t2 = b + c[1], t3 = b + c[2], tEnd = b + D;

// ① start-up at "หนึ่ง ฟังเสียงปั๊ม" (≈ 1.4 s into segment 1)
const tStart = t1 + 1.3;
SU.cplTurn(S, tStart, tEnd);
SU.flow(S.flowEls, tStart + 0.2, tEnd - tStart - 0.2);
const W = SU.waves(fx, "s4-v-w", 235, 300, -150, { r0: 66, dr: 16, n: 3, color: SC.blue, w: 5 });
SU.steady(W, tStart + 0.5, tEnd, 0.8, 0.9);
const ear = SU.ear(fx, "s4-v-ear", 84, 214, 0.72);
tl.fromTo(ear, { opacity: 0, scale: 0.6, svgOrigin: "84 214" }, { opacity: 1, scale: 1, svgOrigin: "84 214", duration: 0.4, ease: "back.out(2)" }, tStart + 0.1);
const quiet = SU.chip(fx, "s4-v-quiet", 84, 146, "เงียบ", { size: 26, anchor: "middle", color: SC.blue, stroke: SC.blue });
SU.show(quiet, tStart + 0.9);
const out = SU.chip(fx, "s4-v-out", 642, 246, "จ่ายน้ำมันออก →", { size: 24, anchor: "middle", color: SC.blue, stroke: SC.blue });
SU.show(out, t1 + 2.7);
const b1 = SU.badge(fx, "s4-v-b1", 292, 250, 1);
SU.show(b1, t1 + 0.1, 0.25);

// ② gauge: needle rises with the start-up and reaches the set mark while "ชี้ที่ค่าที่ตั้งไว้" is spoken
const inset = H.el("g", { id: "s4-v-gin", opacity: 0 }, fx);
H.el("circle", { cx: 420, cy: 128, r: 58, fill: "none", stroke: SC.blue, "stroke-width": 4 }, inset);
H.el("path", { d: "M 446 76 L 640 34 M 460 170 L 636 165", fill: "none", stroke: SC.blue, "stroke-width": 3, "stroke-dasharray": "9 7" }, inset);
const GI = SU.dial(inset, "s4-v-gi", 700, 104, 80, { set: 6, value: 0 });
H.el("circle", { cx: 700, cy: 104, r: 88, fill: "none", stroke: SC.blue, "stroke-width": 5 }, inset);
const setLab = SU.chip(inset, "s4-v-setl", 800, 52, "ค่าที่ตั้ง (Set pressure)", { size: 22, anchor: "start", color: SC.blue, stroke: SC.blue });
H.el("path", { d: "M 798 50 L 746 40", fill: "none", stroke: SC.blue, "stroke-width": 3 }, setLab);
SU.show(inset, t2 + 0.05);
SU.show(setLab, t2 + 0.6);
const val = (t) => {
  // 0 → 3.5 during the start-up, then up to the set value 6 shortly after point ② appears
  const u1 = Math.min(1, Math.max(0, (t - tStart - 0.3) / 1.2));
  const u2 = Math.min(1, Math.max(0, (t - t2 - 0.7) / 1.1));
  const e = (u) => 1 - (1 - u) * (1 - u);
  return 3.5 * e(u1) + 2.5 * e(u2);
};
H.fnTo(S.gauge.needle, "rotation", (t) => S.gauge.rot(val(t)), tStart, tEnd, { extra: { svgOrigin: S.gauge.origin } });
H.fnTo(GI.needle, "rotation", (t) => GI.rot(val(t)), tStart, tEnd, { extra: { svgOrigin: GI.origin } });
const b2 = SU.badge(fx, "s4-v-b2", 372, 80, 2);
SU.show(b2, t2 + 0.1, 0.25);

// ③ filter indicator: magnified, pointer settles in the green (normal) band
const fin = H.el("g", { id: "s4-v-fin", opacity: 0 }, fx);
H.el("circle", { cx: 870, cy: 296, r: 32, fill: "none", stroke: SC.blue, "stroke-width": 4 }, fin);
H.el("path", { d: "M 902 296 L 962 296 L 962 406", fill: "none", stroke: SC.blue, "stroke-width": 3, "stroke-dasharray": "9 7" }, fin);
H.el("rect", { x: 890, y: 406, width: 196, height: 200, rx: 16, fill: SC.paper, stroke: SC.blue, "stroke-width": 5 }, fin);
H.text(fin, 988, 442, "Filter indicator", { size: 23, anchor: "middle", fill: SC.blue });
const FI = SU.indicator(fin, "s4-v-fi", 988, 540, 74, { value: 0.3 });
H.text(fin, 930, 590, "ปกติ", { size: 22, anchor: "middle", fill: SC.green });
H.text(fin, 1046, 590, "ตัน", { size: 22, anchor: "middle", fill: SC.red });
SU.show(fin, t3 + 0.05);
for (const D_ of [S.ind, FI]) tl.fromTo(D_.needle, { rotation: D_.rot(0.3), svgOrigin: D_.origin }, { rotation: D_.rot(2.4), svgOrigin: D_.origin, duration: 0.9, ease: "back.out(1.6)" }, t3 + 0.5);
const b3 = SU.badge(fx, "s4-v-b3", 822, 290, 3);
SU.show(b3, t3 + 0.1, 0.25);
