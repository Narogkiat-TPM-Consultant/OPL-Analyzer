---
name: tpm-opl-video
description: >
  สร้างวิดีโอ OPL (One Point Lesson / 一点レッスン) แบบ Motion Graphics ภาษาไทย เป็นไฟล์ MP4 1920×1080
  ตามแนวทาง JIPM ครบ 3 ประเภท — 基礎知識 ความรู้พื้นฐาน, トラブル事例 กรณีปัญหา, 改善事例 กรณีปรับปรุง —
  ด้วย HyperFrames (HTML + GSAP render เป็นวิดีโอ) พร้อม font ไทย/ญี่ปุ่น, เสียง SFX, ภาพกลไกเคลื่อนไหว,
  OK/NG, Why-Why, Before/After + กราฟผลลัพธ์ และ scene ปิดท้ายตามฟอร์ม OPL (No./ผู้จัดทำ/ผู้อนุมัติ/Tracking/Yokoten)
  ที่สอดคล้อง OPL Quality Rubric (S1–S6). ใช้ทันทีเมื่อผู้ใช้ต้องการ: ทำ VDO OPL, สร้างวิดีโอ OPL, แปลง OPL เป็นวิดีโอ,
  OPL animation, วิดีโอสอน Operator หน้างาน, คลิปสั้นสอนวิธีตรวจ/ปรับตั้ง/ทำความสะอาด/หล่อลื่น, วิดีโอ Trouble case
  หรือ Kaizen case สำหรับบอร์ด TPM/จอหน้าเครื่อง, 一点レッスン動画, "OPL MP4", "ทำคลิป OPL เรื่อง…" — แม้ผู้ใช้ไม่พูดคำว่า
  HyperFrames หรือ MP4 ก็ตาม ถ้าบริบทคือทำ OPL ให้เป็นภาพเคลื่อนไหว/วิดีโอ. ไม่ใช้สำหรับให้คะแนน OPL (ใช้ skill ประเมิน OPL)
  หรือทำ OPL แผ่นนิ่ง (ภาพ/สไลด์).
---

# TPM OPL Video

Turn one OPL topic into a 30–60 s Thai motion-graphics MP4 that an operator can learn from at the machine.
You write the *content* (an OPL spec in JSON, plus small SVG visuals); the bundled scripts turn it into a
HyperFrames composition with consistent layout, timing, fonts and sound; HyperFrames renders the MP4.

The content is the hard part and the part that matters. A pretty video that teaches a wrong tension value or an
invented kaizen result does real damage on the shop floor, so facts come from the user, the machine manual, or
are clearly labelled as a general rule.

## Requirements

Claude Code with a shell, Node.js 22+, FFmpeg on PATH, and npm registry access (first setup downloads
~25 MB: HyperFrames, GSAP, Noto Sans Thai/JP). Chrome comes with HyperFrames. No API keys needed.
If something is missing, `setup_project.mjs` says exactly what to install.

## Workflow

### 1. Intake — get the one point and the facts

Work out, from the conversation or an OPL sheet the user attached (image/PDF/Excel):

| Need | Why |
|---|---|
| Topic = **one** point (e.g. "การตรวจ V-belt tension", not "การบำรุงรักษาสายพาน") | Rubric 1.2 一点 — one point per OPL |
| OPL type: `basic` 基礎知識 / `trouble` トラブル事例 / `kaizen` 改善事例 | Sets the storyboard (step 2) and the HUD label |
| Machine / part, who watches (operator, technician) | Wording level, visuals |
| Facts: standard values, steps, OK/NG criteria — or phenomenon + Why-Why + countermeasure — or before/after + real numbers | Rubric S2 content accuracy |
| Form: OPL No., date, author, approver, pillar | Shown in HUD/outro (rubric 5.2) |

If the task touches an energy source or hazard (electricity, compressed air, hydraulics, rotating parts,
heat, chemicals) — in any OPL type — the video gets an `alert` scene; ask for the site's safety procedure,
and if it is unknown use generic stop + LOTO wording and list it for confirmation.

