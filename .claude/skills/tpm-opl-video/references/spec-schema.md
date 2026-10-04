# OPL spec schema (`spec.json`)

`build_opl.mjs` reads this file and writes the HyperFrames `index.html`. Paths in `js_file` are relative to
the spec file. A complete working example: `examples/vbelt-tension/spec.json`.

## Contents
1. Top level
2. Text markup
3. Visual slots (`svg`)
4. Scene types — title, compare, alert, diagram, judgment, checklist, whywhy, result, outro
5. Custom animation: `js_file` / `js` and `anim`
6. Sound
7. IDs

## 1. Top level

```json
{
  "opl_type": "basic",                       // basic | trouble | kaizen
  "form": { "no": "AM-L2-015", "date": "2026-10-04", "author": "สมชาย", "approver": "วิชัย",
            "machine": "Line 2 · Mixer M-03", "pillar": "AM" },   // all optional; missing → "—" in outro
  "title": { "line1": "การตรวจ", "line2": "V-belt Tension", "sub": "ความตึงสายพานตัววี — ตรวจให้ถูกวิธี" },
  "scenes": [ { "type": "...", ... } ],
  "outro": { "tag": "...", "standard": "...", "yokoten": "..." }   // or false to drop the outro
}
```

A `title` scene is inserted first and an `outro` scene last if you don't write them. Write the title scene
yourself when it needs a visual (`svg` + `js_file`); its text always comes from top-level `title`.

Every scene accepts: `type`, `duration` (seconds, optional — normally derived from structure and text length),
`js_file` / `js`, `anim`, `sfx`, and `caption` (small note bottom-left, e.g. "* ภาพจำลอง",
"* วิธีปฏิบัติเป็นข้อเสนอ — ให้หัวหน้างานยืนยัน").

Optional top-level `"js_lib": "lib.js"` (or a list of files): shared JavaScript that runs once before scene 1
(see § 5).

Narration (voice-over) fields:
- top level `"voice": { "name": "th-TH-PremwadeeNeural", "rate": "+0%" }` and `"target_duration": 75`
- any scene: `"narration": "…"` or `["segment 1", "segment 2", …]`; for the automatic title use
  `title.narration`, for the automatic outro `outro.narration`
- elements that support `at` also accept `"cue": k` — appear 0.1 s after narration segment k starts
  (points, callout, compare left/right/banner, judgment cards/banner, checklist items, whys, result metrics,
  anim entries; plus `note_cue`, `root_cue`)
- the scene lasts at least until its narration ends (+0.8 s); segments start 0.5 s into a scene
  (1.2 s in the title) with 0.3 s between them

### When things appear (seconds from scene start)

Use these to line custom animation up with the generated layout; every `at` override is optional.

| Scene | Element | Default time | Override |
|---|---|---|---|
| all | heading | 0.05 | — |
| title | visual / OPL stamp / title lines / sub / type chip | 0.15 / 0.4 / 0.6 / 1.25 / 1.6 | — |
| compare | left card, its bullets | 0.5, +0.4 then every 0.3 | `left.at` |
| compare | right card, its bullets | max(1.8, left + 0.6 + 0.3·n_left), +0.4 then every 0.3 | `right.at` |
| compare | banner | max(duration − 1.4, after right bullets) | `banner.at` |
| alert | icon / pre / big / note / lock click | 0.08 / 0.25 / 0.4 / 0.85 / 1.07 | — |
| diagram | visual; points | 0.3; from 1.2, spread over the scene | point `at`, `callout.at` |
| judgment | cards; stamps | 0.2; 0.8, 1.6, 2.4 … | card `at`, `banner.at` |
| checklist | items; note | 0.5, 0.9, 1.3 …; after items + 0.3 | — |
| whywhy | phenomenon; whys; root | 0.4; 1.1 + i·gap; after whys + 0.2 | why `at`, `gap` |
| result | metric i: row, before bar, after bar, % | 0.5 + 1.3·i, +0.1, +0.5, +0.95 | — |

## 2. Text markup

All text fields accept `**blue emphasis**` and `!!red key point!!`. Plain text otherwise (HTML is escaped).
Use red once per scene at most (70:25:5).

## 3. Visual slots (`svg`)

Either an object or a full `<svg …>` string:

```json
"svg": { "viewBox": "0 0 1100 640", "body": "<g id=\"s4-v-pulleys\"></g><path id=\"s4-v-belt\" class=\"belt\"/>" }
```

Inside JSON strings, write SVG attributes with single quotes — `<g id='s4-v-pulleys'></g>` — to avoid
escaping every `"`. The SVG is scaled to fit its slot (`xMidYMid meet`). Use a viewBox with the slot's aspect ratio
(see svg-kit.md § Slots). Inside `body` you may use the CSS classes `belt`, `belt-run`, `pulley-*`,
`svg-label` and `<image href="assets/…">` for photos copied into the project's `assets/`.

## 4. Scene types

