// Title: compressed air carries water / oil mist / dust; water drops collect in the low point (drop leg) as drain.
{
  const g = H.$("s1-v-art");
  const W = 760;

  // legend: what the air carries
  const lg = H.el("g", { id: "s1-v-leg" }, g);
  P26.drop(lg, 448, 66, 10);
  H.text(lg, 466, 76, "น้ำ", { size: 26 });
  P26.mist(lg, 548, 66, 9);
  H.text(lg, 566, 76, "น้ำมัน", { size: 26 });
  P26.grain(lg, 668, 66, 10, 1);
  H.text(lg, 686, 76, "ฝุ่น", { size: 26 });
  H.text(g, 24, 110, "ลมอัด (Compressed air) →", { size: 26, fill: P26.pipe });

  // main pipe (cut-away) with a drop leg at the low point
  P26.tubeH(g, 20, 780, 140, 200, { gaps: [[370, 430]] });
  P26.tubeV(g, 370, 430, 200, 430);
  const water = H.el("rect", { id: "s1-v-water", x: 370, y: 430, width: 60, height: 0, fill: P26.water }, g);
  const film = H.el("rect", { id: "s1-v-film", x: 370, y: 425, width: 60, height: 6, fill: P26.oil, opacity: 0 }, g);
  const ck = P26.drainCock(g, 400, 430, "s1-v-ck", 84);
  const flow = P26.dash(g, "M 20 170 L 780 170", { id: "s1-v-flow" });

  // particles carried along by the air
  const pg = H.el("g", { id: "s1-v-pts" }, g);
  const ys = [158, 184, 166, 152, 180, 190, 162, 186, 172, 156, 182, 168];
  const items = ys.map((y, i) => (i % 3 === 0 ? P26.drop(pg, 20, y, 6) : i % 3 === 1 ? P26.mist(pg, 20, y, 6) : P26.grain(pg, 20, y, 6, i)));
  P26.dashRun([flow], b + 0.2, D - 0.2, 1.2);
  P26.stream(items, W, b, D, 150);

  // drops form on the pipe wall, slide to the leg and fall into the drain
  const forms = [[120, 0.6], [250, 0.9], [610, 0.8], [700, 1.3], [520, 1.7], [180, 2.0], [650, 2.4]];
  forms.forEach(([x0, t0], i) => {
    const d = P26.drop(g, x0, 190, 8, { attrs: { id: `s1-v-d${i}`, opacity: 0 } });
    const dx = 400 - x0, slide = Math.abs(dx) / 330, at = b + t0;
    tl.fromTo(d, { opacity: 1, scale: 0, svgOrigin: `${x0} 199` }, { scale: 1, svgOrigin: `${x0} 199`, duration: 0.35, ease: "back.out(2)" }, at);
    tl.fromTo(d, { x: 0 }, { x: dx, duration: slide, ease: "power1.in", immediateRender: false }, at + 0.35);
    tl.fromTo(d, { y: 0, opacity: 1 }, { y: 190, opacity: 0, duration: 0.5, ease: "power2.in", immediateRender: false }, at + 0.35 + slide);
  });
  tl.fromTo(water, { attr: { y: 430, height: 0 } }, { attr: { y: 340, height: 90 }, duration: D - 1.4, ease: "power1.inOut" }, b + 1.2);
  tl.fromTo(film, { attr: { y: 425 }, opacity: 0 }, { attr: { y: 336 }, opacity: 1, duration: D - 1.4, ease: "power1.inOut" }, b + 1.2);

  // label
  const lab = H.el("g", { id: "s1-v-lab" }, g);
  H.el("path", { d: "M 446 392 L 500 392", stroke: P26.ink, "stroke-width": 3 }, lab);
  H.text(lab, 508, 402, "Drain", { size: 40, fill: P26.water });
  H.text(lab, 508, 438, "น้ำค้างที่จุดต่ำของท่อ", { size: 24, fill: P26.muted });
  tl.fromTo(lab, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.4 }, b + 2.2);
}
