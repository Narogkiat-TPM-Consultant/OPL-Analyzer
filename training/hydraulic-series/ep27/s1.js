// Title: air carrying oil mist enters the cylinder, the oil film forms on the tube wall, the piston glides
// out and back; the magnified seal below slides on the oil film.
{
  const g = H.$("s1-v-art");
  const C = H.p27Cyl(g, { id: "s1-v-c", x: 26, y: 176, s: 0.8, rod: 96, pipeTop: -168, oil: true });
  const Z = H.p27Zoom(g, { id: "s1-v-z", x: 26, y: 322, W: 708, Hh: 280, sx: 250, tag: "ขยาย: ซีลลูกสูบ", tagW: 214 });

  // ring around the head-side bottom seal (moves with the piston) + connector to the zoom
  H.el("circle", { cx: 80, cy: 75, r: 26, fill: "none", stroke: P27.ink, "stroke-width": 4 }, C.pis);
  const [rx, ry] = C.at(80, 75 + 26);
  const con = H.el("line", { x1: rx, y1: ry, x2: rx, y2: 336, stroke: P27.ink, "stroke-width": 3, "stroke-dasharray": "8 7" }, g);

  // labels
  H.p27Label(g, 64, 42, "ลม + ละอองน้ำมัน (Oil mist)", { size: 25, fill: P27.blue });
  H.p27Label(Z.g, Z.sx + 132, 52, "ซีล (Seal)", { size: 26, line: [Z.sx + 128, 44, Z.sx + 98, 70] });
  const filmLab = H.p27Label(Z.g, Z.sx + 160, 178, "ฟิล์มน้ำมัน (Oil film)", { size: 26, fill: P27.oilDk, line: [Z.sx + 156, 170, Z.sx + 128, 205], lineColor: P27.oilDk, opacity: 0 });

  // film forms from the mist
  tl.fromTo([C.film, Z.film], { opacity: 0.15 }, { opacity: 1, duration: 0.6 }, b + 1.0);
  tl.fromTo(filmLab, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + 1.4);

  // oil-mist dots: down the port, into the head-side chamber, onto the wall
  const ends = [[96, -60], [118, 60], [84, 60], [132, -60], [104, -60], [140, 60]];
  ends.forEach(([ex, ey], i) => {
    const d = H.el("circle", { cx: 30, cy: -168, r: 7, fill: P27.oil, stroke: P27.oilDk, "stroke-width": 2, opacity: 0 }, C.g);
    const t = b + 0.2 + i * 0.13;
    tl.fromTo(d, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, t);
    tl.to(d, { y: 120, duration: 0.45, ease: "none" }, t);
    tl.to(d, { x: ex - 30, y: ey + 168, duration: 0.5, ease: "power1.out" }, t + 0.45);
    tl.to(d, { opacity: 0, duration: 0.25 }, t + 0.95);
  });

  // piston glides out and back; zoom wall slides under the seal; connector follows the ring
  const K = 2.2, [cx0] = C.at(80, 0);
  const move = (t, x0, x1, dur) => {
    tl.fromTo(C.pis, { x: x0 }, { x: x1, duration: dur, ease: "sine.inOut", immediateRender: false }, b + t);
    tl.fromTo(Z.wall, { x: -K * x0 }, { x: -K * x1, duration: dur, ease: "sine.inOut", immediateRender: false }, b + t);
    tl.fromTo(con, { attr: { x1: cx0 + x0 * C.s } }, { attr: { x1: cx0 + x1 * C.s }, duration: dur, ease: "sine.inOut", immediateRender: false }, b + t);
    H.p27Run(x1 > x0 ? C.flowL : C.flowR, b + t, dur, 110);
  };
  move(0.6, 0, 150, 1.5);
  move(2.4, 150, 0, 1.3);
  if (D > 4.4) move(3.9, 0, 150, Math.min(1.5, D - 4.0));
}
