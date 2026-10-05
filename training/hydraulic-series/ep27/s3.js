// Same cylinder, same viewpoint: left with an oil film (smooth stroke), right dry (no film, rust spots,
// jerky stick-slip stroke, air hissing out at the rod seal). The small graph = piston position over time.
{
  const mk = (pid, ok) => {
    const g = H.$(pid);
    const C = H.p27Cyl(g, { id: pid + "-c", x: 34, y: 150, s: 0.5, rod: 150, pipeTop: -150, oil: ok, rust: !ok });
    // position–time graph
    const P = H.el("g", {}, g);
    H.el("path", { d: "M 606 92 L 606 206 L 744 206", fill: "none", stroke: P27.muted, "stroke-width": 3 }, P);
    H.text(P, 610, 80, "ตำแหน่ง", { size: 20, fill: P27.muted });
    H.text(P, 744, 230, "เวลา →", { size: 20, fill: P27.muted, anchor: "end" });
    const d = ok ? "M 610 200 C 660 200 680 100 736 100"
      : "M 610 200 L 630 200 L 634 175 L 654 175 L 658 150 L 678 150 L 682 125 L 702 125 L 706 100 L 736 100";
    const trace = H.el("path", { d, fill: "none", stroke: ok ? P27.green : P27.red, "stroke-width": 5, "stroke-linejoin": "round", "stroke-linecap": "butt" }, P);
    return { g, C, trace };
  };

  // ---- left: oil film → smooth stroke
  const A = mk("s3-v-a", true);
  H.p27Label(A.g, 300, 46, "ลื่น · สม่ำเสมอ", { size: 30, fill: P27.green, anchor: "middle" });
  H.p27Label(A.g, 214, 226, "ฟิล์มน้ำมัน", { size: 24, fill: P27.oilDk, line: [208, 218, 184, 186], lineColor: P27.oilDk });
  const LA = A.trace.getTotalLength();
  const tA = b + T.left + 0.6;
  tl.fromTo(A.trace, { strokeDasharray: LA, strokeDashoffset: LA }, { strokeDashoffset: 0, duration: 1.6, ease: "none" }, tA);
  tl.fromTo(A.C.pis, { x: 0 }, { x: 300, duration: 1.6, ease: "sine.inOut" }, tA);
  H.p27Run(A.C.flowL, tA, 1.6, 90);
  tl.to(A.C.pis, { x: 0, duration: 1.3, ease: "sine.inOut" }, tA + 1.9);
  H.p27Run(A.C.flowR, tA + 1.9, 1.3, 90);

  // ---- right: dry → stick-slip stroke, air leak at the rod seal, rust on the wall
  const B = mk("s3-v-b", false);
  H.p27Label(B.g, 300, 46, "ฝืด · กระตุก", { size: 30, fill: P27.red, anchor: "middle" });
  H.p27Label(B.g, 214, 226, "สนิม (Rust)", { size: 24, fill: P27.rust, line: [208, 218, 189, 188], lineColor: P27.rust });
  const leakLab = H.p27Label(B.g, 352, 108, "ลมรั่ว", { size: 24, fill: P27.blue, opacity: 0 });
  const [px, py] = B.C.at(584, -18);
  const puff = H.p27Puff(B.g, px, py, -35, { w: 4 });
  const LB = B.trace.getTotalLength();
  const tB = b + T.right + 0.6;
  // trace in 4 steps, in step with the jumps
  const jump = 0.2, pause = 0.38, n = 4;
  tl.fromTo(B.trace, { strokeDasharray: LB, strokeDashoffset: LB }, { strokeDashoffset: LB, duration: 0.01, immediateRender: true }, b);
  for (let k = 1; k <= n; k++) {
    const t = tB + (k - 1) * (jump + pause);
    const from = LB * (1 - (k - 1) / n), to = LB * (1 - k / n);
    tl.fromTo(B.trace, { strokeDashoffset: from }, { strokeDashoffset: to, duration: jump + pause, ease: "none", immediateRender: false }, t);
  }
  const tEnd = H.p27Jerky(B.C.pis, tB, 0, 300, n, jump, pause);
  H.p27Run(B.C.flowL, tB, tEnd - tB + 0.3, 90);
  H.p27Puffs(puff, tB + 0.3, 4, 0.5);
  tl.fromTo(leakLab, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, tB + 0.4);
}
