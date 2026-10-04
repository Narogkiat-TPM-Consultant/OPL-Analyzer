// Daily check (p.17): no complicated instrument — eyes, ears, touch. The 8 check items light up in the list on
// the right as they are spoken; on the unit each item gets its number, its effect and a route line from the
// previous item (= check sequence). Last segment: "every item, in sequence".
const UX = 0, UY = 60;
const U = H.dcUnit("s4-v-u", "s4-v-un", { transform: `translate(${UX} ${UY})`, labels: ["tank", "pump", "motor", "relief", "gauge", "fitting", "level", "circuit"] });
const fx = H.$("s4-v-fx"), route = H.$("s4-v-route"), list = H.$("s4-v-list"), c = T.cues;
const segLen = (k) => (k < c.length ? c[k] - c[k - 1] - 0.3 : D - 0.8 - c[k - 1]);
const SEG = [
  "ไม่ต้องใช้เครื่องมือซับซ้อน ใช้ตา หู และมือสัมผัส ทุกคนทำได้ในเวลาสั้น",
  "หนึ่ง ความสกปรกภายนอก สอง น้ำมันรั่ว สาม การสั่น สี่ เสียงดัง",
  "ห้า เสียงผิดปกติ หก อุณหภูมิน้ำมันสูงขึ้น เจ็ด ระดับน้ำมัน แปด อื่นๆ",
];
// time (absolute) when word w is spoken in segment k (1-based), by its character position
const at = (k, w) => b + c[k - 1] + segLen(k) * Math.max(0, SEG[k - 1].indexOf(w)) / SEG[k - 1].length;

// ---- list panel: no instrument → eyes · ears · hand
const LX = 1130;
const meter = H.dcSense(list, "meter", LX + 56, 74, 1, { id: "s4-v-meter" });
const no = H.noSign(list, LX + 56, 74, 50, "s4-v-no");
H.el("path", { id: "s4-v-arr", d: H.arrowD(LX + 122, 74, LX + 176, 74, 16), fill: "none", stroke: DC.ink, "stroke-width": 5 }, list);
const senses = [["eye", "ตา · ดู", "ตา หู"], ["ear", "หู · ฟัง", "หู และ"], ["hand", "มือ · สัมผัส", "มือสัมผัส"]];
const sx = [LX + 246, LX + 386, LX + 526];
const sg = senses.map(([k, label, word], i) => {
  const g = H.el("g", { id: `s4-v-s${i}` }, list);
  H.dcBadge(g, `s4-v-sb${i}`, k, sx[i], 74, 46);
  H.text(g, sx[i], 152, label, { size: 24, anchor: "middle" });
  tl.fromTo(g, { opacity: 0, scale: 0.5, svgOrigin: `${sx[i]} 74` }, { opacity: 1, scale: 1, svgOrigin: `${sx[i]} 74`, duration: 0.35, ease: "back.out(2)" }, at(1, word));
  return g;
});
tl.fromTo([meter, no], { opacity: 0 }, { opacity: 1, duration: 0.3 }, at(1, "ไม่ต้อง"));
tl.fromTo("#s4-v-arr", { opacity: 0 }, { opacity: 1, duration: 0.3 }, at(1, "ใช้ตา") - 0.2);
const sub = H.text(list, LX + 300, 196, "ทุกคนทำได้ · ใช้เวลาสั้น", { size: 24, anchor: "middle", fill: DC.muted, id: "s4-v-sub" });
tl.fromTo(sub, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at(1, "ทุกคน"));

// ---- the 8 items (deck order), sense used, spoken word, number badge on the unit (unit coords)
const ITEMS = [
  { t: "ความสกปรกภายนอก (Outside dirt)", s: "eye", seg: 2, w: "หนึ่ง", n: [100, 470] },
  { t: "น้ำมันรั่ว (Oil leak)", s: "eye", seg: 2, w: "สอง", n: [582, 246] },
  { t: "การสั่น (Vibration)", s: "hand", seg: 2, w: "สาม", n: [484, 284] },
  { t: "เสียงดัง (Noise)", s: "ear", seg: 2, w: "สี่", n: [350, 230] },
  { t: "เสียงผิดปกติ (Abnormal noise)", s: "ear", seg: 3, w: "ห้า", n: [100, 258] },
  { t: "อุณหภูมิน้ำมันสูงขึ้น (Oil temp.) *", s: "hand", seg: 3, w: "หก", n: [338, 452] },
  { t: "ระดับน้ำมัน (Oil level)", s: "eye", seg: 3, w: "เจ็ด", n: [660, 436] },
  { t: "อื่นๆ (Others)", s: "plus", seg: 3, w: "แปด", n: [880, 440] },
];
const RY = (i) => 236 + 62 * i;
const times = ITEMS.map((it) => at(it.seg, it.w));
const rowHi = H.el("rect", { id: "s4-v-hi", x: LX + 2, y: RY(0) - 28, width: 610, height: 56, rx: 12, fill: DC.pale, stroke: DC.blue, "stroke-width": 3, opacity: 0 }, list);
ITEMS.forEach((it, i) => {
  const row = H.el("g", { id: `s4-v-row${i}` }, list);
  H.dcNum(row, `s4-v-rn${i}`, LX + 30, RY(i), i + 1, { r: 21 });
  H.el("circle", { cx: LX + 82, cy: RY(i), r: 23, fill: DC.paper, stroke: DC.blue, "stroke-width": 3 }, row);
  if (it.s === "plus") H.el("path", { d: `M ${LX + 70} ${RY(i)} L ${LX + 94} ${RY(i)} M ${LX + 82} ${RY(i) - 12} L ${LX + 82} ${RY(i) + 12}`, fill: "none", stroke: DC.ink, "stroke-width": 4 }, row);
  else H.dcSense(row, it.s, LX + 82, RY(i), 0.52, { sw: 5 });
  H.text(row, LX + 118, RY(i) + 10, it.t, { size: 28 });
  tl.fromTo(row, { opacity: 0.25 }, { opacity: 1, duration: 0.3 }, times[i]);
});
// highlight bar follows the item being spoken
times.forEach((t, i) => {
  if (i === 0) tl.fromTo(rowHi, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 0.25 }, t);
  else tl.fromTo(rowHi, { y: 62 * (i - 1) }, { y: 62 * i, duration: 0.25, ease: "power2.out", immediateRender: false }, t);
});

