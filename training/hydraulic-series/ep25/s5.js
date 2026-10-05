// Alert (p.40 Maintenance 1): oil cap loosened while pressure remains (selective type) → oil sprays out.
// Drawn for the dark alert background: light outlines.
{
  const g = H.$("s5-v-art"), lt = "#e9e4d8";
  // warning sign
  H.el("path", { d: "M 238 18 L 288 104 H 188 Z", fill: LU.yellow, stroke: LU.yellow, "stroke-width": 10, "stroke-linejoin": "round" }, g);
  H.el("rect", { x: 232, y: 46, width: 12, height: 34, rx: 5, fill: "#121417" }, g);
  H.el("circle", { cx: 238, cy: 92, r: 6.5, fill: "#121417" }, g);
  // lubricator: dome, body, collar, bowl with oil
  H.el("path", { d: "M 150 176 V 140 Q 150 112 178 112 Q 206 112 206 140 V 176 Z", fill: LU.bowl, stroke: lt, "stroke-width": 4 }, g);
  H.el("rect", { x: 24, y: 174, width: 252, height: 62, rx: 8, fill: LU.metal, stroke: lt, "stroke-width": 4 }, g);
  H.el("rect", { x: 74, y: 236, width: 152, height: 18, rx: 4, fill: LU.dark, stroke: lt, "stroke-width": 3 }, g);
  H.el("path", { d: "M 84 254 V 318 Q 84 344 110 344 H 190 Q 216 344 216 318 V 254 Z", fill: LU.bowl, stroke: lt, "stroke-width": 4 }, g);
  H.el("path", { d: "M 88 286 V 318 Q 88 340 110 340 H 190 Q 212 340 212 318 V 286 Z", fill: LU.oil }, g);
  // pressure inside (blue arrows pushing out)
  const pr = H.el("g", { id: "s5-v-pr", opacity: 0 }, g);
  for (const [x1, y1, x2, y2] of [[150, 272, 150, 254], [110, 300, 94, 300], [190, 300, 206, 300]]) H.el("path", { d: H.arrowD(x1, y1, x2, y2, 10), fill: "none", stroke: "#7fc3ec", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, pr);
  // oil cap: lifts off and tilts
  const cap = H.el("g", { id: "s5-v-cap" }, g);
  H.el("rect", { x: 52, y: 154, width: 52, height: 22, rx: 5, fill: LU.knob, stroke: lt, "stroke-width": 3 }, cap);
  // oil jet out of the cap hole
  const jet = H.el("g", { id: "s5-v-jet" }, g);
  const rnd = LU.rng(41), drops = [];
  for (let i = 0; i < 16; i++) {
    const a = (-90 + (rnd() - 0.5) * 70) * (Math.PI / 180), dist = 60 + rnd() * 70;
    const d = H.el("circle", { cx: 78, cy: 170, r: H.f(4 + rnd() * 5), fill: LU.oil, opacity: 0 }, jet);
    drops.push([d, Math.cos(a) * dist, Math.sin(a) * dist, i]);
  }
  LU.show(pr, b + 0.4, 0.3);
  tl.fromTo(cap, { x: 0, y: 0, rotation: 0, svgOrigin: "78 165" }, { x: -10, y: -58, rotation: -28, svgOrigin: "78 165", duration: 0.35, ease: "power3.out" }, b + 0.9);
  for (const [d, dx, dy, i] of drops) {
    for (let k = 0; k < 3; k++) {
      const t = b + 1.0 + i * 0.04 + k * 0.9;
      tl.fromTo(d, { x: 0, y: 0, opacity: 1 }, { x: H.f(dx), y: H.f(dy), opacity: 0, duration: 0.75, ease: "power2.out", immediateRender: false }, t);
    }
  }
}
