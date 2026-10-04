// Safety: flammable-material sign (flame in a warning triangle) flickers; caption lifted above the hazard stripe.
{
  const g = H.$("s4-v-icon");
  H.el("path", { d: "M150 40 L285 300 L15 300 Z", fill: "#f2a900", stroke: "#f2a900", "stroke-width": 18, "stroke-linejoin": "round" }, g);
  const fl = H.el("g", { id: "s4-v-flame" }, g);
  H.el("path", { d: H.flameD(150, 262, 56), fill: "#121417" }, fl);
  H.el("rect", { x: 90, y: 268, width: 120, height: 14, rx: 3, fill: "#121417" }, g);
  const n = Math.max(2, Math.round((D - 0.6) / 0.4));
  tl.fromTo(fl, { scaleY: 1, scaleX: 1, svgOrigin: "150 262" }, { scaleY: 1.1, scaleX: 0.94, svgOrigin: "150 262", duration: 0.2, ease: "sine.inOut", yoyo: true, repeat: n - (n % 2) }, b + 0.5);
  const cap = document.querySelector("#s4 .dg-cap");
  if (cap) cap.style.bottom = "96px";
}
