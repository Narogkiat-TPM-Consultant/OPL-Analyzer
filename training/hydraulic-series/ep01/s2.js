// Three functional groups light up with the narration (cues 2-4).
const U = H.hydUnit("s2-v-unit", "s2-v-u");
const G = H.hydGroups("s2-v-grp", "s2-v-h");
const c = T.cues;
G.forEach((id, k) => tl.fromTo(`#${id}`, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[k + 1]));
// ① pressure source: pump turns, oil starts to flow
tl.fromTo(U.rotor, { rotation: 0, svgOrigin: U.origin.rotor }, { rotation: 360 * Math.round((D - c[1]) * 1.5), duration: D - c[1], ease: "none" }, b + c[1]);
H.hydFlow(U.flows, b + c[1] + 0.8, D - c[1] - 0.8);
// ② control: the direction-valve lever shifts
tl.fromTo(U.lever, { rotation: 0, svgOrigin: U.origin.lever }, { rotation: 28, duration: 0.6, ease: "back.out(2)" }, b + c[2] + 1.0);
// ③ actuator: cylinder pushes the slide table
tl.fromTo(U.rod, { x: 0 }, { x: 45, duration: 1.8, ease: "power2.inOut" }, b + c[3] + 0.8);
