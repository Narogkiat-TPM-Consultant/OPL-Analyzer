// Title: the vane pump turns counter-clockwise; one pump chamber (deep oil colour) is carried from the
// intake (bottom) to the discharge (top) while oil flows in and out of the ports.
const P = H.vanePump("s1-v-pump", "s1-v-p", { x: 380, y: 310, s: 1 });
const w = 46; // degrees per second; the chamber starts lower left (175°) and reaches the top near the end
H.vpSpin(P, b, b + D, (t) => 152.5 - w * (t - b));
tl.fromTo(P.chamber, { opacity: 0 }, { opacity: 1, duration: 0.4 }, b + 0.3);
H.vpFlow(P.flowIn, P.headIn, b + 0.6, D - 0.6);
H.vpFlow(P.flowOut, P.headOut, b + 0.6, D - 0.6);
