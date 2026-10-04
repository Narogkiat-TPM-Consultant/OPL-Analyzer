// Title: the sign circuit of OPL 5-A-4 draws itself stroke by stroke, in oil order (tank → pump → valves → cylinder).
const C = H.signCircuit("s1-v-c", "s1-v-sc");
H.e3draw(C.g, b + 0.25, Math.max(2.5, D - 1.9), 0.45);
// at the end the cylinder rod pushes out once
tl.fromTo(C.cy.rod, { x: 0 }, { x: 110, duration: 0.9, ease: "power2.inOut" }, b + D - 1.3);
