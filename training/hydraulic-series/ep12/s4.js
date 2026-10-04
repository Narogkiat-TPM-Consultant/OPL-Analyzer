// Causes 4–5: the plunger cannot close its gap to the iron core.
// ④ a + b ON together: both coils pull, the spool is pushed from both sides and stays in the centre → both gaps stay open.
// ⑤ spool defect: only a is ON, the spool stops part-way (red cross on the land) → gap a stays open.
// General rule (AC coil): plunger not closed → current stays at the high inrush level → the coil overheats (graph).
const art = H.$("s4-v-art");
const C = V12, c = T.cues, f = H.f;
const VX = 112, VY = 64, VS = 0.92;
const vg = H.el("g", { transform: `translate(${VX} ${VY}) scale(${VS})` }, art);
const V = H.v12Valve(vg, "s4-v-valve", { pills: "short" });
V.mid.setAttribute("fill", C.pr);
V.ports.P.setAttribute("fill", C.pr);

// labels under each solenoid: plunger / core, and "gap stays open"
const lab = H.el("g", { opacity: 0 }, vg);
H.el("path", { d: "M 22 302 L 78 186", fill: "none", stroke: C.muted, "stroke-width": 3 }, lab);
H.el("path", { d: "M 150 302 L 159 186", fill: "none", stroke: C.muted, "stroke-width": 3 }, lab);
H.text(lab, 22, 332, "Plunger", { size: 26, anchor: "middle", fill: C.muted });
H.text(lab, 150, 332, "Core", { size: 26, anchor: "middle", fill: C.muted });
const gapLab = {};
for (const [side, x] of [["a", 121], ["b", 769]]) {
  gapLab[side] = H.el("g", { opacity: 0 }, vg);
  H.text(gapLab[side], x, -18, "Gap ค้าง", { size: 30, anchor: "middle", fill: C.red });
  H.el("path", { d: H.arrowD(x, -10, x, 128, 16), fill: "none", stroke: C.red, "stroke-width": 4 }, gapLab[side]);
}

// opposing push arrows (a + b ON)
const opp = H.el("g", { opacity: 0 }, vg);
H.el("path", { d: H.arrowD(232, 4, 322, 4, 18), fill: "none", stroke: C.red, "stroke-width": 7 }, opp);
H.el("path", { d: H.arrowD(658, 4, 568, 4, 18), fill: "none", stroke: C.red, "stroke-width": 7 }, opp);

// spool stuck: red cross on land B
const stuck = H.el("g", { opacity: 0 }, vg);
H.v12Cross(stuck, 565, 160, 26, { w: 8 });

// --- current graph (general rule, no numbers)
const gr = H.el("g", { opacity: 0 }, art);
const GX = 150, GY = 610, GW = 520, GH = 200; // origin bottom-left
H.el("path", { d: `M ${GX} ${GY - GH - 10} L ${GX} ${GY} L ${GX + GW + 10} ${GY}`, fill: "none", stroke: C.ink, "stroke-width": 4 }, gr);
H.v12Head(gr, GX, GY - GH - 22, "up", { fill: C.ink, len: 16, w: 8, sw: 1 });
H.v12Head(gr, GX + GW + 22, GY, "right", { fill: C.ink, len: 16, w: 8, sw: 1 });
H.text(gr, GX - 14, GY - GH + 4, "กระแส", { size: 26, anchor: "end" });
H.text(gr, GX + GW + 34, GY + 9, "เวลา", { size: 24, anchor: "start", fill: C.muted });
H.text(gr, GX + 44, GY - GH + 14, "Inrush (กระแสตอนเริ่มดูด)", { size: 24, anchor: "start", fill: C.muted });
const yHi = GY - GH + 30, yLo = GY - 50;
const ok = H.el("path", { d: `M ${GX + 4} ${GY - 4} L ${GX + 16} ${yHi} C ${GX + 50} ${yHi} ${GX + 70} ${yLo} ${GX + 130} ${yLo} L ${GX + GW} ${yLo}`, fill: "none", stroke: C.green, "stroke-width": 7, "stroke-linejoin": "round" }, gr);
const ng = H.el("path", { d: `M ${GX + 4} ${GY - 4} L ${GX + 16} ${yHi} L ${GX + GW} ${yHi + 6}`, fill: "none", stroke: C.red, "stroke-width": 7, "stroke-linejoin": "round" }, gr);
const okT = H.text(gr, GX + GW + 34, yLo + 10, "ดูดสุด → กระแสลด", { size: 28, anchor: "start", fill: C.green });
const ngT = H.text(gr, GX + GW + 34, yHi + 14, "ดูดไม่สุด → สูงค้าง", { size: 28, anchor: "start", fill: C.red });
okT.setAttribute("opacity", 0); ngT.setAttribute("opacity", 0);

