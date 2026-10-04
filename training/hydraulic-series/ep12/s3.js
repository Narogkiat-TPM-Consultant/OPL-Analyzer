// Causes 1–3 (supply side): three icon tiles feed the cable to solenoid "a". Each cause, as it is named, sends
// current down the cable and heats the coil: ① voltmeter needle past the rated mark, ② ON–OFF pulses getting
// denser while the coil blinks, ③ coil plate 50 Hz ≠ supply 60 Hz.
const art = H.$("s3-v-art");
const C = V12, c = T.cues, f = H.f;

// --- valve (bottom)
const VX = 236, VY = 360, VS = 0.72;
const vg = H.el("g", { transform: `translate(${VX} ${VY}) scale(${VS})` }, art);
const V = H.v12Valve(vg, "s3-v-valve", { pills: "short" });
const sx = VX + 87.5 * VS; // solenoid a centre (scene x)
const sy = VY + 20 * VS;   // just above the pill

// --- cable bus: tiles → bus → solenoid a
const TX = [186, 550, 914], TY = 16, TW = 340, TH = 232, BUS = 300;
const cable = H.el("g", {}, art);
const cab = (d) => H.el("path", { d, fill: "none", stroke: C.muted, "stroke-width": 8, "stroke-linejoin": "round" }, cable);
cab(`M ${sx} ${sy} L ${sx} ${BUS} L ${TX[2]} ${BUS}`);
cab(`M ${TX[0]} ${BUS} L ${sx} ${BUS}`);
TX.forEach((x) => cab(`M ${x} ${TY + TH} L ${x} ${BUS}`));
const curD = (k) => `M ${TX[k]} ${TY + TH} L ${TX[k]} ${BUS} L ${f(sx)} ${BUS} L ${f(sx)} ${f(sy)}`;

// --- tiles
const tile = (k) => {
  const g = H.el("g", { transform: `translate(${TX[k] - TW / 2} ${TY})`, opacity: 0 }, art);
  H.el("rect", { x: 0, y: 0, width: TW, height: TH, rx: 18, fill: C.paper, stroke: C.ink, "stroke-width": 4 }, g);
  H.el("circle", { cx: 30, cy: 30, r: 22, fill: C.blue }, g);
  H.text(g, 30, 41, String(k + 1), { size: 30, anchor: "middle", fill: "#ffffff" });
  return g;
};
const T1 = tile(0), T2 = tile(1), T3 = tile(2);

// ① voltmeter: green rated band, needle swings past it
const mx = 170, my = 178, mr = 118;
const pol = (a, r) => [mx + r * Math.cos((a * Math.PI) / 180), my + r * Math.sin((a * Math.PI) / 180)];
H.el("path", { d: H.arcD(mx, my, mr, 200, 340), fill: "none", stroke: C.ink, "stroke-width": 5 }, T1);
H.el("path", { d: H.arcD(mx, my, mr - 12, 222, 282), fill: "none", stroke: C.green, "stroke-width": 18 }, T1);
H.el("path", { d: H.arcD(mx, my, mr - 12, 300, 338), fill: "none", stroke: C.red, "stroke-width": 18 }, T1);
for (let a = 200; a <= 340; a += 20) { const [x1, y1] = pol(a, mr), [x2, y2] = pol(a, mr - 26); H.el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: C.ink, "stroke-width": 3 }, T1); }
{ const [x, y] = pol(252, mr + 20); H.text(T1, x, y, "พิกัด", { size: 24, anchor: "middle", fill: C.green }); }
{ const [x, y] = pol(320, mr + 22); H.text(T1, x + 6, y + 4, "เกิน", { size: 24, anchor: "middle", fill: C.red }); }
H.text(T1, mx, my + 40, "V", { size: 34, anchor: "middle" });
const needle = H.el("path", { d: `M ${mx} ${my} L ${mx} ${my - mr + 22}`, stroke: C.ink, "stroke-width": 6, "stroke-linecap": "round" }, T1);
H.el("circle", { cx: mx, cy: my, r: 10, fill: C.ink }, T1);

// ② ON–OFF pulse train, pulses get shorter (switching more and more often)
const yH = 92, yL = 158, x0 = 74;
let d = `M ${x0} ${yL}`, x = x0 + 14, w = 30;
while (x + 2 * w <= 322) { d += ` L ${f(x)} ${yL} L ${f(x)} ${yH} L ${f(x + w)} ${yH} L ${f(x + w)} ${yL}`; x += 2 * w; w = Math.max(6, w * 0.78); }
d += ` L 322 ${yL}`;
H.text(T2, x0 - 8, yH + 9, "ON", { size: 24, anchor: "end" });
H.text(T2, x0 - 8, yL + 9, "OFF", { size: 24, anchor: "end" });
const wave = H.el("path", { d, fill: "none", stroke: C.blue, "stroke-width": 5, "stroke-linejoin": "miter", "stroke-linecap": "butt" }, T2);
H.text(T2, 200, 210, "เปิด–ปิด ถี่", { size: 26, anchor: "middle", fill: C.muted });

