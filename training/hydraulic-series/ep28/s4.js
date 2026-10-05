// Daily ①: drain. "Once a day" (cycle chip) → night: temperature drops, moisture condenses and collects at the
// bottom of the filter bowl → open the drain cock: the water runs out into a tray.
{
  const f = H.f;
  const c = T.cues, tN = b + T.points[1];
  // ---------------- once a day (cycle chip, bottom-left)
  const sky = H.$("s4-v-sky");
  const chip = H.el("g", { opacity: 0 }, sky);
  const ccx = 150, ccy = 470, cr = 86;
  const arc = H.el("path", { d: H.arcD(ccx, ccy, cr, -70, 235), fill: "none", stroke: P28.blue, "stroke-width": 9, "stroke-linecap": "butt" }, chip);
  const ea = (235 * Math.PI) / 180, ex = ccx + cr * Math.cos(ea), ey = ccy + cr * Math.sin(ea);
  const ta = ea + Math.PI / 2;
  H.el("path", { d: `M ${f(ex + 20 * Math.cos(ta))} ${f(ey + 20 * Math.sin(ta))} L ${f(ex + 16 * Math.cos(ea))} ${f(ey + 16 * Math.sin(ea))} L ${f(ex - 16 * Math.cos(ea))} ${f(ey - 16 * Math.sin(ea))} Z`, fill: P28.blue }, chip);
  H.el("path", { d: H.p28DropD(ccx, ccy - 50, 30), fill: P28.water, stroke: P28.ink, "stroke-width": 3 }, chip);
  H.text(chip, 268, 448, "วันละ", { size: 36 });
  H.text(chip, 268, 522, "1 ครั้ง", { size: 62, fill: P28.blue });

  // ---------------- sky (day → night) + thermometer
  const clip = H.el("clipPath", { id: "s4-v-skyclip" }, sky);
  H.el("rect", { x: 30, y: 24, width: 330, height: 250, rx: 16 }, clip);
  const panel = H.el("g", {}, sky);
  const bg = H.el("rect", { x: 30, y: 24, width: 330, height: 250, rx: 16, fill: "#cfe6f7" }, panel);
  const inner = H.el("g", { "clip-path": "url(#s4-v-skyclip)" }, panel);
  const sun = H.el("circle", { cx: 120, cy: 100, r: 36, fill: P28.oil, stroke: P28.oilDk, "stroke-width": 3 }, inner);
  const night = H.el("g", { opacity: 0 }, inner);
  H.el("path", { d: "M 282 66 A 38 38 0 1 0 312 128 A 30 30 0 1 1 282 66 Z", fill: "#f5f1e8" }, night);
  for (const [x, y, r] of [[90, 70, 4], [150, 120, 3], [205, 60, 4], [110, 170, 3], [230, 150, 3]]) H.el("circle", { cx: x, cy: y, r, fill: "#ffffff" }, night);
  H.el("rect", { x: 30, y: 24, width: 330, height: 250, rx: 16, fill: "none", stroke: P28.ink, "stroke-width": 4 }, panel);
  const lDay = H.text(panel, 195, 252, "กลางวัน", { size: 30, anchor: "middle" });
  const lNight = H.text(panel, 195, 252, "กลางคืน", { size: 30, anchor: "middle", fill: "#ffffff" });
  lNight.setAttribute("opacity", 0);
  // thermometer
  H.el("rect", { x: 398, y: 40, width: 30, height: 206, rx: 15, fill: P28.paper, stroke: P28.ink, "stroke-width": 4 }, sky);
  H.el("circle", { cx: 413, cy: 252, r: 24, fill: P28.red, stroke: P28.ink, "stroke-width": 4 }, sky);
  const liq = H.el("rect", { x: 405, y: 76, width: 16, height: 170, fill: P28.red }, sky);
  for (let y = 70; y <= 220; y += 30) H.el("line", { x1: 428, y1: y, x2: 440, y2: y, stroke: P28.ink, "stroke-width": 3 }, sky);
  const tDown = H.el("g", { opacity: 0 }, sky);
  H.el("path", { d: H.arrowD(460, 80, 460, 196, 18), fill: "none", stroke: P28.blue, "stroke-width": 7 }, tDown);
  H.p28Label(tDown, 413, 316, "อุณหภูมิลด", { size: 30, anchor: "middle", fill: P28.blue });

  // ---------------- FRL (filter in focus)
  const m = H.$("s4-v-frl");
  const Y = 168, S = 1.7;
  H.p28Pipe(m, `M 482 ${Y} L 548 ${Y}`, { w: 26 });
  H.p28Pipe(m, `M 986 ${Y} L 1086 ${Y}`, { w: 26 });
  const F = H.p28Frl(m, { id: "s4-v-u", x: 545, y: Y, s: S, water: 0, oil: 110, gv: 5.5 });
  const fIn = H.p28Flow(m, "s4-v-fi", `M 482 ${Y} L 545 ${Y}`, { w: 7, dash: "14 16", period: 30 });
  const fOut = H.p28Flow(m, "s4-v-fo", `M 990 ${Y} L 1086 ${Y}`, { w: 7, dash: "14 16", period: 30 });
  const [fx, fy] = F.at(42, -35);
  H.p28Label(m, fx, fy - 14, "Filter", { size: 28, anchor: "middle" });
  const [bx, by] = F.at(72, 120);
  H.el("line", { x1: f(bx + 4), y1: f(by), x2: 700, y2: f(by), stroke: P28.ink, "stroke-width": 3 }, m);
  H.el("circle", { cx: f(bx + 4), cy: f(by), r: 5, fill: P28.ink }, m);
  H.p28Label(m, 708, by + 2, "ถ้วยกรอง", { size: 30 });
  H.p28Label(m, 708, by + 36, "(Filter bowl)", { size: 24, fill: P28.muted });
  // condensation drops on the inner wall (local units, inside the FRL group)
  const fg = F.g;
  const drops = [[18, 70], [66, 88], [20, 112], [64, 132], [24, 150], [60, 60]].map(([x, y]) =>
    H.el("path", { d: H.p28DropD(x, y, 5), fill: P28.water, stroke: P28.ink, "stroke-width": 1.2, opacity: 0 }, fg));
  const wLbl = H.el("g", { opacity: 0 }, m);
  const [wx, wy] = F.at(72, 182);
  H.el("line", { x1: f(wx - 10), y1: f(wy), x2: 700, y2: f(wy), stroke: P28.water, "stroke-width": 3 }, wLbl);
  H.el("circle", { cx: f(wx - 10), cy: f(wy), r: 5, fill: P28.water }, wLbl);
  H.p28Label(wLbl, 708, wy + 10, "น้ำ (Drain)", { size: 30, fill: P28.water });
  // drain valve label, stream and tray
  const [lx, ly] = F.at(42, 218);
  const vLbl = H.el("g", { opacity: 0 }, m);
  H.el("line", { x1: f(lx + 62), y1: f(ly), x2: 700, y2: f(ly), stroke: P28.ink, "stroke-width": 3 }, vLbl);
  H.p28Label(vLbl, 708, ly + 10, "วาล์ว Drain", { size: 30 });
  const [nx, ny] = F.at(42, 234);
  const tray = H.el("g", {}, m);
  H.el("path", { d: `M ${f(nx - 56)} 594 L ${f(nx - 48)} 626 L ${f(nx + 48)} 626 L ${f(nx + 56)} 594`, fill: P28.paper, stroke: P28.ink, "stroke-width": 4, "stroke-linejoin": "round" }, tray);
  const trayW = H.el("rect", { x: f(nx - 48), y: 620, width: 96, height: 5, fill: P28.water, opacity: 0 }, tray);
  const stream = H.el("rect", { x: f(nx - 4), y: f(ny), width: 8, height: f(620 - ny), fill: P28.water, opacity: 0 }, m);
  const okT = H.p28Tick(m, 728, wy, 26);
  okT.setAttribute("opacity", 0);

  // ---------------- timing
  H.p28Run(fIn, b + 0.3, D - 0.4, { keep: true, speed: 140 });
  H.p28Run(fOut, b + 0.3, D - 0.4, { keep: true, speed: 140 });
  // cue 1: once a day
  tl.fromTo(chip, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[0] + 0.05);
  const LA = 2 * Math.PI * cr * (305 / 360);
  tl.fromTo(arc, { strokeDasharray: LA, strokeDashoffset: LA }, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut" }, b + c[0] + 0.05);
  // night: sky darkens, sun sets, moon + stars, temperature falls
  tl.to(bg, { attr: { fill: "#22304d" }, duration: 1.0, ease: "power1.inOut" }, tN);
  tl.fromTo(sun, { y: 0, opacity: 1 }, { y: 150, opacity: 0, duration: 1.0, ease: "power1.in" }, tN);
  tl.fromTo(night, { opacity: 0 }, { opacity: 1, duration: 0.6 }, tN + 0.5);
  tl.to(lDay, { opacity: 0, duration: 0.3 }, tN + 0.4);
  tl.fromTo(lNight, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tN + 0.6);
  tl.fromTo(liq, { attr: { y: 76, height: 170 } }, { attr: { y: 168, height: 78 }, duration: 1.1, ease: "power1.inOut" }, tN + 0.2);
  tl.fromTo(tDown, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tN + 0.4);
  // condensation: drops form on the bowl wall, run down, water collects at the bottom
  const tc = tN + 1.0;
  drops.forEach((d, k) => {
    tl.fromTo(d, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.25 }, tc + k * 0.15);
    tl.to(d, { y: 186 - [70, 88, 112, 132, 150, 60][k], duration: 0.9, ease: "power1.in" }, tc + 0.5 + k * 0.15);
    tl.to(d, { opacity: 0, duration: 0.15 }, tc + 1.3 + k * 0.15);
  });
  tl.fromTo(F.water, { attr: { y: 200, height: 4 } }, { attr: { y: 160, height: 44 }, duration: 1.6, ease: "power1.inOut" }, tc + 0.9);
  tl.fromTo(wLbl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tc + 1.6);
  // cue 2: open the drain valve → water runs out
  const td = b + c[1] + 0.5;
  tl.to(panel, { opacity: 0.6, duration: 0.4 }, b + c[1]);
  tl.fromTo(vLbl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, td - 0.2);
  tl.fromTo(F.lever, { rotation: 0, svgOrigin: F.leverOrigin }, { rotation: 55, svgOrigin: F.leverOrigin, duration: 0.4, ease: "power2.out" }, td);
  tl.fromTo(stream, { opacity: 0, scaleY: 0, svgOrigin: `${f(nx)} ${f(ny)}` }, { opacity: 0.9, scaleY: 1, svgOrigin: `${f(nx)} ${f(ny)}`, duration: 0.3 }, td + 0.35);
  tl.to(F.water, { attr: { y: 200, height: 4 }, duration: 1.5, ease: "power1.in" }, td + 0.45);
  tl.fromTo(trayW, { opacity: 0, attr: { y: 620, height: 5 } }, { opacity: 0.9, attr: { y: 608, height: 17 }, duration: 1.5 }, td + 0.6);
  tl.to(stream, { opacity: 0, duration: 0.25 }, td + 2.0);
  tl.to(wLbl, { opacity: 0, duration: 0.3 }, td + 1.7);
  H.p28Pop(okT, td + 2.0, 728, wy, 1.7, 0.3);
}
