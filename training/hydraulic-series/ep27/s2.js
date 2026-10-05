// Purposes of lubrication (PDF p.43): the cylinder above, the magnified piston seal below.
// cue 1 intro: air + oil mist come in, the oil film forms · cue 2 ① smooth stroke · cue 3 ② oil closes
// the tiny gaps under the seal lip — the air stops · cue 4 ③ the seal glides on the film, no wear ·
// cue 5 ④ water drops land on the film, not on the metal — no rust.
{
  const g = H.$("s2-v-art");
  const c = T.cues;
  const C = H.p27Cyl(g, { id: "s2-v-c", x: 40, y: 152, s: 0.75, rod: 170, pipeTop: -150 });
  const Z = H.p27Zoom(g, { id: "s2-v-z", x: 40, y: 300, W: 1020, Hh: 310, sx: 380, tag: "ขยาย: ซีลลูกสูบ (Piston seal)", tagW: 336 });
  const sx = Z.sx;

  // ring around the head-side bottom seal (moves with the piston) + connector to the zoom tag
  H.el("circle", { cx: 80, cy: 75, r: 26, fill: "none", stroke: P27.ink, "stroke-width": 4 }, C.pis);
  const [rx, ry] = C.at(80, 101);
  const con = H.el("line", { x1: rx, y1: ry, x2: rx, y2: 314, stroke: P27.ink, "stroke-width": 3, "stroke-dasharray": "8 7" }, g);

  // static labels
  H.p27Label(g, 258, 62, "กระบอกสูบลม (Air cylinder)", { size: 26, anchor: "middle" });
  H.p27Label(Z.g, sx + 132, 50, "ซีล (Seal)", { size: 26, line: [sx + 128, 42, sx + 98, 70] });
  H.p27Label(Z.g, Z.W - 170, 66, "ลูกสูบ (Piston)", { size: 26, anchor: "middle" });
  H.p27Label(Z.g, Z.W - 30, 284, "ผนังกระบอก (Tube wall)", { size: 26, anchor: "end" });
  const filmLab = H.p27Label(Z.g, sx + 330, 192, "ฟิล์มน้ำมัน (Oil film)", { size: 26, fill: P27.oilDk, line: [sx + 326, 184, sx + 296, 205], lineColor: P27.oilDk, opacity: 0 });

  // ---- cue 1: air + oil mist enter, the film forms (cylinder and zoom)
  tl.fromTo([C.film, Z.film], { opacity: 0 }, { opacity: 1, duration: 0.8 }, b + c[0] + 1.6);
  tl.fromTo(filmLab, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[0] + 2.2);
  H.p27Run(C.flowL, b + c[0] + 0.2, 2.6, 110);
  const ends = [[96, -60], [118, 60], [84, 60], [132, -60], [104, -60], [140, 60], [90, -60], [126, 60]];
  ends.forEach(([ex, ey], i) => {
    const d = H.el("circle", { cx: 30, cy: -150, r: 7, fill: P27.oil, stroke: P27.oilDk, "stroke-width": 2, opacity: 0 }, C.g);
    const t = b + c[0] + 0.4 + i * 0.16;
    tl.fromTo(d, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.1 }, t);
    tl.to(d, { y: 102, duration: 0.45, ease: "none" }, t);
    tl.to(d, { x: ex - 30, y: ey + 150, duration: 0.5, ease: "power1.out" }, t + 0.45);
    tl.to(d, { opacity: 0, duration: 0.25 }, t + 0.95);
  });

  // ---- cue 2 ①: smooth stroke out and back (zoom wall slides under the seal, connector follows the ring)
  const K = 1.8, [cx0] = C.at(80, 0);
  const move = (t, x0, x1, dur, flow = true) => {
    tl.fromTo(C.pis, { x: x0 }, { x: x1, duration: dur, ease: "sine.inOut", immediateRender: false }, t);
    tl.fromTo(Z.wall, { x: -K * x0 }, { x: -K * x1, duration: dur, ease: "sine.inOut", immediateRender: false }, t);
    tl.fromTo(con, { attr: { x1: cx0 + x0 * C.s } }, { attr: { x1: cx0 + x1 * C.s }, duration: dur, ease: "sine.inOut", immediateRender: false }, t);
    if (flow) H.p27Run(x1 > x0 ? C.flowL : C.flowR, t, dur, 110);
  };
  const L1 = H.el("g", { opacity: 0 }, g);
  H.p27Badge(L1, 742, 82, 1);
  H.p27Label(L1, 772, 92, "ลื่น · สม่ำเสมอ", { size: 30, fill: P27.green });
  H.el("path", { d: "M 748 118 L 1040 118", stroke: P27.green, "stroke-width": 5, fill: "none" }, L1);
  H.el("path", { d: H.p27HeadD(748, 118, 1052, 118, 18), fill: P27.green }, L1);
  H.el("path", { d: H.p27HeadD(1040, 118, 736, 118, 18), fill: P27.green }, L1);
  tl.fromTo(L1, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 }, b + c[1] + 0.1);
  move(b + c[1] + 0.3, 0, 280, 1.6);
  move(b + c[1] + 2.1, 280, 0, 1.4);

  // effect label in the zoom (badge + text), one at a time
  const eff = (n, str, t, tOff) => {
    const e = H.el("g", { opacity: 0 }, Z.g);
    H.p27Badge(e, sx + 150, 140, n, { r: 19 });
    H.p27Label(e, sx + 178, 150, str, { size: 28, fill: P27.green });
    tl.fromTo(e, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.35 }, t);
    if (tOff) tl.to(e, { opacity: 0, duration: 0.3 }, tOff);
    return e;
  };

  // ---- cue 3 ②: air pushes at the seal; the oil fills the tiny gaps under the lip → the air stops
  const air = [
    H.p27Flow(Z.inner, `M 26 128 L ${sx - 22} 128`, { w: 7, dash: "16 12", period: 28, head: [sx - 40, 128, sx - 6, 128], headSize: 22 }),
    H.p27Flow(Z.inner, `M 26 176 L ${sx - 10} 176`, { w: 7, dash: "16 12", period: 28, head: [sx - 30, 176, sx + 6, 176], headSize: 22 }),
  ];
  const airLab = H.p27Label(Z.inner, 26, 104, "ลมอัด (แรงดัน)", { size: 26, fill: P27.blue, opacity: 0 });
  air.forEach((F, i) => H.p27Run(F, b + c[2] + 0.2 + i * 0.15, 3.2, 90));
  tl.fromTo(airLab, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + c[2] + 0.2);
  tl.to(airLab, { opacity: 0, duration: 0.3 }, b + c[2] + 3.2);
  const gap = H.el("rect", { x: sx - 8, y: 190, width: 126, height: 36, rx: 10, fill: "none", stroke: P27.oilDk, "stroke-width": 5, opacity: 0 }, Z.inner);
  tl.fromTo(gap, { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 5, ease: "none", immediateRender: false }, b + c[2] + 0.9);
  eff(2, "ลมผ่านไม่ได้ → ไม่รั่ว", b + c[2] + 0.1, b + c[3]);

  // ---- cue 4 ③: the seal glides on the film (wall slides both ways), the lip edge stays sharp
  move(b + c[3] + 0.3, 0, 140, 1.2, false);
  move(b + c[3] + 1.6, 140, 0, 1.1, false);
  const edge = H.el("path", { d: `M ${sx + 14} 204 L ${sx + 96} 204`, stroke: P27.green, "stroke-width": 6, fill: "none", opacity: 0 }, Z.inner);
  tl.fromTo(edge, { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 3, repeatDelay: 0.2, immediateRender: false }, b + c[3] + 0.5);
  eff(3, "ซีลเลื่อนบนฟิล์ม → ไม่สึก", b + c[3] + 0.1, b + c[4]);

  // ---- cue 5 ④: water drops land on the oil film and bead up — the metal stays dry
  [[120, 0], [236, 0.35]].forEach(([x, dt]) => {
    const dr = H.el("path", { d: H.p27DropD(x, 0, 13), fill: P27.water, stroke: P27.ink, "stroke-width": 2, opacity: 0 }, Z.inner);
    const t = b + c[4] + 0.3 + dt;
    tl.fromTo(dr, { opacity: 1, y: 50 }, { y: 160, duration: 0.6, ease: "power2.in", immediateRender: false }, t);
    tl.fromTo(dr, { scaleY: 1, scaleX: 1, transformOrigin: "50% 100%" }, { scaleY: 0.55, scaleX: 1.35, transformOrigin: "50% 100%", duration: 0.2, ease: "power2.out", immediateRender: false }, t + 0.6);
  });
  const dry = H.p27Label(Z.inner, 60, 272, "โลหะไม่โดนน้ำ", { size: 26, fill: P27.green, opacity: 0 });
  tl.fromTo(dry, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + c[4] + 1.4);
  eff(4, "น้ำมันเคลือบผิว → ไม่เป็นสนิม", b + c[4] + 0.1);
}
