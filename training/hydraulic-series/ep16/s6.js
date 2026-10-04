// Judgment cards: gauge at 0 (OK) · gauge not at 0 = residual pressure (NG, red arc) · tank / floor / rod clean
// (OK, green ticks) · leak or dirt found (NG, red rings). Each card's motion starts with its stamp (T.stamps).
{
  const st = T.stamps;
  const gaugeCard = (id, v, gid) => {
    const P = H.$(id);
    const G = H.k16Gauge(P, 180, 102, 88, { id: gid, min: 0, max: 10, ticks: 5, minor: 1, labelEvery: 99, labelSize: 28, value: v, unitText: "kgf/cm²", zeroColor: v ? K6.ink : K6.green });
    return { P, G };
  };
  // 1 OK: needle at 0, green mark on 0
  const A = gaugeCard("s6-v-c1", 0, "s6-v-g1");
  const z = H.el("path", { d: H.arcD(180, 102, 88 * 0.8, A.G.rot(0) - 8, A.G.rot(0) + 8), fill: "none", stroke: K6.green, "stroke-width": 15, opacity: 0 }, A.P);
  A.G.g.insertBefore(z, A.G.needle);
  tl.fromTo(z, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + st[0]);
  // 2 NG: needle stays up — red arc = pressure still in the system
  const B = gaugeCard("s6-v-c2", 4, "s6-v-g2");
  const arc = H.el("path", { d: H.arcD(180, 102, 88 * 0.8, B.G.rot(0), B.G.rot(4)), fill: "none", stroke: K6.red, "stroke-width": 13, opacity: 0 }, B.P);
  B.G.g.insertBefore(arc, B.G.needle); // arc under the needle
  tl.fromTo(arc, { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, b + st[1]);
  tl.fromTo(B.G.needle, { rotation: B.G.rot(4), svgOrigin: B.G.origin }, { rotation: B.G.rot(3.6), svgOrigin: B.G.origin, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, b + st[1] + 0.1);
  // 3 OK: clean — green ticks at the three spots
  const M3 = H.k16Mini("s6-v-c3", false);
  Object.values(M3.spots).forEach(([x, y], i) => {
    const tick = H.el("path", { d: `M ${x - 13} ${y - 2} L ${x - 3} ${y + 9} L ${x + 15} ${y - 13}`, fill: "none", stroke: K6.green, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, H.$("s6-v-c3"));
    tl.fromTo(tick, { opacity: 0, scale: 1.4, svgOrigin: `${x} ${y}` }, { opacity: 1, scale: 1, svgOrigin: `${x} ${y}`, duration: 0.3, ease: "back.out(2)" }, b + st[2] + 0.15 * i);
  });
  // 4 NG: leak on the tank, oil on the floor, dirt on the rod — red rings
  const M4 = H.k16Mini("s6-v-c4", true);
  const rings = [[118, 106, 22, 40], [196, 177, 38, 13], [318, 87, 34, 16]];
  rings.forEach(([x, y, rx, ry], i) => H.k16Ring(H.$("s6-v-c4"), `s6-v-r${i}`, x, y, rx, ry, b + st[3] + 0.15 * i, { sw: 5, n: 1 }));
}
