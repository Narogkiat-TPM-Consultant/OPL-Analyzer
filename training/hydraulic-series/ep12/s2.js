// Phenomenon: solenoid "a" is commanded ON, but the coil does not pull — the spool stays in the centre and the
// cylinder does not move (closed centre: P is held, A/B blocked). Then the burned coil is found (red ring, smoke).
// Then the other failures the deck lists for this valve are tagged on the same drawing (spool, spring, T port).
const art = H.$("s2-v-art");
const root = H.el("g", { transform: "translate(62 46)" }, art);
const V = H.v12Valve(root, "s2-v-valve", { pills: "short", stub: 0 });
const C = V12, c = T.cues;
V.mid.setAttribute("fill", C.pr);
V.ports.P.setAttribute("fill", C.pr);

// pipes (outline + coloured core), drawn over the port stubs — layout as EP06 scene 3
const pipes = H.el("g", {}, root);
const pipe = (d, col) => {
  H.el("path", { d, fill: "none", stroke: C.ink, "stroke-width": 44, "stroke-linecap": "butt" }, pipes);
  return H.el("path", { d, fill: "none", stroke: col, "stroke-width": 36, "stroke-linecap": "butt" }, pipes);
};
pipe("M 325 262 L 325 456", C.oil); pipe("M 565 262 L 565 456", C.oil);
pipe("M 445 262 L 445 352", C.pr); pipe("M 208 262 L 208 352", C.oil);
H.v12Head(pipes, 445, 360, "up", { fill: C.pr, len: 28, w: 24 });
H.v12Head(pipes, 208, 388, "down", { fill: C.oil, len: 28, w: 24 });
H.text(pipes, 445, 424, "จากปั๊ม", { size: 26, anchor: "middle", fill: C.muted });
H.text(pipes, 208, 424, "ไปถัง", { size: 26, anchor: "middle", fill: C.muted });

// cylinder (holds still)
const P0 = 440, cyl = H.el("g", {}, root);
H.el("rect", { x: 268, y: 452, width: 374, height: 82, rx: 6, fill: C.oil, stroke: C.ink, "stroke-width": 5 }, cyl);
H.el("rect", { x: P0 + 24, y: 481, width: 380, height: 22, fill: C.spool, stroke: C.ink, "stroke-width": 3 }, cyl);
H.el("rect", { x: P0, y: 455, width: 24, height: 76, fill: C.spool, stroke: C.ink, "stroke-width": 3 }, cyl);
H.el("rect", { x: P0 + 404, y: 462, width: 46, height: 62, rx: 6, fill: C.metal, stroke: C.ink, "stroke-width": 4 }, cyl);
H.text(cyl, 256, 502, "กระบอกสูบ", { size: 26, anchor: "end", fill: C.muted });
root.appendChild(pipes);

// ① command ON → nothing moves: the spool and the rod should have moved (dashed arrows), red crosses
const t1 = c[0] + 1.3;
V.coil("a", true, b + t1);
tl.fromTo(V.glow.a, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, b + t1 + 0.35); // no pull: the coil does not energise
const ghost = H.el("g", { opacity: 0 }, root);
H.el("path", { d: H.arrowD(395, 0, 495, 0, 18), fill: "none", stroke: C.blue, "stroke-width": 6, "stroke-dasharray": "12 8" }, ghost);
H.el("path", { d: H.arrowD(940, 440, 845, 440, 20), fill: "none", stroke: C.blue, "stroke-width": 6, "stroke-dasharray": "12 8" }, ghost);
const xs = H.el("g", { opacity: 0 }, root);
H.v12Cross(xs, 445, 0, 15, { w: 7 });
H.v12Cross(xs, 892, 440, 18, { w: 8 });
H.v12Op(ghost, 0, 1, b + t1 + 0.6, 0.3);
H.v12Op(xs, 0, 1, b + t1 + 1.4, 0.25);
tl.fromTo(V.spool, { x: 0 }, { x: 4, duration: 0.08, yoyo: true, repeat: 3, ease: "none", immediateRender: false }, b + t1 + 0.6);

// ② the burned coil is found: charred windings, smoke, red ring
const t2 = c[1] + 0.2;
V.burn("a", b + t2, 0.6);
H.v12Ring(root, 87, 160, 112, 118, b + t2 + 0.1, { repeat: 7 });
H.v12Smoke(root, 140, 66, b + t2 + 0.3, b + D, { n: 4, rise: 90, cycle: 1.6, r: 12 });

// ③ the other failures listed for a broken solenoid valve (secondary, muted tags)
const t3 = c[2];
const tag = (lines, tx, ty, x1, y1, x2, y2, anchor = "middle") => {
  const g = H.el("g", { opacity: 0 }, root);
  lines.forEach((s, i) => H.text(g, tx, ty + i * 32, s, { size: 26, anchor, fill: C.blue }));
  H.el("path", { d: `M ${x1} ${y1} L ${x2} ${y2}`, fill: "none", stroke: C.blue, "stroke-width": 3 }, g);
  H.el("circle", { cx: x2, cy: y2, r: 7, fill: C.blue, stroke: "#ffffff", "stroke-width": 2.5 }, g);
  return g;
};
const g1 = tag(["Spool ค้าง"], 800, 392, 790, 366, 565, 160);
const g2 = tag(["Spring หัก"], 800, 330, 790, 304, 668, 190);
const g3 = tag(["Back pressure", "ที่ T เกิน"], 172, 342, 176, 352, 204, 352, "end");
[g1, g2, g3].forEach((g, i) => H.v12Op(g, 0, 1, b + t3 + 0.6 + i * 0.7, 0.3));
