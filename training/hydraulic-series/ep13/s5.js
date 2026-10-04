// Compare: left = daily check (three senses + a daily check sheet ticked item by item),
// right = regular check (the 4 items of p.17 light up as they are spoken in segment 3).
const c = T.cues;
const segLen = (k) => (k < c.length ? c[k] - c[k - 1] - 0.3 : D - 0.8 - c[k - 1]);
const SEG3 = "น้ำมันและฟิลเตอร์สกปรก สต็อปเปอร์โบลต์คลาย ซีลแพ็กกิ้งเสื่อม";
const at3 = (w) => b + c[2] + segLen(3) * Math.max(0, SEG3.indexOf(w)) / SEG3.length;

// ---- left card: eyes · ears · hand + daily check sheet (8 rows ticked in order)
{
  const g = H.$("s5-v-a"), t0 = b + T.left + 0.5;
  [["eye", "ดู"], ["ear", "ฟัง"], ["hand", "สัมผัส"]].forEach(([k, label], i) => {
    const x = 80 + 140 * i, gg = H.el("g", { id: `s5-v-s${i}` }, g);
    H.dcBadge(gg, `s5-v-sb${i}`, k, x, 92, 54);
    H.text(gg, x, 192, label, { size: 30, anchor: "middle" });
    tl.fromTo(gg, { opacity: 0, scale: 0.5, svgOrigin: `${x} 92` }, { opacity: 1, scale: 1, svgOrigin: `${x} 92`, duration: 0.3, ease: "back.out(2)" }, t0 + 0.25 * i);
  });
  // check sheet
  H.el("rect", { x: 470, y: 10, width: 270, height: 220, rx: 12, fill: DC.paper, stroke: DC.ink, "stroke-width": 4 }, g);
  H.el("rect", { x: 470, y: 10, width: 270, height: 40, rx: 12, fill: DC.blue }, g);
  H.el("rect", { x: 470, y: 36, width: 270, height: 14, fill: DC.blue }, g);
  H.text(g, 605, 39, "Daily check sheet", { size: 22, anchor: "middle", fill: "#ffffff" });
  for (let i = 0; i < 8; i++) {
    const y = 64 + 21 * i;
    H.text(g, 492, y + 7, String(i + 1), { size: 17, anchor: "middle" });
    H.el("rect", { x: 508, y: y - 3, width: 150 - (i % 3) * 22, height: 7, rx: 3, fill: DC.line }, g);
    H.el("rect", { x: 690, y: y - 8, width: 18, height: 17, rx: 3, fill: "#ffffff", stroke: DC.ink, "stroke-width": 2 }, g);
    const tick = H.el("path", { id: `s5-v-tk${i}`, d: `M ${693} ${y} L ${698} ${y + 5} L ${707} ${y - 7}`, fill: "none", stroke: DC.green, "stroke-width": 3.5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    tl.fromTo(tick, { opacity: 0 }, { opacity: 1, duration: 0.12 }, t0 + 0.9 + 0.2 * i);
  }
}

// ---- right card: the 4 regular-check items, dimmed until spoken
{
  const g = H.$("s5-v-b");
  const R = [
    ["oil", ["ความสกปรก", "ของน้ำมัน"], "น้ำมัน"],
    ["filter", ["ฟิลเตอร์", "สกปรก"], "ฟิลเตอร์"],
    ["stopper", ["Stopper bolt", "คลาย"], "สต็อปเปอร์"],
    ["seal", ["Seal packing", "เสื่อม"], "ซีล"],
  ];
  R.forEach(([k, lines, w], i) => {
    const x = 95 + 190 * i, t = at3(w), gg = H.el("g", { id: `s5-v-r${i}` }, g);
    const S = H.dcReg(gg, k, x, 82);
    H.dcNum(gg, `s5-v-rn${i}`, x - 66, 22, i + 1, { r: 18 });
    H.text(gg, x, 184, lines[0], { size: 23, anchor: "middle" });
    H.text(gg, x, 214, lines[1], { size: 23, anchor: "middle" });
    tl.fromTo(gg, { opacity: 0.3 }, { opacity: 1, duration: 0.3 }, t);
    const bad = S.dirt || S.gap || S.crack;
    if (bad) tl.fromTo(bad, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t + 0.25);
    if (S.bolt) tl.fromTo(S.lock, { x: 0 }, { x: 7, duration: 0.4 }, t + 0.25);
  });
}
