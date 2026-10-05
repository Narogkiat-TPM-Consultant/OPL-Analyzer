// What compressed air carries: water / oil mist / fine particles flow down the pipe (cue 1); each one lights up
// with its damage card as it is named (cues 2–4): water spots on the product, oil swells and cracks the O-ring,
// a dust grain holds the valve poppet off its seat (air leaks). Cue 5: all three together.
{
  const g = H.$("s2-v-art"), c = T.cues;
  const R = (pa, x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, rx: o.rx ?? 6, fill, stroke: P26.ink, "stroke-width": o.sw ?? 4, ...(o.id ? { id: o.id } : {}) }, pa);
  const t1 = b + c[0], t2 = b + c[1] + 0.1, t3 = b + c[2] + 0.1, t4 = b + c[3] + 0.1, t5 = b + c[4] + 0.1;

  // --- compressor: intake filter, finned head, body with an oil sump window
  const comp = H.el("g", { id: "s2-v-comp" }, g);
  R(comp, 30, 40, 70, 42, P26.card, { rx: 8 });
  for (let i = 0; i < 5; i++) H.el("line", { x1: 42 + i * 11.5, y1: 47, x2: 42 + i * 11.5, y2: 75, stroke: P26.muted, "stroke-width": 2.5 }, comp);
  R(comp, 57, 82, 16, 40, P26.dark, { rx: 2, sw: 3 });
  R(comp, 108, 72, 72, 50, P26.dark);
  for (let i = 0; i < 3; i++) H.el("line", { x1: 100, y1: 84 + i * 13, x2: 188, y2: 84 + i * 13, stroke: P26.ink, "stroke-width": 4 }, comp);
  R(comp, 26, 120, 178, 170, P26.metal, { rx: 10 });
  R(comp, 42, 222, 146, 54, "#fbe7a1", { sw: 3 });
  H.el("rect", { x: 45, y: 246, width: 140, height: 27, fill: P26.oil }, comp);
  H.text(comp, 115, 330, "คอมเพรสเซอร์", { size: 24, anchor: "middle" });
  H.text(comp, 115, 356, "(Compressor)", { size: 20, anchor: "middle", fill: P26.muted });

  // --- main pipe (cut-away) from the compressor outlet
  P26.tubeH(g, 204, 1086, 150, 216);
  const flow = P26.dash(g, "M 204 183 L 1086 183", { id: "s2-v-flow" });
  P26.dashRun([flow], b + 0.3, D - 0.3);
  const rust = H.el("g", { id: "s2-v-rust", opacity: 0 }, g);
  for (const [x, y, rx] of [[430, 153, 26], [610, 213, 30], [820, 153, 22], [960, 213, 24]]) H.el("ellipse", { cx: x, cy: y, rx, ry: 6, fill: P26.rust }, rust);

  // particles: three groups so each can be singled out
  const W = 868, ys = [166, 200, 176, 192, 170, 204, 184];
  const gw = H.el("g", { id: "s2-v-wat" }, g), go = H.el("g", { id: "s2-v-oil" }, g), gd = H.el("g", { id: "s2-v-dst" }, g);
  const wat = [], oil = [], dst = [];
  for (let i = 0; i < 7; i++) {
    wat.push(P26.drop(gw, 206, ys[i], 7));
    oil.push(P26.mist(go, 206, ys[(i + 2) % 7], 6.5));
    dst.push(P26.grain(gd, 206, ys[(i + 4) % 7], 6.5, i));
  }
  P26.stream(wat, W, b, D, 110, 0);
  P26.stream(oil, W, b, D, 110, W / 21);
  P26.stream(dst, W, b, D, 110, (2 * W) / 21);

  // --- three damage cards
  const card = (k, x, title, color, numColor) => {
    const cg = H.el("g", { id: `s2-v-c${k}` }, g);
    const rect = R(cg, x, 290, 278, 336, P26.card, { rx: 18, sw: 4, id: `s2-v-c${k}-r` });
    rect.setAttribute("stroke", P26.line);
    P26.badge(cg, x + 32, 324, k, { fill: color, color: numColor, r: 20, size: 24 });
    H.text(cg, x + 60, 333, title, { size: 24 });
    const arr = H.el("path", { d: H.arrowD(x + 139, 232, x + 139, 282, 14), fill: "none", stroke: color, "stroke-width": 6, opacity: 0 }, g);
    return { cg, rect, arr };
  };
  const C1 = card(1, 214, "น้ำ → ปนชิ้นงาน", P26.water, "#ffffff");
  const C2 = card(2, 506, "น้ำมัน → ยางเสื่อม", P26.oil, P26.ink);
  const C3 = card(3, 798, "ฝุ่น → ติดในวาล์ว", P26.rust, "#ffffff");

  // card 1: blow nozzle sprays wet air onto a film / product sheet
  const a1 = C1.cg;
  R(a1, 368, 360, 18, 52, P26.dark, { rx: 2, sw: 3 });
  H.el("path", { d: "M 362 412 L 392 412 L 382 432 L 372 432 Z", fill: P26.dark, stroke: P26.ink, "stroke-width": 3 }, a1);
  H.el("path", { d: "M 372 436 L 338 486 M 377 436 L 377 486 M 382 436 L 416 486", stroke: P26.flow, "stroke-width": 3, "stroke-dasharray": "6 6", fill: "none" }, a1);
  H.el("circle", { cx: 262, cy: 532, r: 44, fill: "#e6e1d6", stroke: P26.ink, "stroke-width": 4 }, a1);
  H.el("circle", { cx: 262, cy: 532, r: 14, fill: P26.dark, stroke: P26.ink, "stroke-width": 3 }, a1);
  R(a1, 262, 488, 214, 14, "#e6e1d6", { rx: 2, sw: 3 });
  H.text(a1, 353, 610, "ชิ้นงาน (อาหาร · ฟิล์ม)", { size: 21, fill: P26.muted, anchor: "middle" });
  const spots = [340, 377, 414].map((x) => H.el("ellipse", { cx: x, cy: 492, rx: 12, ry: 4, fill: P26.water, opacity: 0 }, a1));
  const falls = [0, 1, 2].map((i) => P26.drop(a1, 377 + (i - 1) * 26, 446, 7, { attrs: { opacity: 0 } }));

  // card 2: O-rings in their grooves around a rod (cross-section); oil makes them swell and crack
  const a2 = C2.cg;
  P26.block(a2, 526, 372, 238, 62);
  P26.block(a2, 526, 488, 238, 62);
  H.el("rect", { x: 614, y: 398, width: 60, height: 38, fill: P26.air }, a2);
  H.el("rect", { x: 614, y: 486, width: 60, height: 38, fill: P26.air }, a2);
  H.el("path", { d: "M 614 434 L 614 398 L 674 398 L 674 434 M 614 488 L 614 524 L 674 524 L 674 488", fill: "none", stroke: P26.ink, "stroke-width": 4 }, a2);
  R(a2, 520, 436, 250, 50, P26.metal, { rx: 3 });
  const ringU = H.el("circle", { cx: 644, cy: 418, r: 16, fill: "#2b2f35", stroke: P26.ink, "stroke-width": 2 }, a2);
  const ringL = H.el("circle", { cx: 644, cy: 504, r: 16, fill: "#2b2f35", stroke: P26.ink, "stroke-width": 2 }, a2);
  const oilU = H.el("rect", { x: 520, y: 436, width: 250, height: 6, fill: P26.oil, opacity: 0 }, a2);
  const oilL = H.el("rect", { x: 520, y: 480, width: 250, height: 6, fill: P26.oil, opacity: 0 }, a2);
  const cracks = H.el("path", { d: "M 631 409 L 640 415 L 636 420 L 647 428 M 657 495 L 648 502 L 653 507 L 642 515", fill: "none", stroke: "#f5f1e8", "stroke-width": 3, "stroke-linejoin": "round", opacity: 0 }, a2);
  H.text(a2, 645, 610, "Packing บวม · แตก", { size: 21, fill: P26.muted, anchor: "middle" });

  // card 3: poppet valve seat; a dust grain keeps the poppet open → air leaks through
  const a3 = C3.cg;
  H.el("rect", { x: 818, y: 372, width: 240, height: 98, fill: P26.air }, a3);
  P26.block(a3, 818, 470, 96, 92);
  P26.block(a3, 962, 470, 96, 92);
  H.el("rect", { x: 914, y: 470, width: 48, height: 92, fill: P26.air }, a3);
  const pop = H.el("g", { id: "s2-v-pop" }, a3);
  R(pop, 930, 392, 16, 62, P26.dark, { rx: 2, sw: 3 });
  R(pop, 898, 452, 80, 16, P26.dark, { rx: 3, sw: 3 });
  const grit = P26.grain(a3, 908, 465, 8, 2, { attrs: { opacity: 0 } });
  const leak = H.el("path", { id: "s2-v-leak", d: "M 938 474 L 938 556", fill: "none", stroke: P26.flow, "stroke-width": 6, "stroke-dasharray": "12 10", opacity: 0 }, a3);
  H.text(a3, 937, 610, "ปิดไม่สนิท → ลมรั่ว", { size: 21, fill: P26.muted, anchor: "middle" });

  // --- cue 1: everything flows; cards wait dimmed
  for (const C of [C1, C2, C3]) tl.fromTo(C.cg, { opacity: 0.3 }, { opacity: 0.3, duration: 0.01 }, b);
  tl.fromTo(pop, { y: -26 }, { y: -26, duration: 0.01 }, b);

  // focus helper: one particle group bright, the others faint; its card lights up with a blue frame
  const groups = [gw, go, gd], st = [1, 1, 1];
  const focus = (k, t) => groups.forEach((gr, i) => {
    const to = k < 0 || i === k ? 1 : 0.18;
    if (to !== st[i]) tl.fromTo(gr, { opacity: st[i] }, { opacity: to, duration: 0.3, immediateRender: false }, t);
    st[i] = to;
  });
  // fade in → move → fade out (seekable, no keyframes)
  const travel = (el, t, moves) => {
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.15 }, t);
    let tt = t, x = 0, y = 0;
    moves.forEach(([dx, dy, d], i) => {
      tl.fromTo(el, { x, y }, { x: x + dx, y: y + dy, duration: d, ease: "power1.inOut", immediateRender: i === 0 }, tt);
      x += dx; y += dy; tt += d;
    });
    tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, tt - 0.15);
  };
  const lightCard = (C, t) => {
    tl.fromTo(C.cg, { opacity: 0.3 }, { opacity: 1, duration: 0.35, immediateRender: false }, t);
    tl.fromTo(C.rect, { attr: { stroke: P26.line } }, { attr: { stroke: P26.pipe }, duration: 0.25 }, t);
    tl.fromTo(C.arr, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.1);
  };
  const unframe = (C, t) => tl.fromTo(C.rect, { attr: { stroke: P26.pipe } }, { attr: { stroke: P26.line }, duration: 0.25, immediateRender: false }, t);

  // cue 2: water → drops fall from the nozzle onto the sheet
  focus(0, t2); lightCard(C1, t2);
  falls.forEach((d, i) => tl.fromTo(d, { opacity: 1, y: 0 }, { y: 40, opacity: 0, duration: 0.55, ease: "power2.in", repeat: 2, repeatDelay: 0.25 }, t2 + 0.4 + i * 0.27));
  spots.forEach((s, i) => tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t2 + 0.95 + i * 0.3));

  // cue 3: oil mist rises from the sump into the outlet; the oil film reaches the O-rings, they swell and crack
  unframe(C1, t3); focus(1, t3); lightCard(C2, t3);
  const puffs = [0, 1, 2, 3, 4].map((i) => P26.mist(comp, 80 + i * 20, 244, 6, { attrs: { opacity: 0 } }));
  puffs.forEach((m, i) => travel(m, t3 + 0.2 + i * 0.22, [[196 - (80 + i * 20), -62, 0.9]]));
  tl.fromTo([oilU, oilL], { opacity: 0, scaleX: 0, svgOrigin: "520 461" }, { opacity: 1, scaleX: 1, svgOrigin: "520 461", duration: 0.9, ease: "power1.out" }, t3 + 0.6);
  tl.fromTo(ringU, { scale: 1, attr: { fill: "#2b2f35" }, svgOrigin: "644 418" }, { scale: 1.22, attr: { fill: "#6b5233" }, svgOrigin: "644 418", duration: 0.8 }, t3 + 1.4);
  tl.fromTo(ringL, { scale: 1, attr: { fill: "#2b2f35" }, svgOrigin: "644 504" }, { scale: 1.22, attr: { fill: "#6b5233" }, svgOrigin: "644 504", duration: 0.8 }, t3 + 1.4);
  tl.fromTo(cracks, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 2.1);

  // cue 4: dust comes in through the intake filter and rust flakes off the pipe; a grain sticks on the valve seat
  unframe(C2, t4); focus(2, t4); lightCard(C3, t4);
  const dusts = [0, 1, 2, 3].map((i) => P26.grain(comp, 14, 30 + i * 6, 5, i, { attrs: { opacity: 0 } }));
  dusts.forEach((d, i) => travel(d, t4 + 0.2 + i * 0.25, [[50 + i * 4, 34 - i * 6, 0.5], [0, 56, 0.5]]));
  tl.fromTo(rust, { opacity: 0 }, { opacity: 1, duration: 0.5 }, t4 + 0.8);
  tl.fromTo(grit, { opacity: 0, x: -40, y: -70 }, { opacity: 1, x: 0, y: 0, duration: 0.6, ease: "power2.in" }, t4 + 0.6);
  tl.fromTo(pop, { y: -26 }, { y: -10, duration: 0.35, ease: "power2.in", immediateRender: false }, t4 + 1.2);
  tl.fromTo(leak, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t4 + 1.55);
  tl.fromTo(leak, { strokeDashoffset: 0 }, { strokeDashoffset: -22 * Math.round((D - c[3]) * 3), duration: D - c[3] - 1.7, ease: "none", immediateRender: false }, t4 + 1.55);

  // cue 5: all three at once
  unframe(C3, t5); focus(-1, t5);
}