Ask only for what is missing and matters. Never invent: standard values, torque/pressure/temperature limits,
part numbers, intervals, root causes, or kaizen results. When the user has no value:
- a widely accepted engineering rule may be shown **labelled** as `เกณฑ์ทั่วไป (General rule)` together with
  a note to follow the machine manual (as the V-belt example does), or
- ask, or use a placeholder the user must fill (`ตามคู่มือเครื่อง`).
Kaizen results (time, defects, cost) must be the user's real numbers — ask; do not estimate.

Check that the user's criteria cover the whole range the operator can see. "Normal 5–6 bar, below 4.5 →
call the technician" leaves 4.5–5 and above 6 without an action. An unstated *action* is a fact like any
other: ask; if you must proceed, show your proposed action marked with `*` plus an on-screen caption
("* วิธีปฏิบัติเป็นข้อเสนอ — ให้หัวหน้างานยืนยัน") and list it at delivery. Judgment cards support a third
"watch" level (○△× → `OK` / `WATCH` / `NG`) for exactly these in-between zones.
Missing form fields are fine: they render as "—" and you list them at delivery. If no date is given,
use today's date as the creation date and say so.

### 2. Storyboard by OPL type

Read `references/opl-structures.md` for the scene recipe of the type, the on-screen writing rules, and how each
scene maps to the OPL Quality Rubric. In short:

| Type | Scenes (title and outro are added automatically) |
|---|---|
| basic 基礎知識 | compare (why it matters: NG consequences) → alert (safety, if the task touches a machine) → diagram (method, numbered steps + key value) → judgment (OK / NG) → checklist (optional extra points) |
| trouble トラブル事例 | diagram (phenomenon at the real spot) → whywhy (to the root cause) → compare (before / after countermeasure) → judgment or checklist (how the operator detects it early) |
| kaizen 改善事例 | compare (before: problem + loss) → diagram (kaizen idea / mechanism) → compare (before vs after, same angle) → result (real numbers) |

Show the user the storyboard as a short scene list (one line each) together with any fact you had to
assume. Continue unless they want changes — but stop and ask if a key fact is unknown.

### 3. Write the spec

Write `<work>/opl/spec.json` following `references/spec-schema.md`. Start from
`examples/vbelt-tension/` (a complete basic OPL: spec + per-scene `sN.js` animation files).
Draw visuals as SVG — `references/svg-kit.md` has slot sizes, palette, the `H` helper API (belt drive, dial
gauge, bolt + match mark, stopwatch, prohibition sign, arrows, dimension lines, text) and animation patterns.
For anything beyond a few shapes, put an empty placeholder `<g id="sN-v-…">` in the spec's `svg.body` and draw
into it from the scene's `js_file` with `H.el(...)` — SVG written inside JSON strings gets unreadable fast.
Drawing code that several scenes need (the same machine in the title, phenomenon and before/after scenes)
goes in a top-level `js_lib` file, not in one scene's file. Guidance that keeps the video OPL-grade:

- Visuals carry the lesson (rubric 3.1–3.5): show the **mechanism** (cross-section, the real spot, the
  motion), point at it with arrows/callouts, and put OK next to NG in the same view. Text is the caption.
- Text is short operator language (rubric 4.x): ≤ 3 bullets per card, ≤ ~40 Thai characters per bullet;
  technical terms keep the English/Japanese word with a Thai gloss, e.g. `たわみ (Tawami = ระยะยุบตัว)`.
- Colour 70:25:5 (rubric 5.1): the palette is calm by default; use `!!red key!!` for the single most
  important thing in a scene, `**blue**` for secondary emphasis.
- A real Genba photo beats a drawing when the user has one: copy it into `<proj>/assets/` and place it with
  `<image href="assets/photo.jpg" …/>` inside an SVG body, then add arrows/circles on top.

### 4. Build

```bash
node <skill-dir>/scripts/setup_project.mjs <work>/opl          # once per project folder
python3 <skill-dir>/scripts/narrate.py <work>/opl/spec.json <work>/opl   # only if the spec has narration
node <skill-dir>/scripts/build_opl.mjs <work>/opl/spec.json <work>/opl
```

