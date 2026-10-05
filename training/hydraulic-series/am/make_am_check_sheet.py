#!/usr/bin/env python3
"""Build the AM Check Sheet workbook for a hydraulic unit from the criteria taught in EP13–EP21
(JIPM-Solutions OPL 5-C-1 … 5-C-13, Equipment Skills Training – Hydraulic).

Usage: python3 make_am_check_sheet.py [output.xlsx]

Every criterion is tagged with its source page. "*" marks a proposal (action, frequency or owner the deck
does not give) for the supervisor to confirm; [DATA REQUIRED] marks a machine value to fill in.
"""
import sys
from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = sys.argv[1] if len(sys.argv) > 1 else "AM_Check_Sheet_Hydraulic_Unit.xlsx"
FONT = "Tahoma"

INK, NAVY, SECTION, INPUT, NG_FILL, WATCH_FILL, GREY = "1A1D21", "1F2A36", "E3ECF9", "FFFF00", "F8C9CF", "FCE7B2", "F2F2F2"
thin = Side(style="thin", color="9AA1AA")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)


def font(bold=False, size=10, color=INK, italic=False):
    return Font(name=FONT, bold=bold, size=size, color=color, italic=italic)


def fill(hex_):
    return PatternFill("solid", start_color=hex_, end_color=hex_)


WRAP = Alignment(wrap_text=True, vertical="center")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)

# ---------------------------------------------------------------- content
# (item, method, OK criterion, action when NG, source, OPL · video)
DAILY = [
    ("เริ่มเดินเครื่อง (Start-up) · OPL 5-C-2", [
        ("ปั๊ม: เสียงขณะเริ่มเดิน", "หู", "เงียบ · จ่ายน้ำมันออกปกติ",
         "เสียงดัง/แหลม หรือไม่จ่ายน้ำมันภายใน 20 วินาที + มีเสียงผิดปกติ → หยุดปั๊ม ตรวจระดับและอุณหภูมิน้ำมัน",
         "PDF p.18", "5-C-2 · EP14"),
        ("เกจแรงดัน: ค่าที่ชี้", "ตา", "ชี้ที่ค่าตั้ง (ช่อง ค่าตั้งแรงดัน) · อยู่ในแถบเขียว",
         "ไม่ถึง/เกินค่าตั้ง → แจ้งช่างซ่อมบำรุง *", "PDF p.18, p.26 · * ข้อเสนอ", "5-C-2 · EP14, EP18"),
        ("Filter indicator", "ตา", "สีเขียว (ปกติ)", "สีเหลือง/แดง → ทำความสะอาด Filter",
         "PDF p.18, p.26", "5-C-2, 5-C-7 · EP14, EP18"),
    ]),
    ("ขณะเดินเครื่อง (Running) · OPL 5-C-3, 5-C-8, 5-C-9", [
        ("เสียงผิดปกติ: ปั๊ม · มอเตอร์ · วาล์ว", "หู", "เสียงปกติของอุปกรณ์นั้น",
         "เสียงผิดปกติ → เทียบตารางเสียง (ชีท Reference) → แจ้งช่างซ่อมบำรุง *", "PDF p.18–19 · * ข้อเสนอ", "5-C-3 · EP15, EP14"),
        ("เข็มเกจแรงดันแกว่ง", "ตา", "แกว่งไม่เกิน ±3 kgf/cm²", "แกว่งเกิน ±3 kgf/cm² → แจ้งช่างซ่อมบำรุง *",
         "PDF p.19 · * ข้อเสนอ", "5-C-3 · EP15"),
        ("สั่น/ร้อนผิดปกติ: ปั๊ม · มอเตอร์ · วาล์ว · ท่อ", "มือ", "ไม่สั่น · ไม่ร้อนผิดปกติ (ดูตารางสัมผัส ชีท Reference)",
         "สั่น/ร้อนผิดปกติ → แจ้งช่างซ่อมบำรุง *", "PDF p.19 · * ข้อเสนอ", "5-C-3 · EP15"),
        ("การเคลื่อนที่ (ความราบรื่น)", "ตา + นาฬิกาจับเวลา", "ราบรื่น · เวลาต่อรอบเท่าค่าปกติ (ช่อง เวลารอบปกติ)",
         "สะดุด/ช้าลง → แจ้งช่างซ่อมบำรุง *", "PDF p.19 · ค่าเวลา [DATA REQUIRED] · * ข้อเสนอ", "5-C-3 · EP15"),
        ("Relief valve: แรงดันวงจรขณะทำงาน", "ตา", "เกจนิ่งที่ค่าตั้ง ไม่เปลี่ยน",
         "แรงดันเปลี่ยน → แจ้งผู้รับผิดชอบงานซ่อมบำรุง", "PDF p.28", "5-C-8 · EP19"),
        ("Solenoid valve: เสียงคราง “บูน” ขณะ ON", "หู", "ไม่มีเสียงคราง", "มีเสียงคราง → แจ้งช่างซ่อมบำรุง *",
         "PDF p.30 · * ข้อเสนอ", "5-C-9 · EP19"),
    ]),
    ("หลังเลิกงาน · เครื่องหยุด (Work end) · OPL 5-C-1, 5-C-3, 5-C-4", [
        ("เกจแรงดัน: ชี้ 0 (ไม่มีแรงดันค้าง)", "ตา", "ชี้ 0",
         "ไม่ชี้ 0 → ห้ามคลายข้อต่อ แจ้งช่าง * · ชี้ต่ำกว่า 0 → ต้องซ่อม", "PDF p.20, p.26 · * ข้อเสนอ", "5-C-3, 5-C-7 · EP16, EP18"),
        ("ความสกปรกภายนอก Hydraulic unit", "ตา", "สะอาด ไม่มีคราบ", "สกปรก → ทำความสะอาด (ทำความสะอาด = ตรวจ)",
         "PDF p.17, p.20", "5-C-1 · EP13, EP16"),
        ("ถังน้ำมัน: รอยรั่ว", "ตา (เช็ดก่อน)", "ไม่มีรอยรั่ว", "รั่ว → แจ้งช่างซ่อมบำรุง *", "PDF p.20 · * ข้อเสนอ", "5-C-3 · EP16"),
        ("พื้นรอบเครื่อง: น้ำมันรั่ว", "ตา", "ไม่มีคราบน้ำมัน", "มีคราบ → เช็ด + หาจุดรั่วด้านบน *",
         "PDF p.20 · * ข้อเสนอ", "5-C-3 · EP16"),
        ("ส่วนเลื่อน (เช่น ก้านสูบ): สิ่งสกปรกเกาะ", "ตา (เช็ดก่อน)", "ไม่มีสิ่งสกปรกเกาะ", "สกปรก → ทำความสะอาด",
         "PDF p.20", "5-C-3 · EP16"),
        ("ระดับน้ำมัน (ปั๊มหยุด)", "ตา", "ถึงขีดบนของเกจระดับ", "ต่ำกว่าขีด → เติมถึงระดับมาตรฐาน",
         "PDF p.21, p.14, p.17", "5-C-4 · EP17"),
        ("สีน้ำมัน (ดูที่เกจระดับ)", "ตา", "ใส ไม่มีสี = ○ · สีน้ำตาล (เริ่มเสื่อม) = △",
         "สีดำ → แจ้งช่างซ่อมบำรุง * · น้ำตาล → แจ้งหัวหน้างาน *", "PDF p.21 · * ข้อเสนอ · ความถี่ *", "5-C-4 · EP17"),
        ("Air breather: ไส้กรอง", "ตา", "ไม่มีฝุ่น", "สกปรก → ล้างด้วยน้ำมันก๊าด หรือเปลี่ยน (ตามวัสดุไส้กรอง)",
         "PDF p.21 · ความถี่ *", "5-C-4 · EP17"),
        ("อุณหภูมิน้ำมัน (ปั๊มหยุด)", "มือ / เทอร์โมมิเตอร์", "< 55 °C · วางฝ่ามือบนถัง/ท่อได้ ≥ 3–4 วินาที",
         "ร้อนเกิน → แจ้งช่างซ่อมบำรุง", "PDF p.21, p.17", "5-C-4 · EP17"),
        ("อื่นๆ ที่พบ (Others)", "ตา · หู · มือ", "ไม่พบสิ่งผิดปกติ", "พบ → ติด F-tag + บันทึกในช่องหมายเหตุ *",
         "PDF p.17 · * ข้อเสนอ", "5-C-1 · EP13"),
    ]),
]

