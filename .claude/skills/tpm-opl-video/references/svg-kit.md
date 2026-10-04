# SVG kit — drawing and animating OPL visuals

## Contents
1. Slots and viewBoxes
2. Palette
3. Helpers (`H`)
4. Animation patterns
5. Drawing common TPM subjects
6. Pitfalls (HyperFrames determinism rules)

## 1. Slots and viewBoxes

| Where | Slot (px) | Suggested viewBox |
|---|---|---|
| title visual | ≈ 760 × 620 | `0 0 800 560` |
| compare card | ≈ 760 × 240 | `0 0 520 190` (or `0 0 760 240` to fill) |
| alert icon | 300 × 360 | `0 0 300 360` |
| diagram, with points | 1100 × 640 | `0 0 1100 640` |
| diagram, full width | 1760 × 740 | `0 0 1760 740` |
| judgment card (3 cards) | ≈ 490 × 190 | `0 0 460 170` |
| checklist icon | 150 × 104 | `0 0 150 104` |
| whywhy visual | ≈ 620 × 700 | `0 0 620 700` |

Draw big and simple: lines ≥ 4 units, labels ≥ 28 units at these viewBoxes. The viewer is a few metres from a
screen beside a machine.

## 2. Palette (hex for SVG attributes)

| Use | Hex |
|---|---|
| ink (outlines, text) | `#1a1d21` |
| muted (dimension/extension lines, notes) | `#59606a` |
| metal (machine parts) | `#c9c1ae` |
| card / light fill | `#fffdf8` |
| paper (background) | `#f5f1e8` |
| blue (measurements, info) | `#1f5fbf` |
| green OK | `#178a4e` |
| red NG / the key spot — sparingly | `#d0233a` |
| yellow (caution, highlights on dark) | `#f2a900` |

## 3. Helpers (`H`, available in `js`/`js_file`)

| Helper | Returns / does |
|---|---|
| `H.$(id)` | element |
| `H.el(tag, attrs, parent)` | create an SVG element (parent = element or id) |
| `H.set(id, attrs)` | set attributes |
| `H.text(parent, x, y, str, {size, fill, anchor, weight, id})` | SVG text in the video font |
| `H.len(id)` | path length (for draw-on) |
| `H.f(n)` | number → 2-decimal string |
| `H.arrowD(x1,y1,x2,y2,head)` | path `d`: line with arrowhead at the end |
| `H.dimD(x1,y1,x2,y2,head)` | path `d`: dimension line, arrowheads both ends |
| `H.arcD(cx,cy,r,a0,a1)` | path `d`: arc, degrees clockwise from 3 o'clock |
| `H.beltGeom(c1x,cy,r1,c2x,r2)` | two-pulley drive geometry (exact tangents) — `t1,t2` top span ends, `b1,b2` bottom |
| `H.beltD(g, sag)` | belt outline; top span sags by `sag` at mid-span. Same structure for any sag → tweenable |
| `H.pulley(parent,cx,cy,r,id)` | pulley group (disk, ring, 4 holes, hub) |
| `H.drive(groupId, beltId, g, sag, prefix)` | both pulleys + belt; returns `[small, large]` pulley groups |
| `H.gauge(parent,cx,cy,r,{id,min,max,ok:[lo,hi],value,ticks,minor,labelEvery,labelSize,unit,needleColor,marks:[{v,color,id}]})` | dial gauge: green OK band (`${id}-ok`), major/minor ticks, red limit `marks` (e.g. "below 4.5 → call technician"), ink needle by default (red stays for the limit, 70:25:5); returns `{g, needle, rot(v), origin, band}` |
| `H.hexD(cx,cy,r)` | path `d`: hexagon (bolt/nut head) |
| `H.bolt(parent,cx,cy,r,{id,mark,color})` | bolt from above with a yellow match mark (合いマーク) across head and base; returns `{g, head, origin}` — rotate `head` to show loosening |
| `H.stopwatch(parent,cx,cy,r,{id,color})` | stopwatch with progress ring + hand; returns `{ring, hand, origin, offset(frac), rot(frac)}` — before/after time comparisons |
| `H.noSign(parent,cx,cy,r,id)` | red prohibition ring + slash to lay over an icon ("no tools", "do not adjust") |

## 4. Animation patterns (all seekable)

```js
// draw-on a path
const L = H.len("s2-v-pipe");
tl.fromTo("#s2-v-pipe", { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1 }, b + 0.5);

// rotate a part about its own centre (SVG needs svgOrigin in user units)
tl.fromTo(pulley, { rotation: 0, svgOrigin: "190 280" }, { rotation: 720, duration: 3, ease: "none" }, b);

// morph a shape: both paths must have identical command structure (use one builder function)
tl.fromTo("#s4-v-belt", { attr: { d: H.beltD(g, 0) } }, { attr: { d: H.beltD(g, 46) }, duration: 0.9 }, b + 3.7);

// gauge needle drifts out of the OK band
const G = H.gauge("s3-v-dial", 300, 300, 220, { id: "s3-v-g", min: 0, max: 10, ok: [5, 6], minor: 1,
  marks: [{ v: 4.5 }], value: 5.5, unit: "bar" });
tl.to(G.needle, { rotation: G.rot(4.1), svgOrigin: G.origin, duration: 1.2, ease: "power2.inOut" }, b + 2);

// pulse a red ring on the problem spot (finite repeat)
tl.fromTo("#s2-v-ring", { scale: 0.8, transformOrigin: "50% 50%" }, { scale: 1.3, transformOrigin: "50% 50%", yoyo: true, repeat: 5, duration: 0.3 }, b + 1);

// leak drops: move + fade, staggered, finite
tl.fromTo(".s2-v-drop", { y: 0, opacity: 1 }, { y: 120, opacity: 0, duration: 0.8, stagger: 0.25, repeat: 2 }, b + 1);
```

