// Title: the unit runs — pump turns, oil flows, cylinder pushes the table.
const U = H.hydUnit("s1-v-unit", "s1-v-u");
tl.fromTo(U.rotor, { rotation: 0, svgOrigin: U.origin.rotor }, { rotation: 360 * Math.round(D * 1.5), duration: D, ease: "none" }, b);
H.hydFlow(U.flows, b + 0.6, D - 0.6);
tl.fromTo(U.rod, { x: 0 }, { x: 45, duration: 1.4, ease: "power2.inOut" }, b + 1.6);
