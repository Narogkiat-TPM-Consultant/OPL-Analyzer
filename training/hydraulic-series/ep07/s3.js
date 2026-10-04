// Why a cushion: left = piston runs full speed into the cover (shock to cylinder, pipe and valve);
// right = same speed, then the cushion zone slows it to a soft stop. Blue arrow above the piston = speed.
{
  const mini = (pid, P) => {
    const g = H.el("g", { id: P + "-all" }, pid);
    const R = (x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: C7.ink, "stroke-width": o.sw ?? 4, ...(o.rx ? { rx: o.rx } : {}) }, o.parent || g);
    // pipe + valve fed by the head cover
    R(560, 100, 76, 20, C7.oil, { sw: 3 });
    const valve = H.el("g", { id: P + "-valve" }, g);
    R(636, 72, 96, 76, C7.paper, { rx: 8, parent: valve });
    H.el("path", { d: "M 652 88 L 716 132 L 716 88 L 652 132 Z", fill: "none", stroke: C7.ink, "stroke-width": 4, "stroke-linejoin": "round" }, valve);
    H.text(g, 684, 186, "ท่อ · วาล์ว", { size: 24, anchor: "middle", fill: C7.muted });
    // cylinder
    R(50, 58, 470, 104, C7.oil);
    const rod = R(10, 99, 60, 22, C7.dark, { sw: 3 });
    R(34, 46, 22, 128, C7.metal, { rx: 3 });
    R(520, 42, 40, 136, C7.metal, { rx: 3 });
    const mov = H.el("g", { id: P + "-mov" }, g);
    R(70, 62, 28, 96, C7.steel, { sw: 3, parent: mov });
    const spd = H.el("path", { id: P + "-spd", d: H.arrowD(84, 30, 184, 30, 18), fill: "none", stroke: C7.blue, "stroke-width": 8 }, mov);
    return { g, mov, rod, spd, valve };
  };
  const spdOrigin = "84 30";
  const v1 = 330;                                   // px/s at full speed (both cards)

  // ---- left: no cushion → full speed into the cover, impact + shock wave
  const A = mini("s3-v-a", "s3-v-a");
  const tA = T.left + 0.8, dxA = 422, TA = dxA / v1;
  tl.fromTo(A.mov, { x: 0 }, { x: dxA, duration: TA, ease: "none" }, b + tA);
  tl.fromTo(A.rod, { attr: { width: 60 } }, { attr: { width: 60 + dxA }, duration: TA, ease: "none" }, b + tA);
  tl.to(A.spd, { opacity: 0, duration: 0.06 }, b + tA + TA);
  const hit = tA + TA;
  const burst = H.el("path", { d: "M 520 66 L 532 94 L 562 84 L 546 108 L 572 124 L 542 128 L 548 158 L 526 136 L 506 156 L 508 126 L 482 118 L 506 104 L 496 76 L 516 92 Z", fill: C7.red, opacity: 0 }, A.g);
  tl.fromTo(burst, { opacity: 1, scale: 0.4, svgOrigin: "524 112" }, { opacity: 0, scale: 1.4, svgOrigin: "524 112", duration: 0.7, ease: "power2.out" }, b + hit);
  tl.fromTo(A.g, { x: 0 }, { x: 6, duration: 0.05, yoyo: true, repeat: 7, ease: "none" }, b + hit);
  for (let k = 0; k < 3; k++) {
    const w = H.el("path", { d: "M 566 88 Q 580 110 566 132", fill: "none", stroke: C7.red, "stroke-width": 6, opacity: 0 }, A.g);
    tl.fromTo(w, { x: 0, opacity: 1 }, { x: 64, opacity: 0, duration: 0.55, ease: "none" }, b + hit + 0.08 + k * 0.22);
  }
  tl.fromTo(A.valve, { rotation: 0, svgOrigin: "684 110" }, { rotation: 5, svgOrigin: "684 110", duration: 0.07, yoyo: true, repeat: 7, ease: "none" }, b + hit + 0.4);
  const bang = H.el("g", { opacity: 0 }, A.g);
  H.c7Label(bang, 430, 34, "กระแทก!", { size: 30, fill: C7.red, anchor: "middle" });
  tl.to(bang, { opacity: 1, duration: 0.2 }, b + hit + 0.05);

  // ---- right: cushion zone → speed drops, then fades to a soft stop
  const B = mini("s3-v-b", "s3-v-b");
  const dx1 = 330, dx2 = 92, v2 = 0.3 * v1, T1 = dx1 / v1, T2 = (2 * dx2) / v2;
  const tB = T.right + 0.8;
  const zone = H.el("g", { opacity: 0 }, B.g);
  H.el("path", { d: `M ${84 + dx1} 172 L ${84 + dx1} 184 L 520 184 L 520 172`, fill: "none", stroke: C7.green, "stroke-width": 4 }, zone);
  H.c7Label(zone, 84 + dx1 + 50, 214, "ช่วง Cushion", { size: 26, fill: C7.green, anchor: "middle" });
  tl.to(zone, { opacity: 1, duration: 0.3 }, b + T.right + 0.4);
  tl.fromTo(B.mov, { x: 0 }, { x: dx1, duration: T1, ease: "none" }, b + tB);
  tl.to(B.mov, { x: dx1 + dx2, duration: T2, ease: "power2.out" }, b + tB + T1);
  tl.fromTo(B.rod, { attr: { width: 60 } }, { attr: { width: 60 + dx1 } , duration: T1, ease: "none" }, b + tB);
  tl.to(B.rod, { attr: { width: 60 + dx1 + dx2 }, duration: T2, ease: "power2.out" }, b + tB + T1);
  tl.fromTo(B.spd, { scaleX: 1, svgOrigin: spdOrigin }, { scaleX: 0.3, svgOrigin: spdOrigin, duration: 0.12, ease: "power1.out" }, b + tB + T1);
  tl.to(B.spd, { scaleX: 0.05, svgOrigin: spdOrigin, duration: T2 - 0.12, ease: "none" }, b + tB + T1 + 0.12);
  tl.to(B.spd, { opacity: 0, duration: 0.2 }, b + tB + T1 + T2 - 0.25);
  const soft = H.el("g", { opacity: 0 }, B.g);
  H.c7Label(soft, 430, 34, "หยุดนุ่มนวล", { size: 30, fill: C7.green, anchor: "middle" });
  tl.to(soft, { opacity: 1, duration: 0.3 }, b + tB + T1 + T2 - 0.2);
}
