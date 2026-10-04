// Disadvantages: four tiles light up with the numbered points (cue 2–5) and show the problem moving.
{
  const P = "s3-v-grid", c = T.cues, p = T.points;
  const L = (k) => H.segLen(c, D, k);
  const R = (pa, x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, rx: o.rx ?? 4, fill, stroke: E2.ink, "stroke-width": o.sw ?? 4 }, pa);
  const t1 = H.tile(P, "s3-v-t1", 12, 12, 528, 300, 1, "ท่อซับซ้อน → รั่ว (Oil leak)");
  const t2 = H.tile(P, "s3-v-t2", 560, 12, 528, 300, 2, "น้ำมันติดไฟได้ (Flammable)");
  const t3 = H.tile(P, "s3-v-t3", 12, 328, 528, 300, 3, "สูญเสียพลังงานมาก");
  const t4 = H.tile(P, "s3-v-t4", 560, 328, 528, 300, 4, "อุณหภูมิน้ำมัน → ความเร็ว");
  [t1, t2, t3, t4].forEach((t, i, a) => H.tileOn(t, b + p[i], i < a.length - 1 ? b + p[i + 1] : null));

  // ① many pipes and joints → a joint leaks, oil drips and spreads on the floor
  const pipe = (d) => H.el("path", { d, fill: "none", stroke: E2.blue, "stroke-width": 10, "stroke-linejoin": "round" }, t1.g);
  pipe("M 106 170 L 520 170");
  for (const x of [180, 300, 420]) pipe(`M ${x} 170 L ${x} 128`);
  pipe("M 240 170 L 240 214");
  R(t1.g, 36, 140, 70, 60, E2.metal, { rx: 6 });
  H.text(t1.g, 71, 179, "ปั๊ม", { size: 22, anchor: "middle" });
  for (const x of [180, 300, 420]) {
    R(t1.g, x - 30, 90, 60, 38, E2.card, { rx: 3, sw: 3 });
    H.el("path", { d: `M ${x - 10} 90 L ${x - 10} 128 M ${x + 10} 90 L ${x + 10} 128`, stroke: E2.ink, "stroke-width": 2.5 }, t1.g);
  }
  R(t1.g, 200, 214, 80, 34, E2.tube, { rx: 4, sw: 3 });
  for (const [x, y] of [[180, 170], [300, 170], [420, 170], [240, 170], [180, 138], [300, 138], [420, 138], [240, 206]]) R(t1.g, x - 7, y - 7, 14, 14, E2.ink, { rx: 2, sw: 0 });
  R(t1.g, 448, 156, 26, 28, E2.dark, { rx: 3, sw: 3 });
  const ring = H.el("circle", { cx: 461, cy: 170, r: 28, fill: "none", stroke: E2.red, "stroke-width": 5, opacity: 0 }, t1.g);
  const puddle = H.el("ellipse", { cx: 461, cy: 294, rx: 62, ry: 9, fill: E2.oil, stroke: E2.ink, "stroke-width": 3 }, t1.g);
  const drops = [0, 1, 2].map(() => H.el("path", { d: H.dropD(461, 200, 8), fill: E2.oil, stroke: E2.ink, "stroke-width": 2.5, opacity: 0 }, t1.g));
  const messy = H.text(t1.g, 384, 300, "รั่วแล้วเลอะเทอะ", { size: 22, anchor: "end" });
  const a1 = b + c[1], n1 = Math.max(1, Math.floor((L(2) - 0.6) / 1.2));
  tl.fromTo(ring, { opacity: 0, scale: 0.7, svgOrigin: "461 170" }, { opacity: 1, scale: 1, svgOrigin: "461 170", duration: 0.3 }, a1 + 0.4);
  tl.fromTo(ring, { scale: 1, svgOrigin: "461 170" }, { scale: 1.25, svgOrigin: "461 170", duration: 0.35, yoyo: true, repeat: 5, ease: "sine.inOut", immediateRender: false }, a1 + 0.7);
  tl.fromTo(drops, { y: 0, opacity: 1 }, { y: 88, opacity: 0.4, duration: 0.55, ease: "power1.in", stagger: 0.4, repeat: n1, repeatDelay: 0.65 }, a1 + 0.6);
  tl.fromTo(puddle, { scaleX: 0.15, scaleY: 0.5, svgOrigin: "461 294" }, { scaleX: 1, scaleY: 1, svgOrigin: "461 294", duration: Math.max(1.5, L(2) - 0.5), ease: "none" }, a1 + 1.0);
  tl.fromTo(messy, { opacity: 0 }, { opacity: 1, duration: 0.3 }, a1 + 0.55 * L(2));

  // ② ordinary oil burns → fire prevention; fire-resistant fluid is very expensive
  R(t2.g, 640, 244, 150, 20, E2.oil, { rx: 4 });
  const flame = H.el("g", { id: "s3-v-flame" }, t2.g);
  H.el("path", { d: H.flameD(715, 244, 50), fill: E2.red }, flame);
  H.el("path", { d: H.flameD(715, 244, 26), fill: E2.yellow }, flame);
  H.text(t2.g, 715, 294, "ต้องป้องกันไฟ", { size: 22, anchor: "middle" });
  const drum = H.el("g", { id: "s3-v-drum" }, t2.g);
  R(drum, 900, 140, 96, 122, E2.tube, { rx: 8 });
  H.el("ellipse", { cx: 948, cy: 140, rx: 48, ry: 10, fill: E2.tube, stroke: E2.ink, "stroke-width": 4 }, drum);
  for (const y of [182, 222]) H.el("line", { x1: 902, y1: y, x2: 994, y2: y, stroke: E2.ink, "stroke-width": 3 }, drum);
  R(drum, 1004, 110, 72, 38, E2.card, { rx: 6, sw: 3 });
  H.text(drum, 1040, 137, "฿฿฿", { size: 24, anchor: "middle" });
  H.text(drum, 948, 294, "น้ำมันทนไฟ", { size: 22, anchor: "middle" });
  const a2 = b + c[2], n2 = Math.max(2, Math.round((D - c[2] - 0.8) / 0.36));
  tl.fromTo(flame, { scale: 0, svgOrigin: "715 244" }, { scale: 1, svgOrigin: "715 244", duration: 0.4, ease: "back.out(1.6)" }, a2 + 0.3);
  tl.fromTo(flame, { scaleY: 1, scaleX: 1, svgOrigin: "715 244" }, { scaleY: 1.1, scaleX: 0.93, svgOrigin: "715 244", duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: n2 - (n2 % 2), immediateRender: false }, a2 + 0.7);
  tl.fromTo(drum, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, a2 + 0.58 * L(3));

  // ③ energy in → part becomes work, a large part becomes heat
  R(t3.g, 36, 470, 84, 76, E2.metal, { rx: 6 });
  H.text(t3.g, 78, 520, "M", { size: 34, anchor: "middle" });
  const bIn = H.el("rect", { x: 120, y: 474, width: 112, height: 68, fill: E2.blue }, t3.g);
  const bWork = H.el("path", { d: "M 230 508 L 466 508 L 466 494 L 506 525 L 466 556 L 466 542 L 230 542 Z", fill: E2.blue }, t3.g);
  const bHeat = H.el("path", { d: "M 230 474 C 330 474 400 462 400 420 L 400 412 L 434 412 L 434 420 C 434 482 340 508 230 508 Z", fill: E2.yellow }, t3.g);
  const waves = [400, 417, 434].map((x) => H.el("path", { d: `M ${x} 402 q 7 -6 0 -12 q -7 -6 0 -12 q 7 -6 0 -12`, fill: "none", stroke: "#c98a00", "stroke-width": 4, opacity: 0 }, t3.g));
  H.text(t3.g, 388, 424, "ความร้อน (Heat)", { size: 22, anchor: "end" });
  H.text(t3.g, 506, 584, "งาน (Work)", { size: 22, anchor: "end" });
  H.text(t3.g, 176, 584, "พลังงานเข้า", { size: 22, anchor: "middle" });
  const a3 = b + c[3], n3 = Math.max(1, Math.floor((D - c[3] - 1.4) / 0.9));
  tl.fromTo(bIn, { scaleX: 0, svgOrigin: "120 508" }, { scaleX: 1, svgOrigin: "120 508", duration: 0.45, ease: "power2.out" }, a3 + 0.3);
  tl.fromTo(bWork, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" }, a3 + 0.75);
  tl.fromTo(bHeat, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, a3 + 1.0);
  tl.fromTo(waves, { y: 0, opacity: 0.9 }, { y: -14, opacity: 0, duration: 0.9, ease: "none", stagger: 0.15, repeat: n3 }, a3 + 1.3);

  // ④ oil warms from start to end of work → viscosity changes → machine speed is not constant
  R(t4.g, 606, 404, 30, 166, E2.card, { rx: 15 });
  H.el("circle", { cx: 621, cy: 584, r: 24, fill: E2.blue, stroke: E2.ink, "stroke-width": 4 }, t4.g);
  const liq = H.el("rect", { x: 614, y: 548, width: 14, height: 40, fill: E2.blue }, t4.g);
  for (const y of [420, 460, 500, 540]) H.el("line", { x1: 636, y1: y, x2: 648, y2: y, stroke: E2.ink, "stroke-width": 3 }, t4.g);
  H.text(t4.g, 656, 428, "ท้ายงาน", { size: 22 });
  H.text(t4.g, 656, 548, "เริ่มงาน", { size: 22 });
  const drop = H.el("path", { d: H.dropD(790, 486, 30), fill: E2.oil, stroke: E2.ink, "stroke-width": 4 }, t4.g);
  H.text(t4.g, 790, 562, "ความหนืด", { size: 22, anchor: "middle" });
  H.text(t4.g, 790, 590, "เปลี่ยน", { size: 22, anchor: "middle" });
  H.el("path", { d: H.arcD(960, 540, 86, 180, 360), fill: "none", stroke: E2.ink, "stroke-width": 6 }, t4.g);
  for (let a = 195; a <= 345; a += 30) {
    const r = (a * Math.PI) / 180;
    H.el("line", { x1: H.f(960 + 86 * Math.cos(r)), y1: H.f(540 + 86 * Math.sin(r)), x2: H.f(960 + 70 * Math.cos(r)), y2: H.f(540 + 70 * Math.sin(r)), stroke: E2.ink, "stroke-width": 4 }, t4.g);
  }
  const needle = H.el("g", { id: "s3-v-needle" }, t4.g);
  H.el("path", { d: "M 954 540 L 960 474 L 966 540 Z", fill: E2.ink }, needle);
  H.el("circle", { cx: 960, cy: 540, r: 10, fill: E2.ink }, t4.g);
  H.text(t4.g, 960, 584, "ความเร็ว (Speed)", { size: 22, anchor: "middle" });
  const a4 = b + c[4] + 0.4, rise = Math.min(2.8, L(5) - 0.4);
  tl.fromTo(liq, { attr: { y: 548, height: 40 } }, { attr: { y: 420, height: 168 }, duration: rise, ease: "power1.inOut" }, a4);
  tl.fromTo(drop, { scaleX: 1, scaleY: 1, svgOrigin: "790 516" }, { scaleX: 1.18, scaleY: 0.8, svgOrigin: "790 516", duration: rise, ease: "power1.inOut" }, a4);
  const wob = [-26, 20, -14, 24, -8];
  tl.fromTo(needle, { rotation: 0, svgOrigin: "960 540" }, { rotation: wob[0], svgOrigin: "960 540", duration: rise / wob.length, ease: "sine.inOut" }, a4);
  wob.slice(1).forEach((r, i) => tl.to(needle, { rotation: r, svgOrigin: "960 540", duration: rise / wob.length, ease: "sine.inOut" }, a4 + (i + 1) * (rise / wob.length)));
}
