// "Observe temperature through sense of feeling" (OPL 5-C-3, p.19) — the table reproduced row by row, exactly as
// printed (rows 4 and 5 overlap: about 58 °C vs 56–59 °C; kept as in the source and flagged in the report).
// Left: a hand on the equipment surface, a stopwatch for how long the hand can stay (full circle = 1 min), and a
// thermometer that rises to each row's value. Right: the table; the row being spoken is highlighted.
{
  const g = H.$("s5-v-t");
  const c = T.cues;
  const L = (k) => c[k + 1] - c[k] - 0.3; // length of narration segment k (k < last)
  // row times: seg 0 = intro + rows 1, 2 · seg 1 = row 3 · seg 2 = rows 4, 5 · seg 3 = row 6
  const tr = [c[0] + 0.29 * L(0), c[0] + 0.7 * L(0), c[1] + 0.1, c[2] + 0.1, c[2] + 0.5 * L(2), c[3] + 0.1].map((t) => b + t);
  const rows = [
    ["อุ่นเล็กน้อย", "Little warm", "", "ประมาณ 32 °C", 32],
    ["อุ่น", "Warm", "", "ประมาณ 38 °C", 38],
    ["รู้สึกร้อน", "Feel hot", "นานกว่า 1 นาที", "ประมาณ 48 °C", 48],
    ["ร้อนมาก", "Considerably hot", "ประมาณ 15 วินาที", "ประมาณ 58 °C", 58],
    ["ร้อน", "Hot", "ประมาณ 3 วินาที", "56–59 °C", 59],
    ["ร้อน", "Hot", "ไม่ถึง 3 วินาที", "สูงกว่า 60 °C", 63],
  ];

  // ---------------------------------------------------------------- left: surface, hand, heat, stopwatch
  H.el("rect", { x: 30, y: 560, width: 410, height: 150, rx: 12, fill: C15.metal, stroke: C15.ink, "stroke-width": 5 }, g);
  const warm = H.el("rect", { id: "s5-v-warm", x: 30, y: 560, width: 410, height: 150, rx: 12, fill: C15.heat, opacity: 0 }, g);
  H.text(g, 235, 652, "ผิวปั๊ม / มอเตอร์ / วาล์ว / ท่อ", { size: 26, anchor: "middle" });
  const heat = H.el("g", { id: "s5-v-heat", opacity: 0 }, g);
  for (const x of [232, 272, 312, 352, 392, 428]) H.el("path", { d: H.heatD(x, 546, 72), fill: "none", stroke: C15.heat, "stroke-width": 6, "stroke-linecap": "round" }, heat);
  const hand = H.hand15(g, "s5-v-hand", 140, 558, 1.2);

  const wg = H.el("g", { id: "s5-v-wg", opacity: 0 }, g);
  H.text(wg, 330, 82, "เต็มวง = 1 นาที", { size: 22, anchor: "middle", fill: C15.muted });
  const W = H.stopwatch(wg, 330, 190, 72, { id: "s5-v-w", color: C15.heat });
  const hold = rows.map((r, i) => {
    if (!r[2]) return null;
    const t = H.text(g, 330, 318, r[2], { size: 30, anchor: "middle", id: `s5-v-hold${i}` });
    t.setAttribute("opacity", 0);
    return t;
  });

  // thermometer: y(T) = 620 − 13·(T − 30)
  const yT = (t) => 620 - 13 * (t - 30);
  H.el("rect", { x: 498, y: 60, width: 44, height: 600, rx: 22, fill: C15.paper, stroke: C15.ink, "stroke-width": 5 }, g);
  H.el("circle", { cx: 520, cy: 668, r: 40, fill: C15.heat, stroke: C15.ink, "stroke-width": 5 }, g);
  const liq = H.el("rect", { id: "s5-v-liq", x: 511, y: yT(28), width: 18, height: 668 - yT(28), fill: C15.heat }, g);
  for (let t = 30; t <= 65; t += 5) {
    const y = yT(t), major = t % 10 === 0;
    H.el("line", { x1: major ? 480 : 488, y1: y, x2: 498, y2: y, stroke: C15.ink, "stroke-width": major ? 4 : 2.5 }, g);
    if (major) H.text(g, 474, y + 9, String(t), { size: 26, anchor: "end" });
  }
  H.text(g, 520, 44, "°C", { size: 26, anchor: "middle" });
  // bracket for the 56–59 °C row
  const br = H.el("g", { id: "s5-v-br", opacity: 0 }, g);
  H.el("path", { d: `M 548 ${yT(56)} L 562 ${yT(56)} L 562 ${yT(59)} L 548 ${yT(59)}`, fill: "none", stroke: C15.blue, "stroke-width": 5 }, br);
  H.text(br, 570, yT(57.5) + 8, "56–59", { size: 22, fill: C15.blue });

  // ---------------------------------------------------------------- right: the table
  const X0 = 650, W0 = 1095, Y0 = 100, RH = 102;
  const hl = H.el("rect", { id: "s5-v-hl", x: X0, y: Y0, width: W0, height: RH, fill: "#fbe3bf", opacity: 0 }, g);
  H.el("rect", { x: X0, y: 24, width: W0, height: 76, rx: 10, fill: C15.tube }, g);
  H.el("rect", { x: X0, y: Y0 - 8, width: W0, height: 8, fill: C15.tube }, g);
  for (const [x, s] of [[676, "ความรู้สึก (Feel)"], [1172, "วางมือได้"], [1472, "อุณหภูมิ (Temp.)"]]) H.text(g, x, 74, s, { size: 30 });
  for (let i = 1; i < 6; i++) H.el("line", { x1: X0, y1: Y0 + i * RH, x2: X0 + W0, y2: Y0 + i * RH, stroke: C15.ink, "stroke-width": 2, opacity: 0.25 }, g);
  for (const x of [1150, 1450]) H.el("line", { x1: x, y1: 24, x2: x, y2: Y0 + 6 * RH, stroke: C15.ink, "stroke-width": 2, opacity: 0.25 }, g);
  H.el("rect", { x: X0, y: 24, width: W0, height: Y0 + 6 * RH - 24, rx: 10, fill: "none", stroke: C15.ink, "stroke-width": 3 }, g);
  const rg = rows.map(([th, en, hd, tp], i) => {
    const y = Y0 + i * RH;
    const q = H.el("g", { id: `s5-v-r${i}`, opacity: 0 }, g);
    H.text(q, 676, y + 48, th, { size: 36 });
    H.text(q, 676, y + 85, en, { size: 24, fill: C15.muted, weight: 600 });
    H.text(q, 1172, y + 63, hd || "—", { size: 32, fill: hd ? C15.ink : C15.muted, weight: hd ? 800 : 600 });
    H.text(q, 1472, y + 64, tp, { size: 38 });
    return q;
  });

  // ---------------------------------------------------------------- animation, row by row
  const lift = -70;
  let lvl = 28, warmO = 0, heatO = 0;
  rows.forEach((r, i) => {
    const t = tr[i], first = i === 0;
    tl.fromTo(rg[i], { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, t);
    if (first) tl.fromTo(hl, { opacity: 0, attr: { y: Y0 } }, { opacity: 1, attr: { y: Y0 }, duration: 0.3 }, t);
    else tl.fromTo(hl, { attr: { y: Y0 + (i - 1) * RH } }, { attr: { y: Y0 + i * RH }, duration: 0.3, ease: "power2.inOut", immediateRender: false }, t);
    // thermometer, warm tint, heat lines
    const nl = r[4], nw = [0.06, 0.12, 0.2, 0.3, 0.34, 0.42][i], nh = [0.3, 0.45, 0.65, 0.85, 0.9, 1][i];
    tl.fromTo(liq, { attr: { y: yT(lvl), height: 668 - yT(lvl) } }, { attr: { y: yT(nl), height: 668 - yT(nl) }, duration: 0.7, ease: "power2.out", immediateRender: first }, t);
    tl.fromTo(warm, { opacity: warmO }, { opacity: nw, duration: 0.6, immediateRender: first }, t);
    tl.fromTo(heat, { opacity: heatO }, { opacity: nh, duration: 0.6, immediateRender: first }, t);
    lvl = nl; warmO = nw; heatO = nh;
  });
  tl.fromTo(br, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tr[4] + 0.3);

  // stopwatch: how long the hand can stay (rows 3–6); the hand lifts when the time is up (rows 4–6)
  tl.fromTo(wg, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tr[2]);
  const fr = { 2: [1, 1.6], 3: [15 / 60, 1.0], 4: [3 / 60, 0.45], 5: [2 / 60, 0.3] };
  let handDown = true;
  [2, 3, 4, 5].forEach((i, n) => {
    const t = tr[i], [f, d] = fr[i];
    if (!handDown) tl.fromTo(hand, { y: lift }, { y: 0, duration: 0.25, ease: "power2.in", immediateRender: false }, t);
    tl.fromTo(W.ring, { strokeDashoffset: W.offset(0) }, { strokeDashoffset: W.offset(f), duration: d, ease: "none", immediateRender: false }, t + 0.25);
    tl.fromTo(W.hand, { rotation: 0, svgOrigin: W.origin }, { rotation: W.rot(f), svgOrigin: W.origin, duration: d, ease: "none", immediateRender: false }, t + 0.25);
    tl.fromTo(hold[i], { opacity: 0 }, { opacity: 1, duration: 0.25 }, t);
    if (i < 5) tl.fromTo(hold[i], { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, tr[i + 1] - 0.05);
    if (i >= 3) {
      tl.fromTo(hand, { y: 0 }, { y: lift, duration: 0.3, ease: "power2.out", immediateRender: false }, t + 0.3 + d);
      handDown = false;
    }
  });
}
