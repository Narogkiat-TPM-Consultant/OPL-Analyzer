// Title: the same relief-valve symbol + gauge as EP05's title, now broken: the valve chatters (arrow jitters),
// oil keeps escaping to the tank, the needle wobbles below the setting and the valve squeals ("ปี๊~").
{
  const g = H.$("s1-v-sym");
  const pipe = (id, d) => H.el("path", { id, d, fill: "none", stroke: RV.blue, "stroke-width": 10, "stroke-linejoin": "round" }, g);
  pipe("s1-v-pl", "M 30 110 H 770");
  pipe("s1-v-br", "M 300 110 V 210");
  pipe("s1-v-out", "M 300 370 V 470");
  H.el("path", { d: "M 640 110 V 232", fill: "none", stroke: RV.blue, "stroke-width": 8 }, g);
  // tank
  H.el("path", { d: "M 245 430 V 492 H 355 V 430", fill: "none", stroke: RV.ink, "stroke-width": 6, "stroke-linejoin": "round" }, g);
  H.el("rect", { x: 248, y: 462, width: 104, height: 27, fill: RV.tank }, g);
  // pilot line, box + spring, arrow (as in EP05)
  H.el("path", { d: "M 300 150 H 160 V 290 H 220", fill: "none", stroke: RV.blue, "stroke-width": 5, "stroke-dasharray": "14 9" }, g);
  H.el("rect", { x: 220, y: 210, width: 160, height: 160, fill: RV.paper, stroke: RV.ink, "stroke-width": 6 }, g);
  H.el("path", { d: RV.springH(380, 470, 290, 18, 4), fill: "none", stroke: RV.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  const arr = H.el("path", { id: "s1-v-arr", d: H.arrowD(262, 232, 262, 346, 26), fill: "none", stroke: RV.ink, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  // flow dashes
  RV.dash(g, "s1-v-f1", "M 30 110 H 770", 4);
  RV.dash(g, "s1-v-f2", "M 300 110 V 210 M 300 370 V 470", 4);
  // gauge with the setting mark
  const G = H.gauge(g, 640, 340, 106, { id: "s1-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, marks: [{ v: 6, color: RV.blue }], value: 0 });
  H.text(g, 698, 236, "ค่าตั้ง", { size: 28, fill: RV.blue });
  // the trouble spot: red ring around the valve + squeal waves
  const ring = H.el("circle", { id: "s1-v-ring", cx: 300, cy: 290, r: 122, fill: "none", stroke: "#d0233a", "stroke-width": 7, opacity: 0 }, g);
  const W = RV.waves(g, "s1-v-wv", 392, 196, -48, { r0: 16, dr: 17 });
  const pii = H.text(g, 446, 168, "ปี๊~", { size: 40, id: "s1-v-pii" });
  pii.setAttribute("opacity", 0);
  // labels
  H.text(g, 30, 80, "จากปั๊ม (P)", { size: 28 });
  H.text(g, 770, 80, "ไปวงจร", { size: 28, anchor: "end", fill: RV.muted });
  H.text(g, 370, 488, "ไปถัง (T)", { size: 28 });
  H.text(g, 300, 540, "Relief valve เสีย", { size: 26, anchor: "middle", fill: RV.muted });

  RV.flow("s1-v-f1", b + 0.3, b + D, false);
  // pressure starts to rise, but the valve already passes oil to the tank and chatters
  tl.fromTo(G.needle, { rotation: G.rot(0), svgOrigin: G.origin }, { rotation: G.rot(4.4), svgOrigin: G.origin, duration: 1.0, ease: "power2.out" }, b + 0.3);
  RV.flow("s1-v-f2", b + 0.6, b + D, false);
  const sw = [3.6, 5.1, 3.9, 5.4, 3.5, 4.9, 4.0, 5.2, 3.7, 5.0, 3.8, 5.3, 3.6];
  let t = b + 1.3, v = 4.4, i = 0;
  while (t < b + D - 0.4) {
    const d = 0.3 + 0.08 * (i % 3), v1 = sw[i % sw.length];
    tl.fromTo(G.needle, { rotation: G.rot(v), svgOrigin: G.origin }, { rotation: G.rot(v1), svgOrigin: G.origin, duration: d, ease: "sine.inOut", immediateRender: false }, t);
    // arrow chatters with the pressure swings (valve opens a little, closes a little)
    tl.fromTo(arr, { x: 10 + (v - 3.5) * 9 }, { x: 10 + (v1 - 3.5) * 9, duration: d, ease: "sine.inOut", immediateRender: i === 0 }, t);
    t += d; v = v1; i++;
  }
  tl.fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + 0.9);
  tl.fromTo(ring, { scale: 0.92, transformOrigin: "50% 50%" }, { scale: 1.05, transformOrigin: "50% 50%", duration: 0.4, yoyo: true, repeat: 3, ease: "sine.inOut" }, b + 0.9);
  tl.fromTo(pii, { opacity: 0, scale: 0.6, transformOrigin: "0% 50%" }, { opacity: 1, scale: 1, transformOrigin: "0% 50%", duration: 0.3, ease: "back.out(2)" }, b + 0.45);
  RV.wavePulse(W, b + 0.4, b + D, 0.5);
}
