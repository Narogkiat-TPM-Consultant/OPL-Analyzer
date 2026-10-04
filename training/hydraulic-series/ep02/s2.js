// Advantages: five tiles light up with the numbered points (cue 2–6); each tile's mechanism moves while it is spoken.
{
  const P = "s2-v-grid", c = T.cues, p = T.points;
  const L = (k) => H.segLen(c, D, k);
  const R = (pa, x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, rx: o.rx ?? 4, fill, stroke: E2.ink, "stroke-width": o.sw ?? 4, ...(o.id ? { id: o.id } : {}) }, pa);
  const t1 = H.tile(P, "s2-v-t1", 12, 12, 380, 616, 1, "เล็ก แรง ปลอดภัย");
  const t2 = H.tile(P, "s2-v-t2", 412, 12, 328, 300, 2, "Relief valve");
  const t3 = H.tile(P, "s2-v-t3", 760, 12, 328, 300, 3, "ปรับแรง (Force)");
  const t4 = H.tile(P, "s2-v-t4", 412, 328, 328, 300, 4, "ปรับความเร็ว");
  const t5 = H.tile(P, "s2-v-t5", 760, 328, 328, 300, 5, "ทนทาน (Durable)");
  [t1, t2, t3, t4, t5].forEach((t, i, a) => H.tileOn(t, b + p[i], i < a.length - 1 ? b + p[i + 1] : null));

  // ① 40 kgf/cm² on the gauge ≈ a 400 m water column (waterworks)
  const G = H.gauge(t1.g, 140, 300, 100, { id: "s2-v-g", min: 0, max: 50, ticks: 5, minor: 1, value: 0, labelSize: 22 });
  const v40 = H.text(t1.g, 146, 452, "40 kgf/cm²", { size: 34, fill: E2.blue, anchor: "middle" });
  H.text(t1.g, 146, 488, "แรงดันวงจรทั่วไป", { size: 22, fill: E2.muted, anchor: "middle" });
  H.text(t1.g, 271, 318, "≈", { size: 52, anchor: "middle" });
  R(t1.g, 300, 112, 52, 450, "#eef3fb", { rx: 6 });
  const water = H.el("rect", { x: 304, y: 558, width: 44, height: 0, fill: E2.water }, t1.g);
  const dim = H.el("path", { d: H.dimD(374, 558, 374, 116, 14), fill: "none", stroke: E2.ink, "stroke-width": 3 }, t1.g);
  const v400 = H.text(t1.g, 326, 100, "400 m", { size: 30, fill: E2.blue, anchor: "middle" });
  H.text(t1.g, 326, 598, "น้ำ (ประปา)", { size: 22, anchor: "middle" });
  const a1 = b + c[1];
  tl.fromTo(G.needle, { rotation: G.rot(0), svgOrigin: G.origin }, { rotation: G.rot(40), svgOrigin: G.origin, duration: 1.1, ease: "power2.out" }, a1 + 0.3 * L(2));
  tl.fromTo(v40, { opacity: 0 }, { opacity: 1, duration: 0.3 }, a1 + 0.3 * L(2) + 0.6);
  tl.fromTo(water, { attr: { y: 558, height: 0 } }, { attr: { y: 116, height: 442 }, duration: 1.6, ease: "power1.inOut" }, a1 + 0.55 * L(2));
  tl.fromTo([dim, v400], { opacity: 0 }, { opacity: 1, duration: 0.3 }, a1 + 0.55 * L(2) + 1.4);

  // ② Relief valve: pressure too high → ball lifts against the spring → oil returns to the tank
  R(t2.g, 500, 96, 110, 184, E2.metal, { rx: 6 });
  R(t2.g, 528, 116, 54, 146, E2.card, { sw: 3 });
  H.el("rect", { x: 530, y: 222, width: 50, height: 38, fill: E2.oil }, t2.g);
  H.el("path", { d: "M 428 241 L 534 241", stroke: E2.blue, "stroke-width": 16 }, t2.g);
  const fIn = H.el("path", { id: "s2-v-fin", d: "M 428 241 L 534 241", fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", opacity: 0 }, t2.g);
  const outD = "M 582 168 L 716 168";
  const out = H.el("path", { d: outD, stroke: E2.dark, "stroke-width": 12, fill: "none" }, t2.g);
  const outHead = H.el("path", { d: "M 712 154 L 730 168 L 712 182 Z", fill: E2.dark }, t2.g);
  const fOut = H.el("path", { id: "s2-v-fout", d: outD, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", opacity: 0 }, t2.g);
  R(t2.g, 528, 212, 14, 10, E2.ink, { rx: 1, sw: 0 });
  R(t2.g, 568, 212, 14, 10, E2.ink, { rx: 1, sw: 0 });
  const ball = H.el("circle", { cx: 555, cy: 202, r: 15, fill: E2.dark, stroke: E2.ink, "stroke-width": 3 }, t2.g);
  const spring = H.el("path", { d: H.springD(555, 134, 187, 12, 6), fill: "none", stroke: E2.ink, "stroke-width": 3 }, t2.g);
  R(t2.g, 536, 126, 38, 8, E2.ink, { rx: 1, sw: 0 });
  R(t2.g, 546, 80, 18, 48, E2.dark, { rx: 2, sw: 3 });
  R(t2.g, 538, 92, 34, 12, E2.ink, { rx: 2, sw: 0 });
  H.text(t2.g, 428, 224, "แรงดัน", { size: 22 });
  H.text(t2.g, 655, 152, "กลับถัง", { size: 22, anchor: "middle" });
  const open = H.text(t2.g, 430, 304, "เกิน → เปิดเอง (Auto)", { size: 22, fill: E2.blue });
  const a2 = b + c[2];
  tl.fromTo(fIn, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, a2 + 0.4);
  tl.fromTo(fIn, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((D - c[2]) * 3), duration: D - c[2] - 0.4, ease: "none", immediateRender: false }, a2 + 0.4);
  tl.fromTo(ball, { y: 0 }, { y: -16, duration: 0.35, ease: "power2.out" }, a2 + 1.4);
  tl.fromTo(spring, { attr: { d: H.springD(555, 134, 187, 12, 6) } }, { attr: { d: H.springD(555, 134, 171, 12, 6) }, duration: 0.35, ease: "power2.out" }, a2 + 1.4);
  tl.fromTo(out, { attr: { stroke: E2.dark } }, { attr: { stroke: E2.blue }, duration: 0.3 }, a2 + 1.5);
  tl.fromTo(outHead, { attr: { fill: E2.dark } }, { attr: { fill: E2.blue }, duration: 0.3 }, a2 + 1.5);
  tl.fromTo(fOut, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, a2 + 1.6);
  tl.fromTo(fOut, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((D - c[2]) * 3), duration: D - c[2] - 1.6, ease: "none", immediateRender: false }, a2 + 1.6);
  tl.fromTo(open, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 }, a2 + 1.6);

  // ③ Force: turn the reducing-valve knob → pressing force F follows, set precisely
  const knob = H.el("g", { id: "s2-v-knob" }, t3.g);
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i;
    H.el("circle", { cx: H.f(850 + 44 * Math.cos(a)), cy: H.f(180 + 44 * Math.sin(a)), r: 10, fill: E2.metal, stroke: E2.ink, "stroke-width": 3 }, knob);
  }
  H.el("circle", { cx: 850, cy: 180, r: 45, fill: E2.metal }, knob);
  H.el("circle", { cx: 850, cy: 180, r: 30, fill: "none", stroke: E2.ink, "stroke-width": 2, opacity: 0.5 }, knob);
  H.el("line", { x1: 850, y1: 180, x2: 850, y2: 142, stroke: E2.blue, "stroke-width": 8, "stroke-linecap": "round" }, knob);
  const turnEnd = [850 + 70 * Math.cos((320 * Math.PI) / 180), 180 + 70 * Math.sin((320 * Math.PI) / 180)];
  const turn = H.el("path", { d: H.arcD(850, 180, 70, 215, 320) + " " + H.arrowD(turnEnd[0] - 9 * 0.643, turnEnd[1] - 9 * 0.766, turnEnd[0], turnEnd[1], 15).replace(/^M [^L]+L [^M]+/, ""), fill: "none", stroke: E2.blue, "stroke-width": 5, opacity: 0 }, t3.g);
  H.el("circle", { cx: 850, cy: 180, r: 12, fill: E2.ink }, t3.g);
  H.text(t3.g, 850, 278, "วาล์วลดแรงดัน", { size: 22, anchor: "middle" });
  R(t3.g, 950, 88, 90, 62, E2.tube, { rx: 6 });
  R(t3.g, 987, 150, 16, 56, E2.dark, { rx: 1, sw: 3 });
  R(t3.g, 958, 206, 74, 12, E2.dark, { rx: 2, sw: 3 });
  R(t3.g, 952, 218, 86, 40, E2.metal, { rx: 4 });
  const force = H.el("path", { d: H.arrowD(1064, 112, 1064, 236, 22), fill: "none", stroke: E2.blue, "stroke-width": 9 }, t3.g);
  H.text(t3.g, 1064, 100, "F", { size: 28, fill: E2.blue, anchor: "middle" });
  H.text(t3.g, 995, 292, "แรงกด", { size: 22, anchor: "middle" });
  const a3 = b + c[3];
  tl.fromTo(turn, { opacity: 0 }, { opacity: 1, duration: 0.3 }, a3 + 0.3);
  tl.fromTo(knob, { rotation: 0, svgOrigin: "850 180" }, { rotation: 140, svgOrigin: "850 180", duration: 1.0, ease: "power2.inOut" }, a3 + 0.5);
  tl.fromTo(force, { scaleY: 0.35, svgOrigin: "1064 112" }, { scaleY: 1, svgOrigin: "1064 112", duration: 1.0, ease: "power2.inOut" }, a3 + 0.5);
  tl.to(knob, { rotation: 110, svgOrigin: "850 180", duration: 0.5, ease: "power2.inOut" }, a3 + 1.7);
  tl.to(force, { scaleY: 0.82, svgOrigin: "1064 112", duration: 0.5, ease: "power2.inOut" }, a3 + 1.7);

  // ④ Speed: stepless (flow control valve) vs. gear steps
  H.el("path", { d: H.arrowD(440, 604, 724, 604, 14) + " " + H.arrowD(440, 604, 440, 396, 14), fill: "none", stroke: E2.ink, "stroke-width": 4 }, t4.g);
  H.text(t4.g, 452, 410, "ความเร็ว", { size: 21, fill: E2.muted });
  H.el("path", { d: "M 440 604 H 505 V 558 H 570 V 512 H 635 V 466 H 700 V 420", fill: "none", stroke: E2.dark, "stroke-width": 5, "stroke-dasharray": "10 7" }, t4.g);
  H.text(t4.g, 716, 590, "เกียร์ = เป็นขั้น", { size: 21, fill: E2.muted, anchor: "end" });
  const line = H.el("path", { id: "s2-v-line", d: "M 440 604 L 700 420", fill: "none", stroke: E2.blue, "stroke-width": 8 }, t4.g);
  const dot = H.el("circle", { cx: 440, cy: 604, r: 11, fill: E2.blue, stroke: "#ffffff", "stroke-width": 3 }, t4.g);
  const sl = H.text(t4.g, 690, 404, "ต่อเนื่อง", { size: 22, fill: E2.blue, anchor: "end" });
  const a4 = b + c[4], Ln = Math.hypot(260, 184);
  tl.fromTo(line, { strokeDasharray: Ln, strokeDashoffset: Ln }, { strokeDashoffset: 0, duration: 2.0, ease: "none" }, a4 + 0.4);
  tl.fromTo(dot, { x: 0, y: 0 }, { x: 260, y: -184, duration: 2.0, ease: "none" }, a4 + 0.4);
  tl.fromTo(sl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, a4 + 1.6);

  // ⑤ Durable: piston and rod run inside oil
  R(t5.g, 784, 420, 226, 96, E2.tube, { rx: 6, sw: 5 });
  H.el("rect", { x: 789, y: 425, width: 216, height: 86, fill: E2.oil }, t5.g);
  R(t5.g, 800, 404, 16, 16, E2.blue, { rx: 1, sw: 3 });
  R(t5.g, 976, 404, 16, 16, E2.blue, { rx: 1, sw: 3 });
  const pis = H.el("g", { id: "s2-v-pis" }, t5.g);
  R(pis, 872, 425, 24, 86, E2.dark, { rx: 2, sw: 3 });
  R(pis, 896, 458, 156, 20, E2.dark, { rx: 2, sw: 3 });
  R(t5.g, 1004, 450, 14, 36, E2.ink, { rx: 2, sw: 0 });
  for (const [x, y] of [[822, 450], [838, 488], [948, 444], [962, 496]]) H.el("path", { d: `M ${x} ${y} q 8 -6 16 0 q 8 6 16 0`, fill: "none", stroke: "#ffffff", "stroke-width": 3 }, t5.g);
  H.text(t5.g, 924, 574, "แช่ในน้ำมัน → สึกหรอยาก", { size: 24, anchor: "middle" });
  tl.fromTo(pis, { x: -30 }, { x: 30, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 4 }, b + c[5] + 0.3);
}