WEEKLY = [
    ("กระบอกสูบไฮดรอลิก · OPL 5-C-10", [
        ("รอยรั่ว: ข้อต่อท่อ · Dust seal (เช็ดก่อน)", "ตา", "แห้ง ไม่มีคราบ/หยด", "รั่ว → แจ้งช่างซ่อมบำรุง *", "PDF p.31", "5-C-10 · EP20"),
        ("โบลต์/น็อตของกระบอกสูบ", "ตา · มือ", "ไม่หลวม", "หลวม → แจ้งช่างซ่อมบำรุง *", "PDF p.31", "5-C-10 · EP20"),
        ("ก้านสูบ (Rod): รอยขีดข่วน", "ตา", "เงาเหมือนกระจก", "มีรอยขีดข่วน → แจ้งช่างซ่อมบำรุง *", "PDF p.31", "5-C-10 · EP20"),
        ("Dust seal: ฉีก/สึก", "ตา", "ไม่ฉีก ไม่สึก", "ฉีก/สึก → แจ้งช่างซ่อมบำรุง *", "PDF p.31", "5-C-10 · EP20"),
    ]),
    ("สายแรงดันสูง (High-pressure hose) · OPL 5-C-12, 5-C-13", [
        ("สายงอชิดข้อต่อ / ลวดเสริมขาด", "ตา", "ไม่งอชิดข้อต่อ · ลวดไม่ขาด", "พบ → หยุดใช้ แจ้งช่างซ่อมบำรุง *", "PDF p.33", "5-C-12 · EP21"),
        ("สายบวม (มักเกิดภายใน 500 mm จากข้อต่อ)", "ตา", "ไม่บวม", "บวม → หยุดใช้ แจ้งช่างซ่อมบำรุง *", "PDF p.33", "5-C-12 · EP21"),
        ("Lock clamp หลวม/คลอน · สายสัมผัสส่วนที่เคลื่อนไหว", "ตา · มือ (ไม่มีแรงดัน)", "แคลมป์แน่น · สายไม่สัมผัสส่วนเคลื่อนไหว",
         "หลวม/สัมผัส → แจ้งช่างซ่อมบำรุง *", "PDF p.33", "5-C-12 · EP21"),
        ("การติดตั้งสาย", "ตา", "ไม่บิด · แนวตรงหย่อนเล็กน้อย · มี Band กันเสียดสี · ไม่งอชิดปลาย",
         "ผิดจากเกณฑ์ → แจ้งช่างซ่อมบำรุง *", "PDF p.33–34", "5-C-12, 5-C-13 · EP21"),
    ]),
    ("Relief valve / Solenoid valve · OPL 5-C-8, 5-C-9", [
        ("Relief valve: น้ำมันรั่วจากแต่ละส่วน", "ตา", "ไม่รั่ว", "รั่ว → แจ้งผู้รับผิดชอบงานซ่อมบำรุง", "PDF p.28", "5-C-8 · EP19"),
        ("Solenoid valve: รั่วที่ตัววาล์ว/ฐานติดตั้ง (เช็ดด้วยผ้าก่อน)", "ตา", "ไม่รั่ว", "รั่ว → แจ้งช่างซ่อมบำรุง *", "PDF p.30", "5-C-9 · EP19"),
        ("Solenoid valve: โบลต์/สกรูหลวม", "ตา · มือ", "ไม่หลวม", "หลวม → แจ้งช่างซ่อมบำรุง *", "PDF p.30", "5-C-9 · EP19"),
        ("Solenoid valve: สายไฟ/จุดต่อเสียหาย", "ตา", "สายไม่ชำรุด จุดต่อแน่น", "ชำรุด → แจ้งช่างไฟฟ้า *", "PDF p.30", "5-C-9 · EP19"),
    ]),
    ("Visual control ของมิเตอร์ · OPL 5-C-7", [
        ("แถบสีเขียว/แดง บนเกจแรงดันและเทอร์โมมิเตอร์", "ตา", "แถบสีครบ ชัดเจน ไม่เลยขอบสเกล", "ซีด/หลุด → ทำใหม่ (ถอดกระจกขณะไม่มีแรงดัน) *",
         "PDF p.26 · * ข้อเสนอ", "5-C-7 · EP18"),
    ]),
]

