// Read the circuit: actual circuit (left) and sign circuit (right) in the same layout; oil runs the same path on both,
// numbered badges mark the same component on both sides, the middle column lists the reading order.
const k = 0.76;
const A = H.actualCircuit(G3("s4-v-a", 20 - 30 * k, 64, k), "s4-v-ac");
const S = H.signCircuit(G3("s4-v-s", 1742 - 832 * k, 70, k), "s4-v-sc");
const at = (n, f) => b + H.e3seg(T, D, n, f);
const end = b + D;
const svg = H.$("s4-v-l");
H.text(svg, 331, 40, "ของจริง (Actual circuit)", { size: 34, anchor: "middle" });
H.text(svg, 1436, 40, "สัญลักษณ์ (Sign circuit)", { size: 34, anchor: "middle", fill: K3.blue });

// ---- reading-order legend (middle)
H.text(svg, 885, 128, "ไล่ทางน้ำมัน", { size: 34, anchor: "middle", fill: K3.muted });
const names = ["ถังน้ำมัน → ฟิลเตอร์", "ปั๊ม (Pump)", "วาล์วเปลี่ยนทิศทาง", "วาล์วปรับอัตราการไหล", "กระบอกสูบ: ดันออก", "ไหลกลับถัง"];
const legend = names.map((nm, i) => {
  const y = 190 + i * 88, lg = H.el("g", { id: `s4-v-lg${i + 1}` }, svg);
  C3(lg, 690, y, 26, i < 5 ? K3.blue : K3.ret, { sw: 0 });
  if (i < 5) H.text(lg, 690, y + 11, String(i + 1), { size: 30, anchor: "middle", fill: "#ffffff" });
  else L3(lg, `M 690 ${y - 16} L 690 ${y + 2} ` + head3(690, y + 4, Math.PI / 2, 8) + ` M 678 ${y - 4} L 678 ${y + 12} L 702 ${y + 12} L 702 ${y - 4}`, { c: "#ffffff", w: 3.5 });
  H.text(lg, 728, y + 11, nm, { size: 30 });
  if (i < 5) L3(svg, `M 690 ${y + 32} L 690 ${y + 54} ` + head3(690, y + 56, Math.PI / 2, 9), { c: K3.muted, w: 3 });
  return lg;
});
const lit = (i, t) => tl.fromTo(legend[i], { opacity: 0.25 }, { opacity: 1, duration: 0.3 }, t);

// ---- badges on both circuits (same number = same component)
const badges = {};
for (const [C, side] of [[A, "a"], [S, "s"]]) {
  for (const n in C.badges) {
    C.badges[n].forEach(([cx, cy], j) => {
      const bg = H.e3badge(C.g, cx, cy, n, { id: `s4-v-b${side}${n}${j}`, r: 26, size: 32 });
      (badges[n] = badges[n] || []).push({ bg, o: `${cx} ${cy}` });
    });
  }
}
const pop = (n, t) => badges[n].forEach(({ bg, o }) => tl.fromTo(bg, { opacity: 0, scale: 1.8, svgOrigin: o }, { opacity: 1, scale: 1, svgOrigin: o, duration: 0.35, ease: "back.out(2)" }, t));

// ---- oil flow (same timing on both sides)
const SF = H.el("g", { id: "s4-v-scf" }, S.g);
const flow = (key, color, t, dur) => {
  H.e3flow(A.flow, `s4-v-fa-${key}`, A.routes[key], color, 7, t, dur, end);
  H.e3flow(SF, `s4-v-fs-${key}`, S.routes[key], color, 8, t, dur, end);
};
// segment 1: pump starts, sucks oil from the tank through the filter, sends it to the direction valve
const tPump = at(1, 0.28);
tl.fromTo(A.pu.rotor, { rotation: 0, svgOrigin: A.pu.origin }, { rotation: 360 * Math.round((end - tPump) * 1.2), svgOrigin: A.pu.origin, duration: end - tPump, ease: "none" }, tPump);
const tSuc = at(1, 0.45);
flow("suc", K3.blue, tSuc, 0.7); pop(1, tSuc); lit(0, tSuc);
pop(2, tSuc + 0.7); lit(1, tSuc + 0.7);
const tP = at(1, 0.7);
flow("press", K3.blue, tP, 0.9);
H.e3flow(A.flow, "s4-v-fa-br", A.routes.br, K3.blue, 7, tP + 0.4, 0.8, end);
H.e3flow(SF, "s4-v-fs-br", S.routes.br, K3.blue, 8, tP + 0.4, 0.8, end);
H.e3flow(SF, "s4-v-fs-gauge", S.routes.gauge, K3.blue, 8, tP + 1.0, 0.3, end);
tl.fromTo(A.gs.needle, { rotation: 0, svgOrigin: A.gs.origin }, { rotation: 130, svgOrigin: A.gs.origin, duration: 0.8, ease: "power2.out" }, tP + 1.0);
pop(3, tP + 0.9); lit(2, tP + 0.9);

// segment 2: solenoid energised → valve shifts (straight-arrow box comes in) → oil through flow valve → rod out
const tSol = at(2, 0.02);
tl.to([A.dv.lampL], { attr: { fill: K3.yellow }, duration: 0.2 }, tSol);
tl.to([A.dv.coilL, S.dv.solL], { attr: { fill: "#ffd766" }, duration: 0.2 }, tSol);
tl.fromTo(S.dv.spool, { x: 0 }, { x: 86, duration: 0.5, ease: "power2.inOut" }, tSol + 0.15);
const tA = at(2, 0.3), tCyl = at(2, 0.74), tRetEnd = at(3, 0.4);
flow("a", K3.blue, tA, tCyl - tA);
pop(4, at(2, 0.5)); lit(3, at(2, 0.5));
const extDur = tRetEnd - tCyl;
tl.fromTo(A.cy.rod, { x: 0 }, { x: 110, duration: extDur, ease: "power1.inOut" }, tCyl);
tl.fromTo(S.cy.rod, { x: 0 }, { x: 150, duration: extDur, ease: "power1.inOut" }, tCyl);
tl.fromTo(A.cy.ch, { opacity: 0, attr: { width: A.cy.chW } }, { opacity: 0.9, attr: { width: A.cy.chW + 110 }, duration: extDur, ease: "power1.inOut" }, tCyl);
tl.fromTo(S.cy.ch, { opacity: 0, attr: { width: S.cy.chW } }, { opacity: 0.9, attr: { width: S.cy.chW + 150 }, duration: extDur, ease: "power1.inOut" }, tCyl);
pop(5, tCyl + 0.1); lit(4, tCyl + 0.1);

// segment 3: the other side returns to the tank; then every badge pulses — same path, same parts
const tR = at(3, 0.0);
flow("ret", K3.ret, tR, tRetEnd - tR);
lit(5, at(3, 0.25));
const tM = at(3, 0.72);
for (const n in badges) badges[n].forEach(({ bg, o }) => tl.to(bg, { scale: 1.3, svgOrigin: o, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, tM));
