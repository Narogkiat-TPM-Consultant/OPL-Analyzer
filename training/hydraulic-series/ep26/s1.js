// Title: compressed air carries water / oil mist / dust; water drops collect in the low point (drop leg) as drain.
{
  const g = H.$("s1-v-art");
  const W = 760;

  // legend: what the air carries
  const lg = H.el("g", { id: "s1-v-leg" }, g);
  P26.drop(lg, 412, 62, 13);
  H.text(lg, 434, 74, "น้ำ", { size: 32 });
  P26.mist(lg, 532, 62, 12);
  H.text(lg, 554, 74, "น้ำมัน", { size: 32 });
  P26.grain(lg, 678, 62, 13, 1);
  H.text(lg, 700, 74, "ฝุ่น", { size: 32 });
  H.text(g, 24, 128, "ลมอัด (Compressed air) →", { size: 30, fill: P26.pipe });

  // main pipe (cut-away) with a drop leg at the low point
  P26.tubeH(g, 20, 780, 156, 246, { gaps: [[360, 440]], wall: 12 });
  P26.tubeV(g, 360, 440, 246, 440, { wall: 12 });
  const water = H.el("rect", { id: "s1-v-water", x: 360, y: 440, width: 80, height: 0, fill: P26.water }, g);
  const film = H.el("rect", { id: "s1-v-film", x: 360, y: 434, width: 80, height: 8, fill: P26.oil, opacity: 0 }, g);
  P26.drainCock(g, 400, 440, "s1-v-ck", 112);
  const flow = P26.dash(g, "M 20 201 L 780 201", { id: "s1-v-flow", w: 6 });

  // particles carried along by the air
  const pg = H.el("g", { id: "s1-v-pts" }, g);
  const ys = [176, 222, 192, 172, 214, 230, 182, 226, 200, 170, 218, 190];
  const items = ys.map((y, i) => (i % 3 === 0 ? P26.drop(pg, 20, y, 8) : i % 3 === 1 ? P26.mist(pg, 20, y, 8) : P26.grain(pg, 20, y, 8, i)));
  P26.dashRun([flow], b + 0.2, D - 0.2, 1.2);
  P26.stream(items, W, b, D, 150);

  // drops form on the pipe wall, slide to the leg and fall into the drain
  const forms = [[110, 0.5], [250, 0.8], [620, 0.7], [710, 1.2], [520, 1.6], [170, 1.9], [660, 2.3]];
  forms.forEach(([x0, t0], i) => {
    const d = P26.drop(g, x0, 232, 11, { attrs: { id: `s1-v-d${i}`, opacity: 0 } });
    const dx = 400 - x0, slide = Math.abs(dx) / 330, at = b + t0;
    tl.fromTo(d, { opacity: 1, scale: 0, svgOrigin: `${x0} 245` }, { scale: 1, svgOrigin: `${x0} 245`, duration: 0.35, ease: "back.out(2)" }, at);
    tl.fromTo(d, { x: 0 }, { x: dx, duration: slide, ease: "power1.in", immediateRender: false }, at + 0.35);
    tl.fromTo(d, { y: 0, opacity: 1 }, { y: 170, opacity: 0, duration: 0.5, ease: "power2.in", immediateRender: false }, at + 0.35 + slide);
  });
  tl.fromTo(water, { attr: { y: 440, height: 0 } }, { attr: { y: 340, height: 100 }, duration: D - 1.3, ease: "power1.inOut" }, b + 1.1);
  tl.fromTo(film, { attr: { y: 434 }, opacity: 0 }, { attr: { y: 334 }, opacity: 1, duration: D - 1.3, ease: "power1.inOut" }, b + 1.1);

  // label
  const lab = H.el("g", { id: "s1-v-lab" }, g);
  H.el("path", { d: "M 456 392 L 500 392", stroke: P26.ink, "stroke-width": 4 }, lab);
  H.text(lab, 508, 406, "Drain", { size: 48, fill: P26.water });
  H.text(lab, 508, 446, "น้ำที่จุดต่ำของท่อ", { size: 27, fill: P26.muted });
  tl.fromTo(lab, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.4 }, b + 2.1);
}
