// Function: pneumatic devices need lubrication (cue 1) → the lubricator mixes oil mist into the air and sends it
// to them (cue 2); its parts are labelled during cue 2.
{
  const root = H.$("s2-v-art"), c = T.cues;
  // downstream piping first (under the lubricator's OUT stub)
  const P = H.el("g", { id: "s2-v-pipe" }, root);
  const toValve = "M 700 275 H 790 V 175 H 852";
  const toCyl = "M 880 214 V 262 H 810 V 330";
  LU.tube(P, toValve); LU.tube(P, toCyl); LU.tube(P, "M 940 214 V 330");
  const airA = LU.dash(P, "s2-v-a1", toValve, { w: 4 });
  const airB = LU.dash(P, "s2-v-a2", toCyl, { w: 4 });
  // oil mist rides the air: round dots marching along the pipes
  const mistA = LU.dash(P, "s2-v-m1", toValve, { color: LU.oil, w: 9, dash: "0.1 22", cap: "round" });
  const mistB = LU.dash(P, "s2-v-m2", toCyl, { color: LU.oil, w: 9, dash: "0.1 22", cap: "round" });

  // lubricator, outside view
  const g = H.el("g", { transform: "translate(130 70) scale(0.72)" }, root);
  const U = LU.unit(g, "s2-v-u", { cut: false });

  // solenoid valve (body + coil) and air cylinder (barrel, piston + rod)
  const V = H.el("g", { id: "s2-v-sv" }, root);
  H.el("rect", { x: 852, y: 140, width: 160, height: 74, rx: 8, fill: LU.metal, stroke: LU.ink, "stroke-width": 4 }, V);
  H.el("rect", { x: 900, y: 92, width: 64, height: 48, rx: 6, fill: LU.knob, stroke: LU.ink, "stroke-width": 4 }, V);
  for (let y = 100; y <= 132; y += 8) H.el("line", { x1: 906, y1: y, x2: 958, y2: y, stroke: "#c9ced4", "stroke-width": 2 }, V);
  H.text(V, 932, 72, "Solenoid valve", { size: 24, anchor: "middle" });
  const C = H.el("g", { id: "s2-v-cyl" }, root);
  H.el("rect", { x: 770, y: 330, width: 190, height: 76, rx: 6, fill: LU.tint, stroke: LU.ink, "stroke-width": 5 }, C);
  const rod = H.el("g", { id: "s2-v-rod" }, C);
  H.el("rect", { x: 798, y: 362, width: 202, height: 14, fill: LU.dark, stroke: LU.ink, "stroke-width": 3 }, rod);
  H.el("rect", { x: 790, y: 334, width: 22, height: 68, fill: LU.dark, stroke: LU.ink, "stroke-width": 3 }, rod);
  H.text(C, 865, 450, "Air cylinder", { size: 24, anchor: "middle" });
  // "needs lubrication" marks on the moving parts
  const need = H.el("g", { id: "s2-v-need", opacity: 0 }, root);
  H.el("circle", { cx: 932, cy: 177, r: 52, fill: "none", stroke: LU.yellow, "stroke-width": 6 }, need);
  H.el("circle", { cx: 801, cy: 368, r: 48, fill: "none", stroke: LU.yellow, "stroke-width": 6 }, need);

  // part labels (cue 3)
  const L = H.el("g", { id: "s2-v-lb", opacity: 0 }, root);
  LU.label(L, "s2-v-l1", 20, 62, "Oil drop window", 380, 160, { sub: "หน้าต่างดูหยด", fx: 236, fy: 70 });
  LU.label(L, "s2-v-l2", 560, 40, "Drop adjust screw", 497, 82, { sub: "สกรูปรับหยด", fx: 556, fy: 50 });
  LU.label(L, "s2-v-l3", 20, 196, "Oil cap", 268, 213, { sub: "ฝาเติมน้ำมัน", fx: 118, fy: 204 });
  LU.label(L, "s2-v-l4", 20, 470, "Bowl", 325, 450, { sub: "ถ้วยน้ำมัน", fx: 84, fy: 478 });

  // cue 1: devices work — the rod strokes out and back, marks show where lubrication is needed
  const t1 = b + c[0] + 0.4;
  LU.flow([airA.id, airB.id], b + 0.4, b + D, { speed: 80 });
  LU.flow([U.air.in, U.air.out], b + 0.4, b + D, { speed: 80 });
  tl.fromTo(rod, { x: 0 }, { x: 80, duration: 0.9, ease: "power2.inOut" }, t1);
  tl.fromTo(rod, { x: 80 }, { x: 0, duration: 0.9, ease: "power2.inOut", immediateRender: false }, t1 + 1.3);
  LU.show(need, t1 + 0.3);
  tl.fromTo(need, { opacity: 1 }, { opacity: 0, duration: 0.4, immediateRender: false }, b + c[1] + 0.2);
  // cue 2: drops in the dome, mist out of OUT and along the pipes to the devices
  const t2 = b + c[1];
  LU.drops(U, "s2-v-u", LU.every(t2 + 0.1, b + D - 1, 1.1), { outside: [672, 285], mistTo: 800, n: 7, seed: 5 });
  LU.flow([mistA.id], t2 + 1.0, b + D, { speed: 90, period: 22.1 });
  LU.flow([mistB.id], t2 + 1.8, b + D, { speed: 90, period: 22.1 });
  tl.fromTo(rod, { x: 0 }, { x: 80, duration: 0.9, ease: "power2.inOut", immediateRender: false }, t2 + 2.2);
  tl.fromTo(rod, { x: 80 }, { x: 0, duration: 0.9, ease: "power2.inOut", immediateRender: false }, t2 + 3.5);
  // name the parts once the lubricator is introduced
  LU.show(L, b + c[1] + 2.0);
}
