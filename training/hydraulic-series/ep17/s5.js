// Judgment 1–2 at the oil level meter (pump stopped). Each card's glass moves to its state when the stamp lands:
// OK = up to the upper-limit mark and clear · NG = below the mark · WATCH = turning brown · NG = black.
const st = T.stamps;
const card = (id, o) => {
  const g = H.$(id);
  const G = H.t17Glass(g, 70, 8, 176, { level: o.l0 ?? 1, color: o.c0 || TC.newOil, w: 54 });
  H.el("path", { d: `M 134 ${H.f(G.markY)} L 158 ${H.f(G.markY)}`, fill: "none", stroke: TC.ink, "stroke-width": 3 }, g);
  H.text(g, 164, G.markY + 9, "ขีดบน", { size: 26 });
  return { g, G };
};
// drop of the oil colour (for the colour cards)
const drop = (g, cx, cy, r, col) => H.el("path", {
  d: `M ${cx} ${cy - 1.6 * r} C ${cx + 0.4 * r} ${cy - 0.9 * r} ${cx + r} ${cy - 0.4 * r} ${cx + r} ${cy + 0.15 * r} A ${r} ${r} 0 0 1 ${cx - r} ${cy + 0.15 * r} C ${cx - r} ${cy - 0.4 * r} ${cx - 0.4 * r} ${cy - 0.9 * r} ${cx} ${cy - 1.6 * r} Z`,
  fill: col, stroke: TC.ink, "stroke-width": 4,
}, g);

// OK — level rises to the mark
const A = card("s5-v-c1", { l0: 0.75 });
H.t17GlassTo(A.G, 1, b + st[0] + 0.1, 0.6);
const dA = drop(A.g, 268, 128, 30, TC.newOil);

// NG — level sinks below the mark; red gap arrow
const N = card("s5-v-c2", { l0: 1 });
H.t17GlassTo(N.G, 0.45, b + st[1] + 0.1, 0.7);
const gap = H.el("path", { d: H.dimD(150, N.G.markY + 4, 150, N.G.yAt(0.45) - 3, 12), fill: "none", stroke: TC.red, "stroke-width": 4, opacity: 0 }, N.g);
const gapT = H.text(N.g, 164, N.G.yAt(0.72) + 10, "ต่ำ", { size: 28, fill: TC.red });
gapT.setAttribute("opacity", 0);
tl.fromTo([gap, gapT], { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + st[1] + 0.8);

// WATCH — the oil turns brown (glass + drop)
const W = card("s5-v-c3", {});
const dW = drop(W.g, 268, 128, 30, TC.newOil);
tl.to([W.G.oil, dW], { attr: { fill: TC.brown }, duration: 0.8 }, b + st[2] + 0.1);
tl.to(W.G.surf, { attr: { stroke: "#5a3a17" }, duration: 0.8 }, b + st[2] + 0.1);

// NG — black
const K = card("s5-v-c4", { c0: TC.brown });
const dK = drop(K.g, 268, 128, 30, TC.brown);
tl.to([K.G.oil, dK], { attr: { fill: TC.black }, duration: 0.8 }, b + st[3] + 0.1);
tl.to(K.G.surf, { attr: { stroke: "#000000" }, duration: 0.8 }, b + st[3] + 0.1);
