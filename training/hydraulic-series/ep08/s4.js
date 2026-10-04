// O-ring groove (OPL 5-C-11): pressure pushes the ring into the gap (Fig.1), backup ring stops it,
// then the three check points: ① gap / bolt torque, ② groove surface, ③ press amount (squeeze).
const c4 = T.cues;
const seg4 = (k) => (k + 1 < c4.length ? c4[k + 1] - 0.3 : D - 0.8) - c4[k];
const at4 = (k, fr) => b + c4[k] + 0.1 + fr * seg4(k);
const ft = (tg, from, to, t, first) => tl.fromTo(tg, from, { ...to, ...(first ? {} : { immediateRender: false }) }, t);

const hatch4 = H.orHatch("s4-v-sec", "s4-v-hatch", 16);
const G4 = { x0: 20, x1: 790, yc: 150, yf: 300, gap: 16, yb: 625, gx: 290, gw: 240, gd: 460, r: 100, hatch: hatch4, sw: 4 };
const S4 = H.orSection("s4-v-sec", "s4-v-m", G4, { bolt: 660, ring: { rx: 114 } });
const fx = H.$("s4-v-fx");

// pressure scale with the deck's Fig.1 steps (kgf/cm²)
const PV = [0, 35, 70, 105, 201], px = (v) => 40 + (480 * v) / 201;
H.text(fx, 40, 40, "แรงดัน (kgf/cm²)", { size: 28, fill: HC.ink });
H.el("rect", { x: 40, y: 56, width: 480, height: 24, rx: 6, fill: "#ebe5d6", stroke: HC.ink, "stroke-width": 3 }, fx);
const fill4 = H.el("rect", { id: "s4-v-pfill", x: 40, y: 56, width: 0, height: 24, rx: 6, fill: HC.blue }, fx);
const tick4 = PV.map((v, i) => {
  H.el("line", { x1: H.f(px(v)), y1: 80, x2: H.f(px(v)), y2: 90, stroke: HC.ink, "stroke-width": 3 }, fx);
  return H.text(fx, px(v), 116, String(v), { size: 26, anchor: "middle", fill: "#59606a", id: `s4-v-pv${i}` });
});

// labels on the section
const oilPill = H.orPill(fx, 40, 236, 230, 44, "น้ำมันแรงดัน →", { id: "s4-v-oilp", fill: HC.oil, color: HC.ink, size: 27 });
const n1 = H.orNum(fx, 548, 344, 232, 1, "ช่องว่าง (Gap)", { id: "s4-v-n1" });
const n2 = H.orNum(fx, 40, 336, 170, 2, "ผิวร่อง", { id: "s4-v-n2" });
const n3 = H.orNum(fx, 440, 542, 220, 3, "ระยะบีบอัด", { id: "s4-v-n3" });

// NG: extrusion into the gap
const ngC = H.el("circle", { id: "s4-v-ngc", cx: 556, cy: 300, r: 36, fill: "none", stroke: HC.red, "stroke-width": 6 }, fx);
const ngP = H.orPill(fx, 560, 196, 226, 44, "ปลิ้น (Extrusion)", { id: "s4-v-ngp", fill: HC.red, size: 27 });

// OK inset: groove with a backup ring at the same high pressure — no extrusion
const inset = H.el("g", { id: "s4-v-inset" }, fx);
H.el("rect", { x: 812, y: 150, width: 276, height: 404, rx: 20, fill: "#fffdf8", stroke: "#178a4e", "stroke-width": 5 }, inset);
H.text(inset, 950, 194, "มี Backup ring", { size: 30, anchor: "middle", fill: HC.ink });
const hatchI = H.orHatch("s4-v-sec", "s4-v-hatchI", 12, 2);
const GI = { x0: 828, x1: 1072, yc: 216, yf: 280, gap: 12, yb: 420, gx: 880, gw: 146, gd: 384, r: 54, backup: 26, hatch: hatchI, sw: 3 };
H.orSection(inset, "s4-v-i", GI, { oil: true, lift: 8, ring: { sh: 22, rx: 60, lift: 8 } });
H.el("path", { d: "M 1013 446 L 1013 392", fill: "none", stroke: HC.ink, "stroke-width": 3 }, inset);
H.text(inset, 950, 474, "Backup ring", { size: 28, anchor: "middle", fill: HC.ink });
H.text(inset, 950, 522, "→ ไม่ปลิ้น", { size: 34, anchor: "middle", fill: "#178a4e" });