PERIODIC = [
    ("Filter · OPL 5-C-7 (ทุก 6 เดือน)", [
        ("Filter: Vacuum meter", "ทุก 6 เดือน", "≤ 10 cmHg", "เกิน 10 cmHg → ทำความสะอาด Filter", "PDF p.26", "5-C-7 · EP18"),
        ("Filter: Indicator", "ทุก 6 เดือน", "สีเขียว", "สีเหลือง/แดง → ทำความสะอาด Filter", "PDF p.26", "5-C-7 · EP18"),
    ]),
    ("Regular check · OPL 5-C-1 (ความถี่และผู้ตรวจ: กำหนดโดยหัวหน้างาน)", [
        ("ระดับความสกปรกของน้ำมัน (Contamination level)", "[DATA REQUIRED]", "[DATA REQUIRED]", "หาสาเหตุของความผิดปกติเล็กๆ จาก Daily check", "PDF p.17", "5-C-1 · EP13"),
        ("ความสกปรกของ Filter (Filter dirt)", "[DATA REQUIRED]", "[DATA REQUIRED]", "หาสาเหตุ · ทำความสะอาด/เปลี่ยน", "PDF p.17", "5-C-1 · EP13"),
        ("Stopper bolt คลาย", "[DATA REQUIRED]", "ไม่คลาย", "คลาย → ขันตามค่าที่กำหนด", "PDF p.17", "5-C-1 · EP13"),
        ("Seal packing เสื่อม", "[DATA REQUIRED]", "ไม่เสื่อม", "เสื่อม → เปลี่ยน", "PDF p.17", "5-C-1 · EP13"),
    ]),
    ("Relief valve function check · OPL 5-C-8 (ผู้ได้รับมอบหมายเท่านั้น *)", [
        ("หมุน Handle ดูเกจ: ขันเข้า → แรงดันเพิ่ม · คลายออก → ลด แล้วตั้งกลับค่าตั้ง + ขัน Lock nut", "[DATA REQUIRED]",
         "แรงดันเปลี่ยนตาม Handle · ตั้งกลับค่าตั้งได้", "ไม่เปลี่ยน/ตั้งไม่ได้ → แจ้งผู้รับผิดชอบงานซ่อมบำรุง", "PDF p.28 · ผู้ทำ * ข้อเสนอ", "5-C-8 · EP19, EP05"),
    ]),
]

