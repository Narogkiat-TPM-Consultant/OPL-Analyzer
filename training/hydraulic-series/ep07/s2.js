// Structure of a hydraulic cylinder (OPL 5-A-8 figure, redrawn as a section).
// cue1: tube / piston / rod — oil in on the rod side pushes the piston to the head cover.
// cue2: rod packing + piston packing light up.  cue3: air vent + cushion set (throttle + check valve).
{
  const c = T.cues;
  const g = H.$("s2-v-cyl");
  const R = (x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: o.stroke ?? C7.ink, "stroke-width": o.sw ?? 4, ...(o.rx ? { rx: o.rx } : {}), ...(o.id ? { id: o.id } : {}), ...(o.cls ? { class: o.cls } : {}) }, o.parent || g);

  // ports + pipes (in: rod-side cover, out: head cover)
  H.el("path", { d: "M 90 168 L 90 64", stroke: C7.blue, "stroke-width": 16, fill: "none" }, g);
  H.el("path", { d: "M 793 168 L 793 64", stroke: C7.blue, "stroke-width": 16, fill: "none" }, g);
  H.el("path", { d: H.c7HeadD(90, 22, 90, 62, 26), fill: C7.blue }, g);
  H.el("path", { d: H.c7HeadD(793, 62, 793, 22, 26), fill: C7.blue }, g);
  H.text(g, 112, 56, "น้ำมันเข้า", { size: 24, fill: C7.blue });
  H.text(g, 771, 56, "ออก", { size: 24, fill: C7.blue, anchor: "end" });
  const fin = H.c7Flow(g, "s2-v-fin", "M 90 70 L 90 166", { color: "#ffffff", w: 5, dash: "10 14", period: 24 });
  const fout = H.c7Flow(g, "s2-v-fout", "M 793 166 L 793 70", { color: "#ffffff", w: 5, dash: "10 14", period: 24 });

  // tube with oil
  R(130, 204, 580, 232, C7.oil, { sw: 0 });
  R(130, 180, 580, 24, C7.metal);
  R(130, 436, 580, 24, C7.metal);

  // rod (width follows the piston), then the rod cover over it
  const rod = R(20, 292, 280, 56, C7.dark, { sw: 4, id: "s2-v-rod" });
  R(50, 168, 80, 304, C7.metal, { rx: 6 });
  R(84, 168, 12, 50, C7.oil, { sw: 0 });                 // inlet passage
  R(84, 206, 52, 12, C7.oil, { sw: 0 });
  const packs = [];
  for (const x of [66, 98]) for (const y of [280, 348]) packs.push(R(x, y, 14, 12, C7.ink, { sw: 0 }));

  // head cover: bore B + port channel, air vent, cushion valve (throttle) + check valve below
  R(710, 168, 140, 304, C7.metal, { rx: 6 });
  H.el("path", { d: "M 710 294 L 780 294 L 780 168 L 806 168 L 806 346 L 710 346 Z", fill: C7.oil, stroke: C7.ink, "stroke-width": 3 }, g);
  R(706, 297, 8, 46, C7.oil, { sw: 0 });
  H.el("path", { d: "M 718 168 L 730 168 L 730 222 L 706 222 L 706 210 L 718 210 Z", fill: C7.oil, stroke: C7.ink, "stroke-width": 2 }, g);
  R(712, 150, 24, 18, C7.dark, { sw: 3 });               // air vent screw
  R(718, 140, 12, 12, C7.dark, { sw: 3 });
  R(706, 396, 126, 12, C7.oil, { sw: 2 });               // passage from chamber A
  for (const x of [742, 814]) {
    R(x, 384, 16, 88, C7.oil, { sw: 2 });
    H.el("path", { d: H.c7SpringD(x + 8, 414, 470, 6, 5), fill: "none", stroke: C7.ink, "stroke-width": 2.5 }, g);
    R(x - 6, 472, 28, 16, C7.dark, { sw: 3 });
  }
  R(745, 392, 10, 22, C7.dark, { sw: 2 });               // throttle needle
  H.el("circle", { cx: 822, cy: 402, r: 8, fill: C7.ink }, g); // check ball

  // moving part: piston (+ packings) and cushion plunger E
  const mov = H.el("g", { id: "s2-v-mov" }, g);
  R(300, 206, 90, 228, C7.steel, { parent: mov, rx: 4 });
  const ppacks = [];
  for (const x of [312, 364]) for (const y of [206, 422]) ppacks.push(R(x, y, 14, 12, C7.ink, { sw: 0, parent: mov }));
  H.el("path", { d: "M 390 296 L 436 296 L 450 304 L 450 336 L 436 344 L 390 344 Z", fill: C7.steel, stroke: C7.ink, "stroke-width": 4 }, mov);
  H.text(mov, 345, 270, "Piston", { size: 22, anchor: "middle" });
  H.text(mov, 345, 386, "ลูกสูบ", { size: 22, anchor: "middle" });
  const push = H.el("g", { opacity: 0 }, mov);
  for (const y of [240, 400]) H.el("path", { d: H.arrowD(232, y, 290, y, 16), fill: "none", stroke: C7.blue, "stroke-width": 6 }, push);

  // labels by cue
  const L1 = H.el("g", { opacity: 0 }, g), L2 = H.el("g", { opacity: 0 }, g), L3 = H.el("g", { opacity: 0 }, g);
  H.c7Label(L1, 330, 140, "Cylinder tube (กระบอก)", { anchor: "middle", line: [330, 150, 330, 182] });
  H.c7Label(L1, 20, 560, "Rod (ก้านสูบ)", { line: [38, 534, 38, 348] });
  H.c7Label(L2, 210, 520, "Rod packing", { line: [206, 510, 106, 361] });
  H.c7Label(L2, 560, 528, "Piston packing", { anchor: "middle", line: [585, 502, 636, 435] });
  H.c7Label(L3, 690, 112, "Air vent (ไล่ลม)", { anchor: "end", line: [696, 106, 722, 140] });
  H.c7Label(L3, 870, 516, "Throttle valve", { line: [864, 508, 750, 489] });
  H.c7Label(L3, 870, 546, "(= Cushion valve)", { size: 22 });
  H.c7Label(L3, 870, 600, "Check valve", { line: [864, 592, 822, 489] });
  const box = H.el("g", { opacity: 0 }, g);
  H.el("rect", { x: 698, y: 280, width: 162, height: 222, rx: 16, fill: "rgba(31,95,191,0.07)", stroke: C7.blue, "stroke-width": 5, "stroke-dasharray": "14 10" }, box);
  H.c7Label(box, 868, 274, "ชุด Cushion", { size: 28, fill: C7.blue });

  // cue1: labels, then the stroke (oil in → piston to the head cover)
  const ts = c[0] + 0.6, Ts = 2.8, dx = 316;
  tl.fromTo(L1, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[0] + 0.1);
  tl.fromTo(mov, { x: 0 }, { x: dx, duration: Ts, ease: "power2.inOut" }, b + ts);
  tl.fromTo(rod, { attr: { width: 280 } }, { attr: { width: 280 + dx }, duration: Ts, ease: "power2.inOut" }, b + ts);
  tl.fromTo(push, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + ts);
  tl.to(push, { opacity: 0, duration: 0.3 }, b + ts + Ts);
  H.c7Run(fin, b + ts, Ts, 110);
  H.c7Run(fout, b + ts, Ts, 110);

  // cue2: packings
  tl.fromTo(L2, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[1] + 0.1);
  tl.fromTo([...packs, ...ppacks], { attr: { fill: C7.ink } }, { attr: { fill: C7.blue }, duration: 0.25, yoyo: true, repeat: 5 }, b + c[1] + 0.3);

  // cue3: air vent + cushion set
  tl.fromTo(L3, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[2] + 0.1);
  tl.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[2] + 1.4);
}
