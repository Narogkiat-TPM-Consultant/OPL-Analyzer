# rahulnyk/knowledge_graph × OEE Platform — เสริมตรงส่วนไหน

อ้างอิง: [rahulnyk/knowledge_graph](https://github.com/rahulnyk/knowledge_graph)  
เชื่อมกับ: RAG (pgvector), `oee_engine`, Harness/Loop/Graph, `OEE_AgentSkillOS_Design.md`

---

## 1) Repo นี้ทำอะไร

แปลงคลังข้อความ (PDF/คู่มือ) เป็น **กราฟแนวคิด (concept graph)** แล้วใช้ถาม-ตอบแบบ **Graph RAG (GRAG)**

วิธีโดยย่อ:
1. หั่นเอกสารเป็น chunk
2. LLM ดึง **concepts** และความสัมพันธ์ในแต่ละ chunk (ไม่ใช่แค่ NER ชื่อเฉพาะ)
3. แนวคิดที่อยู่ chunk เดียวกันถือว่าใกล้กัน (contextual proximity)
4. รวมน้ำหนักขอบ → กราฟ NetworkX
5. คำนวณ **degree** (ความสำคัญ) และ **community** (กลุ่มแนวคิด)
6. วาดด้วย Pyvis / ใช้กราฟเป็น retriever

จุดต่างจาก RAG เวกเตอร์ที่เรามีอยู่แล้ว (pgvector):

| | Vector RAG (มีแล้ว) | Graph จาก repo นี้ |
|---|---|---|
| หาอะไร | ชิ้นข้อความที่ “คล้ายคำถาม” | แนวคิดที่ **เชื่อมกัน** แม้คำไม่คล้าย |
| จุดแข็ง | หา SOP ตรงคำ | โยง “หัวฉีดตัน → วัสดุหนืด → อุณหภูมิถัง → SOP อุ่นวัตถุดิบ” |
| จุดอ่อน | พลาดของที่คำไม่ตรง | กราฟจาก LLM อาจมีโหนดซ้ำ/กำกวม ต้องทำความสะอาด |

**อย่าใช้แทน** `oee_engine` หรือตารางเครื่อง/downtime — ตัวเลข OEE ยังมาจาก SQL เท่านั้น

---

## 2) เสริมตรงชั้นไหนของ OEE Platform

```
เอกสารโรงงาน (SOP, OPL, คู่มือ, Kaizen)
        │  chunk + extract concepts
        ▼
 Knowledge Graph (concepts + relations)     ← เสริมชั้นความรู้
        │  hop เพื่อบ้าน / community
        ▼
 Hybrid retrieve = pgvector ∪ graph neighbors
        │
        ▼
 Diagnose / Yokoten / SOP Librarian agents
        │
        ▼
 Harness verify ตัวเลข + HITL ก่อนแนะนำซ่อม
```

| ชั้นที่มีอยู่ | เสริมด้วย KG ได้ไหม | อย่างไร |
|---|---|---|
| **1. Data / Ingest** | บางส่วน | ใช้ pipeline หั่นเอกสาร + extract กับ SOP/OPL ไม่ใช้ Excel OEE |
| **2. Storage** | ใช่ | เพิ่มตาราง/กราฟ `kg_nodes`, `kg_edges` คู่ Postgres (ยังไม่ต้อง GraphDB ในเฟสแรก) |
| **3. Dashboard** | ใช่ (CI) | หน้า “แผนที่ความสูญเสีย” ดู community ของเหตุหยุด |
| **4. AI / RAG** | **จุดหลัก** | เปลี่ยน SOP Librarian จาก vector-only เป็น **hybrid GRAG** |
| **5. Alerts** | น้อย | ใช้อธิบาย “เกี่ยวอะไร” ในข้อความแจ้งเตือน ไม่ใช้ยิง threshold |
| **6. PDCA** | ใช่ | โยงเคสปรับปรุงกับเครื่อง/ไลน์ที่อยู่ใน community เดียวกัน = Yokoten |
| **Harness tools** | ใช่ | เพิ่ม tool `search_knowledge_graph` |
| **Loop / Graph workflows** | ใช่ | โหนด diagnose ดึงเพื่อนบ้านของ reason_code |
| **AgentSkillOS tree** | เสริมกัน | Tree = เลือก **skill**; KG = เลือก **ความรู้ที่เชื่อมกัน** |

---

## 3) ควรสร้างกราฟ 2 ใบ (อย่าปน)

### A) Document Concept Graph — ยืมวิธีจาก repo โดยตรง
แหล่ง: SOP, คู่มือเครื่อง, OPL, downtime dictionary, รายงาน Kaizen

ตัวอย่างโหนด/ขอบ:
- `Nozzle jam` —mentioned_with→ `Viscous material`
- `Viscous material` —related_to→ `Tank temperature SOP`
- `Label wrinkle` —fixed_by→ `Labeler tension checklist`

ใช้กับ: SOP Librarian, Quality Loss Agent, ช่างหา “ของที่เกี่ยวกับอาการนี้”

### B) Operational Graph — สร้างจาก SQL ไม่ต้องให้ LLM เดา
แหล่ง: ตาราง OEE ที่มีแล้ว (`oee_machines`, `oee_downtime_events`, `oee_defect_records`, `oee_improvement_actions`)

ตัวอย่าง:
- `Filler-01` —has_event→ `BRK-NOZ` (น้ำหนัก = นาทีหยุด)
- `BRK-NOZ` —on_line→ `PACK-2`
- `BRK-NOZ` —led_to_action→ PDCA #17

ใช้กับ: Loss Diagnosis, Machine Health, Yokoten, “เครื่องไหนคล้ายกัน”

ใบ B แม่นและถูกกว่าใบ A สำหรับตัวเลข  
ใบ A เก่งกว่าเมื่อคำถามข้ามเอกสารที่คำไม่ตรงกัน

---

## 4) ช่องที่คุ้มที่สุด (เรียงตามผล)

### 1) Hybrid RAG — เสริมชั้น AI / SOP Librarian
ตอนนี้ `search_documents` หา chunk คล้ายคำถาม  
เติม: จากแนวคิดที่เจอ → เดินกราฟ 1–2 ขั้น → ดึง chunk ของขอบนั้นมาประกอบ context

คำถาม: “หัวฉีดตันบ่อย เกี่ยวกับวัตถุดิบไหม”  
Vector อย่างเดียวอาจเจอแค่หน้าหัวฉีด  
กราฟดึงโหนดเพื่อนบ้านเรื่องความหนืด/อุณหภูมิถัง ที่อยู่ในคู่มือคนละบท

### 2) Diagnose ที่ข้ามเครื่อง/ไลน์ — เสริม Loss Diagnosis + Yokoten
Community / centrality จาก repo:
- เหตุหยุดที่เป็น **hub** (degree สูง) = ควรทำมาตรฐานก่อน
- เครื่องที่อยู่ใน **community เดียว** = ขยายผล (yokoten) ได้

ไม่แทน Pareto นาทีจาก SQL — ใช้คู่กัน: SQL บอก “เสียเวลากี่นาที”, กราฟบอก “โยงกับอะไรอีก”

### 3) หน้ากราฟให้ CI / TPM — เสริม Dashboard (ไม่ใช่จอ Operator)
Pyvis-style: คลิกโหนด `BRK-NOZ` เห็นเครื่อง, SOP, งาน PDCA ที่เชื่อม  
Operator ยังดู KPI ใหญ่ ๆ อยู่

### 4) Tool ใหม่ใน Harness
`search_knowledge_graph(concept, hops=2)`  
Verifier: ทุกขอบต้องมี `source_chunk_id` หรือ `event_id` — ห้ามโหนดลอยที่ LLM สร้างแล้วอ้างเป็นข้อเท็จจริงโรงงาน

### 5) ช่วย Skill retrieval (คู่ AgentSkillOS)
คำถามกว้าง “ของเสียฉลากย่น” → KG บอกแนวคิดเกี่ยว tension/glue  
Dispatcher ค่อยเลือก skill `quality_loss` + `search_sop`  
กราฟไม่แทน skill tree

---

## 5) สิ่งที่ไม่ควรเสริมด้วย repo นี้

| อย่าเอาไปใส่ | เหตุผล |
|---|---|
| คำนวณ OEE / A / P / Q | ต้องมาจาก engine |
| แทน hierarchy โรง/ไลน์/เครื่อง | มีใน Postgres แล้ว |
| Root cause อัตโนมัติจากกราฟอย่างเดียว | ขอบจาก “อยู่ chunk เดียวกัน” ≠ สาเหตุเชิงวิศวกรรม |
| โหลด PDF นอกโรงงานทั้งอินเทอร์เน็ต | โหนดรบกวน, ไม่มี audit |
| ให้ Operator ตัดสินใจจากกราฟสวย ๆ | อ่านยากบนไลน์ |

---

## 6) ตัวอย่างโหนด OEE ที่ควรมีในกราฟ

```
[Plant PLT01]--contains-->[Line PACK-2]--has-->[Filler-01]
                                |                    |
                                v                    v
                         [OEE 78.5%]           [BRK-NOZ / Nozzle jam]
                                |                    |
                                v                    v
                    [Availability loss]      [SOP-CLEAN-NOZZLE]
                                                     |
                                                     v
                                              [PDCA-2026-014]
```

ขอบจากเอกสาร (ใบ A) กับขอบจากอีเวนต์จริง (ใบ B) ติด `source=sop|event` แยกกัน  
ตอน retrieve ให้น้ำหนักใบ B สูงกว่าเมื่อถามเรื่อง “เครื่องนี้พังอะไร”

---

## 7) ลำดับลงมือ (ไม่ต้อง fork ทั้ง repo)

1. **เฟสความรู้:** รันแนว `extract_graph` กับชุด SOP/OPL ของ 1 ไลน์ → เก็บ nodes/edges ใน Postgres  
2. **Tool:** `search_knowledge_graph` + รวมผลกับ `search_documents` (hybrid)  
3. **เฟสปฏิบัติการ:** สร้างกราฟจาก downtime/defect SQL (ไม่ผ่าน LLM)  
4. **UI CI:** หน้ากราฟคลิกโหนดได้ (เอาแนว Pyvis มาใน Next.js ทีหลังได้)  
5. **ผูก Diagnose/Yokoten:** หลัง Pareto แล้วเดินกราฟหาของที่เกี่ยว

ของที่ควรยืมจาก repo: สูตร chunk → concept → proximity edge → น้ำหนัก → community  
ของที่ไม่ต้องยืมทั้งก้อน: notebook + Ollama stack แยกจาก FastAPI — ทำให้เป็น job ใน Celery ของแพลตฟอร์มแทน

---

## 8) สรุปหนึ่งประโยค

**knowledge_graph เสริมชั้นความรู้และการวินิจฉัยที่ “โยงความสัมพันธ์” — ไม่เสริมชั้นตัวเลข OEE**  
ใช้คู่กับ pgvector และ SQL: เวกเตอร์หาข้อความคล้าย, กราฟหาของที่เชื่อม, engine บอกเปอร์เซ็นต์ที่ตรวจได้
