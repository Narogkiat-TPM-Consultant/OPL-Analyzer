// Title: a cylinder pushes a slide block — fast, then the cushion slows it so it stops softly.
// Tick marks = the block's front edge at equal time steps (wide = fast, tight = slowing down).
{
  const g = H.$("s1-v-cyl");
  const R = (x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: C7.ink, "stroke-width": o.sw ?? 5, ...(o.rx ? { rx: o.rx } : {}), ...(o.id ? { id: o.id } : {}) }, o.parent || g);

  // machine bed
  H.el("line", { x1: 20, y1: 470, x2: 780, y2: 470, stroke: C7.ink, "stroke-width": 5 }, g);
  for (let x = 40; x <= 780; x += 28) H.el("line", { x1: x, y1: 473, x2: x - 14, y2: 490, stroke: C7.muted, "stroke-width": 3 }, g);

  // ports + pipes (oil in on the cap side, out on the rod side)
  H.el("path", { d: "M 46 262 L 46 140", stroke: C7.blue, "stroke-width": 16, fill: "none" }, g);
  H.el("path", { d: "M 316 262 L 316 140", stroke: C7.blue, "stroke-width": 16, fill: "none" }, g);
  const fin = H.c7Flow(g, "s1-v-fin", "M 46 150 L 46 258", { color: "#ffffff", w: 5, dash: "10 14", period: 24 });
  const fout = H.c7Flow(g, "s1-v-fout", "M 316 258 L 316 150", { color: "#ffffff", w: 5, dash: "10 14", period: 24 });
  H.el("path", { d: H.c7HeadD(46, 100, 46, 136, 26), fill: C7.blue }, g);
  H.el("path", { d: H.c7HeadD(316, 140, 316, 104, 26), fill: C7.blue }, g);

  // rod (grows with the stroke), cylinder body, covers, feet
  const rod = R(300, 316, 80, 28, C7.dark, { sw: 4, id: "s1-v-rod" });
  R(62, 274, 238, 112, C7.tube);
  R(30, 262, 32, 136, C7.metal, { rx: 4 });
  R(300, 262, 32, 136, C7.metal, { rx: 4 });
  R(34, 398, 24, 72, C7.metal, { sw: 4 });
  R(304, 398, 24, 72, C7.metal, { sw: 4 });
  H.text(g, 181, 342, "กระบอกสูบ", { size: 30, anchor: "middle" });

  // slide block on the rod end
  const blk = H.el("g", { id: "s1-v-blk" }, g);
  R(368, 304, 14, 52, C7.ink, { sw: 0, parent: blk });
  R(380, 240, 110, 228, C7.metal, { rx: 10, parent: blk });
  H.text(blk, 435, 362, "โต๊ะ", { size: 30, anchor: "middle" });

  // motion: fast (linear), then the cushion slows it (power2.out keeps the speed continuous at the drop)
  const t0 = 0.6, dx1 = 200, T1 = 1.3, v1 = dx1 / T1, v2 = 0.35 * v1, dx2 = 70, T2 = (2 * dx2) / v2;
  tl.fromTo(blk, { x: 0 }, { x: dx1, duration: T1, ease: "none" }, b + t0);
  tl.to(blk, { x: dx1 + dx2, duration: T2, ease: "power2.out" }, b + t0 + T1);
  tl.fromTo(rod, { attr: { width: 80 } }, { attr: { width: 80 + dx1 }, duration: T1, ease: "none" }, b + t0);
  tl.to(rod, { attr: { width: 80 + dx1 + dx2 }, duration: T2, ease: "power2.out" }, b + t0 + T1);
  H.c7Run(fin, b + t0, T1 + T2, 120);
  H.c7Run(fout, b + t0, T1 + T2, 120);

  // trail ticks every 0.2 s
  const pos = (t) => (t <= T1 ? v1 * t : dx1 + dx2 * (1 - Math.pow(1 - Math.min(1, (t - T1) / T2), 2)));
  for (let t = 0; t <= T1 + T2 + 1e-6; t += 0.2) {
    const x = 490 + pos(t);
    const tk = H.el("line", { x1: H.f(x), y1: 502, x2: H.f(x), y2: 528, stroke: t < T1 ? C7.blue : C7.green, "stroke-width": 4, opacity: 0 }, g);
    tl.to(tk, { opacity: 1, duration: 0.05 }, b + t0 + t);
  }
  const zone = H.el("g", { id: "s1-v-zone", opacity: 0 }, g);
  H.el("path", { d: `M ${490 + dx1} 536 L ${490 + dx1} 546 L ${490 + dx1 + dx2} 546 L ${490 + dx1 + dx2} 536`, fill: "none", stroke: C7.green, "stroke-width": 4 }, zone);
  H.text(zone, 490 + dx1 + dx2 / 2, 582, "Cushion", { size: 28, anchor: "middle", fill: C7.green });
  const fast = H.text(g, 490 + dx1 / 2, 582, "เร็ว", { size: 28, anchor: "middle", fill: C7.blue });
  fast.setAttribute("opacity", 0);
  tl.to(fast, { opacity: 1, duration: 0.3 }, b + t0 + 0.6);
  tl.to(zone, { opacity: 1, duration: 0.3 }, b + t0 + T1 + 0.3);

  // soft stop
  const ok = H.text(g, 490 + dx1 + dx2 - 55, 214, "หยุดนุ่มนวล", { size: 34, anchor: "middle", fill: C7.green, id: "s1-v-ok" });
  tl.fromTo(ok, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)" }, b + t0 + T1 + T2 - 0.1);
}
