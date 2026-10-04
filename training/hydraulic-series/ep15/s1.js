// Title: the pressure gauge while the machine runs. The needle comes up to its normal reading (blue mark) and keeps
// swinging slightly inside the green band (normal ±3 kgf/cm², OPL 5-C-3). The four check items pop in on the right.
{
  const g = H.$("s1-v-t");
  const cx = 270, cy = 296, r = 190;
  // pipe under the gauge, oil flowing
  H.el("path", { d: `M ${cx} ${cy + r - 4} L ${cx} 560`, fill: "none", stroke: C15.blue, "stroke-width": 14 }, g);
  H.el("rect", { x: cx - 26, y: cy + r - 2, width: 52, height: 26, rx: 4, fill: C15.metal, stroke: C15.ink, "stroke-width": 4 }, g);
  H.el("path", { d: "M 24 566 L 516 566", fill: "none", stroke: C15.blue, "stroke-width": 20 }, g);
  const fl = H.el("path", { id: "s1-v-fl", d: "M 24 566 L 516 566", fill: "none", stroke: "#ffffff", "stroke-width": 5, "stroke-dasharray": "10 20", "stroke-linecap": "butt", opacity: 0 }, g);
  tl.fromTo(fl, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, b + 0.3);
  tl.fromTo(fl, { strokeDashoffset: 0 }, { strokeDashoffset: -30 * Math.round((D - 0.3) * 3), duration: D - 0.3, ease: "none", immediateRender: false }, b + 0.3);

  // gauge: green band N ± 3, blue mark = normal reading; no numbers (the OPL gives the band only)
  const G = H.gauge(g, cx, cy, r, {
    id: "s1-v-g", min: G15.min, max: G15.max, ok: [G15.N - G15.band, G15.N + G15.band], ticks: 6, minor: 4, labelEvery: 99,
    value: G15.min, marks: [{ v: G15.N, color: C15.blue, id: "s1-v-gn" }],
  });
  const lab = (v, s) => {
    const a = (G.rot(v) * Math.PI) / 180;
    H.text(g, cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r * 1.2 + 12, s, { size: 36, anchor: "middle", fill: C15.green });
  };
  lab(G15.N - G15.band, "−3");
  lab(G15.N + G15.band, "+3");
  H.legend15(g, cx - 92, cy + 92, C15.blue, "ค่าปกติ", 30, 32);
  H.legend15(g, cx - 92, cy + 140, C15.green, "±3 kgf/cm²", 30, 32);

  // needle: up to the normal reading, then a slight swing that stays inside the band (amplitude 1.6 < 3)
  H.needle15(G, (t) => {
    const u = clamp01((t - b - 0.3) / 1.2), e = 1 - (1 - u) ** 3;
    return G15.min + (G15.N - G15.min) * e + 1.6 * H.env(t, b + 1.5, b + D, 0.4) * H.wob(t * 0.32, 0.4);
  }, b, b + D, true);

  // four check items
  const x = 560, rows = [125, 255, 385, 515];
  const items = [
    ["เสียง", (p) => H.ear15(p, "s1-v-i1", x, rows[0], 0.82)],
    ["เกจ", (p) => {
      const q = H.el("g", { id: "s1-v-i2" }, p);
      H.gauge(q, x, rows[1], 38, { id: "s1-v-gi", min: G15.min, max: G15.max, ok: [G15.N - G15.band, G15.N + G15.band], ticks: 6, labelEvery: 99, value: G15.N + 1 });
      return q;
    }],
    ["สั่น / ร้อน", (p) => {
      const q = H.el("g", { id: "s1-v-i3" }, p);
      H.el("rect", { x: x - 40, y: rows[2] + 30, width: 80, height: 14, rx: 3, fill: C15.dark, stroke: C15.ink, "stroke-width": 3 }, q);
      H.hand15(q, "s1-v-hand", x, rows[2] + 30, 0.4);
      for (const dx of [-30, 30]) H.el("path", { d: H.heatD(x + dx, rows[2] + 24, 30), fill: "none", stroke: C15.heat, "stroke-width": 4, "stroke-linecap": "round" }, q);
      return q;
    }],
    ["เคลื่อนที่", (p) => {
      const q = H.el("g", { id: "s1-v-i4" }, p);
      const W = H.stopwatch(q, x, rows[3] + 4, 36, { id: "s1-v-w", color: C15.blue });
      tl.fromTo(W.ring, { strokeDashoffset: W.offset(0) }, { strokeDashoffset: W.offset(0.7), duration: 1.6, ease: "none" }, b + 2.8);
      tl.fromTo(W.hand, { rotation: 0, svgOrigin: W.origin }, { rotation: W.rot(0.7), svgOrigin: W.origin, duration: 1.6, ease: "none" }, b + 2.8);
      return q;
    }],
  ];
  items.forEach(([s, draw], k) => {
    const q = draw(g);
    const t = H.text(g, x + 52, rows[k] + 12, s, { size: 34 });
    tl.fromTo([q, t], { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(2)" }, b + 1.8 + 0.25 * k);
  });
}
