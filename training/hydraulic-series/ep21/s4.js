// How to attach a high-pressure hose ①–③ (OPL 5-C-12/13): NG panel left, OK panel right, one row per rule.
// Rows start dimmed and light up with their narration segment; each NG shows its failure moving.
const art = H.$("s4-v-art"), P = T.points, f = H.f;
const rows = [6, 218, 430].map((y0, i) => {
  const g = H.el("g", { opacity: 0.28 }, art);
  H.hzBadge(g, 30, y0 + 102, i + 1);
  return { g, y0, ng: H.hzPanel(g, 64, y0, 500, 204, "NG"), ok: H.hzPanel(g, 584, y0, 500, 204, "OK") };
});
rows.forEach((r, i) => H.hzOp(r.g, 0.28, 1, b + P[i], 0.35));
const lab = (parent, x, y, s, col) => H.text(parent, x, y, s, { size: 28, anchor: "middle", fill: col, weight: 800 });

// ① twisted hose cannot be used — lay line spirals (NG) vs straight (OK) -------------------------------------
{
  const yc = 112;
  const layD = (tw) => Array.from({ length: 5 }, (_, i) => {
    const x = 150 + i * 40;
    return tw ? `M ${x} ${yc - 11} L ${x + 20} ${yc + 11}` : `M ${x} ${yc} L ${x + 40} ${yc}`;
  }).join(" ");
  const assy = (a, tw) => {
    H.hzHose(a, `M 150 ${yc} L 350 ${yc}`, { w: 28 });
    const lay = H.el("path", { d: layD(tw), fill: "none", stroke: Z.yellow, "stroke-width": 5 }, a);
    H.hzFit(a, 150, yc, 0, { k: 0.7 });
    H.hzFit(a, 350, yc, 180, { k: 0.7 });
    return lay;
  };
  const r = rows[0];
  const layNG = assy(r.ng.art, false);
  assy(r.ok.art, false);
  const t0 = b + P[0] + 0.9;
  tl.fromTo(layNG, { attr: { d: layD(false) } }, { attr: { d: layD(true) }, duration: 0.8, ease: "power2.inOut", immediateRender: false }, t0);
  const arc = H.hzArcArrow(r.ng.art, 432, yc, 36, 200, 335, { color: Z.red, w: 5, head: 15 });
  arc.setAttribute("opacity", 0);
  H.hzOp(arc, 0, 1, t0, 0.25);
  const l1 = lab(r.ng.art, 250, 186, "บิดเป็นเกลียว (Twist)", Z.red);
  const l2 = lab(r.ok.art, 250, 186, "วางตรง ไม่บิด", Z.green);
  [l1, l2].forEach((l) => l.setAttribute("opacity", 0));
  H.hzOp(l1, 0, 1, t0 + 0.5);
  H.hzOp(l2, 0, 1, t0 + 1.0);
}

// ② straight run: tight → vibrates (NG) / slight sag absorbs the length change (OK) ------------------------------
{
  const y = 112, r = rows[1];
  const run = (a) => {
    for (const x of [14, 446]) H.el("rect", { x, y: 62, width: 40, height: 122, rx: 4, fill: Z.wall, stroke: Z.ink, "stroke-width": 3 }, a);
  };
  const dRun = (sag) => `M 150 ${y} C 212 ${f(y + sag)} 288 ${f(y + sag)} 350 ${y}`;
  run(r.ng.art); run(r.ok.art);
  const hNG = H.hzHose(r.ng.art, dRun(0), { w: 28 });
  H.hzFit(r.ng.art, 150, y, 0, { k: 0.7 }); H.hzFit(r.ng.art, 350, y, 180, { k: 0.7 });
  const hOK = H.hzHose(r.ok.art, dRun(24), { w: 28 });
  H.hzFit(r.ok.art, 150, y, 0, { k: 0.7 }); H.hzFit(r.ok.art, 350, y, 180, { k: 0.7 });
  // NG vibration: fast finite yoyo + vibration marks
  const tv = b + P[1] + 0.6, n = Math.max(2, 2 * Math.floor((b + D - tv) / 0.14));
  tl.fromTo(hNG.paths, { attr: { d: dRun(-8) } }, { attr: { d: dRun(8) }, duration: 0.07, ease: "sine.inOut", yoyo: true, repeat: n - 1, immediateRender: false }, tv);
  const marks = H.el("g", { opacity: 0 }, r.ng.art);
  for (const yy of [80, 72, 144, 152]) H.el("line", { x1: 226, y1: yy, x2: 274, y2: yy, stroke: Z.red, "stroke-width": 4, "stroke-linecap": "round" }, marks);
  H.hzOp(marks, 0, 1, tv, 0.2);
  // OK: the slight sag takes up the length change when pressure rises and falls
  const tb = b + P[1] + 2.0;
  tl.fromTo(hOK.paths, { attr: { d: dRun(24) } }, { attr: { d: dRun(14) }, duration: 0.55, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }, tb);
  const l1 = lab(r.ng.art, 250, 188, "ตึงตรง → สั่น", Z.red);
  const l2 = lab(r.ok.art, 250, 188, "หย่อนเล็กน้อย", Z.green);
  [l1, l2].forEach((l) => l.setAttribute("opacity", 0));
  H.hzOp(l2, 0, 1, b + P[1] + 1.2);
  H.hzOp(l1, 0, 1, b + P[1] + 3.6);
}

