// Daily ②: the operator's 4 checks on a running air line (FRL → pipe with flange + pipe support → solenoid
// valve → cylinder). Each check is shown as it is named: what "normal" looks like, then the abnormal sign.
// ① speed: a normal stroke stops the watch at the usual mark (OK); a slow stroke runs past it (NG).
// ② pipe vibration  ③ gauge in the green normal band (OK) → out of it (NG)  ④ flange nut / pipe-support nuts loose.
{
  const f = H.f;
  const m = H.$("s5-v-m"), fx = H.$("s5-v-fx");
  const P = T.points, c = T.cues;
  const Y = 330;
  // floor
  H.el("line", { x1: 20, y1: 612, x2: 1080, y2: 612, stroke: P28.ink, "stroke-width": 5 }, m);
  for (let x = 40; x <= 1080; x += 28) H.el("line", { x1: x, y1: 615, x2: x - 14, y2: 630, stroke: P28.muted, "stroke-width": 2.5 }, m);

  // ③ magnifier cone first (under the FRL)
  const cone = H.el("g", { opacity: 0 }, m);
  H.el("path", { d: "M 92 196 L 140 318 M 218 196 L 170 318", fill: "none", stroke: P28.blue, "stroke-width": 3, "stroke-dasharray": "8 6" }, cone);

  // FRL + pipes
  const F = H.p28Frl(m, { id: "s5-v-u", x: 30, y: Y, s: 0.95, water: 8, oil: 100, gv: 5.5 });
  H.p28Pipe(m, `M ${f(F.outX - 2)} ${Y} L 452 ${Y}`);
  const fMain = H.p28Flow(m, "s5-v-f1", `M ${f(F.outX)} ${Y} L 452 ${Y}`);
  // vibrating segment (own group so it can shake)
  const seg = H.el("g", { id: "s5-v-seg" }, m);
  H.p28Pipe(seg, `M 446 ${Y} L 596 ${Y}`);
  const fSeg = H.p28Flow(seg, "s5-v-f2", `M 446 ${Y} L 590 ${Y}`);
  const zig = H.el("g", { opacity: 0 }, seg);
  for (const yy of [Y - 26, Y + 26]) {
    let d = `M 470 ${yy}`;
    for (let x = 482; x <= 572; x += 12) d += ` L ${x} ${yy + ((x / 12) % 2 ? -7 : 7)}`;
    H.el("path", { d, fill: "none", stroke: P28.red, "stroke-width": 3.5, "stroke-linejoin": "round" }, zig);
  }
  // flange (side view): two plates, bolt heads left, nuts right with match marks
  const fl = H.el("g", {}, m);
  H.el("rect", { x: 335, y: 298, width: 9, height: 64, rx: 2, fill: P28.metal, stroke: P28.ink, "stroke-width": 3 }, fl);
  H.el("rect", { x: 346, y: 298, width: 9, height: 64, rx: 2, fill: P28.metal, stroke: P28.ink, "stroke-width": 3 }, fl);
  const nuts = [];
  for (const by of [309, 351]) {
    H.el("rect", { x: 322, y: by - 4, width: 46, height: 8, fill: "#b3b9c1", stroke: P28.ink, "stroke-width": 2 }, fl);
    H.el("rect", { x: 323, y: by - 9, width: 12, height: 18, rx: 2, fill: P28.dark, stroke: P28.ink, "stroke-width": 2.5 }, fl);
    H.el("line", { x1: 349, y1: by, x2: 355, y2: by, stroke: P28.yellow, "stroke-width": 4 }, fl);
    const n = H.el("g", {}, fl);
    H.el("rect", { x: 355, y: by - 9, width: 12, height: 18, rx: 2, fill: P28.dark, stroke: P28.ink, "stroke-width": 2.5 }, n);
    const mk = H.el("line", { x1: 355, y1: by, x2: 367, y2: by, stroke: P28.yellow, "stroke-width": 4 }, n);
    nuts.push({ n, mk });
  }
  // pipe support: U-bolt over the pipe, bracket, nuts below, post to the floor, base plate with anchors
  const sp = H.el("g", {}, m);
  H.el("rect", { x: 435, y: 352, width: 11, height: 250, fill: P28.dark, stroke: P28.ink, "stroke-width": 3 }, sp);
  H.el("rect", { x: 405, y: 600, width: 70, height: 12, rx: 2, fill: P28.metal, stroke: P28.ink, "stroke-width": 3 }, sp);
  for (const x of [414, 466]) H.el("path", { d: H.hexD(x, 594, 7), fill: P28.dark, stroke: P28.ink, "stroke-width": 2 }, sp);
  H.el("path", { d: `M 428 360 L 428 ${Y} A 12 12 0 0 1 452 ${Y} L 452 360`, fill: "none", stroke: P28.ink, "stroke-width": 4.5 }, sp);
  H.el("rect", { x: 416, y: 343, width: 48, height: 9, rx: 2, fill: P28.metal, stroke: P28.ink, "stroke-width": 3 }, sp);
  const uNuts = [422, 446].map((x) => H.el("rect", { x, y: 352, width: 12, height: 10, rx: 2, fill: "#5d646d", stroke: P28.ink, "stroke-width": 2 }, sp));

  // valve + cylinder + tubes
  const C = H.p28Cyl(m, { id: "s5-v-cyl", x: 590, y: 110, L: 320, h: 70, rod: 80, ports: "bottom" });
  const pA = `M 630 300 L 630 252 L ${C.portA[0]} 252 L ${C.portA[0]} ${C.portA[1]}`;
  const pB = `M 690 300 L 690 232 L ${C.portB[0]} 232 L ${C.portB[0]} ${C.portB[1]}`;
  H.p28Pipe(m, pA, { w: 12 }); H.p28Pipe(m, pB, { w: 12 });
  const fA = H.p28Flow(m, "s5-v-fa", pA, { w: 4 }), fB = H.p28Flow(m, "s5-v-fb", pB, { w: 4 });
  H.p28Valve(m, { id: "s5-v-valve", x: 585, y: 300, w: 150, h: 60, coil: 50 });

  // fixed labels
  H.p28Label(m, F.at(132, 0)[0], 590, "ชุด FRL", { size: 26, anchor: "middle", fill: P28.muted });
  H.p28Label(m, 685, 410, "Solenoid valve", { size: 24, anchor: "middle", fill: P28.muted });
  H.p28Label(m, 750, 92, "กระบอกสูบลม", { size: 26, anchor: "middle", fill: P28.muted });

  // ① stopwatch with the usual-time mark
  const wx = 990, wy = 342, wr = 54;
  const W = H.stopwatch(m, wx, wy, wr, { id: "s5-v-w", color: P28.blue });
  const NORM = 0.55, SLOW = 0.9;
  const ang = (fr) => (-90 + 360 * fr) * Math.PI / 180;
  H.el("line", { x1: f(wx + Math.cos(ang(NORM)) * wr * 0.6), y1: f(wy + Math.sin(ang(NORM)) * wr * 0.6), x2: f(wx + Math.cos(ang(NORM)) * wr * 1.0), y2: f(wy + Math.sin(ang(NORM)) * wr * 1.0), stroke: P28.green, "stroke-width": 7 }, m);
  const over = H.el("path", { d: H.arcD(wx, wy, wr * 0.78, -90 + 360 * NORM, -90 + 360 * SLOW), fill: "none", stroke: P28.red, "stroke-width": f(wr * 0.22), "stroke-linecap": "butt" }, m);
  m.appendChild(H.$("s5-v-w-hand")); // hand above the red arc
  const okW = H.p28Tick(m, 1054, 290, 20); okW.setAttribute("opacity", 0);

  // ③ inset gauge (magnified regulator gauge)
  const ins = H.el("g", { opacity: 0 }, m);
  H.el("circle", { cx: 155, cy: 128, r: 92, fill: P28.paper, stroke: P28.blue, "stroke-width": 6 }, ins);
  const G = H.gauge(ins, 155, 128, 76, { id: "s5-v-ig", min: 0, max: 10, ok: [4, 7], value: 0, ticks: 5, minor: 1, labels: false });
  const okLbl = H.p28Label(m, 258, 96, "เขียว = ปกติ", { size: 24, fill: P28.green });
  okLbl.setAttribute("opacity", 0);
  const okG = H.p28Tick(m, 238, 56, 20); okG.setAttribute("opacity", 0);

  // ④ inset: a flange bolt seen from the end, match mark across head and flange
  const cone4 = H.el("path", { d: "M 404 212 L 338 300 M 488 222 L 364 300", fill: "none", stroke: P28.blue, "stroke-width": 3, "stroke-dasharray": "8 6", opacity: 0 }, m);
  const ins4 = H.el("g", { opacity: 0 }, m);
  H.el("circle", { cx: 452, cy: 146, r: 78, fill: P28.paper, stroke: P28.blue, "stroke-width": 6 }, ins4);
  const BT = H.bolt(ins4, 440, 140, 30, { id: "s5-v-bolt" });
  const loose4 = H.p28Label(ins4, 452, 212, "หลวม", { size: 24, anchor: "middle", fill: P28.red });
  loose4.setAttribute("opacity", 0);

  // badges, NG marks and labels (fx layer, on top)
  const badge = (x, y, n) => { const el = H.p28Badge(fx, x, y, n, { r: 22 }); el.setAttribute("opacity", 0); return el; };
  const B1 = badge(912, 268, 1), B2 = badge(525, 270, 2), B3 = badge(58, 50, 3), B4 = badge(536, 80, 4);
  const ring = (cx, cy, rx, ry) => H.el("ellipse", { cx, cy, rx, ry, fill: "none", stroke: P28.red, "stroke-width": 5.5, opacity: 0 }, fx);
  const R1 = ring(wx, wy - 6, 74, 80), R2 = ring(525, Y, 68, 34), R3 = ring(155, 128, 102, 102), R4a = ring(452, 146, 88, 88), R4b = ring(440, 357, 34, 22);
  const ng = (x, y, s, anchor = "middle") => { const t = H.p28Label(fx, x, y, s, { size: 26, anchor, fill: P28.red }); t.setAttribute("opacity", 0); return t; };
  const N1 = ng(wx, 452, "ช้ากว่าทุกครั้ง"), N2 = ng(525, 400, "สั่นผิดปกติ"), N3 = ng(258, 150, "นอกช่วง", "start"), N4 = ng(456, 522, "หลวม", "start");
  const l4 = H.el("g", { opacity: 0 }, fx);
  H.p28Label(l4, 345, 414, "หน้าแปลน", { size: 24, anchor: "middle" });
  H.p28Label(l4, 456, 486, "ที่ยึดท่อ", { size: 24 });

  // ---------------- motion
  H.p28Run(fMain, b + 0.3, D - 0.4, { keep: true });
  H.p28Run(fSeg, b + 0.3, D - 0.4, { keep: true });
  const STROKE = 48;
  // ① normal stroke → OK, then a slow stroke → NG
  const t1 = b + P[0];
  H.p28Pop(B1, t1 + 0.05, 912, 268);
  H.p28Run(fA, t1 + 0.25, 1.0);
  tl.fromTo(C.rod, { x: 0 }, { x: STROKE, duration: 0.9, ease: "power1.inOut" }, t1 + 0.3);
  tl.fromTo(W.ring, { strokeDashoffset: W.offset(0) }, { strokeDashoffset: W.offset(NORM), duration: 0.9, ease: "none" }, t1 + 0.3);
  tl.fromTo(W.hand, { rotation: 0, svgOrigin: W.origin }, { rotation: W.rot(NORM), svgOrigin: W.origin, duration: 0.9, ease: "none" }, t1 + 0.3);
  H.p28Pop(okW, t1 + 1.2, 1054, 290);
  H.p28Run(fB, t1 + 1.35, 0.6);
  tl.to(C.rod, { x: 0, duration: 0.4, ease: "power1.inOut" }, t1 + 1.4);
  tl.to(W.ring, { strokeDashoffset: W.offset(0), duration: 0.3 }, t1 + 1.4);
  tl.to(W.hand, { rotation: 0, svgOrigin: W.origin, duration: 0.3 }, t1 + 1.4);
  tl.to(okW, { opacity: 0, duration: 0.25 }, t1 + 1.6);
  const ts = t1 + 1.9, TS = 1.5;
  H.p28Run(fA, ts - 0.05, TS + 0.1);
  tl.to(C.rod, { x: STROKE, duration: TS, ease: "none" }, ts);
  tl.to(W.ring, { strokeDashoffset: W.offset(SLOW), duration: TS, ease: "none" }, ts);
  tl.to(W.hand, { rotation: W.rot(SLOW), svgOrigin: W.origin, duration: TS, ease: "none" }, ts);
  const Lo = over.getTotalLength(), tOver = ts + TS * (NORM / SLOW);
  tl.fromTo(over, { strokeDasharray: Lo, strokeDashoffset: Lo }, { strokeDashoffset: 0, duration: ts + TS - tOver, ease: "none" }, tOver);
  H.p28Pop(R1, ts + TS + 0.05, wx, wy - 6, 1.3);
  tl.fromTo(N1, { opacity: 0 }, { opacity: 1, duration: 0.3 }, ts + TS + 0.1);
  H.p28Run(fB, ts + TS + 0.6, 0.7);
  tl.to(C.rod, { x: 0, duration: 0.5, ease: "power1.inOut" }, ts + TS + 0.65);

  // ② the pipe vibrates
  const t2 = b + P[1];
  H.p28Pop(B2, t2 + 0.05, 525, 270);
  tl.fromTo(zig, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t2 + 0.3);
  tl.fromTo(seg, { y: 0 }, { y: 4, duration: 0.06, ease: "sine.inOut", yoyo: true, repeat: 23 }, t2 + 0.3);
  tl.fromTo(seg, { y: 0 }, { y: 4, duration: 0.06, ease: "sine.inOut", yoyo: true, repeat: 15, immediateRender: false }, t2 + 2.0);
  tl.to(zig, { opacity: 0, duration: 0.3 }, t2 + 3.1);
  H.p28Pop(R2, t2 + 1.7, 525, Y, 1.3);
  tl.fromTo(N2, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t2 + 1.75);

  // ③ gauge: needle into the green band (OK), then below it (NG)
  const t3 = b + P[2];
  H.p28Pop(B3, t3 + 0.05, 58, 50);
  tl.fromTo(ins, { opacity: 0, scale: 0.4, svgOrigin: "155 300" }, { opacity: 1, scale: 1, svgOrigin: "155 300", duration: 0.4, ease: "back.out(1.6)" }, t3 + 0.05);
  tl.fromTo(cone, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 0.1);
  tl.fromTo(G.needle, { rotation: G.rot(0), svgOrigin: G.origin }, { rotation: G.rot(5.5), svgOrigin: G.origin, duration: 0.6, ease: "back.out(1.4)" }, t3 + 0.35);
  H.p28Pop(okG, t3 + 0.95, 238, 56);
  tl.fromTo(okLbl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 0.95);
  tl.to(okG, { opacity: 0, duration: 0.2 }, t3 + 1.3);
  tl.to(G.needle, { rotation: G.rot(2.2), svgOrigin: G.origin, duration: 0.35, ease: "power2.in" }, t3 + 1.3);
  tl.to(F.gauge.needle, { rotation: F.gauge.rot(2.2), svgOrigin: F.gauge.origin, duration: 0.35, ease: "power2.in" }, t3 + 1.3);
  H.p28Pop(R3, t3 + 1.65, 155, 128, 1.2);
  tl.fromTo(N3, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 1.7);

  // ④ flange nuts back off (match marks split), pipe-support nuts drop
  const t4 = b + P[3];
  H.p28Pop(B4, t4 + 0.05, 536, 80);
  tl.fromTo(ins4, { opacity: 0, scale: 0.4, svgOrigin: "352 300" }, { opacity: 1, scale: 1, svgOrigin: "352 300", duration: 0.4, ease: "back.out(1.6)" }, t4 + 0.05);
  tl.fromTo(cone4, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t4 + 0.1);
  tl.fromTo(BT.head, { rotation: 0, svgOrigin: BT.origin }, { rotation: -38, svgOrigin: BT.origin, duration: 0.5, ease: "power2.inOut" }, t4 + 0.45);
  tl.fromTo(loose4, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t4 + 0.95);
  tl.fromTo(l4, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t4 + 0.1);
  nuts.forEach(({ n, mk }, k) => {
    tl.fromTo(n, { x: 0 }, { x: 7, duration: 0.4, ease: "power2.out" }, t4 + 0.4 + k * 0.1);
    tl.fromTo(mk, { y: 0 }, { y: 6, duration: 0.4, ease: "power2.out" }, t4 + 0.4 + k * 0.1);
  });
  H.p28Pop(R4a, t4 + 0.9, 452, 146, 1.2);
  uNuts.forEach((u) => tl.fromTo(u, { y: 0 }, { y: 9, duration: 0.35, ease: "power2.in" }, t4 + 1.2));
  H.p28Pop(R4b, t4 + 1.6, 440, 357, 1.3);
  tl.fromTo(N4, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t4 + 1.65);

  // callout: any of these = NG → inform maintenance; the four red marks pulse once more
  const t5 = b + T.callout;
  [[R1, wx, wy - 6], [R2, 525, Y], [R3, 155, 128], [R4a, 452, 146], [R4b, 440, 357]].forEach(([r, x, y]) =>
    tl.fromTo(r, { scale: 1, svgOrigin: `${x} ${y}` }, { scale: 1.1, svgOrigin: `${x} ${y}`, duration: 0.25, yoyo: true, repeat: 3, immediateRender: false }, t5 + 0.2));
}
