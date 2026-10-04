// Method: the 4 simple checks of OPL 5-C-10, each animated on the cylinder as it is named.
// c0: rag wipes the dirty cylinder → look at the piping connections + dust seal → a leak shows at the seal.
// c1: spanner on a tie-rod nut; every nut / bolt gets a check ring.  c2: torch + gleam along the rod.
// c3: magnified end view of the dust seal.
{
  const c = T.cues;
  const g = H.$("s4-v-art");
  H.el("line", { x1: 60, y1: 486, x2: 700, y2: 486, stroke: C20.ink, "stroke-width": 6 }, g);
  for (let x = 80; x <= 700; x += 28) H.el("line", { x1: x, y1: 489, x2: x - 14, y2: 506, stroke: C20.muted, "stroke-width": 3 }, g);
  const E = H.c20Ext(g, { id: "s4-v-x", x: 110, y: 330, s: 1.12, rod: 210, pipeTop: -220, grime: true });
  const P = (x, y) => E.at(x, y);
  const ring = (cx, cy, r, color, o = {}) => H.el("circle", { cx: H.f(cx), cy: H.f(cy), r, fill: "none", stroke: color, "stroke-width": o.w || 5, ...(o.dash ? { "stroke-dasharray": o.dash } : {}), opacity: 0 }, o.parent || g);
  const pop = (el, t, from, x, y) => {
    const org = `${H.f(x)} ${H.f(y)}`;
    tl.fromTo(el, { opacity: 0, scale: from, svgOrigin: org }, { opacity: 1, scale: 1, svgOrigin: org, duration: 0.3, ease: "back.out(2)" }, b + t);
  };

  // ---- 1. wipe first, then look for leaks at the piping connections and the dust seal
  const rag = H.el("g", { id: "s4-v-rag", opacity: 0 }, g);
  H.el("path", { d: "M -42 -26 Q -10 -36 20 -29 Q 44 -24 42 0 Q 46 24 18 31 Q -12 37 -40 29 Q -48 0 -42 -26 Z", fill: C20.rag, stroke: C20.ink, "stroke-width": 3.5 }, rag);
  for (const y of [-12, 10]) H.el("path", { d: `M -36 ${y} Q 0 ${y - 6} 36 ${y}`, fill: "none", stroke: C20.blue, "stroke-width": 4 }, rag);
  const X0 = 150, X1 = 650, tw = c[0] + 0.3, Tw = 2.0;
  tl.fromTo(rag, { x: X0, y: 300, opacity: 0 }, { opacity: 1, duration: 0.2 }, b + tw - 0.1);
  tl.fromTo(rag, { x: X0 }, { x: X1, duration: Tw, ease: "none", immediateRender: false }, b + tw);
  tl.fromTo(rag, { y: 300 }, { y: 360, duration: Tw / 6, ease: "sine.inOut", yoyo: true, repeat: 5, immediateRender: false }, b + tw);
  tl.to(rag, { opacity: 0, duration: 0.25 }, b + tw + Tw);
  E.grime.forEach(({ el, x }) => {
    const X = P(x, 0)[0], k = Math.min(1, Math.max(0, (X - X0) / (X1 - X0)));
    tl.to(el, { opacity: 0, duration: 0.25 }, b + tw + k * Tw);
  });
  const [fcx, fcy] = P(35, -122), [frx, fry] = P(425, -122), [sx, sy] = P(464, 0);
  const look = H.el("g", { opacity: 0 }, g);
  ring(fcx, fcy, 30, C20.blue, { dash: "10 7", parent: look }).setAttribute("opacity", 1);
  ring(frx, fry, 30, C20.blue, { dash: "10 7", parent: look }).setAttribute("opacity", 1);
  H.c20Label(look, 368, 166, "ข้อต่อท่อ", { size: 28, anchor: "middle" });
  H.el("line", { x1: 304, y1: 158, x2: fcx + 26, y2: fcy - 12, stroke: C20.blue, "stroke-width": 3 }, look);
  H.el("line", { x1: 432, y1: 158, x2: frx - 26, y2: fry - 12, stroke: C20.blue, "stroke-width": 3 }, look);
  const sealLook = ring(sx + 2, sy, 38, C20.blue, { dash: "10 7" });
  const sealLbl = H.c20Label(g, 702, 414, "Dust seal", { size: 28, line: [698, 404, 652, 366] });
  sealLbl.setAttribute("opacity", 0);
  const b1 = H.c20Badge(g, 368, 114, 1, { r: 22 });
  b1.setAttribute("opacity", 0);
  tl.fromTo([look, sealLook, sealLbl], { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.2 }, b + c[0] + 2.4);
  pop(b1, c[0] + 2.4, 1.5, 368, 114);
  // leak at the dust seal: oil on the rod and down the cover face, drops fall
  const wet = H.el("g", { opacity: 0 }, g);
  H.el("path", { d: `M ${H.f(sx + 6)} 350 Q ${H.f(sx + 26)} 364 ${H.f(sx + 48)} 351 Z`, fill: C20.oil, stroke: C20.oilDk, "stroke-width": 2.5 }, wet);
  H.el("path", { d: `M ${H.f(sx - 9)} 357 L ${H.f(sx + 3)} 357 Q ${H.f(sx + 2)} 382 ${H.f(sx - 1)} 398 Q ${H.f(sx - 3)} 404 ${H.f(sx - 5)} 398 Q ${H.f(sx - 9)} 382 ${H.f(sx - 9)} 357 Z`, fill: C20.oil, stroke: C20.oilDk, "stroke-width": 2.5 }, wet);
  const red = H.el("ellipse", { cx: H.f(sx + 10), cy: 346, rx: 46, ry: 52, fill: "none", stroke: C20.red, "stroke-width": 6, opacity: 0 }, g);
  const tl1 = c[0] + 3.3;
  tl.fromTo(wet, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + tl1);
  tl.to(sealLook, { opacity: 0, duration: 0.3 }, b + tl1);
  pop(red, tl1 + 0.2, 1.3, sx + 10, 346);
  for (const k of [0, 1]) {
    const d = H.el("path", { d: H.c20DropD(sx + 28, 356, 7), fill: C20.oil, stroke: C20.ink, "stroke-width": 2, opacity: 0 }, g);
    tl.fromTo(d, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.15 }, b + tl1 + 0.4 + k * 0.8);
    tl.to(d, { y: 110, opacity: 0, duration: 0.55, ease: "power2.in" }, b + tl1 + 0.6 + k * 0.8);
  }

  // ---- 2. bolts / nuts: spanner on the top-right tie-rod nut, then a check ring on every nut and bolt
  const [nx, ny] = P(470, -92);
  const sp = H.el("g", { transform: `translate(${H.f(nx)} ${H.f(ny)})`, opacity: 0 }, g);
  const spr = H.el("g", { id: "s4-v-spanner" }, sp);
  H.el("path", { d: H.arcD(0, 0, 22, -140, 140), fill: "none", stroke: C20.muted, "stroke-width": 10, "stroke-linecap": "round" }, spr);
  H.el("line", { x1: 24, y1: 0, x2: 150, y2: 0, stroke: C20.muted, "stroke-width": 16, "stroke-linecap": "round" }, spr);
  H.el("line", { x1: 40, y1: -2, x2: 140, y2: -2, stroke: "#ffffff", "stroke-width": 3, opacity: 0.5 }, spr);
  tl.fromTo(sp, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[1] + 0.1);
  tl.fromTo(spr, { rotation: -30, svgOrigin: "0 0" }, { rotation: -22, svgOrigin: "0 0", duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3 }, b + c[1] + 0.4);
  [...E.nuts, ...E.bolts].forEach(([x, y], i) => { const [X, Y] = P(x, y); pop(ring(X, Y, 22, C20.blue, { w: 4 }), c[1] + 0.6 + i * 0.1, 1.6, X, Y); });
  const b2 = H.c20Badge(g, 794, 138, 2, { r: 22 });
  b2.setAttribute("opacity", 0);
  pop(b2, c[1] + 0.2, 1.5, 794, 138);

  // ---- 3. rod surface: torch light + gleam (shines like a mirror?)
  const tx = 952, ty = 452, ang = Math.atan2(352 - ty, 800 - tx), deg = (ang * 180) / Math.PI;
  const ux = Math.cos(ang), uy = Math.sin(ang), hx = tx + 26 * ux, hy = ty + 26 * uy;
  const beam = H.el("path", { d: `M ${H.f(hx - 20 * uy)} ${H.f(hy + 20 * ux)} L 880 352 L 742 352 L ${H.f(hx + 20 * uy)} ${H.f(hy - 20 * ux)} Z`, fill: C20.yellow, opacity: 0 }, g);
  const torch = H.el("g", { transform: `translate(${tx} ${ty}) rotate(${H.f(deg)})`, opacity: 0 }, g);
  H.el("rect", { x: -78, y: -15, width: 80, height: 30, rx: 8, fill: C20.ink, stroke: C20.ink, "stroke-width": 3 }, torch);
  H.el("path", { d: "M 0 -16 L 26 -24 L 26 24 L 0 16 Z", fill: C20.dark, stroke: C20.ink, "stroke-width": 3 }, torch);
  H.el("rect", { x: -54, y: -6, width: 16, height: 12, rx: 3, fill: C20.yellow }, torch);
  const sk = [H.c20Spark(E.rod, 560, -8, 18), H.c20Spark(E.rod, 640, 7, 14)];
  tl.fromTo(torch, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[2] + 0.1);
  tl.fromTo(beam, { opacity: 0 }, { opacity: 0.32, duration: 0.3 }, b + c[2] + 0.35);
  E.gleam.band.forEach((bd, i) => tl.fromTo(bd, { x: 420, opacity: 0.95 }, { x: 700, opacity: 0.95, duration: 0.9, ease: "power1.inOut" }, b + c[2] + 0.55 + i * 0.07));
  sk.forEach((s, i) => {
    const org = i ? "640 7" : "560 -8";
    tl.fromTo(s, { opacity: 0, scale: 0.2, svgOrigin: org }, { opacity: 1, scale: 1, svgOrigin: org, duration: 0.25, ease: "back.out(3)" }, b + c[2] + 1.0 + i * 0.2);
  });
  const b3 = H.c20Badge(g, 852, 284, 3, { r: 22 });
  b3.setAttribute("opacity", 0);
  pop(b3, c[2] + 0.3, 1.5, 852, 284);

  // ---- 4. dust seal close-up (magnified end view)
  const icx = 965, icy = 180, ir = 92;
  const ins = H.el("g", { id: "s4-v-inset", opacity: 0 }, g);
  const v = [sx + 6 - icx, sy - 22 - icy], vl = Math.hypot(...v);
  H.el("line", { x1: H.f(icx + (ir * v[0]) / vl), y1: H.f(icy + (ir * v[1]) / vl), x2: H.f(sx + 6), y2: H.f(sy - 22), stroke: C20.ink, "stroke-width": 3, "stroke-dasharray": "8 6" }, ins);
  H.el("circle", { cx: icx, cy: icy, r: ir, fill: C20.paper }, ins);
  const defs = H.el("defs", {}, g.ownerSVGElement);
  const cp = H.el("clipPath", { id: "s4-v-inclip" }, defs);
  H.el("circle", { cx: icx, cy: icy, r: ir }, cp);
  const inner = H.el("g", { "clip-path": "url(#s4-v-inclip)" }, ins);
  const SF = H.c20SealFace(inner, icx, icy, 1.0);
  H.el("circle", { cx: icx, cy: icy, r: ir, fill: "none", stroke: C20.ink, "stroke-width": 6 }, ins);
  H.c20Label(ins, icx, icy + ir + 26, "Dust seal", { size: 28, anchor: "middle" });
  tl.fromTo(ins, { opacity: 0, scale: 0.4, svgOrigin: `${icx} ${icy}` }, { opacity: 1, scale: 1, svgOrigin: `${icx} ${icy}`, duration: 0.45, ease: "back.out(1.6)" }, b + c[3] + 0.1);
  tl.fromTo(SF.ring, { attr: { stroke: C20.rubber } }, { attr: { stroke: C20.blue }, duration: 0.3, yoyo: true, repeat: 3 }, b + c[3] + 0.8);
  const b4 = H.c20Badge(g, 880, 96, 4, { r: 22 });
  b4.setAttribute("opacity", 0);
  pop(b4, c[3] + 0.3, 1.5, 880, 96);
}
