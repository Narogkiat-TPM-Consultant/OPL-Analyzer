// OPL 5-C-8 (p.28) steps 1–2, done by the assigned person (proposal, see callout/caption):
// pump running → loosen the lock nut → turn the handle: in → circuit pressure up, out → down (= normal);
// then back to the setting pressure and tighten the lock nut. Pilot head = EP05 drawing (RV.pilot), scaled 1.3.
{
  const c = T.cues;
  const R = H.$("s3-v-rv"), O = H.$("s3-v-ov");

  // pump → main line → circuit; the relief valve branch and the gauge stem (drawn first: behind the valve)
  E19.pipe(R, "M 70 282 H 640", 14);
  E19.pipe(R, "M 103 228 V 282", 12);
  E19.pipe(R, "M 250 282 V 314", 10);
  RV.dash(R, "s3-v-flow", "M 74 282 H 636", 5);
  H.el("circle", { cx: 46, cy: 282, r: 24, fill: E19.paper, stroke: E19.ink, "stroke-width": 4 }, R);
  H.el("path", { d: "M 46 261 L 35 278 L 57 278 Z", fill: E19.ink }, R);
  H.text(R, 46, 336, "ปั๊มเดิน", { size: 22, anchor: "middle", fill: E19.muted });
  H.text(R, 636, 266, "ไปวงจร →", { size: 24, anchor: "end", fill: E19.muted });

  const Z = H.el("g", { transform: "translate(-300 -30) scale(1.3)" }, R);
  const P = RV.pilot(Z, "s3-v-x", { standalone: true });

  // circuit pressure gauge: blue mark = setting pressure (no numbers — the deck gives none)
  const G = H.gauge(R, 250, 460, 148, { id: "s3-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, marks: [{ v: 6, color: RV.blue, id: "s3-v-gset" }], value: 6 });
  H.text(O, 336, 334, "ค่าตั้ง (Setting)", { size: 24, fill: RV.blue });
  H.text(O, 408, 606, "เกจแรงดันวงจร (Pressure gauge)", { size: 26 });

  // labels
  const lHandle = H.text(O, 821, 42, "Handle", { size: 28, anchor: "middle", id: "s3-v-lh" });
  const lNut = RV.label(O, "s3-v-ln", 730, 262, "Lock nut", 730, 174, { anchor: "middle", fx: 730, fy: 236 });
  [lHandle, lNut].forEach((e) => e.setAttribute("opacity", 0));

  // rotation marks beside the handle + words
  const arc = (id, d) => H.el("path", { id, d, fill: "none", stroke: RV.blue, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, O);
  const aIn = arc("s3-v-ain", "M 862 66 A 30 73 0 0 1 862 212 M 880 202 L 862 212 L 864 192");
  const aOut = arc("s3-v-aout", "M 862 212 A 30 73 0 0 0 862 66 M 880 76 L 862 66 L 864 86");
  const tIn = H.text(O, 906, 150, "ขันเข้า", { size: 32, fill: RV.blue, id: "s3-v-tin" });
  const tOut = H.text(O, 906, 150, "คลายออก", { size: 32, fill: RV.blue, id: "s3-v-tout" });
  [tIn, tOut].forEach((e) => e.setAttribute("opacity", 0));

  // result markers: pressure up / down, then "normal"
  const mk = (id, d, s, y) => {
    const m = H.el("g", { id, opacity: 0.18 }, O);
    H.el("path", { d, fill: RV.blue }, m);
    H.text(m, 490, y, s, { size: 32, fill: RV.blue });
    return m;
  };
  const mUp = mk("s3-v-mup", "M 440 412 L 458 380 L 476 412 Z", "แรงดันเพิ่ม", 410);
  const mDn = mk("s3-v-mdn", "M 440 500 L 458 532 L 476 500 Z", "แรงดันลด", 530);
  const chip = H.el("g", { id: "s3-v-chip", opacity: 0 }, O);
  H.el("rect", { x: 700, y: 436, width: 170, height: 60, rx: 30, fill: "#e6f4ec", stroke: E19.green, "stroke-width": 4 }, chip);
  E19.tick(chip, 734, 466, 20);
  H.text(chip, 766, 478, "ปกติ", { size: 32, fill: E19.green });

  RV.ring(O, "s3-v-rn", 730, 139, 46);
  RV.ring(O, "s3-v-rg", 250, 460, 166);
  RV.ring(O, "s3-v-rs", 317, 328, 28);

  const fade = (e, a, z, t) => E19.op(e, a, z, t, 0.3);
  const ndl = (v0, v1, t, dur) => tl.fromTo(G.needle, { rotation: G.rot(v0), svgOrigin: G.origin }, { rotation: G.rot(v1), svgOrigin: G.origin, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
  const adj = (x0, x1, t, dur) => {
    tl.fromTo(P.adj, { x: x0 }, { x: x1, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
    tl.fromTo(P.psp, { attr: { d: P.pspD(0, x0) } }, { attr: { d: P.pspD(0, x1) }, duration: dur, ease: "power2.inOut", immediateRender: false }, t);
  };

  RV.flow("s3-v-flow", b + 0.3, b + D, false);

  // ① loosen the lock nut, then the handle, look at the gauge
  fade(lNut, 0, 1, b + c[0] + 1.4);
  RV.pulse("s3-v-rn", b + c[0] + 1.5, 1);
  tl.fromTo(P.nut, { x: 0 }, { x: 10, duration: 0.4, ease: "power2.out" }, b + c[0] + 1.8);
  fade(lHandle, 0, 1, b + c[0] + 2.4);
  RV.pulse("s3-v-rg", b + c[0] + 3.1, 1);

  // normal: in → pressure up, out → pressure down
  const len1 = c[2] - c[1] - 0.3;
  const t1 = b + c[1] + 0.4, t2 = b + c[1] + len1 * 0.55;
  fade(aIn, 0, 1, t1 - 0.2); fade(tIn, 0, 1, t1 - 0.2);
  adj(0, -24, t1, 1.1); ndl(6, 8.2, t1, 1.1);
  fade(mUp, 0.18, 1, t1 + 0.8);
  fade(aIn, 1, 0, t2 - 0.25); fade(tIn, 1, 0, t2 - 0.25);
  fade(aOut, 0, 1, t2 - 0.05); fade(tOut, 0, 1, t2 - 0.05);
  adj(-24, 14, t2 + 0.1, 1.2); ndl(8.2, 3.6, t2 + 0.1, 1.2);
  fade(mUp, 1, 0.18, t2 + 0.3); fade(mDn, 0.18, 1, t2 + 1.0);
  fade(chip, 0, 1, b + c[2] - 0.5);

  // ② back to the setting, tighten the lock nut
  const t3 = b + c[2] + 0.4, t4 = b + c[2] + 1.9;
  fade(aOut, 1, 0, t3 - 0.3); fade(tOut, 1, 0, t3 - 0.3);
  fade(aIn, 0, 1, t3 - 0.1); fade(tIn, 0, 1, t3 - 0.1);
  adj(14, 0, t3, 0.9); ndl(3.6, 6, t3, 0.9);
  fade(mDn, 1, 0.18, t3 + 0.2);
  RV.pulse("s3-v-rs", t3 + 0.9, 1);
  fade(aIn, 1, 0, t4 - 0.3); fade(tIn, 1, 0, t4 - 0.3);
  tl.fromTo(P.nut, { x: 10 }, { x: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, t4);
  RV.pulse("s3-v-rn", t4 + 0.4, 2);
}
