// Gas laws: Boyle (push the piston → volume ½, gauge P → 2P) then Charles (heat → volume grows, pressure constant).
{
  const c = T.cues, A = "s2-v-art";
  const pill = (pa, x, y, w, txt, sub) => {
    H.el("rect", { x, y, width: w, height: 42, rx: 21, fill: PN.blue }, pa);
    H.text(pa, x + 20, y + 30, txt, { size: 24, fill: "#ffffff" });
    if (sub) H.text(pa, x + w + 16, y + 30, sub, { size: 24, fill: PN.muted });
  };
  const dots = (pa, pts) => pts.map(([x, y]) => H.el("circle", { cx: x, cy: y, r: 8, fill: PN.dash }, pa));

  // ---- Boyle's law (top band) ----
  const bo = H.el("g", { id: "s2-v-bo" }, A);
  pill(bo, 16, 12, 330, "กฎของบอยล์ (Boyle's law)", "อุณหภูมิคงที่");
  // gauge
  pnR(bo, 194, 146, 12, 18, PN.dark, { rx: 2, sw: 3 });
  H.el("circle", { cx: 200, cy: 106, r: 42, fill: PN.paper, stroke: PN.ink, "stroke-width": 4 }, bo);
  for (let i = 0; i <= 8; i++) {
    const a = ((150 + i * 30) * Math.PI) / 180, r0 = i === 2 || i === 6 ? 24 : 31;
    H.el("line", { x1: H.f(200 + r0 * Math.cos(a)), y1: H.f(106 + r0 * Math.sin(a)), x2: H.f(200 + 38 * Math.cos(a)), y2: H.f(106 + 38 * Math.sin(a)), stroke: i === 2 || i === 6 ? PN.blue : PN.ink, "stroke-width": i === 2 || i === 6 ? 4 : 2.5 }, bo);
  }
  H.text(bo, 146, 80, "P", { size: 26, anchor: "end" });
  const p2 = H.text(bo, 254, 80, "2P", { size: 26, fill: PN.muted });
  const nd = H.el("line", { x1: 200, y1: 106, x2: H.f(200 + 30 * Math.cos((210 * Math.PI) / 180)), y2: H.f(106 + 30 * Math.sin((210 * Math.PI) / 180)), stroke: PN.ink, "stroke-width": 4, "stroke-linecap": "round" }, bo);
  H.el("circle", { cx: 200, cy: 106, r: 6, fill: PN.ink }, bo);
  // barrel, air, particles
  pnR(bo, 130, 160, 650, 100, PN.barrel, { rx: 2 });
  const air1 = H.el("rect", { x: 134, y: 164, width: 608, height: 92, fill: PN.air }, bo);
  const P1 = [];
  const ys = [184, 236, 206, 190, 230, 212, 186];
  for (let i = 0; i < 16; i++) P1.push([162 + i * 36, ys[i % 7]]);
  const d1 = dots(bo, P1);
  pnR(bo, 104, 150, 30, 120, PN.dark, { rx: 4 });
  const mv1 = H.el("g", {}, bo);
  pnR(mv1, 770, 196, 230, 28, PN.metal, { rx: 3, sw: 3 });
  pnR(mv1, 742, 163, 28, 94, PN.dark, { rx: 3, sw: 3 });
  pnR(mv1, 1000, 168, 22, 84, PN.dark, { rx: 4 });
  const push = H.el("path", { d: H.arrowD(1084, 210, 1036, 210, 18), fill: "none", stroke: PN.blue, "stroke-width": 8, opacity: 0 }, mv1);
  const dim1 = H.el("path", { d: H.dimD(134, 296, 742, 296, 14), fill: "none", stroke: PN.ink, "stroke-width": 3 }, bo);
  const v1 = H.text(bo, 438, 286, "V", { size: 30, anchor: "middle" });
  const v2 = H.text(bo, 286, 286, "½ V", { size: 30, fill: PN.blue, anchor: "middle" });
  v2.setAttribute("opacity", "0");

  const t0 = b + c[0] + 1.5, du = 2.0;
  tl.fromTo(push, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0 - 0.4);
  tl.fromTo(mv1, { x: 0 }, { x: -304, duration: du, ease: "power2.inOut" }, t0);
  tl.fromTo(air1, { attr: { width: 608, fill: PN.air } }, { attr: { width: 304, fill: PN.air2 }, duration: du, ease: "power2.inOut" }, t0);
  d1.forEach((el, i) => tl.fromTo(el, { attr: { cx: P1[i][0] } }, { attr: { cx: H.f(134 + (P1[i][0] - 134) / 2) }, duration: du, ease: "power2.inOut" }, t0));
  tl.fromTo(nd, { rotation: 0, svgOrigin: "200 106" }, { rotation: 120, svgOrigin: "200 106", duration: du, ease: "power2.inOut" }, t0);
  tl.fromTo(dim1, { attr: { d: H.dimD(134, 296, 742, 296, 14) } }, { attr: { d: H.dimD(134, 296, 438, 296, 14) }, duration: du, ease: "power2.inOut" }, t0);
  tl.fromTo(v1, { opacity: 1 }, { opacity: 0, duration: 0.3 }, t0);
  tl.fromTo(v2, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0 + du - 0.2);
  tl.fromTo(p2, { attr: { fill: PN.muted } }, { attr: { fill: PN.blue }, duration: 0.3 }, t0 + du - 0.2);
  tl.fromTo(push, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t0 + du + 0.3);

  // ---- Charles's law (bottom band) ----
  const ch = H.el("g", { id: "s2-v-ch" }, A);
  pill(ch, 16, 328, 352, "กฎของชาร์ล (Charles's law)", "แรงดันคงที่");
  pnR(ch, 130, 424, 590, 90, PN.barrel, { rx: 2 });
  const air2 = H.el("rect", { x: 134, y: 428, width: 340, height: 82, fill: PN.air }, ch);
  const P2 = [];
  for (let i = 0; i < 5; i++) P2.push([165 + i * 68, i % 2 ? 450 : 488]);
  for (let i = 0; i < 4; i++) P2.push([199 + i * 68, i % 2 ? 488 : 450]);
  const d2 = dots(ch, P2);
  pnR(ch, 104, 414, 30, 110, PN.dark, { rx: 4 });
  const pis2 = pnR(ch, 474, 427, 28, 84, PN.dark, { rx: 3, sw: 3 });
  const dim2 = H.el("path", { d: H.dimD(134, 404, 474, 404, 14), fill: "none", stroke: PN.ink, "stroke-width": 3 }, ch);
  const vl = H.text(ch, 304, 394, "V", { size: 30, anchor: "middle" });
  const flames = [];
  for (const fx of [220, 330, 440, 550]) {
    const fg = H.el("g", { opacity: 0 }, ch);
    H.el("path", { d: H.pnFlameD(fx, 584, 19), fill: PN.orange }, fg);
    H.el("path", { d: H.pnFlameD(fx + 2, 584, 10), fill: PN.oil }, fg);
    flames.push(fg);
  }
  // thermometer + absolute temperature
  pnR(ch, 760, 404, 22, 172, PN.paper, { rx: 11, sw: 3 });
  H.el("circle", { cx: 771, cy: 590, r: 18, fill: PN.orange, stroke: PN.ink, "stroke-width": 3 }, ch);
  const liq = H.el("rect", { x: 766, y: 530, width: 10, height: 50, fill: PN.orange }, ch);
  H.text(ch, 808, 474, "อุณหภูมิสัมบูรณ์", { size: 24, fill: PN.muted });
  H.text(ch, 808, 512, "T (K) = °C + 273", { size: 28, fill: PN.blue });

  const t1 = b + c[1];
  tl.fromTo(ch, { opacity: 0.3 }, { opacity: 1, duration: 0.4 }, t1);
  flames.forEach((fg, i) => {
    tl.fromTo(fg, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 0.3 + i * 0.08);
    tl.fromTo(fg, { scaleY: 1, svgOrigin: `${[220, 330, 440, 550][i]} 584` }, { scaleY: 0.82, svgOrigin: `${[220, 330, 440, 550][i]} 584`, duration: 0.25, yoyo: true, repeat: 9, ease: "sine.inOut" }, t1 + 0.4 + i * 0.07);
  });
  const t2 = t1 + 0.9, d2u = 2.4, k = 465 / 340;
  tl.fromTo(liq, { attr: { y: 530, height: 50 } }, { attr: { y: 430, height: 150 }, duration: d2u, ease: "power1.inOut" }, t2);
  tl.fromTo(pis2, { x: 0 }, { x: 125, duration: d2u, ease: "power1.inOut" }, t2);
  tl.fromTo(air2, { attr: { width: 340 } }, { attr: { width: 465 }, duration: d2u, ease: "power1.inOut" }, t2);
  d2.forEach((el, i) => tl.fromTo(el, { attr: { cx: P2[i][0] } }, { attr: { cx: H.f(134 + (P2[i][0] - 134) * k) } , duration: d2u, ease: "power1.inOut" }, t2));
  tl.fromTo(dim2, { attr: { d: H.dimD(134, 404, 474, 404, 14) } }, { attr: { d: H.dimD(134, 404, 599, 404, 14) }, duration: d2u, ease: "power1.inOut" }, t2);
  tl.fromTo(vl, { x: 0 }, { x: 62, duration: d2u, ease: "power1.inOut" }, t2);
  tl.fromTo(vl, { attr: { fill: PN.ink } }, { attr: { fill: PN.blue }, duration: 0.3 }, t2 + d2u - 0.2);
}
