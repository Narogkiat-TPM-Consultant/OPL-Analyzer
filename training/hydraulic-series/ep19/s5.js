// OPL 5-C-9 (p.30) simple check, 4 points on the installed solenoid valve (EP06 drawing + subplate, bolts, connectors):
// ① wipe the body with a rag first → look for a leak at the body / mounting joint · ② bolts and screws not loose ·
// ③ no growling "boon" while the solenoid is ON · ④ wiring and connections not damaged.
{
  const c = T.cues, OX = 100, OY = 196;
  const S = H.el("g", { transform: `translate(${OX} ${OY})` }, "s5-v-sol");
  const W = H.e19Sol(S, "s5-v-v", { pipes: true });
  const V = W.V, O = H.$("s5-v-ov");
  const X = (x) => OX + x, Y = (y) => OY + y;

  // ① dirt / old oil film on the body and subplate, wiped off by the rag; then the leak shows at the joint
  const spots = [[250, 246], [420, 256], [612, 248], [330, 300], [560, 306], [690, 298]];
  const dirt = spots.map(([x, y]) => H.el("ellipse", { cx: X(x), cy: Y(y), rx: 36, ry: 13, fill: E19.dirt, opacity: 0.55 }, O));
  const rag = H.el("g", { id: "s5-v-rag", opacity: 0 }, O);
  H.el("path", { d: "M 196 432 Q 226 420 256 428 Q 290 438 318 426 L 324 500 Q 296 512 260 502 Q 226 494 192 506 Z", fill: E19.rag, stroke: E19.ink, "stroke-width": 3.5, "stroke-linejoin": "round" }, rag);
  H.el("path", { d: "M 222 440 Q 230 468 220 496 M 268 438 Q 278 466 270 500 M 300 436 Q 306 462 298 498", fill: "none", stroke: "#9fb3cf", "stroke-width": 3 }, rag);
  const tw0 = b + c[0] + 2.0, twDur = 1.8, dx = 480;
  E19.op(rag, 0, 1, tw0 - 0.25, 0.25);
  tl.fromTo(rag, { x: 0 }, { x: dx, duration: twDur, ease: "sine.inOut" }, tw0);
  tl.fromTo(rag, { y: 0 }, { y: -8, duration: twDur / 6, yoyo: true, repeat: 5, ease: "sine.inOut" }, tw0);
  E19.op(rag, 1, 0, tw0 + twDur + 0.05, 0.25);
  // each smudge disappears when the rag's centre (scene x 258 + travelled distance) passes it
  dirt.forEach((e, i) => {
    const frac = Math.min(1, Math.max(0, (X(spots[i][0]) - 258) / dx));
    E19.op(e, 0.55, 0, tw0 + twDur * (0.15 + 0.8 * frac), 0.3);
  });
  const joint = H.el("path", { d: `M ${X(132)} ${Y(270)} H ${X(758)}`, fill: "none", stroke: E19.yel, "stroke-width": 8, "stroke-dasharray": "18 10", opacity: 0 }, O);
  const lJoint = RV.label(O, "s5-v-lj", 96, 612, "รอยต่อตัววาล์ว = จุดติดตั้ง", X(160), Y(272), { fx: 170, fy: 588 });
  lJoint.setAttribute("opacity", 0);
  const drop = E19.drop(O, X(640), Y(292), 1.1);
  RV.ring(O, "s5-v-rl", X(640), Y(276), 34);
  const tj = b + c[0] + 3.7;
  E19.op(joint, 0, 1, tj); E19.op(lJoint, 0, 1, tj);
  E19.drip(drop, tj + 0.4, b + c[1] + 0.9, 62, 1.1);
  RV.pulse("s5-v-rl", tj + 0.4, 2);
  E19.op(joint, 1, 0, b + c[1] - 0.1);

  // ② bolts and screws
  RV.ring(O, "s5-v-rb1", X(180), Y(4), 30);
  RV.ring(O, "s5-v-rb2", X(710), Y(4), 30);
  RV.ring(O, "s5-v-rs1", X(88), Y(19), 22);
  RV.ring(O, "s5-v-rs2", X(802), Y(19), 22);
  RV.pulse("s5-v-rb1", b + c[1] + 0.4, 1); RV.pulse("s5-v-rb2", b + c[1] + 0.4, 1);
  RV.pulse("s5-v-rs1", b + c[1] + 1.1, 1); RV.pulse("s5-v-rs2", b + c[1] + 1.1, 1);

  // ③ solenoid a ON → listen: a growling "boon" must not be there
  V.mid.setAttribute("fill", V6.pr);
  V.ports.P.setAttribute("fill", V6.pr);
  const ton = b + c[2] + 0.5, toff = b + c[3] + 0.05;
  V.coil("a", true, ton);
  V.shift(0, 1, ton + 0.25, 0.5);
  H.v6Paint(V, 0, 1, ton + 0.6);
  const wv = E19.waves(O, X(-2), Y(160), 180, { r: [30, 52, 74], span: 34, id: "s5-v-wv" });
  wv.run(ton + 0.9, toff);
  const boon = H.text(O, 34, Y(282), "“บูน” ?", { size: 34, fill: E19.blue, id: "s5-v-boon" });
  boon.setAttribute("opacity", 0);
  E19.op(boon, 0, 1, ton + 1.0); E19.op(boon, 1, 0, toff);
  V.coil("a", false, toff);
  V.shift(1, 0, toff + 0.15, 0.5);
  H.v6Paint(V, 1, 0, toff + 0.2);

  // ④ wiring and connections
  const hl = W.cables.map((cab, i) => H.el("path", { d: cab.getAttribute("d"), transform: `translate(${OX} ${OY})`, fill: "none", stroke: E19.yel, "stroke-width": 18, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, O));
  // keep the highlight under the cable: move the overlays into the valve group, before the cables
  hl.forEach((e) => { e.removeAttribute("transform"); W.w.insertBefore(e, W.cables[0]); });
  RV.ring(O, "s5-v-rc1", X(88), Y(48), 54);
  RV.ring(O, "s5-v-rc2", X(802), Y(48), 54);
  hl.forEach((e) => E19.op(e, 0, 0.75, toff + 0.35));
  RV.pulse("s5-v-rc1", toff + 0.5, 1); RV.pulse("s5-v-rc2", toff + 0.5, 1);
}
