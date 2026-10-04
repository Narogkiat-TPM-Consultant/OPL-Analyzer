// Range rule (OPL 5-C-6 p.25, "determining a limit for high pressure"): two 0–6 dials.
// Left: little fluctuation → normal pressure below 2/3 of full scale (blue zone 0–4, needle steady ≈ 3.5).
// Right: large fluctuation → normal pressure ≤ 1/2 of full scale (blue zone 0–3, needle swings around it).
// Blue = "range of the working pressure" (information), so it is not mistaken for the green OK band.
{
  const K = K18, c = T.cues;
  const mk = (pid, id, cx, frac, fracTxt, title, amp) => {
    const root = H.$(pid);
    const G = H.g18Dial(root, cx, 282, 196, { id, value: 0, minor: 5 });
    const lim = 6 * frac;
    H.g18Band(G, 0, lim, K.blueLt);
    // limit mark across the scale ring + fraction label outside
    const [x1, y1] = G.pt(lim, G.r * 0.7), [x2, y2] = G.pt(lim, G.r * 1.1);
    H.el("line", { x1: H.f(x1), y1: H.f(y1), x2: H.f(x2), y2: H.f(y2), stroke: K.blue, "stroke-width": 9 }, G.g);
    const [lx, ly] = G.pt(lim, G.r * 1.24);
    H.text(G.g, lx, ly + 16, fracTxt, { size: 46, anchor: "middle", fill: K.blue });
    H.text(root, cx, 548, title, { size: 32, anchor: "middle" });
    // fluctuation sketch: small or large wave
    let d = `M ${cx - 120} 594`;
    for (let i = 1; i <= 24; i++) d += ` L ${cx - 120 + i * 10} ${H.f(594 - amp * Math.sin((i * Math.PI) / 3))}`;
    H.el("path", { d, fill: "none", stroke: K.blue, "stroke-width": 5, "stroke-linejoin": "round" }, root);
    return G;
  };
  const A = mk("s3-v-a", "s3-v-da", 280, 2 / 3, "2/3", "แรงดันแกว่งน้อย", 6);
  const B = mk("s3-v-b", "s3-v-db", 818, 1 / 2, "1/2", "แรงดันแกว่งมาก", 22);

  // cue 1: steady pressure, below 2/3
  const t1 = b + c[0] + 0.4;
  H.g18Needle(A, 0, 3.5, t1, 1.3, "power2.out");
  H.g18Swing(A, 3.5, 3.62, t1 + 1.3, b + D - 0.2, 0.3);
  // right dial waits dimmed until cue 2
  H.g18Op("#s3-v-b", 0.3, 0.3, b, 0.01);
  const t2 = b + c[1] + 0.1;
  H.g18Op("#s3-v-b", 0.3, 1, t2, 0.35, false);
  H.g18Needle(B, 0, 1.4, t2 + 0.2, 0.7, "power2.out");
  H.g18Swing(B, 1.4, 4.2, t2 + 0.9, b + D - 0.2, 0.45);
}
