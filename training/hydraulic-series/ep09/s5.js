// Early sign, three states of the same joint: dry (OK) · drop under the fitting (NG) · oil mark on the floor (NG).
// Each card's motion starts with its stamp (T.stamps).
{
  const st = T.stamps, f = H.f;
  const k = 1.05, y = 70, floorY = 172;
  const scene = (id, o = {}) => {
    const P = H.$(id);
    const fx = 236 + 51 * k;
    const pud = H.e9Floor(P, 14, 486, floorY, 236, { rx: o.rx ?? 0.1, ry: o.ry ?? 0.1, h: 8, sw: 4 });
    if (!o.rx) pud.setAttribute("opacity", 0);
    const L = H.e9Line(P, 14, 486, y, fx, { k, wet: !!o.wet });
    return { P, pud, drip: L.drip, fx };
  };

  // OK: dry joint, clean floor
  scene("s5-v-ok");

  // NG: drop under the fitting
  const A = scene("s5-v-drop", { wet: true, rx: 28, ry: 6 });
  const ring = H.el("ellipse", { cx: f(A.fx + 2), cy: y, rx: 94, ry: 60, fill: "none", stroke: E9.red, "stroke-width": 6 }, A.P);
  tl.fromTo(ring, { opacity: 0, scale: 1.12, svgOrigin: `${f(A.fx)} ${y}` }, { opacity: 1, scale: 1, svgOrigin: `${f(A.fx)} ${y}`, duration: 0.35, ease: "back.out(2)" }, b + st[1]);
  H.e9Drip(A.P, A.drip[0], A.drip[1], 11, floorY - 4 - (A.drip[1] + 2.75 * 11), 1.0, b + st[1] - 0.6, b + D - 0.1, { fall: 0.45, sw: 2.5 });

  // NG: oil mark spreading on the floor; look up for the source
  const B = scene("s5-v-floor", { wet: true, rx: 60, ry: 8 });
  B.pud.setAttribute("fill", E9.oilDk);
  B.pud.setAttribute("opacity", 0.85);
  const shine = H.el("ellipse", { cx: 206, cy: floorY - 2, rx: 40, ry: 3, fill: "#ffffff", opacity: 0.6 }, B.P);
  const up = H.el("path", { d: H.arrowD(320, floorY - 14, B.drip[0] + 22, B.drip[1] + 16, 16), fill: "none", stroke: E9.blue, "stroke-width": 5, "stroke-dasharray": "10 7" }, B.P);
  tl.fromTo(B.pud, { attr: { rx: 60, ry: 8 } }, { attr: { rx: 170, ry: 12 }, duration: 1.2, ease: "power2.out" }, b + st[2]);
  tl.fromTo(shine, { attr: { rx: 40 } }, { attr: { rx: 100 }, duration: 1.2, ease: "power2.out" }, b + st[2]);
  tl.fromTo(up, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + st[2] + 0.9);
}
