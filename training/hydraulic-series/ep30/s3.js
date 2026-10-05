// NG ① (OPL 5'-C-4 Fig 1): several tubes bound with a general binder (cable tie) pulled too tight →
// tubes deformed / crushed at the tie → bore narrows → less air gets through, pressure at the device drops.
// cue 1: tie tightened (side view + cross-section) · cue 2: tubes squash · cue 3: flow shrinks, gauge drops.
const art = H.$("s3-v-art"), c = T.cues, f = H.f;
const yS = 170, tx = 330;

// side view: air in → bundle → device block → gauge
const S = H.atSide(H.atG(art, 0, yS), { x0: 70, x1: 780, ties: [tx], q: 0, slack: 9, tail: 30, tailAng: 65 });
H.atArrow(art, 12, yS, 64, yS, { color: AT.air, w: 7, head: 20 });
H.atLabel(art, 14, yS - 78, "ลมเข้า", { size: 24, fill: AT.muted });
H.el("rect", { x: 780, y: yS - 58, width: 64, height: 116, rx: 6, fill: AT.metal, stroke: AT.ink, "stroke-width": 4 }, art);
H.el("line", { x1: 844, y1: yS, x2: 896, y2: yS, stroke: AT.pipe, "stroke-width": 12 }, art);
const G = H.gauge(art, 970, yS, 76, { id: "s3-v-g", min: 0, max: 10, ticks: 5, minor: 1, labels: false, value: 7 });
H.atLabel(art, 970, yS + 112, "แรงดันปลายทาง", { size: 25, anchor: "middle", fill: AT.muted });
H.atLabel(art, 600, yS + 112, "สายลม (Air tube)", { size: 25, anchor: "middle", line: [600, yS + 88, 600, yS + 62] });
H.atLabel(art, 296, 50, "Binder (เคเบิลไทร์)", { size: 25, anchor: "end", line: [302, 56, 322, 80] });

// cross-section at the tie
const cx = 230, cy = 482;
const X = H.atXsec(art, cx, cy, { q: 0, slack: 14, tail: 26 });
H.el("line", { x1: tx, y1: yS + 80, x2: 318, y2: 356, stroke: AT.muted, "stroke-width": 3, "stroke-dasharray": "8 7" }, art);
H.atLabel(art, 36, 356, "หน้าตัดที่จุดรัด", { size: 25, fill: AT.muted });

// air that gets through (block arrow)
const fa = { x0: 540, x1: 1070, yc: 492 };
const flowArrow = H.el("path", { d: H.atFlowArrowD(fa.x0, fa.x1, fa.yc, 72), fill: AT.air, stroke: AT.pipe, "stroke-width": 3, opacity: 0.9 }, art);
H.atLabel(art, 805, 404, "ลมที่ผ่านได้ (Air flow)", { size: 26, anchor: "middle", fill: AT.pipe });

// air flows from the start; after the squash it slows and thins
const tFlow = b + c[2] + 0.3;
H.atFlow(S.flows, b + 0.4, b + D, 60, tFlow, 14, { w1: 2, op1: 0.55 });

// cue 1: pull the tail — the tie closes on the tubes
const t1 = b + c[0] + 0.8;
const pull = H.atArrow(art, 412, 86, 470, 59, { color: AT.red, w: 6, head: 18 });
H.atHide(pull);
H.atOp(pull, 0, 1, t1 - 0.3, 0.25);
S.run(0, 1, t1, 0.9);
X.run(0, 1, t1, 0.9);

// cue 2: over-tightened — tubes squash, bores narrow
const t2 = b + c[1] + 0.15;
S.run(1, 2, t2, 1.4, 10);
X.run(1, 2, t2, 1.4, 10);
H.atOp(pull, 1, 0, t2 + 1.6, 0.3);
const g2 = X.geo(2);
H.atRing(art, cx, f(cy - g2.d), 66, 34, t2 + 1.5, 3);
const lab2 = H.atLabel(art, 352, 600, "บุบ / แบน", { size: 30, fill: AT.red });
H.atHide(lab2);
H.atOp(lab2, 0, 1, t2 + 1.6);

// cue 3: less air → flow arrow thins, gauge at the device drops
tl.fromTo(flowArrow, { attr: { d: H.atFlowArrowD(fa.x0, fa.x1, fa.yc, 72) } }, { attr: { d: H.atFlowArrowD(fa.x0, fa.x1, fa.yc, 18) }, duration: 1.2, ease: "power2.inOut", immediateRender: false }, tFlow);
tl.fromTo(G.needle, { rotation: G.rot(7), svgOrigin: G.origin }, { rotation: G.rot(3.2), svgOrigin: G.origin, duration: 1.5, ease: "power2.inOut", immediateRender: false }, tFlow);
const lab3 = H.atLabel(art, 805, 590, "น้อยลง", { size: 30, anchor: "middle", fill: AT.red });
H.atHide(lab3);
H.atOp(lab3, 0, 1, tFlow + 1.2);
H.atRing(art, 970, yS, 92, 92, tFlow + 1.5, 2);
