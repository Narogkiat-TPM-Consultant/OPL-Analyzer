// Operation check (p.40 Maintenance 2): count the drops in the window for 1 minute while the machine runs.
// All three cards run their minute together during cue 1 (1 min shown in 3.6 s); stamps follow the narration.
{
  const c = T.cues, t0 = b + c[0] + 0.6, M = 3.6;
  const card = (id, times) => {
    const g = H.$(id);
    const Dm = LU.miniDome(g, `${id}-dome`);
    LU.miniDrops(Dm, `${id}-dome`, times);
    const W = H.stopwatch(g, 252, 94, 56, { id: `${id}-w`, color: LU.pipe });
    tl.fromTo(W.ring, { strokeDashoffset: W.offset(0) }, { strokeDashoffset: W.offset(1), duration: M, ease: "none" }, t0);
    tl.fromTo(W.hand, { rotation: 0, svgOrigin: W.origin }, { rotation: W.rot(1), svgOrigin: W.origin, duration: M, ease: "none" }, t0);
    H.text(g, 252, 168, "1 นาที", { size: 22, anchor: "middle", fill: LU.muted, weight: 600 });
    LU.counter(g, `${id}-n`, 386, 104, times.map((t) => t + 0.37));
    H.text(g, 386, 146, "หยด", { size: 26, anchor: "middle", fill: LU.muted, weight: 600 });
  };
  card("s6-v-c1", Array.from({ length: 4 }, (_, k) => t0 + 0.3 + k * 0.9));
  card("s6-v-c2", Array.from({ length: 9 }, (_, k) => t0 + 0.15 + k * 0.38));
  card("s6-v-c3", []);
}
