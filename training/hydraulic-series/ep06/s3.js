// Operation: centre (all blocked, cylinder holds) → "a" on (spool right: P→B, A→T, piston moves left)
// → "b" on (spool left: P→A, B→T, piston moves right). A → cap end, B → rod end of the cylinder.
const art = H.$("s3-v-art");
const root = H.el("g", { transform: "translate(62 6)" }, art);
const V = H.v6Valve(root, "s3-v-valve", { pills: "full", stub: 0 });
const C = V6, c = T.cues, f = H.f;
V.mid.setAttribute("fill", C.pr);
V.ports.P.setAttribute("fill", C.pr);

// pipes (outline + coloured core), drawn over the port stubs
const pipes = H.el("g", {}, root);
const pipe = (d, col) => {
  H.el("path", { d, fill: "none", stroke: C.ink, "stroke-width": 44, "stroke-linecap": "butt" }, pipes);
  return H.el("path", { d, fill: "none", stroke: col, "stroke-width": 36, "stroke-linecap": "butt" }, pipes);
};
const pA = pipe("M 325 262 L 325 456", C.oil), pB = pipe("M 565 262 L 565 456", C.oil);
const pP = pipe("M 445 262 L 445 352", C.pr), pT = pipe("M 208 262 L 208 352", C.oil);
H.v6Head(pipes, 445, 360, "up", { fill: C.pr, len: 28, w: 24 });
const hT = H.v6Head(pipes, 208, 388, "down", { fill: C.oil, len: 28, w: 24 });
H.text(pipes, 445, 424, "จากปั๊ม", { size: 26, anchor: "middle", fill: C.muted });
H.text(pipes, 208, 424, "ไปถัง", { size: 26, anchor: "middle", fill: C.muted });

// cylinder: cap-end chamber (A side) | piston + rod + load | rod-end chamber (B side)
const P0 = 440, cyl = H.el("g", {}, root);
H.el("rect", { x: 268, y: 452, width: 374, height: 82, rx: 6, fill: C.oil, stroke: C.ink, "stroke-width": 5 }, cyl);
const capCh = H.el("rect", { x: 271, y: 455, width: P0 - 271, height: 76, fill: C.oil }, cyl);
const rodCh = H.el("rect", { x: P0 + 24, y: 455, width: 639 - P0 - 24, height: 76, fill: C.oil }, cyl);
const pis = H.el("g", {}, cyl);
H.el("rect", { x: P0 + 24, y: 481, width: 380, height: 22, fill: C.spool, stroke: C.ink, "stroke-width": 3 }, pis);
H.el("rect", { x: P0, y: 455, width: 24, height: 76, fill: C.spool, stroke: C.ink, "stroke-width": 3 }, pis);
H.el("rect", { x: P0 + 404, y: 462, width: 46, height: 62, rx: 6, fill: C.metal, stroke: C.ink, "stroke-width": 4 }, pis);
H.text(cyl, 256, 502, "กระบอกสูบ", { size: 26, anchor: "end", fill: C.muted });
cyl.appendChild(pis);
root.appendChild(pipes); // pipes over the cylinder top wall (open ports)

// motion arrows above the rod
const mvL = H.el("path", { d: H.arrowD(840, 438, 745, 438, 22), fill: "none", stroke: C.blue, "stroke-width": 7, opacity: 0 }, root);
const mvR = H.el("path", { d: H.arrowD(745, 438, 840, 438, 22), fill: "none", stroke: C.blue, "stroke-width": 7, opacity: 0 }, root);

// legend
const lg = H.el("g", {}, root);
H.el("rect", { x: 0, y: 585, width: 34, height: 26, rx: 4, fill: C.pr, stroke: C.ink, "stroke-width": 2 }, lg);
H.text(lg, 44, 607, "น้ำมันแรงดัน (จาก P)", { size: 24 });
H.el("rect", { x: 300, y: 585, width: 34, height: 26, rx: 4, fill: C.rt, stroke: C.ink, "stroke-width": 2 }, lg);
H.text(lg, 344, 607, "น้ำมันไหลกลับ (ไป T)", { size: 24 });

// flows (valve + pipes + into the cylinder)
const fA = H.el("g", { opacity: 0 }, root), fB = H.el("g", { opacity: 0 }, root);
const flA = [H.v6Flow(fA, "M 445 352 L 445 188 L 565 188 L 565 476"), H.v6Flow(fA, "M 325 476 L 325 188 L 208 188 L 208 352")];
const flB = [H.v6Flow(fB, "M 445 352 L 445 188 L 325 188 L 325 476"), H.v6Flow(fB, "M 565 476 L 565 188 L 682 188 L 682 56 L 208 56 L 208 352")];

// centre position: the two lands cover A and B (flash their outlines); P waits between them
const blk = H.el("g", { opacity: 0 }, V.spool);
for (const x of [300, 540]) H.el("rect", { x, y: 117, width: 50, height: 86, fill: "none", stroke: C.yel, "stroke-width": 8 }, blk);

const extra = { A: [pA, capCh], B: [pB, rodCh], T: [pT, hT] };
const piston = (from, to, t, dur) => {
  const e = { duration: dur, ease: "power1.inOut", immediateRender: false };
  tl.fromTo(pis, { x: from - P0 }, { x: to - P0, ...e }, t);
  tl.fromTo(capCh, { attr: { width: from - 271 } }, { attr: { width: to - 271 }, ...e }, t);
  tl.fromTo(rodCh, { attr: { x: from + 24, width: 639 - from - 24 } }, { attr: { x: to + 24, width: 639 - to - 24 }, ...e }, t);
};

// ① centre: everything blocked — lands flash, cylinder holds
tl.fromTo(blk, { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, b + c[0] + 2.2);
// ② solenoid a
const ta = c[1];
V.coil("a", true, b + ta + 0.8);
V.shift(0, 1, b + ta + 1.5, 0.7);
H.v6Paint(V, 0, 1, b + ta + 2.6, extra);
H.v6Run(fA, flA, b + ta + 2.7, b + c[2]);
piston(P0, 360, b + ta + 2.9, 2.7);
tl.fromTo(mvL, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + ta + 2.9);
tl.fromTo(mvL, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, b + ta + 5.6);
// ③ solenoid b
const tb = c[2];
V.coil("a", false, b + tb + 0.3);
V.coil("b", true, b + tb + 0.7);
V.shift(1, -1, b + tb + 1.3, 0.8);
H.v6Paint(V, 1, -1, b + tb + 2.4, extra);
H.v6Run(fB, flB, b + tb + 2.5, b + D - 0.1);
piston(360, 520, b + tb + 2.7, 2.6);
tl.fromTo(mvR, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b + tb + 2.7);
tl.fromTo(mvR, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, b + tb + 5.3);