HAND_FEEL = [  # PDF p.19
    ("อุ่นเล็กน้อย (Little warm)", "—", "ประมาณ 32 °C"),
    ("อุ่น (Warm)", "—", "ประมาณ 38 °C"),
    ("รู้สึกร้อน (Feel hot)", "วางมือได้นานกว่า 1 นาที", "ประมาณ 48 °C"),
    ("ร้อนมาก (Considerably hot)", "วางมือได้ประมาณ 15 วินาที", "ประมาณ 58 °C"),
    ("ร้อน (Hot)", "วางมือได้ประมาณ 3 วินาที", "56–59 °C"),
    ("ร้อน (Hot)", "วางมือได้ไม่ถึง 3 วินาที", "สูงกว่า 60 °C"),
]
TEMP_ZONES = [  # PDF p.26 — boundaries read from the figure
    ("80–100 °C", "อันตราย (Dangerous)", "ห้ามใช้"),
    ("65–80 °C", "ขีดจำกัด (Limit)", "อายุน้ำมันสั้น · ทุก +8 °C อายุน้ำมันลดครึ่ง"),
    ("55–65 °C", "เตือน (Warning)", "ต้องติดตั้ง Oil cooler"),
    ("46–55 °C", "ปลอดภัย (Safety)", "ปรับให้อยู่ในช่วงอุณหภูมิที่เหมาะสม"),
    ("30–46 °C", "เหมาะสม (Ideal)", "ปรับให้อยู่ในช่วงอุณหภูมิที่เหมาะสม"),
    ("20–30 °C", "อุณหภูมิปกติ (Normal)", "ประสิทธิภาพลดลงเพราะน้ำมันหนืด"),
    ("< 20 °C", "ต่ำ (Low)", "อันตรายตอนเริ่มเดินเครื่อง"),
]
SOUNDS = [  # PDF p.18
    ("Cavitation", "ก้า… (Ga)", "ต่อเนื่อง", "Suction filter ตัน · ท่อดูดเล็ก/ยาว · Suction head สูง · น้ำมันเย็น (หนืดสูง)"),
    ("เสียงเสียดสี (Frictional)", "ซ่า-จ่า (Za-Ja)", "ต่อเนื่อง", "ชิ้นส่วนในปั๊มสึก · Coupling เยื้องศูนย์"),
    ("เสียงไหล (Flow)", "ฟู่ (Hiss)", "—", "อัตราไหลเกิน (เสียงที่ Cushion ของกระบอกสูบ)"),
    ("Coupling", "กะตะ กะตะ (Cata)", "ต่อเนื่อง", "เยื้องศูนย์ · Key สึก · Shaft fitting ไม่ดี · จาระบีหมด · Chain สึก"),
    ("เสียงรบกวน (Interference)", "—", "ต่อเนื่อง", "การสั่น · การสั่นพ้อง (Ringing)"),
    ("เสียงอากาศ (Air)", "ป๊อก ป๊อก (plock)", "เป็นช่วงๆ", "อากาศเข้าที่ข้อต่อท่อ · Oil seal ปั๊มสึก · น้ำมันหมด · ท่อกลับผิดปกติ"),
    ("Solenoid valve คราง", "บูน (Boone)", "ต่อเนื่อง", "Spool เลื่อนไม่สุด · แรงดันไฟตก · แรงดูด Solenoid ไม่พอ"),
]
CONFIRM = [
    ("ค่าตั้งแรงดันของเครื่อง (kgf/cm²) และแถบเขียวบนเกจ", "ใช้ในข้อ เกจแรงดัน: ค่าที่ชี้", "[DATA REQUIRED] · PDF p.18, p.26"),
    ("เวลาต่อรอบปกติของการเคลื่อนที่ (วินาที)", "ใช้ในข้อ การเคลื่อนที่", "[DATA REQUIRED] · PDF p.19"),
    ("วิธีปฏิบัติเมื่อ NG ที่มี * (แจ้งช่าง / ห้ามคลายข้อต่อ / หยุดใช้)", "ต้นฉบับบอกจุดตรวจ แต่ส่วนใหญ่ไม่ระบุวิธีปฏิบัติ", "ข้อเสนอ"),
    ("ความถี่ของชีท Weekly_Check (สัปดาห์ละครั้ง) และความถี่สีน้ำมัน / Air breather", "ต้นฉบับไม่ระบุความถี่", "ข้อเสนอ"),
    ("ผู้ตรวจ Regular check และ Relief valve function check", "ต้นฉบับข้อ 5 หน้า 28 ให้ตรวจข้อ 1–4 · ชุดนี้ให้ผู้ได้รับมอบหมายทำข้อ 1–2", "ข้อเสนอ · ให้สอดคล้อง EP05/EP19"),
    ("ขอบเขตช่วงอุณหภูมิน้ำมัน (ชีท Reference)", "อ่านจากรูปหน้า 26 ซึ่งเส้นแบ่งบางช่วงไม่ชัด", "PDF p.26 · ตรวจกับต้นฉบับญี่ปุ่น"),
    ("ตารางสัมผัส: แถว 58 °C กับ 56–59 °C ทับกัน", "แสดงตามต้นฉบับ", "PDF p.19 · ตรวจกับต้นฉบับญี่ปุ่น"),
    ("ข้อ 6 ของ Daily check “Oil sound up” = อุณหภูมิน้ำมันสูงขึ้น (油温上昇)", "ใช้ในข้อ อุณหภูมิน้ำมัน", "แก้คำแปล PDF p.17"),
    ("เกณฑ์เลือกสเกลเกจ: แรงดันแกว่งมาก → ไม่เกิน 1/2 ของสเกลเต็ม", "ต้นฉบับเขียน “more than 1/2”", "แก้คำแปล PDF p.25 · แนวปฏิบัติ JIS"),
    ("สายแรงดันสูงยืดหด “24%” ตามแรงดัน", "น่าจะเป็น 2–4% · ไม่ได้ใช้เป็นเกณฑ์ในชีท", "PDF p.33 · ตรวจกับต้นฉบับ"),
]


