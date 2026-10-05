// 3-month inspection (OPL 5'-C-2 Table 1, p.45): a magnifier walks the circuit along the air path and stops
// at each of the 6 points as it is spoken; each check is animated on the device:
//   1 filter: water rises, the float lifts, the auto drain opens and drains   2 regulator: knob turned, gauge follows
//   3 gauge: stop valve closed / pressure released → needle to 0   4 direction valve: valve cycles, exhaust puffs carry oil mist
//   5 speed adjust valve: knob turned → strokes slow down   6 cylinder: piston-rod seal
{
  const C = H.pnCircuit("s2-v-u", "s2-v-c");
  const fx = H.$("s2-v-fx"), c = T.cues;
  const SEG = [
    "ทุกสามเดือน ไล่ตรวจตามทางลม",
    "ฟิลเตอร์ ดูออโต้เดรนทำงาน",
    "เรกูเลเตอร์ ลองหมุนปรับแรงดัน แล้วปล่อยลมออก เกจต้องชี้ศูนย์",
    "วาล์วเปลี่ยนทิศทาง ดูน้ำมันที่ช่องระบายลม",
    "วาล์วปรับความเร็ว ลองปรับดู กระบอกสูบ ดูลมรั่วที่ก้านสูบ",
  ];
  const segLen = (k) => (k < c.length ? c[k] - c[k - 1] - 0.3 : D - 0.8 - c[k - 1]);
  const at = (k, w) => b + c[k - 1] + (segLen(k) * Math.max(0, SEG[k - 1].indexOf(w))) / SEG[k - 1].length;
  const t1 = b + c[1], t2 = b + c[2], tRel = at(3, "แล้วปล่อย"), t4 = b + c[3], t5 = b + c[4];
  const tSC = at(5, "ลองปรับ"), tCyl = at(5, "กระบอกสูบ");

  // ---- tags (number · device · what to check)
  const TAGS = [
    [1, "Air filter", "Auto drain ทำงานไหม", 200, 640, t1 + 0.1],
    [2, "Regulator", "ลองหมุนปรับแรงดัน", 175, 150, t2 + 0.1],
    [3, "Pressure gauge", "ปล่อยลมออก → ชี้ 0", 700, 150, tRel],
    [4, "Direction valve", "Exhaust: ดูน้ำมันหล่อลื่น", 1110, 600, t4 + 0.1],
    [5, "Speed adjust valve", "ลองปรับความเร็ว", 1196, 374, t5 + 0.1],
    [6, "Air cylinder", "ลมรั่วที่ก้านสูบ?", 1390, 36, tCyl],
  ];
  TAGS.forEach(([n, ti, sub, x, y, t]) => {
    const g = H.pnTag(fx, `s2-v-t${n}`, x, y, n, ti, sub);
    tl.fromTo(g, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
  });

  // ---- magnifier: walks the air path during segment 1, then hops to each point
  const lens = H.pnLens(fx, "s2-v-lens");
  const route = [[50, 80], [50, 410], [680, 410], [680, 620], [1000, 620], [1000, 405], [960, 405], [960, 300], [1190, 300], [1190, 185], [1500, 185]];
  const rl = route.slice(1).map((q, i) => Math.hypot(q[0] - route[i][0], q[1] - route[i][1]));
  const rTot = rl.reduce((a, v) => a + v, 0), r0 = b + c[0] + 0.1, rDur = Math.max(1.5, t1 - r0 - 0.4);
  tl.fromTo(lens, { opacity: 0, x: route[0][0], y: route[0][1], scale: 0.55, svgOrigin: "0 0" }, { opacity: 1, x: route[0][0], y: route[0][1], scale: 0.55, svgOrigin: "0 0", duration: 0.25 }, r0);
  let tt = r0;
  route.slice(1).forEach((q, i) => {
    const d = (rDur * rl[i]) / rTot;
    tl.fromTo(lens, { x: route[i][0], y: route[i][1] }, { x: q[0], y: q[1], duration: d, ease: "none", immediateRender: false }, tt);
    tt += d;
  });
  const hops = [[C.at.drain, 1, t1], [C.at.knob, 0.9, t2], [C.at.gauge, 0.9, tRel], [C.at.exhaust, 1.65, t4], [C.at.sc, 0.95, t5], [C.at.rodSeal, 0.9, tCyl]];
  let prev = [route[route.length - 1], 0.55];
  hops.forEach(([[x, y], s, t]) => {
    tl.fromTo(lens, { x: prev[0][0], y: prev[0][1], scale: prev[1], svgOrigin: "0 0" }, { x, y, scale: s, svgOrigin: "0 0", duration: 0.45, ease: "power2.inOut", immediateRender: false }, t);
    prev = [[x, y], s];
  });

  // ---- air is on (main line flows), lubricator drips in its sight dome
  H.pnFlowOn(C.flows.main, b + 0.4, tRel + 0.35);
  H.pnFlowOn(C.flows.main, t4 + 0.05, b + D - 0.1, true);
  tl.fromTo(C.ldrop, { y: 0, opacity: 1 }, { y: 22, opacity: 0, duration: 0.5, ease: "power1.in", repeat: Math.max(1, Math.floor((D - 1.5) / 2.1)), repeatDelay: 1.6 }, b + 1);

  // ---- 1 filter: water collects, float rises, auto drain opens, water drains out
  tl.fromTo(C.water, { attr: { d: C.waterD(560) } }, { attr: { d: C.waterD(526) }, duration: 0.9, ease: "power1.inOut" }, t1 + 0.2);
  tl.fromTo(C.float, { y: 0 }, { y: -34, duration: 0.9, ease: "power1.inOut" }, t1 + 0.2);
  tl.fromTo(C.plug, { y: 0 }, { y: 7, duration: 0.15 }, t1 + 1.15);
  tl.to(C.water, { attr: { d: C.waterD(560) }, duration: 1.2, ease: "power1.in" }, t1 + 1.25);
  tl.to(C.float, { y: 0, duration: 1.2, ease: "power1.in" }, t1 + 1.25);
  tl.to(C.plug, { y: 0, duration: 0.15 }, t1 + 2.5);
  for (let i = 0; i < 6; i++) {
    const dr = H.el("path", { id: `s2-v-dd${i}`, d: H.pnDropD(170, 650, 0.9), fill: PN.water, opacity: 0 }, fx);
    const t = t1 + 1.25 + 0.22 * i;
    tl.fromTo(dr, { opacity: 0 }, { opacity: 1, duration: 0.06 }, t);
    tl.fromTo(dr, { y: 0 }, { y: 58, duration: 0.5, ease: "power1.in" }, t);
    tl.to(dr, { opacity: 0, duration: 0.15 }, t + 0.38);
  }

  // ---- 2 regulator: knob turned up then back, both gauge needles follow
  const arc = H.el("g", { id: "s2-v-karc", opacity: 0 }, fx);
  H.el("path", { d: "M 318 296 Q 360 322 402 296", fill: "none", stroke: PN.pipe, "stroke-width": 6 }, arc);
  H.el("path", { d: "M 402 296 L 384 298 M 402 296 L 394 280 M 318 296 L 336 298 M 318 296 L 326 280", fill: "none", stroke: PN.pipe, "stroke-width": 6, "stroke-linecap": "round" }, arc);
  tl.fromTo(arc, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t2 + 0.15);
  tl.to(arc, { opacity: 0, duration: 0.3 }, t2 + 1.9);
  tl.fromTo(C.knurl, { x: 0 }, { x: -27, duration: 0.7, ease: "power1.inOut" }, t2 + 0.3);
  tl.to(C.knurl, { x: 0, duration: 0.7, ease: "power1.inOut" }, t2 + 1.1);

  // gauge inset (big view of the regulator gauge)
  const gi = H.el("g", { id: "s2-v-gi", opacity: 0 }, fx);
  H.el("line", { x1: 384, y1: 392, x2: 548, y2: 254, stroke: PN.muted, "stroke-width": 3, "stroke-dasharray": "8 7" }, gi);
  H.el("circle", { cx: 600, cy: 200, r: 84, fill: "none", stroke: PN.pipe, "stroke-width": 5 }, gi);
  const BG = H.pnDial(gi, 600, 200, 76, { id: "s2-v-gb", zero: true, unit: true, ticks: 10 });
  const [zx, zy] = BG.zeroAt;
  const ok0 = H.el("circle", { id: "s2-v-ok0", cx: H.f(zx), cy: H.f(zy), r: 19, fill: "none", stroke: PN.green, "stroke-width": 5, opacity: 0 }, gi);
  tl.fromTo(gi, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t2 + 0.15);
  const needles = [[C.gauge.needle, C.gauge.origin], [BG.needle, BG.origin]];
  const A = BG.rot;
  needles.forEach(([n, o]) => {
    tl.fromTo(n, { rotation: A(0.5), svgOrigin: o }, { rotation: A(0.7), svgOrigin: o, duration: 0.7, ease: "power1.inOut" }, t2 + 0.3);
    tl.fromTo(n, { rotation: A(0.7), svgOrigin: o }, { rotation: A(0.5), svgOrigin: o, duration: 0.7, ease: "power1.inOut", immediateRender: false }, t2 + 1.1);
    // 3 release → 0, then air back on
    tl.fromTo(n, { rotation: A(0.5), svgOrigin: o }, { rotation: A(0), svgOrigin: o, duration: 1.0, ease: "power2.in", immediateRender: false }, tRel + 0.35);
    tl.fromTo(n, { rotation: A(0), svgOrigin: o }, { rotation: A(0.5), svgOrigin: o, duration: 0.6, ease: "power2.out", immediateRender: false }, t4 + 0.05);
  });
  // ---- 3: stop valve closed (lever across the pipe), needle drops to 0 → green ring on "0"
  tl.fromTo(C.lever, { rotation: 0, svgOrigin: C.O.lever }, { rotation: 90, svgOrigin: C.O.lever, duration: 0.35, ease: "power2.out" }, tRel);
  tl.fromTo(C.lever, { rotation: 90, svgOrigin: C.O.lever }, { rotation: 0, svgOrigin: C.O.lever, duration: 0.3, ease: "power2.out", immediateRender: false }, t4 - 0.25);
  tl.fromTo(ok0, { opacity: 0, scale: 1.6, svgOrigin: `${zx} ${zy}` }, { opacity: 1, scale: 1, svgOrigin: `${zx} ${zy}`, duration: 0.3, ease: "back.out(2)" }, tRel + 1.4);
  tl.to(ok0, { opacity: 0, duration: 0.3 }, t4);
  const svRing = H.el("circle", { id: "s2-v-svr", cx: 50, cy: 290, r: 46, fill: "none", stroke: PN.pipe, "stroke-width": 5, "stroke-dasharray": "10 8", opacity: 0 }, fx);
  tl.fromTo(svRing, { opacity: 0 }, { opacity: 1, duration: 0.2 }, tRel);
  tl.to(svRing, { opacity: 0, duration: 0.3 }, t4);

  // ---- 4–6: the valve cycles the cylinder (oil mist in the exhaust puffs); 5: speed knob turned → slower strokes
  const slow = tSC + 0.8;
  H.pnCycle(C, t4 + 0.6, b + D - 0.2, (t) => (t < slow ? 0.75 : 1.5), 0.45);
  const sarc = H.el("g", { id: "s2-v-sarc", opacity: 0 }, fx);
  H.el("path", { d: "M 1274 292 Q 1300 312 1326 292", fill: "none", stroke: PN.pipe, "stroke-width": 5 }, sarc);
  H.el("path", { d: "M 1326 292 L 1311 294 M 1326 292 L 1320 279", fill: "none", stroke: PN.pipe, "stroke-width": 5, "stroke-linecap": "round" }, sarc);
  tl.fromTo(sarc, { opacity: 0 }, { opacity: 1, duration: 0.2 }, tSC);
  tl.to(sarc, { opacity: 0, duration: 0.3 }, tSC + 1.3);
  tl.fromTo(C.scKnurl, { x: 0 }, { x: -21, duration: 0.8, ease: "power1.inOut" }, tSC + 0.05);
}
