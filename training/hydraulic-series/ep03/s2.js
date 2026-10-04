// Power side: actual part → symbol, row by row with the narration; each named part is framed on both sides at once.
const R = H.e3table("s2-v-t", "s2-v");
const at = (k, f) => b + H.e3seg(T, D, k, f);
const flash2 = (els, t, hold) => els.forEach((e) => H.e3flash(e, t, hold));

// ---- row 1: oil tank + suction filter + air breather
{
  const r = R[0];
  const a = G3(r.act, 319, r.cy, 1);
  P3.tank(G3(a, 0, -20), 360, 110);
  pipe3(a, "M 60 14 L 60 -95");
  P3.filter(G3(a, 60, 50));
  P3.breather(G3(a, -130, -20));
  const s = G3(r.sym, 858, r.cy, 1);
  S3.tank(s, -170, 170, -10, 80);
  L3(s, "M -170 -10 L -122 -10");
  S3.breather(G3(s, -146, -10));
  S3.filter(G3(s, 60, 45));
  L3(s, "M 60 15 L 60 -92");
  H.e3rowText(r, [["ถังน้ำมัน ", K3.ink], ["Oil tank", K3.blue]], "Suction filter (ฟิลเตอร์ดูด) · Air breather", "เส้นรูปตัว U · ข้าวหลามตัด + เส้นประ");
  H.e3rowOn(r, b + T.cues[0]);
  const t1 = at(1, 0.1), t2 = at(1, 0.4), t3 = at(1, 0.85);
  flash2([H.e3ring(a, -190, -30, 380, 130), H.e3ring(s, -182, -22, 364, 112)], t1, t2 - t1 - 0.5);
  flash2([H.e3ring(a, 30, 4, 60, 84), H.e3ring(s, 22, 6, 76, 78)], t2, t3 - t2 - 0.5);
  flash2([H.e3ring(a, -166, -64, 72, 50), H.e3ring(s, -188, -72, 84, 70)], t3, Math.min(1.6, b + T.cues[1] - t3 - 0.6));
}

// ---- row 2: pump + motor (pump rotor turns from here on)
{
  const r = R[1];
  const a = G3(r.act, 319 - 91 * 1.2, r.cy + 21, 1.2);
  pipe3(a, "M 0 -42 L 0 -95");
  const pu = P3.pumpSet(a, "s2-v-pu");
  const s = G3(r.sym, 858 - 75, r.cy, 1.25);
  L3(s, "M 0 -36 L 0 -72 M 0 36 L 0 72");
  S3.pump(G3(s, 0, 0));
  S3.drive(G3(s, 60, 0));
  S3.motor(G3(s, 120, 0));
  const tri = H.el("path", { d: "M 0 -36 L -14 -12 L 14 -12 Z", fill: K3.blue, opacity: 0 }, s);
  H.e3rowText(r, [["ปั๊ม ", K3.ink], ["Hydraulic pump", K3.blue], [" + มอเตอร์", K3.ink]], "มอเตอร์หมุนปั๊ม (Motor → Pump)", "วงกลม+สามเหลี่ยมทึบชี้ออก · วงกลม+M");
  H.e3rowOn(r, b + T.cues[1]);
  const t1 = at(2, 0.02), t2 = at(2, 0.22), t3 = at(2, 0.62);
  flash2([H.e3ring(a, -42, -52, 84, 104, 1.2), H.e3ring(s, -46, -46, 92, 92, 1.25)], t1, t3 - t1 - 0.5);
  tl.fromTo(tri, { opacity: 0 }, { opacity: 1, duration: 0.2, yoyo: true, repeat: 3 }, t2);
  flash2([H.e3ring(a, 60, -60, 172, 118, 1.2), H.e3ring(s, 76, -46, 92, 92, 1.25)], t3, Math.min(2.0, b + T.cues[2] - t3 - 0.6));
  tl.fromTo(pu.rotor, { rotation: 0, svgOrigin: pu.origin }, { rotation: 360 * Math.round((D - T.cues[1]) * 1.2), svgOrigin: pu.origin, duration: D - T.cues[1], ease: "none" }, b + T.cues[1]);
}

// ---- row 3: relief valve + pressure gauge on its stop valve
{
  const r = R[2];
  const a = G3(r.act, 319 - 115, r.cy + 37, 1);
  pipe3(a, "M 52 0 L 270 0");
  pipe3(a, "M 0 34 L 0 62");
  P3.relief(G3(a, 0, 0));
  const gs = P3.gaugeStop(G3(a, 150, -26), "s2-v-gs");
  const s = G3(r.sym, 858 - 93, r.cy + 15, 1);
  L3(s, "M 40 8 L 270 8");
  L3(s, "M -40 8 L -64 8 L -64 72");
  S3.tank(s, -84, -44, 58, 76);
  S3.relief(G3(s, 0, 0), "s2-v-rv");
  L3(s, "M 170 -8 L 170 8");
  C3(s, 170, 8, 5, K3.ink, { sw: 0 });
  S3.stop(G3(s, 170, -27));
  S3.gauge(G3(s, 170, -76));
  H.e3rowText(r, [["Relief valve", K3.blue], [" วาล์วคุมแรงดัน", K3.ink]], "เกจวัดแรงดัน + Stop valve (วาล์วปิด-เปิดเกจ)", "กล่อง + ลูกศร + สปริง · วงกลม + ลูกศร");
  H.e3rowOn(r, b + T.cues[2]);
  const t1 = at(3, 0.02), t2 = at(3, 0.47);
  flash2([H.e3ring(a, -50, -110, 116, 152), H.e3ring(s, -52, -62, 144, 130)], t1, t2 - t1 - 0.5);
  flash2([H.e3ring(a, 82, -140, 112, 150), H.e3ring(s, 132, -114, 76, 112)], t2, 2.2);
  tl.fromTo(gs.needle, { rotation: 0, svgOrigin: gs.origin }, { rotation: 120, svgOrigin: gs.origin, duration: 0.8, ease: "power2.out" }, t2 + 0.2);
}