// ---- number badges + route on the unit
const P = ITEMS.map((it) => [it.n[0] + UX, it.n[1] + UY]);
ITEMS.forEach((it, i) => {
  const [x, y] = P[i];
  if (i > 0) {
    const [x0, y0] = P[i - 1], dx = x - x0, dy = y - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const seg = H.el("path", { id: `s4-v-rt${i}`, d: `M ${H.f(x0 + 24 * ux)} ${H.f(y0 + 24 * uy)} L ${H.f(x - 26 * ux)} ${H.f(y - 26 * uy)}`, fill: "none", stroke: DC.blue, "stroke-width": 4, "stroke-linecap": "butt", opacity: 0.85 }, route);
    const head = H.el("path", { id: `s4-v-rh${i}`, d: H.arrowD(x - 40 * ux, y - 40 * uy, x - 25 * ux, y - 25 * uy, 13).replace(/^M [^M]+/, ""), fill: "none", stroke: DC.blue, "stroke-width": 4, opacity: 0 }, route);
    const len = L - 50;
    tl.fromTo(seg, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" }, times[i] - 0.1);
    tl.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.1 }, times[i] + 0.3);
  }
  const g = H.dcNum(fx, `s4-v-n${i}`, x, y, i + 1, { r: 22 });
  tl.fromTo(g, { opacity: 0, scale: 0.4, svgOrigin: `${x} ${y}` }, { opacity: 1, scale: 1, svgOrigin: `${x} ${y}`, duration: 0.3, ease: "back.out(2)" }, times[i]);
});
H.chip(fx, "s4-v-oth", 912, 440 + UY, "อื่นๆ (Others)", { size: 24 });
tl.fromTo("#s4-v-oth", { opacity: 0 }, { opacity: 1, duration: 0.3 }, times[7] + 0.1);

// ---- what each item looks like (short effect at its turn)
const S = U;
tl.fromTo(S.dirt, { opacity: 0 }, { opacity: 1, duration: 0.5 }, times[0] + 0.1);
H.dcLeak(S, times[1] + 0.1, times[1] + 2.6);
tl.fromTo(S.vib, { opacity: 0 }, { opacity: 1, duration: 0.15, yoyo: true, repeat: 5, immediateRender: false }, times[2] + 0.1);
H.dcShake(S.pump, times[2] + 0.1, times[2] + 1.2, 2.6);
H.dcFlash(S.noise, times[3] + 0.1, 1.3);
H.dcFlash(S.jag, times[4] + 0.1, 1.3, 0.08);
tl.fromTo(S.heat, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, yoyo: true, repeat: 3, immediateRender: false }, times[5] + 0.1);
const lv = H.el("rect", { id: "s4-v-lv", x: 676 + UX, y: 408 + UY, width: 68, height: 188, rx: 14, fill: "none", stroke: DC.blue, "stroke-width": 5, opacity: 0 }, fx);
tl.fromTo(lv, { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 3, immediateRender: false }, times[6] + 0.1);
// running unit
tl.fromTo(S.flow, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, b + 0.4);
tl.fromTo(S.flow, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round((D - 0.4) * 3), duration: D - 0.4, ease: "none", immediateRender: false }, b + 0.4);

// ---- last segment: every item, in sequence
const tEnd = b + c[3];
const key = H.chip(fx, "s4-v-key", 948, 560 + UY, "ตรวจครบทุกข้อ · ตามลำดับ", { size: 28, stroke: DC.red, color: DC.red, sw: 4 });
tl.fromTo(key, { opacity: 0, scale: 0.6, svgOrigin: `948 ${560 + UY}` }, { opacity: 1, scale: 1, svgOrigin: `948 ${560 + UY}`, duration: 0.35, ease: "back.out(2)" }, tEnd + 0.1);
tl.fromTo(route, { opacity: 1 }, { opacity: 0.35, duration: 0.2, yoyo: true, repeat: 3, immediateRender: false }, tEnd + 0.5);
ITEMS.forEach((_, i) => {
  const [x, y] = P[i];
  tl.fromTo(`#s4-v-n${i}`, { scale: 1, svgOrigin: `${x} ${y}` }, { scale: 1.3, svgOrigin: `${x} ${y}`, duration: 0.14, yoyo: true, repeat: 1, immediateRender: false }, tEnd + 0.4 + 0.16 * i);
});
