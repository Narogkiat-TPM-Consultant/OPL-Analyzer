// Phenomenon at the real spot: the pump is noisy (red ring, noise arcs, the pump shakes), the gauge needle
// shakes (magnified inset) and sinks below the green band (lack of pressure).
const S = H.pumpStation("s2-v-st", "s2-v-s");
const fx = H.$("s2-v-fx");
const c = T.cues;
const tShake = T.points[1]; // "เข็มเกจสั่นแรง"
H.hydFlow(S.flows, b + 0.3, D - 0.3);

// seg 1: noise at the pump
H.ring(fx, "s2-v-ring", 235, 312, 80, b + c[0] + 0.2, 6);
H.psNoise(S.noise, b + c[0] + 0.2, D - c[0] - 0.6);
H.psShake(S.pump, b + c[0] + 0.2, b + D - 0.3);

// magnified gauge (inset) linked to the small gauge on the discharge line
const inset = H.el("g", { id: "s2-v-inset", opacity: 0 }, fx);
H.el("circle", { cx: 420, cy: 128, r: 58, fill: "none", stroke: PC.blue, "stroke-width": 4 }, inset);
H.el("path", { d: "M 438 73 L 690 18 M 452 176 L 680 206", fill: "none", stroke: PC.blue, "stroke-width": 3, "stroke-dasharray": "9 7" }, inset);
const GI = H.gauge(inset, 700, 112, 86, { id: "s2-v-gi", min: 0, max: 10, ok: [5, 7.5], ticks: 5, minor: 1, labelEvery: 99, value: 6.2 });
H.el("circle", { cx: 700, cy: 112, r: 94, fill: "none", stroke: PC.blue, "stroke-width": 5 }, inset);
tl.fromTo(inset, { opacity: 0 }, { opacity: 1, duration: 0.35 }, b + tShake - 0.1);
// needle value: steady 6.2 → shakes from "เข็มเกจสั่นแรง" → sinks below the band with seg 2 ("แรงดันไม่ถึง")
const val = (t) => {
  const u = t - b, sink = Math.min(1, Math.max(0, (u - c[1] - 0.2) / 1.2));
  return 6.2 - 2.3 * sink + 0.75 * H.env(t, b + tShake, b + D, 0.3) * H.wob(t, 0.4);
};
H.psNeedle(S.gauge, val, b + 0.3, b + D);
H.psNeedle(GI, val, b + 0.3, b + D);