// ③ hoses touching rub through (NG) / held apart with a band (OK) --------------------------------------------------
{
  const r = rows[2];
  const dA = "M 14 96 C 170 96 330 124 486 130", dB = "M 14 172 C 170 172 330 100 486 92";
  H.hzHose(r.ng.art, dA, { w: 26 });
  const hB = H.hzHose(r.ng.art, dB, { w: 26 });
  // contact point = where the two centre lines cross (sampled)
  const bz = (p, t) => { const u = 1 - t; return u * u * u * p[0] + 3 * u * u * t * p[1] + 3 * u * t * t * p[2] + t * t * t * p[3]; };
  const A = { x: [14, 170, 330, 486], y: [96, 96, 124, 130] }, B = { x: [14, 170, 330, 486], y: [172, 172, 100, 92] };
  let cx = 250, cy = 120, best = 1e9;
  for (let i = 0; i <= 200; i++) {
    const t = i / 200, d = Math.abs(bz(A.y, t) - bz(B.y, t));
    if (d < best) { best = d; cx = bz(A.x, t); cy = bz(A.y, t); }
  }
  const t0 = b + P[2] + 0.6;
  tl.fromTo(hB.g, { x: -6 }, { x: 6, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: 2 * Math.max(1, Math.floor((b + D - t0) / 0.36)) - 1, immediateRender: false }, t0);
  const scuff = H.el("g", { opacity: 0 }, r.ng.art);
  for (const dx of [-22, -8, 6, 20]) H.el("line", { x1: f(cx + dx - 5), y1: f(cy - 9), x2: f(cx + dx + 5), y2: f(cy + 9), stroke: "#f2f2f2", "stroke-width": 3.5 }, scuff);
  H.hzOp(scuff, 0, 1, t0 + 0.8, 0.4);
  H.hzRing(r.ng.art, f(cx), f(cy), 58, 40, t0 + 1.1, 3);
  const l1 = lab(r.ng.art, 300, 52, "เสียดสี → ผิวขาด → ทะลุ", Z.red);
  l1.setAttribute("opacity", 0);
  H.hzOp(l1, 0, 1, t0 + 1.4);
  // OK: two hoses held apart by a band (clamp block)
  H.hzHose(r.ok.art, "M 14 92 L 486 92", { w: 26 });
  H.hzHose(r.ok.art, "M 14 156 L 486 156", { w: 26 });
  const band = H.el("g", {}, r.ok.art);
  H.el("rect", { x: 226, y: 64, width: 48, height: 120, rx: 10, fill: Z.metal, stroke: Z.ink, "stroke-width": 4 }, band);
  H.el("line", { x1: 226, y1: 124, x2: 274, y2: 124, stroke: Z.ink, "stroke-width": 3 }, band);
  H.el("path", { d: H.hexD(250, 124, 11), fill: Z.dark, stroke: Z.ink, "stroke-width": 3 }, band);
  H.hzLabel(r.ok.art, 312, 134, "Band", { size: 28, fill: Z.green });
  const ring = H.el("ellipse", { cx: 250, cy: 124, rx: 44, ry: 76, fill: "none", stroke: Z.green, "stroke-width": 6, opacity: 0 }, r.ok.art);
  H.hzOp(ring, 0, 1, b + P[2] + 3.0, 0.25);
}
