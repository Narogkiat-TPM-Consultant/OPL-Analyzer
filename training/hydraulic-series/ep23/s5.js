// Maintenance cards (p.38 Maintenance 2–3): bowl washed + nylon brush (OK, reuse) · metal element washed in
// kerosene + nylon brush (OK, reuse) · silver alloy element → replace with a new one (NG = do not reuse).
{
  const st = T.stamps;
  // nylon brush centred on its bristle tip (0, 0); handle up-right
  const brush = (parent, rot = 0) => {
    const g = H.el("g", {}, parent);
    const k = H.el("g", { transform: `rotate(${rot})` }, g);
    H.el("rect", { x: -6, y: -96, width: 12, height: 64, rx: 5, fill: AF.blue, stroke: AF.ink, "stroke-width": 3 }, k);
    H.el("rect", { x: -11, y: -36, width: 22, height: 16, rx: 3, fill: AF.metal, stroke: AF.ink, "stroke-width": 3 }, k);
    for (let x = -9; x <= 9; x += 4.5) H.el("line", { x1: x, y1: -20, x2: x, y2: 2, stroke: "#f5f1e8", "stroke-width": 3 }, k);
    H.el("path", { d: "M -12 -20 V 2 H 12 V -20", fill: "none", stroke: AF.ink, "stroke-width": 1.5 }, k);
    return g;
  };
  const specks = (parent, pts, s = 0.75) => {
    const g = H.el("g", {}, parent);
    pts.forEach(([x, y], i) => AF.particle(g, ["dust", "rust", "dust", "water"][i % 4], s, { transform: `translate(${x} ${y})` }));
    return g;
  };

  // 1 bowl: brush scrubs inside, dirt fades; bucket (water / kerosene) and rag beside it
  const C1 = H.$("s5-v-c1");
  H.el("path", { d: "M 46 24 V 112 Q 46 152 86 154 H 104 Q 144 152 144 112 V 24", fill: AF.bowl, stroke: AF.ink, "stroke-width": 4.5, "stroke-linejoin": "round" }, C1);
  H.el("rect", { x: 38, y: 16, width: 114, height: 14, rx: 4, fill: AF.dark, stroke: AF.ink, "stroke-width": 3 }, C1);
  const d1 = specks(C1, [[70, 128], [96, 140], [120, 126], [62, 96], [126, 92], [88, 112]]);
  const b1 = brush(C1, 12);
  H.el("path", { d: "M 200 72 H 310 L 298 154 H 212 Z", fill: AF.metal, stroke: AF.ink, "stroke-width": 4, "stroke-linejoin": "round" }, C1);
  H.el("path", { d: "M 205 92 H 305 L 299 150 H 211 Z", fill: AF.pool }, C1);
  H.el("path", { d: "M 204 72 Q 255 34 306 72", fill: "none", stroke: AF.ink, "stroke-width": 3.5 }, C1);
  H.text(C1, 255, 128, "น้ำ / Kerosene", { size: 18, anchor: "middle", fill: AF.ink });
  H.el("path", { d: "M 340 110 Q 360 96 384 108 Q 408 120 430 104 L 438 150 Q 414 162 390 150 Q 366 138 346 152 Z", fill: "#e4ecf8", stroke: AF.ink, "stroke-width": 3, "stroke-linejoin": "round" }, C1);
  H.text(C1, 390, 88, "ผ้า", { size: 20, anchor: "middle", fill: AF.muted });
  tl.fromTo(b1, { x: 96, y: 130 }, { x: 96, y: 96, duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: 7 }, b + st[0] - 0.4);
  tl.fromTo(d1, { opacity: 1 }, { opacity: 0, duration: 1.6 }, b + st[0] - 0.2);

  // 2 metal element in a kerosene tray: brush scrubs along it, dirt fades
  const C2 = H.$("s5-v-c2");
  H.el("path", { d: "M 30 104 H 430 L 414 158 H 46 Z", fill: AF.metal, stroke: AF.ink, "stroke-width": 4, "stroke-linejoin": "round" }, C2);
  H.el("path", { d: "M 36 116 H 424 L 412 154 H 48 Z", fill: "#f4ecd0" }, C2);
  H.el("rect", { x: 90, y: 74, width: 230, height: 58, rx: 6, fill: AF.dark, stroke: AF.ink, "stroke-width": 4 }, C2);
  for (let x = 102; x <= 310; x += 12) H.el("line", { x1: x, y1: 76, x2: x, y2: 130, stroke: AF.ink, "stroke-width": 1.5, opacity: 0.5 }, C2);
  for (let y = 86; y <= 122; y += 12) H.el("line", { x1: 92, y1: y, x2: 318, y2: y, stroke: AF.ink, "stroke-width": 1.5, opacity: 0.5 }, C2);
  for (const x of [80, 320]) H.el("rect", { x, y: 70, width: 12, height: 66, rx: 3, fill: AF.metal, stroke: AF.ink, "stroke-width": 3 }, C2);
  const d2 = specks(C2, [[122, 92], [168, 112], [214, 88], [258, 110], [298, 94], [146, 120]], 0.85);
  H.text(C2, 380, 94, "Kerosene", { size: 20, anchor: "middle", fill: AF.muted });
  const b2 = brush(C2, -20);
  tl.fromTo(b2, { x: 130, y: 100 }, { x: 290, y: 100, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 5 }, b + st[1] - 0.4);
  tl.fromTo(d2, { opacity: 1 }, { opacity: 0, duration: 1.8 }, b + st[1] - 0.2);

  // 3 silver alloy element: old one crossed out → arrow → new one
  const C3 = H.$("s5-v-c3");
  const elem = (parent, x, dirty) => {
    const g = H.el("g", {}, parent);
    H.el("rect", { x, y: 26, width: 86, height: 128, rx: 8, fill: "#d5d9de", stroke: AF.ink, "stroke-width": 4 }, g);
    for (let k = 0; k < 40; k++) {
      const u = (k * 0.618034 + 0.1) % 1, v = (k * 0.414214 + 0.27) % 1;
      H.el("circle", { cx: H.f(x + 8 + u * 70), cy: H.f(34 + v * 112), r: 1.8, fill: "#9aa1aa" }, g);
    }
    H.el("rect", { x: x + 12, y: 34, width: 8, height: 112, rx: 4, fill: "#ffffff", opacity: 0.7 }, g);
    if (dirty) [[x + 30, 120, 22, 14], [x + 58, 70, 16, 12], [x + 40, 50, 12, 8], [x + 62, 132, 14, 10]].forEach(([cx, cy, rx, ry]) =>
      H.el("ellipse", { cx, cy, rx, ry, fill: AF.dirt, opacity: 0.75 }, g));
    return g;
  };
  elem(C3, 40, true);
  const xx = H.el("path", { d: "M 34 30 L 132 150 M 132 30 L 34 150", fill: "none", stroke: AF.red, "stroke-width": 9, "stroke-linecap": "round", opacity: 0 }, C3);
  const arr = H.el("path", { d: H.arrowD(160, 90, 270, 90, 22), fill: "none", stroke: AF.ink, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, C3);
  const nw = elem(C3, 300, false);
  const chip = H.el("g", {}, nw);
  H.el("rect", { x: 314, y: 4, width: 58, height: 30, rx: 8, fill: AF.green }, chip);
  H.text(chip, 343, 26, "ใหม่", { size: 20, anchor: "middle", fill: "#ffffff" });
  tl.fromTo(xx, { opacity: 0, scale: 1.4, svgOrigin: "83 90" }, { opacity: 1, scale: 1, svgOrigin: "83 90", duration: 0.3, ease: "back.out(2)" }, b + st[2] + 0.1);
  tl.fromTo(arr, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, b + st[2] + 0.5);
  tl.fromTo(nw, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, b + st[2] + 0.7);
}