// ③ coil plate 50 Hz vs supply 60 Hz
const plate = (gx, top, big, col) => {
  H.el("rect", { x: gx, y: 64, width: 122, height: 118, rx: 10, fill: "#ffffff", stroke: C.ink, "stroke-width": 4 }, T3);
  H.text(T3, gx + 61, 104, top, { size: 24, anchor: "middle", fill: C.muted });
  return H.text(T3, gx + 61, 154, big, { size: 34, anchor: "middle", fill: col });
};
plate(28, "Coil", "50 Hz", C.ink);
plate(190, "ไฟจ่าย", "60 Hz", C.ink);
const neq = H.el("path", { d: "M 155 112 L 185 112 M 155 130 L 185 130 M 178 100 L 162 142", fill: "none", stroke: C.red, "stroke-width": 5, "stroke-linecap": "round", opacity: 0 }, T3);
H.text(T3, 170, 212, "ต่อสายไม่ตรงความถี่", { size: 24, anchor: "middle", fill: C.muted });

// --- heat label next to the coil
const hl = H.el("g", { opacity: 0 }, art);
H.text(hl, VX - 14, VY + 118, "Coil", { size: 28, anchor: "end", fill: C.hot });
H.text(hl, VX - 14, VY + 152, "ร้อนเกิน", { size: 28, anchor: "end", fill: C.hot });

// --- current pulses along the cable for cause k between t0 and t1
const flow = (k, t0, t1) => {
  const g = H.el("g", { opacity: 0 }, art);
  H.v12Run(g, [H.v12Flow(g, curD(k), { color: C.yel, w: 6, dash: "16 12" })], t0, t1, { per: 28, speed: 2.4 });
};
const hw = H.el("g", {}, vg);

// timeline: tiles appear with their cue, current flows, the coil heats, then cools before the next cause
const show = (g, t) => tl.fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false }, t);
const tA = c[1], tB = c[2], tC = c[3];
// ①
show(T1, b + tA);
tl.fromTo(needle, { rotation: -18, svgOrigin: `${mx} ${my}` }, { rotation: 52, svgOrigin: `${mx} ${my}`, duration: 1.0, ease: "power2.inOut" }, b + tA + 0.5);
flow(0, b + tA + 0.6, b + tB - 0.1);
V.heat("a", 0, 1, b + tA + 0.9, 1.0);
H.v12Op(hl, 0, 1, b + tA + 1.4, 0.3);
H.v12Op(hl, 1, 0, b + tB - 0.2, 0.3);
H.v12Heatwave(hw, 32, 64, b + tA + 1.4, b + tB - 0.1, { n: 2, gap: 18, h: 50 });
V.heat("a", 1, 0, b + tB - 0.2, 0.4);
// ②
show(T2, b + tB);
const WL = wave.getTotalLength();
tl.fromTo(wave, { strokeDasharray: `${f(WL)} ${f(WL)}`, strokeDashoffset: WL }, { strokeDashoffset: 0, duration: 1.4, ease: "none" }, b + tB + 0.4);
flow(1, b + tB + 0.4, b + tC - 0.1);
tl.fromTo(V.glow.a, { opacity: 0 }, { opacity: 1, duration: 0.07, yoyo: true, repeat: 9, ease: "none", immediateRender: false }, b + tB + 0.4);
V.heat("a", 0, 1, b + tB + 1.2, 0.8);
H.v12Op(hl, 0, 1, b + tB + 1.6, 0.3);
H.v12Op(hl, 1, 0, b + tC - 0.2, 0.3);
H.v12Heatwave(hw, 32, 64, b + tB + 1.5, b + tC - 0.1, { n: 2, gap: 18, h: 50 });
V.heat("a", 1, 0, b + tC - 0.2, 0.4);
// ③
show(T3, b + tC);
H.v12Op(neq, 0, 1, b + tC + 0.6, 0.2);
tl.fromTo(neq, { scale: 1.6, svgOrigin: "170 121" }, { scale: 1, svgOrigin: "170 121", duration: 0.35, ease: "back.out(2)", immediateRender: false }, b + tC + 0.6);
flow(2, b + tC + 0.6, b + D - 0.1);
V.heat("a", 0, 1, b + tC + 1.0, 1.0);
H.v12Op(hl, 0, 1, b + tC + 1.4, 0.3);
H.v12Heatwave(hw, 32, 64, b + tC + 1.3, b + D, { n: 2, gap: 18, h: 50 });
H.v12Smoke(vg, 145, 64, b + tC + 1.8, b + D, { n: 4, rise: 80, cycle: 1.6, r: 13 });
