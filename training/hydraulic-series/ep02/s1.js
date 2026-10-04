// Title: a small cylinder lifts a heavy load (advantage) while a hose fitting drips oil (disadvantage).
{
  const g = H.$("s1-v-art");
  const R = (x, y, w, h, fill, o = {}) => H.el("rect", { x, y, width: w, height: h, rx: o.rx ?? 6, fill, stroke: E2.ink, "stroke-width": o.sw ?? 5, ...(o.id ? { id: o.id } : {}) }, o.p || g);

  // floor
  H.el("line", { x1: 165, y1: 600, x2: 1050, y2: 600, stroke: E2.ink, "stroke-width": 5 }, g);

  // power unit: tank + motor + pump
  R(770, 470, 270, 128, E2.oilBg);
  H.el("rect", { x: 775, y: 512, width: 260, height: 82, fill: E2.oil }, g);
  H.text(g, 905, 575, "ถังน้ำมัน", { size: 28, anchor: "middle" });
  R(800, 398, 110, 64, E2.metal, { rx: 8, sw: 4 });
  for (let i = 0; i < 5; i++) H.el("line", { x1: 816 + i * 20, y1: 402, x2: 816 + i * 20, y2: 458, stroke: E2.ink, "stroke-width": 2, opacity: 0.5 }, g);
  H.el("rect", { x: 910, y: 422, width: 16, height: 16, fill: E2.ink }, g);
  H.el("circle", { cx: 962, cy: 430, r: 34, fill: E2.dark, stroke: E2.ink, "stroke-width": 4 }, g);
  const rotor = H.el("g", { id: "s1-v-rotor" }, g);
  for (let i = 0; i < 3; i++) {
    const a = (Math.PI / 3) * i;
    H.el("line", { x1: H.f(962 - 24 * Math.cos(a)), y1: H.f(430 - 24 * Math.sin(a)), x2: H.f(962 + 24 * Math.cos(a)), y2: H.f(430 + 24 * Math.sin(a)), stroke: E2.ink, "stroke-width": 4 }, rotor);
  }
  H.text(g, 1002, 446, "ปั๊ม", { size: 26 });

  // pressure hose: pump → cylinder bottom port; white dashes = oil flow
  const hose = "M 962 396 L 962 360 L 470 360 L 470 560 L 404 560";
  H.el("path", { d: hose, fill: "none", stroke: E2.blue, "stroke-width": 12, "stroke-linejoin": "round" }, g);
  H.el("path", { id: "s1-v-flow", d: hose, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", opacity: 0 }, g);

  // leaking fitting on the hose
  H.el("rect", { x: 626, y: 344, width: 30, height: 32, rx: 4, fill: E2.dark, stroke: E2.ink, "stroke-width": 4 }, g);
  const puddle = H.el("ellipse", { id: "s1-v-puddle", cx: 641, cy: 600, rx: 58, ry: 9, fill: E2.oil, stroke: E2.ink, "stroke-width": 3 }, g);
  const drops = [0, 1, 2].map((i) => H.el("path", { class: "s1-v-drop", d: H.dropD(641, 392, 9), fill: E2.oil, stroke: E2.ink, "stroke-width": 2.5, opacity: 0 }, g));

  // cylinder: tube, oil under the piston, moving group (piston + rod + load)
  R(300, 330, 100, 260, E2.tube);
  const oil = H.el("rect", { id: "s1-v-oil", x: 305, y: 545, width: 90, height: 40, fill: E2.oil }, g);
  const mover = H.el("g", { id: "s1-v-mover" }, g);
  R(305, 520, 90, 25, E2.dark, { p: mover, rx: 3, sw: 3 });
  R(334, 300, 32, 220, E2.dark, { p: mover, rx: 2, sw: 3 });
  R(170, 150, 360, 152, "#4a515b", { p: mover, rx: 10 });
  for (let i = 0; i < 2; i++) H.el("line", { x1: 190, y1: 190 + i * 72, x2: 510, y2: 190 + i * 72, stroke: "#6b7380", "stroke-width": 4 }, mover);
  H.text(mover, 350, 238, "ภาระหนัก (Load)", { size: 38, fill: "#ffffff", anchor: "middle" });
  R(294, 322, 112, 16, E2.ink, { rx: 3, sw: 0 });
  R(282, 588, 136, 12, E2.ink, { rx: 2, sw: 0 });

  // badges: + advantage, − disadvantage
  const plus = H.el("g", { id: "s1-v-plus" }, g);
  H.el("circle", { cx: 610, cy: 120, r: 36, fill: E2.green }, plus);
  H.el("path", { d: "M 590 120 L 630 120 M 610 100 L 610 140", stroke: "#ffffff", "stroke-width": 9 }, plus);
  H.text(plus, 660, 133, "เล็ก แต่แรง", { size: 38, fill: E2.green });
  const minus = H.el("g", { id: "s1-v-minus" }, g);
  H.el("circle", { cx: 712, cy: 290, r: 32, fill: E2.red }, minus);
  H.el("path", { d: "M 694 290 L 730 290", stroke: "#ffffff", "stroke-width": 9 }, minus);
  H.text(minus, 758, 303, "น้ำมันรั่ว", { size: 34, fill: E2.red });

  // motion
  tl.fromTo(rotor, { rotation: 0, svgOrigin: "962 430" }, { rotation: 360 * Math.round(D * 1.5), duration: D, ease: "none" }, b);
  H.hydFlow(["s1-v-flow"], b + 0.5, D - 0.5);
  tl.fromTo(mover, { y: 0 }, { y: -90, duration: 1.8, ease: "power2.inOut" }, b + 1.0);
  tl.fromTo(oil, { attr: { y: 545, height: 40 } }, { attr: { y: 455, height: 130 }, duration: 1.8, ease: "power2.inOut" }, b + 1.0);
  tl.fromTo(plus, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)" }, b + 1.9);
  tl.fromTo(minus, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)" }, b + 2.9);
  const rep = Math.max(1, Math.floor((D - 3.4) / 1.35));
  tl.fromTo(drops, { y: 0, opacity: 1 }, { y: 200, opacity: 0.3, duration: 0.75, ease: "power1.in", stagger: 0.45, repeat: rep, repeatDelay: 0.6 }, b + 2.6);
  tl.fromTo(puddle, { scaleX: 0.1, scaleY: 0.4, svgOrigin: "641 600" }, { scaleX: 1, scaleY: 1, svgOrigin: "641 600", duration: D - 3.2, ease: "none" }, b + 3.1);
}
