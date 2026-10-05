// Safety: warning triangle with a filter bowl that jolts off its head under residual pressure (burst lines).
{
  const g = H.$("s5-v-icon");
  const K = "#121417";
  H.el("path", { d: "M150 40 L285 300 L15 300 Z", fill: "#f2a900", stroke: "#f2a900", "stroke-width": 18, "stroke-linejoin": "round" }, g);
  // filter head (fixed) with IN / OUT stubs
  H.el("rect", { x: 106, y: 150, width: 88, height: 26, rx: 4, fill: K }, g);
  H.el("rect", { x: 94, y: 156, width: 14, height: 14, fill: K }, g);
  H.el("rect", { x: 192, y: 156, width: 14, height: 14, fill: K }, g);
  // bowl (moves) with its drain at the bottom
  const bowl = H.el("g", { id: "s5-v-bowl" }, g);
  H.el("path", { d: "M 116 180 L 184 180 L 180 252 Q 150 276 120 252 Z", fill: K }, bowl);
  H.el("rect", { x: 144, y: 264, width: 12, height: 16, fill: K }, bowl);
  // burst lines at the joint
  const burst = H.el("path", { id: "s5-v-burst", d: "M 104 182 L 82 190 M 108 194 L 90 210 M 196 182 L 218 190 M 192 194 L 210 210", fill: "none", stroke: K, "stroke-width": 7, "stroke-linecap": "round", opacity: 0 }, g);
  const n = Math.max(2, Math.round((D - 0.9) / 0.9));
  for (let i = 0; i < n; i++) {
    const t = b + 0.5 + i * 0.9;
    tl.fromTo(bowl, { y: 0, rotation: 0, svgOrigin: "150 180" }, { y: 18, rotation: i % 2 ? -5 : 5, svgOrigin: "150 180", duration: 0.12, ease: "power3.out", immediateRender: i === 0 }, t);
    tl.fromTo(bowl, { y: 18, rotation: i % 2 ? -5 : 5, svgOrigin: "150 180" }, { y: 0, rotation: 0, svgOrigin: "150 180", duration: 0.4, ease: "power2.inOut", immediateRender: false }, t + 0.3);
    tl.fromTo(burst, { opacity: 0 }, { opacity: 1, duration: 0.06, immediateRender: i === 0 }, t);
    tl.fromTo(burst, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, t + 0.25);
  }
}
