// Exhaust port of the direction valve (OPL 5'-C-2 Table 1, p.45): each card shows what comes out of the
// silencer as its stamp hits — 1 too little oil (clear air only), 2 too much (heavy mist, oil drips + puddle),
// 3 leak (air keeps hissing) with the causes from the deck in a mini cross-section: dust on the valve seat
// lifts the poppet, cut on the seat, spring broken / rusty.
{
  const ST = T.stamps.map((s) => b + s);
  const valve = (g, x, w = 300) => {
    H.el("rect", { x: x - w / 2, y: 6, width: w, height: 40, rx: 6, fill: PN.metal, stroke: PN.ink, "stroke-width": 4 }, g);
    H.el("rect", { x: x - w / 2, y: 6, width: 50, height: 40, rx: 6, fill: PN.knob, stroke: PN.ink, "stroke-width": 4 }, g);
    H.el("rect", { x: x - 13, y: 46, width: 26, height: 8, fill: PN.dark, stroke: PN.ink, "stroke-width": 2.5 }, g);
    H.el("rect", { x: x - 20, y: 53, width: 40, height: 46, rx: 8, fill: "#d9d4c7", stroke: PN.ink, "stroke-width": 3.5 }, g);
    for (let yy = 62; yy <= 92; yy += 8) for (let xx = x - 10; xx <= x + 10; xx += 10) H.el("circle", { cx: xx, cy: yy, r: 2.2, fill: PN.muted }, g);
  };
  const puffs = (g, id, x, mist, t0, t1, every = 1.1) => {
    const p = H.pnPuff(g, id, x, 96, { mist, s: 1.45 });
    let first = true;
    for (let t = t0; t + 0.85 <= t1; t += every) { H.pnPuffAt(p, t, !first); first = false; }
    return p;
  };
  const end = b + D - 0.1;

  // 1 — too little: only clear air comes out
  const g1 = H.$("s3-v-c1");
  valve(g1, 230);
  puffs(g1, "s3-v-p1", 230, 0, ST[0] + 0.15, end);

  // 2 — too much: heavy oil mist, drips and a growing puddle
  const g2 = H.$("s3-v-c2");
  valve(g2, 230);
  const pud = H.el("ellipse", { id: "s3-v-pud", cx: 230, cy: 180, rx: 46, ry: 7, fill: PN.oil, stroke: "#b8921c", "stroke-width": 2 }, g2);
  puffs(g2, "s3-v-p2", 230, 2, ST[1] + 0.15, end);
  tl.fromTo(pud, { scaleX: 0.15, opacity: 0, svgOrigin: "230 180" }, { scaleX: 1, opacity: 1, svgOrigin: "230 180", duration: Math.max(1, end - ST[1] - 0.6), ease: "power1.out" }, ST[1] + 0.4);
  for (let i = 0, t = ST[1] + 0.3; t + 0.5 <= end && i < 12; i++, t += 0.55) {
    const dr = H.el("path", { id: `s3-v-od${i}`, d: H.pnDropD(i % 2 ? 240 : 220, 108, 0.8), fill: PN.oil, stroke: "#b8921c", "stroke-width": 1.2, opacity: 0 }, g2);
    tl.fromTo(dr, { opacity: 0 }, { opacity: 1, duration: 0.05 }, t);
    tl.fromTo(dr, { y: 0 }, { y: 62, duration: 0.45, ease: "power1.in" }, t);
    tl.to(dr, { opacity: 0, duration: 0.1 }, t + 0.4);
  }

  // 3 — leak: air keeps hissing out; inset: dust under the poppet / cut on the seat / broken spring
  const g3 = H.$("s3-v-c3");
  valve(g3, 140, 230);
  const hs = H.pnHiss(g3, "s3-v-hs", 140, 112, 90, 1.35);
  tl.fromTo(hs, { opacity: 0 }, { opacity: 1, duration: 0.2 }, ST[2] + 0.1);
  tl.fromTo(hs, { scale: 0.85, svgOrigin: "140 112" }, { scale: 1.12, svgOrigin: "140 112", duration: 0.28, yoyo: true, repeat: 2 * Math.max(1, Math.floor((end - ST[2] - 0.2) / 0.56)) - 1, ease: "sine.inOut" }, ST[2] + 0.1);
  const ins = H.el("g", { id: "s3-v-ins" }, g3);
  H.el("rect", { x: 272, y: 10, width: 176, height: 170, rx: 10, fill: "#f4f1ea", stroke: PN.ink, "stroke-width": 3 }, ins);
  // seat blocks (opening in the middle), poppet held up by a dust grain, stem + spring
  H.el("rect", { x: 282, y: 124, width: 62, height: 30, fill: PN.metal, stroke: PN.ink, "stroke-width": 3 }, ins);
  H.el("rect", { x: 376, y: 124, width: 62, height: 30, fill: PN.metal, stroke: PN.ink, "stroke-width": 3 }, ins);
  H.el("path", { d: "M 406 124 L 412 133 L 418 124", fill: PN.paper, stroke: PN.red, "stroke-width": 3 }, ins);
  const pop = H.el("g", { id: "s3-v-pop" }, ins);
  H.el("rect", { x: 326, y: 104, width: 68, height: 14, rx: 3, fill: PN.dark, stroke: PN.ink, "stroke-width": 3 }, pop);
  H.el("rect", { x: 354, y: 58, width: 12, height: 46, fill: PN.dark, stroke: PN.ink, "stroke-width": 2.5 }, pop);
  H.el("circle", { cx: 336, cy: 121, r: 5, fill: PN.dirt }, ins);
  H.el("path", { d: "M 344 36 L 376 44 L 344 52 L 376 60 M 344 72 L 376 80 L 344 88 L 376 96", fill: "none", stroke: PN.ink, "stroke-width": 3.5 }, ins);
  H.el("path", { d: "M 376 60 L 368 63 M 344 72 L 352 69", fill: "none", stroke: PN.ink, "stroke-width": 3.5 }, ins);
  for (const [cx, cy] of [[350, 46], [370, 90]]) H.el("circle", { cx, cy, r: 3.5, fill: PN.dirt }, ins);
  const rr = H.el("g", { id: "s3-v-rr", opacity: 0 }, ins);
  H.el("circle", { cx: 336, cy: 120, r: 15, fill: "none", stroke: PN.red, "stroke-width": 3.5 }, rr);
  H.el("path", { d: "M 340 66 L 382 66", fill: "none", stroke: PN.red, "stroke-width": 3.5, "stroke-dasharray": "6 5" }, rr);
  // air sneaking past the poppet
  const sneak = H.el("path", { id: "s3-v-sn", d: "M 360 172 L 360 140 Q 360 124 318 122 L 300 114", fill: "none", stroke: PN.flow, "stroke-width": 4, "stroke-dasharray": "8 8", opacity: 0 }, ins);
  H.text(ins, 312, 174, "Seat", { size: 20, anchor: "middle", fill: PN.muted });
  H.text(ins, 410, 40, "Spring", { size: 20, anchor: "middle", fill: PN.muted });
  tl.fromTo(rr, { opacity: 0 }, { opacity: 1, duration: 0.3 }, ST[2] + 0.5);
  tl.fromTo(sneak, { opacity: 0 }, { opacity: 1, duration: 0.2 }, ST[2] + 0.2);
  tl.fromTo(sneak, { strokeDashoffset: 0 }, { strokeDashoffset: -16 * Math.round((end - ST[2]) * 4), duration: end - ST[2] - 0.2, ease: "none", immediateRender: false }, ST[2] + 0.2);
  tl.fromTo(pop, { y: 0 }, { y: -2, duration: 0.12, yoyo: true, repeat: 2 * Math.max(1, Math.floor((end - ST[2] - 0.3) / 0.24)) - 1 }, ST[2] + 0.3);
}
