// Mechanism (general rule): bubbles in the oil.
//  seg 1 — Cavitation: the strainer clogs, the pump has to suck hard → bubbles form at the pump inlet
//  seg 2 — Aeration: air leaks in at the suction-tube joint → bubbles travel with the oil into the pump
//  seg 3 — the bubbles are squeezed and burst on the way to the discharge → noise + the gauge needle shakes
// Vane pump from EP04 turned 90°: intake on the left, discharge on the right, rotor turns counter-clockwise,
// so the pump chambers carry oil (and bubbles) along the bottom from intake to discharge.
const c = T.cues;
const base = H.$("s3-v-pump"), fx = H.$("s3-v-fx");
const f = H.f;
const OX = 720, OY = 300, SC = 0.6, W = 55; // pump centre, scale, rotor speed (deg/s)

// ---- tank, strainer, suction channel with the screwed joint, discharge channel, gauge
const pipes = H.el("g", {}, base);
H.el("rect", { x: 30, y: 470, width: 380, height: 145, fill: PC.air, stroke: PC.ink, "stroke-width": 5 }, pipes);
H.el("rect", { x: 33, y: 500, width: 374, height: 112, fill: PC.oil }, pipes);
H.el("line", { x1: 33, y1: 500, x2: 407, y2: 500, stroke: "#c9971b", "stroke-width": 3 }, pipes);
const chan = (d, col = PC.oilBg) => {
  H.el("path", { d, fill: "none", stroke: PC.ink, "stroke-width": 46, "stroke-linejoin": "miter" }, pipes);
  return () => H.el("path", { d, fill: "none", stroke: col, "stroke-width": 38, "stroke-linejoin": "miter" }, pipes);
};
const sucIn = chan("M 130 548 L 130 300 L 552 300");
const disIn = chan("M 888 300 L 1088 300");
H.el("path", { d: "M 990 300 L 990 200", fill: "none", stroke: PC.ink, "stroke-width": 22 }, pipes);
// joint plates (the bore is painted over them, so only the outer stubs show)
for (const x of [316, 334]) H.el("rect", { x, y: 264, width: 10, height: 72, rx: 2, fill: PC.metal, stroke: PC.ink, "stroke-width": 3 }, pipes);
sucIn(); disIn();
H.el("path", { d: "M 990 286 L 990 200", fill: "none", stroke: PC.oilBg, "stroke-width": 14 }, pipes);
H.el("rect", { x: 20, y: 462, width: 400, height: 12, rx: 3, fill: PC.metal, stroke: PC.ink, "stroke-width": 4 }, pipes);
// strainer (mesh + clog overlay)
H.el("rect", { x: 100, y: 540, width: 60, height: 60, rx: 8, fill: "#ebe6da", stroke: PC.ink, "stroke-width": 4 }, pipes);
const mesh = [];
for (let x = 108; x < 160; x += 8) mesh.push(`M ${x} 544 L ${x} 596`);
for (let y = 548; y < 600; y += 8) mesh.push(`M 104 ${y} L 156 ${y}`);
H.el("path", { d: mesh.join(" "), fill: "none", stroke: PC.ink, "stroke-width": 1.6, opacity: 0.55 }, pipes);
const clog = H.el("rect", { id: "s3-v-clog", x: 100, y: 540, width: 60, height: 60, rx: 8, fill: PC.dirt, opacity: 0 }, pipes);
const G = H.gauge(pipes, 990, 150, 50, { id: "s3-v-g", min: 0, max: 10, ok: [5, 7.5], ticks: 5, minor: 1, labelEvery: 99, value: 6.2 });
// oil flow dashes in the channels
const fl = [["s3-v-f1", "M 130 590 L 130 300 L 552 300"], ["s3-v-f2", "M 888 300 L 1088 300"]]
  .map(([id, d]) => H.el("path", { id, d, fill: "none", stroke: PC.blue, "stroke-width": 5, "stroke-dasharray": "12 16", "stroke-linecap": "butt", opacity: 0 }, pipes).id);
H.hydFlow(fl, b + 0.3, D - 0.3);
// labels
H.text(base, 166, 444, "ท่อดูด (Suction)", { size: 24, anchor: "start" });
H.text(base, 172, 592, "Strainer", { size: 23, anchor: "start" });
H.text(base, 720, 140, "ปั๊ม (ภาพตัด)", { size: 24, anchor: "middle" });
H.text(base, 1000, 352, "ไปวงจร →", { size: 24, anchor: "middle" });
H.text(base, 990, 82, "เกจวัดแรงดัน", { size: 23, anchor: "middle" });

// ---- the pump (turns all scene long)
const P = H.vanePump(base, "s3-v-p", { x: OX, y: OY, s: SC, rot: 90, chambers: [] });
H.vpSpin(P, b, b + D, (t) => -W * (t - b));

