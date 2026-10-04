// Why: left = residual pressure (needle not at 0) → loosening a fitting sprays oil; right = cleaning is
// inspection: a rag wipes the dusty tank wall and uncovers an oil streak.
{
  const c = T.cues;
  // ---- left card: residual pressure
  const L = H.$("s2-v-l");
  const R = (P, x, y, w, h, fill, sw = 4, rx = 4) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: K6.ink, "stroke-width": sw }, P);
  H.el("path", { d: "M 120 196 L 120 212 L 740 212", fill: "none", stroke: K6.blue, "stroke-width": 16, "stroke-linejoin": "round" }, L);
  const G = H.gauge(L, 120, 110, 84, { id: "s2-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, labelSize: 24, value: 5 });
  // residual-pressure arc 0 → needle (red)
  H.el("path", { d: H.arcD(120, 110, 84 * 0.8, G.rot(0), G.rot(5)), fill: "none", stroke: K6.red, "stroke-width": 11, opacity: 0.85 }, L);
  // union fitting on the line (side view: two nuts + body)
  const nut = (x) => { R(L, x, 186, 40, 52, K6.metal, 3.5, 4); H.el("path", { d: `M ${x + 11} 186 L ${x + 11} 238 M ${x + 29} 186 L ${x + 29} 238`, stroke: K6.ink, "stroke-width": 2, opacity: 0.6 }, L); };
  R(L, 426, 194, 48, 36, K6.dark, 3.5, 3);
  nut(386); nut(474);
  // spanner on the left nut (rotates = loosening)
  const sp = H.el("g", { id: "s2-v-sp" }, L);
  H.el("path", { d: "M 406 186 L 396 166 L 330 40 L 350 30 L 418 156 L 432 176 Z", fill: K6.dark, stroke: K6.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, sp);
  H.el("path", { d: "M 384 170 Q 382 196 406 204 Q 430 196 428 170", fill: "none", stroke: K6.ink, "stroke-width": 4 }, sp);
  // oil jet from the joint
  const jet = H.el("g", { id: "s2-v-jet", opacity: 0 }, L);
  for (const [x2, y2] of [[520, 40], [560, 70], [590, 110], [600, 150]])
    H.el("path", { d: `M 474 194 L ${x2} ${y2}`, fill: "none", stroke: K6.oil, "stroke-width": 9, "stroke-linecap": "round", "stroke-dasharray": "26 12" }, jet);
  for (const [x, y] of [[620, 60], [640, 104], [608, 30]]) H.el("path", { d: H.k16DropD(x, y, 8), fill: K6.oil, stroke: K6.oilDk, "stroke-width": 2 }, jet);
  const tL = b + T.left, tDanger = b + c[0] + Math.min(4.0, Math.max(1.4, (c[1] - c[0]) * 0.55));
  tl.fromTo(G.needle, { rotation: G.rot(5), svgOrigin: G.origin }, { rotation: G.rot(5.3), svgOrigin: G.origin, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, tL + 0.8);
  tl.fromTo(sp, { rotation: 0, svgOrigin: "406 210" }, { rotation: -14, svgOrigin: "406 210", duration: 0.5, ease: "power2.inOut" }, tDanger);
  tl.fromTo(jet, { opacity: 0, scale: 0.3, svgOrigin: "474 194" }, { opacity: 1, scale: 1, svgOrigin: "474 194", duration: 0.35, ease: "power2.out" }, tDanger + 0.45);
  tl.to(jet, { scale: 1.06, svgOrigin: "474 194", duration: 0.2, yoyo: true, repeat: 5, ease: "sine.inOut" }, tDanger + 0.85);

  // ---- right card: wipe the dusty tank wall → the oil streak shows
  const Rt = H.$("s2-v-r");
  R(Rt, 20, 44, 720, 186, K6.tank, 5, 6);
  R(Rt, 10, 30, 740, 16, K6.metal, 4, 3);
  H.k16Streak(Rt, 400, 47, 168, 22, { drop: 9 });
  const defs = H.el("defs", {}, Rt);
  const cp = H.el("clipPath", { id: "s2-v-dclip" }, defs);
  const clip = H.el("rect", { x: 23, y: 47, width: 714, height: 180 }, cp);
  const dust = H.el("g", { "clip-path": "url(#s2-v-dclip)" }, Rt);
  H.el("rect", { x: 23, y: 47, width: 714, height: 180, fill: K6.dust, opacity: 0.6 }, dust);
  H.k16Specks(dust, 30, 730, 52, 222, 90, { r: 3.6, fill: "#5d523e", op: 0.55 });
  const rag = H.k16Rag(Rt, "s2-v-rag", { s: 1.2 });
  const tR = b + T.right, tA = tR + 0.5, tB = tR + Math.max(2.6, Math.min(4.2, D - T.right - 1.6));
  const u = (t) => H.k16Clamp((t - tA) / (tB - tA));
  const front = (t) => 23 + 714 * u(t);
  const xs = (t) => 30 + 690 * u(t);
  const ys = (t) => 130 + 52 * Math.sin(2 * Math.PI * 4 * u(t));
  tl.fromTo(rag.g, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tA - 0.25);
  H.k16Fn(rag.g, "x", xs, tA - 0.3, tB, { ir: true });
  H.k16Fn(rag.g, "y", ys, tA - 0.3, tB, { ir: true });
  H.k16Fn(clip, "x", front, tA - 0.3, tB, { attr: true, ir: true });
  H.k16Fn(clip, "width", (t) => 737 - front(t), tA - 0.3, tB, { attr: true, ir: true });
  const tPass = tA + ((411 - 23) / 714) * (tB - tA);
  tl.fromTo(rag.oil, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tPass);
  H.k16Ring(Rt, "s2-v-ring", 400, 112, 44, 86, tPass + 0.2, { n: 2 });
  tl.to(rag.g, { opacity: 0, duration: 0.3 }, tB + 0.1);
}
