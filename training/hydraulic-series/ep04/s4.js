// Card visuals (viewBox 760 × 240): rotary piston pump (left) and gear pump (right), both simplified.
const tP = T.left, tG = T.right;
{
  // ---- rotary piston pump, side view: the turning shaft wobbles a tilted plate; the plate strokes the pistons
  const g = H.el("g", {}, "s4-v-pis");
  H.el("rect", { x: 150, y: 16, width: 470, height: 208, rx: 22, fill: HC.metal, stroke: HC.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: 172, y: 34, width: 140, height: 172, rx: 10, fill: HC.oilBg, stroke: HC.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: 40, y: 109, width: 330, height: 22, fill: "#9aa1aa", stroke: HC.ink, "stroke-width": 3 }, g); // drive shaft
  // cylinder block with two bores (oil) and the valve plate
  H.el("rect", { x: 330, y: 34, width: 200, height: 172, rx: 8, fill: "#e4dfd2", stroke: HC.ink, "stroke-width": 4 }, g);
  for (const y of [62, 178]) H.el("rect", { x: 330, y: y - 18, width: 176, height: 36, fill: HC.oilBg, stroke: HC.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: 530, y: 34, width: 22, height: 172, fill: "#9aa1aa", stroke: HC.ink, "stroke-width": 3 }, g);
  // ports: discharge (top right, out) and intake (bottom right, in)
  H.el("path", { d: H.arrowD(560, 62, 700, 62, 24), fill: "none", stroke: HC.blue, "stroke-width": 9, "stroke-linejoin": "round" }, g);
  H.el("path", { d: H.arrowD(700, 178, 560, 178, 24), fill: "none", stroke: HC.blue, "stroke-width": 9, "stroke-linejoin": "round" }, g);
  // pistons (top and bottom bore) with shoes riding on the plate
  const piston = (y) => {
    const p = H.el("g", {}, g);
    H.el("rect", { x: 262, y: y - 14, width: 150, height: 28, rx: 4, fill: "#7d858f", stroke: HC.ink, "stroke-width": 3 }, p);
    H.el("circle", { cx: 262, cy: y, r: 15, fill: "#59606a", stroke: HC.ink, "stroke-width": 3 }, p);
    return p;
  };
  const pTop = piston(62), pBot = piston(178);
  const plate = H.el("rect", { x: 230, y: 24, width: 22, height: 192, rx: 6, fill: "#59606a", stroke: HC.ink, "stroke-width": 3 }, g);
  // shaft rotation arrow (ellipse around the shaft end)
  H.el("path", { d: "M 92 88 A 16 36 0 1 0 108 150", fill: "none", stroke: HC.blue, "stroke-width": 6 }, g);
  H.el("path", { d: "M 96 146 L 109 151 L 104 137", fill: "none", stroke: HC.blue, "stroke-width": 6, "stroke-linejoin": "round" }, g);
  const tilt = 22, A = 58 * Math.tan((tilt * Math.PI) / 180), half = 0.6, n = Math.max(1, Math.floor((D - tP) / half) - 1);
  const osc = (el, from, to) => tl.fromTo(el, from, { ...to, duration: half, ease: "sine.inOut", yoyo: true, repeat: n }, b + tP);
  osc(plate, { rotation: -tilt, svgOrigin: "241 120" }, { rotation: tilt, svgOrigin: "241 120" });
  osc(pTop, { x: -A - 8 }, { x: A - 8 });
  osc(pBot, { x: A - 8 }, { x: -A - 8 });
}
{
  // ---- gear pump: two meshing gears carry oil around the outside from the intake (bottom) to the discharge (top)
  const g = H.el("g", {}, "s4-v-gear");
  const n = 10, rt = 58, rb = 43, cy = 120, cx1 = 380 - 51.5, cx2 = 380 + 51.5, step = 360 / n;
  H.el("rect", { x: 230, y: 30, width: 300, height: 180, rx: 86, fill: HC.metal, stroke: HC.ink, "stroke-width": 4 }, g);
  for (const [y0, y1] of [[6, 70], [170, 234]]) {
    H.el("rect", { x: 356, y: y0, width: 48, height: y1 - y0, fill: HC.oilBg }, g);
  }
  H.el("rect", { x: cx1 - 63, y: cy - 63, width: cx2 - cx1 + 126, height: 126, rx: 63, fill: HC.oilBg, stroke: HC.ink, "stroke-width": 3 }, g);
  H.el("rect", { x: 357, y: 6, width: 46, height: 60, fill: HC.oilBg }, g);
  H.el("rect", { x: 357, y: 174, width: 46, height: 60, fill: HC.oilBg }, g);
  for (const x of [356, 404]) for (const [y0, y1] of [[6, 58], [182, 234]]) H.el("line", { x1: x, y1: y0, x2: x, y2: y1, stroke: HC.ink, "stroke-width": 3 }, g);
  const gear = (cx, phase) => {
    const grp = H.el("g", {}, g);
    let d = "";
    for (let i = 0; i < n; i++) {
      const a = phase + i * step;
      [[a - step / 2, rb], [a - step * 0.24, rb], [a - step * 0.12, rt], [a + step * 0.12, rt], [a + step * 0.24, rb]].forEach(([ang, r], j) => {
        const q = (ang * Math.PI) / 180;
        d += `${i === 0 && j === 0 ? "M" : " L"} ${H.f(cx + r * Math.cos(q))} ${H.f(cy + r * Math.sin(q))}`;
      });
    }
    H.el("path", { d: d + " Z", fill: "#9aa1aa", stroke: HC.ink, "stroke-width": 3, "stroke-linejoin": "round" }, grp);
    H.el("circle", { cx, cy, r: 15, fill: HC.paper, stroke: HC.ink, "stroke-width": 3 }, grp);
    H.el("rect", { x: cx - 4, y: cy - 15, width: 8, height: 9, fill: HC.ink }, grp);
    return grp;
  };
  const gL = gear(cx1, 0), gR = gear(cx2, 180 + step / 2);
  const fl = (d) => H.el("path", { d, fill: "none", stroke: HC.blue, "stroke-width": 7, "stroke-dasharray": "12 14", opacity: 0 }, g);
  const fIn = fl("M 380 234 L 380 184"), fOut = fl("M 380 56 L 380 8");
  const dur = D - tG, deg = 100 * dur;
  tl.fromTo(gL, { rotation: 0, svgOrigin: `${cx1} ${cy}` }, { rotation: deg, svgOrigin: `${cx1} ${cy}`, duration: dur, ease: "none" }, b + tG);
  tl.fromTo(gR, { rotation: 0, svgOrigin: `${cx2} ${cy}` }, { rotation: -deg, svgOrigin: `${cx2} ${cy}`, duration: dur, ease: "none" }, b + tG);
  for (const f of [fIn, fOut]) {
    tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + tG + 0.3);
    tl.fromTo(f, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round(dur * 2), duration: dur, ease: "none", immediateRender: false }, b + tG + 0.3);
  }
  H.el("path", { d: "M 380 4 L 368 22 L 392 22 Z", fill: HC.blue }, g);
}
