// Control + work side: direction valve, flow regulating valves, cylinder — actual part → symbol.
const R = H.e3table("s3-v-t", "s3-v");
const at = (k, f) => b + H.e3seg(T, D, k, f);
const flash3 = (els, t, hold) => els.forEach((e) => H.e3flash(e, t, hold));

// ---- row 1: solenoid direction switch valve (4 ports, 3 positions)
{
  const r = R[0];
  const a = G3(r.act, 319, r.cy, 1.3);
  pipe3(a, "M -22 -40 L -22 -78 M 22 -40 L 22 -78");
  pipe3(a, "M -22 40 L -22 78 M 22 40 L 22 78");
  const dv = P3.dirValve(a, "s3-v-dva");
  const s = G3(r.sym, 858, r.cy, 1.15);
  L3(s, "M -22 -46 L -22 -70 M 22 -46 L 22 -70 M -22 46 L -22 70 M 22 46 L 22 70");
  const sv = S3.dir(s, "s3-v-dvs");
  const fillL = H.el("rect", { x: -129, y: -32, width: 86, height: 64, fill: "rgba(31,95,191,0.22)", opacity: 0 }, sv.spool);
  const fillR = H.el("rect", { x: 43, y: -32, width: 86, height: 64, fill: "rgba(31,95,191,0.22)", opacity: 0 }, sv.spool);
  H.e3rowText(r, [["วาล์วเปลี่ยนทิศทาง", K3.ink]], "Direction switch valve · 4 พอร์ต 3 ตำแหน่ง", "3 ช่อง = 3 ตำแหน่ง · ลูกศรตรง / ไขว้");
  H.e3rowOn(r, b + T.cues[0], 1.2);
  const t1 = at(1, 0.18), t2 = at(1, 0.47), t3 = at(1, 0.61), t4 = at(1, 0.79);
  flash3([H.e3ring(a, -90, -38, 180, 76, 1.3), H.e3ring(s, -137, -40, 274, 80, 1.15)], t1, t2 - t1 - 0.5);
  H.e3flash(fillL, t2, t3 - t2 - 0.4);
  H.e3flash(fillR, t3, t4 - t3 - 0.4);
  flash3([H.e3ring(a, -164, -52, 92, 82, 1.3), H.e3ring(a, 72, -52, 92, 82, 1.3), H.e3ring(s, -183, -32, 60, 68, 1.15), H.e3ring(s, 123, -32, 60, 68, 1.15)], t4, 1.8);
}

// ---- row 2: two flow regulating valves (throttle + check valve)
{
  const r = R[1];
  const a = G3(r.act, 319, r.cy, 1.4);
  const knobs = [-95, 95].map((x, i) => {
    pipe3(a, `M ${x} -40 L ${x} -72 M ${x} 40 L ${x} 72`);
    return P3.flowValve(G3(a, x, 0), `s3-v-fa${i}`);
  });
  const s = G3(r.sym, 858, r.cy, 1.12);
  const fv = [-118, 62].map((x, i) => ({ x, ...S3.flow(G3(s, x, 0), `s3-v-fs${i}`) }));
  H.e3rowText(r, [["วาล์วปรับอัตราการไหล ", K3.ink], ["× 2", K3.blue]], "Flow regulating valve + เช็ควาล์ว (Check)", "ช่องคอด + ลูกศรเฉียง = ปรับได้");
  H.e3rowOn(r, b + T.cues[1]);
  const t1 = at(2, 0.38), t2 = at(2, 0.68), t3 = at(2, 0.86);
  fv.forEach((f) => {
    const adjPaths = f.adj.querySelectorAll("path");
    tl.to(adjPaths, { stroke: K3.blue, duration: 0.25 }, t1);
    tl.to(adjPaths, { stroke: K3.ink, duration: 0.3 }, t3);
    H.e3flash(H.e3ring(G3(s, f.x, 0), 62, -22, 36, 40, 1.12), t3, 1.4);
  });
  knobs.forEach((k) => {
    H.e3flash(H.e3ring(k.knob.parentNode, -30, -30, 60, 60, 1.4), t1, t3 - t1 - 0.4);
    tl.fromTo(k.knob, { rotation: 0, svgOrigin: k.origin }, { rotation: 150, svgOrigin: k.origin, duration: 0.9, ease: "power2.inOut" }, t2);
  });
}

// ---- row 3: hydraulic cylinder — rod pushes out on both sides together
{
  const r = R[2];
  const a = G3(r.act, 319 - 79 * 0.82, r.cy - 22, 0.82);
  pipe3(a, "M -165 60 L -165 100 M 165 60 L 165 100");
  const ca = P3.cylinder(a, "s3-v-ca");
  const s = G3(r.sym, 858 - 65 * 0.9, r.cy - 22, 0.9);
  L3(s, "M -128 44 L -128 80 M 128 44 L 128 80");
  const cs = S3.cyl(s, "s3-v-cs");
  H.e3rowText(r, [["กระบอกสูบ ", K3.ink], ["Hydraulic cylinder", K3.blue]], "ลูกสูบ (Piston) + ก้านสูบ (Rod)", "สี่เหลี่ยม + ลูกสูบ + ก้านสูบ");
  H.e3rowOn(r, b + T.cues[2]);
  const t1 = at(3, 0.3), t2 = at(3, 0.6), t3 = at(3, 0.82);
  flash3([H.e3ring(a, -192, -54, 384, 108, 0.82), H.e3ring(s, -182, -42, 364, 84, 0.9)], t1, t2 - t1 - 0.4);
  flash3([H.e3ring(a, -138, -40, 34, 80, 0.82), H.e3ring(s, -126, -40, 32, 80, 0.9)], t2, 0.8);
  const ext = 70, dur = 1.3;
  tl.fromTo([ca.rod, cs.rod], { x: 0 }, { x: ext, duration: dur, ease: "power2.inOut" }, t3);
  tl.fromTo(ca.ch, { opacity: 0, attr: { width: ca.chW } }, { opacity: 0.85, attr: { width: ca.chW + ext }, duration: dur, ease: "power2.inOut" }, t3);
  tl.fromTo(cs.ch, { opacity: 0, attr: { width: cs.chW } }, { opacity: 0.85, attr: { width: cs.chW + ext }, duration: dur, ease: "power2.inOut" }, t3);
}
