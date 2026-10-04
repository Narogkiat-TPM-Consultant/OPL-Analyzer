// Alert icon: a circuit sheet with a magnifier moving over it ("read the circuit first").
const g = H.$("s5-v-ic");
H.el("rect", { x: 30, y: 36, width: 210, height: 270, rx: 14, fill: "#f5f1e8" }, g);
const ink = (d, w = 6) => H.el("path", { d, fill: "none", stroke: "#1a1d21", "stroke-width": w, "stroke-linejoin": "round" }, g);
ink("M 62 66 L 176 66 L 176 98 L 62 98 Z M 136 66 L 136 98 M 136 82 L 214 82");      // cylinder
ink("M 80 98 L 80 140 M 158 98 L 158 140");                                           // lines to valve
ink("M 56 140 L 182 140 L 182 176 L 56 176 Z M 98 140 L 98 176 M 140 140 L 140 176"); // 3-position valve
ink("M 110 176 L 110 214");
H.el("circle", { cx: 110, cy: 232, r: 18, fill: "none", stroke: "#1a1d21", "stroke-width": 6 }, g); // pump
H.el("path", { d: "M 110 214 L 102 228 L 118 228 Z", fill: "#1a1d21" }, g);
ink("M 110 250 L 110 276 M 58 262 L 58 284 L 210 284 L 210 262");                   // tank
const mg = H.el("g", { id: "s5-v-mg" }, g);
H.el("circle", { cx: 0, cy: 0, r: 50, fill: "rgba(242,169,0,0.16)", stroke: "#f2a900", "stroke-width": 13 }, mg);
H.el("path", { d: "M 36 36 L 80 80", stroke: "#f2a900", "stroke-width": 20, "stroke-linecap": "round" }, mg);
tl.fromTo(mg, { x: 170, y: 100 }, { x: 96, y: 160, duration: Math.min(1.6, D * 0.3), ease: "sine.inOut" }, b + 0.3);
tl.to(mg, { x: 150, y: 220, duration: Math.min(1.8, D * 0.35), ease: "sine.inOut" }, b + 0.3 + Math.min(1.6, D * 0.3));
