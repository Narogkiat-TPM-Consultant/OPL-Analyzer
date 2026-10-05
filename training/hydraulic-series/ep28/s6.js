// Weekly: overall inspection list (water · air · steam) → the line stops (signal tower green → red) → check the
// rows marked "dangerous while running" → refill the lubricator (calendar: once a week; heavy use: every 3 days)
// → line runs again, the oil level drops fast and oil drips from a fitting → find the leak.
{
  const f = H.f, c = T.cues, P = T.points;
  const L = H.$("s6-v-l"), Rt = H.$("s6-v-r"), fx = H.$("s6-v-fx");

  // ---------------- signal tower
  const lamp = (y, on, off) => {
    const a = H.el("rect", { x: 44, y, width: 44, height: 32, rx: 6, fill: off, stroke: P28.ink, "stroke-width": 3.5 }, L);
    const b2 = H.el("rect", { x: 44, y, width: 44, height: 32, rx: 6, fill: on, stroke: P28.ink, "stroke-width": 3.5, opacity: 0 }, L);
    return b2;
  };
  H.el("rect", { x: 62, y: 158, width: 8, height: 142, fill: P28.dark, stroke: P28.ink, "stroke-width": 2.5 }, L);
  H.el("rect", { x: 40, y: 298, width: 52, height: 14, rx: 3, fill: P28.dark, stroke: P28.ink, "stroke-width": 3 }, L);
  const red = lamp(60, P28.red, "#e8c2c6"), amb = lamp(93, P28.yellow, "#efe0b4"), grn = lamp(126, P28.green, "#c3dccd");
  const stopLbl = H.el("g", { opacity: 0 }, L);
  H.p28Label(stopLbl, 66, 352, "ไลน์", { size: 28, anchor: "middle" });
  H.p28Label(stopLbl, 66, 386, "หยุด", { size: 28, anchor: "middle" });

  // ---------------- overall inspection list (clipboard)
  const cb = H.el("g", { opacity: 0 }, L);
  H.el("rect", { x: 132, y: 52, width: 376, height: 568, rx: 14, fill: "#d9c7a5", stroke: P28.ink, "stroke-width": 4 }, cb);
  H.el("rect", { x: 152, y: 84, width: 336, height: 518, rx: 4, fill: P28.paper, stroke: P28.ink, "stroke-width": 3 }, cb);
  H.el("rect", { x: 262, y: 38, width: 116, height: 36, rx: 8, fill: "#5d646d", stroke: P28.ink, "stroke-width": 3 }, cb);
  H.text(cb, 320, 132, "รายการตรวจรวม", { size: 32, anchor: "middle", fill: P28.blue });
  // categories: water · air · steam
  const cats = [[196, "น้ำ"], [306, "ลม"], [410, "ไอน้ำ"]].map(([x, s], k) => {
    const g = H.el("g", { opacity: 0 }, cb);
    if (k === 0) H.el("path", { d: H.p28DropD(x - 26, 158, 10), fill: P28.water, stroke: P28.ink, "stroke-width": 2 }, g);
    if (k === 1) for (const dy of [0, 12]) H.el("path", { d: `M ${x - 40} ${168 + dy} Q ${x - 28} ${160 + dy} ${x - 16} ${168 + dy} T ${x + 8 - 16} ${168 + dy}`, fill: "none", stroke: P28.flow, "stroke-width": 4 }, g);
    if (k === 2) for (const dx of [0, 10]) H.el("path", { d: `M ${x - 38 + dx} 190 Q ${x - 46 + dx} 180 ${x - 38 + dx} 172 Q ${x - 30 + dx} 164 ${x - 38 + dx} 156`, fill: "none", stroke: P28.muted, "stroke-width": 3.5 }, g);
    H.text(g, x - (k === 1 ? 6 : 8), 186, s, { size: 26 });
    return g;
  });
  H.el("line", { x1: 168, y1: 208, x2: 472, y2: 208, stroke: P28.grid, "stroke-width": 3 }, cb);
  const rows = [
    { y: 252, warn: true }, { y: 318, warn: false }, { y: 384, warn: true },
    { y: 450, oil: true }, { y: 516, warn: true },
  ];
  const hl = [], chk = [];
  rows.forEach((r) => {
    const h = H.el("rect", { x: 160, y: r.y - 28, width: 320, height: 50, rx: 8, fill: "#fbe9b7", opacity: 0 }, cb);
    hl.push(h);
    H.el("rect", { x: 170, y: r.y - 16, width: 28, height: 28, rx: 4, fill: "#ffffff", stroke: P28.ink, "stroke-width": 3 }, cb);
    const k = H.el("path", { d: `M 174 ${r.y - 2} L 183 ${r.y + 8} L 200 ${r.y - 18}`, fill: "none", stroke: P28.green, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, cb);
    chk.push(k);
    if (r.warn) H.p28Warn(cb, 228, r.y - 2, 14);
    if (r.oil) {
      H.el("path", { d: H.p28DropD(228, r.y - 18, 10), fill: P28.oil, stroke: P28.oilDk, "stroke-width": 2 }, cb);
      H.text(cb, 250, r.y + 8, "เติมน้ำมัน Lubricator", { size: 24 });
    } else H.el("rect", { x: r.warn ? 252 : 214, y: r.y - 6, width: r.warn ? 210 : 248, height: 12, rx: 6, fill: "#d6d0c4" }, cb);
  });
  H.p28Warn(cb, 186, 574, 13);
  H.text(cb, 206, 582, "= อันตรายถ้าตรวจขณะเดิน", { size: 23 });

  // ---------------- refill calendar (right, top)
  const cal = H.el("g", { opacity: 0 }, Rt);
  const x0 = 680, cw = 56, days = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
  H.el("rect", { x: 548, y: 22, width: 526, height: 174, rx: 12, fill: P28.paper, stroke: P28.ink, "stroke-width": 3.5 }, cal);
  H.el("path", { d: "M 548 62 L 548 34 Q 548 22 560 22 L 1062 22 Q 1074 22 1074 34 L 1074 62 Z", fill: P28.blue, stroke: P28.ink, "stroke-width": 3.5 }, cal);
  days.forEach((d, i) => H.text(cal, x0 + cw * i + cw / 2, 51, d, { size: 22, anchor: "middle", fill: "#ffffff" }));
  H.text(cal, 614, 51, "เติมน้ำมัน", { size: 22, anchor: "middle", fill: "#ffffff" });
  H.el("line", { x1: 548, y1: 129, x2: 1074, y2: 129, stroke: P28.grid, "stroke-width": 3 }, cal);
  for (let i = 0; i <= 7; i++) H.el("line", { x1: x0 + i * cw, y1: 64, x2: x0 + i * cw, y2: 194, stroke: P28.grid, "stroke-width": 2.5 }, cal);
  H.text(cal, 614, 106, "ปกติ", { size: 26, anchor: "middle" });
  const heavyLbl = H.text(cal, 614, 172, "เดินหนัก", { size: 26, anchor: "middle" });
  const dropAt = (i, y) => { const d = H.el("path", { d: H.p28DropD(x0 + cw * i + cw / 2, y - 16, 11), fill: P28.oil, stroke: P28.oilDk, "stroke-width": 2.5, opacity: 0 }, cal); return d; };
  const wDrop = dropAt(0, 96), hDrops = [0, 3, 6].map((i) => dropAt(i, 162));

  // ---------------- lubricator (big) + pipes + leaking fitting
  const Y = 312;
  H.p28Pipe(Rt, `M 690 ${Y} L 762 ${Y}`, { w: 26 });
  H.p28Pipe(Rt, `M 878 ${Y} L 1086 ${Y}`, { w: 26 });
  const fIn = H.p28Flow(Rt, "s6-v-fi", `M 690 ${Y} L 756 ${Y}`, { w: 7, dash: "14 16", period: 30 });
  const fOut = H.p28Flow(Rt, "s6-v-fo", `M 884 ${Y} L 1086 ${Y}`, { w: 7, dash: "14 16", period: 30 });
  // union fitting on the outlet
  H.el("rect", { x: 958, y: Y - 22, width: 34, height: 44, rx: 4, fill: P28.metal, stroke: P28.ink, "stroke-width": 3.5 }, Rt);
  for (const x of [969, 981]) H.el("line", { x1: x, y1: Y - 22, x2: x, y2: Y + 22, stroke: P28.ink, "stroke-width": 2, opacity: 0.5 }, Rt);
  const lg = H.el("g", { transform: `translate(465 ${Y}) scale(1.6)` }, Rt);
  const Lu = H.p28LUnit(lg, "s6-v-lu", { oil: 50 });
  H.p28Label(Rt, 742, 470, "Lubricator", { size: 28, anchor: "end" });
  // oil can (pours into the fill cap)
  const [capX, capY] = [465 + Lu.cap[0] * 1.6 + 13, Y + Lu.cap[1] * 1.6];
  const can = H.el("g", { opacity: 0 }, fx);
  H.el("path", { d: `M ${f(capX - 120)} ${f(capY - 50)} L ${f(capX - 64)} ${f(capY - 50)} L ${f(capX - 58)} ${f(capY + 6)} L ${f(capX - 126)} ${f(capY + 6)} Z`, fill: "#c0392b", stroke: P28.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, can);
  H.el("path", { d: `M ${f(capX - 62)} ${f(capY - 40)} L ${f(capX - 6)} ${f(capY - 64)} L ${f(capX - 2)} ${f(capY - 56)} L ${f(capX - 60)} ${f(capY - 26)} Z`, fill: P28.dark, stroke: P28.ink, "stroke-width": 3 }, can);
  H.el("path", { d: `M ${f(capX - 112)} ${f(capY - 50)} Q ${f(capX - 92)} ${f(capY - 84)} ${f(capX - 72)} ${f(capY - 50)}`, fill: "none", stroke: P28.ink, "stroke-width": 5 }, can);
  const pour = H.el("path", { d: `M ${f(capX - 4)} ${f(capY - 58)} Q ${f(capX + 2)} ${f(capY - 30)} ${f(capX)} ${f(capY + 4)}`, fill: "none", stroke: P28.oil, "stroke-width": 6, "stroke-linecap": "butt", opacity: 0 }, fx);
  // fast drop arrow + leak
  const fast = H.el("g", { opacity: 0 }, fx);
  H.el("path", { d: H.arrowD(712, 372, 712, 430, 16), fill: "none", stroke: P28.red, "stroke-width": 7 }, fast);
  H.p28Label(fast, 742, 520, "ลดเร็ว", { size: 28, anchor: "end", fill: P28.red });
  const leaks = [0, 1, 2, 3].map(() => H.el("path", { d: H.p28DropD(975, Y + 22, 7), fill: P28.oil, stroke: P28.oilDk, "stroke-width": 2, opacity: 0 }, fx));
  const wet = H.el("path", { d: `M 958 ${Y + 18} Q 975 ${Y + 34} 992 ${Y + 18} Z`, fill: P28.oil, stroke: P28.oilDk, "stroke-width": 2, opacity: 0 }, fx);
  const ring = H.el("circle", { cx: 975, cy: Y + 4, r: 44, fill: "none", stroke: P28.red, "stroke-width": 6, opacity: 0 }, fx);
  const mag = H.el("g", { opacity: 0 }, fx);
  H.el("line", { x1: 1010, y1: 446, x2: 1048, y2: 490, stroke: P28.ink, "stroke-width": 11, "stroke-linecap": "round" }, mag);
  H.el("circle", { cx: 990, cy: 422, r: 30, fill: "rgba(223,241,251,0.6)", stroke: P28.ink, "stroke-width": 6 }, mag);
  const findLbl = H.p28Label(fx, 1000, 545, "หาจุดรั่ว", { size: 30, anchor: "middle" });
  findLbl.setAttribute("opacity", 0);

  // ---------------- timing
  const tStop = b + P[0] + 1.55;      // "เลือกช่วงไลน์หยุด"
  tl.set(grn, { opacity: 1 }, b);
  H.p28Run(fIn, b + 0.2, tStop - b - 0.1);
  H.p28Run(fOut, b + 0.2, tStop - b - 0.1);
  tl.fromTo(Lu.drip, { y: 0, opacity: 1 }, { y: 7, opacity: 0, duration: 0.55, ease: "power1.in", repeat: 1, repeatDelay: 0.3 }, b + 0.4);
  // cue 1: list (water · air · steam), then the line stops
  tl.fromTo(cb, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, b + c[0] + 0.05);
  cats.forEach((g, k) => tl.fromTo(g, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }, b + c[0] + 0.5 + k * 0.2));
  tl.to(grn, { opacity: 0, duration: 0.15 }, tStop);
  tl.fromTo(red, { opacity: 0 }, { opacity: 1, duration: 0.15 }, tStop + 0.1);
  H.p28Pop(stopLbl, tStop + 0.15, 66, 368, 1.4);
  // dangerous-while-running rows: highlight + tick during the stop
  const tD = b + P[1];
  [0, 2, 4].forEach((i, k) => {
    tl.fromTo(hl[i], { opacity: 0 }, { opacity: 1, duration: 0.25 }, tD + 0.05 + k * 0.08);
    tl.fromTo(chk[i], { opacity: 0, scale: 1.6, svgOrigin: `186 ${rows[i].y}` }, { opacity: 1, scale: 1, svgOrigin: `186 ${rows[i].y}`, duration: 0.25, ease: "back.out(2)" }, tD + 0.45 + k * 0.38);
  });
  // cue 2: refill — calendar, can pours, level rises; once a week, heavy use every 3 days
  const tR = b + c[1];
  tl.fromTo(cal, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.35 }, tR + 0.05);
  tl.fromTo(can, { opacity: 0, x: -30, y: -10 }, { opacity: 1, x: 0, y: 0, duration: 0.35 }, tR + 0.2);
  tl.fromTo(pour, { opacity: 0 }, { opacity: 1, duration: 0.15 }, tR + 0.55);
  tl.fromTo(Lu.oil, { attr: { y: 138, height: 54 } }, { attr: { y: 52, height: 140 }, duration: 1.3, ease: "power1.inOut" }, tR + 0.6);
  tl.to(pour, { opacity: 0, duration: 0.15 }, tR + 1.95);
  tl.to(can, { opacity: 0, x: -30, duration: 0.3 }, tR + 2.05);
  tl.fromTo(chk[3], { opacity: 0, scale: 1.6, svgOrigin: `186 ${rows[3].y}` }, { opacity: 1, scale: 1, svgOrigin: `186 ${rows[3].y}`, duration: 0.25, ease: "back.out(2)" }, tR + 2.0);
  H.p28Pop(wDrop, tR + 1.3, x0 + cw / 2, 96, 1.8);
  tl.fromTo(heavyLbl, { attr: { fill: P28.ink } }, { attr: { fill: P28.blue }, duration: 0.3 }, tR + 2.05);
  hDrops.forEach((d, k) => H.p28Pop(d, tR + 2.75 + k * 0.22, x0 + cw * [0, 3, 6][k] + cw / 2, 162, 1.8));
  // cue 3: line runs again — level drops fast, oil drips from the fitting → find the leak
  const tL = b + c[2];
  tl.to(red, { opacity: 0, duration: 0.15 }, tL);
  tl.to(grn, { opacity: 1, duration: 0.15 }, tL + 0.05);
  tl.to(stopLbl, { opacity: 0, duration: 0.2 }, tL);
  H.p28Run(fIn, tL + 0.1, D - c[2] - 0.2, { keep: true });
  H.p28Run(fOut, tL + 0.1, D - c[2] - 0.2, { keep: true });
  tl.to(Lu.oil, { attr: { y: 150, height: 42 }, duration: 1.6, ease: "power1.in" }, tL + 0.3);
  tl.fromTo(fast, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tL + 0.4);
  tl.fromTo(wet, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tL + 0.4);
  leaks.forEach((d, k) => tl.fromTo(d, { y: 0, opacity: 1 }, { y: 150, opacity: 0, duration: 0.8, ease: "power1.in", repeat: 2, repeatDelay: 0.6 }, tL + 0.5 + k * 0.35));
  H.p28Pop(ring, tL + 1.3, 975, Y + 4, 1.4);
  tl.fromTo(mag, { opacity: 0, x: 70, y: 60 }, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power2.out" }, tL + 1.6);
  tl.fromTo(findLbl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tL + 2.0);
}
