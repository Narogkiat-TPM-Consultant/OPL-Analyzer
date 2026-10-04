// Title: one drop swells under a pipe union, falls into a measuring beaker — how much in a year?
{
  const P = H.$("s1-v-art"), f = H.f;
  const k = 1.6, dripX = 400, fx = dripX + 51 * k;
  const L = H.e9Line(P, 14, 786, 110, fx, { k, wet: true });
  const [dx, dy] = L.drip;

  // drop size (OPL 5-B-1): 0.05 cm³, about 4.5 mm in diameter
  const tag = H.el("g", { id: "s1-v-tag" }, P);
  H.el("path", { d: `M 452 230 L 436 222`, stroke: E9.muted, "stroke-width": 3, fill: "none" }, tag);
  H.text(tag, 460, 240, "1 หยด ≈ 0.05 cm³", { size: 38 });
  H.text(tag, 460, 290, "Φ ≈ 4.5 mm", { size: 36, fill: E9.blue });

  // measuring beaker with graduations
  const bx = 290, by = 316, bw = 220, bh = 230;
  H.el("rect", { x: bx, y: by, width: bw, height: bh, rx: 10, fill: "#eef3fb", stroke: E9.ink, "stroke-width": 5 }, P);
  const lvl = H.el("rect", { id: "s1-v-lvl", x: bx + 5, y: by + bh - 5, width: bw - 10, height: 0, fill: E9.oil }, P);
  for (let i = 1; i <= 4; i++) H.el("line", { x1: bx, y1: by + bh - i * 38, x2: bx + (i % 2 ? 26 : 42), y2: by + bh - i * 38, stroke: E9.ink, "stroke-width": 3 }, P);
  H.el("line", { x1: bx - 14, y1: by, x2: bx + bw + 14, y2: by, stroke: E9.ink, "stroke-width": 6, "stroke-linecap": "round" }, P);

  const q = H.el("g", { id: "s1-v-q" }, P);
  H.text(q, 540, 430, "1 ปี", { size: 48 });
  H.text(q, 540, 494, "= ? ลิตร", { size: 52, fill: E9.blue });

  // motion: drops every 1.4 s; the beaker level creeps up; the question pops
  const s = 30, dist = by + bh - 30 - (dy + 2.75 * s);
  H.e9Drip(P, dx, dy, s, dist, 1.25, b + 0.4, b + D - 0.2, { fall: 0.55 });
  tl.fromTo(lvl, { attr: { y: by + bh - 5, height: 0 } }, { attr: { y: by + bh - 29, height: 24 }, duration: D - 1.6, ease: "none" }, b + 1.5);
  tl.fromTo(tag, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, b + 1.0);
  tl.fromTo(q, { opacity: 0, scale: 0.7, svgOrigin: "600 460" }, { opacity: 1, scale: 1, svgOrigin: "600 460", duration: 0.4, ease: "back.out(2)" }, b + 2.2);
}
