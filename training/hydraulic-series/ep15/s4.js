// Judgment (OPL 5-C-3, p.19): pressure-gauge fluctuation within ±3 kgf/cm² = normal.
// OK card: the needle swings a little and stays inside the green band (normal reading ±3).
// NG card: the needle swings beyond the band. The action "แจ้งช่างซ่อมบำรุง" is a proposal (caption).
{
  const st = T.stamps;
  const mk = (id) => {
    const g = H.$(id);
    const Dl = H.dial15(g, `${id}-d`, 470, 176, 150, { value: G15.min });
    H.legend15(g, 20, 66, C15.blue, "ค่าปกติ", 28, 30);
    H.legend15(g, 20, 116, C15.green, "±3 kgf/cm²", 28, 30);
    return Dl;
  };
  const ok = mk("s4-v-ok"), ng = mk("s4-v-ng");
  // swing-range arcs (inside the dial, under the band): OK stays inside ±3, NG goes beyond
  const range = (Dl, id, amp, col) => {
    const a = H.el("path", { id, d: H.arcD(470, 176, 150 * 0.56, Dl.rot(G15.N - amp), Dl.rot(G15.N + amp)), fill: "none", stroke: col, "stroke-width": 7, "stroke-linecap": "round", "stroke-dasharray": "2 12", opacity: 0 }, Dl.g);
    return a;
  };
  const rOk = range(ok, "s4-v-rok", 2, C15.green);
  const rNg = range(ng, "s4-v-rng", 7, C15.ink);

  const rise = (t) => {
    const u = clamp01((t - b - 0.3) / 0.9);
    return G15.min + (G15.N - G15.min) * (1 - (1 - u) ** 3);
  };
  // OK: from its stamp on, swing ≤ 2 (inside the band)
  H.needle15(ok, (t) => rise(t) + 2 * H.env(t, b + st[0], b + D, 0.3) * H.wob(t * 0.38, 0.3), b, b + D, true);
  // NG: from its stamp on, swing up to 7 (well beyond ±3)
  H.needle15(ng, (t) => rise(t) + 7 * H.env(t, b + st[1], b + D, 0.3) * H.wob(t * 0.42, 1.1), b, b + D, true);
  tl.fromTo(rOk, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + st[0] + 0.3);
  tl.fromTo(rNg, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + st[1] + 0.3);
}
