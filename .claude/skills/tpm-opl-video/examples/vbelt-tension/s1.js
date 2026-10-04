// Title visual: belt draws itself, pulleys turn (speed ratio = r2/r1).
const g = H.beltGeom(190, 280, 95, 590, 150);
const [pa, pb] = H.drive("s1-v-pulleys", "s1-v-belt", g, 0, "s1-v");
H.set("s1-v-run", { d: H.beltD(g, 0) });
const L = H.len("s1-v-belt");
tl.fromTo("#s1-v-belt", { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, b + 0.45);
tl.fromTo("#s1-v-run", { opacity: 0 }, { opacity: 0.85, duration: 0.3, immediateRender: false }, b + 1.4);
tl.fromTo("#s1-v-run", { strokeDashoffset: 0 }, { strokeDashoffset: -640, duration: 3.5, ease: "none" }, b);
tl.fromTo(pa, { rotation: 0, svgOrigin: `${g.c1x} ${g.cy}` }, { rotation: 900, duration: 3.5, ease: "none" }, b);
tl.fromTo(pb, { rotation: 0, svgOrigin: `${g.c2x} ${g.cy}` }, { rotation: 570, duration: 3.5, ease: "none" }, b);
