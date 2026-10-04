// Why daily check: the four simple causes of p.17 happen on the unit in step with the narration.
// cue 2 lock nut loosens → handle turns → gauge leaves the set mark · cue 3 oil level drops below L ·
// cue 4 tube fitting loosens → oil drips onto the lid · cue 5 air bubbles in the pressure line ·
// cue 6 the daily round (eye) finds all four.
const U = H.dcUnit("s2-v-u", "s2-v-un", { labels: ["tank", "pump", "motor", "relief", "gauge", "fitting", "level", "circuit", "handle"] });
const fx = H.$("s2-v-fx"), c = T.cues;
H.text(fx, 646, 68, "ค่าตั้ง", { size: 20, fill: DC.blue });
tl.fromTo(U.flow, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, b + 0.4);
tl.fromTo(U.flow, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((D - 0.4) * 3), duration: D - 0.4, ease: "none", immediateRender: false }, b + 0.4);

// ① lock nut of the pressure-adjust handle loosens; handle unscrews; set pressure changes
const t1 = b + c[1];
H.ring(fx, "s2-v-r1", 760, 104, 50, t1 + 0.2, 3);
tl.fromTo(U.lock, { y: 0 }, { y: -6, duration: 0.5, ease: "power2.inOut" }, t1 + 0.7);
tl.fromTo(U.lgap, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 0.9);
const turn = H.el("path", { id: "s2-v-turn", d: "M 714 74 A 46 13 0 0 0 806 74 M 794 64 L 806 74 L 792 82", fill: "none", stroke: DC.blue, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, fx);
tl.fromTo(turn, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t1 + 1.2);
tl.fromTo(U.handle, { y: 0 }, { y: -4, duration: 0.6, ease: "power1.inOut" }, t1 + 1.3);
tl.fromTo(U.gauge.needle, { rotation: U.gauge.rot(6), svgOrigin: U.gauge.origin }, { rotation: U.gauge.rot(4.3), svgOrigin: U.gauge.origin, duration: 1.1, ease: "power2.inOut" }, t1 + 1.7);
tl.fromTo(turn, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t1 + 2.6);

// ② oil level drops below L
const t2 = b + c[2];
H.dcLevel(U, DU.low, t2 + 0.1, 1.0);
const box = H.el("rect", { id: "s2-v-lv", x: 676, y: 408, width: 68, height: 188, rx: 14, fill: "none", stroke: DC.red, "stroke-width": 6, opacity: 0 }, fx);
tl.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t2 + 0.3);

// ③ tube fitting loosens → oil drips onto the lid
const t3 = b + c[3];
tl.fromTo(U.nut, { x: 0 }, { x: 8, duration: 0.45, ease: "power2.out" }, t3 + 0.1);
tl.fromTo(U.gap, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t3 + 0.3);
H.ring(fx, "s2-v-r3", 536, 196, 36, t3 + 0.1, 2);
H.dcLeak(U, t3 + 0.5, b + D - 0.2);

// ④ air mixed in the oil: bubbles travel along the pressure line
const t4 = b + c[4];
for (let i = 0; i < 6; i++) {
  const bub = H.el("circle", { id: `s2-v-bb${i}`, cx: 0, cy: 196, r: 6.5, fill: "#ffffff", stroke: DC.ink, "stroke-width": 2.2, opacity: 0 }, fx);
  const xAt = (t) => 432 + ((Math.max(0, t - t4) * 150 + i * 78) % 456);
  // hidden while passing behind the fitting and the relief-valve body
  const vis = (x) => (x > 500 && x < 556) || (x > 712 && x < 808) ? 0 : 1;
  H.fnTo(bub, "x", xAt, t4, b + D);
  H.fnTo(bub, "opacity", (t) => (t < t4 + 0.08 * i ? 0 : vis(xAt(t))), t4, b + D);
}
H.chip(fx, "s2-v-air", 650, 300, "ฟองอากาศ (Air)", { size: 22, stroke: DC.blue, color: DC.blue, opacity: 0 });
tl.fromTo("#s2-v-air", { opacity: 0 }, { opacity: 1, duration: 0.3 }, t4 + 0.4);

// ⑤ the daily round finds them: eye badge + blue check rings on the four spots
const t5 = b + c[5];
const eye = H.dcBadge(fx, "s2-v-eye", "eye", 196, 120, 46);
tl.fromTo(eye, { opacity: 0, scale: 0.4, svgOrigin: "196 120" }, { opacity: 1, scale: 1, svgOrigin: "196 120", duration: 0.35, ease: "back.out(2)" }, t5);
[[760, 104, 58, 58], [710, 502, 40, 96], [536, 196, 40, 40], [650, 196, 40, 40]].forEach(([x, y, rx, ry], i) => {
  const ck = H.el("rect", { id: `s2-v-ck${i}`, x: x - rx, y: y - ry, width: 2 * rx, height: 2 * ry, rx: Math.min(rx, ry), fill: "none", stroke: DC.blue, "stroke-width": 5, "stroke-dasharray": "10 7", opacity: 0 }, fx);
  tl.fromTo(ck, { opacity: 0, scale: 1.3, svgOrigin: `${x} ${y}` }, { opacity: 1, scale: 1, svgOrigin: `${x} ${y}`, duration: 0.3 }, t5 + 0.3 + 0.25 * i);
});
