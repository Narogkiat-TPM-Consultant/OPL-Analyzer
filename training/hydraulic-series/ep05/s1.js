// Title: relief-valve symbol (p.8 "hydraulic display sign") on the pump line + pressure gauge.
// Pressure rises to the setting → the arrow lines up with the flow line (valve opens) → oil to tank, gauge holds.
{
  const g = H.$("s1-v-sym"), f = H.f;
  const pipe = (id, d) => H.el("path", { id, d, fill: "none", stroke: RV.blue, "stroke-width": 10, "stroke-linejoin": "round" }, g);
  pipe("s1-v-pl", "M 30 110 H 770");
  pipe("s1-v-br", "M 300 110 V 210");
  pipe("s1-v-out", "M 300 370 V 470");
  H.el("path", { d: "M 640 110 V 232", fill: "none", stroke: RV.blue, "stroke-width": 8 }, g);
  // tank
  H.el("path", { d: "M 245 430 V 492 H 355 V 430", fill: "none", stroke: RV.ink, "stroke-width": 6, "stroke-linejoin": "round" }, g);
  H.el("rect", { x: 248, y: 462, width: 104, height: 27, fill: RV.tank }, g);
  // pilot line (dashed) from the inlet to the side of the box opposite the spring
  const pil = H.el("path", { id: "s1-v-pil", d: "M 300 150 H 160 V 290 H 220", fill: "none", stroke: RV.ink, "stroke-width": 5, "stroke-dasharray": "14 9" }, g);
  // box + spring
  H.el("rect", { x: 220, y: 210, width: 160, height: 160, fill: RV.paper, stroke: RV.ink, "stroke-width": 6 }, g);
  H.el("path", { d: RV.springH(380, 470, 290, 18, 4), fill: "none", stroke: RV.ink, "stroke-width": 5, "stroke-linejoin": "round" }, g);
  const arr = H.el("path", { id: "s1-v-arr", d: H.arrowD(262, 232, 262, 346, 26), fill: "none", stroke: RV.ink, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  // flow dashes
  RV.dash(g, "s1-v-f1", "M 30 110 H 770", 4);
  RV.dash(g, "s1-v-f2", "M 300 110 V 210 M 300 370 V 470", 4);
  // gauge with the setting mark
  const G = H.gauge(g, 640, 340, 106, { id: "s1-v-g", min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, marks: [{ v: 6, color: RV.blue }], value: 0 });
  H.text(g, 698, 236, "ค่าตั้ง", { size: 28, fill: RV.blue });
  // labels
  H.text(g, 30, 80, "จากปั๊ม (P)", { size: 28 });
  H.text(g, 770, 80, "ไปวงจร", { size: 28, anchor: "end", fill: RV.muted });
  H.text(g, 370, 488, "ไปถัง (T)", { size: 28 });
  H.text(g, 300, 540, "สัญลักษณ์ Relief valve", { size: 26, anchor: "middle", fill: RV.muted });

  RV.flow("s1-v-f1", b + 0.3, b + D, false);
  // pressure rises; the pilot line "feels" it
  tl.fromTo(G.needle, { rotation: G.rot(0), svgOrigin: G.origin }, { rotation: G.rot(6.3), svgOrigin: G.origin, duration: 2.6, ease: "power1.in" }, b + 0.5);
  tl.fromTo(pil, { stroke: RV.ink, strokeDashoffset: 0 }, { stroke: RV.blue, strokeDashoffset: -92, duration: 2.6, ease: "none" }, b + 0.5);
  // setting reached → valve opens: arrow lines up with the flow line, oil to tank, pressure holds
  tl.fromTo(arr, { x: 0 }, { x: 38, duration: 0.45, ease: "back.out(2)" }, b + 3.1);
  RV.flow("s1-v-f2", b + 3.3, b + D, false);
  tl.fromTo(G.needle, { rotation: G.rot(6.3), svgOrigin: G.origin }, { rotation: G.rot(6.0), svgOrigin: G.origin, duration: 0.6, ease: "power2.out", immediateRender: false }, b + 3.3);
}
