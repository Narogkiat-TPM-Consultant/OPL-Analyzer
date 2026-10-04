// Three damage signs (OPL 5-C-12 p.33). Each card starts as a normal-looking hose and the defect develops
// when its NG stamp lands (= its narration segment): ① bend at the fitting → reinforcing wire cut (magnifier),
// ② swelling within 500 mm of the fitting, ③ clamp screw missing → the clamp swivels / has play.
const st = T.stamps;
const f = H.f;

// ① bent near the metal part → reinforced wire cut ------------------------------------------------------------
{
  const c = H.$("s3-v-c1"), t0 = b + st[0];
  const dGentle = "M 150 52 C 250 52 300 84 304 160";
  const dKink = "M 150 52 C 170 52 182 58 184 160";
  const hz = H.hzHose(c, dGentle, { w: 26 });
  H.hzFit(c, 150, 52, 0, { k: 0.8 });
  H.hzMorph(hz.paths, dGentle, dKink, t0 + 0.2, 0.7);
  H.hzRing(c, 173, 70, 32, 32, t0 + 1.0, 3);
  // magnifier on the braided reinforcing wire
  const cx = 374, cy = 92, r = 62;
  const link = H.el("line", { x1: 205, y1: 76, x2: cx - r, y2: cy - 6, stroke: Z.red, "stroke-width": 3, "stroke-dasharray": "7 6", opacity: 0 }, c);
  const mag = H.el("g", { opacity: 0 }, c);
  const defs = H.el("defs", {}, mag);
  const cp = H.el("clipPath", { id: "s3-v-clip1" }, defs);
  H.el("circle", { cx, cy, r: r - 2 }, cp);
  H.el("circle", { cx, cy, r, fill: "#2c3036" }, mag);
  const wires = H.el("g", { "clip-path": "url(#s3-v-clip1)" }, mag);
  for (let o = -112; o <= 112; o += 15) {
    H.el("line", { x1: cx + o - 80, y1: cy - 80, x2: cx + o + 80, y2: cy + 80, stroke: "#aeb4bc", "stroke-width": 5 }, wires);
    H.el("line", { x1: cx + o + 80, y1: cy - 80, x2: cx + o - 80, y2: cy + 80, stroke: "#d6dade", "stroke-width": 4 }, wires);
  }
  // the cut: a jagged gap across the braid with frayed red wire ends
  const cut = H.el("g", { opacity: 0 }, wires);
  const pts = (y0, a) => Array.from({ length: 11 }, (_, i) => `${f(cx - 75 + i * 15)} ${f(y0 + (i % 2 ? a : -a))}`);
  const top = pts(cy - 9, 5), bot = pts(cy + 9, 5);
  H.el("path", { d: `M ${top.join(" L ")} L ${bot.slice().reverse().join(" L ")} Z`, fill: "#2c3036" }, cut);
  H.el("path", { d: `M ${top.join(" L ")}`, fill: "none", stroke: Z.red, "stroke-width": 5 }, cut);
  H.el("path", { d: `M ${bot.join(" L ")}`, fill: "none", stroke: Z.red, "stroke-width": 5 }, cut);
  H.el("circle", { cx, cy, r, fill: "none", stroke: Z.ink, "stroke-width": 6 }, mag);
  H.hzOp(link, 0, 1, t0 + 2.3, 0.25);
  tl.fromTo(mag, { opacity: 0, scale: 0.3, svgOrigin: `${cx} ${cy}` }, { opacity: 1, scale: 1, svgOrigin: `${cx} ${cy}`, duration: 0.35, ease: "back.out(1.6)" }, t0 + 2.4);
  H.hzOp(cut, 0, 1, t0 + 3.0, 0.25);
}