# ---------------------------------------------------------------- helpers
def title(ws, text, sub, last_col):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=last_col)
    ws.cell(1, 1, text).font = font(True, 15, "FFFFFF")
    ws.cell(1, 1).fill = fill(NAVY)
    ws.cell(1, 1).alignment = Alignment(vertical="center", indent=1)
    ws.row_dimensions[1].height = 30
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=last_col)
    ws.cell(2, 1, sub).font = font(False, 9, "5A6775", italic=True)
    ws.cell(2, 1).alignment = Alignment(vertical="center", indent=1)


def info_row(ws, row, fields):
    """fields: [(label, start_col, value_col_span)] → label cell + yellow input cell."""
    for label, col, span in fields:
        c = ws.cell(row, col, label)
        c.font, c.alignment = font(True, 9), Alignment(horizontal="right", vertical="center")
        if span > 1:
            ws.merge_cells(start_row=row, start_column=col + 1, end_row=row, end_column=col + span)
        v = ws.cell(row, col + 1)
        v.fill, v.border = fill(INPUT), BOX
        for k in range(col + 1, col + span + 1):
            ws.cell(row, k).border = BOX
    ws.row_dimensions[row].height = 20


def header(ws, row, labels, widths=None):
    for i, lab in enumerate(labels, start=1):
        c = ws.cell(row, i, lab)
        c.font, c.fill, c.alignment, c.border = font(True, 9, "FFFFFF"), fill(NAVY), CENTER, BOX
    ws.row_dimensions[row].height = 32
    if widths:
        for i, w in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(i)].width = w


def check_grid(ws, first_row, groups, n_fixed, grid_labels, extra_cols, dv):
    """Write grouped items; return (first item row, last item row, NG column index)."""
    r = first_row
    no = 0
    total_cols = n_fixed + len(grid_labels) + extra_cols
    first_grid = n_fixed + 1
    last_grid = n_fixed + len(grid_labels)
    ng_col = last_grid + 1
    for group, items in groups:
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=total_cols)
        c = ws.cell(r, 1, group)
        c.font, c.fill, c.alignment = font(True, 10, "1F5FBF"), fill(SECTION), Alignment(vertical="center", indent=1)
        ws.row_dimensions[r].height = 20
        r += 1
        for item in items:
            no += 1
            vals = (no,) + item
            for i, v in enumerate(vals, start=1):
                cell = ws.cell(r, i, v)
                cell.font = font(size=9, color=("B07A00" if i == 6 and "*" in str(v) else INK))
                cell.alignment = CENTER if i in (1, 3) else WRAP
                cell.border = BOX
            if any("*" in str(v) or "[DATA REQUIRED]" in str(v) for v in item):
                ws.cell(r, 6).font = font(size=9, color="B07A00")
            for k in range(first_grid, last_grid + 1):
                cell = ws.cell(r, k)
                cell.border, cell.alignment, cell.font = BOX, CENTER, font(size=10)
            dv.add(f"{get_column_letter(first_grid)}{r}:{get_column_letter(last_grid)}{r}")
            ng = ws.cell(r, ng_col, f'=COUNTIF({get_column_letter(first_grid)}{r}:{get_column_letter(last_grid)}{r},"×")')
            ng.border, ng.alignment, ng.font, ng.fill = BOX, CENTER, font(True, 10), fill(GREY)
            for k in range(ng_col + 1, total_cols + 1):
                ws.cell(r, k).border = BOX
            ws.row_dimensions[r].height = 44
            r += 1
    return first_row + 1, r - 1, ng_col


def summary_rows(ws, r, first_item, last_item, first_grid, last_grid, labels):
    for label, kind in labels:
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=first_grid - 1)
        c = ws.cell(r, 1, label)
        c.font, c.alignment = font(True, 9), Alignment(horizontal="right", vertical="center", indent=1)
        for k in range(1, first_grid):
            ws.cell(r, k).border = BOX
        for k in range(first_grid, last_grid + 1):
            col = get_column_letter(k)
            cell = ws.cell(r, k)
            if kind in ("×", "△"):
                cell.value = f'=COUNTIF({col}{first_item}:{col}{last_item},"{kind}")'
                cell.font, cell.fill = font(True, 9), fill(GREY)
            else:
                cell.fill = fill(INPUT)
            cell.border, cell.alignment = BOX, CENTER
        ws.row_dimensions[r].height = 22
        r += 1
    return r


def add_marks_cf(ws, rng):
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"×"'], fill=fill(NG_FILL), font=Font(name=FONT, bold=True, color="C32A3E")))
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"△"'], fill=fill(WATCH_FILL), font=Font(name=FONT, bold=True, color="8A5A00")))


