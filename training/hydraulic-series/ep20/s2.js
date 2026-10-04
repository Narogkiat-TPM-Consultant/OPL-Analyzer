// Structure (OPL 5-C-10 figure, redrawn as a section, rod to the right as on p.31).
// cue1 (c0): oil in at the cap port → piston pushes the rod out.
// cue2 (c1): Piston + Rod labelled, pressure arrows on the piston, rod goes back and forth.
// cue3 (c2): U packing flashes; Dust seal scrapes dust off the rod as it retracts.
// cue4 (c3): retract: fast, then the cushion ring enters the cap bore → slows; cushion valve adjusts it.
{
  const c = T.cues;
  const g = H.$("s2-v-art");
  const R = (par, x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: o.stroke ?? C20.ink, "stroke-width": o.sw ?? 4, ...(o.rx ? { rx: o.rx } : {}) }, par);

  // pressure pipes to the ports
  for (const x of [70, 640]) H.el("path", { d: `M ${x} 150 L ${x} 34`, stroke: C20.blue, "stroke-width": 16, fill: "none" }, g);

  // tube: oil + walls
  R(g, 150, 186, 450, 228, C20.oilBg, { sw: 0 });
  R(g, 150, 162, 450, 24, C20.metal);
  R(g, 150, 414, 450, 24, C20.metal);

  // cap (head) cover: port passage → cushion bore; by-pass through the cushion (needle) valve
  R(g, 40, 150, 110, 300, C20.metal, { rx: 6 });
  H.el("path", { d: "M 62 150 L 78 150 L 78 208 L 150 208 L 150 222 L 78 222 L 78 292 L 100 292 L 100 268 L 150 268 L 150 332 L 100 332 L 100 308 L 62 308 Z", fill: C20.oilBg, stroke: C20.ink, "stroke-width": 2.5 }, g);
  H.el("rect", { x: 146, y: 209, width: 8, height: 12, fill: C20.oilBg }, g);
  H.el("rect", { x: 146, y: 269, width: 8, height: 62, fill: C20.oilBg }, g);
  const needle = H.el("g", { id: "s2-v-needle" }, g);
  H.el("path", { d: "M 119 140 L 131 140 L 131 202 L 125 214 L 119 202 Z", fill: C20.dark, stroke: C20.ink, "stroke-width": 2.5 }, needle);
  R(needle, 113, 112, 24, 26, C20.metal, { sw: 3, rx: 3 });
  H.el("line", { x1: 125, y1: 114, x2: 125, y2: 124, stroke: C20.ink, "stroke-width": 3 }, needle);
  R(g, 108, 136, 34, 14, C20.dark, { sw: 3 });   // lock nut

  // rod cover: port passage, rod packing, dust seal at the outer face
  R(g, 600, 150, 120, 300, C20.metal, { rx: 6 });
  R(g, 600, 276, 120, 48, C20.paper, { sw: 0 });
  H.el("path", { d: "M 632 150 L 648 150 L 648 206 L 600 206 L 600 190 L 632 190 Z", fill: C20.oilBg, stroke: C20.ink, "stroke-width": 2.5 }, g);
  H.el("rect", { x: 596, y: 191, width: 8, height: 14, fill: C20.oilBg }, g);
  for (const x of [636, 664]) for (const y of [262, 324]) R(g, x, y, 14, 14, C20.rubber, { sw: 0 });
  const seal = [
    H.el("path", { d: "M 704 256 L 720 256 L 729 276 L 704 276 Z", fill: C20.rubber, stroke: C20.ink, "stroke-width": 2 }, g),
    H.el("path", { d: "M 704 344 L 720 344 L 729 324 L 704 324 Z", fill: C20.rubber, stroke: C20.ink, "stroke-width": 2 }, g),
  ];

  // moving part (drawn at px = 152, retracted): rod + eye, cushion ring, piston with U packings
  const px = 152;
  const mov = H.el("g", { id: "s2-v-mov" }, g);
  R(mov, px + 40, 276, 560, 48, C20.steel);
  H.el("rect", { x: px + 42, y: 283, width: 556, height: 7, fill: "#ffffff", opacity: 0.6 }, mov);
  R(mov, px + 600, 288, 18, 24, C20.dark, { sw: 3.5 });
  H.el("circle", { cx: px + 648, cy: 300, r: 26, fill: C20.dark, stroke: C20.ink, "stroke-width": 4 }, mov);
  H.el("circle", { cx: px + 648, cy: 300, r: 9, fill: C20.paper, stroke: C20.ink, "stroke-width": 3 }, mov);
  const ring = R(mov, px - 42, 272, 46, 56, C20.dark, { rx: 4 });
  R(mov, px, 188, 80, 224, C20.steel, { rx: 4 });
  const cupD = (x, y, open) => open < 0
    ? `M ${x + 18} ${y} L ${x + 8} ${y} Q ${x} ${y} ${x} ${y + 7} Q ${x} ${y + 14} ${x + 8} ${y + 14} L ${x + 18} ${y + 14}`
    : `M ${x} ${y} L ${x + 10} ${y} Q ${x + 18} ${y} ${x + 18} ${y + 7} Q ${x + 18} ${y + 14} ${x + 10} ${y + 14} L ${x} ${y + 14}`;
  const cups = [];
  for (const y of [192, 394]) {
    cups.push(H.el("path", { d: cupD(px + 12, y, -1), fill: "none", stroke: C20.ink, "stroke-width": 5 }, mov));
    cups.push(H.el("path", { d: cupD(px + 50, y, 1), fill: "none", stroke: C20.ink, "stroke-width": 5 }, mov));
  }
  const push = H.el("g", { opacity: 0 }, mov);
  for (const y of [236, 364]) H.el("path", { d: H.arrowD(px - 78, y, px - 8, y, 18), fill: "none", stroke: C20.blue, "stroke-width": 6 }, push);
  const Lp = H.el("g", { opacity: 0 }, mov), Lu = H.el("g", { opacity: 0 }, mov);
  H.c20Label(Lp, px + 64, 506, "Piston (ลูกสูบ)", { line: [px + 60, 494, px + 40, 402] });
  H.c20Label(Lu, px + 64, 124, "U packing", { line: [px + 60, 114, px + 22, 196] });

  // static labels
  const Lr = H.el("g", { opacity: 0 }, g), Ls = H.el("g", { opacity: 0 }, g), Lc = H.el("g", { opacity: 0 }, g), Lv = H.el("g", { opacity: 0 }, g);
  H.c20Label(Lr, 760, 124, "Rod (ก้านสูบ)", { anchor: "middle", line: [742, 134, 742, 278] });
  H.c20Label(Ls, 748, 428, "Dust seal (กันฝุ่น)", { line: [744, 416, 722, 338] });
  H.c20Label(Lc, 22, 604, "Cushion ring", { line: [96, 582, 124, 326] });
  H.c20Label(Lv, 158, 64, "Cushion valve", { line: [154, 58, 137, 116] });
  const adj = H.el("g", { opacity: 0 }, g);
  const ra = (d) => (d * Math.PI) / 180, A = (d) => [125 + 30 * Math.cos(ra(d)), 125 + 30 * Math.sin(ra(d))];
  H.el("path", { d: H.arcD(125, 125, 30, 150, 268), fill: "none", stroke: C20.blue, "stroke-width": 5 }, adj);
  H.el("path", { d: H.c20HeadD(...A(258), ...A(282), 16), fill: C20.blue }, adj);

  // dust on the rod (outside the seal)
  const DX = [752, 768, 784, 800, 816];
  const dust = DX.map((x, i) => H.el("circle", { cx: x, cy: 270 + (i % 2), r: 5, fill: C20.grime, opacity: 0 }, g));

  // oil flows
  const F = (id, d, white) => H.c20Flow(g, id, d, white ? { w: 5 } : { color: C20.blue, w: 5, dash: "9 11", period: 20 });
  const inCapP = F("s2-v-f1", "M 70 40 L 70 148", 1), inCapA = F("s2-v-f2", "M 70 156 L 70 300 L 114 300");
  const outRodA = F("s2-v-f3", "M 604 198 L 640 198 L 640 156"), outRodP = F("s2-v-f4", "M 640 148 L 640 40", 1);
  const inRodP = F("s2-v-f5", "M 640 40 L 640 148", 1), inRodA = F("s2-v-f6", "M 640 156 L 640 198 L 604 198");
  const outCapA = F("s2-v-f7", "M 114 300 L 70 300 L 70 156"), outCapP = F("s2-v-f8", "M 70 148 L 70 40", 1);
  const byp = F("s2-v-f9", "M 150 215 L 70 215 L 70 156");

  // cue1: stroke out
  const t0 = c[0] + 0.5, Te = 2.4;
  tl.fromTo(mov, { x: 0 }, { x: 240, duration: Te, ease: "power2.inOut" }, b + t0);
  for (const f of [inCapP, inCapA, outRodA, outRodP]) H.c20Run(f, b + t0, Te, 110);

  // cue2: piston + rod, pressure arrows, back and forth
  tl.fromTo([Lp, Lr], { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[1] + 0.1);
  tl.fromTo(push, { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3 }, b + c[1] + 0.3);
  tl.to(mov, { x: 160, duration: 0.8, ease: "power1.inOut" }, b + c[1] + 2.2);
  tl.to(mov, { x: 240, duration: 0.8, ease: "power1.inOut" }, b + c[1] + 3.0);

  // cue3: U packing flashes; dust seal scrapes the dust as the rod retracts 90
  tl.fromTo(Lu, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[2] + 0.1);
  tl.fromTo(cups, { attr: { stroke: C20.ink } }, { attr: { stroke: C20.blue }, duration: 0.25, yoyo: true, repeat: 5 }, b + c[2] + 0.3);
  const td = c[2] + 1.6, dd = 90, Td = 1.2, v = dd / Td, lip = 734;
  tl.fromTo(Ls, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + td - 0.5);
  tl.fromTo(seal, { attr: { fill: C20.rubber } }, { attr: { fill: C20.blue }, duration: 0.25, yoyo: true, repeat: 3 }, b + td - 0.4);
  tl.fromTo(dust, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.05 }, b + td - 0.4);
  tl.to(mov, { x: 240 - dd, duration: Td, ease: "none" }, b + td);
  DX.forEach((x, i) => {
    const run = (x - lip) / v;
    tl.to(dust[i], { x: lip - x, duration: run, ease: "none" }, b + td);
    tl.to(dust[i], { y: 70 + 8 * i, opacity: 0, duration: 0.5, ease: "power2.in" }, b + td + run);
  });

  // cue4: retract fast, then the cushion ring enters the cap bore → slow; cushion valve adjusts
  const t3 = c[3] + 0.2, Tf = 0.8, Ts = 1.5;
  tl.to(mov, { x: 40, duration: Tf, ease: "none" }, b + t3);
  tl.to(mov, { x: 0, duration: Ts, ease: "power2.out" }, b + t3 + Tf);
  for (const f of [inRodP, inRodA]) H.c20Run(f, b + t3, Tf + Ts, 110);
  for (const f of [outCapA, outCapP]) H.c20Run(f, b + t3, Tf, 140);
  H.c20Run(byp, b + t3 + Tf, Ts, 40);
  tl.fromTo(Lc, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + t3 + Tf);
  tl.fromTo(ring, { attr: { fill: C20.dark } }, { attr: { fill: C20.blue }, duration: 0.3, yoyo: true, repeat: 3 }, b + t3 + Tf);
  tl.fromTo([Lv, adj], { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + t3 + Tf + Ts);
  tl.fromTo(needle, { y: 0 }, { y: 5, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" }, b + t3 + Tf + Ts + 0.3);
}
