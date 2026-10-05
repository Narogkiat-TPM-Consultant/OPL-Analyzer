// Six characteristics of pneumatics vs hydraulics (OPL 5'-A-1): six tiles light up with narration cues 2–7.
{
  const P = "s3-v-grid", c = T.cues;
  const W = 564, Hh = 348, X = [12, 596, 1180], Y = [12, 380];
  const tiles = [];
  const tile = (k, x, y, title, sub) => {
    const g = H.el("g", { id: `s3-v-t${k}` }, P);
    const rect = H.el("rect", { x, y, width: W, height: Hh, rx: 22, fill: PN.paper, stroke: PN.line, "stroke-width": 4 }, g);
    H.el("circle", { cx: x + 38, cy: y + 40, r: 23, fill: PN.blue }, g);
    H.text(g, x + 38, y + 50, String(k), { size: 28, fill: "#ffffff", anchor: "middle" });
    H.text(g, x + 74, y + 52, title, { size: 31 });
    H.text(g, x + W / 2, y + 330, sub, { size: 23, fill: PN.muted, anchor: "middle" });
    const t = { g, rect, x, y };
    tiles.push(t);
    return t;
  };
  const t1 = tile(1, X[0], Y[0], "เดินท่อทั้งโรงงานง่าย", "ต่อท่อจาก Compressor ไปได้ทั่วโรงงาน");
  const t2 = tile(2, X[1], Y[0], "เร็ว แต่หยุดตรงตำแหน่งยาก", "คุมความเร็ว / หยุดกลางทาง ทำได้ยาก");
  const t3 = tile(3, X[2], Y[0], "แรงดันต่ำ → ซ่อมรั่วง่าย", "แรงดันลมต่ำกว่าไฮดรอลิกมาก");
  const t4 = tile(4, X[0], Y[1], "เครื่อง + วงจรเรียบง่าย", "บำรุงรักษาง่าย (Easy maintenance)");
  const t5 = tile(5, X[1], Y[1], "ไม่มีน้ำมัน พื้นไม่เลอะ", "ไม่ต้องคุมน้ำมันแบบระบบไฮดรอลิก");
  const t6 = tile(6, X[2], Y[1], "เสี่ยงไฟไหม้น้อยกว่า", "Risk of fire ต่ำกว่าระบบไฮดรอลิก");
  tiles.forEach((t, i) => {
    const at = b + c[i + 1];
    tl.fromTo(t.g, { opacity: 0.28 }, { opacity: 1, duration: 0.35 }, at);
    tl.fromTo(t.rect, { attr: { stroke: PN.line } }, { attr: { stroke: PN.blue }, duration: 0.25 }, at);
    if (i < 5) tl.fromTo(t.rect, { attr: { stroke: PN.blue } }, { attr: { stroke: PN.line }, duration: 0.25, immediateRender: false }, b + c[i + 2]);
  });
  const check = (pa, cx, cy, r) => {
    const g = H.el("g", { opacity: 0 }, pa);
    H.el("circle", { cx, cy, r, fill: PN.green }, g);
    H.el("path", { d: H.pnCheckD(cx, cy, r * 0.5), fill: "none", stroke: "#ffffff", "stroke-width": Math.max(4, r * 0.22), "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    return g;
  };
  const pop = (el, t) => tl.fromTo(el, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)" }, t);

  // ① one compressor feeds the whole factory
  {
    const { g, x, y } = t1, a = b + c[1];
    H.el("path", { d: `M ${x + 214} ${y + 104} L ${x + 290} ${y + 80} L ${x + 290} ${y + 104} L ${x + 375} ${y + 80} L ${x + 375} ${y + 104} L ${x + 460} ${y + 80} L ${x + 460} ${y + 104} L ${x + 545} ${y + 80} L ${x + 545} ${y + 104}`, fill: "none", stroke: PN.muted, "stroke-width": 4, "stroke-linejoin": "round" }, g);
    H.el("line", { x1: x + 16, y1: y + 276, x2: x + 548, y2: y + 276, stroke: PN.muted, "stroke-width": 4 }, g);
    const Cm = H.pnCompressor(g, x + 22, y + 156, 0.6);
    const head = H.pnTube(g, `M ${x + 179} ${y + 241} L ${x + 200} ${y + 241} L ${x + 200} ${y + 128} L ${x + 530} ${y + 128}`, { w: 12 });
    const drops = [];
    for (const mx of [290, 400, 510]) {
      drops.push(H.pnTube(g, `M ${x + mx} ${y + 128} L ${x + mx} ${y + 200}`, { w: 12 }));
      pnR(g, x + mx - 40, y + 200, 80, 64, PN.metal, { rx: 6 });
      pnR(g, x + mx - 26, y + 214, 40, 18, PN.barrel, { rx: 2, sw: 3 });
      pnR(g, x + mx + 14, y + 219, 16, 8, PN.dark, { rx: 1, sw: 2 });
      pnR(g, x + mx - 32, y + 264, 12, 12, PN.dark, { rx: 1, sw: 2 });
      pnR(g, x + mx + 20, y + 264, 12, 12, PN.dark, { rx: 1, sw: 2 });
    }
    H.pnSpin(Cm.fw, Cm.fwO, a, b + D - a, 1.5);
    H.pnFlow(head, a + 0.3, b + D - a - 0.3);
    H.pnFlow(drops, a + 1.0, b + D - a - 1.0);
  }

  // ② fast — but stopping at a set position is difficult
  {
    const { g, x, y } = t2, a = b + c[2];
    const tag = H.el("g", {}, g);
    H.el("rect", { x: x + 74, y: y + 70, width: 120, height: 34, rx: 17, fill: PN.yellow }, tag);
    H.text(tag, x + 134, y + 95, "ข้อจำกัด", { size: 21, anchor: "middle" });
    const C = H.pnCylinder(g, x + 36, y + 150, 0.95, null, 150);
    const tx = x + 36 + (376 + 75) * 0.95;
    H.el("line", { x1: H.f(tx), y1: y + 128, x2: H.f(tx), y2: y + 262, stroke: PN.red, "stroke-width": 4, "stroke-dasharray": "10 8" }, g);
    H.text(g, H.f(tx), y + 290, "จุดที่ต้องการหยุด", { size: 21, fill: PN.red, anchor: "middle" });
    const st = H.el("g", { opacity: 0 }, g);
    for (const [dy, l] of [[-18, 60], [0, 90], [18, 60]]) H.el("line", { x1: H.f(tx - 20 - l), y1: y + 188 + dy, x2: H.f(tx - 20), y2: y + 188 + dy, stroke: PN.dash, "stroke-width": 5, "stroke-linecap": "round" }, st);
    H.pnCylMove(C, 0, 1, a + 0.4, 0.35, "power2.in");
    tl.fromTo(st, { opacity: 0, x: 0 }, { opacity: 1, x: 70, duration: 0.3, ease: "power1.in" }, a + 0.45);
    tl.fromTo(st, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, a + 0.8);
    H.pnCylMove(C, 1, 0, a + 1.2, 0.45);
    const s0 = a + 1.9;
    H.pnCylMove(C, 0, 0.66, s0, 0.45, "power2.in");
    H.pnCylMove(C, 0.66, 0.38, s0 + 0.45, 0.35, "sine.inOut");
    H.pnCylMove(C, 0.38, 0.58, s0 + 0.8, 0.3, "sine.inOut");
    H.pnCylMove(C, 0.58, 0.40, s0 + 1.1, 0.3, "sine.out");
  }

  // ③ low pressure → leaks are easier to repair
  {
    const { g, x, y } = t3, a = b + c[3];
    H.el("line", { x1: x + 24, y1: y + 258, x2: x + 226, y2: y + 258, stroke: PN.ink, "stroke-width": 4 }, g);
    const bh = H.el("rect", { x: x + 40, y: y + 92, width: 70, height: 166, fill: PN.dark, stroke: PN.ink, "stroke-width": 3 }, g);
    const ba = H.el("rect", { x: x + 140, y: y + 218, width: 70, height: 40, fill: PN.dash, stroke: PN.ink, "stroke-width": 3 }, g);
    H.text(g, x + 75, y + 288, "ไฮดรอลิก", { size: 21, fill: PN.muted, anchor: "middle" });
    H.text(g, x + 175, y + 288, "ลม", { size: 21, fill: PN.blue, anchor: "middle" });
    tl.fromTo([bh, ba], { scaleY: 0, svgOrigin: `${x} ${y + 258}` }, { scaleY: 1, svgOrigin: `${x} ${y + 258}`, duration: 0.6, ease: "power2.out", stagger: 0.25 }, a + 0.3);
    H.pnTube(g, `M ${x + 262} ${y + 214} L ${x + 540} ${y + 214}`, { w: 16 });
    pnR(g, x + 372, y + 188, 46, 52, PN.metal, { rx: 4 });
    pnR(g, x + 418, y + 196, 16, 36, PN.dark, { rx: 2, sw: 3 });
    const puffs = [];
    for (let i = 0; i < 3; i++) puffs.push(H.el("circle", { cx: x + 395 + (i - 1) * 14, cy: y + 176, r: 7, fill: "none", stroke: PN.puff, "stroke-width": 4, opacity: 0 }, g));
    puffs.forEach((el, i) => tl.fromTo(el, { opacity: 0.9, y: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 0, y: -46, scale: 1.6, transformOrigin: "50% 50%", duration: 0.55, repeat: 2, ease: "power1.out" }, a + 0.3 + i * 0.18));
    const wr = H.pnWrench(g, x + 395, y + 214, 0.9, -145);
    tl.fromTo(wr, { opacity: 0 }, { opacity: 1, duration: 0.3 }, a + 1.6);
    tl.fromTo(wr, { rotation: -20, svgOrigin: "0 0" }, { rotation: 15, svgOrigin: "0 0", duration: 0.5, ease: "power2.inOut", yoyo: true, repeat: 1 }, a + 1.8);
    pop(check(g, x + 500, y + 110, 28), a + 2.9);
  }

  // ④ simple machine and circuit → easy maintenance
  {
    const { g, x, y } = t4, a = b + c[4];
    const C = H.pnCylinder(g, x + 70, y + 92, 0.62, null, 90);
    const V = H.pnValve(g, x + 120, y + 214, 0.62);
    H.pnTube(g, `M ${H.f(V.A[0])} ${H.f(V.A[1])} L ${H.f(V.A[0])} ${y + 178} L ${H.f(C.cap[0])} ${y + 178} L ${H.f(C.cap[0])} ${H.f(C.cap[1])}`, { w: 10 });
    H.pnTube(g, `M ${H.f(V.B[0])} ${H.f(V.B[1])} L ${H.f(V.B[0])} ${y + 178} L ${H.f(C.rod[0])} ${y + 178} L ${H.f(C.rod[0])} ${H.f(C.rod[1])}`, { w: 10 });
    H.pnWrench(g, x + 420, y + 250, 0.85, -50);
    H.pnValveOn(V, a + 0.4);
    H.pnCylMove(C, 0, 1, a + 0.6, 0.6);
    pop(check(g, x + 512, y + 120, 28), a + 1.6);
  }

  // ⑤ no oil to manage — the floor stays clean
  {
    const { g, x, y } = t5, a = b + c[5];
    H.el("line", { x1: x + 20, y1: y + 252, x2: x + 544, y2: y + 252, stroke: PN.muted, "stroke-width": 4 }, g);
    for (const mx of [150, 420]) {
      pnR(g, x + mx - 90, y + 112, 180, 100, PN.metal, { rx: 8 });
      pnR(g, x + mx - 70, y + 212, 16, 40, PN.dark, { rx: 2, sw: 3 });
      pnR(g, x + mx + 54, y + 212, 16, 40, PN.dark, { rx: 2, sw: 3 });
    }
    pnR(g, x + 90, y + 132, 120, 40, PN.oil, { rx: 4, sw: 3 });
    H.text(g, x + 150, y + 160, "Oil", { size: 22, anchor: "middle" });
    pnR(g, x + 360, y + 132, 120, 40, PN.air, { rx: 4, sw: 3 });
    H.text(g, x + 420, y + 160, "Air", { size: 22, fill: PN.blue, anchor: "middle" });
    H.text(g, x + 150, y + 288, "ไฮดรอลิก", { size: 22, fill: PN.muted, anchor: "middle" });
    H.text(g, x + 420, y + 288, "ลม", { size: 22, fill: PN.blue, anchor: "middle" });
    const pud = H.el("ellipse", { cx: x + 170, cy: y + 254, rx: 60, ry: 9, fill: PN.oil, stroke: PN.ink, "stroke-width": 2 }, g);
    const drop = H.el("path", { d: H.pnDropD(x + 170, y + 222, 7), fill: PN.oil, stroke: PN.ink, "stroke-width": 2, opacity: 0 }, g);
    tl.fromTo(drop, { opacity: 1, y: 0 }, { opacity: 1, y: 24, duration: 0.35, ease: "power1.in", repeat: 3, repeatDelay: 0.15, immediateRender: false }, a + 0.2);
    tl.fromTo(pud, { scaleX: 0.1, scaleY: 0.1, svgOrigin: `${x + 170} ${y + 254}` }, { scaleX: 1, scaleY: 1, svgOrigin: `${x + 170} ${y + 254}`, duration: 1.6, ease: "power1.out" }, a + 0.5);
    tl.fromTo(drop, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, a + 2.1);
    pop(check(g, x + 512, y + 112, 28), a + 1.2);
  }

  // ⑥ less risk of fire
  {
    const { g, x, y } = t6, a = b + c[6];
    const fo = H.el("g", {}, g), fi = H.el("g", {}, fo);
    H.el("path", { d: H.pnFlameD(x + 200, y + 252, 62), fill: PN.orange }, fi);
    H.el("path", { d: H.pnFlameD(x + 205, y + 252, 32), fill: PN.oil }, fi);
    H.el("line", { x1: x + 90, y1: y + 254, x2: x + 310, y2: y + 254, stroke: PN.muted, "stroke-width": 4 }, g);
    const arr = H.el("path", { d: H.arrowD(x + 430, y + 96, x + 430, y + 240, 30), fill: "none", stroke: PN.blue, "stroke-width": 14, opacity: 0 }, g);
    const lbl = H.text(g, x + 430, y + 288, "ความเสี่ยงลดลง", { size: 22, fill: PN.blue, anchor: "middle" });
    lbl.setAttribute("opacity", "0");
    tl.fromTo(fi, { scaleY: 1, svgOrigin: `${x + 200} ${y + 252}` }, { scaleY: 0.86, svgOrigin: `${x + 200} ${y + 252}`, duration: 0.22, yoyo: true, repeat: 9, ease: "sine.inOut" }, a);
    tl.fromTo(fo, { scale: 1, svgOrigin: `${x + 200} ${y + 252}` }, { scale: 0.55, svgOrigin: `${x + 200} ${y + 252}`, duration: 0.9, ease: "power2.inOut" }, a + 0.5);
    tl.fromTo([arr, lbl], { opacity: 0 }, { opacity: 1, duration: 0.35 }, a + 0.6);
    tl.fromTo(arr, { y: -20 }, { y: 0, duration: 0.5, ease: "power2.out" }, a + 0.6);
  }
}
