# OPL-Analyzer — OPL AI Feedback System

ระบบประเมินและให้ Feedback **One-Point Lesson (OPL / ワンポイントレッスン = บทเรียนจุดเดียว)**
ตามเกณฑ์ JIPM TPM ด้วย 3-Agent pipeline

## บริบทผู้ใช้
- เจ้าของโปรเจกต์: ที่ปรึกษา TPM สาย JIPM (20+ ปี) เน้นงาน Genba และการเตรียมขอ TPM Award
- **ตอบกระชับ ตรงประเด็น ไม่ต้องอธิบายพื้นฐาน TPM/JIPM**
- ให้ Action Items ที่ทำได้ทันที
- ใช้ภาษาไทยปนอังกฤษสำหรับศัพท์เฉพาะ; ศัพท์ญี่ปุ่นให้แปลกำกับ

## Architecture — 3-Agent Pipeline

```
Upload OPL → Agent 1 Extract → Schema Validate → Agent 2 Evaluate → Agent 3 Feedback → UI
```

| Agent | Skill | Input → Output | ข้อห้าม |
|---|---|---|---|
| 1. OPL Reader | `agent1-opl-reader` | image/PDF → `opl.extract.v2` | ห้ามให้คะแนน/แนะนำ/แก้เนื้อหา |
| 2. Criteria Evaluator | `agent2-criteria-evaluator` | `opl.extract.v2` + Rubric → `opl.evaluation.v2` | ห้าม rewrite / ห้ามเขียน feedback สวยงาม |
| 3. AI Refiner | `agent3-ai-refiner` | `opl.evaluation.v2` → `opl.feedback.v2` | ห้ามแก้คะแนน / ห้ามอ้าง BP ที่ไม่ได้ retrieve จริง |

Skills อยู่ที่ `.claude/skills/<name>/SKILL.md` — โหลดอัตโนมัติ อ่าน SKILL.md ก่อนแก้ logic ของ agent นั้นเสมอ

## Source of Truth

| เรื่อง | ไฟล์ | หมายเหตุ |
|---|---|---|
| Rubric 100 คะแนน | `OPL_Quality_Rubric_JIPM.xlsx` | ใช้ `criterion_key` unique (เช่น `2.2T`) — **ห้ามใช้ code ซ้ำข้าม type** |
| Contract / DB / API | `OPL_AI_Feedback_Vibe_Coding_Blueprint_V2.md` | spec หลักของ Web App |
| UI/UX + Image Prompt | `OPL_AI_Feedback_UIUX_DesignSpec.html` | |
| Architecture diagram | `OPL_3Agent_System_Architecture.drawio` / `.svg` | แก้ `.drawio` แล้ว export `.svg` ให้ตรงกัน |
| Project hub | `index.html` | |

## กฎประจำโปรเจกต์

1. **Schema versioning** — ทุก output ของ agent ต้องมี `schema_version` และผ่าน JSON Schema validate ก่อนส่งต่อ
2. **Evidence-first** — field สำคัญทุกตัวต้องมี provenance/`evidence_refs` ไม่ใช่ข้อความลอย
3. **ไม่มั่นใจ = หยุด ไม่เดา** — ใช้ `status = needs_rescan` หรือ `need_user_confirm` + `blocking_gaps`
4. **`public_rationale` เท่านั้น** — เหตุผลสั้น ตรวจสอบได้ ไม่ dump reasoning ภายใน
5. **Model ไม่ hard-code** — อ้างผ่าน `model_key` + Model Registry
6. **UI reveal** — default `one_by_one` การ์ดสำคัญสุดก่อน (ผู้ใช้อยู่หน้างาน Genba อ่านยาวไม่ไหว)
7. **Data source** — MySQL + Object Storage เป็นหลัก; `opl_database.json` เป็น legacy import เท่านั้น
8. **Visual rule** — งานภาพ/OPL ยึด 70:25:5 Color Rule และ label ภาษาไทย

## OPL Type
- **Basic Knowledge / 基礎知識** (ความรู้พื้นฐาน) — หลักการ, ขั้นตอน
- **Kaizen Case / 改善事例** (กรณีปรับปรุง) — Before/After + ผลลัพธ์เป็นตัวเลข
- **Trouble Case / トラブル事例** (กรณีปัญหา) — Why-Why + มาตรการกันซ้ำ

## Environment
- Claude Code session เป็น container ชั่วคราว → **commit + push ทุกครั้งก่อนจบงาน**
- Branch พัฒนา: ตามที่ระบุในแต่ละ task, ห้าม push ตรงเข้า `main`
- `main02.py` เป็น CLI วิเคราะห์ OEE จากชีต Loss Analysis (pandas) ไม่ใช่ส่วนหนึ่งของ pipeline
  - หาแถวจาก **label** ในคอลัมน์แรก ไม่ผูก row index; หาไม่เจอ = หยุด + บอกว่าขาดอะไร (ไม่เดา)
  - เพิ่ม label ที่ชีตจริงใช้ได้ที่ `METRIC_ALIASES`; override รายครั้งด้วย `--loading/--operating/--net/--quality-loss`
  - สำรวจ label จริง: `python main02.py --csv <file> --list-rows`
  - ไฟล์ CSV ต้นทางไม่ได้อยู่ใน repo (ข้อมูลโรงงาน)
