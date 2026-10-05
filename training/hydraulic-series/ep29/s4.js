// Air-leak points (OPL 5'-C-2 Table 2, p.45) on the pressurised circuit: piping marks pop with point 1,
// accessory marks with point 2. With the callout ("no trouble → extend gradually") an inspection timeline
// appears at 3-month spacing and its marks then spread out step by step (no new interval values are given).
{
  const S = 0.64, OX = 30, OY = 8;
  const M = (x, y) => [OX + S * x, OY + S * y];
  const C = H.pnCircuit("s4-v-u", "s4-v-c", { transform: `translate(${OX} ${OY}) scale(${S})` });
  const fx = H.$("s4-v-fx");
  H.pnFlowOn(C.flows.main, b + 0.3, b + D - 0.1);
  const tP1 = b + T.points[0], tP2 = b + T.points[1], tCo = b + T.callout;

  // [frame x, y, hiss angle, label, label x, y, anchor]
  const PIPE = [
    [50, 130, 0, "หน้าแปลน (Flange)", 104, 99, "start"],
    [50, 205, 0, "รอยเชื่อม (Weld)", 104, 147, "start"],
    [50, 290, 0, "Stop valve", 104, 202, "start"],
    [89, 410, 150, "ข้อต่อเกลียว", 112, 243, "start"],
    [1100, 300, -90, "สายลม (Hose)", 734, 160, "middle"],
  ];
  const UNIT = [
    [170, 604, 180, "Case / Drain cock", 52, 444, "start"],
    [384, 352, -60, "รูระบาย (Relief hole)", 296, 164, "start"],
    [513, 372, -120, "ช่องเติมน้ำมัน", 420, 212, "start"],
    [1070, 492, 45, "Exhaust port", 742, 372, "start"],
    [1500, 185, -60, "กระบอกสูบ (Cylinder)", 1078, 74, "end"],
  ];
  const mark = (list, k, t0, gap) => list.forEach(([x, y, ang, lab, lx, ly, anc], i) => {
    const [X, Y] = M(x, y), t = t0 + gap * i;
    const h = H.pnHiss(fx, `s4-v-h${k}${i}`, X, Y, ang, 0.85);
    const tx = H.el("g", { id: `s4-v-l${k}${i}`, opacity: 0 }, fx);
    const w = H.pnTW(lab, 22) + 16, x0 = anc === "end" ? lx - w + 8 : anc === "middle" ? lx - w / 2 : lx - 8;
    H.el("rect", { x: H.f(x0), y: ly - 24, width: H.f(w), height: 33, rx: 8, fill: PN.paper, stroke: PN.flow, "stroke-width": 2 }, tx);
    H.text(tx, lx, ly, lab, { size: 22, anchor: anc, fill: PN.ink, weight: 700 });
    tl.fromTo(h, { opacity: 0, scale: 0.3, svgOrigin: `${X} ${Y}` }, { opacity: 1, scale: 1, svgOrigin: `${X} ${Y}`, duration: 0.3, ease: "back.out(2)" }, t);
    tl.fromTo(tx, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t + 0.1);
    tl.fromTo(h, { scale: 1, svgOrigin: `${X} ${Y}` }, { scale: 1.15, svgOrigin: `${X} ${Y}`, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, t + 0.4);
  });
  mark(PIPE, "p", tP1 - 0.1, 0.2);
  mark(UNIT, "u", tP2 + 0.05, 0.22);

  // inspection-interval timeline: 3-month spacing → marks spread out gradually
  const tg = H.el("g", { id: "s4-v-iv", opacity: 0 }, fx);
  const Y = 538, X0 = 90;
  H.el("line", { x1: X0 - 20, y1: Y, x2: 1060, y2: Y, stroke: PN.muted, "stroke-width": 5, "stroke-linecap": "round" }, tg);
  H.text(tg, X0 - 20, Y - 52, "รอบตรวจ (Interval)", { size: 24, fill: PN.muted, weight: 700 });
  const even = Array.from({ length: 8 }, (_, i) => X0 + 120 * i);
  const spread = [X0, X0 + 120, X0 + 280, X0 + 480, X0 + 740, 1040, 1040, 1040];
  const ticks = even.map((x, i) => {
    const g = H.el("g", { id: `s4-v-k${i}` }, tg);
    H.el("line", { x1: x, y1: Y - 16, x2: x, y2: Y + 16, stroke: PN.ink, "stroke-width": 4 }, g);
    H.el("circle", { cx: x, cy: Y - 32, r: 11, fill: PN.pale, stroke: PN.pipe, "stroke-width": 4 }, g);
    H.el("line", { x1: x + 8, y1: Y - 24, x2: x + 16, y2: Y - 16, stroke: PN.ink, "stroke-width": 4, "stroke-linecap": "round" }, g);
    return g;
  });
  const lab3 = H.text(tg, X0 + 60, Y + 46, "3 เดือน", { size: 24, anchor: "middle", fill: PN.pipe, id: "s4-v-l3m" });
  const arr = H.el("g", { id: "s4-v-arr", opacity: 0 }, tg);
  H.el("path", { d: H.arrowD(X0 + 300, Y + 40, X0 + 700, Y + 40, 16), fill: "none", stroke: PN.green, "stroke-width": 5 }, arr);
  H.text(arr, X0 + 500, Y + 76, "ไม่พบปัญหา → ค่อยๆ ห่างขึ้น", { size: 24, anchor: "middle", fill: PN.green });
  tl.fromTo(tg, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tCo);
  ticks.forEach((g, i) => {
    tl.fromTo(g, { x: 0, opacity: 1 }, { x: spread[i] - even[i], opacity: i < 5 ? 1 : 0, duration: 1.4, ease: "power2.inOut" }, tCo + 0.9);
  });
  tl.fromTo(arr, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, tCo + 1.6);
}
