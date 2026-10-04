// Title: a cylinder pushes a slide block — fast, then the cushion slows it so it stops softly.
// Tick marks = the block's front edge at equal time steps (wide = fast, tight = slowing down).
{
  const g = H.$("s1-v-cyl");
  const R = (x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: C7.ink, "stroke-width": o.sw ?? 5, ...(o.rx ? { rx: o.rx } : {}), ...(o.id ? { id: o.id } : {}) }, o.parent || g);

  // machine bed
  H.el("line", { x1: 12, y1: 500, x2: 748, y2: 500, stroke: C7.ink, "stroke-width": 6 }, g);
  for (let x = 34; x <= 748; x += 28) H.el("line", { x1: x, y1: 503, x2: x - 14, y2: 520, stroke: C7.muted, "stroke-width": 3 }, g);

  // ports + pipes (oil in on the cap side, out on the rod side)
  H.el("path", { d: "M 36 250 L 36 140", stroke: C7.blue, "stroke-width": 18, fill: "none" }, g);
  H.el("path", { d: "M 320 250 L 320 140", stroke: C7.blue, "stroke-width": 18, fill: "none" }, g);
  const fin = H.c7Flow(g, "s1-v-fin", "M 36 146 L 36 248", { color: "#ffffff", w: 6, dash: "12 14", period: 26 });
  const fout = H.c7Flow(g, "s1-v-fout", "M 320 248 L 320 146", { color: "#ffffff", w: 6, dash: "12 14", period: 26 });
  H.el("path", { d: H.c7HeadD(36, 96, 36, 136, 30), fill: C7.blue }, g);
  H.el("path", { d: H.c7HeadD(320, 140, 320, 100, 30), fill: C7.blue }, g);

  // rod (grows with the stroke), cylinder body, covers, feet
  const rod = R(320, 322, 70, 36, C7.dark, { sw: 4, id: "s1-v-rod" });
  R(54, 266, 248, 148, C7.tube);
  R(18, 250, 36, 180, C7.metal, { rx: 5 });
  R(302, 250, 36, 180, C7.metal, { rx: 5 });
  R(22, 430, 28, 70, C7.metal, { sw: 4 });
  R(306, 430, 28, 70, C7.metal, { sw: 4 });
  H.text(g, 178, 352, "กระบอกสูบ", { size: 36, anchor: "middle" });

  // slide block on the rod end
  const blk = H.el("g", { id: "s1-v-blk" }, g);
  R(376, 310, 16, 60, C7.ink, { sw: 0, parent: blk });
  R(390, 222, 120, 276, C7.metal, { rx: 12, parent: blk });
  H.text(blk, 450, 372, "โต๊ะ", { size: 36, anchor: "middle" });

  // motion: fast (linear), then the cushion slows it (power2.out keeps the speed continuous at the drop)
  const t0 = 0.6, dx1 = 120, T1 = 0.9, v1 = dx1 / T1, v2 = 0.5 * v1, dx2 = 100, T2 = (2 * dx2) / v2;
  tl.fromTo(blk, { x: 0 }, { x: dx1, duration: T1, ease: "none" }, b + t0);
  tl.to(blk, { x: dx1 + dx2, duration: T2, ease: "power2.out" }, b + t0 + T1);
  tl.fromTo(rod, { attr: { width: 70 } }, { attr: { width: 70 + dx1 }, duration: T1, ease: "none" }, b + t0);
  tl.to(rod, { attr: { width: 70 + dx1 + dx2 }, duration: T2, ease: "power2.out" }, b + t0 + T1);
  H.c7Run(fin, b + t0, T1 + T2, 120);
  H.c7Run(fout, b + t0, T1 + T2, 120);

  // trail ticks every 0.2 s
  const pos = (t) => (t <= T1 ? v1 * t : dx1 + dx2 * (1 - Math.pow(1 - Math.min(1, (t - T1) / T2), 2)));
  let last = -99;
  for (let t = 0; t <= T1 + T2 + 1e-6; t += 0.2) {
    const x = 510 + pos(t);
    if (x - last < 6) continue;   // skip ticks that would merge into a solid block near the stop
    last = x;
    const tk = H.el("line", { x1: H.f(x), y1: 532, x2: H.f(x), y2: 562, stroke: t < T1 - 1e-6 ? C7.blue : C7.green, "stroke-width": 4, opacity: 0 }, g);
    tl.to(tk, { opacity: 1, duration: 0.05 }, b + t0 + t);
  }
  const zone = H.el("g", { id: "s1-v-zone", opacity: 0 }, g);
  H.el("path", { d: `M ${510 + dx1} 570 L ${510 + dx1} 578 L ${510 + dx1 + dx2} 578 L ${510 + dx1 + dx2} 570`, fill: "none", stroke: C7.green, "stroke-width": 4 }, zone);
  H.text(zone, 510 + dx1 + dx2 / 2, 608, "Cushion", { size: 30, anchor: "middle", fill: C7.green });
  const fast = H.text(g, 510 + dx1 / 2, 608, "เร็ว", { size: 30, anchor: "middle", fill: C7.blue });
  fast.setAttribute("opacity", 0);
  tl.to(fast, { opacity: 1, duration: 0.3 }, b + t0 + 0.4);
  tl.to(zone, { opacity: 1, duration: 0.3 }, b + t0 + T1 + 0.3);

  // soft stop
  const ok = H.text(g, 510 + dx1 + dx2 - 90, 200, "หยุดนุ่มนวล", { size: 38, anchor: "middle", fill: C7.green, id: "s1-v-ok" });
  tl.fromTo(ok, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)" }, b + t0 + T1 + T2 - 0.1);
}
