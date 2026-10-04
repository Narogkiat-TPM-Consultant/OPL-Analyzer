// Hydraulic / Pneumatic training series — shared drawings (loaded by every episode through js_lib).
// Coordinates are for a 1100 × 640 viewBox. Based on the hydraulic device figure of OPL 5-A-2.

const HC = { ink: "#1a1d21", metal: "#c9c1ae", dark: "#9aa1aa", blue: "#1f5fbf", oil: "#f2c94c", oilBg: "#fbe7a1", paper: "#fffdf8", red: "#d0233a", tube: "#dfe8f6" };

// Full hydraulic unit: tank → motor + pump → relief valve / gauge → direction valve → flow valve → cylinder → slide table.
// Returns handles for animation: { g, flows: [ids], rod, lever, rotor, origin: {rotor, lever} }.
H.hydUnit = (parent, p) => {
  const g = H.el("g", { id: p }, parent);
  const pipe = (id, d, w = 9) => H.el("path", { id, d, fill: "none", stroke: HC.blue, "stroke-width": w, "stroke-linejoin": "round" }, g);
  const ret = (id, d) => H.el("path", { id, d, fill: "none", stroke: HC.ink, "stroke-width": 5, "stroke-dasharray": "12 9", "stroke-linejoin": "round" }, g);
  const flow = (id, d) => H.el("path", { id, d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "8 18", "stroke-linecap": "butt", opacity: 0 }, g);
  const box = (x, y, w, h, fill = HC.metal, parentG = g) => H.el("rect", { x, y, width: w, height: h, rx: 8, fill, stroke: HC.ink, "stroke-width": 4 }, parentG);
  const label = (x, y, s, anchor = "middle", size = 25) => H.text(g, x, y, s, { size, anchor });

  // tank with oil
  H.el("rect", { x: 30, y: 520, width: 610, height: 100, rx: 6, fill: HC.oilBg, stroke: HC.ink, "stroke-width": 5 }, g);
  H.el("rect", { x: 35, y: 550, width: 600, height: 66, fill: HC.oil }, g);
  label(335, 603, "ถังน้ำมัน (Oil tank)", "middle", 28);

  // pipes first, components are drawn over them
  const suction = "M 475 595 L 475 502";
  const main = "M 475 420 L 475 335 L 495 335 L 495 300";
  const toA = "M 495 240 L 495 150 L 670 150 L 670 114";
  pipe(`${p}-suc`, suction); pipe(`${p}-main`, main); pipe(`${p}-a`, toA);
  pipe(`${p}-b`, "M 525 240 L 525 195 L 730 195 M 810 195 L 910 195 L 910 114");
  pipe(`${p}-br`, "M 475 335 L 150 335", 7);
  pipe(`${p}-gst`, "M 290 335 L 290 298", 6);
  ret(`${p}-rt`, "M 525 300 L 525 318 L 600 318 L 600 520");
  ret(`${p}-rr`, "M 110 360 L 110 520");
  const flows = [flow(`${p}-f1`, suction + " " + main), flow(`${p}-f2`, toA)].map((n) => n.id);

  // motor + coupling + pump (rotor turns)
  box(300, 430, 125, 62);
  for (let i = 0; i < 6; i++) H.el("line", { x1: 315 + i * 19, y1: 434, x2: 315 + i * 19, y2: 488, stroke: HC.ink, "stroke-width": 2, opacity: 0.5 }, g);
  H.el("rect", { x: 425, y: 454, width: 15, height: 14, fill: HC.ink }, g);
  box(440, 420, 70, 82, HC.dark);
  const rotor = H.el("g", { id: `${p}-rotor` }, g);
  H.el("circle", { cx: 475, cy: 461, r: 25, fill: HC.paper, stroke: HC.ink, "stroke-width": 3 }, rotor);
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i;
    H.el("line", { x1: 475, y1: 461, x2: H.f(475 + 23 * Math.cos(a)), y2: H.f(461 + 23 * Math.sin(a)), stroke: HC.ink, "stroke-width": 3 }, rotor);
  }
  label(362, 420, "มอเตอร์", "middle", 24);
  label(522, 472, "ปั๊ม", "start", 26);

  // relief valve (spring) + pressure gauge on the branch line
  box(70, 310, 80, 50);
  H.el("path", { d: "M 80 335 L 88 323 L 96 347 L 104 323 L 112 347 L 120 323 L 128 347 L 136 335", fill: "none", stroke: HC.ink, "stroke-width": 3 }, g);
  label(110, 296, "Relief valve", "middle", 24);
  H.el("circle", { cx: 290, cy: 266, r: 33, fill: HC.paper, stroke: HC.ink, "stroke-width": 4 }, g);
  H.el("line", { x1: 290, y1: 266, x2: 311, y2: 247, stroke: HC.ink, "stroke-width": 4 }, g);
  label(290, 220, "เกจวัดแรงดัน", "middle", 24);

  // direction valve (3 positions) with a hand lever on the left
  box(400, 240, 220, 60, HC.paper);
  H.el("line", { x1: 473, y1: 240, x2: 473, y2: 300, stroke: HC.ink, "stroke-width": 3 }, g);
  H.el("line", { x1: 547, y1: 240, x2: 547, y2: 300, stroke: HC.ink, "stroke-width": 3 }, g);
  const lever = H.el("g", { id: `${p}-lever` }, g);
  H.el("line", { x1: 400, y1: 270, x2: 364, y2: 236, stroke: HC.ink, "stroke-width": 6, "stroke-linecap": "round" }, lever);
  H.el("circle", { cx: 364, cy: 236, r: 9, fill: HC.red }, lever);
  label(632, 290, "วาล์วเปลี่ยนทิศทาง", "start", 24);

  // flow control (speed) valve on line B
  box(730, 175, 80, 40);
  H.el("path", { d: "M 742 205 L 798 185 M 788 183 L 798 185 L 792 194", fill: "none", stroke: HC.ink, "stroke-width": 3 }, g);
  label(770, 246, "วาล์วปรับความเร็ว", "middle", 24);

  // cylinder; the rod group (piston + rod + slide table) slides out
  H.el("line", { x1: 950, y1: 100, x2: 1095, y2: 100, stroke: HC.ink, "stroke-width": 5 }, g);
  H.el("rect", { x: 640, y: 50, width: 300, height: 64, rx: 6, fill: HC.tube, stroke: HC.ink, "stroke-width": 5 }, g);
  const rod = H.el("g", { id: `${p}-rod` }, g);
  H.el("rect", { x: 700, y: 74, width: 290, height: 16, fill: HC.dark, stroke: HC.ink, "stroke-width": 3 }, rod);
  H.el("rect", { x: 700, y: 53, width: 22, height: 58, fill: HC.dark, stroke: HC.ink, "stroke-width": 3 }, rod);
  H.el("rect", { x: 972, y: 44, width: 78, height: 52, rx: 6, fill: HC.metal, stroke: HC.ink, "stroke-width": 4 }, rod);
  label(628, 92, "กระบอกสูบ", "end", 24);
  label(1011, 32, "โต๊ะเลื่อน", "middle", 22);

  return { g, flows, rod, lever, rotor, origin: { rotor: "475 461", lever: "400 270" } };
};

