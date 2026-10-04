// Early signs: the same valve in three states, each animating when its stamp lands.
// OK = switches at once (coil a pulls, spool moves) · △ = coil getting hot + humming · NG = charred coil, smoke, spool stays.
const C = V12, st = T.stamps;
const mini = (id, p) => {
  const g = H.el("g", { transform: "translate(50 30) scale(0.44)" }, H.$(id));
  return { g, V: H.v12Valve(g, p, { pills: false, letters: false, stub: 0 }) };
};

// OK
const A = mini("s5-v-ok", "s5-v-okv");
A.V.mid.setAttribute("fill", C.pr);
A.V.coil("a", true, b + st[0] + 0.2);
A.V.shift(0, 1, b + st[0] + 0.5, 0.5);
H.v12Paint(A.V, 0, 1, b + st[0] + 0.9);

// △ hot + humming
const W = mini("s5-v-warn", "s5-v-warnv");
const wg = H.$("s5-v-warn");
W.V.coil("a", true, b + st[1] + 0.2);
W.V.heat("a", 0, 0.6, b + st[1] + 0.4, 1.0);
H.v12Heatwave(wg, 70, 56, b + st[1] + 0.8, b + D, { n: 1, h: 40, w: 4 });
H.v12Heatwave(wg, 108, 56, b + st[1] + 0.9, b + D, { n: 1, h: 40, w: 4 });
const hum = H.el("g", {}, wg);
[14, 24, 34].forEach((r, i) => {
  const a = H.el("path", { d: H.arcD(50, 89, r, 145, 215), fill: "none", stroke: C.ink, "stroke-width": 4, "stroke-linecap": "round", opacity: 0 }, hum);
  tl.fromTo(a, { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 2 * Math.max(1, Math.floor((D - st[1] - 1) / 0.5 / 2)) - 1, ease: "none" }, b + st[1] + 0.6 + i * 0.12);
});

// NG burned
const N = mini("s5-v-ng", "s5-v-ngv");
const ngg = H.$("s5-v-ng");
N.V.burn("a", b + st[2] + 0.2, 0.5);
H.v12Smoke(ngg, 88, 60, b + st[2] + 0.4, b + D, { n: 4, rise: 55, cycle: 1.5, r: 8 });
const x = H.el("g", { opacity: 0 }, ngg);
H.v12Cross(x, 50 + 445 * 0.44, 30 + 160 * 0.44, 18, { w: 7 });
H.v12Op(x, 0, 1, b + st[2] + 0.6, 0.25);