// ① torque on the bolt
const tq = H.el("g", { id: "s4-v-tq" }, fx);
const tqArc = H.el("path", { id: "s4-v-tqa", d: "M 588 126 A 72 26 0 0 1 732 126", fill: "none", stroke: HC.blue, "stroke-width": 6 }, tq);
H.el("path", { d: "M 720 112 L 733 128 L 744 110", fill: "none", stroke: HC.blue, "stroke-width": 6, "stroke-linejoin": "round" }, tq);
H.text(tq, 660, 78, "Torque ตามผู้ผลิต", { size: 28, anchor: "middle", fill: HC.blue });

// ② magnifier on the groove surface: scratch
const mg = H.el("g", { id: "s4-v-mag" }, fx);
H.el("path", { d: "M 206 452 L 296 448", fill: "none", stroke: HC.ink, "stroke-width": 3, "stroke-dasharray": "8 6" }, mg);
H.el("line", { x1: 196, y1: 536, x2: 228, y2: 570, stroke: HC.ink, "stroke-width": 14, "stroke-linecap": "round" }, mg);
H.el("circle", { cx: 150, cy: 490, r: 68, fill: "#ece6d7", stroke: HC.ink, "stroke-width": 6 }, mg);
const scr = [
  H.el("path", { d: "M 104 472 L 132 488 L 150 480 L 194 504", fill: "none", stroke: HC.red, "stroke-width": 5, "stroke-linecap": "butt" }, mg),
  H.el("path", { d: "M 108 510 L 146 520 L 188 534", fill: "none", stroke: HC.red, "stroke-width": 4, "stroke-linecap": "butt" }, mg),
];
H.orPill(mg, 70, 576, 180, 40, "รอยขีดข่วน", { fill: "#fffdf8", color: HC.red, size: 26, stroke: HC.red });

// ③ squeeze: free size (dashed) vs squeezed between cover face and groove bottom
const sq4 = H.el("g", { id: "s4-v-sq" }, fx);
H.el("circle", { cx: 410, cy: 380, r: 100, fill: "none", stroke: HC.blue, "stroke-width": 4, "stroke-dasharray": "12 8" }, sq4);
const sqA = H.el("g", { id: "s4-v-sqa" }, sq4);
H.el("path", { d: H.arrowD(410, 226, 410, 296, 18), fill: "none", stroke: HC.blue, "stroke-width": 7 }, sqA);
H.el("path", { d: H.arrowD(410, 548, 410, 464, 18), fill: "none", stroke: HC.blue, "stroke-width": 7 }, sqA);
H.orPill(sq4, 116, 256, 220, 42, "ขนาดก่อนบีบ", { fill: "#ffffff", color: HC.blue, size: 26, stroke: HC.blue });

