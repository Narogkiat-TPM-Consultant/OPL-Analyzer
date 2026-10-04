// Bourdon-tube gauge cut-away (after the OPL 5-C-6 figure: Bourdon tube, rack & pinion, indicator, scale).
// Pressure enters the socket → the C-shaped tube straightens a little (radius grows, sweep shrinks, the free end
// rises) → the link lifts the sector (rack) → the sector turns the pinion → the indicator turns over the scale.
// The link length is kept constant: the sector angle for each tube state is solved numerically below.
{
  const f = H.f, K = K18, c = T.cues;
  const g = H.$("s2-v-gauge"), L = H.$("s2-v-lab");
  const cx = 380, cy = 285, R = 258;
  const rad = (d) => (d * Math.PI) / 180;
  const P = (a, rr, ox = cx, oy = cy) => [ox + rr * Math.cos(rad(a)), oy + rr * Math.sin(rad(a))];
  const ang = (v) => 135 + 45 * v;

  // ---- case, face, scale
  H.el("circle", { cx, cy, r: R, fill: K.metal, stroke: K.ink, "stroke-width": 6 }, g);
  H.el("circle", { cx, cy, r: R - 16, fill: K.paper, stroke: K.ink, "stroke-width": 3 }, g);
  const scale = H.el("g", {}, g);
  for (let k = 0; k <= 30; k++) {
    const v = k / 5, major = k % 5 === 0;
    const [x1, y1] = P(ang(v), 236), [x2, y2] = P(ang(v), major ? 208 : 222);
    H.el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: K.ink, "stroke-width": major ? 6 : 3 }, scale);
  }
  for (let v = 0; v <= 6; v++) {
    const [x, y] = P(ang(v), 186);
    H.text(scale, x, y + 11, String(v), { size: 30, anchor: "middle" });
  }

  // ---- socket (inside block + stem, hex, thread below the case) with the pressure bore
  H.el("rect", { x: 352, y: 402, width: 56, height: 146, fill: K.dark, stroke: K.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: 362, y: 548, width: 36, height: 22, fill: K.metal, stroke: K.ink, "stroke-width": 4 }, g);
  H.el("path", { d: "M 334 570 H 426 V 600 H 334 Z M 360 570 V 600 M 400 570 V 600", fill: K.dark, stroke: K.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  H.el("rect", { x: 360, y: 600, width: 40, height: 28, fill: K.metal, stroke: K.ink, "stroke-width": 4 }, g);
  for (let i = 0; i < 3; i++) H.el("line", { x1: 360, y1: 607 + i * 7, x2: 400, y2: 611 + i * 7, stroke: K.ink, "stroke-width": 2 }, g);
  const bore = H.el("path", { d: "M 380 626 V 420", fill: "none", stroke: K.blue, "stroke-width": 12, opacity: 0 }, g);

  // ---- Bourdon tube: base fixed at the bottom (90°), sweeping 255° clockwise to the free end
  const Rt = 135, SW = 255;
  const tube = (k) => {
    const Rk = Rt * (1 + k), sw = SW / (1 + k), ocy = cy + Rt - Rk;
    const tip = P(90 + sw, Rk, cx, ocy);
    return { d: `M ${cx} ${cy + Rt} A ${f(Rk)} ${f(Rk)} 0 1 1 ${f(tip[0])} ${f(tip[1])}`, tip };
  };
  const glow = H.el("path", { d: tube(0).d, fill: "none", stroke: K.blue, "stroke-width": 50, opacity: 0 }, g);
  const tOut = H.el("path", { d: tube(0).d, fill: "none", stroke: K.ink, "stroke-width": 32 }, g);
  const tBody = H.el("path", { d: tube(0).d, fill: "none", stroke: K.gold, "stroke-width": 24 }, g);
  const tOil = H.el("path", { d: tube(0).d, fill: "none", stroke: K.blue, "stroke-width": 8, "stroke-dasharray": "16 12", opacity: 0 }, g);
  const tHi = H.el("path", { d: tube(0).d, fill: "none", stroke: K.goldHi, "stroke-width": 5, opacity: 0.9 }, g);
  // socket block drawn again over the tube base so the tube enters it
  H.el("rect", { x: 352, y: 402, width: 56, height: 50, fill: K.dark, stroke: K.ink, "stroke-width": 4 }, g);

  // ---- sector (rack) + pinion + link
  const rp = 10, rs = 68, S = [cx, cy + rp + rs], LA = 100;
  const A = (al) => P(al, LA, S[0], S[1]);
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const Llink = dist(tube(0).tip, A(0));
  const solve = (k) => {
    const t = tube(k).tip;
    let lo = -60, hi = 0;
    for (let i = 0; i < 50; i++) {
      const m = (lo + hi) / 2;
      if (dist(t, A(m)) - Llink > 0) hi = m; else lo = m;
    }
    return (lo + hi) / 2;
  };
  const sector = H.el("g", { id: "s2-v-sector" }, g);
  // tail arm S → A (pin hole at A)
  H.el("path", { d: `M ${S[0]} ${S[1] - 9} L ${S[0] + LA} ${S[1] - 7} L ${S[0] + LA} ${S[1] + 7} L ${S[0]} ${S[1] + 9} Z`, fill: K.dark, stroke: K.ink, "stroke-width": 3 }, sector);
  // fan with teeth on the arc of radius rs around 270°
  const a0 = 246, a1 = 294;
  let fan = `M ${S[0]} ${S[1]}`;
  const nT = 9;
  for (let i = 0; i <= nT * 2; i++) {
    const a = a0 + ((a1 - a0) * i) / (nT * 2), rr = i % 2 ? rs + 4 : rs - 3;
    const [x, y] = P(a, rr, S[0], S[1]);
    fan += ` L ${f(x)} ${f(y)}`;
  }
  fan += " Z";
  H.el("path", { d: fan, fill: K.metal, stroke: K.ink, "stroke-width": 3, "stroke-linejoin": "round" }, sector);
  H.el("circle", { cx: S[0], cy: S[1], r: 9, fill: K.ink }, g);
  // pinion (turns with the indicator)
  const pin = H.el("g", { id: "s2-v-pin" }, g);
  let pd = "";
  for (let i = 0; i < 16; i++) {
    const a = (360 * i) / 16, rr = i % 2 ? rp + 4 : rp;
    const [x, y] = P(a, rr);
    pd += `${i ? " L" : "M"} ${f(x)} ${f(y)}`;
  }
  H.el("path", { d: pd + " Z", fill: K.dark, stroke: K.ink, "stroke-width": 2.5 }, pin);
  H.el("line", { x1: cx, y1: cy, x2: cx + rp, y2: cy, stroke: K.ink, "stroke-width": 3 }, pin);
  // link from the tube tip to the sector arm
  const t0 = tube(0).tip, A0 = A(0);
  const link = H.el("line", { x1: f(t0[0]), y1: f(t0[1]), x2: f(A0[0]), y2: f(A0[1]), stroke: K.ink, "stroke-width": 7, "stroke-linecap": "round" }, g);
  const pinA = H.el("circle", { cx: f(A0[0]), cy: f(A0[1]), r: 6, fill: K.paper, stroke: K.ink, "stroke-width": 3 }, g);
  const cap = H.el("circle", { cx: f(t0[0]), cy: f(t0[1]), r: 17, fill: K.gold, stroke: K.ink, "stroke-width": 4 }, g);
  const capPin = H.el("circle", { cx: f(t0[0]), cy: f(t0[1]), r: 5, fill: K.ink }, g);

  // indicator on top
  const needle = H.el("g", { id: "s2-v-needle" }, g);
  H.el("path", { d: `M ${cx - 40} ${cy - 7} L ${cx + 226} ${cy - 2} L ${cx + 226} ${cy + 2} L ${cx - 40} ${cy + 7} Z`, fill: K.ink }, needle);
  H.el("circle", { cx, cy, r: 9, fill: K.ink }, g);
  gsap.set(needle, { rotation: ang(0), svgOrigin: `${cx} ${cy}` });

  // ---- pressure display sign (circle + arrow) bottom right
  const sign = H.el("g", { opacity: 0 }, g);
  H.el("line", { x1: 1046, y1: 588, x2: 1046, y2: 616, stroke: K.ink, "stroke-width": 5 }, sign);
  H.el("circle", { cx: 1046, cy: 554, r: 34, fill: K.paper, stroke: K.ink, "stroke-width": 5 }, sign);
  H.el("path", { d: H.arrowD(1024, 576, 1068, 532, 14), fill: "none", stroke: K.ink, "stroke-width": 5, "stroke-linecap": "round" }, sign);
  H.text(sign, 996, 550, "สัญลักษณ์ในวงจร", { size: 26, anchor: "end" });
  H.text(sign, 996, 582, "(Oil pressure display sign)", { size: 22, anchor: "end", fill: K.muted, weight: 600 });

  // ---- part labels (names as on the deck figure) with leader lines
  const lab = (x, y, en, th, tx, ty) => {
    const gg = H.el("g", { opacity: 0 }, L);
    H.el("path", { d: `M ${x - 12} ${y - 9} L ${tx} ${ty}`, fill: "none", stroke: K.muted, "stroke-width": 3 }, gg);
    H.el("circle", { cx: tx, cy: ty, r: 7, fill: K.blue }, gg);
    H.text(gg, x, y, en, { size: 31 });
    H.text(gg, x, y + 32, th, { size: 24, fill: K.muted, weight: 600 });
    return gg;
  };
  const lInd = lab(700, 70, "Indicator", "(เข็มชี้)", 425, 106);
  const lBt = lab(700, 196, "Bourdon tube", "(ท่อโค้ง)", 476, 190);
  const lRp = lab(700, 330, "Rack & pinion", "(เฟืองขับเข็ม)", 404, 300);
  const lSc = lab(700, 462, "Scale", "(สเกล)", 588, 405);
  const inLab = H.el("g", { opacity: 0 }, L);
  H.el("path", { d: H.arrowD(520, 610, 412, 610, 16), fill: "none", stroke: K.blue, "stroke-width": 5 }, inLab);
  H.text(inLab, 530, 620, "แรงดันเข้า", { size: 28, fill: K.blue });

  // ---- timeline
  const k1 = 0.025, k2 = 0.05;
  const al1 = solve(k1), al2 = solve(k2);
  const nd = (al) => (-al * rs) / rp; // pinion / indicator turn (deg) for a sector turn al
  const move = (kA, kB, alA, alB, t, dur) => {
    const first = kA === 0;
    const o = { duration: dur, ease: "power2.inOut", immediateRender: first };
    for (const p of [glow, tOut, tBody, tOil, tHi]) tl.fromTo(p, { attr: { d: tube(kA).d } }, { attr: { d: tube(kB).d }, ...o }, t);
    const ta = tube(kA).tip, tb = tube(kB).tip, Aa = A(alA), Ab = A(alB);
    tl.fromTo(link, { attr: { x1: ta[0], y1: ta[1], x2: Aa[0], y2: Aa[1] } }, { attr: { x1: tb[0], y1: tb[1], x2: Ab[0], y2: Ab[1] }, ...o }, t);
    for (const p of [cap, capPin]) tl.fromTo(p, { attr: { cx: ta[0], cy: ta[1] } }, { attr: { cx: tb[0], cy: tb[1] }, ...o }, t);
    tl.fromTo(pinA, { attr: { cx: Aa[0], cy: Aa[1] } }, { attr: { cx: Ab[0], cy: Ab[1] }, ...o }, t);
    tl.fromTo(sector, { rotation: alA, svgOrigin: `${S[0]} ${S[1]}` }, { rotation: alB, svgOrigin: `${S[0]} ${S[1]}`, ...o }, t);
    tl.fromTo(pin, { rotation: nd(alA), svgOrigin: `${cx} ${cy}` }, { rotation: nd(alB), svgOrigin: `${cx} ${cy}`, ...o }, t);
    tl.fromTo(needle, { rotation: ang(0) + nd(alA), svgOrigin: `${cx} ${cy}` }, { rotation: ang(0) + nd(alB), svgOrigin: `${cx} ${cy}`, ...o }, t);
  };

  // cue 1: the sign (why: pressure quality → measured with this gauge)
  H.g18Op(sign, 0, 1, b + c[0] + 1.0, 0.4);
  // cue 2: pressure in → the tube straightens (first half)
  const t2 = b + c[1] + 0.1;
  H.g18Op(lBt, 0, 1, t2, 0.3);
  H.g18Op(inLab, 0, 1, t2, 0.3);
  tl.fromTo(bore, { opacity: 0, strokeDasharray: 210, strokeDashoffset: 210 }, { opacity: 1, strokeDashoffset: 0, duration: 0.6, ease: "none" }, t2);
  H.g18Op(tOil, 0, 0.9, t2 + 0.5, 0.3);
  tl.fromTo(tOil, { strokeDashoffset: 0 }, { strokeDashoffset: -28 * 30, duration: Math.max(1, D - (t2 - b) - 0.6), ease: "none", immediateRender: false }, t2 + 0.5);
  H.g18Op(glow, 0, 0.22, t2 + 0.6, 0.3);
  move(0, k1, 0, al1, t2 + 0.6, 1.3);
  // "rack & pinion" (point 2, inside segment 2): the sector turns the pinion → the indicator turns further
  const t3 = b + T.points[1];
  H.g18Op(glow, 0.22, 0, t3, 0.3, false);
  H.g18Op(lRp, 0, 1, t3, 0.3);
  const ring = H.el("circle", { cx, cy: cy + 22, r: 44, fill: "none", stroke: K.blue, "stroke-width": 6, opacity: 0 }, g);
  tl.fromTo(ring, { opacity: 0 }, { opacity: 0.9, duration: 0.25 }, t3 + 0.1);
  tl.fromTo(ring, { opacity: 0.9 }, { opacity: 0, duration: 0.4, immediateRender: false }, t3 + 2.6);
  move(k1, k2, al1, al2, t3 + 0.2, 1.6);
  // indicator + scale names when the needle points at its value
  H.g18Op(lInd, 0, 1, b + T.points[2], 0.3);
  H.g18Op(lSc, 0, 1, b + T.points[2] + 0.15, 0.3);
}
