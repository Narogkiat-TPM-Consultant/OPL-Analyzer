// OK (OPL 5'-C-4 Fig 3): ① binder — tighten carefully, leave ample room; ② lock band — right size and number of
// tubes, no substitutes; ③ a band made for tube binding, matched to the binding condition. Panels light up with
// their narration segment; the tubes stay round in every one.
const art = H.$("s5-v-art"), P = T.points, f = H.f;
const panels = [12, 374, 736].map((x, i) => {
  const g = H.el("g", { transform: `translate(${x} 12)`, opacity: 0.28 }, art);
  H.el("rect", { x: 0, y: 0, width: 352, height: 616, rx: 18, fill: AT.paper, stroke: "#a6d3b8", "stroke-width": 3 }, g);
  H.atBadge(g, 36, 40, i + 1, { fill: AT.pipe });
  return g;
});
panels.forEach((g, i) => H.atOp(g, 0.28, 1, b + P[i], 0.35));
const title = (g, s) => H.text(g, 68, 50, s, { size: 28, fill: AT.ink });
const ok = (g, y, s, col = AT.green) => H.text(g, 176, y, s, { size: 27, anchor: "middle", fill: col });

// ① binder: tie pulled until snug, then stopped with room left; tubes stay round
{
  const g = panels[0], t0 = b + P[0];
  title(g, "Binder (เคเบิลไทร์)");
  const X = H.atXsec(H.atG(g, 176, 300, 0.95), 0, 0, { q: 0, slack: 30, tail: 22, room: true });
  X.run(0, 0.45, t0 + 0.7, 1.1);
  tl.fromTo(X.room, { opacity: 0 }, { opacity: 0.35, duration: 0.4, immediateRender: false }, t0 + 1.9);
  ok(g, 512, "เผื่อระยะ (Ample room)");
  ok(g, 556, "สายยังกลม ไม่บุบ", AT.muted);
  H.atCheck(g, 312, 40, 1.1, t0 + 2.2);
}

// ② lock band: fits the tube size and count; a substitute (wire) is crossed out
{
  const g = panels[1], t0 = b + P[1];
  title(g, "Lock band");
  const C = H.atClip(g, 132, 236, "ok", { id: "s5-v-c" });
  C.run(0, 1, t0 + 0.6, 0.9);
  ok(g, 380, "ตรงขนาด · ตรงจำนวน");
  const sub = H.el("g", { opacity: 0 }, g);
  H.atSubst(sub, 96, 486, 0.82, "s5-v-no");
  H.atLabel(sub, 158, 476, "ของทดแทน", { size: 27, fill: AT.red });
  H.atLabel(sub, 158, 512, "(Substitute)", { size: 22, fill: AT.muted });
  H.atOp(sub, 0, 1, t0 + 2.0, 0.3);
  H.atCheck(g, 312, 40, 1.1, t0 + 1.6);
}

// ③ band made for tube binding: the two halves close round the tubes, each in its own pocket
{
  const g = panels[2], t0 = b + P[2];
  title(g, "Band เฉพาะสายลม");
  const Hd = H.atHolder(g, 176, 290, { n: 3, r: 30, sp: 78 });
  tl.fromTo(Hd.top, { y: -64 }, { y: 0, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t0 + 0.7);
  gsap.set(Hd.top, { y: -64 });
  ok(g, 446, "เลือกให้ตรง");
  ok(g, 490, "สภาพการรัด");
  ok(g, 556, "สายกลม ไม่ถูกบีบ", AT.muted);
  H.atCheck(g, 312, 40, 1.1, t0 + 1.6);
}
