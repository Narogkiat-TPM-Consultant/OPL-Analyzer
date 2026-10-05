// Mechanism (p.38 System 1–3 + figure): dirty air in → deflector swirls it → matter thrown to the bowl wall,
// falls to the bottom → air through the element → up the core → OUT (clean) → baffle keeps the bottom calm →
// collected water + dirt = drain.
{
  const S = AF.section("s3-v-art", "s3-v-x");
  const O = S.top, P = S.parts, c = T.cues, seg1 = c[1] - c[0] - 0.3;

  // labels
  const L = {
    inn: AF.label(O, "s3-v-lin", 30, 80, "IN", null, null, { size: 30 }),
    dirty: AF.label(O, "s3-v-ldirty", 30, 186, "ลมมีสิ่งปนเปื้อน", null, null, { size: 24, fill: AF.dirt }),
    out: AF.label(O, "s3-v-lout", 1070, 80, "OUT", null, null, { size: 30, anchor: "end" }),
    clean: AF.label(O, "s3-v-lclean", 1070, 186, "ลมสะอาด", null, null, { size: 24, anchor: "end", fill: AF.blue }),
    def: AF.label(O, "s3-v-ldef", 744, 250, "Deflector", 640, 222, { bg: 320, sub: "ตัวทำให้ลมหมุนวน", fx: 734, fy: 244 }),
    elem: AF.label(O, "s3-v-lel", 744, 356, "Filter element", 584, 372, { bg: 320, sub: "ไส้กรอง", fx: 734, fy: 350 }),
    baf: AF.label(O, "s3-v-lbaf", 744, 462, "Baffle plate", 612, 482, { bg: 320, sub: "แผ่นกั้น — กันฟุ้งกลับ", fx: 734, fy: 456 }),
    bowl: AF.label(O, "s3-v-lbowl", 56, 330, "Bowl (โบลว์)", 420, 356, { bg: 300, sub: "ถ้วยกรอง (ใส)", fx: 346, fy: 326 }),
    drain: AF.label(O, "s3-v-ldrain", 56, 520, "Drain (เดรน)", 446, 540, { bg: 300, sub: "น้ำ · สิ่งสกปรกที่สะสม", fx: 346, fy: 516 }),
  };

  // highlight rings
  const rDef = AF.ring(O, "s3-v-rdef", 540, 218, 132, 30);
  const rEl = AF.ring(O, "s3-v-rel", 540, 310, 66, 132);
  const rBaf = AF.ring(O, "s3-v-rbaf", 540, 476, 90, 26);
  const rPool = AF.ring(O, "s3-v-rpool", 540, 534, 130, 40);

  // ① IN: dirty air enters, deflector swirls it, matter is thrown to the wall and falls to the bottom
  AF.show(L.inn, b + c[0]); AF.show(L.dirty, b + c[0] + 0.3);
  AF.flow(S.f.inlet, b + c[0], b + D);
  const tDef = b + c[0] + 0.24 * seg1;
  AF.pulse(rDef, tDef, 2, 540, 218);
  AF.show(L.def, tDef);
  S.parts.swBack.concat(P.swFront).forEach((a, i) => {
    tl.fromTo(a, { opacity: 0 }, { opacity: i < 2 ? 0.55 : 1, duration: 0.4 }, tDef + 0.2);
    tl.fromTo(a, { strokeDashoffset: 0 }, { strokeDashoffset: -20 * Math.round((D - tDef + b) * 3), duration: b + D - tDef, ease: "none", immediateRender: false }, tDef);
  });
  P.swHead.forEach((a) => tl.fromTo(a, { opacity: 0 }, { opacity: 1, duration: 0.4 }, tDef + 0.2));
  AF.show(L.bowl, b + c[0] + 0.66 * seg1);

  // particles: a steady stream from cue 1 to the end; alternate right wall (front half-turn) / left wall (full turn)
  const pg = H.el("g", { id: "s3-v-pts" }, O);
  const n = Math.max(8, Math.floor((D - c[0] - 4.6) / 0.55));
  for (let i = 0; i < n; i++) {
    const kind = AF.KINDS[i % 4], loop = i % 3 === 1;
    const u = (i * 0.618034 + 0.21) % 1, v = (i * 0.414214 + 0.33) % 1;
    AF.track(pg, { t0: b + c[0] + 0.1 + i * 0.55, kind, yo: [-9, 6, -2, 10][i % 4], loop, rest: [448 + 184 * u, 518 + 34 * v], s: 1.1 });
  }

  // ② element: air passes the element (outside → core), fine dust stays on the outer surface, up the core to OUT
  AF.pulse(rEl, b + c[1] + 0.1, 2, 540, 310);
  AF.show(L.elem, b + c[1] + 0.1);
  tl.fromTo(P.inward, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[1] + 0.5);
  const fine = H.el("g", { id: "s3-v-fine", opacity: 0 }, O);
  for (let k = 0; k < 14; k++) {
    const y = 214 + ((k * 0.618034) % 1) * 196, left = k % 2 === 0;
    H.el("circle", { cx: left ? 492 : 588, cy: H.f(y), r: 3, fill: AF.dust, stroke: "#5f4d33", "stroke-width": 1 }, fine);
  }
  tl.fromTo(fine, { opacity: 0 }, { opacity: 1, duration: 1.2 }, b + c[1] + 0.9);
  AF.flow(S.f.core, b + c[1] + 0.8, b + D);
  AF.show(L.out, b + c[1] + 1.4); AF.show(L.clean, b + c[1] + 1.6);

  // ③ baffle plate: the swirl bounces off the plate, the bottom stays calm
  AF.pulse(rBaf, b + c[2] + 0.1, 2, 540, 476);
  AF.show(L.baf, b + c[2] + 0.1);
  const bnc = H.el("g", { id: "s3-v-bnc", opacity: 0 }, O);
  for (const m of [1, -1]) {
    const X = (x) => 540 + m * (x - 540);
    H.el("path", { d: `M ${X(596)} 440 Q ${X(624)} 482 ${X(646)} 440`, fill: "none", stroke: AF.flowC, "stroke-width": 5, "stroke-linecap": "round" }, bnc);
    H.el("path", { d: `M ${X(636)} 452 L ${X(646)} 438 L ${X(652)} 455`, fill: "none", stroke: AF.flowC, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, bnc);
  }
  tl.fromTo(bnc, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[2] + 0.6);

  // ④ drain: what collects at the bottom of the bowl
  AF.pulse(rPool, b + c[3] + 0.1, 2, 540, 534);
  AF.show(L.drain, b + c[3] + 0.1);
}
