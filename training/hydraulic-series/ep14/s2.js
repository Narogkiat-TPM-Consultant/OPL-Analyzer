// Why the start-up check focuses on the pump (OPL 5-C-2, p.18): at start-up the oil is thick (high viscosity —
// the deck's sound table links low oil temperature to viscosity too high) and often holds air.
// Left: cold, thick oil crawls up the suction pipe (slow dashes), the rotor turns sluggishly, thermometer low.
// Right: air bubbles in the oil are drawn into the suction pipe and the pump.
// Banner: both pumps shake and get a caution badge ("ปั๊มผิดปกติได้ง่าย").
const tL = b + T.left, tR = b + T.right, tB = b + T.banner, tEnd = b + D;

// ---- left card
const A = SU.mini("s2-v-a", "s2-v-am", { oil: SC.thick });
const th = SU.thermo("s2-v-a", "s2-v-th", 560, 40, 168, 0.22, SC.blue);
H.text("s2-v-a", 600, 150, "เย็น", { size: 32, anchor: "start", fill: SC.blue });
H.text("s2-v-a", 600, 186, "(Low temp)", { size: 24, anchor: "start", fill: SC.muted });
// thick oil: a heavy drip hanging from the tank lid edge would be decoration — show the slow suction instead
SU.flow(A.flowEls, tL + 0.4, tEnd - tL - 0.4, 14);
tl.fromTo(A.rotor, { rotation: 0, svgOrigin: A.origin }, { rotation: 360 * Math.round((tEnd - tL - 0.4) * 0.35), svgOrigin: A.origin, duration: tEnd - tL - 0.4, ease: "none" }, tL + 0.4);
tl.fromTo(th.col, { attr: { y: 110, height: 64 } }, { attr: { y: 142, height: 32 }, duration: 0.9, ease: "power2.out" }, tL + 0.5);

// ---- right card: bubbles in the oil travel to the strainer, up the suction pipe, into the pump
const B = SU.mini("s2-v-b", "s2-v-bm");
SU.flow(B.flowEls, tR + 0.4, tEnd - tR - 0.4, 70);
tl.fromTo(B.rotor, { rotation: 0, svgOrigin: B.origin }, { rotation: 360 * Math.round((tEnd - tR - 0.4) * 1.2), svgOrigin: B.origin, duration: tEnd - tR - 0.4, ease: "none" }, tR + 0.4);
const bub = H.el("g", { id: "s2-v-bub" }, "s2-v-b");
// resting bubbles scattered in the oil (air held in the oil)
const rnd = (k) => { const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const rest = [];
for (let i = 0; i < 14; i++) {
  const x = 50 + 400 * rnd(i), y = 172 + 46 * rnd(i + 20);
  if (Math.abs(x - 160) < 34) continue;
  rest.push(H.el("circle", { cx: H.f(x), cy: H.f(y), r: H.f(4 + 4 * rnd(i + 40)), fill: "#ffffff", stroke: SC.blue, "stroke-width": 2.5 }, bub));
}
tl.fromTo(rest, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, tR + 0.2);
// moving bubbles: enter the strainer, rise in the pipe, vanish into the pump (finite, staggered)
for (let i = 0; i < 24; i++) {
  const t = tR + 0.6 + i * 0.32;
  if (t + 1.3 > tEnd) break;
  const x0 = 60 + 380 * rnd(i + 70), y0 = 176 + 40 * rnd(i + 90);
  const c = H.el("circle", { cx: H.f(x0), cy: H.f(y0), r: 6, fill: "#ffffff", stroke: SC.blue, "stroke-width": 2.5, opacity: 0 }, bub);
  tl.fromTo(c, { opacity: 1, x: 0, y: 0 }, { x: 160 - x0, y: 200 - y0, duration: 0.6, ease: "power1.in", immediateRender: false }, t);
  tl.fromTo(c, { x: 160 - x0, y: 200 - y0 }, { y: 100 - y0, duration: 0.6, ease: "none", immediateRender: false }, t + 0.6);
  tl.fromTo(c, { opacity: 1 }, { opacity: 0, duration: 0.12, immediateRender: false }, t + 1.15);
}
const air = SU.chip("s2-v-b", "s2-v-air", 600, 112, "ฟองอากาศ (Air)", { size: 26, anchor: "middle", color: SC.blue, stroke: SC.blue });
H.el("path", { id: "s2-v-airar", d: H.arrowD(560, 136, 470, 176, 14), fill: "none", stroke: SC.blue, "stroke-width": 4, opacity: 0 }, "s2-v-b");
SU.show(air, tR + 0.8);
SU.show("#s2-v-airar", tR + 0.9);

// ---- banner: both pumps under strain — shake + caution badge
for (const [P, card, id] of [[A, "s2-v-a", "s2-v-ca"], [B, "s2-v-b", "s2-v-cb"]]) {
  SU.shake(P.pump, tB + 0.2, tEnd, 2.4);
  const g = H.el("g", { id, opacity: 0 }, card);
  H.el("path", { d: "M 92 4 L 122 56 L 62 56 Z", fill: SC.warn, stroke: SC.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  H.el("rect", { x: 88.5, y: 20, width: 7, height: 20, rx: 3, fill: SC.ink }, g);
  H.el("circle", { cx: 92, cy: 47, r: 4.2, fill: SC.ink }, g);
  tl.fromTo(g, { opacity: 0, scale: 0.5, svgOrigin: "92 36" }, { opacity: 1, scale: 1, svgOrigin: "92 36", duration: 0.35, ease: "back.out(2.5)" }, tB + 0.15);
}
