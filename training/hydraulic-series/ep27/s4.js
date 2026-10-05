// Lubrication defect → trouble (table on PDF p.43), shown on a spool valve feeding an air cylinder, both dry.
// cue 2 ① friction up: the spool shifts in hesitant steps, the piston moves in jerks and stalls short.
// cue 3 ② worn seals: air hisses out at the rod seal and at the valve exhaust.
// cue 4 ③ rust: spots on the tube wall; a rust flake rides the air into the valve and jams the spool.
{
  const g = H.$("s4-v-art");
  const c = T.cues;
  const pg = H.el("g", {}, g);                       // pipes behind the valve and the cylinder
  const V = H.p27Valve(g, { id: "s4-v-v", x: 150, y: 84, s: 0.9, pTop: -70 });
  const C = H.p27Cyl(g, { id: "s4-v-c", x: 60, y: 470, s: 0.9, rod: 150, pipeTop: [-95, -95], oil: false, rust: false });
  const [ax, ay] = V.at(257, 146), [bx] = V.at(397, 146);
  const [clx, cly] = C.at(30, -93), [crx] = C.at(550, -93);
  const dA = `M ${H.f(ax)} ${H.f(ay)} L ${H.f(ax)} 300 L ${H.f(clx)} 300 L ${H.f(clx)} ${H.f(cly)}`;
  const dB = `M ${H.f(bx)} ${H.f(ay)} L ${H.f(bx)} 330 L ${H.f(crx)} 330 L ${H.f(crx)} ${H.f(cly)}`;
  H.p27Pipe(pg, dA, { w: 16 });
  H.p27Pipe(pg, dB, { w: 16 });
  const flowA = H.p27Flow(g, dA, { w: 5, dash: "12 12", period: 24 });

  // static labels
  H.p27Label(g, 716, 132, "วาล์ว (Valve)", { size: 28 });
  H.p27Label(g, 364, 46, "จาก FRL", { size: 26, anchor: "end", fill: P27.blue });
  H.p27Label(g, 60, 616, "Actuator (กระบอกสูบลม)", { size: 28 });
  const dry = H.p27Label(g, 612, 360, "ไม่มีฟิล์มน้ำมัน (แห้ง)", { size: 26, fill: P27.muted, line: [606, 354, 456, 405], lineColor: P27.muted, opacity: 0 });
  tl.fromTo(dry, { opacity: 0 }, { opacity: 1, duration: 0.35 }, b + c[0] + 0.3);

  // coil glow (solenoid energised)
  const glow = H.el("rect", { x: 10, y: 28, width: 94, height: 96, rx: 6, fill: P27.oil, opacity: 0 }, V.g);
  const spoolTo = (t, x0, x1, dur, ease = "power3.out") => {
    tl.fromTo(V.spool, { x: x0 }, { x: x1, duration: dur, ease, immediateRender: false }, t);
    tl.fromTo(V.spring, { attr: { d: V.springD(x0) } }, { attr: { d: V.springD(x1) }, duration: dur, ease, immediateRender: false }, t);
  };
  const tag = (x, y, n, str, t, o = {}) => {
    const e = H.el("g", { opacity: 0 }, g);
    H.p27Badge(e, x + 18, y - 10, n, { r: 18 });
    H.p27Label(e, x + 44, y, str, { size: o.size || 28, fill: o.fill || P27.ink });
    tl.fromTo(e, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.35, immediateRender: false }, t);
    return e;
  };

  // ---- ① friction up: hesitant spool, jerky piston that stalls short
  const t1 = b + c[1] + 0.4;
  tl.fromTo(glow, { opacity: 0 }, { opacity: 0.6, duration: 0.2, immediateRender: false }, t1);
  [[0, 14], [14, 27], [27, 40]].forEach(([x0, x1], k) => spoolTo(t1 + 0.2 + k * 0.6, x0, x1, 0.16));
  tag(712, 182, 1, "สลับไม่ดี", t1 + 0.6);
  const tP = t1 + 1.6;
  const tEnd = H.p27Jerky(C.pis, tP, 0, 200, 4, 0.2, 0.42);
  H.p27Run(flowA, tP - 0.3, tEnd - tP + 0.6, 90);
  H.p27Run(C.flowL, tP, tEnd - tP + 0.3, 90);
  tag(650, 416, 1, "ไม่นิ่ง · แรงไม่พอ", tP + 0.4);

  // ---- ② worn seals: air leaks at the rod seal and out of the valve exhaust
  const t2 = b + c[2] + 0.3;
  const [rsx, rsy] = C.at(586, 20);
  const p1 = H.p27Puff(g, rsx, rsy, 40, { w: 6 });
  const [ex, ey] = V.at(417, -40);
  const p2 = H.p27Puff(g, ex + 2, ey, -15, { w: 6 });
  H.p27Puffs(p1, t2, 6, 0.55);
  H.p27Puffs(p2, t2 + 0.25, 6, 0.55);
  tag(640, 556, 2, "ลมรั่ว", t2 + 0.2);
  tag(572, 52, 2, "ลมรั่ว", t2 + 0.45);

  // ---- ③ rust: spots on the tube wall, a flake jams the spool
  const t3 = b + c[3] + 0.3;
  tl.fromTo(C.rust, { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false }, t3);
  const [rsX, rsY] = C.at(470, 76);
  const rl = H.el("g", { opacity: 0 }, g);
  H.p27Label(rl, 520, 606, "สนิม (ผิวเลื่อนลูกสูบ)", { size: 26, fill: P27.rust, line: [516, 598, rsX, rsY], lineColor: P27.rust });
  tl.fromTo(rl, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t3 + 0.3);
  const [stX, stY] = V.at(334, 52);                   // left edge of land 2 (spool shifted +40), at the bore wall
  const flakes = [[0, stX - 4, stY + 2, true], [0.35, ax + 26, ay - 50, false], [0.7, ax + 8, ay - 40, false]];
  flakes.forEach(([dt, fx, fy, stick]) => {
    const fl = H.el("path", { d: `M ${H.f(ax - 7)} 24 L ${H.f(ax + 3)} 18 L ${H.f(ax + 9)} 27 L ${H.f(ax + 1)} 34 Z`, fill: P27.rust, stroke: P27.ink, "stroke-width": 1.5, opacity: 0 }, g);
    const t = t3 + 0.2 + dt;
    tl.fromTo(fl, { opacity: 1, x: 0, y: 0 }, { y: fy - 26, duration: 0.7, ease: "none", immediateRender: false }, t);
    tl.to(fl, { x: fx - ax - 1, duration: 0.45, ease: "power1.out" }, t + 0.7);
    if (!stick) tl.to(fl, { opacity: 0, duration: 0.3 }, t + 1.1);
  });
  const ring = H.el("circle", { cx: H.f(stX - 4), cy: H.f(stY + 2), r: 24, fill: "none", stroke: P27.red, "stroke-width": 5, opacity: 0 }, g);
  const tStick = t3 + 1.4;
  tl.fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, tStick);
  tl.fromTo(ring, { scale: 1, svgOrigin: `${H.f(stX - 4)} ${H.f(stY + 2)}` }, { scale: 1.25, svgOrigin: `${H.f(stX - 4)} ${H.f(stY + 2)}`, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut", immediateRender: false }, tStick);
  // solenoid off → the spring should push the spool back, but the flake holds it: it only trembles
  tl.to(glow, { opacity: 0, duration: 0.2 }, tStick + 0.4);
  tl.fromTo(V.spool, { x: 40 }, { x: 36, duration: 0.07, yoyo: true, repeat: 9, ease: "none", immediateRender: false }, tStick + 0.5);
  tag(530, 270, 3, "สนิมติด → วาล์วค้าง", tStick + 0.2, { fill: P27.red });
}
