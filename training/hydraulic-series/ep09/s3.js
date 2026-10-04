// Loss table (OPL 5-B-1, "Amount lost by leak of operating oil", litres). Each row lights up with its
// narration segment (cue 1–4): drip rhythm (time-compressed ×5 so the difference shows), 1 day / 1 month
// values, and the 1-year bar. Bars share one scale (1,530 L = 450 units); the filament row is off the scale.
{
  const P = H.$("s3-v-tab"), c = T.cues, f = H.f;
  const rows = [
    { th: "1 หยด / 10 วินาที", en: "1 drop every 10 s", day: "0.42", mon: "12.6", yr: 151, yrT: "151", period: 2.0 },
    { th: "1 หยด / 5 วินาที", en: "1 drop every 5 s", day: "0.85", mon: "25.5", yr: 306, yrT: "306", period: 1.0 },
    { th: "1 หยด / 1 วินาที", en: "1 drop every 1 s", day: "4.25", mon: "127.5", yr: 1530, yrT: "1,530", period: 0.2 },
    { th: "รั่วเป็นสาย", en: "Drop in a filament (ไหลเป็นเส้น)", day: "91.00", mon: "2,730", yr: 32700, yrT: "32,700", period: 0 },
  ];
  const X0 = 1090, SCALE = 450 / 1530, RH = 165, TOP = 80, colD = 770, colM = 960;

  // header
  H.text(P, 40, 50, "การรั่ว (Leak amount)", { size: 30, fill: E9.muted, weight: 700 });
  H.text(P, colD, 50, "1 วัน", { size: 32, fill: E9.muted, anchor: "middle", weight: 700 });
  H.text(P, colM, 50, "1 เดือน", { size: 32, fill: E9.muted, anchor: "middle", weight: 700 });
  H.text(P, X0, 50, "1 ปี (1 Year)", { size: 34, fill: E9.blue });
  H.el("line", { x1: 20, y1: 70, x2: 1740, y2: 70, stroke: E9.ink, "stroke-width": 4 }, P);

  rows.forEach((r, i) => {
    const top = TOP + i * RH, cy = top + RH / 2, at = b + c[i];
    if (i) H.el("line", { x1: 20, y1: top, x2: 1740, y2: top, stroke: E9.line, "stroke-width": 3 }, P);

    // drip icon: nozzle + drops (or a continuous thread)
    const ic = H.el("g", { id: `s3-v-ic${i + 1}` }, P);
    H.el("rect", { x: 78, y: top + 10, width: 24, height: 26, fill: E9.metal, stroke: E9.ink, "stroke-width": 3 }, ic);
    H.el("rect", { x: 64, y: top + 34, width: 52, height: 22, rx: 3, fill: E9.dark, stroke: E9.ink, "stroke-width": 3 }, ic);
    H.el("line", { x1: 40, y1: top + 152, x2: 140, y2: top + 152, stroke: E9.ink, "stroke-width": 4 }, ic);
    const nx = 90, ny = top + 56;
    if (r.period) {
      const s = 14, dist = top + 148 - (ny + 2.75 * s);
      H.e9Drip(ic, nx, ny, s, dist, r.period, at + 0.2, b + D - 0.1, { fall: 0.5, sw: 2.5 });
    } else {
      const th = H.el("rect", { x: nx - 5, y: ny, width: 10, height: top + 150 - ny, fill: E9.oil, stroke: E9.oilDk, "stroke-width": 2 }, ic);
      const fl = H.el("line", { x1: nx, y1: ny, x2: nx, y2: top + 150, stroke: "#ffffff", "stroke-width": 3, "stroke-dasharray": "8 14", opacity: 0.9 }, ic);
      tl.fromTo(th, { scaleY: 0, svgOrigin: `${nx} ${ny}` }, { scaleY: 1, svgOrigin: `${nx} ${ny}`, duration: 0.4, ease: "power2.in" }, at + 0.2);
      tl.fromTo(fl, { strokeDashoffset: 0 }, { strokeDashoffset: -22 * Math.round((D - c[i]) * 4), duration: D - c[i] - 0.2, ease: "none" }, at + 0.2);
    }
    tl.fromTo(ic, { opacity: 0.18 }, { opacity: 1, duration: 0.3 }, at);

    // row label
    const lab = H.el("g", { id: `s3-v-lb${i + 1}` }, P);
    H.text(lab, 170, top + 78, r.th, { size: 42 });
    H.text(lab, 170, top + 118, r.en, { size: 26, fill: E9.muted, weight: 600 });
    tl.fromTo(lab, { opacity: 0.25 }, { opacity: 1, duration: 0.3 }, at);

    // 1 day / 1 month
    const dm = H.el("g", { id: `s3-v-dm${i + 1}` }, P);
    H.text(dm, colD, cy + 14, `${r.day} L`, { size: 38, anchor: "middle", weight: 700 });
    H.text(dm, colM, cy + 14, `${r.mon} L`, { size: 38, anchor: "middle", weight: 700 });
    tl.fromTo(dm, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35 }, at + 0.35);

    // 1 year bar + value
    const off = r.yr > 1530;
    const w = off ? 650 : r.yr * SCALE;
    const bar = H.el("rect", { id: `s3-v-bar${i + 1}`, x: X0, y: cy - 30, width: f(w), height: 60, rx: 6, fill: off ? E9.red : E9.oil, stroke: E9.ink, "stroke-width": 3 }, P);
    tl.fromTo(bar, { scaleX: 0, svgOrigin: `${X0} ${cy}` }, { scaleX: 1, svgOrigin: `${X0} ${cy}`, duration: off ? 1.2 : 0.8, ease: off ? "power1.in" : "power2.out" }, at + 0.5);
    const val = H.el("g", { id: `s3-v-val${i + 1}` }, P);
    if (off) {
      // broken scale: two slanted gaps in the bar
      for (const gx of [1420, 1446]) H.el("path", { d: `M ${gx} ${cy - 40} L ${gx - 16} ${cy + 40}`, stroke: E9.paper, "stroke-width": 9, fill: "none" }, val);
      H.text(val, X0 + 22, cy + 15, `${r.yrT} L`, { size: 44, fill: "#ffffff" });
      H.text(val, X0, cy + 66, "แถบเกินสเกล (≈ 21 เท่าของ 1,530 L)", { size: 24, fill: E9.muted, weight: 600 });
    } else {
      H.text(val, X0 + w + 16, cy + 15, `${r.yrT} L`, { size: 42, fill: E9.ink });
    }
    tl.fromTo(val, { opacity: 0, scale: 0.7, svgOrigin: `${X0 + (off ? 120 : w + 60)} ${cy}` }, { opacity: 1, scale: 1, svgOrigin: `${X0 + (off ? 120 : w + 60)} ${cy}`, duration: 0.35, ease: "back.out(2)" }, at + (off ? 1.7 : 1.3));
  });
}
