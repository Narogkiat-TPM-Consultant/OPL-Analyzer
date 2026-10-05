// 1-year inspection (OPL 5'-C-3, p.46): a compact grid of the opened devices. All 8 tile frames are faint from
// the start; each lights up as it is spoken and its key defect animates (crack, clogging, torn diaphragm, rust,
// seat cut, gauge off zero, spool / O-ring, needle cut, scratched tube). Tile 1 = interval + who does it (proposal).
{
  const root = H.$("s6-v-grid"), c = T.cues;
  const SEG = [
    "ทุกหนึ่งปี ช่างซ่อมบำรุงถอดตรวจชิ้นส่วนภายใน",
    "เคสร้าว ไส้กรองตัน ไดอะแฟรม สปริง และเกจเพี้ยนไหม",
    "คอยล์ สปูล โอริง เข็มวาล์ว ผิวในกระบอกสูบ และแพ็กกิ้ง มีรอยบากหรือสึกไหม",
  ];
  const segLen = (k) => (k < c.length ? c[k] - c[k - 1] - 0.3 : D - 0.8 - c[k - 1]);
  const at = (k, w) => b + c[k - 1] + (segLen(k) * Math.max(0, SEG[k - 1].indexOf(w))) / SEG[k - 1].length;
  const end = b + D - 0.1;
  const W = 410, HT = 344, XS = [15, 455, 895, 1335], YS = [10, 386];
  const R = (g, x, y, w, h, fill = PN.metal, rx = 5, sw = 3.5) => H.el("rect", { x, y, width: w, height: h, rx, fill, stroke: PN.ink, "stroke-width": sw }, g);
  const P = (g, d, o = {}) => H.el("path", { d, fill: o.fill || "none", stroke: o.stroke || PN.ink, "stroke-width": o.sw || 3.5, "stroke-linecap": o.cap || "round", "stroke-linejoin": "round", ...(o.id ? { id: o.id } : {}), ...(o.op != null ? { opacity: o.op } : {}) }, g);
  const zig = (x, y0, y1, w, n) => { let d = `M ${x} ${y0}`; for (let i = 1; i <= n; i++) d += ` L ${x + (i % 2 ? w : -w)} ${H.f(y0 + ((y1 - y0) * (i - 0.5)) / n)}`; return d + ` L ${x} ${y1}`; };
  const drawOn = (el, t, d = 0.6) => { const L = el.getTotalLength(); tl.fromTo(el, { strokeDasharray: L, strokeDashoffset: L, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: d, ease: "power1.inOut" }, t); };
  const fadeIn = (els, t, stag = 0.12) => [].concat(els).forEach((e, i) => tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + i * stag));

  // [EN title, Thai title, check lines, time]
  const TILES = [
    ["1 Year", "ถอดตรวจภายใน", ["เปิดอุปกรณ์ ดูชิ้นส่วนภายใน", "ผู้ทำ: ช่างซ่อมบำรุง (PM) *"], b + c[0] + 0.1],
    ["Air filter", "ฟิลเตอร์ลม", ["Case แตกร้าว?", "ไส้กรอง (Element) อุดตัน?"], at(2, "เคส")],
    ["Regulator", "ตัวปรับแรงดัน", ["Diaphragm เสียหาย?", "สปริง สนิม / ล้า / หัก?", "Packing มีรอยบาก?"], at(2, "ไดอะแฟรม")],
    ["Relief valve", "วาล์วระบาย", ["Valve seat มีรอยบาก?", "Diaphragm เสียหาย?", "สปริง สนิม / หัก?"], at(2, "สปริง")],
    ["Pressure gauge", "เกจวัดแรงดัน", ["เกจเพี้ยนไหม (Accuracy) *"], at(2, "เกจ")],
    ["Direction valve", "วาล์วเปลี่ยนทิศทาง", ["Coil: ฉนวนดีไหม?", "Spool มีรอยบาก / สึก?", "O-ring เสียรูป / บาก / แข็ง?"], at(3, "คอยล์")],
    ["Speed adjust valve", "วาล์วปรับความเร็ว", ["Needle valve มีรอยบาก?", "Seat packing เสียหาย?"], at(3, "เข็มวาล์ว")],
    ["Air cylinder", "กระบอกสูบลม", ["ผิวใน Tube: บาก / เสียรูป?", "O-ring · Packing: บาก / สึก?"], at(3, "ผิวใน")],
  ];
  const art = TILES.map(([en, th, lines, t], i) => {
    const x = XS[i % 4], y = YS[Math.floor(i / 4)];
    const tile = H.el("g", { id: `s6-v-t${i}` }, root);
    const hi = i === 0;
    H.el("rect", { x, y, width: W, height: HT, rx: 16, fill: hi ? PN.pale : PN.paper, stroke: hi ? PN.pipe : "#d6cdb9", "stroke-width": hi ? 4 : 3 }, tile);
    H.text(tile, x + 22, y + 40, en, { size: 27, fill: PN.pipe });
    H.text(tile, x + 22, y + 68, th, { size: 22, fill: PN.muted, weight: 700 });
    lines.forEach((s, k) => {
      const ly = y + 268 + 33 * k;
      H.el("circle", { cx: x + 30, cy: ly - 9, r: 5, fill: PN.pipe }, tile);
      H.text(tile, x + 44, ly, s, { size: 24, weight: 700 });
    });
    const a = H.el("g", { transform: `translate(${x + 15} ${y + 80})` }, tile);
    tl.fromTo(tile, { opacity: 0.16, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t);
    return a;
  });
  const T0 = TILES.map((d) => d[3] + 0.45);

  // 0 — interval + who: calendar "1 ปี", wrench turning
  {
    const g = art[0];
    R(g, 40, 18, 130, 130, PN.paper, 10, 4);
    H.el("rect", { x: 40, y: 18, width: 130, height: 34, rx: 10, fill: PN.pipe }, g);
    for (const x of [72, 138]) R(g, x - 5, 8, 10, 22, PN.dark, 3, 2.5);
    H.text(g, 105, 116, "1 ปี", { size: 44, anchor: "middle", fill: PN.ink });
    const wr = H.el("g", { id: "s6-v-wr" }, g);
    const wg = H.el("g", { transform: "rotate(-40 270 84)" }, wr);
    R(wg, 262, 84, 16, 66, PN.dark, 6, 3);
    P(wg, "M 248 56 A 24 24 0 1 0 292 56 L 281 56 L 281 76 L 259 76 L 259 56 Z", { fill: PN.dark, sw: 3 });
    tl.fromTo(wr, { rotation: 0, svgOrigin: "270 84" }, { rotation: 22, svgOrigin: "270 84", duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut" }, T0[0]);
  }
  // 1 — filter: bowl drops off the head (opened), crack draws on the bowl, element clogs with dirt
  {
    const g = art[1];
    R(g, 34, 6, 110, 34);
    const bowl = H.el("g", { id: "s6-v-bowl" }, g);
    P(bowl, "M 48 44 L 48 118 Q 48 150 89 150 Q 130 150 130 118 L 130 44 Z", { fill: PN.bowl, sw: 4 });
    const crack = P(bowl, "M 62 66 L 74 80 L 66 92 L 80 106 L 72 120", { stroke: PN.red, sw: 4, id: "s6-v-crack", op: 0 });
    tl.fromTo(bowl, { y: 0 }, { y: 8, duration: 0.4, ease: "power2.out" }, T0[1] - 0.3);
    drawOn(crack, T0[1]);
    R(g, 220, 16, 70, 128, "#ece8dc", 6, 3.5);
    for (let x = 230; x <= 280; x += 8) H.el("line", { x1: x, y1: 22, x2: x, y2: 138, stroke: PN.dark, "stroke-width": 2 }, g);
    const dirt = [];
    [[234, 40], [262, 52], [246, 74], [276, 88], [230, 104], [258, 112], [242, 128], [270, 130], [252, 30], [280, 60]].forEach(([x, y], i) =>
      dirt.push(H.el("circle", { id: `s6-v-dt${i}`, cx: x, cy: y, r: 7, fill: PN.dirt, opacity: 0 }, g)));
    fadeIn(dirt, T0[1] + 0.4, 0.1);
    H.text(g, 255, 4, "Element", { size: 18, anchor: "middle", fill: PN.muted, weight: 700 });
  }
  // 2 — regulator: spring (rust spots), diaphragm (tear), packing (cut)
  {
    const g = art[2];
    P(g, zig(60, 14, 140, 30, 9), { sw: 5, fill: "none" });
    const rust = [[52, 40], [74, 70], [46, 100], [70, 124]].map(([x, y], i) => H.el("circle", { id: `s6-v-ru${i}`, cx: x, cy: y, r: 6, fill: PN.dirt, opacity: 0 }, g));
    H.el("circle", { cx: 190, cy: 78, r: 58, fill: PN.knob, stroke: PN.ink, "stroke-width": 3.5 }, g);
    H.el("circle", { cx: 190, cy: 78, r: 24, fill: PN.metal, stroke: PN.ink, "stroke-width": 3 }, g);
    const tear = P(g, "M 152 50 L 166 62 L 158 72 L 172 84", { stroke: PN.red, sw: 5, id: "s6-v-tear", op: 0 });
    H.el("circle", { cx: 318, cy: 78, r: 36, fill: "none", stroke: PN.ink, "stroke-width": 14 }, g);
    H.el("circle", { cx: 318, cy: 78, r: 36, fill: "none", stroke: "#3a3f46", "stroke-width": 9 }, g);
    const cut = H.el("rect", { id: "s6-v-cut", x: 312, y: 36, width: 12, height: 14, fill: PN.red, opacity: 0 }, g);
    drawOn(tear, T0[2]);
    fadeIn(rust, T0[2] + 0.4);
    fadeIn(cut, T0[2] + 0.9);
  }
  // 3 — relief valve: seat with a cut, poppet lifts and reseats, spring with rust
  {
    const g = art[3];
    R(g, 30, 104, 128, 38); R(g, 222, 104, 128, 38);
    P(g, "M 140 104 L 148 116 L 156 104", { stroke: PN.red, sw: 4, fill: PN.paper });
    const pop = H.el("g", { id: "s6-v-rp" }, g);
    R(pop, 150, 88, 80, 16, PN.dark, 4, 3);
    R(pop, 184, 40, 12, 48, PN.dark, 2, 2.5);
    P(pop, zig(190, 4, 86, 24, 7), { sw: 4 });
    [[176, 30], [206, 60]].forEach(([x, y]) => H.el("circle", { cx: x, cy: y, r: 5.5, fill: PN.dirt }, pop));
    tl.fromTo(pop, { y: 0 }, { y: -10, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, T0[3]);
    H.text(g, 94, 136, "Seat", { size: 20, anchor: "middle", fill: PN.ink, weight: 700 });
  }
  // 4 — pressure gauge: no pressure, but the needle stops off zero (red arc = error)
  {
    const g = art[4];
    const G = H.pnDial(g, 190, 76, 72, { id: "s6-v-gg", zero: true, unit: true, ticks: 10 });
    const err = P(g, H.arcD(190, 76, 60, 135, 135 + 270 * 0.1), { stroke: PN.red, sw: 8, cap: "butt", id: "s6-v-gerr", op: 0 });
    tl.fromTo(G.needle, { rotation: G.rot(0.55), svgOrigin: G.origin }, { rotation: G.rot(0.1), svgOrigin: G.origin, duration: 1.0, ease: "power2.inOut" }, T0[4] - 0.2);
    fadeIn(err, T0[4] + 0.8);
  }
  // 5 — direction valve: coil, sleeve, spool shifting; one O-ring flattened, a cut on a land
  {
    const g = art[5];
    R(g, 8, 26, 58, 104, PN.knob, 6);
    for (let x = 18; x <= 56; x += 9.5) H.el("line", { x1: x, y1: 34, x2: x, y2: 122, stroke: "#7b828b", "stroke-width": 2.5 }, g);
    R(g, 66, 40, 300, 76, "#f4f1ea", 6);
    const sp = H.el("g", { id: "s6-v-sp" }, g);
    R(sp, 76, 72, 236, 12, PN.dark, 2, 2);
    for (const x of [92, 172, 252]) {
      R(sp, x, 52, 40, 52, PN.steel, 4, 3);
      H.el("rect", { x: x + 6, y: 46, width: 28, height: 8, rx: 4, fill: "#2b2f35" }, sp);
      H.el("rect", { x: x + 6, y: x === 172 ? 104 : 102, width: 28, height: x === 172 ? 4 : 8, rx: 2, fill: "#2b2f35" }, sp);
    }
    H.el("path", { d: "M 258 52 L 264 62 L 270 52", fill: PN.paper, stroke: PN.red, "stroke-width": 3.5 }, sp);
    const ring = H.el("ellipse", { id: "s6-v-or", cx: 192, cy: 108, rx: 26, ry: 11, fill: "none", stroke: PN.red, "stroke-width": 3.5, opacity: 0 }, sp);
    tl.fromTo(sp, { x: 0 }, { x: 34, duration: 0.45, yoyo: true, repeat: 3, ease: "power2.inOut" }, T0[5]);
    fadeIn(ring, T0[5] + 0.3);
    H.text(g, 37, 150, "Coil", { size: 20, anchor: "middle", fill: PN.muted, weight: 700 });
    H.text(g, 216, 150, "Spool + O-ring", { size: 20, anchor: "middle", fill: PN.muted, weight: 700 });
  }
  // 6 — speed adjust valve: needle screws in and out of the seat; cut on the needle taper; seat packing ring
  {
    const g = art[6];
    R(g, 40, 92, 116, 46); R(g, 224, 92, 116, 46);
    H.el("rect", { x: 156, y: 104, width: 68, height: 34, fill: PN.air }, g);
    const nd = H.el("g", { id: "s6-v-nd" }, g);
    R(nd, 168, 0, 44, 16, PN.knob, 5, 3);
    R(nd, 182, 16, 16, 58, PN.dark, 2, 2.5);
    P(nd, "M 182 74 L 198 74 L 190 112 Z", { fill: PN.dark, sw: 2.5 });
    P(nd, "M 184 84 L 192 88 L 186 92", { stroke: PN.red, sw: 3.5 });
    H.el("rect", { x: 172, y: 58, width: 36, height: 12, rx: 5, fill: "#2b2f35" }, g);
    H.text(g, 260, 66, "Packing", { size: 20, anchor: "start", fill: PN.muted, weight: 700 });
    P(g, "M 256 60 L 214 64", { stroke: PN.muted, sw: 2 });
    tl.fromTo(nd, { y: 0 }, { y: -14, duration: 0.4, yoyo: true, repeat: 3, ease: "sine.inOut" }, T0[6]);
  }
  // 7 — air cylinder: cut-away tube, piston with packings strokes; scratch draws along the inner wall
  {
    const g = art[7];
    R(g, 20, 34, 300, 84, "#e9eef3", 4);
    const pis = H.el("g", { id: "s6-v-pis" }, g);
    R(pis, 112, 38, 30, 76, PN.dark, 3, 3);
    for (const y of [38, 106]) H.el("rect", { x: 116, y, width: 22, height: 8, rx: 3, fill: "#2b2f35" }, pis);
    R(pis, 142, 66, 228, 20, PN.steel, 3, 3);
    R(g, 8, 26, 16, 100, PN.metal, 3); R(g, 318, 26, 18, 100, PN.metal, 3);
    const scr = P(g, "M 60 46 L 150 44 L 250 47", { stroke: PN.red, sw: 4, id: "s6-v-scr", op: 0 });
    tl.fromTo(pis, { x: 0 }, { x: 110, duration: 0.6, yoyo: true, repeat: 3, ease: "power1.inOut" }, T0[7]);
    drawOn(scr, T0[7] + 0.3, 0.8);
  }
}
