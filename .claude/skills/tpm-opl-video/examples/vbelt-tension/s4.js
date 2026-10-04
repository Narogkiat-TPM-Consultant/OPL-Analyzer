// Deflection method: span dimension → gauge presses mid-span → belt deflects → δ marker.
// Times line up with the points' `at` values in spec.json (1.2 / 2.8 / 4.8).
const g = H.beltGeom(240, 400, 110, 860, 160);
H.drive("s4-v-pulleys", "s4-v-belt", g, 0, "s4-v");
const SAG = 46, f = H.f;
const [tx1, ty1] = g.t1, [tx2, ty2] = g.t2;
const mx = (tx1 + tx2) / 2, my = (ty1 + ty2) / 2;
H.set("s4-v-ghost", { d: `M ${f(tx1)} ${f(ty1)} L ${f(tx2)} ${f(ty2)}` });
const off = 105, dy1 = ty1 - off, dy2 = ty2 - off;
H.set("s4-v-ext1", { x1: f(tx1), y1: f(ty1 - 18), x2: f(tx1), y2: f(dy1 - 14) });
H.set("s4-v-ext2", { x1: f(tx2), y1: f(ty2 - 18), x2: f(tx2), y2: f(dy2 - 14) });
H.set("s4-v-dim", { d: H.dimD(tx1, dy1, tx2, dy2, 22) });
H.set("s4-v-tlabel", { x: f(tx1 + (tx2 - tx1) * 0.28), y: f(dy1 + (dy2 - dy1) * 0.28 - 18) });
const gy = my - 49; // top of the gauge tip; the tip point touches the belt at rest
H.set("s4-v-gbody", { x: f(mx - 28), y: f(gy - 150) });
H.set("s4-v-gwin", { x: f(mx - 17), y: f(gy - 130) });
H.set("s4-v-gtip", { d: `M ${f(mx - 18)} ${f(gy)} L ${f(mx + 18)} ${f(gy)} L ${f(mx + 5)} ${f(my - 9)} L ${f(mx - 5)} ${f(my - 9)} Z` });
H.set("s4-v-flabel", { x: f(mx + 46), y: f(gy - 70) });
const ax = mx + 70;
H.set("s4-v-darrow", { d: `M ${f(mx + 24)} ${f(my + SAG)} L ${f(ax + 16)} ${f(my + SAG)} ` + H.dimD(ax, my, ax, my + SAG, 12) });
H.set("s4-v-dlabel", { x: f(ax + 20), y: f(my + SAG / 2 + 15) });
const Ld = H.len("s4-v-dim");
tl.fromTo(["#s4-v-ext1", "#s4-v-ext2"], { opacity: 0 }, { opacity: 1, duration: 0.25 }, b + 1.35);
tl.fromTo("#s4-v-dim", { strokeDasharray: Ld, strokeDashoffset: Ld }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, b + 1.45);
tl.fromTo("#s4-v-tlabel", { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + 2.0);
tl.fromTo("#s4-v-gauge", { y: -110, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, b + 3.0);
tl.fromTo("#s4-v-ghost", { opacity: 0 }, { opacity: 0.9, duration: 0.2 }, b + 3.6);
tl.fromTo("#s4-v-belt", { attr: { d: H.beltD(g, 0) } }, { attr: { d: H.beltD(g, SAG) }, duration: 0.9, ease: "power2.inOut" }, b + 3.7);
tl.to("#s4-v-gauge", { y: SAG, duration: 0.9, ease: "power2.inOut" }, b + 3.7);
tl.fromTo("#s4-v-delta", { opacity: 0 }, { opacity: 1, duration: 0.3 }, b + 5.0);
tl.fromTo("#s4-v-dlabel", { scale: 0.4, transformOrigin: "0% 50%" }, { scale: 1, transformOrigin: "0% 50%", duration: 0.35, ease: "back.out(2.5)" }, b + 5.1);
