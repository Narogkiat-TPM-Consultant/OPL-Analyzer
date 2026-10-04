// The pump in the hydraulic unit (series drawing from OPL 5-A-2): the pump gives pressure to the oil that is
// sent to every part of the circuit. Pump highlighted with seg 1; the oil flows and the cylinder moves.
const U = H.hydUnit("s2-v-unit", "s2-v-u");
const c = T.cues;
tl.fromTo(U.rotor, { rotation: 0, svgOrigin: U.origin.rotor }, { rotation: 360 * Math.round((D - c[0]) * 1.2), duration: D - c[0], ease: "none" }, b + c[0]);
H.hydFlow(U.flows, b + c[0] + 2.2, D - c[0] - 2.2);
tl.fromTo(U.rod, { x: 0 }, { x: 45, duration: 1.8, ease: "power2.inOut" }, b + c[0] + 3.4);
// highlight ring + tag on the pump
const hl = H.el("g", { id: "s2-v-ring", opacity: 0 }, "s2-v-hl");
H.el("circle", { cx: 475, cy: 461, r: 62, fill: "none", stroke: HC.blue, "stroke-width": 7, "stroke-dasharray": "16 10" }, hl);
H.el("rect", { x: 494, y: 526, width: 140, height: 38, rx: 9, fill: HC.blue }, hl);
H.text(hl, 564, 553, "Vane pump", { size: 24, fill: "#ffffff", anchor: "middle" });
tl.fromTo(hl, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + c[0] + 0.3);
tl.fromTo(hl, { scale: 1, svgOrigin: "475 461" }, { scale: 1.06, svgOrigin: "475 461", duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, b + c[0] + 0.5);