def page(ws, landscape=True, paper=8):  # 8 = A3
    ws.page_setup.orientation = "landscape" if landscape else "portrait"
    ws.page_setup.paperSize = paper
    ws.page_setup.fitToWidth, ws.page_setup.fitToHeight = 1, 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = True
    ws.page_margins.left = ws.page_margins.right = 0.3


def marks_validation():
    dv = DataValidation(type="list", formula1='"○,△,×,—"', allow_blank=True)
    dv.error, dv.errorTitle = "ใช้ ○ △ × หรือ — เท่านั้น", "ผลตรวจ"
    dv.prompt, dv.promptTitle = "○ ปกติ · △ เฝ้าดู · × ผิดปกติ · — ไม่ได้ตรวจ", "ผลตรวจ"
    return dv


FIXED = ["No.", "จุดตรวจ (Item)", "วิธีตรวจ", "เกณฑ์ OK", "เมื่อพบ NG (×)", "ที่มา", "OPL · วิดีโอ"]
FIXED_W = [5, 30, 11, 28, 34, 17, 15]

wb = Workbook()

# ---------------------------------------------------------------- How_To_Use
ws = wb.active
ws.title = "How_To_Use"
title(ws, "AM Check Sheet — Hydraulic Unit (自主保全 点検表 = ใบตรวจ AM)",
      "จากเกณฑ์ใน OPL 5-C-1 … 5-C-13 (JIPM-Solutions · Equipment Skills Training – Hydraulic) ที่สอนในวิดีโอ EP13–EP21", 6)
rows = [
    ("ชีท", "ใช้ทำอะไร"),
    ("Daily_Check", "ตรวจทุกวัน 3 จังหวะ: เริ่มเดินเครื่อง → ขณะเดินเครื่อง → หลังเลิกงาน · ช่องวันที่ 1–31"),
    ("Weekly_Check", "กระบอกสูบ · สายแรงดันสูง · Relief/Solenoid valve · แถบสีมิเตอร์ · ช่องสัปดาห์ W1–W5 (ความถี่เป็นข้อเสนอ *)"),
    ("Periodic_Check", "Filter ทุก 6 เดือน · Regular check · ทดสอบ Relief valve (ผู้ได้รับมอบหมาย) · ช่องเดือน ม.ค.–ธ.ค."),
    ("Reference", "ตารางอุณหภูมิจากการสัมผัส · ช่วงอุณหภูมิน้ำมัน · ตารางเสียงผิดปกติ"),
    ("To_Confirm", "ประเด็นที่หัวหน้างาน/Safety ต้องยืนยันก่อนใช้จริง"),
    ("", ""),
    ("สัญลักษณ์ผลตรวจ", "○ ปกติ (OK) · △ เฝ้าดู (Watch) · × ผิดปกติ (NG → ทำตามช่อง “เมื่อพบ NG” + ติด F-tag) · — ไม่ได้ตรวจ"),
    ("ช่องที่ต้องกรอก", "ช่องสีเหลือง = ข้อมูลเครื่อง/ลายเซ็น · ช่องตาราง = เลือกจาก drop-down (○ △ × —)"),
    ("คำนวณอัตโนมัติ", "ช่องสีเทา “× รวม” และแถว “จำนวน × / △ ต่อวัน” นับจากตารางให้เอง"),
    ("ที่มา", "PDF p.x = มาจากเอกสารต้นฉบับ · * ข้อเสนอ = ต้นฉบับไม่ระบุ ให้หัวหน้างานยืนยัน · [DATA REQUIRED] = ต้องใส่ค่าของเครื่อง"),
    ("ตัวอย่างการกรอก", "วันที่ 3 ข้อ “เข็มเกจแรงดันแกว่ง” = ×  → แจ้งช่างซ่อมบำรุง ติด F-tag แดง และเขียนหมายเหตุ “แกว่ง ±5 kgf/cm² เวลา 10:30”"),
    ("ความปลอดภัย", "ตรวจด้วยมือเฉพาะจุดที่ปลอดภัย ห้ามแตะส่วนหมุน · งานถอด/ขันข้อต่อ: หยุดปั๊ม ปล่อยแรงดันจนเกจชี้ 0 + LOTO (ข้อเสนอ — ยืนยันกับขั้นตอนของโรงงาน)"),
]
for i, (a, b) in enumerate(rows, start=4):
    ws.cell(i, 1, a).font = font(True, 10, "FFFFFF" if i == 4 else INK)
    ws.merge_cells(start_row=i, start_column=2, end_row=i, end_column=6)
    ws.cell(i, 2, b).font = font(i == 4, 10, "FFFFFF" if i == 4 else INK)
    for k in range(1, 7):
        ws.cell(i, k).border = BOX if a or b else Border()
        ws.cell(i, k).alignment = WRAP
        if i == 4:
            ws.cell(i, k).fill = fill(NAVY)
    ws.row_dimensions[i].height = 34 if a else 10
ws.cell(12, 2).fill = fill(INPUT)
ws.column_dimensions["A"].width = 20
for col in "BCDEF":
    ws.column_dimensions[col].width = 26
page(ws, landscape=False, paper=9)

