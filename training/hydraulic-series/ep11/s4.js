// Countermeasures (OPL 5-B-3, p.15), parts shown dismantled (exploded view):
// ① poppet / seat / spring: clean the dirt, replace when worn / damaged
// ② balance piston: clean the choke hole, repair the sliding part by lapping or replace
// ③ air: find the cause and remove the air completely (vibration → change the spring condition)
// ④ routing for operators: dismantling = maintenance work → report (proposal)
{
  const g = H.$("s4-v-ex"), c = T.cues;
  const t0 = b + c[0], t1 = b + c[1], t2 = b + c[2], t3 = b + c[3];
  const lab = (x, y, s, o = {}) => H.text(g, x, y, s, { size: o.size || 26, anchor: o.anchor || "middle", fill: o.fill || RV.ink, ...(o.id ? { id: o.id } : {}) });
  const pill = (id, x, y, w, s, col = RV.blue) => {
    const p = H.el("g", { id, opacity: 0 }, g);
    H.el("rect", { x, y, width: w, height: 42, rx: 21, fill: col }, p);
    H.text(p, x + w / 2, y + 30, s, { size: 24, anchor: "middle", fill: "#ffffff" });
    return p;
  };
  const show = (e, t) => tl.fromTo(e, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);

  // ---- ① poppet group (top left): seat · poppet · pilot spring on one axis
  H.el("path", { d: "M 30 130 H 600", stroke: RV.muted, "stroke-width": 2, "stroke-dasharray": "22 6 4 6" }, g);
  const seatU = "M 50 72 H 110 V 108 L 98 120 H 50 Z", seatL = "M 50 140 H 98 L 110 152 V 188 H 50 Z";
  RV.bodyCut(g, seatU, [[50, 72, 60, 48]]);
  RV.bodyCut(g, seatL, [[50, 140, 60, 48]]);
  const pop = H.el("g", { id: "s4-v-pop" }, g);
  H.el("path", { d: "M 160 130 L 222 96 L 222 164 Z", fill: RV.dark, stroke: RV.ink, "stroke-width": 4, "stroke-linejoin": "round" }, pop);
  H.el("rect", { x: 222, y: 96, width: 74, height: 68, fill: RV.dark, stroke: RV.ink, "stroke-width": 4 }, pop);
  H.el("path", { d: RV.springH(340, 560, 130, 26, 7), fill: "none", stroke: RV.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  lab(80, 222, "Seat"); lab(228, 222, "Poppet"); lab(450, 222, "Pilot spring");
  const d1 = RV.dirt(g, "s4-v-d1", 186, 112, 9);
  const d2 = RV.dirt(g, "s4-v-d2", 112, 118, 7);
  const sp = H.el("g", { id: "s4-v-sp", opacity: 0 }, g);
  for (const [x, y] of [[186, 104], [112, 112]])
    H.el("path", { d: `M ${x - 16} ${y} H ${x + 16} M ${x} ${y - 16} V ${y + 16} M ${x - 10} ${y - 10} L ${x + 10} ${y + 10} M ${x - 10} ${y + 10} L ${x + 10} ${y - 10}`, stroke: RV.yellow, "stroke-width": 4, "stroke-linecap": "round" }, sp);
  const p1 = pill("s4-v-p1", 40, 244, 196, "ล้าง (Clean)");
  const p2 = pill("s4-v-p2", 250, 244, 350, "สึก / เสีย → เปลี่ยน (Replace)");

  // ---- ② balance piston (bottom left), drawn larger, with the choke hole and the sliding faces
  const P = H.el("g", { id: "s4-v-pis" }, g);
  H.el("rect", { x: 188, y: 340, width: 24, height: 250, fill: RV.tank }, P);
  H.el("rect", { x: 130, y: 340, width: 58, height: 250, fill: RV.metal, stroke: RV.ink, "stroke-width": 4 }, P);
  H.el("rect", { x: 212, y: 340, width: 58, height: 250, fill: RV.metal, stroke: RV.ink, "stroke-width": 4 }, P);
  const chk = H.el("path", { id: "s4-v-chk", d: "M 133 548 H 163 V 343", fill: "none", stroke: RV.pLo, "stroke-width": 14, "stroke-linejoin": "miter" }, P);
  const fch = RV.dash(P, "s4-v-fch", "M 135 548 H 163 V 345", 4);
  const cd = H.el("g", { id: "s4-v-cd" }, P);
  RV.dirt(cd, "s4-v-cd1", 142, 548, 8); RV.dirt(cd, "s4-v-cd2", 156, 544, 7); RV.dirt(cd, "s4-v-cd3", 164, 556, 6.5); RV.dirt(cd, "s4-v-cd4", 163, 532, 6);
  const sl = H.el("g", { id: "s4-v-sl", opacity: 0 }, P);
  H.el("rect", { x: 122, y: 350, width: 10, height: 230, fill: RV.yellow }, sl);
  H.el("rect", { x: 268, y: 350, width: 10, height: 230, fill: RV.yellow }, sl);
  lab(200, 326, "Balance piston");
  RV.label(g, "s4-v-lc", 24, 624, "Choke hole", 146, 556, { fx: 80, fy: 600, size: 24 });
  RV.label(g, "s4-v-ls", 316, 398, "ส่วนเลื่อน (Sliding part)", 278, 420, { fx: 314, fy: 404, size: 26 });
  const p3 = pill("s4-v-p3", 312, 450, 250, "ล้าง Choke hole");
  const p4 = pill("s4-v-p4", 312, 506, 290, "Lapping / เปลี่ยน");
  // lapping: a small rotating arrow beside the sliding face
  const lap = H.el("g", { id: "s4-v-lap", opacity: 0 }, g);
  H.el("path", { d: H.arcD(306, 602, 22, 200, 480) + " M 290 584 L 305 580 L 300 595", fill: "none", stroke: RV.blue, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, lap);

  // ---- ③ air in the oil (top right): bubbles leave through a vent
  H.el("rect", { x: 690, y: 108, width: 370, height: 64, fill: RV.pHi }, g);
  H.el("path", { d: "M 690 104 H 862 M 898 104 H 1060 M 690 176 H 1060", stroke: RV.ink, "stroke-width": 8 }, g);
  H.el("path", { d: "M 862 104 V 54 M 898 104 V 54", stroke: RV.ink, "stroke-width": 6 }, g);
  H.el("rect", { x: 865, y: 58, width: 30, height: 50, fill: RV.pLo }, g);
  const bub = H.el("g", { id: "s4-v-bub" }, g);
  const bp = [[720, 130, 9], [760, 152, 7], [804, 126, 10], [850, 150, 7], [930, 132, 9], [972, 154, 7], [1018, 128, 9]];
  const bs = bp.map(([x, y, r]) => RV.bubble(bub, x, y, r));
  lab(875, 214, "อากาศปนในน้ำมัน (Air)");
  const p5 = pill("s4-v-p5", 700, 232, 350, "หาสาเหตุ → ไล่อากาศออกหมด");

  // ---- ④ routing: dismantling = maintenance work (bottom right)
  const M = H.el("g", { id: "s4-v-mt", opacity: 0 }, g);
  H.el("rect", { x: 680, y: 330, width: 392, height: 290, rx: 24, fill: "#eef3fb", stroke: RV.blue, "stroke-width": 5, "stroke-dasharray": "14 10" }, M);
  const wr = H.el("g", {}, M);
  H.el("line", { x1: 812, y1: 512, x2: 902, y2: 422, stroke: RV.ink, "stroke-width": 30, "stroke-linecap": "round" }, wr);
  H.el("line", { x1: 812, y1: 512, x2: 902, y2: 422, stroke: RV.dark, "stroke-width": 20, "stroke-linecap": "round" }, wr);
  H.el("circle", { cx: 920, cy: 404, r: 40, fill: RV.dark, stroke: RV.ink, "stroke-width": 5 }, wr);
  H.el("path", { d: H.hexD(920, 404, 19), fill: "#eef3fb", stroke: RV.ink, "stroke-width": 4, "stroke-linejoin": "round" }, wr);
  H.text(M, 876, 572, "ถอดวาล์ว = งานช่าง", { size: 30, anchor: "middle" });
  H.text(M, 876, 606, "(Maintenance)", { size: 22, anchor: "middle", fill: RV.muted });

  // ① clean / replace
  show(p1, t0 + 0.8);
  tl.fromTo([d1, d2], { opacity: 1 }, { opacity: 0, duration: 0.4 }, t0 + 1.1);
  tl.fromTo(sp, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.3, ease: "back.out(2)" }, t0 + 1.2);
  tl.fromTo(sp, { opacity: 1 }, { opacity: 0, duration: 0.4, immediateRender: false }, t0 + 1.9);
  show(p2, t0 + 2.0);
  tl.fromTo(pop, { x: 0 }, { x: -8, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, t0 + 2.2);

  // ② clean the choke hole → oil passes; sliding faces highlighted, lapping
  show(p3, t1 + 0.3);
  tl.fromTo(cd, { opacity: 1 }, { opacity: 0, duration: 0.4 }, t1 + 0.5);
  tl.fromTo(chk, { stroke: RV.pLo }, { stroke: RV.pHi, duration: 0.5 }, t1 + 0.7);
  RV.flow("s4-v-fch", t1 + 0.9, b + D, false);
  tl.fromTo(sl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 1.4);
  show(p4, t1 + 1.6);
  tl.fromTo(lap, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 1.6);
  tl.fromTo(lap, { rotation: 0, svgOrigin: "306 602" }, { rotation: 720, svgOrigin: "306 602", duration: 2.4, ease: "none" }, t1 + 1.6);
  tl.fromTo(lap, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t1 + 4.0);

  // ③ bubbles rise out of the vent
  show(p5, t2 + 0.4);
  bs.forEach((e, i) => {
    const x = +e.getAttribute("cx"), y = +e.getAttribute("cy");
    tl.fromTo(e, { x: 0, y: 0, opacity: 1 }, { x: 880 - x, y: 120 - y, duration: 0.6, ease: "power1.in" }, t2 + 0.6 + i * 0.22);
    tl.fromTo(e, { y: 120 - y, opacity: 1 }, { y: 10 - y, opacity: 0, duration: 0.5, ease: "power1.out", immediateRender: false }, t2 + 1.2 + i * 0.22);
  });

  // ④ routing badge
  tl.fromTo(M, { opacity: 0, scale: 0.9, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(1.6)" }, t3 + 0.2);
  tl.fromTo(wr, { rotation: -12, svgOrigin: "860 470" }, { rotation: 12, svgOrigin: "860 470", duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, t3 + 0.5);
}
