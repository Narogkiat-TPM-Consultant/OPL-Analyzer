// Structure: the cross-section, parts named with the narration (cues 2–4); at cue 4 oil fills A, then B via the choke.
{
  const V = RV.section("s2-v-rv", "s2-v-x");
  const L = H.$("s2-v-lb"), c = T.cues;
  const box = (id, x, y, w, h) => H.el("rect", { id, x, y, width: w, height: h, rx: 14, fill: "rgba(31,95,191,0.07)", stroke: RV.blue, "stroke-width": 5, "stroke-dasharray": "14 10", opacity: 0 }, L);

  // ports (with segment 1: what the valve is connected to)
  const ports = H.el("g", { id: "s2-v-ports" }, L);
  H.text(ports, 22, 492, "จากปั๊ม", { size: 26 });
  H.text(ports, 22, 524, "(Pressure port)", { size: 22, fill: RV.muted });
  H.text(ports, 478, 612, "ไปถัง (Tank port)", { size: 26 });

  // ① poppet + pilot spring
  box("s2-v-b1", 314, 88, 300, 84);
  const l1 = H.el("g", { id: "s2-v-l1" }, L);
  RV.label(l1, "s2-v-l1a", 300, 40, "Poppet", 345, 116, { anchor: "middle", fx: 330, fy: 48 });
  RV.label(l1, "s2-v-l1b", 520, 40, "Pilot spring", 500, 112, { anchor: "middle", fx: 510, fy: 48 });
  // ② balance piston + upper spring
  box("s2-v-b2", 360, 178, 140, 312);
  const l2 = H.el("g", { id: "s2-v-l2" }, L);
  RV.label(l2, "s2-v-l2a", 716, 262, "สปริงบน (Upper spring)", 461, 232, { fx: 712, fy: 254 });
  RV.label(l2, "s2-v-l2b", 716, 352, "Balance piston", 487, 345, { fx: 712, fy: 344 });
  // ③ choke hole + chambers A / B
  const l3 = H.el("g", { id: "s2-v-l3" }, L);
  RV.label(l3, "s2-v-l3a", 214, 312, "Choke hole", 393, 372, { bg: 156, fx: 330, fy: 322, size: 24 });
  RV.mark(l3, "s2-v-mA", 532, 404, "A");
  RV.mark(l3, "s2-v-mB", 532, 222, "B", 490, 222);

  const show = (sel, t) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t);
  show("#s2-v-ports", b + c[0] + 0.6);
  show("#s2-v-b1", b + c[1]); show("#s2-v-l1", b + c[1] + 0.2);
  tl.fromTo("#s2-v-b1", { opacity: 1 }, { opacity: 0, duration: 0.4, immediateRender: false }, b + c[2] - 0.2);
  show("#s2-v-b2", b + c[2]); show("#s2-v-l2", b + c[2] + 0.2);
  tl.fromTo("#s2-v-b2", { opacity: 1 }, { opacity: 0, duration: 0.4, immediateRender: false }, b + c[3] - 0.2);
  show("#s2-v-l3", b + c[3]);
  // poppet nudged by the pilot spring, piston pressed onto its seat by the upper spring
  tl.fromTo(V.pop, { x: 6 }, { x: 0, duration: 0.5, ease: "back.out(3)" }, b + c[1] + 0.5);
  tl.fromTo(V.pis, { y: -14 }, { y: 0, duration: 0.5, ease: "back.out(3)" }, b + c[2] + 0.6);
  tl.fromTo(V.usp, { attr: { d: V.uspD(14) } }, { attr: { d: V.uspD(0) }, duration: 0.5, ease: "back.out(3)" }, b + c[2] + 0.6);
  // oil from the pump fills A, passes the choke hole and fills B
  RV.flow(V.f.inlet, b + c[3] + 0.2, b + D - 0.1, false);
  tl.fromTo(V.z.A, { fill: RV.pLo }, { fill: RV.pHi, duration: 0.8 }, b + c[3] + 0.4);
  tl.fromTo(V.choke, { stroke: RV.pLo }, { stroke: RV.pHi, duration: 0.5 }, b + c[3] + 0.9);
  RV.flow(V.f.choke, b + c[3] + 0.9, b + D - 0.1, false);
  tl.fromTo(V.z.B, { fill: RV.pLo }, { fill: RV.pHi, duration: 0.8 }, b + c[3] + 1.3);
}