# ---------------------------------------------------------------- Daily_Check
ws = wb.create_sheet("Daily_Check")
days = [str(d) for d in range(1, 32)]
last_col = len(FIXED) + len(days) + 2
title(ws, "AM Check Sheet — Hydraulic Unit · ตรวจประจำวัน (Daily)",
      "○ ปกติ · △ เฝ้าดู · × ผิดปกติ · — ไม่ได้ตรวจ   |   * = ข้อเสนอ ให้หัวหน้างานยืนยัน   |   ที่มา: OPL 5-C-1 … 5-C-10 (EP13–EP19)", last_col)
info_row(ws, 3, [("เครื่องจักร", 2, 2), ("Line / แผนก", 5, 2)])
info_row(ws, 4, [("ค่าตั้งแรงดัน (kgf/cm²)", 2, 2), ("เวลารอบปกติ (วินาที)", 5, 2)])
info_row(ws, 5, [("เดือน / ปี", 2, 2), ("ผู้รับผิดชอบ", 5, 2)])
for (r, c) in ((4, 3), (4, 6)):
    ws.cell(r, c).value = "[DATA REQUIRED]"
    ws.cell(r, c).font = font(size=9, color="B07A00", italic=True)
header(ws, 6, FIXED + days + ["× รวม", "หมายเหตุ"], FIXED_W + [3.6] * len(days) + [7, 26])
dv = marks_validation()
ws.add_data_validation(dv)
first_item, last_item, ng_col = check_grid(ws, 7, DAILY, len(FIXED), days, 2, dv)
fg, lg = len(FIXED) + 1, len(FIXED) + len(days)
add_marks_cf(ws, f"{get_column_letter(fg)}{first_item}:{get_column_letter(lg)}{last_item}")
summary_rows(ws, last_item + 1, first_item, last_item, fg, lg,
             [("จำนวน × ต่อวัน", "×"), ("จำนวน △ ต่อวัน", "△"), ("ผู้ตรวจ (ลงชื่อย่อ)", ""), ("หัวหน้างาน (ลงชื่อย่อ)", "")])
ws.freeze_panes = f"{get_column_letter(fg)}7"
ws.print_title_rows = "6:6"
page(ws)

# ---------------------------------------------------------------- Weekly_Check
ws = wb.create_sheet("Weekly_Check")
weeks = ["W1", "W2", "W3", "W4", "W5"]
last_col = len(FIXED) + len(weeks) + 2
title(ws, "AM Check Sheet — Hydraulic Unit · ตรวจรายสัปดาห์ (Weekly *)",
      "ความถี่สัปดาห์ละครั้ง = ข้อเสนอ (ต้นฉบับไม่ระบุ) · ตรวจขณะเครื่องหยุดและไม่มีแรงดัน · ที่มา: OPL 5-C-7 … 5-C-13 (EP18–EP21)", last_col)
info_row(ws, 3, [("เครื่องจักร", 2, 2), ("Line / แผนก", 5, 2)])
info_row(ws, 4, [("เดือน / ปี", 2, 2), ("ผู้รับผิดชอบ", 5, 2)])
header(ws, 5, FIXED + weeks + ["× รวม", "หมายเหตุ"], FIXED_W + [7] * len(weeks) + [7, 30])
dv = marks_validation()
ws.add_data_validation(dv)
first_item, last_item, ng_col = check_grid(ws, 6, WEEKLY, len(FIXED), weeks, 2, dv)
fg, lg = len(FIXED) + 1, len(FIXED) + len(weeks)
add_marks_cf(ws, f"{get_column_letter(fg)}{first_item}:{get_column_letter(lg)}{last_item}")
summary_rows(ws, last_item + 1, first_item, last_item, fg, lg,
             [("จำนวน × ต่อสัปดาห์", "×"), ("ผู้ตรวจ (ลงชื่อย่อ)", ""), ("หัวหน้างาน (ลงชื่อย่อ)", "")])
ws.freeze_panes = f"{get_column_letter(fg)}6"
ws.print_title_rows = "5:5"
page(ws)

# ---------------------------------------------------------------- Periodic_Check
ws = wb.create_sheet("Periodic_Check")
months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
fixed_p = ["No.", "จุดตรวจ (Item)", "ความถี่", "เกณฑ์ OK", "เมื่อพบ NG (×)", "ที่มา", "OPL · วิดีโอ"]
last_col = len(fixed_p) + len(months) + 2
title(ws, "AM / PM Check Sheet — Hydraulic Unit · ตรวจตามรอบ (Periodic)",
      "Filter ทุก 6 เดือน (PDF p.26) · Regular check (PDF p.17) · Relief valve function check (PDF p.28) — ช่องสีเหลือง = กำหนดความถี่/ผู้ตรวจ", last_col)
