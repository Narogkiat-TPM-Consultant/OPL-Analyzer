// Cushion mechanism (OPL 5-A-9 figure, redrawn). Piston moves right toward the head cover.
// cue1: E outside the cover → oil A → B → port, full flow, piston fast.
// cue2: E enters B → only path is choke C + cushion valve → flow small → piston slows (speed bar drops).
// cue3: tapered edge E + cushion valve adjustment.   cue4: return — check valve opens, oil via D into A.
{
  const c = T.cues;
  const g = H.$("s4-v-cush");
  const R = (x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, fill, stroke: o.stroke ?? C7.ink, "stroke-width": o.sw ?? 4, ...(o.rx ? { rx: o.rx } : {}), ...(o.id ? { id: o.id } : {}) }, o.parent || g);
  const oil = (x, y, w, h, sw = 3) => R(x, y, w, h, C7.oil, { sw });
  const open = (x, y, w, h) => R(x, y, w, h, C7.oil, { sw: 0 });     // erases the outline where two cavities join

  // ---- tube (cut on the left) with oil
  open(20, 142, 540, 376);
  R(20, 112, 540, 30, C7.metal);
  R(20, 518, 540, 30, C7.metal);

  // ---- head cover with its cavities: bore B, port gallery, port exit, choke C, seat, check bore, passage D
  R(560, 72, 240, 516, C7.metal, { rx: 6 });
  oil(556, 282, 124, 96);            // B
  oil(680, 240, 60, 180);            // port gallery
  oil(740, 306, 60, 48);             // port exit
  oil(800, 310, 190, 40);            // port pipe
  R(800, 294, 24, 16, C7.dark, { sw: 3 });
  R(800, 350, 24, 16, C7.dark, { sw: 3 });
  oil(556, 168, 160, 18);            // choke C
  oil(702, 186, 12, 54);             // cushion-valve seat bore
  oil(703, 420, 14, 14);             // check seat
  oil(696, 434, 28, 106);            // check-valve bore
  oil(556, 478, 140, 18);            // passage D
  open(552, 285, 14, 90); open(676, 285, 8, 90); open(736, 309, 8, 42); open(796, 313, 8, 34);
  open(552, 171, 14, 12); open(705, 182, 6, 8); open(705, 236, 6, 8);
  open(706, 416, 8, 8); open(706, 430, 8, 8); open(692, 481, 8, 12); open(552, 481, 14, 12);

  // ---- oil flows (drawn under the moving piston so the piston covers what is behind it)
  const fMain = H.c7Flow(g, "s4-v-fmain", "M 566 330 L 980 330", { w: 12, dash: "22 14", period: 36, head: [960, 330, 1010, 330], headSize: 34 });
  for (const d of ["M 462 206 Q 540 208 556 300", "M 462 454 Q 540 452 556 360"])
    H.el("path", { d, fill: "none", stroke: C7.blue, "stroke-width": 8, "stroke-dasharray": "16 12" }, fMain.g);
  H.el("path", { d: H.c7HeadD(546, 270, 557, 304, 22), fill: C7.blue }, fMain.g);
  H.el("path", { d: H.c7HeadD(546, 390, 557, 356, 22), fill: C7.blue }, fMain.g);
  const fChoke = H.c7Flow(g, "s4-v-fchoke", "M 470 177 L 708 177 L 708 330 L 980 330", { w: 6, dash: "10 10", period: 20, head: [970, 330, 1000, 330], headSize: 22 });
  const fRet = H.c7Flow(g, "s4-v-fret", "M 1000 330 L 710 330 L 710 487 L 560 487", { w: 7, dash: "14 12", period: 26, head: [600, 487, 548, 487], headSize: 26 });

  // ---- rod (width follows the piston) + moving group: piston, packings, plunger E (tapered)
  const rod = R(20, 250, 20, 160, C7.dark, { sw: 4 });
  const mov = H.el("g", { id: "s4-v-mov" }, g);
  R(40, 146, 90, 368, C7.steel, { parent: mov, rx: 4 });
  for (const x of [52, 104]) for (const y of [146, 502]) R(x, y, 14, 12, C7.ink, { sw: 0, parent: mov });
  H.el("path", { d: "M 130 286 L 218 286 L 240 300 L 240 360 L 218 374 L 130 374 Z", fill: C7.steel, stroke: C7.ink, "stroke-width": 4 }, mov);
  const taper = H.el("path", { d: "M 214 286 L 240 300 L 240 360 L 214 374", fill: "none", stroke: C7.blue, "stroke-width": 8, opacity: 0 }, mov);
  H.c7Badge(mov, 182, 330, "E");
  H.text(mov, 85, 230, "ลูกสูบ", { size: 24, anchor: "middle" });
  const push = H.el("g", { opacity: 0 }, mov);
  for (const y of [178, 482]) H.el("path", { d: H.arrowD(214, y, 146, y, 18), fill: "none", stroke: C7.blue, "stroke-width": 7 }, push);

  // ---- cushion valve (needle + lock nut) and check valve (ball + spring + blank)
  const needle = H.el("g", { id: "s4-v-needle" }, g);
  R(698, 30, 20, 142, C7.dark, { sw: 3, parent: needle });
  H.el("path", { d: "M 698 172 L 718 172 L 708 194 Z", fill: C7.dark, stroke: C7.ink, "stroke-width": 3 }, needle);
  R(690, 18, 36, 16, C7.dark, { sw: 3, parent: needle });
  R(684, 46, 48, 26, C7.metal, { sw: 4, id: "s4-v-nut" });
  H.el("line", { x1: 700, y1: 46, x2: 700, y2: 72, stroke: C7.ink, "stroke-width": 2 }, g);
  H.el("line", { x1: 716, y1: 46, x2: 716, y2: 72, stroke: C7.ink, "stroke-width": 2 }, g);
  const spring = H.el("path", { d: H.c7SpringD(710, 461, 540, 9, 6), fill: "none", stroke: C7.ink, "stroke-width": 3 }, g);
  const ball = H.el("circle", { cx: 710, cy: 447, r: 13, fill: C7.ink }, g);
  R(688, 540, 44, 56, C7.dark, { sw: 4, rx: 4 });
  H.el("line", { x1: 700, y1: 596, x2: 720, y2: 596, stroke: C7.ink, "stroke-width": 4 }, g);

  // ---- names
  const A = H.c7Badge(g, 345, 228, "A", { color: C7.blue });
  H.el("line", { x1: 624, y1: 256, x2: 624, y2: 286, stroke: C7.blue, "stroke-width": 3 }, g);
  H.c7Badge(g, 624, 236, "B", { color: C7.blue });
  const Cb = H.c7Badge(g, 604, 140, "C");
  H.c7Badge(g, 612, 530, "D");
  H.c7Label(g, 836, 36, "Cushion valve", { line: [830, 28, 728, 26] });
  H.c7Label(g, 836, 88, "Lock nut", { line: [830, 80, 734, 60] });
  H.c7Label(g, 895, 290, "Port", { anchor: "middle" });
  H.c7Label(g, 836, 452, "Check valve", { line: [830, 444, 724, 447] });
  H.c7Label(g, 836, 590, "Blank (ปลั๊กอุด)", { line: [830, 582, 734, 568] });
  H.c7Label(g, 548, 616, "Cover (ฝาท้าย)", { anchor: "end", size: 24, fill: C7.muted, line: [552, 612, 600, 588] });
  H.c7Label(g, 30, 616, "Tube", { size: 24, fill: C7.muted, line: [70, 604, 92, 548] });

  // ---- speed meter
  const meter = H.el("g", { id: "s4-v-meter" }, g);
  H.text(meter, 30, 68, "ความเร็วลูกสูบ", { size: 28 });
  R(250, 40, 290, 32, C7.paper2, { sw: 3, rx: 8, parent: meter });
  const bar = R(250, 40, 290, 32, C7.blue, { sw: 0, rx: 8, parent: meter, id: "s4-v-bar" });
  const bo = "250 56";

  // ---- red ring where E plugs B; adjustment arrow at the cushion valve
  const ring = H.el("circle", { cx: 560, cy: 330, r: 62, fill: "none", stroke: C7.red, "stroke-width": 7, opacity: 0 }, g);
  const adj = H.el("g", { opacity: 0 }, g);
  H.el("path", { d: H.dimD(672, 14, 672, 68, 14), fill: "none", stroke: C7.blue, "stroke-width": 5 }, adj);
  H.c7Label(adj, 660, 50, "ปรับ", { anchor: "end", size: 26, fill: C7.blue });

  // ================= timeline =================
  const t1 = c[0] + 0.3, t2 = c[1] + 0.5, t3 = c[2] + 2.4, t4 = c[3] + 0.3;
  const dx1 = 320, dx2 = 106, back = 250;
  const T1 = t2 - t1, T2 = t3 - t2, v1 = dx1 / T1, v2 = (2 * dx2) / T2, Tr = D - 0.5 - (t4 + 0.4);

  // phase 1 — free flow, constant (fast) speed
  tl.fromTo(mov, { x: 0 }, { x: dx1, duration: T1, ease: "none" }, b + t1);
  tl.fromTo(rod, { attr: { width: 20 } }, { attr: { width: 20 + dx1 }, duration: T1, ease: "none" }, b + t1);
  tl.fromTo(A, { x: 0 }, { x: dx1 / 2, duration: T1, ease: "none" }, b + t1);
  tl.fromTo(bar, { scaleX: 0, svgOrigin: bo }, { scaleX: 1, svgOrigin: bo, duration: 0.3 }, b + t1);
  H.c7Run(fMain, b + t1, T1 + 0.3, 240);

  // phase 2 — E plugs B: only choke C + cushion valve, speed drops then fades to the stroke end
  tl.to(mov, { x: dx1 + dx2, duration: T2, ease: "power2.out" }, b + t2);
  tl.to(rod, { attr: { width: 20 + dx1 + dx2 }, duration: T2, ease: "power2.out" }, b + t2);
  tl.to(A, { opacity: 0, duration: 0.6 }, b + t2 + 0.6);
  tl.to(bar, { scaleX: v2 / v1, svgOrigin: bo, duration: 0.25, ease: "power1.out" }, b + t2);
  tl.to(bar, { scaleX: 0, svgOrigin: bo, duration: T2 - 0.25, ease: "none" }, b + t2 + 0.25);
  tl.fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.2 }, b + t2);
  tl.fromTo(ring, { scale: 0.85, svgOrigin: "560 330" }, { scale: 1.15, svgOrigin: "560 330", duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, b + t2);
  tl.to(ring, { opacity: 0, duration: 0.3 }, b + t2 + 1.4);
  tl.fromTo(Cb, { scale: 1, svgOrigin: "604 140" }, { scale: 1.35, svgOrigin: "604 140", duration: 0.3, yoyo: true, repeat: 3 }, b + t2 + 0.6);
  H.c7Run(fChoke, b + t2 + 0.2, T2 - 0.2, 60);

  // cue3 — tapered edge, then the cushion valve is turned (needle moves in a little)
  tl.fromTo(taper, { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 5 }, b + c[2] + 0.1);
  tl.fromTo(adj, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[2] + 1.9);
  tl.fromTo(needle, { y: 0 }, { y: 5, duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut" }, b + c[2] + 1.9);
  tl.to(adj, { opacity: 0, duration: 0.3 }, b + c[3]);

  // phase 4 — return: oil from the port pushes the check valve open, flows through D into A
  tl.to(meter, { opacity: 0.3, duration: 0.4 }, b + t4);
  tl.to(ball, { attr: { cy: 463 }, duration: 0.3, ease: "power2.out" }, b + t4);
  tl.fromTo(spring, { attr: { d: H.c7SpringD(710, 461, 540, 9, 6) } }, { attr: { d: H.c7SpringD(710, 477, 540, 9, 6) }, duration: 0.3, ease: "power2.out" }, b + t4);
  H.c7Run(fRet, b + t4, D - t4 - 0.2, 150, false);
  tl.to(mov, { x: dx1 + dx2 - back, duration: Tr, ease: "power2.inOut" }, b + t4 + 0.4);
  tl.to(rod, { attr: { width: 20 + dx1 + dx2 - back }, duration: Tr, ease: "power2.inOut" }, b + t4 + 0.4);
  tl.fromTo(A, { x: (dx1 + dx2) / 2 }, { x: (dx1 + dx2 - back) / 2, duration: Tr, ease: "power2.inOut", immediateRender: false }, b + t4 + 0.4);
  tl.to(A, { opacity: 1, duration: 0.4 }, b + t4 + 0.4 + Tr * 0.5);
  tl.fromTo(push, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + t4 + 0.4 + Tr * 0.5);
}
