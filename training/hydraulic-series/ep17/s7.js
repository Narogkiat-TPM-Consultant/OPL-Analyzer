// Why < 55 °C: the oil-temperature zones of OPL 5-C-7 on a thermometer (linear scale 0–100 °C).
// The column rises through the zones with the narration; in the limit area every +8 °C halves the oil life.
const c = T.cues;
const th = H.$("s7-v-th"), fx = H.$("s7-v-fx");
const Y = (t) => 640 - 5.6 * t;                 // °C → y
const XT = 230, TW = 56, X0 = 300, X1 = 1130;    // tube centre / width, zone band x-range
const zones = [
  // [from, to, fill, name, note]
  [0, 20, "#dce8f7", "ต่ำ (Low)", "อันตรายตอนสตาร์ท"],
  [20, 30, "#e9f0f8", "Normal temp. (อุณหภูมิห้อง)", "หนืด → ประสิทธิภาพลด"],
  [30, 46, "#d8efe0", "เหมาะสม (Ideal)", ""],
  [46, 55, "#e6f4ea", "ปลอดภัย (Safety)", ""],
  [55, 65, "#fdf0c8", "เตือน (Warning)", "ต้องมี Oil cooler"],
  [65, 80, "#fbdcc4", "ขีดจำกัด (Limit)", "อายุน้ำมันสั้น"],
  [80, 100, "#f6c9cf", "อันตราย (Dangerous)", "ห้ามใช้"],
];
const zg = zones.map(([t0, t1, fill, name, note], i) => {
  const g = H.el("g", { id: `s7-v-z${i}`, opacity: 0 }, th);
  const y0 = Y(t1), y1 = Y(t0), ym = (y0 + y1) / 2;
  H.el("rect", { x: X0, y: H.f(y0), width: X1 - X0, height: H.f(y1 - y0), fill, stroke: "#ffffff", "stroke-width": 3 }, g);
  H.text(g, X0 + 24, ym + 11, name, { size: 30 });
  if (note) H.text(g, X1 - 22, ym + 11, note, { size: 28, anchor: "end", fill: i >= 4 ? "#7a2d14" : TC.muted, weight: 700 });
  return g;
});
// bracket: 30–55 °C "adjust to a suitable temperature in between"
const br = H.el("g", { opacity: 0 }, th);
H.el("path", { d: `M ${X1 + 14} ${Y(55)} L ${X1 + 30} ${Y(55)} L ${X1 + 30} ${Y(30)} L ${X1 + 14} ${Y(30)}`, fill: "none", stroke: TC.green, "stroke-width": 5 }, br);
H.text(br, X1 + 46, (Y(55) + Y(30)) / 2 - 6, "ปรับอุณหภูมิให้", { size: 28, fill: TC.green });
H.text(br, X1 + 46, (Y(55) + Y(30)) / 2 + 30, "อยู่ในช่วงนี้", { size: 28, fill: TC.green });

// thermometer: scale numbers, tube, bulb, column
for (const t of [20, 30, 46, 55, 65, 80, 100]) {
  H.text(th, XT - TW / 2 - 18, Y(t) + 10, String(t), { size: 30, anchor: "end" });
  H.el("line", { x1: XT - TW / 2 - 10, y1: Y(t), x2: XT - TW / 2, y2: Y(t), stroke: TC.ink, "stroke-width": 3 }, th);
}
H.text(th, XT, 40, "°C", { size: 30, anchor: "middle" });
H.el("rect", { x: XT - TW / 2, y: Y(100) - 14, width: TW, height: Y(0) - Y(100) + 30, rx: TW / 2, fill: TC.paper, stroke: TC.ink, "stroke-width": 5 }, th);
H.el("circle", { cx: XT, cy: 676, r: 44, fill: TC.red, stroke: TC.ink, "stroke-width": 5 }, th);
const col = H.el("rect", { id: "s7-v-col", x: XT - 12, y: H.f(Y(20)), width: 24, height: H.f(676 - Y(20)), fill: TC.red }, th);
H.el("circle", { cx: XT, cy: 676, r: 39, fill: TC.red }, th);
const colTo = (t, at, dur = 0.9) => tl.to(col, { attr: { y: Y(t), height: 676 - Y(t) }, duration: dur, ease: "power1.inOut" }, at);

// daily-check line at 55 °C
const chk = H.el("g", { opacity: 0 }, fx);
H.el("path", { d: `M ${XT + TW / 2} ${Y(55)} L ${X1} ${Y(55)}`, fill: "none", stroke: TC.ink, "stroke-width": 5, "stroke-dasharray": "16 10" }, chk);
H.t17Lab(chk, "s7-v-lchk", X1 + 30, Y(55) - 50, "ตรวจประจำวัน: < 55 °C", { size: 28, anchor: "start", shown: true, fill: TC.paper });

// oil-life bar (relative): halves at each +8 °C step in the limit area
const LX = 1220, LY = 120, LW = 480;
const life = H.el("g", { opacity: 0 }, fx);
H.text(life, LX, LY - 18, "อายุน้ำมัน (Oil life)", { size: 30 });
H.el("rect", { x: LX, y: LY, width: LW, height: 46, rx: 8, fill: TC.paper, stroke: TC.ink, "stroke-width": 4 }, life);
const bar = H.el("rect", { x: LX + 4, y: LY + 4, width: LW - 8, height: 38, rx: 5, fill: TC.green }, life);
const steps = [["+8 °C → ½", 0.5], ["+8 °C → ¼", 0.25]].map(([s], i) => {
  const t = H.text(life, LX, LY + 96 + 44 * i, s, { size: 30, fill: "#7a2d14" });
  t.setAttribute("opacity", 0);
  return t;
});

// timeline
const t0 = b + 0.3;
zg.forEach((g, i) => tl.fromTo(g, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.3, immediateRender: false }, t0 + 0.12 * i));
tl.fromTo(br, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t0 + 1.0);
colTo(42, t0 + 0.6, 0.9);
// seg 1: above 55 °C → warning, oil cooler
tl.fromTo(chk, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + c[0]);
colTo(60, b + c[0] + 0.5, 1.0);
tl.fromTo(zg[4], { scale: 1 }, { scale: 1.03, svgOrigin: `${(X0 + X1) / 2} ${(Y(55) + Y(65)) / 2}`, duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, b + c[0] + 1.5);
// seg 2: limit area — each +8 °C halves the oil life; above 80 °C never use
tl.fromTo(life, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + c[1]);
colTo(65, b + c[1] + 0.1, 0.4);
colTo(73, b + c[1] + 0.8, 0.8);
tl.to(bar, { attr: { width: (LW - 8) * 0.5 }, duration: 0.6, ease: "power2.out" }, b + c[1] + 1.6);
tl.to(bar, { attr: { fill: TC.warn }, duration: 0.4 }, b + c[1] + 1.6);
tl.fromTo(steps[0], { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + c[1] + 1.6);
colTo(81, b + c[1] + 2.4, 0.8);
tl.to(bar, { attr: { width: (LW - 8) * 0.25, fill: TC.red }, duration: 0.6, ease: "power2.out" }, b + c[1] + 3.2);
tl.fromTo(steps[1], { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + c[1] + 3.2);
H.t17Ring(fx, "s7-v-rdng", X1 - 69, (Y(80) + Y(100)) / 2, 54, b + c[1] + 3.7, 2, TC.red);
