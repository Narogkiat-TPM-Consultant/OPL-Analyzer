// Judgment 2/2 — rod surface (mirror shine vs scratches) and dust seal (intact vs torn / worn).
{
  const S = T.stamps;
  const A = H.c20CardRod("s6-v-c1", false, "s6-v-r1");
  const B = H.c20CardRod("s6-v-c2", true);
  const C = H.c20SealFace("s6-v-c3", 170, 95, 1.0);
  const D = H.c20SealFace("s6-v-c4", 170, 95, 1.0);

  // OK rod: light sweeps, sparkles
  A.gleam.band.forEach((bd, i) => tl.fromTo(bd, { x: 0, opacity: 0.95 }, { x: 300, opacity: 0.95, duration: 0.8, ease: "power1.inOut" }, b + S[0] - 0.2 + i * 0.07));
  A.sparks.forEach((s, i) => {
    const org = i ? "262 92" : "150 80";
    tl.fromTo(s, { opacity: 0, scale: 0.2, svgOrigin: org }, { opacity: 1, scale: 1, svgOrigin: org, duration: 0.25, ease: "back.out(3)" }, b + S[0] + 0.25 + i * 0.2);
  });

  // NG rod: dull + scratches drawn on, red ring with the stamp
  tl.fromTo(B.dull, { opacity: 0 }, { opacity: 0.22, duration: 0.4 }, b + S[1] - 0.5);
  B.scr.forEach((p, i) => {
    const L = p.getTotalLength();
    tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.25, ease: "none" }, b + S[1] - 0.5 + i * 0.07);
  });
  tl.fromTo(B.ring, { opacity: 0 }, { opacity: 1, duration: 0.25 }, b + S[1]);

  // OK seal: the lip ring pulses blue
  tl.fromTo(C.ring, { attr: { stroke: C20.rubber } }, { attr: { stroke: C20.blue }, duration: 0.3, yoyo: true, repeat: 1 }, b + S[2]);

  // NG seal: a piece of the lip tears out, dust at the gap, red ring
  const red = H.el("circle", { cx: 194, cy: 63, r: 32, fill: "none", stroke: C20.red, "stroke-width": 5, opacity: 0 }, "s6-v-c4");
  tl.fromTo(D.tear, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + S[3] - 0.35);
  tl.fromTo(red, { opacity: 0, scale: 1.4, svgOrigin: "194 63" }, { opacity: 1, scale: 1, svgOrigin: "194 63", duration: 0.3, ease: "back.out(2)" }, b + S[3]);
}