**Thai voice-over (optional).** When the user wants narration, give scenes a `narration` (one string, or a
list of segments) and let elements appear with the voice via `"cue": k` (segment k starts). `narrate.py`
turns every segment into an MP3 with a Microsoft neural Thai voice (default `th-TH-PremwadeeNeural`, male
`th-TH-NiwatNeural`) and the build times each scene around the real audio. Two engines: **azure** — Azure AI
Speech REST over plain HTTPS, used automatically when `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are set
(free tier F0 is enough; host `<region>.tts.speech.microsoft.com`); **edge** — free Edge Read Aloud voices
(`pip install edge-tts`, no key) over a WebSocket to `speech.platform.bing.com`, which some cloud egress
proxies block even when the domain is allowed. Never ask the user to paste a key into the chat: they add it
as an environment variable/secret, which a new session picks up. Without audio yet the build estimates speech length
and says so — the video can be checked, and the voice dropped in later with narrate + build + render.
`"target_duration": 75` pads the outro to a fixed clip length (or reports the overrun per scene).
Write narration in spoken Thai — spell English terms the way they are said (แอคชูเอเตอร์, ล็อกเอาต์),
numbers as words where the TTS might misread them — and keep on-screen text to the key words; the voice
carries the explanation.

The build prints the scene timeline, warnings, and the snapshot commands to run next. Act on warnings:
a "too dense" scene means cut words first (operators read ~17 characters/s), and only then add `duration`.
Scene durations are derived from structure and text length automatically; set `duration` only when your
custom animation needs a specific length.

### 5. Verify before rendering — look at the frames

```bash
cd <work>/opl
npx hyperframes lint      # must be 0 errors
npx hyperframes check     # runtime + layout + contrast
npx hyperframes snapshot …   # copy the commands the build printed: scene ends, then mid-animation moments
```

Lint always reports three warnings that come from the one-file layout and need no action:
`nested_structure_needs_subcomposition`, `composition_file_too_large`, `timeline_track_too_dense`.
`check` may add a `connector_orphan` info for decorative dashed lines (airflow, extension lines), and a
contrast warning for numbered diagram points that are still dimmed (they start at 30 % until their turn) —
both are expected.
The build prints snapshot commands with ≤ 9 times each and separate output folders, because more than 9
times in one call splits the contact sheet into `contact-sheet-1.jpg`, `-2.jpg`, ….

Open every `snapshots/*/contact-sheet*.jpg` (or the PNGs) and check: Thai renders (no boxes/tofu), nothing
overlaps or is clipped, the visual matches the text, red is used once per scene. For scenes with custom
animation also snapshot mid-animation (e.g. the moment a part moves) — a wrong `svgOrigin` or a path that
does not morph is only visible there. Fix the spec/JS, rebuild, re-snapshot. Two rounds is normal.

### 6. Render and deliver

```bash
npx hyperframes render --fps 30 --quality high --output OPL_<topic>.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name -of compact OPL_<topic>.mp4   # h264 + aac, expected length
```

Send the MP4 to the user, then reply briefly (Thai, with Japanese terms translated):
1. Scene table (time → what it teaches).
2. **Facts to confirm** — anything labelled general rule, assumed, or taken from memory rather than from the user.
3. Missing form fields (No./date/author/approver).
4. A quick rubric self-check (S1 one point & type, S2 content per type, S3 visuals, S4 text, S5 colour/form,
   S6 ≤5-min + tracking + Yokoten) with anything that falls short.
5. Offer edits (wording, speed, real values, company logo, a real Genba photo).

Keep the project folder (`spec.json`, `sN.js`, `assets/`) — edits later are a spec change + rebuild + render.

## Notes and limits

- Sound: generated SFX (whoosh/pop/tick/thud/ok/ng/alarm/squeal), ducked under narration when there is a
  voice-over. Voice-over uses free Edge neural voices (no key); for commercial distribution suggest the
  official Azure Speech service, which has the same voices.
- Rendering is local and takes about 2–2.5 s of wall time per second of video on 4 CPU cores.
- HyperFrames telemetry is disabled by setup.
- For anything the scene types cannot express, the composition is plain HTML/CSS/GSAP: edit `index.html`
  after building, following the HyperFrames rules in `references/svg-kit.md` § Pitfalls — but prefer adding a
  scene `js_file`, so a rebuild does not wipe the edit.
