// Adjustment (p.27 intro / p.8): tighten the handle → pilot spring compressed → setting up; loosen → down;
// then the lock nut is run back against the body to hold the setting (lock-nut function = general rule).
{
  const Z = H.el("g", { transform: "translate(-334 -20) scale(1.4)" }, "s4-v-pl");
  const P = RV.pilot(Z, "s4-v-x", { standalone: true });
  const O = H.$("s4-v-ov"), c = T.cues;

  // part labels
  RV.label(O, "s4-v-lp", 150, 40, "Poppet", 178, 142, { anchor: "middle", fx: 160, fy: 48 });
  RV.label(O, "s4-v-ls", 420, 40, "Pilot spring", 400, 140, { anchor: "middle", fx: 410, fy: 48 });
  H.text(O, 872, 44, "Handle", { size: 28, anchor: "middle" });
  const ln = RV.label(O, "s4-v-ln", 776, 336, "Lock nut", 776, 200, { anchor: "middle", fx: 776, fy: 306 });

  // rotation marks beside the handle
  const arc = (id, d) => H.el("path", { id, d, fill: "none", stroke: RV.blue, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, O);
  const aIn = arc("s4-v-ain", "M 930 96 A 42 76 0 0 1 930 232 M 952 222 L 930 232 L 934 208");
  const aOut = arc("s4-v-aout", "M 930 232 A 42 76 0 0 0 930 96 M 952 106 L 930 96 L 934 120");
  const tIn = H.text(O, 958, 300, "ขันเข้า", { size: 30, anchor: "middle", fill: RV.blue, id: "s4-v-tin" });
  const tOut = H.text(O, 958, 300, "คลายออก", { size: 30, anchor: "middle", fill: RV.blue, id: "s4-v-tout" });

  // setting dial (blue pointer = setting pressure) + up / down markers
  const G = H.gauge(O, 390, 452, 122, { id: "s4-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, needleColor: RV.blue, value: 5 });
  H.text(O, 390, 622, "ค่าแรงดันตั้ง (Setting)", { size: 26, anchor: "middle" });
  H.text(O, 290, 560, "ต่ำ", { size: 24, anchor: "middle", fill: RV.muted });
  H.text(O, 490, 560, "สูง", { size: 24, anchor: "middle", fill: RV.muted });
  const mk = (id, d, s, y) => {
    const m = H.el("g", { id, opacity: 0.18 }, O);
    H.el("path", { d, fill: RV.blue }, m);
    H.text(m, 648, y, s, { size: 32, fill: RV.blue });
    return m;
  };
  const mUp = mk("s4-v-mup", "M 580 418 L 610 368 L 640 418 Z", "สูงขึ้น", 406);
  const mDn = mk("s4-v-mdn", "M 580 492 L 610 542 L 640 492 Z", "ต่ำลง", 530);
  RV.ring(O, "s4-v-rn", 776, 162, 50);
  [aIn, aOut, tIn, tOut].forEach((e) => e.setAttribute("opacity", 0));

  const ndl = (v0, v1, t, first) => tl.fromTo(G.needle, { rotation: G.rot(v0), svgOrigin: G.origin }, { rotation: G.rot(v1), svgOrigin: G.origin, duration: 1.2, ease: "power2.inOut", immediateRender: first }, t);
  const fade = (e, a, z, t, first = true) => tl.fromTo(e, { opacity: a }, { opacity: z, duration: 0.3, immediateRender: first }, t);
  // lock nut backed off while adjusting
  tl.set(P.nut, { x: 10 }, b);

  // ① tighten: screw goes in, pilot spring is compressed, setting rises
  const t1 = b + c[0] + 1.6;
  fade(aIn, 0, 1, t1 - 0.3); fade(tIn, 0, 1, t1 - 0.3);
  tl.fromTo(P.adj, { x: 0 }, { x: -24, duration: 1.2, ease: "power2.inOut" }, t1);
  tl.fromTo(P.psp, { attr: { d: P.pspD(0, 0) } }, { attr: { d: P.pspD(0, -24) }, duration: 1.2, ease: "power2.inOut" }, t1);
  ndl(5, 7.6, t1, true);
  fade(mUp, 0.18, 1, t1 + 0.9);

  // ② loosen: screw comes out, spring force drops, setting falls
  const t2 = b + c[1] + 0.2;
  fade(aIn, 1, 0, t2 - 0.2, false); fade(tIn, 1, 0, t2 - 0.2, false);
  fade(aOut, 0, 1, t2, false); fade(tOut, 0, 1, t2, false);
  tl.fromTo(P.adj, { x: -24 }, { x: 14, duration: 1.2, ease: "power2.inOut", immediateRender: false }, t2 + 0.2);
  tl.fromTo(P.psp, { attr: { d: P.pspD(0, -24) } }, { attr: { d: P.pspD(0, 14) }, duration: 1.2, ease: "power2.inOut", immediateRender: false }, t2 + 0.2);
  ndl(7.6, 3.4, t2 + 0.2, false);
  fade(mUp, 1, 0.18, t2 + 0.6, false); fade(mDn, 0.18, 1, t2 + 1.0);

  // ③ setting done: run the lock nut against the body
  const t3 = b + c[2] + 0.2;
  fade(aOut, 1, 0, t3 - 0.2, false); fade(tOut, 1, 0, t3 - 0.2, false);
  tl.fromTo(P.nut, { x: 10 }, { x: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, t3 + 0.3);
  RV.pulse("s4-v-rn", t3 + 0.6, 2);
}
