// Title: interval timeline 0 → 12 months over a running air circuit. A marker runs along the months; every
// 3 months a magnifier pops (3-month inspection), at 12 months a wrench joins it (1-year overhaul inspection).
{
  const root = H.$("s1-v-u");
  const tg = H.el("g", { id: "s1-v-tl" }, root);
  const X = (m) => 70 + 60 * m, Y = 120;
  H.el("line", { x1: X(0), y1: Y, x2: X(12) + 20, y2: Y, stroke: PN.muted, "stroke-width": 6, "stroke-linecap": "round" }, tg);
  const prog = H.el("line", { id: "s1-v-prog", x1: X(0), y1: Y, x2: X(12), y2: Y, stroke: PN.pipe, "stroke-width": 8, "stroke-linecap": "butt" }, tg);
  for (let m = 0; m <= 12; m++) H.el("line", { x1: X(m), y1: Y - (m % 3 ? 7 : 14), x2: X(m), y2: Y + (m % 3 ? 7 : 14), stroke: PN.ink, "stroke-width": m % 3 ? 2 : 4 }, tg);
  [[0, "0"], [3, "3"], [6, "6"], [9, "9"], [12, "12 เดือน"]].forEach(([m, s]) => H.text(tg, X(m), Y + 48, s, { size: 28, anchor: "middle", fill: PN.muted }));
  const marker = H.el("circle", { id: "s1-v-mk", cx: X(0), cy: Y, r: 13, fill: PN.paper, stroke: PN.pipe, "stroke-width": 6 }, tg);

  // magnifier icon at (x, y)
  const mag = (id, x, y, s = 1) => {
    const g = H.el("g", { id, opacity: 0 }, tg);
    H.el("line", { x1: x + 11 * s, y1: y + 11 * s, x2: x + 24 * s, y2: y + 24 * s, stroke: PN.ink, "stroke-width": 7 * s, "stroke-linecap": "round" }, g);
    H.el("circle", { cx: x, cy: y, r: 16 * s, fill: PN.pale, stroke: PN.pipe, "stroke-width": 5 * s }, g);
    return g;
  };
  // wrench icon at (x, y)
  const wrench = (id, x, y) => {
    const g = H.el("g", { id, opacity: 0 }, tg);
    const w = H.el("g", { transform: `rotate(-40 ${x} ${y})` }, g);
    H.el("rect", { x: x - 6, y: y - 4, width: 12, height: 46, rx: 5, fill: PN.dark, stroke: PN.ink, "stroke-width": 3 }, w);
    H.el("path", { d: `M ${x - 16} ${y - 26} A 17 17 0 1 0 ${x + 16} ${y - 26} L ${x + 8} ${y - 26} L ${x + 8} ${y - 12} L ${x - 8} ${y - 12} L ${x - 8} ${y - 26} Z`, fill: PN.dark, stroke: PN.ink, "stroke-width": 3, "stroke-linejoin": "round" }, w);
    return g;
  };
  const icons = [3, 6, 9].map((m) => mag(`s1-v-m${m}`, X(m), Y - 56));
  const m12 = mag("s1-v-m12", X(12) - 26, Y - 58);
  const wr = wrench("s1-v-wr", X(12) + 26, Y - 52);
  const t3 = H.el("g", { id: "s1-v-l3", opacity: 0 }, tg);
  H.el("rect", { x: X(3) - 70, y: Y + 66, width: 140, height: 44, rx: 10, fill: PN.pipe }, t3);
  H.text(t3, X(3), Y + 97, "ทุก 3 เดือน", { size: 26, anchor: "middle", fill: "#ffffff" });
  const t12 = H.el("g", { id: "s1-v-l12", opacity: 0 }, tg);
  H.el("rect", { x: X(12) - 66, y: Y + 66, width: 132, height: 44, rx: 10, fill: PN.ink }, t12);
  H.text(t12, X(12), Y + 97, "ทุก 1 ปี", { size: 26, anchor: "middle", fill: "#ffffff" });

  // the circuit runs below
  const C = H.pnCircuit(root, "s1-v-c", { transform: "translate(10 262) scale(0.48)" });
  H.pnFlowOn(C.flows.main, b + 0.3, b + D - 0.1);
  H.pnCycle(C, b + 0.8, b + D - 0.2, () => 0.8, 0.4);

  // marker travels 0 → 12 months
  const t0 = b + 0.7, t1 = b + Math.max(3.6, D - 1.4);
  const tm = (m) => t0 + ((t1 - t0) * m) / 12;
  tl.fromTo(marker, { attr: { cx: X(0) } }, { attr: { cx: X(12) }, duration: t1 - t0, ease: "none" }, t0);
  tl.fromTo(prog, { attr: { x2: X(0) } }, { attr: { x2: X(12) }, duration: t1 - t0, ease: "none" }, t0);
  [3, 6, 9].forEach((m, i) => tl.fromTo(icons[i], { opacity: 0, scale: 0.4, svgOrigin: `${X(m)} ${Y - 56}` }, { opacity: 1, scale: 1, svgOrigin: `${X(m)} ${Y - 56}`, duration: 0.3, ease: "back.out(2)" }, tm(m)));
  tl.fromTo(t3, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 }, tm(3) + 0.1);
  tl.fromTo(m12, { opacity: 0, scale: 0.4, svgOrigin: `${X(12) - 26} ${Y - 58}` }, { opacity: 1, scale: 1, svgOrigin: `${X(12) - 26} ${Y - 58}`, duration: 0.3, ease: "back.out(2)" }, tm(12));
  tl.fromTo(wr, { opacity: 0, scale: 0.4, svgOrigin: `${X(12) + 26} ${Y - 52}` }, { opacity: 1, scale: 1, svgOrigin: `${X(12) + 26} ${Y - 52}`, duration: 0.35, ease: "back.out(2)" }, tm(12) + 0.15);
  tl.fromTo(t12, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 }, tm(12) + 0.2);
}