// ② swelling within 500 mm of the fitting ---------------------------------------------------------------------
{
  const c = H.$("s3-v-c2"), t0 = b + st[1];
  const y = 66, rr = 13, x0 = 142, x1 = 450, bx = 262, hw = 52;
  const bulge = (A) => {
    const top = y - rr, bot = y + rr;
    return `M ${x0} ${top} L ${bx - hw} ${top} C ${bx - 28} ${top} ${bx - 26} ${f(top - A)} ${bx} ${f(top - A)} C ${bx + 26} ${f(top - A)} ${bx + 28} ${top} ${bx + hw} ${top} L ${x1} ${top} ` +
      `L ${x1} ${bot} L ${bx + hw} ${bot} C ${bx + 28} ${bot} ${bx + 26} ${f(bot + A)} ${bx} ${f(bot + A)} C ${bx - 26} ${f(bot + A)} ${bx - 28} ${bot} ${bx - hw} ${bot} L ${x0} ${bot} Z`;
  };
  const hose = H.el("path", { d: bulge(0), fill: Z.hose, stroke: Z.ink, "stroke-width": 4, "stroke-linejoin": "round" }, c);
  H.hzFit(c, x0, y, 0, { k: 0.8 });
  tl.fromTo(hose, { attr: { d: bulge(0) } }, { attr: { d: bulge(17) }, duration: 0.9, ease: "power2.out", immediateRender: false }, t0 + 0.4);
  const bub = H.el("g", { opacity: 0 }, c);
  [[244, 58, 4], [256, 50, 3], [268, 60, 4.5], [281, 52, 3]].forEach(([x, yy, r]) => H.el("circle", { cx: x, cy: yy, r, fill: "none", stroke: Z.metal, "stroke-width": 2 }, bub));
  H.hzOp(bub, 0, 1, t0 + 1.0, 0.3);
  H.hzRing(c, bx, y, 66, 42, t0 + 1.3, 3);
  // 500 mm dimension from the end of the fitting
  const dim = H.el("g", { opacity: 0 }, c);
  const xe = 372, yd = 128;
  for (const x of [x0, xe]) H.el("line", { x1: x, y1: 90, x2: x, y2: yd + 10, stroke: Z.muted, "stroke-width": 2.5, "stroke-dasharray": "6 5" }, dim);
  H.el("path", { d: H.dimD(x0 + 2, yd, xe - 2, yd, 12), fill: "none", stroke: Z.blue, "stroke-width": 3.5 }, dim);
  H.text(dim, (x0 + xe) / 2, 157, "500 mm", { size: 25, anchor: "middle", fill: Z.blue });
  H.hzOp(dim, 0, 1, t0 + 1.9, 0.3);
}

// ③ lock clamp loose — the lower screw is missing, the clamp swivels on the upper one ---------------------------
{
  const c = H.$("s3-v-c3"), t0 = b + st[2];
  H.el("rect", { x: 150, y: 98, width: 160, height: 60, rx: 4, fill: Z.wall, stroke: Z.ink, "stroke-width": 3 }, c);
  const hose = H.hzHose(c, "M 12 52 L 448 52", { w: 28 });
  const clamp = H.el("g", {}, c);
  H.el("rect", { x: 214, y: 72, width: 32, height: 78, rx: 6, fill: Z.metal, stroke: Z.ink, "stroke-width": 4 }, clamp);
  H.el("rect", { x: 210, y: 29, width: 40, height: 47, rx: 10, fill: Z.metal, stroke: Z.ink, "stroke-width": 4 }, clamp);
  H.el("path", { d: H.hexD(230, 100, 11), fill: Z.dark, stroke: Z.ink, "stroke-width": 3 }, clamp);
  H.el("circle", { cx: 230, cy: 100, r: 3.5, fill: Z.ink }, clamp);
  const hole = H.el("circle", { cx: 230, cy: 132, r: 6, fill: Z.ink }, clamp);
  const screw = H.el("g", {}, c);
  H.el("path", { d: H.hexD(230, 132, 11), fill: Z.dark, stroke: Z.ink, "stroke-width": 3 }, screw);
  H.el("circle", { cx: 230, cy: 132, r: 3.5, fill: Z.ink }, screw);
  // unscrews, then drops out of the picture
  tl.fromTo(screw, { rotation: 0, svgOrigin: "230 132" }, { rotation: -200, svgOrigin: "230 132", duration: 0.5, ease: "power1.in" }, t0 + 0.3);
  tl.fromTo(screw, { x: 0, y: 0, opacity: 1 }, { x: 46, y: 40, opacity: 0, duration: 0.55, ease: "power2.in", immediateRender: false }, t0 + 0.8);
  const arr = H.el("g", { opacity: 0 }, c);
  H.el("path", { d: "M 252 136 Q 290 136 296 150", fill: "none", stroke: Z.ink, "stroke-width": 4 }, arr);
  H.el("path", { d: "M 288 146 L 298 160 L 303 144 Z", fill: Z.ink }, arr);
  H.hzOp(arr, 0, 1, t0 + 0.8, 0.2);
  H.hzOp(arr, 1, 0, t0 + 2.4, 0.3);
  H.hzRing(c, 230, 120, 44, 54, t0 + 1.4, 3);
  // play: the clamp swivels about the remaining screw, the hose shakes with it
  const tA = t0 + 1.4, tB = b + D;
  H.hzFn(clamp, "rotation", (t) => 7 * H.hzEnv(t, tA, tB, 0.3) * H.hzWob(t * 0.8, 0.4), tA, tB, { extra: { svgOrigin: "230 100" } });
  H.hzFn(hose.g, "y", (t) => 3 * H.hzEnv(t, tA, tB, 0.3) * H.hzWob(t * 0.8, 2.1), tA, tB);
}
