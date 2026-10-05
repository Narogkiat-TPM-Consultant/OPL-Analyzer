// Title: a week calendar (daily row ticks every day, weekly row one mark) over a running air line:
// FRL → solenoid valve → cylinder. Air flows, the gauge settles in its green band, the cylinder strokes.
{
  const f = H.f;
  // ---------------- calendar strip
  const cal = H.$("s1-v-cal");
  H.el("rect", { x: 20, y: 18, width: 740, height: 236, rx: 18, fill: P28.paper, stroke: P28.ink, "stroke-width": 4 }, cal);
  H.el("path", { d: "M 20 74 L 20 36 Q 20 18 38 18 L 742 18 Q 760 18 760 36 L 760 74 Z", fill: P28.blue, stroke: P28.ink, "stroke-width": 4 }, cal);
  const x0 = 186, cw = 82, days = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
  H.el("line", { x1: 20, y1: 162, x2: 760, y2: 162, stroke: P28.grid, "stroke-width": 3 }, cal);
  for (let i = 0; i <= 7; i++) H.el("line", { x1: x0 + i * cw, y1: 76, x2: x0 + i * cw, y2: 252, stroke: P28.grid, "stroke-width": 3 }, cal);
  days.forEach((d, i) => H.text(cal, x0 + cw * i + cw / 2, 56, d, { size: 26, anchor: "middle", fill: "#ffffff" }));
  H.text(cal, 103, 56, "รอบตรวจ", { size: 25, anchor: "middle", fill: "#ffffff" });
  H.text(cal, 103, 128, "รายวัน", { size: 30, anchor: "middle" });
  H.text(cal, 103, 216, "รายสัปดาห์", { size: 27, anchor: "middle" });
  const ticks = days.map((_, i) => {
    const t = H.p28Tick(cal, x0 + cw * i + cw / 2, 119, 23);
    t.setAttribute("opacity", 0);
    return t;
  });
  const wk = H.el("g", { opacity: 0 }, cal);
  const wx = x0 + cw * 5 + cw / 2;
  H.el("rect", { x: x0 + cw * 5 + 5, y: 168, width: cw - 10, height: 78, rx: 12, fill: "#e8f0fb", stroke: P28.blue, "stroke-width": 3 }, wk);
  H.el("path", { d: H.p28DropD(wx - 13, 180, 11), fill: P28.oil, stroke: P28.oilDk, "stroke-width": 2.5 }, wk);
  H.p28Tick(wk, wx + 13, 222, 17);

  // ---------------- air line
  const ln = H.$("s1-v-line");
  const Y = 352;
  const F = H.p28Frl(ln, { id: "s1-v-frl", x: 44, y: Y, s: 0.95, water: 0, oil: 105, gv: 0 });
  H.p28Pipe(ln, `M 12 ${Y} L ${f(F.inX + 2)} ${Y}`);
  H.el("path", { d: H.arrowD(14, Y - 26, 40, Y - 26, 12), fill: "none", stroke: P28.flow, "stroke-width": 4 }, ln);
  const V = H.p28Valve(ln, { id: "s1-v-valve", x: 336, y: Y - 25, w: 116, h: 50, coil: 40 });
  // valve ports on the underside for this layout (A, B go down to the cylinder)
  const C = H.p28Cyl(ln, { id: "s1-v-cyl", x: 352, y: 474, L: 270, h: 56, rod: 46, ports: "top" });
  const ax = C.portA[0], bx = C.portB[0];
  const pA = `M ${ax} ${Y + 25} L ${ax} ${C.portA[1]}`;
  const pB = `M 420 ${Y + 25} L 420 ${Y + 66} L ${bx} ${Y + 66} L ${bx} ${C.portB[1]}`;
  H.p28Pipe(ln, `M ${f(F.outX - 2)} ${Y} L 338 ${Y}`);
  H.p28Pipe(ln, pA, { w: 12 }); H.p28Pipe(ln, pB, { w: 12 });
  // redraw valve on top of its pipe stubs
  ln.appendChild(V.g);
  const fMain = H.p28Flow(ln, "s1-v-fm", `M 12 ${Y} L ${f(F.inX)} ${Y} M ${f(F.outX)} ${Y} L 336 ${Y}`);
  const fA = H.p28Flow(ln, "s1-v-fa", pA, { w: 4 });
  const fB = H.p28Flow(ln, "s1-v-fb", pB, { w: 4 });

  // ---------------- motion
  H.p28Run(fMain, b + 0.4, D - 0.5, { keep: true });
  tl.fromTo(F.gauge.needle, { rotation: F.gauge.rot(0), svgOrigin: F.gauge.origin }, { rotation: F.gauge.rot(5.5), svgOrigin: F.gauge.origin, duration: 0.9, ease: "power2.out" }, b + 0.5);
  const ext = 44;
  H.p28Run(fA, b + 1.3, 1.1);
  tl.fromTo(C.rod, { x: 0 }, { x: ext, duration: 0.9, ease: "power2.inOut" }, b + 1.4);
  H.p28Run(fB, b + 3.3, 1.1);
  tl.to(C.rod, { x: 0, duration: 0.9, ease: "power2.inOut" }, b + 3.4);
  tl.fromTo(F.drip, { y: 0, opacity: 1 }, { y: 9, opacity: 0, duration: 0.6, ease: "power1.in", repeat: Math.max(1, Math.floor((D - 1) / 0.9)), repeatDelay: 0.3 }, b + 0.8);
  ticks.forEach((t, i) => H.p28Pop(t, b + 1.4 + i * 0.24, x0 + cw * i + cw / 2, 119, 1.8, 0.25));
  H.p28Pop(wk, b + 3.3, wx, 207, 1.4, 0.35);
}
