// Title: the EP06 valve + symbol. Solenoid "a" is switched on, the spool only creeps part-way, the coil heats up
// (yellow → red), heat shimmer, then smoke and a charred coil.
const art = H.$("s1-v-art");
const vg = H.el("g", { transform: "translate(26 40) scale(0.84)" }, art);
const V = H.v12Valve(vg, "s1-v-valve", { pills: "short" });
V.mid.setAttribute("fill", V12.pr);
V.ports.P.setAttribute("fill", V12.pr);
const S = H.v12Symbol(art, "s1-v-sym", { cx: 400, y0: 396, bw: 120, bh: 90, sw: 4, head: 15, portLen: 34, portSize: 24, letter: 26 });

const t1 = 0.7;
V.coil("a", true, b + t1);
H.v12Col(S.sol.a, "fill", V12.paper, V12.glow, b + t1, 0.3);
V.shift(0, 0.3, b + t1 + 0.3, 0.5, "power2.out");
V.heat("a", 0, 1, b + t1 + 0.9, 1.3);
H.v12Col(S.sol.a, "fill", V12.glow, V12.hot, b + t1 + 1.2, 0.8);
const hw = H.el("g", {}, vg);
H.v12Heatwave(hw, 32, 62, b + t1 + 1.3, b + D, { n: 2, gap: 18, h: 50 });
H.v12Heatwave(hw, 145, 62, b + t1 + 1.5, b + D, { n: 2, gap: 18, h: 50 });
const tb = Math.min(b + t1 + 2.6, b + D - 1.2);
V.burn("a", tb, 0.8);
H.v12Smoke(vg, 140, 64, tb + 0.2, b + D, { n: 4, rise: 80, cycle: 1.6, r: 13 });
