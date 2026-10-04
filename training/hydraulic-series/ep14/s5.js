// Judgment (OPL 5-C-2, p.18). Card visuals, each animated when its stamp hits:
// OK  — pump runs quietly (soft blue waves) · gauge needle at the set mark · filter indicator in the green
// NG1 — loud / high-pitched sound (thick waves) · stopwatch runs to 20 s without discharge → stop the pump
// NG2 — gauge needle stays below the set mark · filter indicator in the red
const st = T.stamps, tEnd = b + D;
{
  const g = H.$("s5-v-ok"), t = b + st[0];
  const P = SU.pumpIcon(g, "s5-v-okp", 66, 104);
  tl.fromTo(P.rot, { rotation: 0, svgOrigin: P.origin }, { rotation: 360 * Math.round((tEnd - t) * 1.5), svgOrigin: P.origin, duration: tEnd - t, ease: "none" }, t);
  const W = SU.waves(g, "s5-v-okw", 66, 104, -120, { r0: 42, dr: 14, n: 2, color: SC.blue, w: 4, span: 30 });
  SU.steady(W, t + 0.2, tEnd, 0.8, 0.8);
  const G = SU.dial(g, "s5-v-okg", 286, 92, 56, { set: 6, value: 0 });
  SU.needle(G, 0, 6, t + 0.2, 0.9, true);
  const I = SU.indicator(g, "s5-v-oki", 404, 116, 44, { value: 0.3 });
  tl.fromTo(I.needle, { rotation: I.rot(0.3), svgOrigin: I.origin }, { rotation: I.rot(2.4), svgOrigin: I.origin, duration: 0.8, ease: "back.out(1.6)" }, t + 0.4);
}
{
  const g = H.$("s5-v-ng1"), t = b + st[1];
  const P = SU.pumpIcon(g, "s5-v-n1p", 76, 112);
  tl.fromTo(P.rot, { rotation: 0, svgOrigin: P.origin }, { rotation: 360 * Math.round((tEnd - t) * 1.5), svgOrigin: P.origin, duration: tEnd - t, ease: "none" }, t);
  SU.shake(P.g, t, tEnd, 2.6);
  const W = SU.waves(g, "s5-v-n1w", 76, 112, -120, { r0: 42, dr: 18, n: 3, w: 6, span: 34 });
  SU.steady(W, t + 0.1, tEnd, 0.45, 1);
  const SW = H.stopwatch(g, 300, 96, 52, { id: "s5-v-n1sw", color: SC.muted });
  tl.fromTo(SW.ring, { strokeDashoffset: SW.offset(0) }, { strokeDashoffset: SW.offset(1), duration: 2.2, ease: "none" }, t + 0.3);
  tl.fromTo(SW.hand, { rotation: 0, svgOrigin: SW.origin }, { rotation: 360, svgOrigin: SW.origin, duration: 2.2, ease: "none" }, t + 0.3);
  H.text(g, 362, 98, "20", { size: 40, anchor: "start" });
  H.text(g, 362, 134, "วินาที", { size: 26, anchor: "start" });
}
{
  const g = H.$("s5-v-ng2"), t = b + st[2];
  const G = SU.dial(g, "s5-v-n2g", 130, 92, 62, { set: 6, value: 0 });
  SU.needle(G, 0, 3.6, t + 0.2, 1.0, true);
  const gap = H.el("path", { id: "s5-v-n2gap", d: H.arcD(130, 92, 62 * 0.5, G.rot(3.6) + 6, G.rot(6) - 4), fill: "none", stroke: SC.muted, "stroke-width": 5, "stroke-dasharray": "7 7", opacity: 0 }, g);
  tl.fromTo(gap, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t + 1.2);
  const I = SU.indicator(g, "s5-v-n2i", 336, 118, 56, { value: 0.3 });
  tl.fromTo(I.needle, { rotation: I.rot(0.3), svgOrigin: I.origin }, { rotation: I.rot(8.6), svgOrigin: I.origin, duration: 1.0, ease: "power2.inOut" }, t + 0.4);
}
