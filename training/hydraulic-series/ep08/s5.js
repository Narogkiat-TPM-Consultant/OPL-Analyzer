// Wrong-size O-ring after inspection / replacement (OPL 5-C-11 ③): right size is squeezed and seals;
// a smaller ring is not squeezed → oil passes over it even at low pressure.
const hatch5 = H.orHatch("s5-v-ok", "s5-v-hatch", 12, 2);
const G5 = { x0: 110, x1: 650, yc: 12, yf: 60, gap: 10, yb: 178, gx: 330, gw: 140, gd: 160, r: 54, hatch: hatch5, sw: 3 };
H.orSection("s5-v-ok", "s5-v-a", G5, { oil: true, ring: { rx: 56, ry: 54 } });
H.orSection("s5-v-ng", "s5-v-b", G5, { oil: true, ring: { free: true, rx: 36, ry: 36 } });

// NG: oil leaks over the small ring and drips out
const ngv = H.$("s5-v-ng");
const spill = H.el("g", { id: "s5-v-spill" }, ngv);
H.el("rect", { x: 330, y: 60, width: 320, height: 10, fill: HC.oil }, spill);
H.el("rect", { x: 416, y: 60, width: 52, height: 26, fill: HC.oil }, spill);
const leak = H.el("path", { id: "s5-v-leak", d: "M 110 65 L 650 65", fill: "none", stroke: ORC.oilDark, "stroke-width": 6, "stroke-dasharray": "14 12", "stroke-linecap": "butt" }, ngv);
const dg = H.el("g", { id: "s5-v-drops" }, ngv);
const drops = [0, 1].map((i) => H.el("ellipse", { id: `s5-v-drop${i + 1}`, cx: 662, cy: 74, rx: 8, ry: 11, fill: HC.oil, stroke: ORC.oilDark, "stroke-width": 3 }, dg));
const ring5 = H.el("circle", { id: "s5-v-ngc", cx: 400, cy: 74, r: 34, fill: "none", stroke: HC.red, "stroke-width": 5 }, ngv);

const tL = b + T.stamps[1] + 0.2, run = Math.max(1, D - T.stamps[1] - 0.4);
tl.fromTo(leak, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round(run * 2.5), duration: run, ease: "none", immediateRender: false }, tL);
tl.fromTo([spill, leak, ring5, dg], { opacity: 0 }, { opacity: 1, duration: 0.3 }, tL);
tl.fromTo(drops, { y: 0, opacity: 1 }, { y: 96, opacity: 0, duration: 1.0, ease: "power1.in", stagger: 0.55, repeat: Math.max(1, Math.floor((run - 0.9) / 1.1)) }, tL + 0.3);
