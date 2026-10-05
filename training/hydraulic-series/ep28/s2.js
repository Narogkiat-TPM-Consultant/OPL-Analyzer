// Why periodic inspection: a machine-status line over 8 weeks.
// Weeks 1–4 (before): it breaks down every week (dips + red bursts).
// From week 5: periodic inspection + thorough control → a tick each week, the line stays up ("no breakdown").
// Then: three people with three different sheets → one standard (inspection method + parts-replacement criteria).
{
  const f = H.f;
  const g = H.$("s2-v-time");
  const x0 = 200, cw = 108, yRun = 128, yStop = 262;
  const cx = (i) => x0 + cw * i + cw / 2;
  for (let i = 0; i <= 8; i++) H.el("line", { x1: x0 + i * cw, y1: 72, x2: x0 + i * cw, y2: 300, stroke: P28.grid, "stroke-width": 2.5 }, g);
  H.text(g, 30, 52, "สัปดาห์ที่", { size: 26, fill: P28.muted });
  for (let i = 0; i < 8; i++) H.text(g, cx(i), 52, String(i + 1), { size: 30, anchor: "middle" });
  H.el("line", { x1: 192, y1: yRun, x2: 1072, y2: yRun, stroke: P28.grid, "stroke-width": 2, "stroke-dasharray": "6 8" }, g);
  H.el("line", { x1: 192, y1: yStop, x2: 1072, y2: yStop, stroke: P28.grid, "stroke-width": 2, "stroke-dasharray": "6 8" }, g);
  H.text(g, 30, yRun + 10, "เดิน", { size: 28 });
  H.text(g, 30, yStop + 10, "เสีย / หยุด", { size: 28 });

  // before: dips every week
  const P = [[x0, yRun]];
  const dipAt = [];
  for (let i = 0; i < 4; i++) {
    P.push([cx(i) - 26, yRun], [cx(i) - 14, yStop]);
    dipAt.push(P.length - 1);
    P.push([cx(i) + 14, yStop], [cx(i) + 26, yRun]);
  }
  P.push([x0 + 4 * cw, yRun]);
  const cum = [0];
  for (let k = 1; k < P.length; k++) cum.push(cum[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]));
  const d = P.map(([x, y], k) => `${k ? "L" : "M"} ${x} ${y}`).join(" ");
  const before = H.el("path", { d, fill: "none", stroke: P28.muted, "stroke-width": 7, "stroke-linejoin": "round", "stroke-linecap": "butt" }, g);
  const burst = (x, y, r) => {
    const pts = Array.from({ length: 16 }, (_, k) => {
      const a = (Math.PI / 8) * k - Math.PI / 2, rr = k % 2 ? r * 0.55 : r;
      return `${k ? "L" : "M"} ${f(x + rr * Math.cos(a))} ${f(y + rr * Math.sin(a))}`;
    }).join(" ") + " Z";
    const bg = H.el("g", { opacity: 0 }, g);
    H.el("path", { d: pts, fill: P28.red, stroke: P28.paper, "stroke-width": 3, "stroke-linejoin": "round" }, bg);
    H.el("rect", { x: x - 3.5, y: y - 13, width: 7, height: 15, rx: 3, fill: "#ffffff" }, bg);
    H.el("circle", { cx: x, cy: y + 8, r: 3.8, fill: "#ffffff" }, bg);
    return bg;
  };
  const bursts = [0, 1, 2, 3].map((i) => burst(cx(i), yStop + 2, 30));
  const lblBefore = H.p28Label(g, cx(1.5), 100, "เดิม: เสียทุกสัปดาห์", { size: 28, anchor: "middle", fill: P28.muted });
  lblBefore.setAttribute("opacity", 0);

  // divider + after
  const xd = x0 + 4 * cw;
  const div = H.el("g", { opacity: 0 }, g);
  H.el("line", { x1: xd, y1: 70, x2: xd, y2: 304, stroke: P28.blue, "stroke-width": 4, "stroke-dasharray": "12 8" }, div);
  H.p28Label(div, xd, 336, "เริ่มตรวจตามรอบ + ควบคุมทั่วถึง", { size: 27, anchor: "middle", fill: P28.blue });
  const after = H.el("path", { d: `M ${xd} ${yRun} L 1052 ${yRun}`, fill: "none", stroke: P28.green, "stroke-width": 9, "stroke-linecap": "butt" }, g);
  const arrowHead = H.el("path", { d: `M 1050 ${yRun - 16} L 1080 ${yRun} L 1050 ${yRun + 16} Z`, fill: P28.green, opacity: 0 }, g);
  const checks = [4, 5, 6, 7].map((i) => { const t = H.p28Tick(g, cx(i), 88, 19); t.setAttribute("opacity", 0); return t; });
  const lblAfter = H.el("g", { opacity: 0 }, g);
  H.p28Label(lblAfter, cx(5.5), 200, "ไม่เสียอีกนาน", { size: 34, anchor: "middle", fill: P28.green });
  H.p28Label(lblAfter, cx(5.5), 242, "เดินราบรื่น · อายุยืน", { size: 28, anchor: "middle", fill: P28.green });

  // ---------------- standard (method + replacement criteria)
  const s = H.$("s2-v-std");
  const people = [90, 235, 380];
  const sheetCols = ["#9aa1aa", P28.yellow, "#7a9cc6"];
  const lines = [2, 4, 3];
  const ppl = H.el("g", { opacity: 0 }, s);
  const old = [], neu = [];
  people.forEach((px, k) => {
    H.el("circle", { cx: px, cy: 408, r: 24, fill: "#f0d9bf", stroke: P28.ink, "stroke-width": 3.5 }, ppl);
    H.el("path", { d: `M ${px - 44} 512 L ${px - 44} 470 Q ${px - 44} 438 ${px - 12} 438 L ${px + 12} 438 Q ${px + 44} 438 ${px + 44} 470 L ${px + 44} 512 Z`, fill: P28.blue, stroke: P28.ink, "stroke-width": 3.5 }, ppl);
    H.text(ppl, px, 380, ["A", "B", "C"][k], { size: 24, anchor: "middle", fill: P28.muted });
    // different sheet per person
    const o = H.el("g", {}, s);
    H.el("rect", { x: px - 34, y: 462, width: 68, height: 92, rx: 5, fill: P28.paper, stroke: P28.ink, "stroke-width": 3 }, o);
    H.el("rect", { x: px - 34, y: 462, width: 68, height: 16, rx: 3, fill: sheetCols[k], stroke: P28.ink, "stroke-width": 3 }, o);
    for (let j = 0; j < lines[k]; j++) H.el("line", { x1: px - 24, y1: 492 + j * 15, x2: px + (j % 2 ? 10 : 22), y2: 492 + j * 15, stroke: P28.muted, "stroke-width": 4 }, o);
    o.setAttribute("opacity", 0);
    old.push(o);
    // the same standard sheet (after)
    const n = H.el("g", { opacity: 0 }, s);
    H.el("rect", { x: px - 34, y: 462, width: 68, height: 92, rx: 5, fill: P28.paper, stroke: P28.ink, "stroke-width": 3 }, n);
    H.el("rect", { x: px - 34, y: 462, width: 68, height: 16, rx: 3, fill: P28.blue, stroke: P28.ink, "stroke-width": 3 }, n);
    for (let j = 0; j < 2; j++) {
      H.el("circle", { cx: px - 20, cy: 498 + j * 26, r: 7, fill: P28.blue }, n);
      H.el("line", { x1: px - 8, y1: 498 + j * 26, x2: px + 24, y2: 498 + j * 26, stroke: P28.muted, "stroke-width": 4 }, n);
    }
    neu.push(n);
  });
  const neq = [162, 307].map((x) => {
    const e = H.el("g", { opacity: 0 }, s);
    H.el("line", { x1: x - 14, y1: 500, x2: x + 14, y2: 500, stroke: P28.red, "stroke-width": 6 }, e);
    H.el("line", { x1: x - 14, y1: 514, x2: x + 14, y2: 514, stroke: P28.red, "stroke-width": 6 }, e);
    H.el("line", { x1: x + 9, y1: 490, x2: x - 9, y2: 524, stroke: P28.red, "stroke-width": 5 }, e);
    return e;
  });
  const eq = [162, 307].map((x) => {
    const e = H.el("g", { opacity: 0 }, s);
    H.el("line", { x1: x - 14, y1: 500, x2: x + 14, y2: 500, stroke: P28.green, "stroke-width": 6 }, e);
    H.el("line", { x1: x - 14, y1: 514, x2: x + 14, y2: 514, stroke: P28.green, "stroke-width": 6 }, e);
    return e;
  });
  const lblDiff = H.p28Label(s, 235, 598, "วิธีตรวจ / เกณฑ์ ต่างกัน", { size: 26, anchor: "middle", fill: P28.muted });
  lblDiff.setAttribute("opacity", 0);
  const lblSame = H.p28Label(s, 235, 598, "ทุกคนใช้แบบเดียวกัน", { size: 26, anchor: "middle", fill: P28.green });
  lblSame.setAttribute("opacity", 0);
  const arrow = H.el("path", { d: H.arrowD(472, 486, 566, 486, 22), fill: "none", stroke: P28.blue, "stroke-width": 8, opacity: 0 }, s);
  // the standard sheet
  const std = H.el("g", { opacity: 0 }, s);
  H.el("rect", { x: 580, y: 384, width: 360, height: 220, rx: 12, fill: P28.paper, stroke: P28.ink, "stroke-width": 4 }, std);
  H.el("path", { d: "M 580 438 L 580 396 Q 580 384 592 384 L 928 384 Q 940 384 940 396 L 940 438 Z", fill: P28.blue, stroke: P28.ink, "stroke-width": 4 }, std);
  H.text(std, 760, 422, "มาตรฐานการตรวจ", { size: 28, anchor: "middle", fill: "#ffffff" });
  [["วิธีตรวจ", 488], ["เกณฑ์เปลี่ยนชิ้นส่วน", 560]].forEach(([t, y], k) => {
    H.p28Badge(std, 614, y - 10, k + 1, { r: 19 });
    H.text(std, 642, y, t, { size: 30 });
  });
  const okStd = H.p28Tick(s, 995, 494, 36);
  okStd.setAttribute("opacity", 0);

  // ---------------- timing
  const t1 = b + T.cues[0], t2 = b + T.points[1], t3 = b + T.cues[1];
  const L1 = before.getTotalLength();
  tl.fromTo(before, { strokeDasharray: L1, strokeDashoffset: L1 }, { strokeDashoffset: 0, duration: 1.9, ease: "none" }, t1 + 0.1);
  tl.fromTo(lblBefore, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t1 + 0.2);
  // each dip is reached at its share of the path length
  bursts.forEach((el, i) => {
    const frac = (cum[dipAt[i]] + 14) / cum[cum.length - 1];
    H.p28Pop(el, t1 + 0.1 + 1.9 * frac, cx(i), yStop + 2, 1.8, 0.25);
  });
  tl.fromTo(div, { opacity: 0 }, { opacity: 1, duration: 0.35 }, t2);
  const L2 = 1052 - xd;
  tl.fromTo(after, { strokeDasharray: L2, strokeDashoffset: L2 }, { strokeDashoffset: 0, duration: 1.6, ease: "none" }, t2 + 0.2);
  tl.fromTo(arrowHead, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t2 + 1.8);
  checks.forEach((el, k) => H.p28Pop(el, t2 + 0.2 + 1.6 * ((cx(4 + k) - xd) / L2), cx(4 + k), 88, 1.8, 0.25));
  tl.fromTo(lblAfter, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, t2 + 1.9);

  tl.fromTo(ppl, { opacity: 0 }, { opacity: 1, duration: 0.35 }, t3 + 0.05);
  old.forEach((o, k) => tl.fromTo(o, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, t3 + 0.2 + k * 0.15));
  neq.forEach((e, k) => H.p28Pop(e, t3 + 0.75 + k * 0.1, [162, 307][k], 507, 1.6, 0.25));
  tl.fromTo(lblDiff, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 0.8);
  tl.fromTo(arrow, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 1.5);
  tl.fromTo(std, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" }, t3 + 1.55);
  const tu = t3 + 2.6;
  old.forEach((o) => tl.to(o, { opacity: 0, duration: 0.3 }, tu));
  neu.forEach((n, k) => tl.fromTo(n, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tu + k * 0.1));
  neq.forEach((e) => tl.to(e, { opacity: 0, duration: 0.2 }, tu));
  eq.forEach((e) => tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tu + 0.2));
  tl.to(lblDiff, { opacity: 0, duration: 0.2 }, tu);
  tl.fromTo(lblSame, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tu + 0.2);
  H.p28Pop(okStd, tu + 0.4, 995, 494, 1.6, 0.3);
}
