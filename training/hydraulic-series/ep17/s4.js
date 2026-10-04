// Method: the four easy checks on the tank, each with a magnified inset that opens with its narration segment.
//  1 level — the pump runs (level low in the meter), stops → the oil comes back up to the upper-limit mark = OK
//  2 colour in the level meter — new oil clear / colourless → brown (deteriorating) → black?
//  3 air breather — is the air-filter element dirty?
//  4 oil temperature — dial below 55 °C; the palm can stay on the tank 3–4 s or more
const c = T.cues;
const TX = 5, TY = 240, SC = 0.72;
const S = H.t17Unit("s4-v-unit", "s4-v-u", { transform: `translate(${TX} ${TY}) scale(${SC})` });
const fx = H.$("s4-v-fx");
const pg = (lx, ly) => [TX + SC * lx, TY + SC * ly];
const badge = (par, x, y, n) => {
  H.el("circle", { cx: x, cy: y, r: 19, fill: TC.blue }, par);
  H.text(par, x, y + 9, String(n), { size: 25, anchor: "middle", fill: "#ffffff" });
};
const swap = (a, bEl, t) => { H.t17Hide(a, t, 0.25); H.t17Show(bEl, t, 0.25); };

// ---- 1 + 2: level meter inset (top-left) ------------------------------------------------------------------
const tA = b + c[0] + 0.1;
const A = H.t17Inset(fx, "s4-v-ia", 14, 8, 640, 226, null);
// leader + highlight around the level meter
const [mx0, my0] = pg(28, 214), [mx1, my1] = pg(84, 482);
H.el("path", { d: `M 60 234 L ${H.f((mx0 + mx1) / 2)} ${H.f(my0)}`, fill: "none", stroke: TC.blue, "stroke-width": 3, "stroke-dasharray": "9 7" }, A);
H.el("rect", { x: H.f(mx0), y: H.f(my0), width: H.f(mx1 - mx0), height: H.f(my1 - my0), rx: 10, fill: "none", stroke: TC.blue, "stroke-width": 4 }, A);
badge(A, 38, 34, 1);
const G = H.t17Glass(A, 70, 22, 200, { level: 0.62, w: 50 });
H.el("path", { d: `M 126 ${H.f(G.markY)} L 146 ${H.f(G.markY)}`, fill: "none", stroke: TC.ink, "stroke-width": 3 }, A);
H.text(A, 152, G.markY + 9, "ขีดบน (Upper limit)", { size: 23 });
const chRun = H.t17Lab(A, "s4-v-crun", 152, 152, ["ปั๊มเดิน", "→ ระดับลดลง"], { size: 23, color: TC.blue, stroke: TC.blue });
const chStop = H.t17Lab(A, "s4-v-cstop", 152, 152, ["ปั๊มหยุด", "→ ถึงขีดบน = OK"], { size: 23, color: TC.green, stroke: TC.green, fill: "#f1faf4" });
// colour part
H.el("line", { x1: 384, y1: 26, x2: 384, y2: 216, stroke: "#d9d2c2", "stroke-width": 3 }, A);
const colG = H.el("g", { opacity: 0 }, A);
badge(colG, 410, 34, 2);
H.text(colG, 530, 46, "สีในเกจ", { size: 25, anchor: "middle" });
const vials = [[TC.newOil, "ใส"], [TC.brown, "น้ำตาล"], [TC.black, "ดำ ?"]].map(([col, lab], i) => {
  const vg = H.el("g", { opacity: 0 }, colG);
  const x = 420 + i * 80;
  H.t17Glass(vg, x, 66, 118, { level: 1.1, color: col, w: 40, mark: false, surf: col === TC.newOil ? TC.surf : "#1a1d21" });
  H.text(vg, x + 20, 212, lab, { size: 23, anchor: "middle", fill: i === 2 ? TC.red : TC.ink });
  if (i < 2) H.el("path", { d: H.arrowD(x + 45, 124, x + 75, 124, 10), fill: "none", stroke: TC.muted, "stroke-width": 3.5 }, vg);
  return vg;
});
H.t17Show(A, tA);
// the pump runs (flows on, level low) …
tl.set(S.oil, { attr: { y: TK.run, height: TK.bot - TK.run } }, b);
tl.set(S.surf, { attr: { y1: TK.run, y2: TK.run } }, b);
tl.set(S.glass, { attr: { y: TK.run, height: TK.gBot - 1 - TK.run } }, b);
tl.set(S.gsurf, { attr: { y1: TK.run, y2: TK.run } }, b);
H.t17Flow(S.flows, b + 0.2, c[0] + 0.9, true);
H.t17Show(chRun, tA + 0.15);
// … then stops: the oil comes back to the upper-limit mark
const tUp = b + c[0] + 1.2;
H.t17Level(S, TK.up, tUp, 1.0);
H.t17GlassTo(G, 1, tUp, 1.0);
swap(chRun, chStop, tUp + 1.0);
tl.fromTo(chStop, { scale: 1.12, svgOrigin: "262 152" }, { scale: 1, svgOrigin: "262 152", duration: 0.35, ease: "back.out(2)", immediateRender: false }, tUp + 1.0);

