// Main diagram: vane pump cross-section, cued to the 4 narration segments.
//  seg 1 — structure: rotor in the ring, slots, vanes slide in/out (rotor still)
//  seg 2 — shaft turns the rotor (CCW arrow), centrifugal force throws the vanes onto the ring → pump chambers
//  seg 3 — rotor is eccentric: one chamber (deep oil colour) grows at the bottom → suction from the intake port
//  seg 4 — the chamber shrinks at the top → oil pushed out of the discharge port
const OX = 400, OY = 320;
const P = H.vanePump("s3-v-pump", "s3-v-p", { x: OX, y: OY, s: 1, chambers: [0, 4] });
const c = T.cues;
const L = [c[1] - c[0] - 0.3, c[2] - c[1] - 0.3, c[3] - c[2] - 0.3, D - 0.8 - c[3]];
const RX = OX - VP.e; // rotor centre (viewBox units)

// ---- rotation schedule (seconds from scene start): starts with seg 2, accelerates, then constant speed
const ts = c[1] + 0.4, ta = 1.4;
const w = 150 / (c[3] - c[2]); // the chamber travels 150° during seg 3 (lower left → right)
const gfn = (u) => (u <= 0 ? 0 : u < ta ? (u * u) / (2 * ta) : u - ta / 2);
const rel = (tau) => -w * gfn(tau - ts); // negative = counter-clockwise
const psi0 = 150 - 22.5 - rel(c[2]); // chamber centre (22.5° in rotor frame) sits at 150° when seg 3 starts
const rotFn = (t) => psi0 + rel(t - b);
// vane extension: a short in-out slide at the end of seg 1, then thrown out onto the ring during seg 2
const tb0 = c[0] + 0.72 * L[0], tb1 = c[1] - 0.2, tx0 = c[1] + 0.36 * L[1];
const extFn = (t) => {
  const tau = t - b;
  if (tau < tx0) return tau > tb0 && tau < tb1 ? 0.55 * Math.sin((Math.PI * (tau - tb0)) / (tb1 - tb0)) : 0;
  return H.vpStep(tau, tx0, tx0 + 1.0);
};
H.vpSpin(P, b, b + D, rotFn, extFn);

// ---- labels and marks (viewBox units)
const lab = H.$("s3-v-lab");
const at = (deg, r) => [RX + r * Math.cos((deg * Math.PI) / 180), OY + r * Math.sin((deg * Math.PI) / 180)];
const nearest = (target, base) => base + 45 * Math.round((target - base) / 45); // vane angle closest to target
const label = (id, lines, x, y, o = {}) => {
  const g = H.el("g", { id, opacity: 0 }, lab);
  lines.forEach((s, i) => H.text(g, x, y + i * 36, s, { size: o.size || 28, anchor: o.anchor || "start", fill: o.fill || HC.ink }));
  if (o.to) {
    const [x1, y1, x2, y2] = o.to;
    H.el("path", { id: `${id}-ld`, d: `M ${H.f(x1)} ${H.f(y1)} L ${H.f(x2)} ${H.f(y2)}`, fill: "none", stroke: o.fill || HC.ink, "stroke-width": 3 }, g);
    H.el("circle", { cx: H.f(x2), cy: H.f(y2), r: 6, fill: o.fill || HC.ink }, g);
  }
  return g;
};
const show = (el, t) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35 }, b + t);
const hide = (el, t) => tl.to(el, { opacity: 0, duration: 0.3 }, b + t);

// seg 1: rotor, ring, vane (rotor is still; leaders point at the parts at rest)
const aRotor = nearest(200, psi0 + 22.5), aVane = nearest(-135, psi0);
const pR = at(aRotor, 95), pV = at(aVane, 118);
const lRotor = label("s3-v-lr", ["Rotor", "(โรเตอร์)"], 22, 300, { to: [138, 312, pR[0], pR[1]] });
const lRing = label("s3-v-lc", ["Cam ring (วงแหวน)"], 672, 486, { to: [664, 476, OX + 191 * Math.cos(0.7), OY + 191 * Math.sin(0.7)] });
const lVane = label("s3-v-lv", ["Vane", "(แผ่นใบ)"], 30, 84, { to: [142, 110, pV[0], pV[1]] });
show(lRotor, c[0] + 0.25 * L[0]);
show(lRing, c[0] + 0.4 * L[0]);
show(lVane, c[0] + 0.62 * L[0]);
tl.to(P.vanes, { attr: { fill: HC.blue }, duration: 0.3, yoyo: true, repeat: 3 }, b + c[0] + 0.62 * L[0]);
// leaders of the rotating parts go once the rotor turns (the text stays)
hide(["#s3-v-lr-ld", "#s3-v-lv-ld", "#s3-v-lr circle", "#s3-v-lv circle"], ts + 0.2);

