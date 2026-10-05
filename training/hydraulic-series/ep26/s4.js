// Trouble due to drain, along the line pipe → valve → cylinder → exhaust; each spot gets its number with the voice.
// ① pipe: rust, corrosion, a clog grows → the gauge drops.  ② valve: zoom on the seat, a rust grain keeps the poppet
// open → air leaks.  ③ cylinder: the rod moves in jerks (stroke chart), then a water slug hits the piston (water hammer).
// ④ exhaust: drain mist blows out of the silencer into the air.
{
  const g = H.$("s4-v-art"), c = T.cues;
  const t1 = b + c[0] + 0.1, t2 = b + c[1] + 0.1, t3 = b + c[2] + 0.1, t4 = b + c[3] + 0.1;
  const R = (pa, x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, rx: o.rx ?? 6, fill, stroke: P26.ink, "stroke-width": o.sw ?? 4, ...(o.id ? { id: o.id } : {}) }, pa);

  // ---------- ① supply pipe with drain lying in it + pressure gauge
  H.el("path", { d: "M 150 220 L 150 340", stroke: P26.pipe, "stroke-width": 10 }, g);
  P26.tubeH(g, 20, 352, 150, 210);
  H.el("rect", { x: 20, y: 196, width: 332, height: 14, fill: P26.water }, g);
  const flow = P26.dash(g, "M 20 176 L 350 176", { id: "s4-v-flow" });
  P26.dashRun([flow], b + 0.3, D - 0.3, 0.8);
  const rust1 = H.el("g", { id: "s4-v-rust1" }, g);
  for (const [x, rx] of [[60, 20], [140, 26], [220, 18]]) H.el("ellipse", { cx: x, cy: 153, rx, ry: 6, fill: P26.rust }, rust1);
  for (const x of [90, 190, 260]) H.el("path", { d: `M ${x - 8} 140 Q ${x} 152 ${x + 8} 140 Z`, fill: P26.rust }, rust1);
  const clog = H.el("path", { id: "s4-v-clog", d: "M 282 210 Q 284 170 312 166 Q 340 168 342 210 Z", fill: P26.rust, stroke: "#4d3a24", "stroke-width": 2 }, g);

  // gauge: needle drops when the line narrows
  const GX = 150, GY = 410, GR = 70;
  H.el("circle", { cx: GX, cy: GY, r: GR, fill: "#ffffff", stroke: P26.ink, "stroke-width": 5 }, g);
  for (let i = 0; i <= 8; i++) {
    const a = ((150 + 30 * i) * Math.PI) / 180;
    H.el("line", { x1: H.f(GX + (GR - 8) * Math.cos(a)), y1: H.f(GY + (GR - 8) * Math.sin(a)), x2: H.f(GX + (GR - 20) * Math.cos(a)), y2: H.f(GY + (GR - 20) * Math.sin(a)), stroke: P26.ink, "stroke-width": 3 }, g);
  }
  const a0 = ((150 + 240 * 0.72) * Math.PI) / 180;
  const needle = H.el("line", { id: "s4-v-needle", x1: GX, y1: GY, x2: H.f(GX + (GR - 16) * Math.cos(a0)), y2: H.f(GY + (GR - 16) * Math.sin(a0)), stroke: P26.ink, "stroke-width": 5, "stroke-linecap": "round" }, g);
  H.el("circle", { cx: GX, cy: GY, r: 8, fill: P26.ink }, g);
  H.text(g, GX, GY + 44, "แรงดัน", { size: 18, anchor: "middle", fill: P26.muted });
  const pLab = H.text(g, GX, 520, "แรงดันตก", { size: 28, anchor: "middle", fill: P26.pipe });
  pLab.setAttribute("opacity", 0);

  // ---------- ② solenoid valve (outside view) with exhaust silencer
  R(g, 390, 72, 110, 60, "#59606a", { rx: 6 });
  R(g, 430, 52, 30, 20, P26.dark, { rx: 3, sw: 3 });
  R(g, 350, 130, 210, 120, P26.metal, { rx: 8 });
  H.el("path", { d: "M 560 190 L 634 190", stroke: P26.pipe, "stroke-width": 16 }, g);
  R(g, 470, 250, 20, 20, P26.dark, { rx: 2, sw: 3 });
  R(g, 458, 270, 44, 52, "#59606a", { rx: 8 });
  for (const y of [284, 296, 308]) H.el("line", { x1: 466, y1: y, x2: 494, y2: y, stroke: "#c9cfd6", "stroke-width": 3 }, g);

  // zoom on the valve seat (clipped to the bubble)
  const ZX = 360, ZY = 452, ZR = 95;
  const zoom = H.el("g", { id: "s4-v-zoom", opacity: 0 }, g);
  H.el("path", { d: `M 404 252 L ${ZX + 20} ${ZY - ZR + 2}`, stroke: P26.muted, "stroke-width": 3, "stroke-dasharray": "8 6" }, zoom);
  const defs = H.el("defs", {}, zoom);
  const cp = H.el("clipPath", { id: "s4-v-zclip" }, defs);
  H.el("circle", { cx: ZX, cy: ZY, r: ZR }, cp);
  const zin = H.el("g", { "clip-path": "url(#s4-v-zclip)", "data-layout-allow-overflow": "" }, zoom);
  H.el("rect", { x: ZX - ZR, y: ZY - ZR, width: 2 * ZR, height: 2 * ZR, fill: P26.air }, zin);
  P26.block(zin, 255, 470, 81, 90);
  P26.block(zin, 384, 470, 81, 90);
  const zpop = H.el("g", { id: "s4-v-zpop" }, zin);
  R(zpop, 352, 350, 16, 98, P26.dark, { rx: 2, sw: 3 });
  R(zpop, 314, 446, 92, 16, P26.dark, { rx: 3, sw: 3 });
  const zgrit = P26.grain(zin, 326, 465, 9, 3, { attrs: { opacity: 0 } });
  const zleak = H.el("path", { d: "M 360 476 L 360 556", fill: "none", stroke: P26.flow, "stroke-width": 7, "stroke-dasharray": "12 10", opacity: 0 }, zin);
  H.el("circle", { cx: ZX, cy: ZY, r: ZR, fill: "none", stroke: P26.ink, "stroke-width": 5 }, zoom);
  H.text(zoom, ZX, 578, "บ่าวาล์ว (Valve seat)", { size: 22, anchor: "middle", fill: P26.muted });

  // ---------- ③ cylinder: tube, caps, piston + rod (moves), water + rust inside
  const cyl = H.el("g", { id: "s4-v-cyl" }, g);
  P26.tubeH(cyl, 650, 930, 150, 230);
  H.el("rect", { x: 652, y: 218, width: 278, height: 12, fill: P26.water }, cyl);
  const rust3 = H.el("g", { id: "s4-v-rust3", opacity: 0 }, cyl);
  for (const [x, y, k] of [[742, 156, 1], [812, 222, 2], [868, 157, 4], [770, 214, 5]]) P26.grain(rust3, x, y, 7, k);
  const rod = H.el("g", { id: "s4-v-rod" }, cyl);
  R(rod, 660, 150, 24, 80, P26.dark, { rx: 3, sw: 3 });
  R(rod, 684, 178, 322, 24, P26.dark, { rx: 3, sw: 3 });
  R(rod, 1004, 170, 16, 40, P26.metal, { rx: 3, sw: 3 });
  R(cyl, 632, 132, 20, 116, P26.metal, { rx: 3 });
  R(cyl, 928, 132, 20, 116, P26.metal, { rx: 3 });
  const slug = H.el("rect", { id: "s4-v-slug", x: 590, y: 180, width: 40, height: 20, rx: 8, fill: P26.water, stroke: P26.ink, "stroke-width": 2, opacity: 0 }, g);
  const hit = H.el("path", { id: "s4-v-hit", d: "M 0 -22 L 0 -38 M 16 -14 L 28 -26 M -16 -14 L -28 -26 M 0 22 L 0 38 M 16 14 L 28 26 M -16 14 L -28 26", fill: "none", stroke: P26.ink, "stroke-width": 4, opacity: 0 }, g);
  const wh = H.text(g, 790, 112, "Water hammer", { size: 30, anchor: "middle", fill: P26.water });
  wh.setAttribute("opacity", 0);

  // stroke chart: smooth (normal) vs jerky (rust)
  const ch = H.el("g", { id: "s4-v-chart", opacity: 0 }, g);
  H.el("path", { d: H.arrowD(752, 572, 1072, 572, 14) + " " + H.arrowD(752, 572, 752, 352, 14), fill: "none", stroke: P26.ink, "stroke-width": 4 }, ch);
  H.text(ch, 764, 362, "ระยะชัก (Stroke)", { size: 20, fill: P26.muted });
  H.text(ch, 1072, 602, "เวลา", { size: 20, anchor: "end", fill: P26.muted });
  H.el("path", { d: "M 752 572 L 1040 384", fill: "none", stroke: P26.dark, "stroke-width": 5, "stroke-dasharray": "12 8" }, ch);
  H.text(ch, 1000, 368, "ปกติ", { size: 22, anchor: "end", fill: P26.muted });
  let sd = "M 752 572";
  for (let i = 0; i < 6; i++) { const x = 752 + 48 * (i + 1), y = 572 - 31.3 * (i + 1); sd += ` L ${H.f(x - 8)} ${H.f(y + 31.3)} L ${H.f(x)} ${H.f(y)}`; }
  const jerk = H.el("path", { id: "s4-v-jerk", d: sd, fill: "none", stroke: P26.rust, "stroke-width": 6, "stroke-linejoin": "round" }, ch);
  H.text(ch, 1072, 540, "สะดุด (ไม่ราบรื่น)", { size: 22, anchor: "end", fill: P26.rust });

  // ---------- ④ exhaust plume: drain mist out of the silencer
  const plume = H.el("g", { id: "s4-v-plume" }, g);
  const cloud = H.el("path", { d: "M 470 470 Q 470 420 520 420 Q 540 380 590 395 Q 640 370 670 420 Q 700 440 690 480 Q 700 530 650 540 Q 620 570 570 550 Q 520 570 495 535 Q 460 520 470 470 Z", fill: "#e9edf1", stroke: P26.dark, "stroke-width": 3, opacity: 0 }, plume);
  const bits = [];
  for (let i = 0; i < 9; i++) {
    const k = i % 3, x = 480, y = 330;
    bits.push(k === 0 ? P26.drop(plume, x, y, 6, { attrs: { opacity: 0 } }) : k === 1 ? P26.mist(plume, x, y, 5.5, { attrs: { opacity: 0 } }) : P26.grain(plume, x, y, 5.5, i, { attrs: { opacity: 0 } }));
  }
  const exLab = H.text(g, 512, 300, "ไอเสีย (Exhaust)", { size: 22, fill: P26.muted });
  exLab.setAttribute("opacity", 0);
  const airLab = H.text(g, 580, 600, "สู่อากาศ → มลพิษ", { size: 22, anchor: "middle", fill: P26.muted });
  airLab.setAttribute("opacity", 0);

  // badges
  const BP = [[44, 112], [278, 380], [664, 104], [540, 352]];
  BP.forEach(([x, y], i) => {
    const bg = P26.badge(g, x, y, i + 1, { id: `s4-v-b${i + 1}` });
    tl.fromTo(bg, { opacity: 0, scale: 0.4, svgOrigin: `${x} ${y}` }, { opacity: 1, scale: 1, svgOrigin: `${x} ${y}`, duration: 0.35, ease: "back.out(2)" }, [t1, t2, t3, t4][i]);
  });

  // ---------- cue 1: rust spreads, the clog grows, pressure falls
  tl.fromTo(rust1, { opacity: 0.25 }, { opacity: 1, duration: 0.6 }, t1 + 0.3);
  tl.fromTo(clog, { scaleY: 0.15, svgOrigin: "312 210" }, { scaleY: 1, svgOrigin: "312 210", duration: 1.4, ease: "power1.inOut" }, t1 + 0.6);
  tl.fromTo(needle, { rotation: 0, svgOrigin: `${GX} ${GY}` }, { rotation: -240 * 0.42, svgOrigin: `${GX} ${GY}`, duration: 1.2, ease: "power2.inOut" }, t1 + 1.2);
  tl.fromTo(pLab, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3 }, t1 + 1.9);

  // ---------- cue 2: zoom on the seat; a rust grain lands, the poppet cannot close → leak
  tl.fromTo(zoom, { opacity: 0, scale: 0.6, svgOrigin: `${ZX} ${ZY}` }, { opacity: 1, scale: 1, svgOrigin: `${ZX} ${ZY}`, duration: 0.4, ease: "back.out(1.6)" }, t2 + 0.1);
  tl.fromTo(zpop, { y: -24 }, { y: -24, duration: 0.01 }, b);
  tl.fromTo(zgrit, { opacity: 0, x: -30, y: -60 }, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power2.in" }, t2 + 0.6);
  tl.fromTo(zpop, { y: -24 }, { y: -6, duration: 0.3, ease: "power2.in", immediateRender: false }, t2 + 1.2);
  tl.fromTo(zleak, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t2 + 1.5);
  tl.fromTo(zleak, { strokeDashoffset: 0 }, { strokeDashoffset: -22 * Math.round((D - c[1]) * 3), duration: D - c[1] - 1.6, ease: "none", immediateRender: false }, t2 + 1.5);

  // ---------- cue 3: rust in the bore; the rod moves in jerks; then a water slug slams the piston
  tl.fromTo(rust3, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t3 + 0.2);
  tl.fromTo(ch, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 0.2);
  const LJ = jerk.getTotalLength() + 2;
  tl.fromTo(jerk, { strokeDasharray: LJ, strokeDashoffset: LJ }, { strokeDashoffset: 0, duration: 2.4, ease: "none" }, t3 + 0.4);
  for (let i = 0; i < 5; i++) tl.fromTo(rod, { x: 12 * i }, { x: 12 * (i + 1), duration: 0.14, ease: "power3.in", immediateRender: i === 0 }, t3 + 0.5 + i * 0.45);
  const tw = t3 + 2.9;
  tl.fromTo(slug, { opacity: 0, x: 0 }, { opacity: 1, x: 0, duration: 0.1 }, tw);
  tl.fromTo(slug, { x: 0 }, { x: 94, duration: 0.3, ease: "power2.in", immediateRender: false }, tw + 0.1);
  tl.fromTo(slug, { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, tw + 0.4);
  tl.fromTo(hit, { opacity: 0, x: 712, y: 190 }, { opacity: 1, x: 712, y: 190, duration: 0.15 }, tw + 0.4);
  tl.fromTo(hit, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, tw + 1.1);
  tl.fromTo(cyl, { x: 0 }, { x: 6, duration: 0.06, yoyo: true, repeat: 7, ease: "sine.inOut" }, tw + 0.4);
  tl.fromTo(wh, { opacity: 0, scale: 0.7, svgOrigin: "790 102" }, { opacity: 1, scale: 1, svgOrigin: "790 102", duration: 0.3, ease: "back.out(2)" }, tw + 0.45);

  // ---------- cue 4: drain mist blows out of the exhaust into the air
  tl.fromTo(exLab, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t4 + 0.1);
  tl.fromTo(cloud, { opacity: 0, scale: 0.5, svgOrigin: "580 470" }, { opacity: 0.9, scale: 1, svgOrigin: "580 470", duration: 1.2, ease: "power1.out" }, t4 + 0.3);
  const ends = [[20, 120], [70, 150], [120, 120], [160, 170], [40, 210], [100, 220], [150, 230], [60, 170], [190, 140]];
  bits.forEach((el, i) => {
    const [dx, dy] = ends[i], at = t4 + 0.2 + i * 0.16;
    tl.fromTo(el, { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: dx * 0.3, y: dy * 0.3, duration: 0.35, ease: "none" }, at);
    tl.fromTo(el, { x: dx * 0.3, y: dy * 0.3 }, { x: dx, y: dy, duration: 1.1, ease: "power1.out", immediateRender: false }, at + 0.35);
  });
  tl.fromTo(airLab, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t4 + 1.0);
}
