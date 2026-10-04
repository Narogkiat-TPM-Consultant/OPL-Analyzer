// OPL 5-C-9 (p.30) simple check, 4 points on the installed solenoid valve (EP06 drawing + subplate, bolts, connectors):
// ① wipe the body with a rag first → look for a leak at the body / mounting joint · ② bolts and screws not loose ·
// ③ no growling "boon" while the solenoid is ON · ④ wiring and connections not damaged.
// Everything is drawn in the valve's local units inside one scaled group (scene = 38 + 1.15·x, 114 + 1.15·y).
{
  const c = T.cues;
  const S = H.el("g", { transform: "translate(38 114) scale(1.15)" }, "s5-v-sol");
  const W = H.e19Sol(S, "s5-v-v", { pipes: true });
  const V = W.V;
  const top = H.el("g", { id: "s5-v-top" }, S); // overlays above the valve

  // ① dirt / old oil film on the body and subplate, wiped off by the rag; then the leak shows at the joint
  const spots = [[250, 246], [420, 256], [612, 248], [330, 300], [560, 306], [690, 298]];
  const dirt = spots.map(([x, y]) => H.el("ellipse", { cx: x, cy: y, rx: 32, ry: 11, fill: E19.dirt, opacity: 0.55 }, top));
  const rag = H.el("g", { id: "s5-v-rag", opacity: 0 }, top);
  H.el("path", { d: "M 136 236 Q 162 226 188 233 Q 218 242 242 232 L 248 298 Q 222 308 192 300 Q 162 292 132 302 Z", fill: E19.rag, stroke: E19.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, rag);
  H.el("path", { d: "M 158 244 Q 166 268 158 294 M 196 242 Q 204 266 198 298 M 226 240 Q 232 262 226 294", fill: "none", stroke: "#9fb3cf", "stroke-width": 3 }, rag);
  const tw0 = b + c[0] + 2.0, twDur = 1.8, dx = 440, rag0 = 190;
  E19.op(rag, 0, 1, tw0 - 0.25, 0.25);
  tl.fromTo(rag, { x: 0 }, { x: dx, duration: twDur, ease: "sine.inOut" }, tw0);
  tl.fromTo(rag, { y: 0 }, { y: -7, duration: twDur / 6, yoyo: true, repeat: 5, ease: "sine.inOut" }, tw0);
  E19.op(rag, 1, 0, tw0 + twDur + 0.05, 0.25);
  // each smudge disappears when the rag's centre passes it
  dirt.forEach((e, i) => {
    const frac = Math.min(1, Math.max(0, (spots[i][0] - rag0) / dx));
    E19.op(e, 0.55, 0, tw0 + twDur * (0.12 + 0.8 * frac), 0.3);
  });
  const joint = H.el("path", { d: "M 132 270 H 758", fill: "none", stroke: E19.yel, "stroke-width": 7, "stroke-dasharray": "16 9", opacity: 0 }, top);
  const lJoint = RV.label(top, "s5-v-lj", 50, 434, "รอยต่อตัววาล์ว = จุดติดตั้ง", 160, 272, { fx: 110, fy: 414, size: 23 });
  lJoint.setAttribute("opacity", 0);
  const wet = H.el("path", { d: "M 636 272 Q 644 296 638 326", fill: "none", stroke: E19.oil, "stroke-width": 7, "stroke-linecap": "round", opacity: 0 }, top);
  const drop = E19.drop(top, 640, 336, 1.0);
  RV.ring(top, "s5-v-rl", 640, 284, 30);
  const tj = b + c[0] + 3.7;
  E19.op(joint, 0, 1, tj); E19.op(lJoint, 0, 1, tj);
  E19.op(wet, 0, 1, tj + 0.4);
  E19.drip(drop, tj + 0.4, b + c[1] + 0.9, 48, 1.1);
  RV.pulse("s5-v-rl", tj + 0.4, 2);
  E19.op(joint, 1, 0, b + c[1] - 0.1);

  // ② bolts and screws
  RV.ring(top, "s5-v-rb1", 180, 4, 28);
  RV.ring(top, "s5-v-rb2", 710, 4, 28);
  RV.ring(top, "s5-v-rs1", 88, 19, 20);
  RV.ring(top, "s5-v-rs2", 802, 19, 20);
  RV.pulse("s5-v-rb1", b + c[1] + 0.4, 1); RV.pulse("s5-v-rb2", b + c[1] + 0.4, 1);
  RV.pulse("s5-v-rs1", b + c[1] + 1.1, 1); RV.pulse("s5-v-rs2", b + c[1] + 1.1, 1);

  // ③ solenoid a ON → listen: a growling "boon" must not be there (waves under the coil = what to listen for)
  V.mid.setAttribute("fill", V6.pr);
  V.ports.P.setAttribute("fill", V6.pr);
  const ton = b + c[2] + 0.5, toff = b + c[3] + 0.05;
  V.coil("a", true, ton);
  V.shift(0, 1, ton + 0.25, 0.5);
  H.v6Paint(V, 0, 1, ton + 0.6);
  const wv = E19.waves(top, 88, 252, 90, { r: [22, 40, 58], span: 40, w: 5.5, id: "s5-v-wv" });
  wv.run(ton + 0.9, toff);
  const boon = H.text(top, -4, 352, "“บูน” ?", { size: 30, fill: E19.blue, id: "s5-v-boon" });
  boon.setAttribute("opacity", 0);
  E19.op(boon, 0, 1, ton + 1.0); E19.op(boon, 1, 0, toff);
  V.coil("a", false, toff);
  V.shift(1, 0, toff + 0.15, 0.5);
  H.v6Paint(V, 1, 0, toff + 0.2);

  // ④ wiring and connections: cables highlighted (under the cable), rings on the connectors
  const hl = W.cables.map((cab) => {
    const e = H.el("path", { d: cab.getAttribute("d"), fill: "none", stroke: E19.yel, "stroke-width": 18, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, W.w);
    W.w.insertBefore(e, W.cables[0]);
    return e;
  });
  RV.ring(top, "s5-v-rc1", 88, 48, 50);
  RV.ring(top, "s5-v-rc2", 802, 48, 50);
  hl.forEach((e) => E19.op(e, 0, 0.75, toff + 0.35));
  RV.pulse("s5-v-rc1", toff + 0.5, 1); RV.pulse("s5-v-rc2", toff + 0.5, 1);
}
