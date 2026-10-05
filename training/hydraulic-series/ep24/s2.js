// Function (p.39 "How it works"): factory air from the compressor is at a high pressure; the regulator (middle of
// the FRL set) reduces it to the setting; when the OUT side pressure changes (a cylinder uses air), it is brought
// back to the setting. IN gauge = illustration (no values on the sheet).
{
  const g = H.$("s2-v-line"), O = H.$("s2-v-ov"), c = T.cues;
  const PY = 385;
  // pipes: IN side (factory pressure) up to the regulator, OUT side after it
  AR.pipe(g, `M 14 ${PY} H 440`, 52, AR.airHi);
  const pOut = AR.pipe(g, `M 600 ${PY} H 936`, 52, AR.airLo);
  AR.pipe(g, `M 110 352 V ${PY}`, 18, AR.airHi);
  AR.dash(g, "s2-v-fi", `M 18 ${PY} H 430`);
  AR.dash(g, "s2-v-fo", `M 612 ${PY} H 926`);
  // FRL: Filter → Regulator → Lubricator (F and L dimmed)
  const F = AR.filterExt(g, 300, 160, 0.9, "s2-v-f");
  const R = AR.regExt(g, 520, 135, 1.0, "s2-v-r", { gr: 44 });
  const L = AR.lubeExt(g, 740, 160, 0.9, "s2-v-l");
  [F.g, L.g].forEach((e) => e.setAttribute("opacity", 0.45));
  // downstream user: air cylinder (rod goes up when it uses air)
  H.el("rect", { x: 930, y: 230, width: 70, height: 200, rx: 8, fill: AR.metal, stroke: AR.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: 924, y: 418, width: 82, height: 18, rx: 3, fill: AR.dark, stroke: AR.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: 924, y: 222, width: 82, height: 18, rx: 3, fill: AR.dark, stroke: AR.ink, "stroke-width": 4 }, g);
  const rod = H.el("g", { id: "s2-v-rod" }, g);
  H.el("rect", { x: 957, y: 150, width: 16, height: 74, fill: AR.dark, stroke: AR.ink, "stroke-width": 3 }, rod);
  H.el("rect", { x: 937, y: 130, width: 56, height: 22, rx: 4, fill: AR.knob, stroke: AR.ink, "stroke-width": 3 }, rod);
  // IN gauge (high pressure, no set marking)
  const GI = AR.gauge(g, 110, 290, 56, { id: "s2-v-gi", set: false });

  // labels
  H.text(O, 24, 70, "ลมโรงงาน (Factory air)", { size: 30 });
  H.text(O, 24, 106, "จาก Compressor", { size: 26, fill: AR.muted });
  H.text(O, 110, 206, "IN: แรงดันสูง", { size: 26, anchor: "middle", fill: AR.blue });
  const nm = (x, s, fill = AR.muted) => H.text(O, x, 616, s, { size: 26, anchor: "middle", fill });
  nm(300, "Filter"); nm(740, "Lubricator"); nm(965, "Cylinder");
  const rName = nm(520, "Regulator", AR.blue);
  const box = H.el("rect", { id: "s2-v-box", x: 404, y: 118, width: 232, height: 330, rx: 18, fill: "rgba(31,95,191,0.06)", stroke: AR.blue, "stroke-width": 5, "stroke-dasharray": "14 10", opacity: 0 }, O);
  const setL = H.text(O, 520, 96, "OUT = ค่าตั้ง (เขียว)", { size: 26, anchor: "middle", fill: AR.green, id: "s2-v-setl" });
  setL.setAttribute("opacity", 0);
  AR.ring(O, "s2-v-rg", 520, 387, 66, AR.green);
  rName.setAttribute("font-weight", 900);

  // ① factory air at high pressure arrives (IN side)
  const t1 = b + c[0];
  AR.flow("s2-v-fi", t1 + 0.2, b + D, false);
  GI.ndl(0, 8.6, t1 + 0.4, 1.6, "power1.out");

  // ② the regulator reduces it to the setting (green marking)
  const t2 = b + c[1];
  AR.op(box, 0, 1, t2 + 0.1);
  AR.op(setL, 0, 1, t2 + 0.6);
  AR.flow("s2-v-fo", t2 + 0.5, b + D, false);
  AR.ft(pOut, { stroke: AR.airLo }, { stroke: AR.air }, t2 + 0.5, 1.2);
  R.G.ndl(0, 5, t2 + 0.6, 1.6, "power2.out");

  // ③ the OUT side changes (the cylinder uses air) → needle dips → back to the setting
  const t3 = b + c[2];
  AR.ft(rod, { y: 0 }, { y: -46 }, t3 + 0.1, 0.7, "power2.inOut");
  R.G.ndl(5, 3.6, t3 + 0.1, 0.6, "power2.out");
  R.G.ndl(3.6, 5, t3 + 0.9, 1.0, "power2.inOut");
  AR.pulse("s2-v-rg", t3 + 1.9, 2);
}