// seg 2: colour vials appear as they are named
H.t17Show(colG, b + c[1] + 0.1);
[0.9, 2.6, 3.9].forEach((dt, i) => H.t17Show(vials[i], b + c[1] + dt));

// ---- 3: air breather inset (top-right) ---------------------------------------------------------------------
const tBr = b + c[2] + 0.1;
const B = H.t17Inset(fx, "s4-v-ib", 680, 8, 406, 290, pg(545, 149), { spotR: 34 });
badge(B, 706, 36, 3);
const BR = H.t17Breather(B, 900, 46, 1.25);
H.text(B, 900, 278, "ไส้กรองสกปรกไหม ?", { size: 27, anchor: "middle" });
H.t17Show(B, tBr);
tl.fromTo(BR.dirt, { opacity: 0 }, { opacity: 1, duration: 1.0, immediateRender: false }, tBr + 1.1);

// ---- 4: temperature inset (bottom-right) -------------------------------------------------------------------
const tTp = b + c[3] + 0.1;
const C = H.t17Inset(fx, "s4-v-ic", 680, 314, 406, 318, pg(690, 132), { spotR: 34 });
badge(C, 706, 342, 4);
const TG = H.gauge(C, 790, 450, 80, { id: "s4-v-tg", min: 0, max: 100, ticks: 2, minor: 4, labelEvery: 1, labelSize: 21, marks: [{ v: 55 }], value: 20 });
H.text(C, 790, 576, "< 55 °C", { size: 34, anchor: "middle", fill: TC.ink });
H.text(C, 790, 612, "(ปั๊มหยุด)", { size: 22, anchor: "middle", fill: TC.muted });
// tank wall piece + palm + stopwatch
H.el("rect", { x: 900, y: 366, width: 170, height: 140, rx: 6, fill: TC.metal, stroke: TC.ink, "stroke-width": 4 }, C);
H.text(C, 1060, 392, "ผิวถัง", { size: 21, anchor: "end", fill: TC.muted });
const palm = H.t17Palm(C, 975, 462, 0.58, { id: "s4-v-palm" });
palm.setAttribute("opacity", 0);
const W = H.stopwatch(C, 934, 572, 26, { id: "s4-v-sw", color: TC.green });
H.text(C, 1018, 568, "3–4 วิ", { size: 27, anchor: "middle", fill: TC.green });
H.text(C, 1018, 600, "ขึ้นไป", { size: 22, anchor: "middle", fill: TC.green });
H.t17Show(C, tTp);
tl.to(TG.needle, { rotation: TG.rot(38), svgOrigin: TG.origin, duration: 1.0, ease: "power2.out" }, tTp + 0.5);
tl.fromTo(palm, { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, tTp + 1.6);
tl.fromTo(W.ring, { strokeDashoffset: W.offset(0) }, { strokeDashoffset: W.offset(1), duration: 1.8, ease: "none", immediateRender: false }, tTp + 2.1);
tl.fromTo(W.hand, { rotation: 0, svgOrigin: W.origin }, { rotation: W.rot(1), svgOrigin: W.origin, duration: 1.8, ease: "none", immediateRender: false }, tTp + 2.1);
