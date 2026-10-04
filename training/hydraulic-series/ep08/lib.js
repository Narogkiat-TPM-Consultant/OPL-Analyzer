// EP08 O-ring — drawings shared by s1 (title), s2 (colour code), s4 (groove), s5 (wrong size).
// Uses HC (palette) from ../lib/hyd_lib.js.

const ORC = { rubber: "#3b4047", hi: "#a3abb5", metal: "#d9d2c1", hatch: "#a39b86", space: "#fffdf8", backup: "#eef2f8", oilDark: "#b98a00" };
const OR_DOT = { blue: "#1f5fbf", red: "#d0233a", yellow: "#f2a900", green: "#178a4e" };

// 45° hatch for cut metal, defined inside the <svg> that holds `parent`. Returns the fill url.
H.orHatch = (parent, id, gap = 16, w = 3) => {
  const svg = (typeof parent === "string" ? H.$(parent) : parent).ownerSVGElement;
  const defs = H.el("defs", {}, svg);
  const pat = H.el("pattern", { id, patternUnits: "userSpaceOnUse", width: gap, height: gap, patternTransform: "rotate(45)" }, defs);
  H.el("rect", { width: gap, height: gap, fill: ORC.metal }, pat);
  H.el("line", { x1: 1, y1: 0, x2: 1, y2: gap, stroke: ORC.hatch, "stroke-width": w }, pat);
  return `url(#${id})`;
};

// O-ring seen at an angle (torus). R = centreline radius, k = vertical squash (ry/rx), t = half tube width.
// Returns { g, top: { cx, cy }, pt(deg) } — pt gives a point on the top surface (90° = front centre).
H.orTorus = (parent, cx, cy, R, k, t, o = {}) => {
  const f = H.f;
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  const ox = R + t, oy = (R + t) * k, ix = R - t, iy = (R - t) * k, lift = t * 0.45;
  const ell = (x, y, rx, ry, sweep) => `M ${f(x - rx)} ${f(y)} A ${f(rx)} ${f(ry)} 0 1 ${sweep} ${f(x + rx)} ${f(y)} A ${f(rx)} ${f(ry)} 0 1 ${sweep} ${f(x - rx)} ${f(y)} Z`;
  H.el("path", { d: ell(cx, cy, ox, oy, 0) + " " + ell(cx, cy - lift, ix, iy, 1), fill: ORC.rubber, "fill-rule": "evenodd", stroke: HC.ink, "stroke-width": o.sw || 4 }, g);
  // shine along the top surface
  H.el("ellipse", { cx, cy: f(cy - lift * 0.5 - t * 0.12), rx: R, ry: f(R * k), fill: "none", stroke: ORC.hi, "stroke-width": f(t * 0.42), opacity: 0.38 }, g);
  const top = { cx, cy: cy - lift * 0.5 };
  const pt = (deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + R * Math.cos(a), top.cy + R * k * Math.sin(a)];
  };
  return { g, top, pt, R, k, t };
};

// Identification dots on a torus (front-right, like the deck's figure). Returns the dot elements.
H.orDots = (T, parent, color, n, r = 10, idp = "") => {
  const out = [];
  const angs = n === 2 ? [60, 78] : [70];
  angs.slice(0, n).forEach((a, i) => {
    const [x, y] = T.pt(a);
    out.push(H.el("ellipse", { ...(idp ? { id: `${idp}-${i + 1}` } : {}), cx: H.f(x), cy: H.f(y), rx: r, ry: H.f(r * 0.72), fill: color, stroke: "#ffffff", "stroke-width": 3 }, parent));
  });
  return out;
};

// ---------------------------------------------------------------- groove cross-section
// G: { x0, x1 (cut extent), yc (cover top), yf (cover face), gap, yb (body bottom), gx, gw (groove), gd (groove bottom),
//      r (free O-ring radius), backup (backup-ring width, 0 = none), hatch (fill url), sw (stroke width) }
// Pressure side = left. Ring shape state st: { sh (shift right), rx, ry, lift (cover lift) }.
H.orRingD = (G, st = {}) => {
  const N = 96, f = H.f, wall = G.gx + G.gw - (G.backup || 0);
  const lift = st.lift || 0, top = G.yf - lift, bot = G.gd;
  const rx = st.rx ?? G.r * 1.04, ry = st.ry ?? G.r;
  const cx = (st.cx ?? G.gx + (G.gw - (G.backup || 0)) / 2) + (st.sh || 0);
  const cy = st.cy ?? (st.free ? bot - ry : (top + bot) / 2);
  let d = "";
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = Math.min(Math.max(cx + rx * Math.cos(a), G.gx + 2), wall - 2);
    const y = Math.min(Math.max(cy + ry * Math.sin(a), top), bot - 2);
    d += (i ? " L " : "M ") + f(x) + " " + f(y);
  }
  return d + " Z";
};

// Extrusion "tongue": the O-ring squeezed out into the clearance on the low-pressure side.
H.orTongueD = (G, lift, len) => {
  const f = H.f, w = G.gx + G.gw, t = G.yf - lift, b = G.yf + G.gap, m = (t + b) / 2;
  return `M ${f(w - 3)} ${f(t)} L ${f(w + len * 0.7)} ${f(t)} Q ${f(w + len)} ${f(t)} ${f(w + len)} ${f(m)} Q ${f(w + len)} ${f(b)} ${f(w + len * 0.7)} ${f(b)} L ${f(w - 3)} ${f(b)} Z`;
};

