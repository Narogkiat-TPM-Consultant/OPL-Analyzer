// Judgment 1/2 — leak (dry vs oil at the fitting / dust seal) and tie-rod nut (seated vs backed off).
// Card visuals start in the normal state; the defect appears just before each NG stamp.
{
  const S = T.stamps;
  H.c20CardLeak("s5-v-c1", false);
  const L = H.c20CardLeak("s5-v-c2", true);
  H.c20CardNut("s5-v-c3", false);
  const N = H.c20CardNut("s5-v-c4", true);

  tl.fromTo(L.wet, { opacity: 0 }, { opacity: 1, duration: 0.35 }, b + S[1] - 0.35);
  tl.fromTo(L.rings, { opacity: 0, scale: 1.3, svgOrigin: "137 92" }, { opacity: 1, scale: 1, svgOrigin: "137 92", duration: 0.3, ease: "back.out(2)" }, b + S[1]);
  for (let k = 0; k < 3; k++) {
    tl.fromTo(L.drop, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.12, immediateRender: k === 0 }, b + S[1] + 0.2 + k * 0.9);
    tl.to(L.drop, { y: 30, opacity: 0, duration: 0.5, ease: "power2.in" }, b + S[1] + 0.35 + k * 0.9);
  }

  tl.fromTo(N.nut, { x: 0 }, { x: 24, duration: 0.5, ease: "power2.inOut" }, b + S[3] - 0.5);
  tl.fromTo([N.ring, N.gap], { opacity: 0 }, { opacity: 1, duration: 0.25 }, b + S[3]);
}
