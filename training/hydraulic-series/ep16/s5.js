// Check 2 — cleaning is inspection. The machine is stopped and dusty. A rag wipes the tank wall (the dust clears
// behind it and uncovers an oil streak → ring, oil on the rag), then the floor around the machine (oil puddle →
// ring), then the cylinder rod (dirt specks → ring, dirt on the rag, rod wiped clean). Chips 1–3 name the spots
// with the narration cues.
{
  const S = H.k16Unit("s5-v-unit", "s5-v-u", { dust: true, dirty: true, labels: ["pump", "motor"] });
  const fx = H.$("s5-v-fx");
  const c = T.cues;
  const rag = H.k16Rag(fx, "s5-v-rag", { s: 1.15 });

  // 1 — tank wall: zig-zag wipe left → right; the dust edge follows the rag
  const tA = b + c[0] + 0.9, tB = b + c[1] + Math.max(1.0, Math.min(1.6, (c[2] - c[1]) * 0.7));
  const u = (t) => H.k16Clamp((t - tA) / (tB - tA));
  const front = (t) => 43 + 464 * u(t);
  const xs = (t) => 60 + 440 * u(t);
  const ys = (t) => 480 + 58 * Math.sin(2 * Math.PI * 3.5 * u(t));
  tl.fromTo(rag.g, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tA - 0.3);
  H.k16Fn(S.dclip, "x", front, tA - 0.3, tB, { attr: true, ir: true });
  H.k16Fn(S.dclip, "width", (t) => 507 - front(t), tA - 0.3, tB, { attr: true, ir: true });
  const tPass = tA + ((350 - 43) / 464) * (tB - tA);
  tl.fromTo(rag.oil, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tPass);
  H.k16Ring(fx, "s5-v-r1", 340, 452, 36, 68, Math.max(tPass, b + c[1]) + 0.15, { n: 2 });
  const ch1 = H.k16Chip(fx, "s5-v-c1", 172, 479, "ถังน้ำมัน", { anchor: "middle", num: 1, size: 24 });
  tl.fromTo(ch1, { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + c[1] + 0.1);

  // 2 — floor around the machine
  const t2 = b + c[2];
  const fA = t2 + 0.35, fB = Math.min(t2 + 1.8, b + c[3] - 0.5);
  const fxs = (t) => 598 + 46 * Math.sin(2 * Math.PI * 1.5 * H.k16Clamp((t - fA) / (fB - fA)));
  const ring2 = H.k16Ring(fx, "s5-v-r2", 598, 590, 92, 26, t2 + 0.3, { n: 2 });
  const ch2 = H.k16Chip(fx, "s5-v-c2", 740, 610, "พื้นรอบเครื่อง", { anchor: "start", num: 2, size: 22 });
  H.el("line", { x1: 690, y1: 598, x2: 740, y2: 606, stroke: K6.ink, "stroke-width": 3 }, ch2);
  tl.fromTo(ch2, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t2 + 0.1);
  tl.fromTo(rag.oil, { scale: 1, svgOrigin: "-10 12" }, { scale: 1.15, svgOrigin: "-10 12", duration: 0.8, immediateRender: false }, fA + 0.3);

  // 3 — sliding area: cylinder rod
  const t3 = b + c[3];
  const rA = t3 + 0.6, rB = Math.min(t3 + 2.4, b + D - 1.3);
  const rxs = (t) => 985 - 46 * Math.cos(2 * Math.PI * 1.5 * H.k16Clamp((t - rA) / (rB - rA)));
  H.k16Ring(fx, "s5-v-r3", 983, 392, 72, 30, t3 + 0.25, { n: 2 });
  const ch3 = H.k16Chip(fx, "s5-v-c3", 1084, 318, "ก้านสูบ", { anchor: "end", num: 3, size: 24 });
  tl.fromTo(ch3, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t3 + 0.1);
  tl.to(S.dirt, { opacity: 0, duration: rB - rA, ease: "power1.in" }, rA);
  tl.fromTo(rag.dirt, { opacity: 0 }, { opacity: 1, duration: 0.6 }, rA + 0.3);

  // rag path through the three spots (one x and one y function of time → seekable)
  const X = (t) => {
    if (t <= tB) return xs(t);
    if (t < fA) return 500 + (598 - 500) * H.k16Clamp((t - tB) / Math.max(0.2, fA - tB));
    if (t <= fB) return fxs(t);
    if (t < rA) return 598 + (939 - 598) * H.k16Clamp((t - fB) / Math.max(0.2, rA - fB));
    if (t <= rB) return rxs(t);
    return rxs(rB) + (880 - rxs(rB)) * H.k16Clamp((t - rB) / 0.6);
  };
  const Y = (t) => {
    if (t <= tB) return ys(t);
    if (t < fA) return ys(tB) + (566 - ys(tB)) * H.k16Clamp((t - tB) / Math.max(0.2, fA - tB));
    if (t <= fB) return 566;
    if (t < rA) return 566 + (392 - 566) * H.k16Clamp((t - fB) / Math.max(0.2, rA - fB));
    if (t <= rB) return 392;
    return 392 + (482 - 392) * H.k16Clamp((t - rB) / 0.6);
  };
  H.k16Fn(rag.g, "x", X, tA - 0.3, rB + 0.7, { ir: true });
  H.k16Fn(rag.g, "y", Y, tA - 0.3, rB + 0.7, { ir: true });
}