### title
```json
{ "type": "title", "svg": { "viewBox": "0 0 800 560", "body": "…" }, "js_file": "s1.js" }
```
Without `svg` it shows a large 一点 mark. Shows OPL stamp, `title.line1` (ink), `title.line2` (blue),
`title.sub`, and the OPL-type chip.

### compare — two cards side by side
```json
{ "type": "compare", "heading": "ทำไมต้องตรวจ **V-belt Tension**?",   // optional: "left"/"right"/"banner" take "at"
  "left":  { "tone": "ng", "title": "หย่อนเกินไป", "svg": {…}, "bullets": ["…", "…", "…"] },
  "right": { "tone": "ng", "title": "ตึงเกินไป",  "svg": {…}, "bullets": ["…"] },
  "banner": { "text": "ทั้ง 2 แบบ → !!นำไปสู่ Breakdown!!", "tone": "ink" } }
```
`tone`: `ng` (red title + red top bar), `ok` (green), `before` (grey bar + BEFORE tag), `after`
(green bar + AFTER tag), `neutral`. `tag` overrides the corner tag text. Banner `tone`: `ink` (default;
red/blue markup shows yellow), `ng`, `ok`. Card visual slot ≈ 760×240 px.

### alert — dark safety switch
```json
{ "type": "alert", "icon": "lock", "pre": "ก่อนตรวจทุกครั้ง", "big": "หยุดเครื่อง + LOTO",
  "note": "Lock-Out / Tag-Out · ห้ามเอามือเข้าใกล้สายพานขณะเครื่องเดิน" }
```
`icon`: `lock` (shackle snaps shut + click), `warning` / `stop` (alarm sound); or give `svg` (viewBox ≈ 300×360)
— then neither the lock animation nor the alarm plays, so add your own with `js_file` / `"sfx"`.
Keep `big` ≤ ~18 characters.

### diagram — the main teaching scene
```json
{ "type": "diagram", "heading": "วิธีตรวจ: วัดระยะยุบ δ **(たわみ Tawami = ระยะยุบตัว)**",
  "svg": { "viewBox": "0 0 1100 640", "body": "…" },
  "points": [ { "text": "วัดระยะ **Span (t)** …", "at": 1.2 }, "กดกึ่งกลาง Span …", "…" ],
  "numbered": true,
  "callout": { "label": "เกณฑ์ทั่วไป (General rule)", "value": "δ ≈ 1.6 mm ต่อ Span 100 mm",
               "example": "ตัวอย่าง: t = 500 mm → δ ≈ 8 mm", "at": 5.8 },
  "caption": "* ภาพขยายระยะยุบเกินจริงเพื่อให้เห็นชัด" }
```
With `points` or `callout`: visual 1100×640 left + panel right. Without both: full-width visual 1760×740.
`points` items are strings or `{text, at}`; `at` (seconds from scene start) pins when a point lights up —
set it when your animation must line up with the point. `numbered: false` gives bullets (good for
phenomena). Numbered points start dimmed and light up in turn.

### judgment — OK / NG cards
```json
{ "type": "judgment", "heading": "ตัดสินผล: เทียบ **δ** กับเกณฑ์",
  "cards": [ { "label": "หย่อน", "verdict": "NG", "cond": "δ มากกว่าเกณฑ์", "act": "→ ปรับตั้งให้ตึงขึ้น แล้ววัดซ้ำ", "svg": {…} },
             { "label": "พอดี", "verdict": "OK", "cond": "δ อยู่ในเกณฑ์", "act": "→ บันทึกผลลง Check Sheet", "svg": {…} } ],
  "banner": { "text": "…", "tone": "ink" } }
```
2–4 cards. `verdict`: `OK` (green), `NG` (red), or anything else for a third "watch" level — e.g. `WATCH`,
`△`, `เฝ้าดู` (amber card, pop sound). The stamp sits beside the label, so labels can be long; keep them
≤ ~10 Thai characters anyway. Stamps hit 0.8 s apart (card `at` overrides; card `sfx` overrides the sound).
Card visual ≈ 490×190 (3 cards).

### checklist — a few related check points
```json
{ "type": "checklist", "heading": "ตรวจเพิ่มทุกครั้งที่วัด Tension",
  "items": [ { "title": "ผิวสายพานแตกร้าว / มันวาว (Glazing)", "sub": "พบแล้ว → แจ้งเปลี่ยนสายพาน", "svg": { "viewBox": "0 0 150 104", "body": "…" } } ],
  "note": "ค่าแรงกด F และเกณฑ์ δ ให้ยึดตามคู่มือเครื่อง / ตารางผู้ผลิตสายพาน" }
```
Items without `svg` get a numbered circle. 2–4 items.

