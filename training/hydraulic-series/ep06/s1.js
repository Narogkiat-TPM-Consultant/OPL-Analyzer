// Title: the valve and its symbol; solenoid "a" switches on once, the spool (and the symbol) shift right, then back.
const art = H.$("s1-v-art");
const vg = H.el("g", { transform: "translate(26 24) scale(0.84)" }, art);
const V = H.v6Valve(vg, "s1-v-valve", { pills: "short" });
V.mid.setAttribute("fill", V6.pr);
V.ports.P.setAttribute("fill", V6.pr);
// flows for spool right (P→B, A→T), valve frame
const fa = H.el("g", { opacity: 0 }, V.flows);
const fl = [H.v6Flow(fa, "M 445 300 L 445 188 L 565 188 L 565 300"), H.v6Flow(fa, "M 325 300 L 325 188 L 208 188 L 208 300")];
const S = H.v6Symbol(art, "s1-v-sym", { cx: 400, y0: 380, bw: 120, bh: 90, sw: 4, head: 15, portLen: 34, portSize: 24, letter: 26 });

const t1 = 1.9, t2 = Math.max(t1 + 2.2, D - 1.6);
V.coil("a", true, b + t1);
V.shift(0, 1, b + t1 + 0.25, 0.6);
S.slide(0, 1, b + t1 + 0.25, 0.6);
H.v6Col(S.sol.a, "fill", V6.paper, V6.glow, b + t1, 0.3);
H.v6Paint(V, 0, 1, b + t1 + 0.7);
H.v6Run(fa, fl, b + t1 + 0.8, b + t2);
V.coil("a", false, b + t2);
H.v6Col(S.sol.a, "fill", V6.glow, V6.paper, b + t2, 0.3);
V.shift(1, 0, b + t2 + 0.15, 0.6);
S.slide(1, 0, b + t2 + 0.15, 0.6);
H.v6Paint(V, 1, 0, b + t2 + 0.2);
