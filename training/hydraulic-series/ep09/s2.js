// Phenomenon: a pipe union weeps; drops fall one by one (cue 1, red ring on the spot), one drop magnified
// with its size from OPL 5-B-1 (cue 2), then day → month → year while the puddle spreads (cue 3).
{
  const P = H.$("s2-v-art"), c = T.cues, f = H.f;
  const k = 1.2, dripX = 400, fx = dripX + 51 * k, y = 190, floorY = 590;
  H.text(P, 40, 150, "ท่อ (Pipe)", { size: 26, fill: E9.muted });
  H.text(P, 1062, 150, "สาย (Hose)", { size: 26, fill: E9.muted, anchor: "end" });
  H.text(P, 346, 262, "ข้อต่อ (Fitting)", { size: 30, anchor: "end" });
  const puddle = H.e9Floor(P, 20, 1080, floorY, dripX, { rx: 30, ry: 8, id: "s2-v-pud" });
  const L = H.e9Line(P, 20, 1080, y, fx, { k, wet: true });
  const [dx, dy] = L.drip;

  // drops all scene long
  const s = 20, dist = floorY - 4 - (dy + 2.75 * s);
  H.e9Drip(P, dx, dy, s, dist, 1.2, b + 0.5, b + D - 0.1, { fall: 0.6 });

  // ① red ring on the leaking spot
  const ring = H.el("circle", { id: "s2-v-ring", cx: f(fx), cy: y, r: 104, fill: "none", stroke: E9.red, "stroke-width": 7 }, P);
  tl.fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[0] + 0.3);
  tl.fromTo(ring, { scale: 0.85, svgOrigin: `${f(fx)} ${y}` }, { scale: 1.08, svgOrigin: `${f(fx)} ${y}`, duration: 0.35, yoyo: true, repeat: 5, ease: "sine.inOut" }, b + c[0] + 0.3);

  // ② magnifier: one drop = 0.05 cm³, Φ 4.5 mm
  const mx = 800, my = 400, mr = 160;
  const mag = H.el("g", { id: "s2-v-mag" }, P);
  H.el("path", { d: `M ${dripX + 14} ${f(dy + 30)} L ${mx - mr + 4} ${my - 30}`, stroke: E9.blue, "stroke-width": 4, "stroke-dasharray": "10 8", fill: "none" }, mag);
  H.el("circle", { cx: dripX + 14, cy: f(dy + 30), r: 6, fill: E9.blue }, mag);
  H.el("circle", { cx: mx, cy: my, r: mr, fill: E9.card, stroke: E9.blue, "stroke-width": 7 }, mag);
  H.text(mag, mx, 318, "≈ 0.05 cm³", { size: 32, anchor: "middle", fill: E9.blue });
  const S = 44, tipY = 338, wy = tipY + 1.75 * S;
  H.e9Drop(mag, mx, tipY, S, { sw: 4 });
  H.el("path", { d: `M ${mx - S} ${f(wy + 8)} L ${mx - S} 492 M ${mx + S} ${f(wy + 8)} L ${mx + S} 492`, stroke: E9.muted, "stroke-width": 2.5, fill: "none" }, mag);
  H.el("path", { d: H.dimD(mx - S, 484, mx + S, 484, 14), stroke: E9.ink, "stroke-width": 3.5, fill: "none" }, mag);
  H.text(mag, mx, 530, "Φ 4.5 mm", { size: 32, anchor: "middle" });
  tl.fromTo(mag, { opacity: 0, scale: 0.6, svgOrigin: `${mx} ${my}` }, { opacity: 1, scale: 1, svgOrigin: `${mx} ${my}`, duration: 0.45, ease: "back.out(1.6)" }, b + c[1] + 0.2);

  // ③ 1 day → 1 month → 1 year: chips light up, the puddle spreads
  const chips = [["1 วัน", 640], ["1 เดือน", 800], ["1 ปี", 960]].map(([t, x], i) => {
    const g = H.el("g", { id: `s2-v-c${i + 1}` }, P);
    const r = H.el("rect", { x: x - 66, y: 22, width: 132, height: 58, rx: 29, fill: E9.card, stroke: E9.line, "stroke-width": 4 }, g);
    const tx = H.text(g, x, 62, t, { size: 30, anchor: "middle", fill: E9.muted });
    if (i < 2) H.el("path", { d: H.arrowD(x + 70, 51, x + 90, 51, 9), stroke: E9.muted, "stroke-width": 3, fill: "none" }, g);
    return { g, r, tx };
  });
  const t3 = b + c[2];
  tl.fromTo(chips.map((x) => x.g), { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3);
  // puddle: slow growth while dripping, then one step per chip (explicit from-values: seek-safe)
  const rx = [8, 30, 80, 190, 380], ry = [4, 8, 10, 13, 18];
  tl.fromTo(puddle, { attr: { rx: rx[0], ry: ry[0] } }, { attr: { rx: rx[1], ry: ry[1] }, duration: c[2] - c[0], ease: "none" }, b + c[0]);
  chips.forEach((ch, i) => {
    const t = t3 + 0.4 + i * 0.75;
    tl.fromTo(ch.r, { attr: { fill: E9.card, stroke: E9.line } }, { attr: { fill: E9.blue, stroke: E9.blue }, duration: 0.25, immediateRender: false }, t);
    tl.fromTo(ch.tx, { attr: { fill: E9.muted } }, { attr: { fill: "#ffffff" }, duration: 0.25, immediateRender: false }, t);
    tl.fromTo(puddle, { attr: { rx: rx[i + 1], ry: ry[i + 1] } }, { attr: { rx: rx[i + 2], ry: ry[i + 2] }, duration: 0.6, ease: "power2.out", immediateRender: false }, t);
  });
}