// ---- timeline
const t4 = c[0], t5 = c[1], tg = c[2];
H.v12Op(lab, 0, 1, b + 0.5, 0.3);
// ④ a + b ON
V.coil("a", true, b + t4 + 0.6);
V.coil("b", true, b + t4 + 0.6);
H.v12Op(opp, 0, 1, b + t4 + 1.0, 0.3);
tl.fromTo(V.spool, { x: 0 }, { x: 3, duration: 0.06, yoyo: true, repeat: 11, ease: "none", immediateRender: false }, b + t4 + 1.0);
H.v12Op(V.gap.a, 0, 0.6, b + t4 + 1.8, 0.3);
H.v12Op(V.gap.b, 0, 0.6, b + t4 + 1.8, 0.3);
H.v12Op(gapLab.a, 0, 1, b + t4 + 1.9, 0.3);
H.v12Op(gapLab.b, 0, 1, b + t4 + 1.9, 0.3);
V.heat("a", 0, 1, b + t4 + 2.4, 1.6);
V.heat("b", 0, 1, b + t4 + 2.4, 1.6);
// reset before ⑤
const r = b + t5 - 0.15;
V.coil("a", false, r);
V.coil("b", false, r);
H.v12Op(opp, 1, 0, r, 0.25);
V.heat("a", 1, 0, r, 0.5);
V.heat("b", 1, 0, r, 0.5);
H.v12Op(V.gap.b, 0.6, 0, r, 0.3);
H.v12Op(gapLab.b, 1, 0, r, 0.3);
// ⑤ spool defect: a ON, spool stops at 35 % of its stroke
V.coil("a", true, b + t5 + 0.5);
V.shift(0, 0.35, b + t5 + 0.8, 0.5, "power2.out");
tl.fromTo(V.spool, { x: 0.35 * C.s }, { x: 0.35 * C.s + 3, duration: 0.06, yoyo: true, repeat: 7, ease: "none", immediateRender: false }, b + t5 + 1.35);
H.v12Op(stuck, 0, 1, b + t5 + 1.4, 0.25);
V.heat("a", 0, 1, b + t5 + 1.8, 1.4);
// general rule: current graph
H.v12Op(gr, 0, 1, b + tg + 0.2, 0.3);
const draw = (p, t, dur) => { const L = p.getTotalLength(); tl.fromTo(p, { strokeDasharray: `${f(L)} ${f(L)}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease: "none" }, t); };
draw(ok, b + tg + 0.5, 1.4);
H.v12Op(okT, 0, 1, b + tg + 1.8, 0.3);
draw(ng, b + tg + 2.3, 1.4);
H.v12Op(ngT, 0, 1, b + tg + 3.6, 0.3);
const hw = H.el("g", {}, vg);
H.v12Heatwave(hw, 32, 64, b + tg + 2.6, b + D, { n: 2, gap: 18, h: 50 });
H.v12Smoke(vg, 145, 64, b + tg + 3.4, b + D, { n: 4, rise: 70, cycle: 1.6, r: 12 });