### whywhy — trouble cases
```json
{ "type": "whywhy", "heading": "Why-Why: ทำไม Seal รั่ว?",
  "phenomenon": "น้ำรั่วที่ Mechanical Seal ปั๊ม P-101 (หยุดเครื่อง 45 นาที)",
  "whys": ["หน้า Seal สึกเป็นรอย", "ปั๊มเดินตัวเปล่า (Dry run)", "ระดับน้ำในถังต่ำกว่า Suction", "ไม่มีจุดตรวจระดับน้ำใน Check Sheet"],
  "root": "ไม่มี !!มาตรฐานตรวจระดับน้ำก่อน Start ปั๊ม!!",
  "svg": { "viewBox": "0 0 620 700", "body": "…" }, "gap": 0.85 }
```
3–5 whys. With `svg`: chain 1100 px left + visual right (≈ 620×700); without: full width. `gap` = seconds
between whys. A why can be an object `{ "text": "…", "tag": "流出 Why 1", "at": 4.2 }` — the tag replaces
"Why n", which is how to show the occurrence (発生 hassei) and outflow (流出 ryūshutsu) chains in one scene;
`phenomenon_tag` and `root_tag` rename the first and last rows.

### result — kaizen numbers
```json
{ "type": "result", "heading": "ผลลัพธ์หลังปรับปรุง",
  "metrics": [ { "label": "เวลาเปลี่ยนแม่พิมพ์", "before": 45, "after": 12, "unit": "นาที", "better": "lower" },
               { "label": "ของเสียต่อเดือน", "before": 120, "after": 30, "unit": "ชิ้น" } ],
  "note": "วัดผลเฉลี่ย 4 สัปดาห์หลังปรับปรุง" }
```
1–3 metrics; numbers must be the user's real data. `better`: `lower` (default) or `higher`. The change in %
is computed and shown; the build warns if a metric got worse.

### outro — automatic last scene
From top-level `outro`: `tag` (big closing line), `standard` (which standard/check sheet it links to),
`yokoten` (where else it applies). Always shows OPL No./date/author/approver from `form` and the
tracking-table reminder. Set top-level `"outro": false` to drop it.

## 5. Custom animation

### `js_lib` — code shared by all scenes
A top-level file (or list) run once inside the timeline build before scene 1. Declare drawing functions or
extend `H` there (`H.pumpSet = (parent, x, y) => { … }`); every scene's code can call them. Scene code itself
runs in its own block (`{ const b = …; … }`), so a `const` in one scene's file is not visible to another.

### `js_file` (preferred) / `js`
Plain JavaScript run inside the timeline build, before the scene's generated tweens. In scope:
- `tl` — the paused GSAP master timeline; add tweens at `b + t`
- `b` — this scene's start time in seconds
- `D` — this scene's duration in seconds
- `T.cues` — start time of each narration segment (seconds from scene start)
- `T` — when this scene's generated elements appear, seconds from scene start (don't redeclare it):
  compare `{left, right, banner}`, diagram `{points: [...], callout}`, judgment `{stamps: [...], banner}`,
  checklist `{items: [...]}`, whywhy `{phenomenon, whys: [...], root}`, result `{rows: [...]}`.
  Example: `tl.to("#s3-v-arm", { rotation: 30, svgOrigin: "200 300" }, b + T.right + 0.5);`
- `H` — helpers (svg-kit.md § Helpers), `gsap`

```js
// s4.js
const g = H.beltGeom(240, 400, 110, 860, 160);
H.drive("s4-v-pulleys", "s4-v-belt", g, 0, "s4-v");
tl.fromTo("#s4-v-belt", { attr: { d: H.beltD(g, 0) } }, { attr: { d: H.beltD(g, 46) }, duration: 0.9 }, b + 3.7);
```
Use it for geometry you compute (paths, positions) and for any tween that needs computed values. Recommended
route for any non-trivial visual: the spec's `svg.body` holds only placeholder groups
(`<g id="s3-v-unit"></g>`) and the js draws into them with `H.el` / helpers.

### `anim` (declarative, for simple tweens)
```json
"anim": [ { "t": "#s3-v-arrow", "at": 1.5, "dur": 0.4, "from": { "opacity": 0, "x": -30 }, "to": { "opacity": 1, "x": 0 }, "ease": "power2.out", "sfx": "pop" },
          { "t": "#s3-v-ring", "at": 2.0, "dur": 0.3, "to": { "scale": 1.3 }, "yoyo": true, "repeat": 3 } ]
```
`from` present → `fromTo`, absent → `to`. A second `fromTo` on the same target automatically gets
`immediateRender: false`. `repeat` must be finite.

## 6. Sound

Generated SFX are added automatically: whoosh at each scene start, thud for stamps/banners/root cause, pop
for each element, ok/ng for verdicts, tick for Why steps, alarm for warning/stop alerts. Add more per
scene with `"sfx": [["squeal", 1.1], ["alarm", 0.4]]` (seconds from scene start).
Names: `whoosh pop tick thud ok ng alarm squeal` (squeal = belt slip / abnormal noise).

## 7. IDs

Every `id` must be unique in the page; the build fails on duplicates. Prefix your SVG ids with the scene
id plus `-v-`: `s4-v-belt`, `s4-v-gauge`. Scene ids are `s1, s2, …` in order, counting the automatic title
(so if you omit the title scene, your first scene is `s2`). Generated ids use `sN-` + short names
(`h, vis, p1, co, a, b, ban, …`), which is why `-v-` keeps yours apart.
