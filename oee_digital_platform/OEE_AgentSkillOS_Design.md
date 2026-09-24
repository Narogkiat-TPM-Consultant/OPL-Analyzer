# AgentSkillOS × OEE Digital Platform — ใช้ประโยชน์อะไรได้ และออกแบบ Agent อะไร

อ้างอิง: [ynulihao/AgentSkillOS](https://github.com/ynulihao/AgentSkillOS)  
เชื่อมกับ: `OEE_DOMAIN.md`, `app/oee_layers/` (Harness / Loop / Graph)

---

## 1) AgentSkillOS คืออะไร (สั้น ๆ)

เป็น **operating system ของ Agent Skills** ไม่ใช่ MES/OEE สำเร็จรูป

โจทย์ที่มันแก้: skill สาธารณะมีมากกว่า 200,000 รายการ — ถ้าโยนทั้งหมดให้ LLM จะ **หาไม่เจอ / ใช้ผิด / ประกอบเป็น pipeline ไม่ได้**

วิธีทำงาน 3 ขั้น:

| ขั้น | ของ AgentSkillOS | ความหมาย |
|---|---|---|
| **Manage** | Capability Tree (coarse → fine) | จัด skill เป็นต้นไม้ความสามารถ ไม่ค้นแบบคล้ายข้อความอย่างเดียว |
| **Retrieve** | Tree / Vector / Direct | เลือกชุด skill ที่ตรงงาน (และเสริมกัน) จากคำขอผู้ใช้ |
| **Orchestrate** | DAG / Free-style / No-skill | เรียงลำดับ, dependency, ทำงานขนาน, มีกลยุทธ์ Quality / Efficiency / Simplicity |

ของแถมที่ใช้กับโรงงานได้จริง:

- **Human-in-the-loop** — คนอนุมัติ/เบรกแต่ละขั้น
- **Recipe** — บันทึกชุด skill ที่ใช้ซ้ำได้ (เช่น “วินิจฉัย OEE ตกประจำกะ”)
- **Observability** — log รายขั้น ดีบักได้
- **Batch CLI** — รันหลายไลน์/หลายกะแบบ headless

**สิ่งที่ไม่ควรทำ:** ดึง skill ทั่วไป 200,000 รายการมาใส่โรงงานโดยตรง  
เสี่ยงคำแนะนำผิด, ไม่มี provenance, และอาจขัดกฎ safety/lockout

**สิ่งที่ควรยืม:** วิธีจัด skill + เลือก skill + ประกอบ DAG + HITL + recipe  
แล้วใส่ **OEE skill ของโรงงานเอง** ลง registry

---

## 2) ใช้ประโยชน์กับ OEE Platform ได้อย่างไร

แพลตฟอร์มเรามีอยู่แล้ว: `oee_engine`, tools, Harness/Loop/Graph (`status` / `diagnose` / `target` / `alert_or_report`)

AgentSkillOS เติมช่องว่างเมื่อ **skill เพิ่มจำนวน** (SOP, downtime dictionary, PDCA, แจ้งเตือน, ingest, รายงาน) จน Graph แบบ hard-code ไม่พอ

```
คำถามช่าง/หัวหน้า
        │
        ▼
 Skill Tree (OEE capabilities)     ← แนว AgentSkillOS: Manage
        │ retrieve
        ▼
 ชุด skill ที่เกี่ยวข้อง           ← Retrieve (ไม่ dump ทุก tool)
        │
        ▼
 DAG ตามกลยุทธ์                    ← Orchestrate
   Quality-First / Efficiency-First / Simplicity-First
        │
        ▼
 แต่ละโหนดรันผ่าน Harness+Loop     ← ของที่สร้างไว้แล้ว (verify ตัวเลข)
        │
        ▼
 HITL ถ้า OEE ต่ำ / งานซ่อมเสี่ยง  ← Approval
        │
        ▼
 Recipe + Audit log                ← ใช้ซ้ำและตรวจสอบได้
```

| ของ AgentSkillOS | ใช้ใน OEE อย่างไร |
|---|---|
| Skill tree | จัดความสามารถ: วัด / วินิจฉัย / แนะนำ / แจ้งเตือน / ปรับปรุง / กำกับ |
| Retrieval | “ทำไม PACK-2 ตก” → ดึง summary + downtime + ranking + SOP ไม่ดึง billing/meme |
| DAG orchestration | ขนาน downtime ∥ ranking แล้วค่อย merge แนะนำ |
| Strategy | Quality = วิเคราะห์ลึกให้ CI; Efficiency = standup 5 นาที; Simplicity = Operator |
| HITL GUI | Supervisor อนุมัติก่อนส่ง LINE แจ้งเตือนทั้งโรง |
| Recipe | บันทึก “วินิจฉัยกะดึก PACK-2” ใช้ซ้ำทุกวัน |
| Batch | รันรายงาน 8 ไลน์ตอนสิ้นกะ |
| Observability | รู้ว่า agent เรียก tool ไหน ตรวจผ่านไหม |

แมปกับ 3 ชั้นที่มีอยู่:

| ชั้นปัจจุบัน | บทบาทเมื่อมี Skill OS |
|---|---|
| **Harness** | = runtime ของ **หนึ่ง skill** (gather → tool → verify) |
| **Loop** | = ทำ skill นั้นซ้ำจนผ่านเกณฑ์ |
| **Graph** | = DAG เล็กที่ hard-code ไว้ 4 แบบ — ขั้นถัดไปให้ **retrieve แล้วประกอบ DAG** แทน |

---

## 3) Capability Tree ที่ควรสร้างสำหรับ OEE (อย่าใช้ tree สาธารณะทั้งก้อน)

```
OEE Platform Skills
├── 1. Measure
│     ├── get_oee_summary
│     ├── get_oee_trend
│     └── compare_shift_or_line
├── 2. Diagnose
│     ├── availability_loss   → get_top_downtime
│     ├── performance_loss    → cycle_time / speed loss
│     ├── quality_loss        → defect / reject Pareto
│     └── rank_machines
├── 3. Recommend
│     ├── estimate_output_for_target
│     ├── search_sop_kb
│     └── draft_improvement_action
├── 4. Notify
│     ├── threshold_alert
│     ├── daily_oee_report
│     └── escalate_to_role
├── 5. Improve
│     ├── create_pdca_action
│     ├── before_after_oee
│     └── yokoten_similar_lines
└── 6. Govern
      ├── verify_kpi_identity
      ├── require_approval
      └── audit_tool_trace
```

Active set (ใช้บ่อย): Measure + Diagnose + Notify  
Dormant set (ดึงเมื่อจำเป็น): Improve / Yokoten / รายงานผู้บริหาร / SOP เฉพาะเครื่อง

นี่คือแนว **active / dormant layer** ของ AgentSkillOS — โรงงานไม่ควรโหลดทุก skill ทุกครั้ง

---

## 4) ออกแบบ Agent สำหรับ OEE Platform

แต่ละตัว = **บทบาท + skill ที่ retrieve ได้ + DAG หลัก + HITL**

### A) Floor / ปฏิบัติการ

| Agent | ผู้ใช้ | งาน | Skills หลัก | DAG ย่อ | HITL |
|---|---|---|---|---|---|
| **1. Shift Status Agent** | Operator | OEE/A/P/Q กะนี้ สีสถานะ | `get_oee_summary` | Simplicity: summary → ตอบ | ไม่ต้อง |
| **2. Downtime Logger Coach** | Operator | ช่วยเลือก reason code ให้ถูก | downtime taxonomy + ask_user | ถามอาการ → เสนอรหัส → ยืนยัน | Operator ยืนยันรหัส |
| **3. Loss Diagnosis Agent** | Supervisor | ทำไม OEE ตก ควรโฟกัสอะไร | summary, top_downtime, rank_machines, SOP | Efficiency: summary → ขนาน downtime∥ranking → merge | ถ้า OEE < 60% หัวหน้าอนุมัติก่อนประกาศ |
| **4. Machine Health Agent** | Maintenance | เครื่องพังบ่อย / MTTR proxy | rank_machines, breakdown history, SOP | Quality: ranking → ประวัติ → SOP → แผน PM | ก่อนสั่งงานซ่อมใหญ่ |
| **5. Quality Loss Agent** | QA | reject/rework ดึง Quality | defect Pareto, oee quality, SOP | summary(Q) → defects → สาเหตุ | QA ยืนยันชนิดของเสีย |

### B) วางแผน / ปรับปรุง

| Agent | ผู้ใช้ | งาน | Skills หลัก | DAG ย่อ | HITL |
|---|---|---|---|---|---|
| **6. Target Gap Agent** | Supervisor / PM | ต้องผลิตเท่าไรถึง OEE 85% | summary, estimate_output | summary → estimate → สมมติฐาน | ไม่ต้อง ถ้าเป็นตัวเลขจาก engine |
| **7. Alert Router Agent** | ระบบ + หัวหน้า | แตกสาขา alert vs daily report | summary, downtime, channels | Graph `alert_or_report` | อนุมัติก่อน blast ทั้งโรง |
| **8. Daily/Weekly Report Agent** | Manager / Exec | สรุปกะ/สัปดาห์ + Top 3 | summary, downtime, ranking, chart | Batch หลายไลน์ → รวม → template | Manager ดูก่อนส่ง Email |
| **9. PDCA Action Agent** | CI / TPM Lead | แปลง insight เป็นงาน | diagnose + `create_pdca_action` | diagnose → draft action → owner/due | CI รับงานก่อนเข้า tracker |
| **10. Yokoten Agent** | CI | หาไลน์/เครื่องที่คล้ายกัน | ranking, history, KB | เคสนี้ → ค้นคล้าย → เสนอขยายผล | CI เลือกไลน์ที่จะขยาย |

### C) ความรู้ / กำกับ (meta)

| Agent | ผู้ใช้ | งาน | Skills หลัก | หมายเหตุ |
|---|---|---|---|---|
| **11. SOP Librarian** | ทุกบทบาท | RAG คู่มือ / รหัส downtime / Kaizen | `search_documents` | ใช้เมื่อคำถามอ้างเอกสาร ไม่เดาตัวเลข |
| **12. Skill Dispatcher (OS)** | ระบบ | เลือก agent/skill จากคำถาม | tree retrieval | ชั้นที่ลอกจาก AgentSkillOS โดยตรง |
| **13. Recipe Curator** | Admin / CI | บันทึก workflow ที่ใช้แล้วได้ผล | recipe store | “PACK-2 กะดึก วินิจฉัย + แจ้งซ่อม” |
| **14. Audit / Verifier Agent** | IT + Manager | ตรวจว่าตัวเลขในคำตอบ = tool | `verify_kpi_identity` | บังคับก่อนเผยแพร่รายงาน |

---

## 5) ตัวอย่าง Orchestration ที่ออกแบบได้ทันที

### โจทย์: “ทำไม OEE ไลน์ PACK-2 วันนี้ตก ควรทำอะไรก่อน?”

**Retrieve (tree):** Measure/summary + Diagnose/downtime + Diagnose/rank + Recommend/SOP + Govern/verify

**Efficiency-First DAG (standup):**

```
[get_oee_summary] ──┬── [get_top_downtime] ──┐
                    └── [rank_machines] ──────┼── [verify] ── [recommend]
                                              └── [search_sop] ─┘
```

**Quality-First DAG (CI deep dive):** เพิ่ม performance/quality split, ประวัติ 7 วัน, draft PDCA, yokoten

**Simplicity-First:** เหลือ summary + top 1 downtime เท่านั้น (จอ Operator)

นี่ต่อจาก Graph `diagnose` ที่มีอยู่ — ต่างตรงที่ **ชุดโหนดมาจาก retrieval** ไม่ได้ hard-code ทุกเคส

### โจทย์: สิ้นกะ 8 ไลน์

ใช้ **Batch CLI pattern**: งานละไลน์ → Report Agent → รวม Top losses โรงงาน → Email/LINE  
ไม่ต้องเปิดแชททีละไลน์

---

## 6) กลยุทธ์ 3 แบบ ใช้ตอนไหน

| กลยุทธ์ AgentSkillOS | ใช้กับใคร | ผลลัพธ์ |
|---|---|---|
| **Simplicity-First** | Operator | คำตอบสั้น สีสถานะ 1 จอ |
| **Efficiency-First** | Supervisor standup | ขนาน tool, จบในไม่กี่วินาที |
| **Quality-First** | CI / TPM / ซ่อมใหญ่ | pipeline ลึก, มี SOP + PDCA + อนุมัติ |

อย่าใช้ Quality-First กับทุกคำถามบนไลน์ — จะช้าและรบกวนหน้างาน

---

## 7) สิ่งที่ควรทำ / ไม่ควรทำ

**ทำ**
- สร้าง **OEE Skill Registry** เป็น `SKILL.md` ต่อความสามารถ (ชื่อ, เมื่อไหร่ใช้, input/output, ห้ามเดาตัวเลข)
- ใช้ tree เฉพาะโดเมนโรงงาน (สิบถึงหลักสิบ skill ก่อน ไม่ใช่แสน)
- ให้ทุก skill ตัวเลขวิ่งผ่าน Harness verifier
- เก็บ recipe ของโรงงานลูกค้าหลังไพลอต 90 วัน
- HITL เมื่อ alert ทั้งโรง หรือแนะนำงานที่เกี่ยวกับ safety

**ไม่ทำ**
- Import skill สาธารณะด้านวิดีโอ/มีม/โปรโมตเปเปอร์ มาปนระบบผลิต
- ให้ free-style agent รันโค้ดบน OT โดยไม่มี allowlist
- แทนที่ `oee_engine` ด้วย LLM

---

## 8) ลำดับลงมือบน repo นี้

1. แปลง tools ปัจจุบันเป็น skill cards ใน `backend/skills/oee-*/SKILL.md` (template มี skills system อยู่แล้ว)
2. ทำ **Skill Dispatcher** บาง ๆ: คำถาม → เลือก workflow/skill จาก tree ด้านบน (ยังไม่ต้อง clone AgentSkillOS ทั้งก้อน)
3. ขยาย Graph จาก 4 แบบ เป็น recipe ที่บันทึกได้
4. ต่อ Batch รายงานหลายไลน์ (Celery) ตามแบบ batch CLI
5. ค่อยเชื่อม HITL บน UI แชท (ปุ่มอนุมัติที่ `needs_approval`)

AgentSkillOS = **แบบอย่างระบบปฏิบัติการของ skill**  
OEE Platform = **ที่ใส่ skill โรงงานและความจริงของตัวเลขลงไป**
