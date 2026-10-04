// Symbol: 3 boxes slide under the fixed ports — centre (closed) → "a" on: left box (crossed) → "b" on: right box (parallel).
// The cylinder above is piped like scene 3 (A → cap end, B → rod end).
const art = H.$("s4-v-art");
const C = V6, c = T.cues, f = H.f;
const S = H.v6Symbol(art, "s4-v-sym", { cx: 550, y0: 290, bw: 170, bh: 130, sw: 6, head: 22, portLen: 50 });
S.stubs.P.setAttribute("stroke", V6.pr);
const x1 = S.x1, x2 = S.x2, yT = S.y0 - 50, yP = S.yB + 50;

// external lines (drawn under the symbol's stubs, coloured per state)
const ext = H.el("g", {}, art);
art.insertBefore(ext, S.g);
const ln = (d, col = C.ink, w = 6) => H.el("path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linejoin": "miter", "stroke-linecap": "butt" }, ext);
const lA = ln(`M ${f(x1)} ${yT} L ${f(x1)} 200 L 400 200 L 400 146`);
const lB = ln(`M ${f(x2)} ${yT} L ${f(x2)} 146`);
const lP = ln(`M ${f(x1)} ${yP} L ${f(x1)} 548`, C.pr);
const lT = ln(`M ${f(x2)} ${yP} L ${f(x2)} 552`);
H.v6Head(art, x1, yP + 8, "up", { fill: C.pr, len: 24, w: 14, sw: 2.5 });
H.el("path", { d: `M ${f(x2 - 34)} 528 L ${f(x2 - 34)} 566 L ${f(x2 + 34)} 566 L ${f(x2 + 34)} 528`, fill: "none", stroke: C.ink, "stroke-width": 5 }, art);
H.text(art, x1 - 16, 580, "จากปั๊ม", { size: 26, anchor: "end", fill: C.muted });
H.text(art, x2 + 46, 562, "ถัง", { size: 26, anchor: "start", fill: C.muted });

// cylinder symbol: cap end (A) left, rod end (B) right
const P0 = 485, cy = H.el("g", {}, art);
H.el("rect", { x: 360, y: 84, width: 280, height: 62, fill: C.paper, stroke: C.ink, "stroke-width": 5 }, cy);
const capCh = H.el("rect", { x: 363, y: 87, width: P0 - 363, height: 56, fill: C.paper }, cy);
const rodCh = H.el("rect", { x: P0, y: 87, width: 637 - P0, height: 56, fill: C.paper }, cy);
const pis = H.el("g", {}, cy);
H.el("rect", { x: P0 - 5, y: 84, width: 10, height: 62, fill: C.ink }, pis);
H.el("rect", { x: P0, y: 109, width: 270, height: 12, fill: C.ink }, pis);
H.text(art, 352, 124, "กระบอกสูบ", { size: 26, anchor: "end", fill: C.muted });

const LN = { A: [lA, S.stubs.A], B: [lB, S.stubs.B], T: [lT, S.stubs.T] }, CHM = { A: capCh, B: rodCh };
const COL = { 0: { A: C.ink, B: C.ink, T: C.ink }, 1: { A: C.rt, B: C.pr, T: C.rt }, "-1": { A: C.pr, B: C.rt, T: C.rt } };
const CH = { 0: { A: C.paper, B: C.paper }, 1: { A: C.rt, B: C.pr }, "-1": { A: C.pr, B: C.rt } };
const paint = (from, to, t) => {
  for (const k of ["A", "B", "T"]) {
    if (COL[from][k] !== COL[to][k]) for (const e of LN[k]) H.v6Col(e, "stroke", COL[from][k], COL[to][k], t);
    if (k !== "T" && CH[from][k] !== CH[to][k]) H.v6Col(CHM[k], "fill", CH[from][k], CH[to][k], t);
  }
};
const piston = (from, to, t, dur) => {
  const e = { duration: dur, ease: "power1.inOut", immediateRender: false };
  tl.fromTo(pis, { x: from - P0 }, { x: to - P0, ...e }, t);
  tl.fromTo(capCh, { attr: { width: from - 363 } }, { attr: { width: to - 363 }, ...e }, t);
  tl.fromTo(rodCh, { attr: { x: from, width: 637 - from } }, { attr: { x: to, width: 637 - to }, ...e }, t);
};

// ① centre box = closed: pulse the window
tl.fromTo(S.win, { attr: { fill: "#fff1c2" } }, { attr: { fill: C.glow }, duration: 0.35, yoyo: true, repeat: 3, immediateRender: false }, b + c[0] + 2.0);
// ② a on → boxes slide right, left box (crossed) at the ports
const ta = c[1];
H.v6Col(S.sol.a, "fill", C.paper, C.glow, b + ta + 0.1, 0.3);
S.slide(0, 1, b + ta + 0.3, 0.6);
H.v6Col(S.arrows.PB, "stroke", C.ink, C.pr, b + ta + 0.9);
H.v6Col(S.arrows.AT, "stroke", C.ink, C.rt, b + ta + 0.9);
paint(0, 1, b + ta + 0.9);
piston(P0, 420, b + ta + 1.0, 1.4);
// ③ b on → boxes slide left, right box (parallel) at the ports
const tb = c[2];
H.v6Col(S.sol.a, "fill", C.glow, C.paper, b + tb, 0.3);
H.v6Col(S.sol.b, "fill", C.paper, C.glow, b + tb + 0.1, 0.3);
S.slide(1, -1, b + tb + 0.3, 0.8);
H.v6Col(S.arrows.PA, "stroke", C.ink, C.pr, b + tb + 1.1);
H.v6Col(S.arrows.BT, "stroke", C.ink, C.rt, b + tb + 1.1);
paint(1, -1, b + tb + 1.1);
piston(420, 548, b + tb + 1.2, 1.6);
