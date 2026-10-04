// Causes (OPL 5-B-3, p.15) animated on the EP05 cross-section; how the valve reacts follows EP05 (p.8 / p.27).
// Each cause plays from the normal state (gauge at the setting):
// ① dirt between poppet and seat → poppet cannot close → oil of B leaks to tank → piston lifts → pressure low
// ② dirt clogs the choke hole → no oil reaches B → piston lifts at low pressure → pressure does not rise
// ③ air in the oil → pressure unstable, piston chatters, high-pitched sound
{
  const V = RV.section("s3-v-rv", "s3-v-x");
  const O = H.$("s3-v-ov"), c = T.cues, G = V.G;
  const t0 = b + c[0], t1 = b + c[1], t2 = b + c[2], tE = b + D;

  RV.mark(O, "s3-v-mA", 532, 404, "A");
  RV.mark(O, "s3-v-mB", 532, 222, "B", 490, 222);
  H.text(O, 22, 492, "จากปั๊ม", { size: 26 });
  H.text(O, 478, 612, "ไปถัง", { size: 26 });

  // normal state at the start: A and B under pressure, gauge at the setting
  V.z.A.setAttribute("fill", RV.pHi); V.z.B.setAttribute("fill", RV.pHi); V.choke.setAttribute("stroke", RV.pHi);
  const fade = (e, a, z, t, first = false, d = 0.3) => tl.fromTo(e, { opacity: a }, { opacity: z, duration: d, immediateRender: first }, t);
  const fill = (e, a, z, t, first = false, d = 0.6) => tl.fromTo(e, { fill: a }, { fill: z, duration: d, immediateRender: first }, t);
  const pis = (a, z, t, first = false, d = 0.6) => {
    tl.fromTo(V.pis, { y: -a }, { y: -z, duration: d, ease: "power2.inOut", immediateRender: first }, t);
    tl.fromTo(V.usp, { attr: { d: V.uspD(a) } }, { attr: { d: V.uspD(z) }, duration: d, ease: "power2.inOut", immediateRender: first }, t);
  };
  const ndl = (a, z, t, first = false, d = 1.0) => tl.fromTo(G.needle, { rotation: G.rot(a), svgOrigin: G.origin }, { rotation: G.rot(z), svgOrigin: G.origin, duration: d, ease: "power2.inOut", immediateRender: first }, t);

  // ---------------- ① poppet / seat
  const d1 = RV.dirt(V.g, "s3-v-d1", 347, 119, 8);
  RV.ring(O, "s3-v-rp", 350, 128, 40);
  const Z1 = RV.zoom(O, "s3-v-z1", 985, 360, 100, 344, 130, 5);
  const s1 = Z1.s;
  H.el("rect", { x: 320, y: 100, width: 50, height: 60, fill: RV.body }, s1);
  H.el("path", { d: RV.hatchD([[320, 100, 50, 60]], 5), fill: "none", stroke: RV.hatch, "stroke-width": 0.5 }, s1);
  H.el("rect", { x: 320, y: 106, width: 12, height: 48, fill: RV.pHi }, s1);
  H.el("rect", { x: 330, y: 121, width: 16, height: 18, fill: RV.pHi }, s1);
  H.el("rect", { x: 344, y: 106, width: 26, height: 48, fill: RV.tank }, s1);
  H.el("path", { d: "M 332 106 V 121 H 344 V 106 M 332 154 V 139 H 344 V 154", fill: "none", stroke: RV.ink, "stroke-width": 1.2, "stroke-linejoin": "round" }, s1);
  const zpop = H.el("g", { id: "s3-v-zpop" }, s1);
  H.el("path", { d: "M 326 130 L 356 114 L 356 146 Z", fill: RV.dark, stroke: RV.ink, "stroke-width": 0.8, "stroke-linejoin": "round" }, zpop);
  H.el("rect", { x: 356, y: 114, width: 14, height: 32, fill: RV.dark, stroke: RV.ink, "stroke-width": 0.8 }, zpop);
  RV.dirt(s1, "s3-v-zd", 346, 120.5, 3.2).setAttribute("stroke-width", 0.5);
  const zleak = H.el("path", { id: "s3-v-zleak", d: "M 322 136 H 338 L 350 140 L 362 147", fill: "none", stroke: "#ffffff", "stroke-width": 1.4, "stroke-dasharray": "2.5 3", "stroke-linecap": "butt", opacity: 0 }, s1);
  Z1.ring();
  H.el("path", { d: "M 352 88 V 34 H 1056 V 289", fill: "none", stroke: RV.muted, "stroke-width": 3, "stroke-dasharray": "10 8" }, Z1.g);
  RV.label(Z1.g, "s3-v-z1d", 965, 238, "สิ่งสกปรก", 995, 306, { anchor: "middle", fx: 975, fy: 246, size: 24, fill: RV.dirtC });
  RV.label(Z1.g, "s3-v-z1s", 878, 506, "Seat", 950, 440, { anchor: "middle", fx: 890, fy: 482, size: 24 });
  RV.label(Z1.g, "s3-v-z1p", 1046, 506, "Poppet", 1040, 404, { anchor: "middle", fx: 1043, fy: 482, size: 24 });

  fade(Z1.g, 0, 1, t0 + 0.9, true, 0.4);
  tl.fromTo(d1, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)" }, t0 + 1.2);
  RV.pulse("s3-v-rp", t0 + 1.2, 2);
  tl.fromTo([V.pop, zpop], { x: 0 }, { x: 9, duration: 0.35, ease: "power2.out" }, t0 + 1.9);
  tl.fromTo(V.psp, { attr: { d: V.pspD(0) } }, { attr: { d: V.pspD(9) }, duration: 0.35, ease: "power2.out" }, t0 + 1.9);
  fade(zleak, 0, 1, t0 + 2.2, true);
  tl.fromTo(zleak, { strokeDashoffset: 0 }, { strokeDashoffset: -5.5 * Math.round((t1 - t0) * 2), duration: t1 - t0 - 2.2, ease: "none" }, t0 + 2.2);
  RV.flow(V.f.pilot, t0 + 2.1, t1 + 0.1);
  fill(V.z.B, RV.pHi, RV.pMid, t0 + 2.3, true, 0.8);
  pis(0, 40, t0 + 2.7, true);
  RV.flow(V.f.main, t0 + 3.0, t1 + 0.1);
  fill(V.z.A, RV.pHi, RV.pMid, t0 + 3.0, true, 0.8);
  ndl(6, 3.4, t0 + 3.0, true);

  // reset: dirt removed, poppet closes, pressure back to the setting
  fade([Z1.g, d1], 1, 0, t1 - 0.1);
  tl.fromTo([V.pop, zpop], { x: 9 }, { x: 0, duration: 0.3, immediateRender: false }, t1 + 0.1);
  tl.fromTo(V.psp, { attr: { d: V.pspD(9) } }, { attr: { d: V.pspD(0) }, duration: 0.3, immediateRender: false }, t1 + 0.1);
  fill(V.z.B, RV.pMid, RV.pHi, t1 + 0.1);
  fill(V.z.A, RV.pMid, RV.pHi, t1 + 0.1);
  pis(40, 0, t1 + 0.1);
  ndl(3.4, 6, t1 + 0.1, false, 0.6);

  // ---------------- ② choke hole clogged
  const cd = H.el("g", { id: "s3-v-cd", opacity: 0 }, V.pis);
  RV.dirt(cd, "s3-v-cd1", 379, 440, 6); RV.dirt(cd, "s3-v-cd2", 389, 436, 5.5); RV.dirt(cd, "s3-v-cd3", 393, 447, 5);
  RV.ring(V.pis, "s3-v-rc", 386, 440, 32);
  const con2 = H.el("path", { id: "s3-v-con2", d: "M 404 440 H 925", fill: "none", stroke: RV.muted, "stroke-width": 3, "stroke-dasharray": "10 8", opacity: 0 }, V.pis);
  const Z2 = RV.zoom(O, "s3-v-z2", 985, 360, 100, 386, 440, 4);
  const s2 = Z2.s;
  H.el("rect", { x: 355, y: 410, width: 18, height: 60, fill: RV.pHi }, s2);
  H.el("rect", { x: 373, y: 410, width: 40, height: 60, fill: RV.metal }, s2);
  H.el("line", { x1: 373, y1: 410, x2: 373, y2: 470, stroke: RV.ink, "stroke-width": 1.2 }, s2);
  const zch = H.el("path", { d: "M 371 440 H 393 V 400", fill: "none", stroke: RV.pHi, "stroke-width": 9, "stroke-linejoin": "miter" }, s2);
  const zcd = H.el("g", { opacity: 0 }, s2);
  for (const [x, y, r] of [[377, 440, 3.4], [383, 437.5, 2.8], [388, 442, 3], [392, 436, 2.4]]) RV.dirt(zcd, null, x, y, r).setAttribute("stroke-width", 0.5);
  Z2.ring();
  RV.label(Z2.g, "s3-v-z2c", 985, 238, "Choke hole", 1010, 332, { anchor: "middle", fx: 1000, fy: 246, size: 24 });
  RV.label(Z2.g, "s3-v-z2d", 985, 506, "สิ่งสกปรก", 958, 372, { anchor: "middle", fx: 975, fy: 482, size: 24, fill: RV.dirtC });

  const tc = t1 + 1.1;
  fade([Z2.g, con2], 0, 1, t1 + 0.8, true, 0.4);
  fade([cd, zcd], 0, 1, tc, true);
  RV.pulse("s3-v-rc", tc, 2);
  tl.fromTo([V.choke, zch], { stroke: RV.pHi }, { stroke: RV.pLo, duration: 0.5 }, tc + 0.4);
  RV.flow(V.f.choke, b + 0.3, tc + 0.4);
  fill(V.z.B, RV.pHi, RV.pLo, t1 + 2.2, false, 0.8);
  pis(0, 45, t1 + 3.0);
  RV.flow(V.f.main, t1 + 3.3, t2 + 0.1);
  fill(V.z.A, RV.pHi, RV.pMid, t1 + 3.3, false, 0.8);
  ndl(6, 3.4, t1 + 3.3);

  // reset: choke clean again, pressure back
  fade([Z2.g, con2, cd], 1, 0, t2 - 0.1);
  tl.fromTo(V.choke, { stroke: RV.pLo }, { stroke: RV.pHi, duration: 0.5, immediateRender: false }, t2 + 0.1);
  fill(V.z.B, RV.pLo, RV.pHi, t2 + 0.1);
  fill(V.z.A, RV.pMid, RV.pHi, t2 + 0.1);
  pis(45, 0, t2 + 0.1, false, 0.5);
  ndl(3.4, 6, t2 + 0.1, false, 0.6);
  RV.flow(V.f.choke, t2 + 0.4, tE, false);
  RV.flow(V.f.inlet, b + 0.3, tE, false);

  // ---------------- ③ air bubbles → needle swings, piston chatters, squeal
  const bub = H.el("g", { id: "s3-v-bub", opacity: 0 }, O);
  const pos = [[60, 404, 7], [118, 428, 9], [176, 408, 6], [238, 430, 8], [318, 452, 9], [330, 392, 6], [520, 446, 8], [550, 398, 6], [505, 466, 6], [392, 214, 7], [470, 236, 8], [404, 250, 5]];
  const bs = pos.map(([x, y, r]) => RV.bubble(bub, x, y, r));
  fade(bub, 0, 1, t2 + 0.5, true, 0.4);
  const run = tE - (t2 + 0.5);
  tl.fromTo(bs, { x: 0, y: 0 }, { x: 14, y: -6, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: Math.max(1, 2 * Math.floor(run / 1.0) - 1), stagger: 0.07 }, t2 + 0.5);
  RV.label(O, "s3-v-air", 22, 552, "ฟองอากาศ (Air)", 118, 440, { fx: 90, fy: 528, size: 24 });
  fade("#s3-v-air", 0, 1, t2 + 0.8, true);
  RV.swing(G, t2 + 1.2, tE, 6, 4.4, 7.0);
  const nj = Math.max(1, 2 * Math.floor((tE - t2 - 1.4) / 0.26) - 1);
  tl.fromTo(V.pis, { y: 0 }, { y: -10, duration: 0.13, ease: "sine.inOut", yoyo: true, repeat: nj, immediateRender: false }, t2 + 1.4);
  tl.fromTo(V.usp, { attr: { d: V.uspD(0) } }, { attr: { d: V.uspD(10) }, duration: 0.13, ease: "sine.inOut", yoyo: true, repeat: nj, immediateRender: false }, t2 + 1.4);
  const W = RV.waves(O, "s3-v-wv", 716, 330, 0, { r0: 20, dr: 20, span: 36, w: 6 });
  const pii = H.text(O, 792, 344, "ปี๊~", { size: 40, id: "s3-v-pii" });
  pii.setAttribute("opacity", 0);
  // the squeal comes with the words "มีเสียงแหลม" at the end of segment 3 (spec sfx at the same time)
  const tw = Math.max(t2 + 1.4, tE - 2.4);
  tl.fromTo(pii, { opacity: 0, scale: 0.6, transformOrigin: "0% 50%" }, { opacity: 1, scale: 1, transformOrigin: "0% 50%", duration: 0.3, ease: "back.out(2)" }, tw);
  RV.wavePulse(W, tw, tE, 0.5);
}
