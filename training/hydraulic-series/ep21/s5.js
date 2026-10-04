// ④ hose to a swinging cylinder: too short → bends right at the metal end (NG, leaks there) / enough length (OK).
// ⑤ check under pressure: the bend moves from its pressure-0 position (dashed) to the pressurised one; keep the bend.
const art = H.$("s5-v-art"), P = T.points, f = H.f;
const row4 = H.el("g", { opacity: 0.28 }, art), row5 = H.el("g", { opacity: 0.28 }, art);
H.hzBadge(row4, 30, 165, 4);
H.hzBadge(row5, 30, 484, 5);
H.hzOp(row4, 0.28, 1, b + P[0], 0.35);
H.hzOp(row5, 0.28, 1, b + P[1], 0.35);
const lab = (parent, x, y, s, col, anchor = "start") => {
  const t = H.text(parent, x, y, s, { size: 26, anchor, fill: col, weight: 800 });
  t.setAttribute("opacity", 0);
  return t;
};

// ④ ---------------------------------------------------------------------------------------------------------------
{
  const PV = [370, 224], A = [150, 240], J0 = [319, 254], U0 = [0.174, -0.985]; // U0: direction into the fitting
  const rot = (x, y, deg) => {
    const a = (deg * Math.PI) / 180, dx = x - PV[0], dy = y - PV[1];
    return [PV[0] + dx * Math.cos(a) - dy * Math.sin(a), PV[1] + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  const hoseD = (th, L1, L2) => {
    const J = rot(J0[0], J0[1], th), u = rot(PV[0] + U0[0], PV[1] + U0[1], th);
    const ux = u[0] - PV[0], uy = u[1] - PV[1];
    return `M ${A[0]} ${A[1]} C ${A[0] + L1} ${A[1]} ${f(J[0] - L2 * ux)} ${f(J[1] - L2 * uy)} ${f(J[0])} ${f(J[1])}`;
  };
  const cylinder = (g, ghost) => {
    const st = ghost ? { fill: "none", stroke: Z.muted, "stroke-width": 3, "stroke-dasharray": "9 7" } : { stroke: Z.ink, "stroke-width": 4 };
    H.el("rect", { x: 361, y: 32, width: 18, height: 52, fill: ghost ? "none" : Z.steel, ...st }, g);
    H.el("circle", { cx: 370, cy: 28, r: 11, fill: ghost ? "none" : Z.metal, ...st }, g);
    H.el("rect", { x: 340, y: 82, width: 60, height: 126, rx: 8, fill: ghost ? "none" : Z.metal, ...st }, g);
    if (ghost) return;
    for (const yy of [100, 190]) H.el("line", { x1: 340, y1: yy, x2: 400, y2: yy, stroke: Z.ink, "stroke-width": 3, opacity: 0.5 }, g);
    H.el("rect", { x: 358, y: 206, width: 24, height: 22, rx: 4, fill: Z.dark, stroke: Z.ink, "stroke-width": 3 }, g);
    H.el("rect", { x: 320, y: 164, width: 22, height: 26, rx: 4, fill: Z.metal, stroke: Z.ink, "stroke-width": 3 }, g);
    H.hzFit(g, J0[0], J0[1], 100, { k: 0.42 });
  };
  const build = (pan, L1, L2) => {
    const a = pan.art;
    H.el("rect", { x: 14, y: 196, width: 52, height: 96, rx: 4, fill: Z.wall, stroke: Z.ink, "stroke-width": 3 }, a);
    H.el("rect", { x: 346, y: 230, width: 48, height: 36, rx: 4, fill: Z.dark, stroke: Z.ink, "stroke-width": 3 }, a);
    H.el("line", { x1: 330, y1: 266, x2: 470, y2: 266, stroke: Z.ink, "stroke-width": 4 }, a);
    for (let x = 340; x <= 460; x += 20) H.el("line", { x1: x, y1: 268, x2: x - 12, y2: 282, stroke: Z.muted, "stroke-width": 2.5 }, a);
    cylinder(H.el("g", {}, a), true);
    const hz = H.hzHose(a, hoseD(0, L1, L2), { w: 24 });
    H.hzFit(a, A[0], A[1], 0, { k: 0.6 });
    const cyl = H.el("g", {}, a);
    cylinder(cyl, false);
    H.el("circle", { cx: PV[0], cy: PV[1], r: 8, fill: Z.paper, stroke: Z.ink, "stroke-width": 3 }, a);
    return { hz, cyl, d: (th) => hoseD(th, L1, L2) };
  };
  const ng = H.hzPanel(row4, 64, 6, 500, 318, "NG"), ok = H.hzPanel(row4, 584, 6, 500, 318, "OK");
  const N = build(ng, 50, 10), K = build(ok, 120, 110);
  const swing = (S, th0, th1, t, dur, n = 8) => {
    const ths = Array.from({ length: n + 1 }, (_, i) => th0 + (th1 - th0) * (0.5 - 0.5 * Math.cos((Math.PI * i) / n)));
    for (let i = 0; i < n; i++) {
      const tt = t + (dur * i) / n, dd = dur / n;
      tl.fromTo(S.cyl, { rotation: ths[i], svgOrigin: `${PV[0]} ${PV[1]}` }, { rotation: ths[i + 1], svgOrigin: `${PV[0]} ${PV[1]}`, duration: dd, ease: "none", immediateRender: false }, tt);
      H.hzMorph(S.hz.paths, S.d(ths[i]), S.d(ths[i + 1]), tt, dd, "none");
    }
  };
  const t0 = b + P[0] + 0.5, TH = 30;
  for (const S of [N, K]) {
    swing(S, 0, TH, t0, 1.0);
    swing(S, TH, 0, t0 + 1.2, 1.0);
    swing(S, 0, TH, t0 + 2.4, 1.0);
  }
  for (const pan of [ng, ok]) {
    const arc = H.hzArcArrow(pan.art, PV[0], PV[1], 214, 266, 292, { color: Z.blue, w: 4, head: 14 });
    arc.setAttribute("opacity", 0);
    H.hzOp(arc, 0, 1, t0, 0.25);
  }
  // NG: bent right at the metal end → leak there
  const J = rot(J0[0], J0[1], TH);
  H.hzRing(ng.art, f(J[0]), f(J[1] + 4), 30, 30, t0 + 3.5, 3);
  const dropD = (x, y, s) => { const cy = y + 1.5 * s; return `M ${f(x)} ${f(y)} C ${f(x + 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x + s)} ${f(cy - 0.3 * s)} ${f(x + s)} ${f(cy + 0.25 * s)} A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(cy + 0.25 * s)} C ${f(x - s)} ${f(cy - 0.3 * s)} ${f(x - 0.3 * s)} ${f(cy - 0.8 * s)} ${f(x)} ${f(y)} Z`; };
  const drop = H.el("path", { d: dropD(J[0] - 4, J[1] + 14, 7), fill: Z.oil, stroke: Z.ink, "stroke-width": 2, opacity: 0 }, ng.art);
  H.hzOp(drop, 0, 1, t0 + 3.7, 0.2);
  tl.fromTo(drop, { y: 0 }, { y: 30, duration: 0.7, ease: "power2.in", repeat: Math.max(0, Math.floor((b + D - t0 - 3.8) / 0.9) - 1), repeatDelay: 0.2, immediateRender: false }, t0 + 3.8);
  const l1 = lab(ng.art, 24, 100, "สั้น → งอชิดข้อต่อ → รั่ว", Z.red);
  const l2 = lab(ok.art, 24, 100, "เผื่อความยาว", Z.green);
  H.hzOp(l1, 0, 1, t0 + 3.4);
  H.hzOp(l2, 0, 1, t0 + 1.2);
}

// ⑤ ---------------------------------------------------------------------------------------------------------------
{
  const pan = H.hzPanel(row5, 64, 334, 1020, 300, null);
  const a = pan.art;
  const G = H.gauge(a, 128, 138, 80, { id: "s5-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, labelSize: 28 });
  H.text(a, 128, 254, "เกจแรงดัน", { size: 25, anchor: "middle", fill: Z.muted, weight: 600 });
  const R = H.hzRig(a, "s5-v-rig", { transform: "translate(250 4) scale(0.98)", bg: Z.paper });
  const lab0 = H.hzLabel(R.g, 120, 50, "แรงดัน 0", { size: 27, fill: Z.muted, line: [232, 44, 312, 82], lineColor: Z.muted });
  const lab1 = H.hzLabel(R.g, 316, 222, "ขณะมีแรงดัน", { size: 27, fill: Z.blue, line: [380, 198, 386, 116], lineColor: Z.blue });
  const bend = H.el("g", { opacity: 0 }, R.g);
  H.el("rect", { x: 256, y: 18, width: 212, height: 150, rx: 34, fill: "none", stroke: Z.green, "stroke-width": 5, "stroke-dasharray": "14 9" }, bend);
  H.hzLabel(bend, 140, 150, "ส่วนโค้ง", { size: 27, fill: Z.green });
  [lab0, lab1].forEach((l) => l.setAttribute("opacity", 0));
  const t1 = b + P[1];
  const press = (k0, k1, t, dur) => {
    tl.fromTo(G.needle, { rotation: G.rot(7 * k0), svgOrigin: G.origin }, { rotation: G.rot(7 * k1), svgOrigin: G.origin, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
    H.hzMorph(R.hose.paths, R.d(k0), R.d(k1), t, dur);
  };
  H.hzOp(R.ghost, 0, 1, t1 + 0.4, 0.3);
  press(0, 1, t1 + 0.6, 1.0);
  H.hzOp(lab0, 0, 1, t1 + 1.5);
  H.hzOp(lab1, 0, 1, t1 + 1.7);
  press(1, 0, t1 + 2.8, 0.8);
  press(0, 1, t1 + 3.8, 0.8);
  H.hzOp(bend, 0, 1, t1 + 5.0, 0.35);
}
