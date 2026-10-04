// Title: an O-ring turns; its blue identification dot travels round the ring.
const R1 = H.orTorus("s1-v-ring", 400, 268, 250, 0.5, 50, { id: "s1-v-tor", sw: 5 });
// the dot rides on the top surface: rotate inside a group squashed to the ring's ellipse
const sq = H.el("g", { transform: `translate(400 ${H.f(R1.top.cy)}) scale(1 0.5)` }, "s1-v-ring");
const spin = H.el("g", { id: "s1-v-spin" }, sq);
H.el("circle", { cx: 250, cy: 0, r: 26, fill: OR_DOT.blue, stroke: "#ffffff", "stroke-width": 5 }, spin);
// label: the dot = material code
const lab = H.el("g", { id: "s1-v-lab" }, "s1-v-ring");
H.el("path", { d: H.arrowD(560, 470, 520, 420, 16), fill: "none", stroke: HC.ink, "stroke-width": 4 }, lab);
H.text(lab, 400, 520, "จุดสี = รหัสวัสดุ (JIS B 2401)", { size: 36, anchor: "middle" });

tl.fromTo(spin, { rotation: 20, svgOrigin: "0 0" }, { rotation: 20 + 360 * Math.max(1, Math.round(D / 2.6)), svgOrigin: "0 0", duration: D, ease: "none" }, b);
tl.fromTo(lab, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, b + 1.8);
