      // Helpers available to scene `js` / `js_file` code as `H` (plus `tl` and the scene start `b`).
      // Everything here runs once before the timeline is built, so it stays deterministic.
      const SVGNS = "http://www.w3.org/2000/svg";
      const H = {
        f: (n) => (+n).toFixed(2),
        $: (id) => document.getElementById(id),
        el(tag, attrs, parent) {
          const n = document.createElementNS(SVGNS, tag);
          for (const k in attrs) n.setAttribute(k, attrs[k]);
          if (parent) (typeof parent === "string" ? document.getElementById(parent) : parent).appendChild(n);
          return n;
        },
        set(id, attrs) {
          const n = document.getElementById(id);
          for (const k in attrs) n.setAttribute(k, attrs[k]);
          return n;
        },
        len: (id) => document.getElementById(id).getTotalLength(),
        // Straight path with an arrowhead at (x2,y2).
        arrowD(x1, y1, x2, y2, head = 18) {
          const a = Math.atan2(y2 - y1, x2 - x1), f = H.f;
          const p = (da) => `${f(x2 - head * Math.cos(a + da))} ${f(y2 - head * Math.sin(a + da))}`;
          return `M ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)} M ${p(0.45)} L ${f(x2)} ${f(y2)} L ${p(-0.45)}`;
        },
        // Dimension line with arrowheads at both ends.
        dimD(x1, y1, x2, y2, head = 20) {
          return H.arrowD(x1, y1, x2, y2, head) + " " + H.arrowD(x2, y2, x1, y1, head).replace(/^M [^L]+L [^M]+/, "");
        },
        // Belt drive: two pulleys centred on one horizontal axis, exact external tangents.
        beltGeom(c1x, cy, r1, c2x, r2) {
          const phi = -Math.asin((r2 - r1) / (c2x - c1x));
          const s = Math.sin(phi), c = Math.cos(phi);
          return {
            c1x, c2x, cy, r1, r2,
            t1: [c1x + r1 * s, cy - r1 * c], t2: [c2x + r2 * s, cy - r2 * c],
            b1: [c1x + r1 * s, cy + r1 * c], b2: [c2x + r2 * s, cy + r2 * c],
          };
        },
        // Belt outline; `sag` = visual deflection of the top span at mid-span (same number
        // structure for every sag, so GSAP can tween attr:{d} between two sags).
        beltD(g, sag = 0) {
          const f = H.f, [x1, y1] = g.t1, [x2, y2] = g.t2;
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + 2 * sag;
          return `M ${f(x1)} ${f(y1)} Q ${f(mx)} ${f(my)} ${f(x2)} ${f(y2)} ` +
            `A ${g.r2} ${g.r2} 0 1 1 ${f(g.b2[0])} ${f(g.b2[1])} ` +
            `L ${f(g.b1[0])} ${f(g.b1[1])} A ${g.r1} ${g.r1} 0 0 1 ${f(x1)} ${f(y1)} Z`;
        },
        pulley(parent, cx, cy, r, id) {
          const g = H.el("g", { id }, parent), rr = r - 9, f = H.f;
          H.el("circle", { cx, cy, r: rr, class: "pulley-disk" }, g);
          H.el("circle", { cx, cy, r: f(rr * 0.72), class: "pulley-ring" }, g);
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2 + Math.PI / 4;
            H.el("circle", { cx: f(cx + Math.cos(a) * rr * 0.45), cy: f(cy + Math.sin(a) * rr * 0.45), r: f(rr * 0.12), class: "pulley-hole" }, g);
          }
          H.el("circle", { cx, cy, r: f(rr * 0.2), class: "pulley-hub" }, g);
          return g;
        },
        // Draw both pulleys into group `groupId` and set the belt path `beltId`. Returns [small, large].
        drive(groupId, beltId, g, sag, prefix) {
          const a = H.pulley(groupId, g.c1x, g.cy, g.r1, prefix + "-pa");
          const c = H.pulley(groupId, g.c2x, g.cy, g.r2, prefix + "-pb");
          H.set(beltId, { d: H.beltD(g, sag) });
          return [a, c];
        },
        // SVG text in the video font. o: { size, fill, anchor, weight, id }
        text(parent, x, y, str, o = {}) {
          const t = H.el("text", { x: H.f(x), y: H.f(y), class: "svg-label", "font-size": o.size || 32, fill: o.fill || "#1a1d21", "text-anchor": o.anchor || "start", "font-weight": o.weight || 800, ...(o.id ? { id: o.id } : {}) }, parent);
          t.textContent = str;
          return t;
        },
        // Arc path on a circle, angles in degrees clockwise from 3 o'clock (screen coordinates).
        arcD(cx, cy, r, a0, a1) {
          const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
          const [x0, y0] = p(a0), [x1, y1] = p(a1), f = H.f;
          return `M ${f(x0)} ${f(y0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(x1)} ${f(y1)}`;
        },
        // Dial gauge (pressure / temperature / level) with a green OK band — the classic AM visual control.
        // o: { id, min=0, max=10, ok:[lo,hi], value, ticks=5 (major intervals), minor=0 (minor ticks between
        //      majors), labelEvery=1, labelSize, unit, needleColor="#1a1d21",
        //      marks:[{ v, color="#d0233a", id }] (limit lines, e.g. "notify technician below 4.5") }
        // → { g, needle, rot(v), origin, band }   (band id = `${id}-ok`)
        // Animate: tl.to(G.needle, { rotation: G.rot(7.5), svgOrigin: G.origin, duration: 0.8 }, b + 1)
        gauge(parent, cx, cy, r, o = {}) {
          const min = o.min ?? 0, max = o.max ?? 10, id = o.id || "gauge", f = H.f;
          const ang = (v) => 135 + (270 * (v - min)) / (max - min);
          const sw = (k) => f(Math.max(2, r * k));
          const g = H.el("g", { id }, parent);
          H.el("circle", { cx, cy, r, fill: "#fffdf8", stroke: "#1a1d21", "stroke-width": sw(0.035) }, g);
          const band = o.ok ? H.el("path", { id: id + "-ok", d: H.arcD(cx, cy, r * 0.8, ang(o.ok[0]), ang(o.ok[1])), fill: "none", stroke: "#178a4e", "stroke-width": f(r * 0.14) }, g) : null;
          const major = o.ticks ?? 5, per = (o.minor ?? 0) + 1, steps = major * per, every = o.labelEvery ?? 1;
          for (let k = 0; k <= steps; k++) {
            const v = min + ((max - min) * k) / steps, a = (ang(v) * Math.PI) / 180, isMajor = k % per === 0;
            const r0 = isMajor ? 0.7 : 0.8;
            H.el("line", { x1: f(cx + Math.cos(a) * r * 0.9), y1: f(cy + Math.sin(a) * r * 0.9), x2: f(cx + Math.cos(a) * r * r0), y2: f(cy + Math.sin(a) * r * r0), stroke: "#1a1d21", "stroke-width": isMajor ? sw(0.022) : sw(0.012) }, g);
            if (isMajor && (k / per) % every === 0) {
              const ls = o.labelSize ?? Math.round(r * 0.16);
              H.text(g, cx + Math.cos(a) * r * 0.54, cy + Math.sin(a) * r * 0.54 + ls * 0.36, String(+v.toFixed(2)), { size: ls, anchor: "middle" });
            }
          }
          for (const m of o.marks || []) {
            const a = (ang(m.v) * Math.PI) / 180;
            H.el("line", { ...(m.id ? { id: m.id } : {}), x1: f(cx + Math.cos(a) * r * 0.64), y1: f(cy + Math.sin(a) * r * 0.64), x2: f(cx + Math.cos(a) * r * 0.96), y2: f(cy + Math.sin(a) * r * 0.96), stroke: m.color || "#d0233a", "stroke-width": sw(0.045), "stroke-linecap": "butt" }, g);
          }
          if (o.unit) H.text(g, cx, cy + r * 0.34, o.unit, { size: Math.round(r * 0.15), anchor: "middle", fill: "#59606a" });
          const needle = H.el("g", { id: id + "-needle" }, g);
          H.el("path", { d: `M ${f(cx - r * 0.12)} ${f(cy - r * 0.04)} L ${f(cx + r * 0.78)} ${cy} L ${f(cx - r * 0.12)} ${f(cy + r * 0.04)} Z`, fill: o.needleColor || "#1a1d21" }, needle);
          H.el("circle", { cx, cy, r: f(r * 0.08), fill: "#1a1d21" }, g);
          const origin = `${cx} ${cy}`;
          gsap.set(needle, { rotation: ang(o.value ?? min), svgOrigin: origin });
          return { g, needle, rot: ang, origin, band };
        },
        // Regular hexagon path (bolt/nut head), flat sides top and bottom.
        hexD(cx, cy, r) {
          const f = H.f;
          return Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 3) * i;
            return `${i ? "L" : "M"} ${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
          }).join(" ") + " Z";
        },
        // Bolt seen from above with a match mark (合いマーク): the mark runs from the head onto the base.
        // o: { id, mark = true, color = "#f2a900" } → { g, head, origin }.
        // Loosening: tl.to(B.head, { rotation: -25, svgOrigin: B.origin, duration: 0.6 }, b + 2) — the two halves split.
        bolt(parent, cx, cy, r, o = {}) {
          const id = o.id || "bolt", col = o.color || "#f2a900", f = H.f;
          const g = H.el("g", { id }, parent);
          H.el("circle", { cx, cy, r: f(r * 1.3), fill: "#c9c1ae", stroke: "#1a1d21", "stroke-width": 4 }, g);
          if (o.mark !== false) H.el("line", { x1: f(cx + r * 1.02), y1: cy, x2: f(cx + r * 1.75), y2: cy, stroke: col, "stroke-width": f(r * 0.22), "stroke-linecap": "butt" }, g);
          const head = H.el("g", { id: id + "-head" }, g);
          H.el("path", { d: H.hexD(cx, cy, r), fill: "#9aa1aa", stroke: "#1a1d21", "stroke-width": 4 }, head);
          H.el("circle", { cx, cy, r: f(r * 0.45), fill: "none", stroke: "#1a1d21", "stroke-width": 3, opacity: 0.5 }, head);
          if (o.mark !== false) H.el("line", { x1: f(cx + r * 0.2), y1: cy, x2: f(cx + r * 1.0), y2: cy, stroke: col, "stroke-width": f(r * 0.22), "stroke-linecap": "butt" }, head);
          return { g, head, origin: `${cx} ${cy}` };
        },
        // Stopwatch with a progress ring and a hand. o: { id, color = "#1f5fbf" } → { ring, hand, offset(frac), rot(frac), origin }.
        // Run to 80 %: tl.fromTo(W.ring, { strokeDashoffset: W.offset(0) }, { strokeDashoffset: W.offset(0.8), duration: 1.5, ease: "none" }, b + 1)
        //              tl.fromTo(W.hand, { rotation: 0, svgOrigin: W.origin }, { rotation: W.rot(0.8), svgOrigin: W.origin, duration: 1.5, ease: "none" }, b + 1)
        stopwatch(parent, cx, cy, r, o = {}) {
          const id = o.id || "watch", col = o.color || "#1f5fbf", f = H.f;
          const g = H.el("g", { id }, parent);
          H.el("rect", { x: f(cx - r * 0.14), y: f(cy - r * 1.28), width: f(r * 0.28), height: f(r * 0.24), rx: 4, fill: "#1a1d21" }, g);
          H.el("circle", { cx, cy, r, fill: "#fffdf8", stroke: "#1a1d21", "stroke-width": 8 }, g);
          const rr = r * 0.78, C = 2 * Math.PI * rr;
          const ring = H.el("circle", { id: id + "-ring", cx, cy, r: f(rr), fill: "none", stroke: col, "stroke-width": f(r * 0.22), "stroke-dasharray": f(C), "stroke-dashoffset": f(C), transform: `rotate(-90 ${cx} ${cy})` }, g);
          const hand = H.el("g", { id: id + "-hand" }, g);
          H.el("line", { x1: cx, y1: cy, x2: cx, y2: f(cy - r * 0.86), stroke: "#1a1d21", "stroke-width": 6, "stroke-linecap": "round" }, hand);
          H.el("circle", { cx, cy, r: f(r * 0.09), fill: "#1a1d21" }, g);
          return { g, ring, hand, origin: `${cx} ${cy}`, offset: (fr) => C * (1 - fr), rot: (fr) => 360 * fr };
        },
        // Prohibition sign (red ring + slash) to draw over an icon: "no tools", "do not adjust".
        noSign(parent, cx, cy, r, id) {
          const g = H.el("g", { id: id || "nosign" }, parent), f = H.f, d = r * 0.7071;
          H.el("circle", { cx, cy, r, fill: "none", stroke: "#d0233a", "stroke-width": f(r * 0.16) }, g);
          H.el("line", { x1: f(cx - d), y1: f(cy - d), x2: f(cx + d), y2: f(cy + d), stroke: "#d0233a", "stroke-width": f(r * 0.16) }, g);
          return g;
        },
      };

      // Load exactly the font subsets the page uses before building, so frame 0 never renders tofu.
      function loadFonts() {
        const txt = (document.getElementById("root").textContent || "").replace(/\s+/g, " ").slice(0, 20000) || "ก";
        return Promise.all([
          ...[400, 600, 800].map((w) => document.fonts.load(`${w} 40px "Noto Sans Thai"`, txt)),
          document.fonts.load(`700 40px "Noto Sans JP"`, txt),
        ]);
      }
