// HFI (Hydraulic Fluid Index, OPL 5-B-1 reference): the formula is built as a picture.
// cue 1: "HFI =" with empty numerator/denominator · cue 2: 12 monthly top-up cans (average × 12 = 1 year)
// cue 3: ÷ tank capacity → result · cue 4: oil that is topped up has to go somewhere → leak?
// Numbers (10 L/month, 60 L tank) are a hypothetical example, labelled on screen.
{
  const P = H.$("s4-v-art"), c = T.cues, f = H.f;
  const seg = (k) => (k < c.length ? c[k] - c[k - 1] - 0.3 : D - 0.8 - c[k - 1]);

  // ① HFI = [ … ] / [ … ]
  const hfi = H.text(P, 20, 262, "HFI =", { size: 64, fill: E9.blue, id: "s4-v-hfi" });
  const ph = H.el("g", { id: "s4-v-ph" }, P);
  H.el("rect", { x: 228, y: 52, width: 836, height: 170, rx: 16, fill: "none", stroke: E9.line, "stroke-width": 4, "stroke-dasharray": "14 10" }, ph);
  H.el("rect", { x: 470, y: 272, width: 350, height: 250, rx: 16, fill: "none", stroke: E9.line, "stroke-width": 4, "stroke-dasharray": "14 10" }, ph);
  const bar = H.el("line", { id: "s4-v-bar", x1: 228, y1: 246, x2: 1064, y2: 246, stroke: E9.line, "stroke-width": 7 }, P);
  tl.fromTo(hfi, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, b + c[0] + 0.3);
  tl.fromTo([ph, bar], { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[0] + 0.8);

  // ② 12 monthly top-ups (average) → 1 year
  const ex = H.el("g", { id: "s4-v-ex" }, P);
  H.el("rect", { x: 884, y: 4, width: 200, height: 40, rx: 10, fill: "#fff8e6", stroke: E9.yellow, "stroke-width": 3 }, ex);
  H.text(ex, 984, 33, "ตัวอย่างสมมติ", { size: 24, fill: "#9a6a00", anchor: "middle" });
  const top = H.text(P, 240, 40, "เติมแต่ละเดือน (Replenished)", { size: 26, fill: E9.muted, weight: 700, id: "s4-v-top" });
  const cans = [];
  for (let i = 0; i < 12; i++) {
    const x = 246 + i * 68;
    const g = H.el("g", { id: `s4-v-can${i + 1}` }, P);
    H.e9Can(g, x, 66, 54, 72);
    H.text(g, x + 30, 168, String(i + 1), { size: 22, fill: E9.muted, anchor: "middle", weight: 700 });
    cans.push(g);
  }
  const sum = H.text(P, 646, 214, "10 L × 12 เดือน = 120 L / ปี", { size: 32, anchor: "middle", id: "s4-v-sum" });
  const a2 = b + c[1];
  tl.fromTo([ex, top], { opacity: 0 }, { opacity: 1, duration: 0.3 }, a2 + 0.1);
  tl.fromTo(cans, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.12, ease: "power2.out" }, a2 + 0.3);
  tl.fromTo(sum, { opacity: 0 }, { opacity: 1, duration: 0.35 }, a2 + Math.min(2.2, 0.75 * seg(2)));

  // ③ ÷ tank capacity → HFI
  const tank = H.el("g", { id: "s4-v-tank" }, P);
  H.e9Tank(tank, 500, 300, 290, 160, 0.75);
  H.text(tank, 645, 506, "ความจุถัง 60 L", { size: 30, anchor: "middle" });
  const res = H.el("g", { id: "s4-v-res" }, P);
  H.text(res, 950, 420, "= 2", { size: 92, fill: E9.blue, anchor: "middle" });
  H.text(res, 950, 468, "เติมไป 2 เท่า", { size: 26, fill: E9.muted, anchor: "middle", weight: 700 });
  H.text(res, 950, 502, "ของความจุถัง / ปี", { size: 26, fill: E9.muted, anchor: "middle", weight: 700 });
  const a3 = b + c[2];
  tl.fromTo(bar, { attr: { stroke: E9.line } }, { attr: { stroke: E9.ink }, duration: 0.3, immediateRender: false }, a3 + 0.1);
  tl.fromTo(tank, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, a3 + 0.2);
  tl.fromTo(ph, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, a3 + 0.2);
  tl.fromTo(res, { opacity: 0, scale: 0.7, svgOrigin: "930 400" }, { opacity: 1, scale: 1, svgOrigin: "930 400", duration: 0.4, ease: "back.out(2)" }, a3 + Math.min(1.6, 0.7 * seg(3)));

  // ④ topped-up oil leaves somewhere: a weeping fitting on the line from the tank
  const lk = H.el("g", { id: "s4-v-leak" }, P);
  const L = H.e9Line(lk, 30, 498, 420, 240, { k: 0.7, wet: true });
  const [dx, dy] = L.drip;
  H.e9Floor(lk, 20, 480, 604, dx, { rx: 46, ry: 7, h: 10 });
  H.el("ellipse", { cx: 240, cy: 420, rx: 82, ry: 50, fill: "none", stroke: E9.red, "stroke-width": 5 }, lk);
  H.text(lk, dx + 40, 548, "รั่ว?", { size: 42 });
  const a4 = b + c[3];
  tl.fromTo(lk, { opacity: 0 }, { opacity: 1, duration: 0.4 }, a4 + 0.2);
  H.e9Drip(lk, dx, dy, 10, 604 - 4 - (dy + 27.5), 0.9, a4 + 0.4, b + D - 0.1, { fall: 0.45, sw: 2.5 });
}
