// Filter check every 6 months (OPL 5-C-7): indicator colours as on the deck figure — Red (clean) top,
// Yellow (warning) middle, Green (OK) bottom — and a vacuum meter with the 10 cmHg limit.
{
  const K = K18, st = T.stamps;
  // Indicator: round fitting (spiral) + 3-colour column; a pointer marks the active colour.
  const ind = (pid, id) => {
    const g = H.el("g", { id }, H.$(pid));
    H.el("rect", { x: 150, y: 70, width: 70, height: 30, fill: K.metal, stroke: K.ink, "stroke-width": 4 }, g);
    H.el("circle", { cx: 120, cy: 85, r: 52, fill: K.metal, stroke: K.ink, "stroke-width": 5 }, g);
    H.el("circle", { cx: 120, cy: 85, r: 32, fill: K.paper, stroke: K.ink, "stroke-width": 4 }, g);
    H.el("path", { d: "M 120 85 m -4 0 a 4 4 0 1 1 8 0 a 9 9 0 1 1 -17 0 a 14 14 0 1 1 27 0 a 19 19 0 1 1 -37 0", fill: "none", stroke: K.ink, "stroke-width": 3 }, g);
    H.el("rect", { x: 216, y: 14, width: 96, height: 142, rx: 10, fill: K.paper, stroke: K.ink, "stroke-width": 5 }, g);
    const cells = {};
    [["r", K.red, 24], ["y", K.yellow, 68], ["g", K.green, 112]].forEach(([k, col, y]) => {
      cells[k] = H.el("rect", { x: 228, y, width: 72, height: 36, fill: col, stroke: K.ink, "stroke-width": 3, opacity: 0.22 }, g);
    });
    const lbl = [["Red", 48], ["Yellow", 92], ["Green", 136]];
    lbl.forEach(([s, y]) => H.text(g, 372, y, s, { size: 22, fill: K.muted, weight: 600 }));
    const ptr = H.el("path", { d: "M 318 130 L 342 118 L 342 142 Z", fill: K.ink }, g);
    return { g, cells, ptr, y: { r: 42 - 130, y: 86 - 130, g: 0 } };
  };
  const on = (cell, t) => H.g18Op(cell, 0.22, 1, t, 0.25, false);

  // OK — green
  const A = ind("s7-v-g", "s7-v-ia");
  H.g18Op(A.cells.g, 0.22, 1, b + st[0] + 0.1, 0.25);
  // yellow → red: the pointer climbs, both are "clean the filter"
  const B = ind("s7-v-yr", "s7-v-ib");
  H.g18Op(B.cells.g, 0.22, 1, b + 0.1, 0.01);
  const t2 = b + st[1] + 0.1;
  H.g18Op(B.cells.g, 1, 0.22, t2, 0.25, false);
  tl.fromTo(B.ptr, { y: 0 }, { y: B.y.y, duration: 0.5, ease: "power2.inOut" }, t2);
  on(B.cells.y, t2 + 0.3);
  tl.fromTo(B.ptr, { y: B.y.y }, { y: B.y.r, duration: 0.5, ease: "power2.inOut", immediateRender: false }, t2 + 1.0);
  on(B.cells.r, t2 + 1.3);

  // Vacuum meter (scale range not given in the deck: only 0 and the 10 cmHg limit are labelled)
  const vg = H.$("s7-v-vac");
  const V = H.g18Dial(vg, 230, 88, 76, { id: "s7-v-vm", min: 0, max: 30, minor: 1, labels: [0], labelSize: 18, unit: "cmHg", value: 0 });
  const [m1x, m1y] = V.pt(10, V.r * 0.6), [m2x, m2y] = V.pt(10, V.r * 0.92);
  H.el("line", { x1: H.f(m1x), y1: H.f(m1y), x2: H.f(m2x), y2: H.f(m2y), stroke: K.red, "stroke-width": 6 }, V.g);
  const [lx, ly] = V.pt(10, V.r * 0.42);
  H.text(V.g, lx + 4, ly + 8, "10", { size: 20, anchor: "middle", fill: K.red });
  H.g18Needle(V, 0, 14, b + st[2] + 0.2, 1.0, "power2.out");
}
