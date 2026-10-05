// Maintenance (p.39 "Maintenance" 1–3) as three cards:
// 1 gauge glass broken / needle abnormal → new gauge + green marking at the set pressure (NG)
// 2 turning the handle moves the needle: loosen ↓, tighten ↑ (OK)
// 3 lock nut loose: vibration turns the handle by itself, the setting drifts (NG → tighten it).
{
  const c = T.cues, st = T.stamps;
  // mini regulator top (handle, screw, lock nut, bonnet) for cards 2–3; returns { bar, nut }
  const mini = (g, p, cx, nutUp = 0) => {
    H.el("path", { d: `M ${cx - 30} 106 H ${cx + 30} L ${cx + 36} 124 L ${cx + 70} 152 V 168 H ${cx - 70} V 152 L ${cx - 36} 124 Z`, fill: AR.metal, stroke: AR.ink, "stroke-width": 4, "stroke-linejoin": "round" }, g);
    H.el("rect", { x: cx - 8, y: 46, width: 16, height: 62, fill: AR.metal, stroke: AR.ink, "stroke-width": 3 }, g);
    const nut = H.el("g", { id: `${p}-nut` }, g);
    H.el("rect", { x: cx - 26, y: 86 - nutUp, width: 52, height: 20, rx: 2, fill: AR.brass, stroke: AR.ink, "stroke-width": 3 }, nut);
    H.el("line", { x1: cx - 9, y1: 86 - nutUp, x2: cx - 9, y2: 106 - nutUp, stroke: AR.ink, "stroke-width": 2 }, nut);
    H.el("line", { x1: cx + 9, y1: 86 - nutUp, x2: cx + 9, y2: 106 - nutUp, stroke: AR.ink, "stroke-width": 2 }, nut);
    const bar = H.el("g", { id: `${p}-bar` }, g);
    H.el("rect", { x: cx - 80, y: 26, width: 160, height: 22, rx: 10, fill: AR.knob, stroke: AR.ink, "stroke-width": 4 }, bar);
    H.el("circle", { cx, cy: 37, r: 15, fill: AR.knob, stroke: AR.ink, "stroke-width": 4 }, g);
    return { bar, nut };
  };
  const arcD = (cx, cw) => cw
    ? `M ${cx - 92} 58 A 92 14 0 0 0 ${cx + 92} 58 M ${cx + 84} 70 L ${cx + 92} 58 L ${cx + 100} 70`
    : `M ${cx + 92} 58 A 92 14 0 0 1 ${cx - 92} 58 M ${cx - 84} 70 L ${cx - 92} 58 L ${cx - 100} 70`;

  // ---- card 1: broken / abnormal gauge → replace, green marking at the set pressure
  {
    const g = H.$("s5-v-c1");
    const A = AR.gauge(g, 96, 86, 62, { id: "s5-v-ga", value: 5, set: false });
    H.el("path", { d: "M 70 36 L 92 70 L 80 88 L 104 118 M 92 70 L 124 62 M 80 88 L 52 100 M 104 118 L 120 136", fill: "none", stroke: AR.muted, "stroke-width": 3, "stroke-linejoin": "round" }, g);
    H.el("path", { d: H.arrowD(186, 86, 262, 86, 18), fill: "none", stroke: AR.ink, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    const nw = H.el("g", { id: "s5-v-new", opacity: 0.25 }, g);
    const N = AR.gauge(nw, 350, 86, 62, { id: "s5-v-gn", value: 5 });
    N.mark.setAttribute("opacity", 0);
    AR.ring(g, "s5-v-rm", 350, 36, 22, AR.green);
    // needle jumps about (abnormal), then the new gauge comes in and gets its green marking
    tl.fromTo(A.needle, { rotation: A.rot(5), svgOrigin: A.origin }, { rotation: A.rot(7.4), svgOrigin: A.origin, duration: 0.16, ease: "none", yoyo: true, repeat: 15, immediateRender: false }, b + 0.5);
    AR.op(nw, 0.25, 1, b + st[0] + 1.6, 0.5);
    AR.op(N.mark, 0, 1, b + c[0] + 3.8, 0.3);
    AR.pulse("s5-v-rm", b + c[0] + 3.9, 2);
  }

  // ---- card 2: turn the handle, the needle follows (loosen → down, tighten → up)
  {
    const g = H.$("s5-v-c2"), cx = 116;
    const M = mini(g, "s5-v-m2", cx);
    const G = AR.gauge(g, 350, 86, 62, { id: "s5-v-g2", value: 5 });
    const aL = H.el("path", { id: "s5-v-al", d: arcD(cx, false), fill: "none", stroke: AR.blue, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    const aT = H.el("path", { id: "s5-v-at", d: arcD(cx, true), fill: "none", stroke: AR.blue, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    const wL = H.text(g, 232, 46, "คลาย", { size: 24, anchor: "middle", fill: AR.blue, id: "s5-v-wl" });
    const wT = H.text(g, 232, 46, "ขัน", { size: 24, anchor: "middle", fill: AR.blue, id: "s5-v-wt" });
    const mD = H.el("path", { id: "s5-v-md", d: H.arrowD(232, 70, 232, 120, 14), fill: "none", stroke: AR.blue, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    const mU = H.el("path", { id: "s5-v-mu", d: H.arrowD(232, 120, 232, 70, 14), fill: "none", stroke: AR.blue, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    [wL, wT].forEach((e) => e.setAttribute("opacity", 0));
    const spin = (t) => tl.fromTo(M.bar, { scaleX: 1, svgOrigin: `${cx} 37` }, { scaleX: 0.3, svgOrigin: `${cx} 37`, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }, t);
    const tL = b + c[1] + 2.0, tT = b + c[1] + 3.2;
    AR.op([aL, wL, mD], 0, 1, tL - 0.2); spin(tL); G.ndl(5, 2.6, tL, 0.8);
    AR.op([aL, wL, mD], 1, 0, tT - 0.3);
    AR.op([aT, wT, mU], 0, 1, tT - 0.1); spin(tT); G.ndl(2.6, 7.4, tT, 0.9);
  }

  // ---- card 3: lock nut loose → vibration turns the handle by itself → the setting drifts
  {
    const g = H.$("s5-v-c3"), cx = 116;
    const shake = H.el("g", { id: "s5-v-shk" }, g);
    const M = mini(shake, "s5-v-m3", cx, 10);
    const G = AR.gauge(g, 350, 86, 62, { id: "s5-v-g3", value: 5 });
    const vib = H.el("path", { id: "s5-v-vib", d: "M 22 70 l -8 10 l 8 10 l -8 10 l 8 10 M 210 70 l 8 10 l -8 10 l 8 10 l -8 10", fill: "none", stroke: AR.muted, "stroke-width": 4, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: 0 }, g);
    AR.ring(g, "s5-v-rn", cx, 92, 34, AR.red);
    const t = b + st[2];
    AR.op(vib, 0, 1, t + 0.1);
    tl.fromTo(shake, { x: 0 }, { x: 4, duration: 0.06, ease: "none", yoyo: true, repeat: 41, immediateRender: false }, t + 0.1);
    tl.fromTo(M.bar, { scaleX: 1, svgOrigin: `${cx} 37` }, { scaleX: 0.55, svgOrigin: `${cx} 37`, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }, t + 0.5);
    G.ndl(5, 3.4, t + 0.6, 1.8, "power1.inOut");
    AR.pulse("s5-v-rn", t + 0.8, 2);
  }
}