// Draws: oil (hidden), body with groove, ring, tongue, cover (group, lifts), optional bolt head on the cover.
// Returns handles { g, oil, ring, tongue, cover, backup, wall }.
H.orSection = (parent, p, G, o = {}) => {
  const f = H.f, sw = G.sw || 4, yt = G.yf + G.gap, wall = G.gx + G.gw - (G.backup || 0);
  const g = H.el("g", { id: p }, parent);
  // oil on the pressure side (under the cover so a lifting cover reveals more of it)
  const oil = H.el("g", { id: `${p}-oil`, opacity: o.oil ? 1 : 0 }, g);
  H.el("rect", { x: G.x0, y: G.yf - 30, width: G.gx - G.x0 + 2, height: yt - G.yf + 30, fill: HC.oil }, oil);
  H.el("rect", { x: G.gx, y: G.yf - 30, width: f((G.gw - (G.backup || 0)) * 0.62), height: G.gd - G.yf + 30, fill: HC.oil }, oil);
  // body (cut, hatched) with the groove
  const bodyD = `M ${G.x0} ${yt} L ${G.gx} ${yt} L ${G.gx} ${G.gd} L ${G.gx + G.gw} ${G.gd} L ${G.gx + G.gw} ${yt} L ${G.x1} ${yt} L ${G.x1} ${G.yb} L ${G.x0} ${G.yb} Z`;
  H.el("path", { d: bodyD, fill: G.hatch, stroke: "none" }, g);
  H.el("path", { d: `M ${G.x0} ${yt} L ${G.gx} ${yt} L ${G.gx} ${G.gd} L ${G.gx + G.gw} ${G.gd} L ${G.gx + G.gw} ${yt} L ${G.x1} ${yt}`, fill: "none", stroke: HC.ink, "stroke-width": sw, "stroke-linejoin": "round" }, g);
  // backup ring (stiff ring on the low-pressure side of the groove)
  let backup = null;
  if (G.backup) backup = H.el("rect", { id: `${p}-bk`, x: wall, y: f(G.yf - (o.lift || 0)), width: G.backup, height: f(G.gd - G.yf + (o.lift || 0)), fill: ORC.backup, stroke: HC.ink, "stroke-width": sw - 1 }, g);
  // O-ring
  const ring = H.el("path", { id: `${p}-ring`, d: H.orRingD(G, o.ring || {}), fill: ORC.rubber, stroke: HC.ink, "stroke-width": sw - 1, "stroke-linejoin": "round" }, g);
  const tongue = H.el("path", { id: `${p}-tg`, d: H.orTongueD(G, 0, 0), opacity: 0, fill: ORC.rubber, stroke: HC.ink, "stroke-width": sw - 1, "stroke-linejoin": "round" }, g);
  // cover (mating part), lifts with pressure
  const cover = H.el("g", { id: `${p}-cv` }, g);
  if (o.lift) cover.setAttribute("transform", `translate(0 ${-o.lift})`);
  H.el("rect", { x: G.x0, y: G.yc, width: G.x1 - G.x0, height: G.yf - G.yc, fill: G.hatch, stroke: "none" }, cover);
  H.el("path", { d: `M ${G.x0} ${G.yc} L ${G.x1} ${G.yc} M ${G.x0} ${G.yf} L ${G.x1} ${G.yf}`, fill: "none", stroke: HC.ink, "stroke-width": sw }, cover);
  if (o.bolt) {
    const bx = o.bolt;
    H.el("rect", { x: bx - 54, y: G.yc - 10, width: 108, height: 10, fill: HC.dark, stroke: HC.ink, "stroke-width": 3 }, cover);
    H.el("path", { d: `M ${bx - 40} ${G.yc - 10} L ${bx - 40} ${G.yc - 44} L ${bx + 40} ${G.yc - 44} L ${bx + 40} ${G.yc - 10} Z M ${bx - 13} ${G.yc - 44} L ${bx - 13} ${G.yc - 10} M ${bx + 13} ${G.yc - 44} L ${bx + 13} ${G.yc - 10}`, fill: "#9aa1aa", stroke: HC.ink, "stroke-width": 3, "stroke-linejoin": "round" }, cover);
  }
  return { g, oil, ring, tongue, cover, backup, wall };
};

// Numbered marker pill (blue, white number disc) — matches the numbered points of the diagram panel.
H.orNum = (parent, x, y, w, n, str, o = {}) => {
  const h = o.h || 46, g = H.el("g", o.id ? { id: o.id } : {}, parent);
  H.el("rect", { x, y, width: w, height: h, rx: h / 2, fill: o.fill || HC.blue, stroke: "#ffffff", "stroke-width": 3 }, g);
  H.el("circle", { cx: x + h / 2, cy: y + h / 2, r: h / 2 - 6, fill: "#ffffff" }, g);
  H.text(g, x + h / 2, y + h / 2 + 10, String(n), { size: 28, anchor: "middle", fill: o.fill || HC.blue });
  H.text(g, x + h + 8, y + h / 2 + 10, str, { size: o.size || 27, fill: "#ffffff" });
  return g;
};

// Rounded label pill. o: { fill, color, size, id, stroke }. Returns the group.
H.orPill = (parent, x, y, w, h, str, o = {}) => {
  const g = H.el("g", o.id ? { id: o.id } : {}, parent);
  H.el("rect", { x, y, width: w, height: h, rx: h / 2, fill: o.fill || HC.blue, ...(o.stroke ? { stroke: o.stroke, "stroke-width": 3 } : {}) }, g);
  const size = o.size || 28;
  H.text(g, x + w / 2, y + h / 2 + size * 0.36, str, { size, anchor: "middle", fill: o.color || "#ffffff" });
  return g;
};
