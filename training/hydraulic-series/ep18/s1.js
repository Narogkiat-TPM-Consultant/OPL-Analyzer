// Title: a marked pressure gauge on the pressure line. Oil flows, the needle sweeps up over the red zone into
// the green band (deck example: green 2–4 on a 0–6 kgf/cm² scale) and settles; a green check appears.
{
  const g = H.$("s1-v-g"), K = K18;
  // pressure line + flow dashes (drawn first, the gauge sits on it)
  H.el("path", { d: "M 20 584 H 740", fill: "none", stroke: K.blue, "stroke-width": 26 }, g);
  const fl = H.el("path", { id: "s1-v-fl", d: "M 20 584 H 740", fill: "none", stroke: "#ffffff", "stroke-width": 6, "stroke-dasharray": "14 22", opacity: 0 }, g);
  H.el("rect", { x: 356, y: 552, width: 48, height: 22, fill: K.blue }, g);
  const G = H.g18Dial(g, 380, 258, 222, { id: "s1-v-d", socket: 76, value: 0 });
  H.g18Marked(G);

  tl.fromTo(fl, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, b + 0.3);
  tl.fromTo(fl, { strokeDashoffset: 0 }, { strokeDashoffset: -36 * Math.round(D * 3), duration: D - 0.3, ease: "none", immediateRender: false }, b + 0.3);
  // needle: 0 → overshoot → settles at 3 (inside green)
  H.g18Needle(G, 0, 3.35, b + 0.7, 1.5, "power2.out");
  H.g18Needle(G, 3.35, 3.0, b + 2.2, 0.5, "sine.inOut", false);
  // check mark when it is in the green band
  const ok = H.el("g", { opacity: 0 }, g);
  H.el("circle", { cx: 640, cy: 82, r: 54, fill: K.paper, stroke: K.green, "stroke-width": 9 }, ok);
  H.g18Check(ok, 642, 84, 28, { w: 12 });
  tl.fromTo(ok, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)" }, b + 2.7);
}
