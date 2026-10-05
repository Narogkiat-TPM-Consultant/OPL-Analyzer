// How it works (p.40 "System" 1–3), cross-section:
// cue 1 air runs fast through the valve under the window → low pressure there;
// cue 2 air pressure on the oil in the bowl pushes oil up the pipe (same principle as a spray bottle);
// cue 3 oil drips in the window, the fast air turns the drops into mist that goes to OUT.
{
  const root = H.$("s3-v-art"), c = T.cues;
  const g = H.el("g", { transform: "translate(160 12) scale(0.95)" }, root);
  const U = LU.unit(g, "s3-v-u", { cut: true, oil: false });
  const X = (x) => 160 + 0.95 * x, Y = (y) => 12 + 0.95 * y;
  const L = H.el("g", {}, root);

  // ports and part names (from the start)
  LU.port(L, 30, 148, Y(285), "IN");
  LU.port(L, X(800) + 8, 1086, Y(285), "OUT");
  LU.label(L, "s3-v-l1", 180, 66, "Oil drop window", X(345), Y(128), { size: 24, sub: "หน้าต่างดูหยด", fx: 372, fy: 72 });
  LU.label(L, "s3-v-l2", 700, 44, "Drop adjust screw", X(517), Y(22), { size: 24, sub: "สกรูปรับหยด", fx: 696, fy: 38 });
  LU.label(L, "s3-v-l3", 190, 214, "Oil cap", X(192), Y(203), { size: 24, fx: 286, fy: 207 });
  LU.label(L, "s3-v-l4", 720, 566, "Bowl", X(531), Y(540), { size: 24, sub: "ถ้วยน้ำมัน", fx: 716, fy: 560 });

  // ① fast air at the valve → low pressure
  const S1 = H.el("g", { id: "s3-v-st1", opacity: 0 }, root);
  const ring = H.el("ellipse", { id: "s3-v-ring", cx: X(400), cy: Y(276), rx: 74, ry: 34, fill: "none", stroke: LU.yellow, "stroke-width": 6 }, S1);
  LU.label(S1, "s3-v-t1", 712, 404, "ลมไหลเร็ว → แรงดันต่ำ", X(430), Y(282), { size: 26, bg: 300, fx: 706, fy: 396, stroke: LU.pipe, fill: LU.pipe });
  const t1 = b + c[0] + 0.2;
  LU.flow([U.air.in, U.air.out], t1, b + D, { speed: 70 });
  LU.flow(U.air.throat, t1, b + D, { speed: 190 });
  LU.show(S1, t1 + 0.6);
  tl.fromTo(ring, { scale: 0.85, transformOrigin: "50% 50%" }, { scale: 1.1, transformOrigin: "50% 50%", duration: 0.35, yoyo: true, repeat: 3, immediateRender: false }, t1 + 0.6);

  // ② air pressure on the oil surface pushes the oil up the pipe; spray-bottle inset
  const S2 = H.el("g", { id: "s3-v-st2", opacity: 0 }, root);
  for (const x of [318, 462]) H.el("path", { d: H.arrowD(X(x), Y(400), X(x), Y(458), 16), fill: "none", stroke: LU.pipe, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, S2);
  H.text(S2, X(390), Y(436), "แรงดันลม", { size: 22, anchor: "middle", fill: LU.pipe });
  const IN = H.el("g", { id: "s3-v-inset", opacity: 0 }, root);
  H.el("rect", { x: 20, y: 344, width: 318, height: 282, rx: 14, fill: LU.paper, stroke: LU.muted, "stroke-width": 2.5, "stroke-dasharray": "10 7" }, IN);
  H.text(IN, 36, 376, "หลักการเดียวกับ", { size: 22, fill: LU.muted, weight: 600 });
  H.text(IN, 36, 408, "กระบอกฉีดฝอย", { size: 28 });
  H.el("path", { d: "M 74 478 H 166 V 586 Q 166 610 142 610 H 98 Q 74 610 74 586 Z", fill: LU.bowl, stroke: LU.ink, "stroke-width": 4, "stroke-linejoin": "round" }, IN);
  H.el("path", { d: "M 78 540 H 162 V 586 Q 162 606 142 606 H 98 Q 78 606 78 586 Z", fill: LU.oil }, IN);
  H.el("rect", { x: 96, y: 464, width: 48, height: 16, rx: 3, fill: LU.dark, stroke: LU.ink, "stroke-width": 3 }, IN);
  H.el("path", { d: "M 120 600 V 446", fill: "none", stroke: LU.ink, "stroke-width": 10 }, IN);
  const inOil = H.el("path", { id: "s3-v-inoil", d: "M 120 600 V 447", fill: "none", stroke: LU.oil, "stroke-width": 5, "stroke-dasharray": "153 153", "stroke-dashoffset": 93 }, IN);
  LU.tube(IN, "M 36 440 H 112", 16);
  const inAir = LU.dash(IN, "s3-v-inair", "M 36 440 H 112", { w: 3, dash: "10 8" });
  const spray = H.el("g", { id: "s3-v-spray" }, IN);
  const rr = LU.rng(23);
  for (let i = 0; i < 12; i++) {
    const d = H.el("circle", { cx: 128, cy: 442, r: H.f(2.5 + rr() * 3), fill: LU.oil, stroke: LU.oilEdge, "stroke-width": 1, opacity: 0 }, spray);
    const t0 = b + c[1] + 1.6 + i * 0.22;
    const dx = 120 + rr() * 70, dy = (rr() - 0.5) * 60;
    tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.08, immediateRender: false }, t0);
    tl.fromTo(d, { x: 0, y: 0 }, { x: H.f(dx), y: H.f(dy), duration: 0.8, ease: "power1.out", immediateRender: false }, t0);
    tl.fromTo(d, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, t0 + 0.6);
  }
  const t2 = b + c[1] + 0.1;
  LU.flow(U.air.feed, t2, b + D, { speed: 60 });
  LU.show(S2, t2 + 0.3);
  tl.fromTo(U.oilPath, { strokeDashoffset: U.oilLen - 130 }, { strokeDashoffset: 0, duration: 2.0, ease: "power1.inOut", immediateRender: false }, t2 + 0.6);
  LU.show(IN, t2 + 0.4);
  LU.flow(inAir.id, t2 + 0.8, b + D, { speed: 70, period: 18 });
  tl.fromTo(inOil, { strokeDashoffset: 93 }, { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut", immediateRender: false }, t2 + 1.0);

  // ③ drops in the window → mist → OUT
  const t3 = b + c[2] + 0.1;
  LU.drops(U, "s3-v-u", LU.every(t3, b + D - 1.4, 1.0), { mistTo: 795, n: 10, seed: 3 });
  const S3 = H.el("g", { id: "s3-v-st3", opacity: 0 }, root);
  LU.label(S3, "s3-v-t3", 850, 182, "Oil mist", X(660), Y(282), { size: 26, sub: "ละอองน้ำมัน → OUT", fx: 846, fy: 196, bg: 220 });
  LU.show(S3, t3 + 1.2);
}
