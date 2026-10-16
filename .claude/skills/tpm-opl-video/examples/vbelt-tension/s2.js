// Loose belt flaps (top span sag oscillates); tight belt: bearing hot-spots pulse.
const g = H.beltGeom(95, 100, 52, 420, 72);
H.drive("s2-v-pl", "s2-v-belt-l", g, 30, "s2-v-l");
H.drive("s2-v-pr", "s2-v-belt-r", g, 0, "s2-v-r");
tl.fromTo("#s2-v-belt-l", { attr: { d: H.beltD(g, 18) } }, { attr: { d: H.beltD(g, 40) }, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 7 }, b + 1.05);
tl.fromTo(["#s2-v-hot1", "#s2-v-hot2"], { opacity: 0 }, { opacity: 1, duration: 0.2 }, b + 2.6);
tl.fromTo(["#s2-v-hot1", "#s2-v-hot2"], { scale: 0.8, transformOrigin: "50% 50%" }, { scale: 1.35, transformOrigin: "50% 50%", duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut", immediateRender: false }, b + 2.6);
