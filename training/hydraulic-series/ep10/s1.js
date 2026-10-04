// Title: the pump unit runs noisy — noise waves, the pump body shakes, the gauge needle shakes and sinks below
// the green band. No labels (the title text names the trouble).
const S = H.pumpStation("s1-v-st", "s1-v-s", { labels: [] });
H.hydFlow(S.flows, b + 0.3, D - 0.3);
H.psNoise(S.noise, b + 0.9, D - 1.3);
H.psShake(S.pump, b + 0.9, b + D - 0.2);
H.psNeedle(S.gauge, (t) => {
  const u = Math.min(1, Math.max(0, (t - b - 0.9) / 1.4));
  return 6.2 - 2.0 * u + 0.6 * H.env(t, b + 0.9, b + D, 0.4) * H.wob(t, 0);
}, b + 0.3, b + D);
