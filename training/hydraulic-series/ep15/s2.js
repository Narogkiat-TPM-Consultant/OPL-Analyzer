// Alert icon (dark scene): motor → turning coupling → pump; a hand reaches for the coupling and a red
// prohibition sign pops over it; the hand pulls back. Wording on screen is a proposal / general rule.
{
  const g = H.$("s2-v-ic");
  const R = (x, y, w, h, fill, rx = 6, sw = 4) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: "#121417", "stroke-width": sw }, g);
  R(8, 300, 284, 16, C15.metal, 3);
  // motor with fins + feet
  R(12, 196, 104, 100, C15.metal, 10);
  H.el("path", { d: "M 28 204 L 28 288 M 44 204 L 44 288 M 60 204 L 60 288 M 76 204 L 76 288 M 92 204 L 92 288", fill: "none", stroke: "#121417", "stroke-width": 2.5, opacity: 0.45 }, g);
  // shaft, pump
  R(112, 240, 104, 16, C15.dark, 2, 3);
  R(212, 212, 78, 74, C15.dark, 10);
  R(232, 286, 38, 14, C15.metal, 2, 3);
  // coupling: two hubs; stripes scroll inside a clip = turning
  R(132, 210, 34, 76, C15.metal, 4, 3);
  R(168, 210, 34, 76, C15.metal, 4, 3);
  const cp = H.el("clipPath", { id: "s2-v-cclip" }, H.el("defs", {}, g));
  H.el("rect", { x: 134, y: 212, width: 66, height: 72 }, cp);
  const sg = H.el("g", { "clip-path": "url(#s2-v-cclip)" }, g);
  const st = H.el("g", { id: "s2-v-stripes" }, sg);
  const d = [];
  for (let y = 196; y <= 290; y += 16) d.push(`M 136 ${y} L 162 ${y} M 172 ${y} L 198 ${y}`);
  H.el("path", { d: d.join(" "), fill: "none", stroke: "#121417", "stroke-width": 5, opacity: 0.6 }, st);
  const n = Math.max(1, Math.round(D / 0.14));
  tl.fromTo(st, { y: 0 }, { y: 16, duration: 0.14, ease: "none", repeat: n - 1 }, b);
  // rotation arrow over the coupling
  H.el("path", { id: "s2-v-rot", d: H.arcD(167, 248, 62, 215, 322), fill: "none", stroke: C15.warn, "stroke-width": 8, "stroke-linecap": "round" }, g);
  const a2 = (325 * Math.PI) / 180, ex = 167 + 62 * Math.cos(a2), ey = 248 + 62 * Math.sin(a2);
  const dx = -Math.sin(a2), dy = Math.cos(a2); // clockwise tangent at the arrow tip
  H.el("path", { d: H.arrowD(ex - 14 * dx, ey - 14 * dy, ex, ey, 20), fill: "none", stroke: C15.warn, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);

  // the hand reaches in (from the upper right), the sign pops, the hand pulls back
  const hand = H.hand15(g, "s2-v-hand", 196, 196, 0.78, 22);
  const no = H.noSign(g, 196, 128, 84, "s2-v-no");
  tl.fromTo(hand, { x: 70, y: -90, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }, b + 0.2);
  tl.fromTo(no, { scale: 0.3, opacity: 0, svgOrigin: "196 128" }, { scale: 1, opacity: 1, svgOrigin: "196 128", duration: 0.35, ease: "back.out(2.5)" }, b + 0.85);
  tl.fromTo(hand, { x: 0, y: 0 }, { x: 30, y: -40, duration: 0.5, ease: "power2.inOut", immediateRender: false }, b + 1.5);
}