// seg 2: drive shaft + rotation arrow, centrifugal force, pump chamber
const pS = at(135, VP.shaft);
const lShaft = label("s3-v-ls", ["Drive shaft", "(เพลาขับ)"], 22, 548, { to: [186, 540, pS[0], pS[1]] });
show(lShaft, c[1] + 0.05);
const dir = H.el("g", { id: "s3-v-dir", opacity: 0 }, lab);
{
  const r = 54, a0 = -150, a1 = 30;
  const arc = H.arcD(RX, OY, r, a0, a1);
  const [hx, hy] = at(a0, r), tx = Math.sin((a0 * Math.PI) / 180), ty = -Math.cos((a0 * Math.PI) / 180);
  // (tx, ty) = counter-clockwise tangent at the start of the arc; the head points that way, its base lies on the arc
  const head = `M ${H.f(hx - tx * 20 + ty * 12)} ${H.f(hy - ty * 20 - tx * 12)} L ${H.f(hx)} ${H.f(hy)} L ${H.f(hx - tx * 20 - ty * 12)} ${H.f(hy - ty * 20 + tx * 12)}`;
  for (const [col, sw] of [["#ffffff", 13], [HC.blue, 7]]) {
    H.el("path", { d: arc, fill: "none", stroke: col, "stroke-width": sw, "stroke-linecap": "round" }, dir);
    H.el("path", { d: head, fill: "none", stroke: col, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" }, dir);
  }
}
show(dir, c[1] + 0.05);
const cf = H.el("g", { id: "s3-v-cf", opacity: 0 }, lab);
for (const a of [-60, 60, 180]) {
  const [x1, y1] = at(a, 66), [x2, y2] = at(a, 136);
  H.el("path", { d: H.arrowD(x1, y1, x2, y2, 20), fill: "none", stroke: "#ffffff", "stroke-width": 13, "stroke-linecap": "round", "stroke-linejoin": "round" }, cf);
  H.el("path", { d: H.arrowD(x1, y1, x2, y2, 20), fill: "none", stroke: HC.blue, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, cf);
}
H.text(cf, 672, 190, "แรงหนีศูนย์กลาง", { size: 30, fill: HC.blue });
H.text(cf, 672, 226, "(Centrifugal force)", { size: 28, fill: HC.blue });
show(cf, c[1] + 0.3 * L[1]);
hide(cf, c[2] - 0.1);
const lCh = label("s3-v-lch", ["ห้องปั๊ม (Pump chamber)"], 672, 322, { to: [664, 312, OX + 150, OY + 6] });
show(lCh, c[1] + 0.74 * L[1]);
show(P.chambers[0], c[2] - 0.6);
// the opposite chamber joins once the first has passed the wide side: one sucks while the other pushes
show(P.chambers[1], c[3] + 0.4);

// seg 3: eccentric marks (ring centre O vs rotor centre O'), suction at the bottom
const ecc = H.el("g", { id: "s3-v-ecc", opacity: 0 }, lab);
// centre lines of the ring (ink, dash-dot) and of the rotor (blue); offset e dimensioned below the shaft
H.el("path", { d: `M ${OX - 215} ${OY} L ${OX + 215} ${OY} M ${OX} ${OY - 215} L ${OX} ${OY + 215}`, fill: "none", stroke: HC.ink, "stroke-width": 2.5, "stroke-dasharray": "22 6 4 6", opacity: 0.8 }, ecc);
const eY = OY + 104;
for (const [col, sw] of [["#ffffff", 9], [HC.blue, 4]]) {
  H.el("path", { d: `M ${RX} ${OY} L ${RX} ${eY + 12} M ${OX} ${OY + 40} L ${OX} ${eY + 12}`, fill: "none", stroke: col, "stroke-width": sw - 1 }, ecc);
  H.el("path", { d: H.dimD(RX, eY, OX, eY, 11), fill: "none", stroke: col, "stroke-width": sw, "stroke-linejoin": "round" }, ecc);
  H.el("path", { d: `M 664 200 L ${OX + 8} ${eY - 4}`, fill: "none", stroke: col, "stroke-width": sw - 1 }, ecc);
}
H.el("circle", { cx: OX, cy: OY, r: 7, fill: HC.ink, stroke: "#ffffff", "stroke-width": 2 }, ecc);
H.el("circle", { cx: RX, cy: OY, r: 7, fill: HC.blue, stroke: "#ffffff", "stroke-width": 2 }, ecc);
H.text(ecc, 672, 190, "Rotor เยื้องศูนย์", { size: 30, fill: HC.blue });
H.text(ecc, 672, 226, "(Eccentric)", { size: 28, fill: HC.blue });
show(ecc, c[2] + 0.1);
const arcArrow = (id, a0, a1) => {
  // arc around the ring centre inside the oil, from a0 to a1 (counter-clockwise), arrowhead at a1
  const g = H.el("g", { id, opacity: 0 }, lab), r = 163;
  const d = H.arcD(OX, OY, r, a1, a0);
  const p = (a) => [OX + r * Math.cos((a * Math.PI) / 180), OY + r * Math.sin((a * Math.PI) / 180)];
  const [hx, hy] = p(a1), [bx, by] = p(a1 + 9);
  for (const [col, sw] of [["#ffffff", 12], [HC.blue, 6]]) {
    H.el("path", { d, fill: "none", stroke: col, "stroke-width": sw, "stroke-linecap": "round" }, g);
    H.el("path", { d: H.arrowD(bx, by, hx, hy, 18), fill: "none", stroke: col, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  }
  return g;
};
const tIn = c[2] + 0.5 * L[2];
const lIn = label("s3-v-lin", ["ช่องดูด (Intake): ห้องขยาย → ดูด"], 470, 604, { fill: HC.blue });
show(lIn, tIn);
H.vpFlow(P.flowIn, P.headIn, b + tIn, D - tIn);
show(arcArrow("s3-v-ain", 112, 30), tIn);

// seg 4: discharge at the top
const tOut = c[3] + 0.35 * L[3];
const lOut = label("s3-v-lout", ["ช่องส่ง (Discharge): ห้องหด → ส่ง"], 470, 56, { fill: HC.blue });
show(lOut, tOut);
H.vpFlow(P.flowOut, P.headOut, b + tOut, D - tOut);
show(arcArrow("s3-v-aout", -30, -112), tOut);
