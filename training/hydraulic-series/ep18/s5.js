// Visual control marking (OPL 5-C-7, deck example "For set pressure 2–4 kg/cm²" on a 0–6 dial):
// ① the meter glass comes off → ② green marker 2–4 (normal), red marker 0–2 and 4–6 (abnormal)
// → ③ nothing beyond the scale ends (ghost red past 6 is crossed out) → the glass goes back on.
{
  const K = K18, c = T.cues;
  const root = H.$("s5-v-dial"), fx = H.$("s5-v-fx");
  const G = H.g18Dial(root, 360, 322, 240, { id: "s5-v-d", value: 0 });
  const M = H.g18Marked(G);
  const pg = H.g18Pen(fx, G, K.green, "s5-v-pg");
  const pr = H.g18Pen(fx, G, K.red, "s5-v-pr");

  // ① glass off → parked top right (scaled down), with its name
  const t1 = b + c[0] + 0.7;
  // parked: dial centre (360, 322) → (900, 172) at 0.42 scale (attr transform, tweened as a string)
  const sc = 0.42, home = "translate(0 0) scale(1)", park = `translate(${H.f(900 - sc * 360)} ${H.f(172 - sc * 322)}) scale(${sc})`;
  tl.fromTo(G.glass, { attr: { transform: home } }, { attr: { transform: park }, duration: 0.9, ease: "power2.inOut" }, t1);
  const gl = H.el("g", { opacity: 0 }, fx);
  H.text(gl, 900, 312, "กระจกหน้าปัด", { size: 28, anchor: "middle" });
  H.text(gl, 900, 344, "(Meter glass)", { size: 24, anchor: "middle", fill: K.muted, weight: 600 });
  H.g18Op(gl, 0, 1, t1 + 0.6, 0.3);

  // ② green 2–4, then red 0–2 and 4–6, each written by its marker
  const t2 = b + c[1] + 0.3;
  H.g18Write(pg, G, M.green, 2, 4, t2, 1.1);
  H.g18Write(pr, G, M.red1, 0, 2, t2 + 1.5, 0.9);
  H.g18Write(pr, G, M.red2, 4, 6, t2 + 2.6, 0.9, false);
  // legend
  const lg = H.el("g", { opacity: 0 }, fx);
  H.el("rect", { x: 712, y: 418, width: 46, height: 30, rx: 4, fill: K.green }, lg);
  H.text(lg, 772, 444, "เขียว = ช่วงปกติ", { size: 30 });
  H.el("rect", { x: 712, y: 470, width: 46, height: 30, rx: 4, fill: K.red }, lg);
  H.text(lg, 772, 496, "แดง = ช่วงผิดปกติ", { size: 30 });
  H.g18Op(lg, 0, 1, t2 + 0.2, 0.3);

  // ③ never beyond the scale: ghost red past 6 → crossed out → gone; glass back on
  const t3 = b + c[2] + 0.1;
  const gh = H.el("g", { opacity: 0 }, fx);
  H.g18Band(G, 6, 6.85, K.red, { parent: gh, opacity: 0.45 });
  const [qx, qy] = G.pt(6.45, G.br);
  H.g18Cross(gh, qx, qy, 26, { w: 10 });
  H.text(gh, 560, 608, "ห้ามทาเลยขอบสเกล", { size: 30, fill: K.red });
  H.g18Op(gh, 0, 1, t3, 0.25);
  const rg = H.g18Ring(fx, ...G.pt(6, G.br), 30, K.blue, t3 + 0.2, 2, 5);
  H.g18Op(rg, 1, 0, t3 + 1.6, 0.3, false);
  H.g18Op(gh, 1, 0, t3 + 2.0, 0.3, false);
  H.g18Op(gl, 1, 0, t3 + 2.0, 0.3, false);
  tl.fromTo(G.glass, { attr: { transform: park } }, { attr: { transform: home }, duration: 0.9, ease: "power2.inOut", immediateRender: false }, t3 + 2.2);
}
