// Method: the 4 simple checks of OPL 5-C-10, each animated on the cylinder as it is named.
// c0: rag wipes the dirty cylinder → look at the piping connections + dust seal → a leak shows at the seal.
// c1: spanner on a tie-rod nut; every nut / bolt turns blue in turn.  c2: torch + gleam along the rod.
// c3: magnified end view of the dust seal.
{
  const c = T.cues;
  const g = H.el("g", { transform: "translate(0 45)" }, "s4-v-art");   // centre the drawing in the slot
  const f = H.f;
  H.el("line", { x1: 50, y1: 505, x2: 720, y2: 505, stroke: C20.ink, "stroke-width": 6 }, g);
  for (let x = 70; x <= 720; x += 28) H.el("line", { x1: x, y1: 508, x2: x - 14, y2: 525, stroke: C20.muted, "stroke-width": 3 }, g);
  const E = H.c20Ext(g, { id: "s4-v-x", x: 100, y: 335, s: 1.22, rod: 200, pipeTop: -215, grime: true });
  const P = (x, y) => E.at(x, y);
  const ring = (cx, cy, r, color, o = {}) => H.el("circle", { cx: f(cx), cy: f(cy), r, fill: "none", stroke: color, "stroke-width": o.w || 5, ...(o.dash ? { "stroke-dasharray": o.dash } : {}), ...(o.hidden ? { opacity: 0 } : {}) }, o.parent || g);
  const pop = (el, t, from, x, y) => {
    const org = `${f(x)} ${f(y)}`;
    tl.fromTo(el, { opacity: 0, scale: from, svgOrigin: org }, { opacity: 1, scale: 1, svgOrigin: org, duration: 0.3, ease: "back.out(2)" }, b + t);
  };
  const badge = (x, y, n, t) => { const el = H.c20Badge(g, x, y, n, { r: 22 }); el.setAttribute("opacity", 0); pop(el, t, 1.5, x, y); };

  const [fcx, fcy] = P(35, -122), [frx, fry] = P(425, -122), [sx, sy] = P(464, 0), [nx, ny] = P(470, -92);
  const rodBot = P(0, 18)[1], rodTop = P(0, -18)[1];

  // ---- 1. wipe first, then look for leaks at the piping connections and the dust seal
  const rag = H.el("g", { id: "s4-v-rag", opacity: 0 }, g);
  H.el("path", { d: "M -42 -26 Q -10 -36 20 -29 Q 44 -24 42 0 Q 46 24 18 31 Q -12 37 -40 29 Q -48 0 -42 -26 Z", fill: C20.rag, stroke: C20.ink, "stroke-width": 3.5 }, rag);
  for (const y of [-12, 10]) H.el("path", { d: `M -36 ${y} Q 0 ${y - 6} 36 ${y}`, fill: "none", stroke: C20.blue, "stroke-width": 4 }, rag);
  const X0 = P(40, 0)[0], X1 = sx + 6, tw = c[0] + 0.3, Tw = 2.0;
  tl.fromTo(rag, { x: X0, y: sy - 35, opacity: 0 }, { opacity: 1, duration: 0.2 }, b + tw - 0.1);
  tl.fromTo(rag, { x: X0 }, { x: X1, duration: Tw, ease: "none", immediateRender: false }, b + tw);
  tl.fromTo(rag, { y: sy - 35 }, { y: sy + 35, duration: Tw / 6, ease: "sine.inOut", yoyo: true, repeat: 5, immediateRender: false }, b + tw);
  tl.to(rag, { opacity: 0, duration: 0.25 }, b + tw + Tw);
  E.grime.forEach(({ el, x }) => {
    const k = Math.min(1, Math.max(0, (P(x, 0)[0] - X0) / (X1 - X0)));
    tl.to(el, { opacity: 0, duration: 0.25 }, b + tw + k * Tw);
  });
  const look = H.el("g", { opacity: 0 }, g);
  ring(fcx, fcy, 32, C20.blue, { dash: "10 7", parent: look });
  ring(frx, fry, 32, C20.blue, { dash: "10 7", parent: look });
  const lx = (fcx + frx) / 2;
  H.c20Label(look, lx, 156, "ข้อต่อท่อ", { size: 30, anchor: "middle" });
  H.el("line", { x1: f(lx - 72), y1: 146, x2: f(fcx + 28), y2: f(fcy - 14), stroke: C20.blue, "stroke-width": 3 }, look);
  H.el("line", { x1: f(lx + 72), y1: 146, x2: f(frx - 28), y2: f(fry - 14), stroke: C20.blue, "stroke-width": 3 }, look);
  const sealLook = ring(sx + 4, sy, 40, C20.blue, { dash: "10 7", hidden: true });
  const sealLbl = H.c20Label(g, sx + 44, 432, "Dust seal", { size: 30, line: [sx + 40, 420, sx + 14, rodBot + 12] });
  sealLbl.setAttribute("opacity", 0);
  tl.fromTo([look, sealLook, sealLbl], { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.2 }, b + c[0] + 2.4);
  badge(lx, 102, 1, c[0] + 2.4);
  // leak at the dust seal: oil on the rod and down the cover face, drops fall
  const wet = H.el("g", { opacity: 0 }, g);
  H.el("path", { d: `M ${f(sx + 7)} ${f(rodBot)} Q ${f(sx + 28)} ${f(rodBot + 15)} ${f(sx + 52)} ${f(rodBot + 1)} Z`, fill: C20.oil, stroke: C20.oilDk, "stroke-width": 2.5 }, wet);
  const yr = P(0, 26)[1];
  H.el("path", { d: `M ${f(sx - 10)} ${f(yr)} L ${f(sx + 4)} ${f(yr)} Q ${f(sx + 3)} ${f(yr + 26)} ${f(sx - 1)} ${f(yr + 44)} Q ${f(sx - 3)} ${f(yr + 50)} ${f(sx - 5)} ${f(yr + 44)} Q ${f(sx - 10)} ${f(yr + 26)} ${f(sx - 10)} ${f(yr)} Z`, fill: C20.oil, stroke: C20.oilDk, "stroke-width": 2.5 }, wet);
  const red = H.el("ellipse", { cx: f(sx + 12), cy: f(sy + 14), rx: 50, ry: 56, fill: "none", stroke: C20.red, "stroke-width": 6, opacity: 0 }, g);
  const tl1 = c[0] + 3.3;
  tl.fromTo(wet, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + tl1);
  tl.to(sealLook, { opacity: 0, duration: 0.3 }, b + tl1);
  pop(red, tl1 + 0.2, 1.3, sx + 12, sy + 14);
  for (const k of [0, 1]) {
    const d = H.el("path", { d: H.c20DropD(sx + 30, rodBot + 2, 7), fill: C20.oil, stroke: C20.ink, "stroke-width": 2, opacity: 0 }, g);
    tl.fromTo(d, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.15 }, b + tl1 + 0.4 + k * 0.8);
    tl.to(d, { y: 110, opacity: 0, duration: 0.55, ease: "power2.in" }, b + tl1 + 0.6 + k * 0.8);
  }

  // ---- 2. bolts / nuts: spanner on the top-right tie-rod nut, then every nut and bolt is checked (turns blue)
  const sp = H.el("g", { transform: `translate(${f(nx)} ${f(ny)})`, opacity: 0 }, g);
  const spr = H.el("g", { id: "s4-v-spanner" }, sp);
  H.el("path", { d: H.arcD(0, 0, 23, -140, 140), fill: "none", stroke: C20.muted, "stroke-width": 11, "stroke-linecap": "round" }, spr);
  H.el("line", { x1: 26, y1: 0, x2: 150, y2: 0, stroke: C20.muted, "stroke-width": 17, "stroke-linecap": "round" }, spr);
  H.el("line", { x1: 42, y1: -2, x2: 140, y2: -2, stroke: "#ffffff", "stroke-width": 3, opacity: 0.5 }, spr);
  tl.fromTo(sp, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[1] + 0.1);
  tl.fromTo(spr, { rotation: -30, svgOrigin: "0 0" }, { rotation: -22, svgOrigin: "0 0", duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3 }, b + c[1] + 0.4);
  const parts = [...E.nutEls, ...E.boltEls];
  tl.fromTo(parts, { attr: { stroke: C20.ink } }, { attr: { stroke: C20.blue, fill: "#bcd3f2" }, duration: 0.2, stagger: 0.12 }, b + c[1] + 0.6);
  const ang2 = (-30 * Math.PI) / 180;
  badge(nx + 150 * Math.cos(ang2) + 28, ny + 150 * Math.sin(ang2) - 14, 2, c[1] + 0.2);

  // ---- 3. rod surface: torch light + gleam (shines like a mirror?)
  const tx = 990, ty = 468, aim = [830, rodBot], ang = Math.atan2(aim[1] - ty, aim[0] - tx), deg = (ang * 180) / Math.PI;
  const ux = Math.cos(ang), uy = Math.sin(ang), hx = tx + 26 * ux, hy = ty + 26 * uy;
  const beam = H.el("path", { d: `M ${f(hx - 22 * uy)} ${f(hy + 22 * ux)} L 905 ${f(rodBot)} L 772 ${f(rodBot)} L ${f(hx + 22 * uy)} ${f(hy - 22 * ux)} Z`, fill: C20.yellow, opacity: 0 }, g);
  const torch = H.el("g", { transform: `translate(${tx} ${ty}) rotate(${f(deg)})`, opacity: 0 }, g);
  H.el("rect", { x: -78, y: -15, width: 80, height: 30, rx: 8, fill: C20.ink, stroke: C20.ink, "stroke-width": 3 }, torch);
  H.el("path", { d: "M 0 -16 L 26 -24 L 26 24 L 0 16 Z", fill: C20.dark, stroke: C20.ink, "stroke-width": 3 }, torch);
  H.el("rect", { x: -54, y: -6, width: 16, height: 12, rx: 3, fill: C20.yellow }, torch);
  const sk = [H.c20Spark(E.rod, 560, -8, 18), H.c20Spark(E.rod, 630, 7, 14)];
  tl.fromTo(torch, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[2] + 0.1);
  tl.fromTo(beam, { opacity: 0 }, { opacity: 0.32, duration: 0.3 }, b + c[2] + 0.35);
  E.gleam.band.forEach((bd, i) => tl.fromTo(bd, { x: 420, opacity: 0.95 }, { x: 690, opacity: 0.95, duration: 0.9, ease: "power1.inOut" }, b + c[2] + 0.55 + i * 0.07));
  sk.forEach((s, i) => {
    const org = i ? "630 7" : "560 -8";
    tl.fromTo(s, { opacity: 0, scale: 0.2, svgOrigin: org }, { opacity: 1, scale: 1, svgOrigin: org, duration: 0.25, ease: "back.out(3)" }, b + c[2] + 1.0 + i * 0.2);
  });
  badge(872, rodTop - 26, 3, c[2] + 0.3);

  // ---- 4. dust seal close-up (magnified end view)
  const icx = 990, icy = 168, ir = 88;
  const ins = H.el("g", { id: "s4-v-inset", opacity: 0 }, g);
  const v = [sx + 4 - icx, rodTop - icy], vl = Math.hypot(...v);
  H.el("line", { x1: f(icx + (ir * v[0]) / vl), y1: f(icy + (ir * v[1]) / vl), x2: f(sx + 4), y2: f(rodTop - 4), stroke: C20.ink, "stroke-width": 3, "stroke-dasharray": "8 6" }, ins);
  H.el("circle", { cx: icx, cy: icy, r: ir, fill: C20.paper }, ins);
  const defs = H.el("defs", {}, g.ownerSVGElement);
  const cp = H.el("clipPath", { id: "s4-v-inclip" }, defs);
  H.el("circle", { cx: icx, cy: icy, r: ir }, cp);
  const inner = H.el("g", { "clip-path": "url(#s4-v-inclip)" }, ins);
  const SF = H.c20SealFace(inner, icx, icy, 0.95);
  H.el("circle", { cx: icx, cy: icy, r: ir, fill: "none", stroke: C20.ink, "stroke-width": 6 }, ins);
  H.c20Label(ins, icx, icy + ir + 32, "Dust seal", { size: 30, anchor: "middle" });
  tl.fromTo(ins, { opacity: 0, scale: 0.4, svgOrigin: `${icx} ${icy}` }, { opacity: 1, scale: 1, svgOrigin: `${icx} ${icy}`, duration: 0.45, ease: "back.out(1.6)" }, b + c[3] + 0.1);
  tl.fromTo(SF.ring, { attr: { stroke: C20.rubber } }, { attr: { stroke: C20.blue }, duration: 0.3, yoyo: true, repeat: 3 }, b + c[3] + 0.8);
  badge(icx - 70, icy - 72, 4, c[3] + 0.3);
}
