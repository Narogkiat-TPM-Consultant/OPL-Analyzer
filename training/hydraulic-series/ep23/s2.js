// Why filter: left = compressed air carries oil, water, dust and rust (chips pop in as they are named);
// right = the matter reaches a solenoid valve and an air cylinder, sticks on the spool / seal → damage.
{
  const c = T.cues, f = H.f;
  // point on a polyline at fraction u (by length)
  const along = (pts, u) => {
    const seg = [];
    let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    let d = AF.clamp(u) * tot;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? d / seg[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; }
      d -= seg[i];
    }
    return pts[pts.length - 1];
  };
  // particle that runs along a polyline in `dur` s, `n` times in a row from t0 (hidden between runs' ends)
  const stream = (parent, kind, pts, t0, dur, reps, s = 1) => {
    const p = AF.particle(parent, kind, s, { opacity: 0 });
    const t1 = t0 + dur * reps;
    const u = (t) => ((t - t0) / dur) % 1;
    AF.fn(p, "x", (t) => along(pts, u(t))[0], t0, t1, { ir: true });
    AF.fn(p, "y", (t) => along(pts, u(t))[1], t0, t1, { ir: true });
    AF.fn(p, "opacity", (t) => (t < t0 || t >= t1 - 0.02 ? 0 : u(t) > 0.97 ? 0 : 1), t0 - 0.01, t1);
    return p;
  };

  // ---- left card: compressor → pipe full of contaminants
  const Lg = H.$("s2-v-l");
  const tL = b + T.left;
  AF.pipe(Lg, "M 150 104 V 70 H 746", 26, 5);
  // compressor: receiver tank, motor, pump head
  H.el("rect", { x: 24, y: 144, width: 178, height: 56, rx: 26, fill: AF.metal, stroke: AF.ink, "stroke-width": 4 }, Lg);
  for (const x of [52, 172]) H.el("rect", { x: x - 8, y: 198, width: 16, height: 12, fill: AF.dark, stroke: AF.ink, "stroke-width": 3 }, Lg);
  H.el("rect", { x: 38, y: 104, width: 66, height: 40, rx: 6, fill: AF.dark, stroke: AF.ink, "stroke-width": 4 }, Lg);
  for (let x = 48; x <= 94; x += 9) H.el("line", { x1: x, y1: 108, x2: x, y2: 140, stroke: AF.ink, "stroke-width": 2, opacity: 0.45 }, Lg);
  H.el("rect", { x: 118, y: 104, width: 64, height: 40, rx: 4, fill: AF.metal, stroke: AF.ink, "stroke-width": 4 }, Lg);
  for (let y = 112; y <= 136; y += 8) H.el("line", { x1: 120, y1: y, x2: 180, y2: y, stroke: AF.ink, "stroke-width": 2, opacity: 0.45 }, Lg);
  H.text(Lg, 113, 226, "คอมเพรสเซอร์", { size: 21, anchor: "middle", fill: AF.muted });
  const fl = AF.dash(Lg, "s2-v-lfl", "M 150 104 V 70 H 746", 4);
  AF.flow(fl, tL + 0.3, b + D, { speed: 2.5 });
  const pg = H.el("g", {}, Lg);
  const route = [[150, 104], [150, 70], [746, 70]];
  for (let i = 0; i < 8; i++) stream(pg, AF.KINDS[i % 4], route.map(([x, y], k) => [x, y + (k ? [-6, 5, -2, 7][i % 4] : 0)]), tL + 0.4 + i * 0.32, 2.6, Math.ceil((b + D - tL) / 2.6), 1.1);
  // contaminant chips, named in the narration: oil, water, dust, rust
  const seg1 = c[1] - c[0] - 0.3, names = ["น้ำมัน", "น้ำ", "ฝุ่น", "สนิม"], at = [0.6, 0.69, 0.76, 0.86];
  names.forEach((s, i) => {
    const x = 236 + i * 128, chip = H.el("g", { opacity: 0 }, Lg);
    H.el("rect", { x, y: 138, width: 116, height: 56, rx: 12, fill: AF.paper, stroke: AF.ink, "stroke-width": 3 }, chip);
    AF.particle(chip, AF.KINDS[i], 1.5, { transform: `translate(${x + 26} 168)` });
    H.text(chip, x + 46, 176, s, { size: 25 });
    tl.fromTo(chip, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, b + c[0] + at[i] * seg1);
  });

  // ---- right card: solenoid valve → air cylinder; matter sticks on the spool and at the piston seal
  const Rg = H.$("s2-v-r");
  const tR = b + T.right;
  AF.pipe(Rg, "M 14 210 H 118 V 182", 22, 4);
  AF.pipe(Rg, "M 226 118 V 86 H 384 V 112", 22, 4);
  // solenoid valve: body with a cut window showing the spool, coil on top
  H.el("rect", { x: 56, y: 118, width: 214, height: 64, rx: 6, fill: AF.metal, stroke: AF.ink, "stroke-width": 4 }, Rg);
  H.el("rect", { x: 76, y: 132, width: 174, height: 36, fill: AF.air, stroke: AF.ink, "stroke-width": 3 }, Rg);
  for (const [x, w] of [[82, 26], [128, 34], [180, 34], [226, 18]]) H.el("rect", { x, y: 136, width: w, height: 28, fill: AF.dark, stroke: AF.ink, "stroke-width": 2.5 }, Rg);
  H.el("rect", { x: 82, y: 146, width: 162, height: 8, fill: AF.dark }, Rg);
  H.el("rect", { x: 70, y: 56, width: 92, height: 62, rx: 6, fill: AF.muted, stroke: AF.ink, "stroke-width": 4 }, Rg);
  for (let y = 66; y <= 108; y += 8) H.el("line", { x1: 76, y1: y, x2: 156, y2: y, stroke: "#c9ced4", "stroke-width": 2 }, Rg);
  H.text(Rg, 163, 232, "Solenoid valve", { size: 22, anchor: "middle", fill: AF.muted });
  // air cylinder: barrel, piston + rod, rod gland
  H.el("rect", { x: 340, y: 112, width: 290, height: 84, rx: 6, fill: AF.bowl, stroke: AF.ink, "stroke-width": 4 }, Rg);
  H.el("rect", { x: 330, y: 104, width: 22, height: 100, rx: 3, fill: AF.metal, stroke: AF.ink, "stroke-width": 3.5 }, Rg);
  H.el("rect", { x: 618, y: 104, width: 22, height: 100, rx: 3, fill: AF.metal, stroke: AF.ink, "stroke-width": 3.5 }, Rg);
  const rod = H.el("g", {}, Rg);
  H.el("rect", { x: 470, y: 144, width: 270, height: 20, fill: AF.dark, stroke: AF.ink, "stroke-width": 3 }, rod);
  H.el("rect", { x: 450, y: 116, width: 24, height: 76, fill: AF.dark, stroke: AF.ink, "stroke-width": 3.5 }, rod);
  H.text(Rg, 485, 232, "Air cylinder", { size: 22, anchor: "middle", fill: AF.muted });
  const fr1 = AF.dash(Rg, "s2-v-rf1", "M 14 210 H 118 V 182", 4), fr2 = AF.dash(Rg, "s2-v-rf2", "M 226 118 V 86 H 384 V 112", 4);
  AF.flow([fr1, fr2], tR + 0.2, b + D, { speed: 2.5 });
  const pr = H.el("g", {}, Rg);
  for (let i = 0; i < 4; i++) stream(pr, AF.KINDS[(i + 1) % 4], [[14, 210], [118, 210], [118, 184]], tR + 0.3 + i * 0.4, 1.2, 3, 1.0);
  for (let i = 0; i < 3; i++) stream(pr, AF.KINDS[(i + 2) % 4], [[226, 116], [226, 86], [384, 86], [384, 124], [430, 180]], tR + 0.8 + i * 0.6, 1.6, 2, 1.0);
  // dirt builds up on the spool and at the piston seal; the rod moves with a judder
  const crud = H.el("g", { opacity: 0 }, Rg);
  [[112, 160], [166, 140], [216, 160], [242, 142], [440, 186], [438, 124], [422, 176]].forEach(([x, y], i) =>
    AF.particle(crud, AF.KINDS[(i + 2) % 4], 0.9, { transform: `translate(${x} ${y})` }));
  tl.fromTo(crud, { opacity: 0 }, { opacity: 1, duration: 1.2 }, tR + 1.2);
  tl.fromTo(rod, { x: 0 }, { x: 22, duration: 0.25, ease: "power1.inOut", yoyo: true, repeat: 5 }, tR + 1.0);
  const r1 = AF.ring(Rg, "s2-v-r1", 163, 150, 104, 34, AF.red), r2 = AF.ring(Rg, "s2-v-r2", 444, 154, 40, 56, AF.red);
  [[r1, "163 150"], [r2, "444 154"]].forEach(([r, o], i) =>
    tl.fromTo(r, { opacity: 0, scale: 1.25, svgOrigin: o }, { opacity: 1, scale: 1, svgOrigin: o, duration: 0.35, ease: "back.out(2)" }, tR + 2.2 + 0.4 * i));
}