```js
// bolt loosens: match mark halves split
const B = H.bolt("s4-v-base", 300, 200, 60, { id: "s4-v-bolt" });
tl.to(B.head, { rotation: -28, svgOrigin: B.origin, duration: 0.7, ease: "power2.inOut" }, b + 2.4);

// stopwatches side by side, same scale: before 15 min (full), after 3 min (20 %)
const W1 = H.stopwatch("s5-v-a", 200, 160, 90, { id: "s5-v-w1", color: "#9aa1aa" });
const W2 = H.stopwatch("s5-v-b", 200, 160, 90, { id: "s5-v-w2", color: "#178a4e" });
tl.fromTo(W1.ring, { strokeDashoffset: W1.offset(0) }, { strokeDashoffset: W1.offset(1), duration: 2, ease: "none" }, b + 1);
tl.fromTo(W2.ring, { strokeDashoffset: W2.offset(0) }, { strokeDashoffset: W2.offset(0.2), duration: 0.4, ease: "none" }, b + 1);
```

Line timing up with the text: a diagram point with `"at": 2.8` should be followed by its motion at ~`b + 3.0`
(spec-schema.md § "When things appear" lists every generated element's time).

## 5. Drawing common TPM subjects

- **Cross-section** (bearing, seal, valve): draw the cut face with a hatch (`<pattern>` of diagonal lines),
  the moving part in metal, the problem spot circled red, flow with blue arrows.
- **Bolt + match mark** (合いマーク): hexagon (6-point polygon) + a short yellow line across bolt and base;
  NG = the two halves of the line offset by a rotation.
- **Level / sight glass**: rounded rect with green min–max band, liquid rect whose `height`/`y` tween.
- **Gauge**: `H.gauge` — show OK band, then needle inside (OK card) vs outside (NG card).
- **Lubrication point**: grease nipple (small dome + hex), arrow from grease gun, yellow paint mark (color code).
- **Belt / chain drive**: `H.drive`; chain = `belt` path with `stroke-dasharray` links.
- **Filter / strainer**: frame + mesh (`<pattern>` grid); clogged = dark overlay with opacity tween.
- **Photo of the real spot**: `<image href="assets/spot.jpg" x y width height preserveAspectRatio="xMidYMid slice"/>`
  then arrows/rings on top. Ask the user for the photo; it is the most convincing visual (rubric 3.2).

## 6. Pitfalls (HyperFrames determinism rules)

- Never `Date.now()`, `Math.random()` without a seed, network fetches, or `repeat: -1`.
- Don't put a CSS `transform` on an element you also move with GSAP (`x`, `y`, `scale`, `rotation`) — set
  start values in `fromTo` instead.
- Don't tween the scene `section` (it is a timed clip); animate elements inside it.
- When a second `fromTo` targets an element already tweened earlier, give it `immediateRender: false`
  (the declarative `anim` list does this for you).
- `transform`/`scale` on an inline `<span>` does nothing — use block elements (SVG elements are fine).
- `<text>` inside SVG: add `class="svg-label"` (or use `H.text`) so it uses Noto Sans Thai.
- A wrong `svgOrigin` makes parts orbit instead of spin — always snapshot mid-rotation.
- Morphing paths with different command lists jumps instead of tweening — build both from one function.
- Draw-on with `stroke-linecap: round` shows a dot at the start point before the line draws — use
  `butt` caps for draw-on lines, or fade the path in together with the draw.
- `svgOrigin` is in the coordinate system the element lives in: for an element inside a translated/rotated
  `<g>`, give the pivot in that group's local units (it works; just don't convert to page coordinates).
- Text you create in js (`H.text`, labels) is scanned by the build so its glyphs' font subsets load before
  frame 0; symbols outside Thai/Japanese/Latin (✓ ✗ ①) may still be missing from the fonts — draw them as paths.
- Intentional crops/close-ups (clip-path, a magnified half-dial) make `check` report `container_overflow` /
  `text_box_overflow`; mark the cropped group with `data-layout-allow-overflow`.
- Keep ≥ 12 units of margin inside the viewBox: text descenders and stroke caps near the edge get clipped,
  and `check` reports the overflow.
- SVG `<pattern>` fills (hatching for cut metal) show only their background colour in rendered frames —
  draw hatch lines explicitly (a clipped group of `<line>`s) instead.
