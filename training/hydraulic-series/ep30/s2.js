// Why bind air tubes (OPL 5'-C-4, p.47): loose tubes swing and rub → abrasion; a neat bundle is easy to wipe clean.
const f = H.f;

// Left (NG): three loose tubes cross each other and lie over a frame edge; they swing and rub → wear marks.
{
  const L = H.$("s2-v-l"), t0 = b + T.left;
  H.el("rect", { x: 300, y: 170, width: 200, height: 58, fill: AT.wall, stroke: AT.ink, "stroke-width": 4 }, L);
  for (let i = 0; i < 5; i++) H.el("line", { x1: 318 + i * 38, y1: 222, x2: 340 + i * 38, y2: 176, stroke: AT.metal, "stroke-width": 3 }, L);
  H.atLabel(L, 400, 222, "โครงเครื่อง", { size: 22, anchor: "middle", fill: AT.muted, halo: AT.wall });
  H.el("rect", { x: 24, y: 26, width: 40, height: 96, rx: 6, fill: AT.metal, stroke: AT.ink, "stroke-width": 4 }, L);
  H.el("rect", { x: 696, y: 26, width: 40, height: 96, rx: 6, fill: AT.metal, stroke: AT.ink, "stroke-width": 4 }, L);
  const y0 = [44, 72, 100], y1 = [100, 72, 44];
  const dA = (i) => `M 64 ${y0[i]} C ${230 + 8 * i} ${f(196 - 4 * i)} ${520 - 6 * i} ${f(186 + 3 * i)} 696 ${y1[i]}`;
  const dB = (i) => `M 64 ${y0[i]} C ${262 - 6 * i} ${f(180 + 5 * i)} ${492 + 8 * i} ${f(198 - 4 * i)} 696 ${y1[i]}`;
  const tubes = [0, 1, 2].map((i) => H.atTubeS(L, dA(i), { w: 22, wall: 5 }));
  const ts = t0 + 0.5, half = 0.42, n = Math.max(2, 2 * Math.floor((b + D - ts) / (2 * half)));
  tubes.forEach((tb, i) => tl.fromTo(tb.paths, { attr: { d: dA(i) } }, { attr: { d: dB(i) }, duration: half, ease: "sine.inOut", yoyo: true, repeat: n - 1, immediateRender: false }, ts + i * 0.06));
  const wear = H.el("g", { opacity: 0 }, L);
  [[352, 148], [372, 158], [392, 150], [412, 160], [432, 152]].forEach(([x, y]) => H.el("line", { x1: x - 6, y1: y - 7, x2: x + 6, y2: y + 7, stroke: "#ffffff", "stroke-width": 3.5 }, wear));
  H.atOp(wear, 0, 1, t0 + 1.6, 0.4);
  H.atRing(L, 392, 152, 84, 32, t0 + 1.9, 3);
  const lab = H.atLabel(L, 392, 104, "เสียดสี → สึก", { size: 28, anchor: "middle", fill: AT.red });
  H.atHide(lab);
  H.atOp(lab, 0, 1, t0 + 2.1);
}

// Right (OK): a neat bundle held by two binders; dust on it is wiped off in one pass.
{
  const R = H.$("s2-v-r"), t0 = b + T.right;
  const ys = [92, 116, 140];
  ys.forEach((y) => H.atTubeS(R, `M 60 ${y} L 700 ${y}`, { w: 22, wall: 5 }));
  for (const x of [230, 530]) {
    H.el("rect", { x: x - 8, y: 74, width: 16, height: 84, rx: 3, fill: AT.nylon, stroke: AT.ink, "stroke-width": 3 }, R);
    H.el("rect", { x: x - 12, y: 54, width: 24, height: 22, rx: 4, fill: AT.nylon, stroke: AT.ink, "stroke-width": 3 }, R);
  }
  const dust = [[100, 79], [140, 84], [180, 78], [290, 79], [330, 84], [380, 78], [430, 83], [470, 78], [600, 80], [640, 84], [680, 78], [130, 154], [400, 156], [620, 154]];
  const tw = t0 + 0.8, dur = 2.0, xA = 60, xB = 700;
  const specks = dust.map(([x, y]) => H.el("ellipse", { cx: x, cy: y, rx: 10, ry: 6, fill: AT.dirt }, R));
  const rag = H.el("g", { opacity: 0 }, R);
  H.el("path", { d: "M -34 64 C -40 92 -38 150 -30 176 C -10 184 16 182 34 174 C 40 140 42 98 34 66 C 12 58 -12 58 -34 64 Z", fill: "#ffffff", stroke: AT.muted, "stroke-width": 3 }, rag);
  H.el("path", { d: "M -14 70 C -18 110 -16 140 -10 172 M 12 68 C 16 108 18 142 14 172", fill: "none", stroke: AT.line, "stroke-width": 3 }, rag);
  H.atOp(rag, 0, 1, tw - 0.25, 0.25);
  tl.fromTo(rag, { x: xA }, { x: xB, duration: dur, ease: "none", immediateRender: false }, tw);
  H.atOp(rag, 1, 0, tw + dur, 0.3);
  specks.forEach((s, i) => H.atOp(s, 1, 0, tw + ((dust[i][0] - xA) / (xB - xA)) * dur - 0.05, 0.2));
  H.atCheck(R, 724, 46, 1.1, tw + dur + 0.2);
}
