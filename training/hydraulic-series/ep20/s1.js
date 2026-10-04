// Title: a tie-rod cylinder strokes out, back and out again; light sweeps the rod — it shines like a mirror.
{
  const g = H.$("s1-v-art");
  // machine bed under the feet
  H.el("line", { x1: 16, y1: 432, x2: 744, y2: 432, stroke: C20.ink, "stroke-width": 6 }, g);
  for (let x = 38; x <= 744; x += 28) H.el("line", { x1: x, y1: 435, x2: x - 14, y2: 452, stroke: C20.muted, "stroke-width": 3 }, g);

  const E = H.c20Ext(g, { id: "s1-v-x", x: 52, y: 320, s: 0.8, rod: 96, pipeTop: -250 });
  const sp = [H.c20Spark(E.rod, 400, -9, 20), H.c20Spark(E.rod, 498, 7, 15)];

  // oil in / out of the ports (white dashes on the blue pipes)
  const fx = (id, d) => H.c20Flow(E.g, id, d, { w: 6, dash: "12 14", period: 26 });
  const inCap = fx("s1-v-f1", "M 35 -250 L 35 -134"), outRod = fx("s1-v-f2", "M 425 -134 L 425 -250");
  const inRod = fx("s1-v-f3", "M 425 -250 L 425 -134"), outCap = fx("s1-v-f4", "M 35 -134 L 35 -250");

  const DX = 150, T1 = 1.0;
  const stroke = (t, to, a, c) => {
    tl.to(E.rod, { x: to, duration: T1, ease: "power2.inOut" }, b + t);
    H.c20Run(a, b + t, T1, 110);
    H.c20Run(c, b + t, T1, 110);
  };
  tl.fromTo(E.rod, { x: 0 }, { x: DX, duration: T1, ease: "power2.inOut" }, b + 0.35);
  H.c20Run(inCap, b + 0.35, T1, 110);
  H.c20Run(outRod, b + 0.35, T1, 110);

  // gleam over the visible rod (rod-local x ≈ 310–556 when extended), then two sparkles
  const sweep = (t) => E.gleam.band.forEach((bd, i) =>
    tl.fromTo(bd, { x: 270, opacity: 0.95 }, { x: 600, opacity: 0.95, duration: 0.8, ease: "power1.inOut", immediateRender: false }, b + t + i * 0.06));
  sweep(1.4);
  sp.forEach((s, i) => tl.fromTo(s, { opacity: 0, scale: 0.2, svgOrigin: i ? "498 7" : "400 -9" }, { opacity: 1, scale: 1, svgOrigin: i ? "498 7" : "400 -9", duration: 0.25, ease: "back.out(3)", yoyo: true, repeat: 1, repeatDelay: 0.35 }, b + 1.75 + i * 0.2));

  stroke(2.7, 0, inRod, outCap);
  stroke(3.85, DX, inCap, outRod);
}