info_row(ws, 3, [("เครื่องจักร", 2, 2), ("Line / แผนก", 5, 2)])
info_row(ws, 4, [("ปี", 2, 2), ("ผู้รับผิดชอบ", 5, 2)])
header(ws, 5, fixed_p + months + ["× รวม", "หมายเหตุ"], FIXED_W[:2] + [14] + FIXED_W[3:] + [6] * len(months) + [7, 26])
dv = marks_validation()
ws.add_data_validation(dv)
first_item, last_item, ng_col = check_grid(ws, 6, PERIODIC, len(fixed_p), months, 2, dv)
for r in range(first_item, last_item + 1):
    if ws.cell(r, 3).value == "[DATA REQUIRED]":
        ws.cell(r, 3).fill = fill(INPUT)
        ws.cell(r, 3).font = font(size=9, color="B07A00", italic=True)
fg, lg = len(fixed_p) + 1, len(fixed_p) + len(months)
add_marks_cf(ws, f"{get_column_letter(fg)}{first_item}:{get_column_letter(lg)}{last_item}")
summary_rows(ws, last_item + 1, first_item, last_item, fg, lg, [("จำนวน × ต่อเดือน", "×"), ("ผู้ตรวจ (ลงชื่อย่อ)", "")])
ws.freeze_panes = f"{get_column_letter(fg)}6"
page(ws)

# ---------------------------------------------------------------- Reference
ws = wb.create_sheet("Reference")
title(ws, "Reference — เกณฑ์ประกอบการตรวจ", "ตัวเลขตามต้นฉบับ OPL 5-C-2, 5-C-3, 5-C-7 · ใช้ประกอบข้อ “เสียง” “สั่น/ร้อน” “อุณหภูมิน้ำมัน”", 4)


def table(ws, r, caption, cols, rows_, widths=None):
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=len(cols))
    ws.cell(r, 1, caption).font = font(True, 11, "1F5FBF")
    r += 1
    for i, h in enumerate(cols, start=1):
        c = ws.cell(r, i, h)
        c.font, c.fill, c.alignment, c.border = font(True, 9, "FFFFFF"), fill(NAVY), CENTER, BOX
    r += 1
    for row in rows_:
        for i, v in enumerate(row, start=1):
            c = ws.cell(r, i, v)
            c.font, c.alignment, c.border = font(size=9), WRAP, BOX
        ws.row_dimensions[r].height = 30
        r += 1
    return r + 1


r = table(ws, 4, "A. สังเกตอุณหภูมิด้วยการสัมผัส (Sense of feeling) — PDF p.19", ["ความรู้สึก", "วางมือได้", "อุณหภูมิ", ""], [x + ("",) for x in HAND_FEEL])
ws.cell(r - 1, 1, "หมายเหตุ: แถว 58 °C กับ 56–59 °C ทับกันในต้นฉบับ — ดูชีท To_Confirm").font = font(size=8, color="B07A00", italic=True)
r = table(ws, r + 1, "B. ช่วงอุณหภูมิน้ำมันไฮดรอลิก — PDF p.26 (เกณฑ์ตรวจประจำวัน: < 55 °C ขณะปั๊มหยุด, p.21)", ["ช่วง", "ระดับ", "ความหมาย", ""], [x + ("",) for x in TEMP_ZONES])
ws.cell(r - 1, 1, "หมายเหตุ: เส้นแบ่งช่วงอ่านจากรูปในต้นฉบับ — ดูชีท To_Confirm").font = font(size=8, color="B07A00", italic=True)
r = table(ws, r + 1, "C. ชนิดเสียงผิดปกติของอุปกรณ์ไฮดรอลิก — PDF p.18", ["ชนิดเสียง", "เสียง", "ลักษณะ", "สาเหตุที่คาดได้"], SOUNDS)
table(ws, r + 1, "D. สีน้ำมันไฮดรอลิก — PDF p.21", ["สี", "ความหมาย", "ผลตรวจ", ""],
      [("ใส ไม่มีสี", "น้ำมันใหม่", "○", ""), ("สีน้ำตาล", "น้ำมันเริ่มเสื่อม", "△ *", ""), ("สีดำ", "ตรวจว่าเปลี่ยนเป็นสีดำหรือไม่", "× *", "")])
for col, w in zip("ABCD", (30, 26, 30, 60)):
    ws.column_dimensions[col].width = w
page(ws, landscape=False, paper=9)

# ---------------------------------------------------------------- To_Confirm
ws = wb.create_sheet("To_Confirm")
title(ws, "To Confirm — ประเด็นที่ต้องยืนยันก่อนใช้จริง", "ให้หัวหน้างาน / ฝ่ายซ่อมบำรุง / Safety ยืนยัน แล้วแก้ในชีทที่เกี่ยวข้อง", 7)
header(ws, 4, ["No.", "ประเด็น", "รายละเอียด", "ที่มา / สถานะ", "ผู้ยืนยัน", "วันที่", "ผล / ค่าที่ใช้"], [5, 46, 40, 30, 16, 12, 28])
for i, (a, b, c) in enumerate(CONFIRM, start=1):
    rr = 4 + i
    for k, v in enumerate((i, a, b, c), start=1):
        cell = ws.cell(rr, k, v)
        cell.font, cell.alignment, cell.border = font(size=9), CENTER if k == 1 else WRAP, BOX
    for k in (5, 6, 7):
        ws.cell(rr, k).fill, ws.cell(rr, k).border = fill(INPUT), BOX
    ws.row_dimensions[rr].height = 34
page(ws)

wb.save(OUT)
print("wrote", OUT)
