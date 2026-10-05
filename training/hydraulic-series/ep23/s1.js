// Title: the FRL set (Filter → Regulator → Lubricator). Air runs through; dirty particles enter the filter,
// fall to its bowl bottom; clean air leaves. The filter is framed, the other two units dim.
{
  const F = AF.frl("s1-v-art", "s1-v-f");
  F.flows.forEach((id, i) => AF.flow(id, b + 0.3, b + D, { speed: 2.5 }));
  // dirty particles in the IN pipe (wrap around; hidden once they reach the filter head)
  const pg = H.el("g", {}, "s1-v-art");
  AF.KINDS.forEach((k, i) => {
    const p = AF.particle(pg, k, 0.9, { opacity: 0 });
    const x = (t) => 16 + ((Math.max(0, t - b - 0.3) * 70 + i * 25) % 100);
    AF.fn(p, "x", x, b + 0.3, b + D, { ir: true });
    AF.fn(p, "y", () => 170 + [-5, 4, -2, 6][i], b + 0.3, b + D, { ir: true });
    AF.fn(p, "opacity", (t) => (t < b + 0.3 || x(t) > 100 ? 0 : 1), b + 0.29, b + D);
  });
  // particles in the filter bowl slide down the wall to the drain
  [[127, 240, 140, 404, "water"], [213, 250, 198, 410, "rust"], [127, 230, 152, 420, "dust"], [213, 236, 182, 402, "oil"]].forEach(([x0, y0, x1, y1, k], i) => {
    const p = AF.particle(pg, k, 0.8, { opacity: 0 });
    const t0 = b + 0.9 + i * 0.75;
    tl.fromTo(p, { x: x0, y: y0, opacity: 0 }, { opacity: 1, duration: 0.15 }, t0);
    tl.fromTo(p, { y: y0 }, { y: 385, duration: 0.7, ease: "power2.in", immediateRender: false }, t0);
    tl.fromTo(p, { x: x0, y: 385 }, { x: x1, y: y1, duration: 0.35, ease: "power2.out", immediateRender: false }, t0 + 0.7);
  });
  // focus on the filter
  tl.fromTo(F.hi, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + 1.3);
  tl.fromTo([F.units[1], F.units[2]], { opacity: 1 }, { opacity: 0.4, duration: 0.5 }, b + 1.3);
}