// ---------------- timeline
// segment 1: the three spots
[n1, n2, n3].forEach((n, i) => tl.fromTo(n, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)" }, at4(0, 0.5 + i * 0.12)));
const pulse = (n, t) => tl.fromTo(n, { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.12, transformOrigin: "50% 50%", duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, t);

// segment 2: pressure rises 0 → 201, cover lifts (gap opens), ring is pushed and extrudes
const ST = [
  { sh: 0, rx: 114, lift: 0, len: 0 }, { sh: 20, rx: 116, lift: 0, len: 0 }, { sh: 36, rx: 118, lift: 3, len: 0 },
  { sh: 50, rx: 121, lift: 7, len: 24 }, { sh: 60, rx: 124, lift: 12, len: 50 },
];
const ringD = (s) => H.orRingD(G4, { sh: s.sh, rx: s.rx, lift: s.lift });
const t2 = at4(1, 0);
pulse(n1, t2);
tl.fromTo([S4.oil, oilPill], { opacity: 0 }, { opacity: 1, duration: 0.4 }, t2 + 0.2);
for (let i = 1; i < ST.length; i++) {
  const t = t2 + 0.4 + (i - 1) * 0.6, a = ST[i - 1], z = ST[i], first = i === 1;
  ft(fill4, { attr: { width: H.f(px(PV[i - 1]) - 40) } }, { attr: { width: H.f(px(PV[i]) - 40) }, duration: 0.45, ease: "power2.inOut" }, t, first);
  ft(S4.ring, { attr: { d: ringD(a) } }, { attr: { d: ringD(z) }, duration: 0.45, ease: "power2.inOut" }, t, first);
  ft(S4.cover, { y: -a.lift }, { y: -z.lift, duration: 0.45, ease: "power2.inOut" }, t, first);
  ft(S4.tongue, { attr: { d: H.orTongueD(G4, a.lift, a.len) } }, { attr: { d: H.orTongueD(G4, z.lift, z.len) }, duration: 0.45, ease: "power2.inOut" }, t, first);
  tl.fromTo(tick4[i], { attr: { fill: "#59606a" } }, { attr: { fill: HC.blue }, duration: 0.2 }, t + 0.3);
}
tl.fromTo(S4.tongue, { opacity: 0 }, { opacity: 1, duration: 0.15 }, t2 + 0.4 + 2 * 0.6);
const tNg = t2 + 0.4 + 3 * 0.6 + 0.5;
tl.fromTo([ngC, ngP], { opacity: 0 }, { opacity: 1, duration: 0.3 }, tNg);
tl.fromTo(ngC, { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.25, transformOrigin: "50% 50%", duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, tNg + 0.3);
tl.fromTo(inset, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, at4(1, 0.72));

// segment 3: pressure released, then the bolt torque
const t3 = at4(2, 0);
const top = ST[ST.length - 1];
ft(fill4, { attr: { width: H.f(px(201) - 40) } }, { attr: { width: 0 }, duration: 0.6, ease: "power2.inOut" }, t3);
ft(S4.ring, { attr: { d: ringD(top) } }, { attr: { d: ringD(ST[0]) }, duration: 0.6, ease: "power2.inOut" }, t3);
ft(S4.cover, { y: -top.lift }, { y: 0, duration: 0.6, ease: "power2.inOut" }, t3);
ft(S4.tongue, { attr: { d: H.orTongueD(G4, top.lift, top.len) } }, { attr: { d: H.orTongueD(G4, 0, 0) }, duration: 0.6, ease: "power2.inOut" }, t3);
tl.fromTo([ngC, ngP, S4.oil, oilPill], { opacity: 1 }, { opacity: 0, duration: 0.4, immediateRender: false }, t3);
tl.fromTo(S4.tongue, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, t3 + 0.45);
tl.fromTo(tick4.slice(1), { attr: { fill: HC.blue } }, { attr: { fill: "#59606a" }, duration: 0.3, immediateRender: false }, t3);
const LA = H.len("s4-v-tqa");
tl.fromTo(tq, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 0.5);
tl.fromTo(tqArc, { strokeDasharray: LA, strokeDashoffset: LA }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, t3 + 0.5);

// segment 4: groove surface — magnifier shows a scratch
const t4 = at4(3, 0);
pulse(n2, t4);
tl.fromTo(tq, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t4);
tl.fromTo(inset, { opacity: 1 }, { opacity: 0.35, duration: 0.4, immediateRender: false }, t4);
tl.fromTo(mg, { opacity: 0, scale: 0.7, svgOrigin: "150 490" }, { opacity: 1, scale: 1, svgOrigin: "150 490", duration: 0.4, ease: "back.out(2)" }, t4 + 0.3);
scr.forEach((p, i) => {
  const L = p.getTotalLength();
  tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut" }, at4(3, 0.3) + i * 0.25);
});

// segment 5: press amount — free size vs squeezed
const t5 = at4(4, 0);
pulse(n3, t5);
tl.fromTo(mg, { opacity: 1 }, { opacity: 0.35, duration: 0.4, immediateRender: false }, t5);
tl.fromTo(sq4, { opacity: 0 }, { opacity: 1, duration: 0.5 }, t5 + 0.3);
tl.fromTo(sqA, { opacity: 1, scale: 1, transformOrigin: "50% 50%" }, { scale: 1.06, transformOrigin: "50% 50%", duration: 0.35, yoyo: true, repeat: 3, immediateRender: false }, t5 + 0.9);