// Highlight boxes for the three functional groups (start hidden; reveal with the narration).
H.hydGroups = (parent, p) => {
  const mk = (id, rects, text, lx, ly) => {
    const g = H.el("g", { id }, parent);
    for (const [x, y, w, h] of rects) H.el("rect", { x, y, width: w, height: h, rx: 18, fill: "rgba(31,95,191,0.08)", stroke: HC.blue, "stroke-width": 5, "stroke-dasharray": "14 10" }, g);
    const w = text.length * 15 + 34;
    H.el("rect", { x: lx - 14, y: ly - 29, width: w, height: 40, rx: 10, fill: HC.blue }, g);
    H.text(g, lx, ly, text, { size: 26, fill: "#ffffff" });
    return id;
  };
  return [
    mk(`${p}-g1`, [[18, 398, 622, 232]], "① แหล่งกำเนิดแรงดัน", 50, 548),
    mk(`${p}-g2`, [[38, 266, 146, 108], [380, 165, 482, 140]], "② ส่วนควบคุม", 650, 337),
    mk(`${p}-g3`, [[625, 12, 472, 140]], "③ ส่วนทำงาน", 900, 162),
  ];
};

// Small icons for component lists (viewBox 0 0 150 104).
H.hydIcon = (parent, kind) => {
  const g = H.el("g", {}, parent);
  const R = (x, y, w, h, fill = HC.metal) => H.el("rect", { x, y, width: w, height: h, rx: 6, fill, stroke: HC.ink, "stroke-width": 4 }, g);
  if (kind === "tank") { R(15, 22, 120, 70, HC.oilBg); H.el("rect", { x: 19, y: 52, width: 112, height: 36, fill: HC.oil }, g); }
  if (kind === "pump") { R(10, 34, 62, 40); H.el("rect", { x: 72, y: 48, width: 12, height: 10, fill: HC.ink }, g); H.el("circle", { cx: 108, cy: 53, r: 26, fill: HC.dark, stroke: HC.ink, "stroke-width": 4 }, g); H.el("path", { d: "M 108 27 L 108 8", stroke: HC.blue, "stroke-width": 7 }, g); }
  if (kind === "valve") { R(15, 30, 120, 44, HC.paper); H.el("line", { x1: 55, y1: 30, x2: 55, y2: 74, stroke: HC.ink, "stroke-width": 3 }, g); H.el("line", { x1: 95, y1: 30, x2: 95, y2: 74, stroke: HC.ink, "stroke-width": 3 }, g); H.el("path", { d: "M 63 64 L 87 40 M 79 40 L 87 40 L 87 48", fill: "none", stroke: HC.blue, "stroke-width": 4 }, g); }
  if (kind === "actuator") { R(8, 34, 90, 38, HC.tube); H.el("rect", { x: 40, y: 47, width: 100, height: 12, fill: HC.dark, stroke: HC.ink, "stroke-width": 3 }, g); H.el("rect", { x: 36, y: 36, width: 12, height: 34, fill: HC.dark, stroke: HC.ink, "stroke-width": 3 }, g); }
  if (kind === "accessory") { H.el("circle", { cx: 45, cy: 50, r: 30, fill: HC.paper, stroke: HC.ink, "stroke-width": 4 }, g); H.el("line", { x1: 45, y1: 50, x2: 62, y2: 34, stroke: HC.ink, "stroke-width": 4 }, g); H.el("path", { d: "M 80 50 L 140 50", stroke: HC.blue, "stroke-width": 9 }, g); R(98, 36, 26, 28, HC.dark); }
  return g;
};

// Oil-flow dashes along the given flow paths from time t for `dur` seconds.
H.hydFlow = (ids, t, dur) => {
  for (const id of ids) {
    tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 0.95, duration: 0.3 }, t);
    tl.fromTo(`#${id}`, { strokeDashoffset: 0 }, { strokeDashoffset: -26 * Math.round(dur * 3), duration: dur, ease: "none", immediateRender: false }, t);
  }
};