// ---- bubbles: screen position from local polar coordinates of the (unrotated) pump
const scr = (th, r) => { const a = (th * Math.PI) / 180; return [OX - SC * r * Math.sin(a), OY + SC * r * Math.cos(a)]; };
const gap = (th) => VP.R - VP.dRotor(th);
const X0 = scr(90, (VP.R + VP.dRotor(90)) / 2)[0]; // where the ride around the rotor starts
const V = 150; // px/s along the suction pipe
const rnd = (k) => { const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const tBurstOn = c[2] - 0.2; // bursts are drawn from seg 3 on
const tEnd = D - 0.1;
let nB = 0;
// one bubble: born at x = xs (pipe), radius rb; offset k ∈ [-1, 1] across the pipe / chamber; grows in `grow` s
function bubble(ts, xs, rb, k, burstTh, grow) {
  const id = `s3-v-b${nB++}`;
  const tP = (X0 - xs) / V;                  // time in the pipe
  const tR = (90 - burstTh) / W;             // time riding with the rotor
  const life = Math.min(tP + tR, tEnd - ts);
  if (life <= 0.2) return;
  const pos = (tau) => {
    if (tau <= tP) {
      const x = xs + V * tau, fade = Math.min(1, Math.max(0, (X0 - x) / 60));
      return [x, OY + 12 * k * fade];
    }
    const th = 90 - W * (tau - tP);
    return scr(th, (VP.R + VP.dRotor(th)) / 2 + 0.28 * k * gap(th));
  };
  const rad = (tau) => {
    const g0 = Math.min(1, tau / grow);
    const th = 90 - W * Math.max(0, tau - tP);
    const squeeze = 1 - 0.35 * Math.min(1, Math.max(0, -th / 70));
    const pop = Math.min(1, Math.max(0, (tP + tR - tau) / 0.2));
    return rb * g0 * squeeze * pop;
  };
  const el = H.el("circle", { id, cx: 0, cy: 0, r: 0, fill: "#ffffff", stroke: PC.blue, "stroke-width": 2.5, opacity: 0 }, fx);
  const tA = b + ts, tB = b + ts + life;
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.08 }, tA);
  H.fnTo(el, "x", (t) => pos(t - tA)[0], tA, tB, { ir: true });
  H.fnTo(el, "y", (t) => pos(t - tA)[1], tA, tB, { ir: true });
  H.fnTo(el, "r", (t) => rad(t - tA), tA, tB, { attr: true, ir: true });
  tl.to(el, { opacity: 0, duration: 0.05 }, tB);
  // burst star where the bubble collapses (only once seg 3 has started)
  const tb = ts + tP + tR;
  if (tb < tEnd && tb >= tBurstOn) {
    const [bx, by] = pos(tP + tR);
    const st = H.el("g", { id: `${id}s`, opacity: 0 }, fx), d = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + 0.3;
      d.push(`M ${f(bx + 7 * Math.cos(a))} ${f(by + 7 * Math.sin(a))} L ${f(bx + 20 * Math.cos(a))} ${f(by + 20 * Math.sin(a))}`);
    }
    H.el("path", { d: d.join(" "), fill: "none", stroke: PC.red, "stroke-width": 4.5, "stroke-linecap": "round" }, st);
    tl.fromTo(st, { opacity: 1, scale: 0.6, svgOrigin: `${f(bx)} ${f(by)}` }, { opacity: 0, scale: 1.5, svgOrigin: `${f(bx)} ${f(by)}`, duration: 0.5, ease: "power2.out", immediateRender: false }, b + tb);
  }
}

// seg 1 — cavitation: the strainer clogs, then bubbles form at the pump inlet
const tClog = c[0] + 1.5, tCav = c[0] + 2.4;
tl.fromTo(clog, { opacity: 0 }, { opacity: 0.8, duration: 0.8 }, b + tClog);
const chStr = H.chip(fx, "s3-v-cs", 176, 540, "ตัน (Clogged)", { size: 24 });
tl.fromTo(chStr, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + tClog);
const chCav = H.chip(fx, "s3-v-cc", 588, 384, "ดูดยาก → เกิดฟอง (Cavitation)", { size: 24, anchor: "end" });
tl.fromTo(chCav, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + tCav);
for (let t = tCav, i = 0; t < tEnd - 1.0; t += 0.27, i++) bubble(t, 574 + 34 * rnd(i), 5 + 3 * rnd(i + 50), 2 * rnd(i + 100) - 1, -35 - 40 * rnd(i + 150), 0.35);

// seg 2 — aeration: air enters at the leaky suction-tube joint
const tAir = c[1] + 0.6;
H.ring(fx, "s3-v-ring", 330, 300, 46, b + tAir - 0.2, 4);
const air = H.el("g", { id: "s3-v-air", opacity: 0 }, fx);
for (const [y1, y2] of [[226, 258]])
  for (const [col, w] of [["#ffffff", 10], [PC.blue, 5]])
    H.el("path", { d: H.arrowD(330, y1, 330, y2, 13), fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, air);
tl.fromTo(air, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + tAir);
const chAir = H.chip(fx, "s3-v-ca", 330, 196, "อากาศรั่วเข้า (Aeration)", { size: 24, anchor: "middle" });
tl.fromTo(chAir, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + tAir);
for (let t = tAir + 0.1, i = 0; t < tEnd - 1.0; t += 0.3, i++) bubble(t, 334, 6 + 2.5 * rnd(i + 300), 2 * rnd(i + 400) - 1, -35 - 40 * rnd(i + 450), 0.15);

// seg 3 — bubbles burst: noise around the discharge side, the gauge needle shakes
const t3 = c[2] + 0.2;
const noise = [];
for (const [i, r] of [[0, 165], [1, 190], [2, 215]].map(([i, r]) => [i, r])) {
  const a = H.el("g", { id: `s3-v-n${i}`, opacity: 0 }, fx);
  for (const [a0, a1] of [[-42, -14], [14, 42]])
    for (const [col, w] of [["#ffffff", 11], [PC.ink, 5]])
      H.el("path", { d: H.arcD(OX, OY, r, a0, a1), fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" }, a);
  noise.push(a);
}
H.psNoise(noise, b + t3, D - t3 - 0.2);
const chB = H.chip(fx, "s3-v-cb", 880, 474, "ฟองถูกอัดแตก", { size: 24, anchor: "middle" });
tl.fromTo(chB, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + t3 + 0.6);
H.psNeedle(G, (t) => 6.2 - 1.6 * Math.min(1, Math.max(0, (t - b - t3) / 1.0)) + 0.7 * H.env(t, b + t3, b + D, 0.3) * H.wob(t, 1.1), b + t3 - 0.1, b + D);
