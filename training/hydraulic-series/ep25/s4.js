// Two types (p.40 System 4): all-amount — every drop is mixed into the air; selective — only the fine mist from
// the drops is mixed (the bigger droplets are drawn dropping out of the air stream: * ภาพจำลอง).
{
  const f = H.f;
  const card = (id, selective, tStart, seed) => {
    const g = H.$(id), rnd = LU.rng(seed);
    // air passage with the window on top
    H.el("rect", { x: 20, y: 154, width: 680, height: 42, fill: LU.tint }, g);
    const bottom = selective ? "M 20 200 H 196 M 236 200 H 700" : "M 20 200 H 700";
    H.el("path", { d: `M 20 150 H 172 M 188 150 H 700 ${bottom}`, stroke: LU.pipe, "stroke-width": 8 }, g);
    if (selective) H.el("path", { d: "M 196 200 V 226 M 236 200 V 226", stroke: LU.pipe, "stroke-width": 6 }, g);
    H.el("rect", { x: 120, y: 136, width: 120, height: 14, rx: 3, fill: LU.dark, stroke: LU.ink, "stroke-width": 3 }, g);
    H.el("path", { d: "M 130 138 V 82 Q 130 38 180 38 Q 230 38 230 82 V 138 Z", fill: LU.bowl, stroke: LU.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
    H.el("path", { d: "M 180 14 V 72", stroke: LU.ink, "stroke-width": 12 }, g);
    H.el("path", { d: "M 180 14 V 72", stroke: LU.oil, "stroke-width": 6 }, g);
    H.el("path", { d: H.arrowD(712, 175, 746, 175, 14), fill: "none", stroke: LU.ink, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    H.text(g, 700, 132, "OUT", { size: 26, anchor: "end" });
    const air = LU.dash(g, `${id}-air`, "M 20 175 H 700", { w: 4 });
    LU.flow(air.id, b + tStart, b + D, { speed: 90 });
    H.text(g, 450, 118, selective ? "เฉพาะละอองละเอียด → OUT" : "ทั้งหมด → OUT", { size: 26, anchor: "middle", fill: LU.muted });
    // drops: grow at the nozzle, fall into the air stream, burst
    const times = LU.every(b + tStart + 0.4, b + D - 1.3, 1.0);
    times.forEach((t, k) => {
      const dg = H.el("g", { opacity: 0 }, g);
      const dp = H.el("path", { d: LU.dropD(8, 180, 72), fill: LU.oil, stroke: LU.oilEdge, "stroke-width": 2 }, dg);
      tl.fromTo(dg, { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, t);
      tl.fromTo(dp, { scale: 0.25, svgOrigin: "180 72" }, { scale: 1, svgOrigin: "180 72", duration: 0.35, ease: "power1.in" }, t);
      tl.fromTo(dg, { y: 0 }, { y: 84, duration: 0.25, ease: "power2.in", immediateRender: false }, t + 0.36);
      tl.fromTo(dg, { opacity: 1 }, { opacity: 0, duration: 0.05, immediateRender: false }, t + 0.6);
      const n = selective ? 11 : 10;
      for (let i = 0; i < n; i++) {
        const big = selective && i >= 8;
        const r = big ? 6 + rnd() * 1.5 : selective ? 2 + rnd() * 1.6 : 2.5 + rnd() * 3.5;
        const cdot = H.el("circle", { cx: 180, cy: 172, r: f(r), fill: LU.oil, stroke: LU.oilEdge, "stroke-width": 1, opacity: 0 }, g);
        const t0 = t + 0.62 + rnd() * 0.2;
        const dx = big ? 22 + (i - 8) * 12 : 440 + rnd() * 80, dy = big ? 62 : (rnd() - 0.45) * 26;
        const dur = big ? 0.55 : 0.9 + rnd() * 0.4;
        tl.fromTo(cdot, { opacity: 0 }, { opacity: 1, duration: 0.08, immediateRender: false }, t0);
        tl.fromTo(cdot, { x: 0, y: 0 }, { x: f(dx), y: f(dy), duration: dur, ease: big ? "power2.in" : "power1.in", immediateRender: false }, t0);
        tl.fromTo(cdot, { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, t0 + dur - 0.15);
      }
    });
  };
  card("s4-v-a", false, T.left + 0.5, 31);
  card("s4-v-b", true, T.right + 0.5, 37);
}
