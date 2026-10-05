// Drain forms at night: sky turns to night and the thermometer drops (cue 1); moisture in the air condenses into
// drops on the pipe wall, which run to the low point (drop leg) and collect as drain (cue 2); once a day the
// drain cock is opened and the drain is let out (cue 3).
{
  const g = H.$("s3-v-art"), c = T.cues;
  const t1 = b + c[0] + 0.1, t2 = b + c[1] + 0.1, t3 = b + c[2] + 0.1;
  const DAY = "#cfe8f7", NIGHT = "#22304d";

  // --- sky: sun sets, moon and stars come out
  const sky = H.el("rect", { id: "s3-v-sky", x: 20, y: 20, width: 380, height: 200, rx: 18, fill: DAY, stroke: P26.ink, "stroke-width": 4 }, g);
  const sun = H.el("circle", { cx: 110, cy: 104, r: 34, fill: P26.yellow, stroke: P26.ink, "stroke-width": 3 }, g);
  const moon = H.el("g", { id: "s3-v-moon", opacity: 0 }, g);
  H.el("circle", { cx: 300, cy: 104, r: 32, fill: "#f5f1e8" }, moon);
  H.el("circle", { cx: 316, cy: 92, r: 28, fill: NIGHT }, moon);
  const stars = H.el("g", { id: "s3-v-stars", opacity: 0 }, g);
  for (const [x, y] of [[70, 60], [150, 150], [210, 70], [250, 170], [360, 150], [120, 190]]) H.el("circle", { cx: x, cy: y, r: 3.5, fill: "#ffffff" }, stars);
  const lDay = H.text(g, 382, 200, "กลางวัน", { size: 26, anchor: "end" });
  const lNight = H.text(g, 382, 200, "กลางคืน", { size: 26, anchor: "end", fill: "#ffffff" });
  lNight.setAttribute("opacity", 0);

  // --- thermometer: warm (amber) → cold (blue)
  H.el("rect", { x: 452, y: 34, width: 28, height: 160, rx: 14, fill: "#ffffff", stroke: P26.ink, "stroke-width": 4 }, g);
  const bulb = H.el("circle", { cx: 466, cy: 196, r: 22, fill: P26.yellow, stroke: P26.ink, "stroke-width": 4 }, g);
  const col = H.el("rect", { x: 459, y: 56, width: 14, height: 140, fill: P26.yellow }, g);
  for (let i = 0; i < 6; i++) H.el("line", { x1: 486, y1: 56 + i * 22, x2: 498, y2: 56 + i * 22, stroke: P26.ink, "stroke-width": 3 }, g);
  const tLab = H.text(g, 510, 140, "อุณหภูมิลด", { size: 26, fill: P26.pipe });
  tLab.setAttribute("opacity", 0);

  // --- condensation legend (top right)
  const lg = H.el("g", { id: "s3-v-lg", opacity: 0 }, g);
  for (const [x, y] of [[700, 92], [722, 112], [742, 88], [716, 72], [748, 116]]) H.el("circle", { cx: x, cy: y, r: 5, fill: "#ffffff", stroke: "#7fb3dc", "stroke-width": 2 }, lg);
  H.text(lg, 724, 160, "ความชื้น", { size: 24, anchor: "middle", fill: P26.muted });
  H.el("path", { d: H.arrowD(780, 98, 880, 98, 16), fill: "none", stroke: P26.ink, "stroke-width": 5 }, lg);
  H.text(lg, 830, 76, "เย็นตัว", { size: 22, anchor: "middle", fill: P26.muted });
  P26.drop(lg, 930, 102, 16);
  H.text(lg, 930, 160, "หยดน้ำ", { size: 24, anchor: "middle", fill: P26.water });

  // --- main pipe (cut-away) with a drop leg + drain cock at the low point
  P26.tubeH(g, 20, 1080, 290, 350, { gaps: [[700, 760]] });
  P26.tubeV(g, 700, 760, 350, 500);
  const water = H.el("rect", { id: "s3-v-water", x: 700, y: 500, width: 60, height: 0, fill: P26.water }, g);
  const ck = P26.drainCock(g, 730, 500, "s3-v-ck", 84);
  const flow = P26.dash(g, "M 20 320 L 1080 320", { id: "s3-v-flow" });
  P26.dashRun([flow], b + 0.3, D - 0.3);

  // moisture dots carried in the air (fade when it condenses)
  const vg = H.el("g", { id: "s3-v-vap" }, g);
  const vys = [302, 336, 314, 342, 306, 326, 338, 310, 330, 318, 300, 334, 312, 328];
  const vap = vys.map((y) => H.el("circle", { cx: 22, cy: y, r: 4.5, fill: "#ffffff", stroke: "#7fb3dc", "stroke-width": 2 }, vg));
  P26.stream(vap, 1050, b, D, 120);

  // cooling label on the pipe
  const cool = H.text(g, 30, 404, "ท่อลมเย็นตัว", { size: 26, fill: P26.pipe });
  cool.setAttribute("opacity", 0);

  // drain labels (left of the leg)
  const dl = H.el("g", { id: "s3-v-dl", opacity: 0 }, g);
  H.text(dl, 680, 452, "Drain", { size: 38, anchor: "end", fill: P26.water });
  H.text(dl, 680, 486, "จุดต่ำ (Low point)", { size: 22, anchor: "end", fill: P26.muted });
  H.el("path", { d: "M 686 440 L 712 462", stroke: P26.ink, "stroke-width": 3 }, dl);

  // calendar: once a day
  const cal = H.el("g", { id: "s3-v-cal", opacity: 0 }, g);
  H.el("rect", { x: 880, y: 392, width: 190, height: 170, rx: 14, fill: "#ffffff", stroke: P26.ink, "stroke-width": 4 }, cal);
  H.el("rect", { x: 880, y: 392, width: 190, height: 44, rx: 14, fill: P26.pipe }, cal);
  H.el("rect", { x: 880, y: 420, width: 190, height: 16, fill: P26.pipe }, cal);
  for (const x of [925, 1025]) H.el("rect", { x: x - 5, y: 378, width: 10, height: 28, rx: 5, fill: P26.ink }, cal);
  H.text(cal, 975, 426, "ทุกวัน (Daily)", { size: 22, anchor: "middle", fill: "#ffffff" });
  H.text(cal, 975, 500, "1 ครั้ง", { size: 44, anchor: "middle", fill: P26.ink });
  H.text(cal, 975, 540, "ต่อวัน", { size: 24, anchor: "middle", fill: P26.muted });

  // cup under the drain cock + jet
  H.el("path", { d: "M 686 566 L 696 620 L 764 620 L 774 566", fill: P26.bowl, stroke: P26.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  const cupW = H.el("rect", { x: 696, y: 616, width: 68, height: 0, fill: P26.water }, g);
  const jet = H.el("path", { d: "M 730 558 L 730 612", fill: "none", stroke: P26.water, "stroke-width": 9, "stroke-dasharray": "10 6", opacity: 0 }, g);

  // --- cue 1: night falls, temperature drops, the pipe cools
  tl.fromTo(sky, { attr: { fill: DAY } }, { attr: { fill: NIGHT }, duration: 1.2 }, t1);
  tl.fromTo(sun, { y: 0, opacity: 1 }, { y: 60, opacity: 0, duration: 1.0, ease: "power1.in" }, t1);
  tl.fromTo(moon, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, t1 + 0.6);
  tl.fromTo(stars, { opacity: 0 }, { opacity: 1, duration: 0.6 }, t1 + 0.9);
  tl.fromTo(lDay, { opacity: 1 }, { opacity: 0, duration: 0.3 }, t1 + 0.4);
  tl.fromTo(lNight, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 0.7);
  tl.fromTo(col, { attr: { y: 56, height: 140, fill: P26.yellow } }, { attr: { y: 136, height: 60, fill: P26.pipe }, duration: 1.4, ease: "power2.inOut" }, t1 + 0.3);
  tl.fromTo(bulb, { attr: { fill: P26.yellow } }, { attr: { fill: P26.pipe }, duration: 1.4 }, t1 + 0.3);
  tl.fromTo(tLab, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 1.2);
  tl.fromTo(cool, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.35 }, t1 + 1.6);

  // --- cue 2: moisture condenses into drops that run to the low point → drain collects
  tl.fromTo(lg, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t2);
  tl.fromTo(vg, { opacity: 1 }, { opacity: 0.25, duration: 0.8 }, t2 + 0.5);
  const forms = [[90, 0.4], [210, 0.7], [330, 1.0], [460, 0.6], [580, 1.2], [870, 0.8], [990, 1.1], [150, 1.6], [400, 1.9], [930, 1.7], [620, 2.2], [270, 2.5]];
  forms.forEach(([x0, dt], i) => {
    const d = P26.drop(g, x0, 340, 8, { attrs: { id: `s3-v-d${i}`, opacity: 0 } });
    const dx = 730 - x0, slide = Math.abs(dx) / 380, at = t2 + 0.5 + dt;
    tl.fromTo(d, { opacity: 1, scale: 0, svgOrigin: `${x0} 349` }, { scale: 1, svgOrigin: `${x0} 349`, duration: 0.35, ease: "back.out(2)" }, at);
    tl.fromTo(d, { x: 0 }, { x: dx, duration: slide, ease: "power1.in", immediateRender: false }, at + 0.45);
    tl.fromTo(d, { y: 0, opacity: 1 }, { y: 130, opacity: 0, duration: 0.45, ease: "power2.in", immediateRender: false }, at + 0.45 + slide);
  });
  tl.fromTo(water, { attr: { y: 500, height: 0 } }, { attr: { y: 400, height: 100 }, duration: c[2] - c[1] - 0.6, ease: "power1.in" }, t2 + 1.0);
  tl.fromTo(dl, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.35 }, t2 + 1.8);

  // --- cue 3: once a day — open the drain cock, the drain runs out into the cup
  tl.fromTo(cal, { opacity: 0, scale: 0.85, svgOrigin: "975 477" }, { opacity: 1, scale: 1, svgOrigin: "975 477", duration: 0.4, ease: "back.out(2)" }, t3);
  tl.fromTo(ck.lever, { rotation: 0, svgOrigin: ck.origin }, { rotation: -90, svgOrigin: ck.origin, duration: 0.5, ease: "power2.inOut" }, t3 + 0.6);
  tl.fromTo(jet, { opacity: 0 }, { opacity: 1, duration: 0.15 }, t3 + 1.0);
  tl.fromTo(jet, { strokeDashoffset: 0 }, { strokeDashoffset: -64, duration: 1.6, ease: "none", immediateRender: false }, t3 + 1.0);
  tl.fromTo(jet, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, t3 + 2.5);
  tl.fromTo(water, { attr: { y: 400, height: 100 } }, { attr: { y: 500, height: 0 }, duration: 1.5, ease: "power1.in", immediateRender: false }, t3 + 1.0);
  tl.fromTo(cupW, { attr: { y: 616, height: 0 } }, { attr: { y: 592, height: 24 }, duration: 1.5, ease: "power1.out" }, t3 + 1.1);
}
