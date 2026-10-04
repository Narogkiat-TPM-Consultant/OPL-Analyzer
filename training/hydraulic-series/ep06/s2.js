// Structure: parts named with the narration; coil "a" pushes the spool over, the spring brings it back.
const art = H.$("s2-v-art");
const OX = 105, OY = 175; // valve local → scene: (x + OX, y + OY)
const vg = H.el("g", { transform: `translate(${OX} ${OY})` }, art);
const V = H.v6Valve(vg, "s2-v-valve", { pills: "short" });
const c = T.cues;

// part labels with leader lines (scene units)
const lab = (txt, tx, ty, x1, y1, x2, y2) => {
  const g = H.el("g", { opacity: 0 }, art);
  H.el("path", { d: `M ${x1} ${y1} L ${x2} ${y2}`, fill: "none", stroke: V6.muted, "stroke-width": 3 }, g);
  H.el("circle", { cx: x2, cy: y2, r: 7, fill: V6.blue, stroke: "#ffffff", "stroke-width": 2.5 }, g);
  H.text(g, tx, ty, txt, { size: 28 });
  return g;
};
const L = {
  coil: lab("Coil (ขดลวด)", 100, 118, 140, 130, 140, OY + 92),
  spool: lab("Spool (แกนเลื่อน)", 345, 118, 430, 130, OX + 325, OY + 130),
  spring: lab("Centering spring (สปริงกลาง)", 640, 118, 765, 130, OX + 655, OY + 136),
  body: lab("Body (ตัววาล์ว)", 372, 612, 485, 582, OX + 380, OY + 250),
  plunger: lab("แกนเหล็ก (Plunger)", 40, 612, 190, 582, OX + 88, OY + 172),
  rod: lab("Push rod (ก้านดัน)", 700, 612, 838, 582, OX + 735, OY + 160),
};
// "slides left–right" double arrow over the spool
const dbl = H.el("path", { d: H.dimD(OX + 375, OY + 94, OX + 515, OY + 94, 18), fill: "none", stroke: V6.blue, "stroke-width": 6, opacity: 0 }, art);

const show = (g, t) => tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, b + t);
show(L.body, c[0] + 0.6);
show(L.spool, c[1] + 0.1);
show(dbl, c[1] + 0.3);
tl.fromTo(dbl, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, b + c[2]);
show(L.coil, c[2] + 0.1);
show(L.plunger, c[2] + 0.4);
show(L.rod, c[2] + 0.7);
// solenoid a on → plunger pushes the push rod → spool right; then off → spring returns it
V.coil("a", true, b + c[2] + 1.2);
V.shift(0, 1, b + c[2] + 1.5, 0.6);
show(L.spring, c[3] + 0.1);
V.coil("a", false, b + c[3] + 0.3);
V.shift(1, 0, b + c[3] + 0.6, 0.8);
