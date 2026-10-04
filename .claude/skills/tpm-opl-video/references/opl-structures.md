# OPL structures for video

How a JIPM One Point Lesson becomes a 30–60 s video, per type, and how each part maps to the
OPL Quality Rubric (S1–S6, 100 points) used to judge OPLs.

## Contents
1. What makes an OPL an OPL (and how the video keeps it)
2. Rubric → video mapping
3. Scene recipes: basic / trouble / kaizen
4. Writing on-screen Thai text
5. Japanese terms worth using (with Thai gloss)

## 1. What makes an OPL an OPL

- **One point (一点 itten).** One piece of knowledge or one case. If the topic needs two methods, it is two OPLs.
- **Made for the person at the machine.** Operator words, the real spot on the real machine.
- **Visual first.** The picture teaches; text labels it. Someone glancing at it should get the point without reading.
- **Teachable in ≤ 5 minutes (5分間教育, gofun-kan kyōiku = 5-minute education).** The video is the 30–60 s core;
  the rest of the 5 minutes is the trainer at the machine.
- **Traceable.** OPL No., author, approver, and a tracking table of who was taught when (the paper sheet holds
  the table; the video's outro reminds people to sign it).
- **Spreads.** Linked to a standard (AM/CIL check sheet, PM standard) and to Yokoten (横展開 = horizontal
  deployment to similar machines/spots).

## 2. Rubric → video mapping

| Rubric | What the video does | Where |
|---|---|---|
| 1.1 Title states what is taught | `title.line1/line2` = the action + the object ("การตรวจ" + "V-belt Tension") | title scene |
| 1.2 One point | One topic; scenes all serve it | storyboard |
| 1.3 Type | `opl_type` → HUD label + title chip (基礎知識 / トラブル事例 / 改善事例) | automatic |
| 2.x Basic: principle · method · why | compare (why) + diagram (principle/method) + judgment | basic recipe |
| 2.x Trouble: phenomenon · Why-Why root · countermeasure + prevention | diagram + whywhy + compare/checklist | trouble recipe |
| 2.x Kaizen: before · reproducible kaizen · numbers | compare + diagram + compare + result | kaizen recipe |
| 3.1 Visual ~80% | Every content scene has an SVG; text panels are narrow | spec |
| 3.2 Mechanism, not decoration | Cross-sections, the part moving, the measurement being taken | svg + js |
| 3.3 Arrows/callouts | `H.arrowD`, `H.dimD`, red circles, callout box | svg-kit |
| 3.4 OK vs NG / Before vs After | judgment cards; compare with `tone: before/after` | scenes |
| 3.5 Understand without text | Animate the cause→effect (belt sags, needle leaves green band) | js |
| 4.1–4.3 Short, big, plain text | Generator fonts are ≥ 32 px; you keep words few and plain | spec text |
| 5.1 Colour 70:25:5 | Calm palette; `!!key!!` red once per scene | spec markup |
| 5.2 Form fields | `form` → HUD + outro | spec.form |
| 5.3 Reading order | Fixed layouts flow left→right, top→bottom | automatic |
| 6.1 ≤ 5 min | 30–60 s video | durations |
| 6.2 Tracking table | Outro reminder line | automatic |
| 6.3 Yokoten / standard link | `outro.standard`, `outro.yokoten` | spec.outro |

## 3. Scene recipes

Title (first) and outro (last) are added automatically when absent. Durations below are what the build
usually picks; you rarely need to set them.

### basic — 基礎知識 Kiso-chishiki (basic knowledge): "how to do X correctly"

| # | Scene | Content | ~s |
|---|---|---|---|
| 1 | title | Action + object; sub-line = what it protects | 3.5 |
| 2 | compare | "ทำไมต้อง…?" — left/right = the two ways it goes wrong (`tone: ng`) with consequences; banner = link to Breakdown/quality/safety | 6–10 |
| 3 | alert | Safety pre-condition (stop machine, LOTO, PPE, hot surface). Skip only if the task is purely visual from a safe distance | 3–4 |
| 4 | diagram | The method: numbered points 2–4, the visual shows each step as it is named; callout = the standard value | 8–10 |
| 5 | judgment | 2–3 cards: OK/NG states, each with the action to take | 5–8 |
| 6 | checklist | Optional: 2–3 related things to look at while there (not a second lesson) | 4–8 |
| 7 | outro | Tag line + standard + Yokoten + form | 4.5 |

### trouble — トラブル事例 Trouble-jirei (trouble case): "this happened, here's why, here's how we stop it"

| # | Scene | Content |
|---|---|---|
| 1 | title | Name the trouble at the spot ("Seal ปั๊ม P-101 รั่ว") |
| 2 | diagram | Phenomenon: where, what was seen (leak, crack, noise, wrong part), impact (minutes stopped, defects). `numbered: false` bullets; red circle on the spot; `alarm` or `squeal` sfx |
| 3 | whywhy | `phenomenon` + 3–5 `whys` + `root`. Each Why must follow from the previous one and the root must be something a countermeasure can remove (not "operator careless"). JIPM separates two chains: why it **happened** (発生 hassei = occurrence) and why it was **not caught** (流出 ryūshutsu = outflow). If the user's chain mixes them, keep their content, show the switch with why `tag`s (e.g. "発生 Why 3", "流出 Why 1"), and point it out at delivery — don't rewrite their analysis |
| 4 | compare | Countermeasure: `tone: before` vs `tone: after` (same viewpoint), bullets = what changed + how recurrence is prevented (standard, Poka-yoke ポカヨケ = mistake-proofing, check item). Both chains need an answer: one countermeasure for the occurrence cause, one for detection; if the user gave only one, flag the gap |
| 5 | judgment or checklist | How the operator spots the early sign next time (OK/NG of the early sign) |
| 6 | outro | Standard updated + Yokoten to similar machines |

### kaizen — 改善事例 Kaizen-jirei (improvement case): "we changed this, it's better by N"

| # | Scene | Content |
|---|---|---|
| 1 | title | The improvement in one phrase ("ลดเวลาเปลี่ยนแม่พิมพ์ด้วย Quick Clamp") |
| 2 | compare | Before: the problem and its loss (Muda, minutes, defects), `tone: before`, right card = why it happened / what it cost |
| 3 | diagram | The kaizen idea/mechanism so another team can copy it (rubric 2.2) |
| 4 | compare | Before vs After from the same angle |
| 5 | result | 1–3 `metrics` with the user's real before/after numbers; % is computed |
| 6 | outro | Standard + Yokoten (where else this applies) |

Safety, any type: when the task touches an energy source or hazard, add an `alert` scene before the
first scene that shows hands on the machine (trouble: before the countermeasure/check; kaizen: before the
mechanism). Use the site's procedure; if unknown, generic stop + LOTO wording, flagged at delivery.

## 4. Writing on-screen Thai text

Text budget per scene (base characters, i.e. not counting Thai vowel/tone marks) that fits without stretching
the scene: compare ≈ 170–190 · diagram ≈ 160–190 · judgment ≈ 120–140 · checklist ≈ 150 · whywhy ≈ 150 ·
alert ≈ 60. The build warns when a scene is too dense; cut words before adding time.


- Bullets ≤ ~40 characters, ≤ 3 per card; one idea per bullet; prefer noun/verb phrases over sentences.
- Pattern "cause → effect" reads fast: `สายพานลื่น (Slip) → กำลังส่งตก`.
- Keep the shop-floor English term and gloss it once: `Glazing (ผิวมันวาว)`, `Span (ระยะระหว่าง Pulley)`.
- Numbers with units and conditions: `δ ≈ 1.6 mm ต่อ Span 100 mm`, not "ประมาณนิดหน่อย".
- Headings ask or state the point: "ทำไมต้องตรวจ …?", "วิธีตรวจ: …", "ตัดสินผล: …".
- No `<br>`; long text wraps by itself. If a line wraps badly, shorten it.
- Markup: `**blue emphasis**`, `!!red key point!!` (once per scene).

## 5. Japanese terms (always with a Thai gloss on screen)

| Term | Reading | Thai gloss |
|---|---|---|
| 一点レッスン | itten ressun | บทเรียนประเด็นเดียว (OPL) |
| 基礎知識 | kiso chishiki | ความรู้พื้นฐาน |
| トラブル事例 | toraburu jirei | กรณีปัญหา |
| 改善事例 | kaizen jirei | กรณีปรับปรุง |
| 横展開 | yokoten | ขยายผลสู่จุดอื่น |
| 自主保全 | jishu hozen | การบำรุงรักษาด้วยตนเอง (AM) |
| 計画保全 | keikaku hozen | การบำรุงรักษาตามแผน (PM) |
| 合いマーク | ai māku | Match mark (เครื่องหมายแสดงตำแหน่งน็อต) |
| ポカヨケ | poka-yoke | กลไกป้องกันความผิดพลาด |
| たわみ | tawami | ระยะยุบตัว / การแอ่นตัว |
| 現場 | genba | หน้างานจริง |
| なぜなぜ分析 | naze-naze bunseki | การวิเคราะห์ Why-Why |
