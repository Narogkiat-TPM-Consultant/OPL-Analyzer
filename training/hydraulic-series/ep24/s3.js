// Mechanism (p.39 "System" 1–2 + balance): parts named → handle turned, spring pushes stem + valve DOWN, air IN→OUT
// → OUT pressure above the setting pushes the diaphragm UP against the spring, valve closes, air stops
// → spring force = air force under the diaphragm: valve stays, OUT pressure constant (needle on the green mark).
{
  const V = AR.section("s3-v-reg", "s3-v-x");
  const O = H.$("s3-v-ov"), c = T.cues, X = V.X;

  // part labels (English as on the sheet + Thai gloss), shown one by one as they are named
  const part = (id, x, y, en, th, lx, ly, o = {}) => {
    const m = AR.label(O, id, x, y, en, lx, ly, { anchor: o.anchor || "end", hidden: true, fx: o.fx, fy: o.fy });
    H.text(m, x, y + 27, th, { size: 22, anchor: o.anchor || "end", fill: AR.muted });
    return m;
  };
  const lH = part("s3-v-lh", 500, 38, "Handle", "มือหมุน", null, null, { anchor: "start" });
  const lN = part("s3-v-ln", 300, 98, "Lock nut", "น็อตล็อก", X - 31, 95, { fx: 306, fy: 90 });
  const lS = part("s3-v-ls", 268, 222, "Adjust spring", "สปริงปรับตั้ง", X - 46, 232, { fx: 274, fy: 214 });
  const lD = part("s3-v-ld", 222, 298, "Diaphragm", "แผ่นยางไดอะแฟรม", 262, 326, { fx: 228, fy: 290 });
  const lT = part("s3-v-lt", 128, 380, "Stem", "ก้านวาล์ว", X - 2, 398, { fx: 134, fy: 372 });
  const lV = part("s3-v-lv", 128, 584, "Valve", "วาล์ว", X - 38, 521, { fx: 134, fy: 576 });
  H.text(O, 960, 128, "ค่าตั้ง (Set)", { size: 25, anchor: "middle", fill: AR.green });

  // handle-turn mark (moves with the handle)
  const turn = H.el("path", { id: "s3-v-turn", d: `M ${X - 104} 50 A 104 18 0 0 0 ${X + 104} 50 M ${X + 96} 63 L ${X + 104} 50 L ${X + 112} 63`, fill: "none", stroke: AR.blue, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, V.hg);

  // force balance at the diaphragm: spring force down vs OUT air force up
  const FX = 620;
  const fbar = H.el("rect", { x: 592, y: 322, width: 56, height: 8, rx: 3, fill: AR.rubber, id: "s3-v-fbar", opacity: 0 }, O);
  const dn = H.el("path", { id: "s3-v-fdn", d: AR.forceD(FX, 316, 30, 1), fill: "none", stroke: AR.ink, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, O);
  const up = H.el("path", { id: "s3-v-fup", d: AR.forceD(FX, 336, 30, -1), fill: "none", stroke: AR.stream, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, O);
  const tDn = H.text(O, 644, 262, "แรงสปริง", { size: 27, id: "s3-v-tdn" });
  const tUp = H.text(O, 644, 404, "แรงลม OUT", { size: 27, fill: AR.stream, id: "s3-v-tup" });
  [tDn, tUp].forEach((e) => e.setAttribute("opacity", 0));
  const bal = AR.chip(O, "s3-v-bal", 650, 303, 126, "สมดุล", AR.green, { h: 46, size: 26, fill: "#e6f4ec" });

  // DN / UP state of the valve (the two close-ups on the sheet)
  const cDN = AR.chip(O, "s3-v-cdn", 600, 528, 336, "DN: วาล์วเปิด → ลมไหล", AR.blue, { h: 56, size: 28 });
  const cUP = AR.chip(O, "s3-v-cup", 600, 528, 336, "UP: วาล์วปิด → ลมหยุด", AR.ink, { h: 56, size: 28 });
  AR.ring(O, "s3-v-rv", X, 516, 62);
  AR.ring(O, "s3-v-rd", X, 330, 90, AR.yellow);
  AR.ring(O, "s3-v-rg", 960, 236, 104, AR.green);

  let Ls = 30, La = 30;
  const fDn = (L, t, d = 0.8) => { AR.ft(dn, { attr: { d: AR.forceD(FX, 316, Ls, 1) } }, { attr: { d: AR.forceD(FX, 316, L, 1) } }, t, d); Ls = L; };
  const fUp = (L, t, d = 0.8) => { AR.ft(up, { attr: { d: AR.forceD(FX, 336, La, -1) } }, { attr: { d: AR.forceD(FX, 336, L, -1) } }, t, d); La = L; };

  // ① parts, in the order they are spoken
  const s1 = b + c[0];
  [[lH, 0.5], [lN, 1.1], [lS, 1.8], [lD, 2.9], [lT, 3.5], [lV, 4.0]].forEach(([m, dt]) => AR.op(m, 0, 1, s1 + dt));

  // ② turn the handle: screw in, spring compressed, stem + valve pushed DOWN → air flows IN → OUT
  const t2 = b + c[1];
  AR.op(turn, 0, 1, t2 + 0.1);
  tl.fromTo(V.bar, { scaleX: 1, svgOrigin: `${X} 32` }, { scaleX: 0.3, svgOrigin: `${X} 32`, duration: 0.2, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }, t2 + 0.2);
  V.move({ sd: 34 }, t2 + 0.3, 1.0);
  AR.op(turn, 1, 0, t2 + 1.4);
  AR.op([fbar, dn, tDn], 0, 1, t2 + 0.3);
  fDn(84, t2 + 0.3, 1.0);
  V.move({ dv: 16 }, t2 + 1.2, 0.6);
  AR.op(cDN, 0, 1, t2 + 1.4);
  AR.pulse("s3-v-rv", t2 + 1.4, 1);
  AR.flow(V.fl, t2 + 1.7, b + c[2] + 1.7);
  V.outTo(AR.air, t2 + 1.8, 2.0);
  V.G.ndl(0, 4.3, t2 + 1.8, 2.3, "power1.out");
  AR.op([up, tUp], 0, 1, t2 + 2.0);
  fUp(66, t2 + 2.0, 2.0);

  // ③ OUT above the setting: air under the diaphragm pushes it UP against the spring → valve closes, air stops
  const t3 = b + c[2];
  V.G.ndl(4.3, 5.4, t3 + 0.1, 0.9, "power1.inOut");
  V.outTo(AR.airUp, t3 + 0.1, 0.9);
  fUp(104, t3 + 0.2, 0.8);
  AR.pulse("s3-v-rd", t3 + 0.7, 1);
  V.move({ dv: 0 }, t3 + 1.0, 0.7);
  fDn(96, t3 + 1.0, 0.7);
  AR.op(cDN, 1, 0, t3 + 1.3);
  AR.op(cUP, 0, 1, t3 + 1.5);
  AR.pulse("s3-v-rv", t3 + 1.6, 1);

  // ④ spring force = air force: balance, valve stays, OUT pressure constant on the green mark
  const t4 = b + c[3];
  fUp(96, t4 + 0.2, 0.9);
  V.G.ndl(5.4, 5, t4 + 0.2, 0.9, "power2.inOut");
  V.outTo(AR.air, t4 + 0.2, 0.9);
  AR.op(cUP, 1, 0.35, t4 + 0.4);
  AR.op(bal, 0, 1, t4 + 1.1);
  tl.fromTo(bal, { scale: 1.3, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)", immediateRender: false }, t4 + 1.1);
  AR.pulse("s3-v-rg", t4 + 2.8, 2);
}
