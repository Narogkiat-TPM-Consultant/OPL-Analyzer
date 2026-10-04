// Title: the unit starts up — coupling turns, oil flows, the gauge needle comes up to the set mark, and an ear
// listens to the pump (soft, steady sound waves = a quiet pump). No labels: the title text names the check.
const S = H.suStation("s1-v-st", "s1-v-s", { labels: [] });
const fx = H.$("s1-v-fx");
const t0 = b + 0.5; // start-up
SU.cplTurn(S, t0, b + D);
SU.flow(S.flowEls, t0 + 0.2, D - 0.7);
SU.needle(S.gauge, 0, 6, t0 + 0.3, 1.6, true);
const W = SU.waves(fx, "s1-v-w", 235, 300, -150, { r0: 70, dr: 18, n: 3, color: SC.blue, w: 6 });
SU.steady(W, t0 + 0.6, b + D, 0.8, 0.9);
const ear = SU.ear(fx, "s1-v-ear", 86, 196, 0.85);
tl.fromTo(ear, { opacity: 0, scale: 0.6, svgOrigin: "86 196" }, { opacity: 1, scale: 1, svgOrigin: "86 196", duration: 0.4, ease: "back.out(2)" }, t0 + 0.9);
