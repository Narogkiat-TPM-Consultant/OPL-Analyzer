#!/usr/bin/env python3
"""Build the AM Check Sheet workbook for a pneumatic (compressed-air) system from the criteria taught in EP28–EP31
(JIPM-Solutions OPL 5'-C-1 … 5'-C-5, Equipment Skills Training – Pneumatic), with the FRL criteria of EP23–EP26
(OPL 5'-A-4 … 5'-B-2) that those checks rely on.

Usage: python3 make_am_check_sheet_pneumatic.py [output.xlsx]

Every criterion is tagged with its source page. "*" marks a proposal (action, frequency or owner the deck
does not give) for the supervisor to confirm; [DATA REQUIRED] marks a machine value to fill in.
"""
import sys
from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = sys.argv[1] if len(sys.argv) > 1 else "AM_Check_Sheet_Pneumatic_System.xlsx"
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
    ("Drain · วันละ 1 ครั้ง (ต้นกะแรก *) · OPL 5'-C-1, 5'-C-5", [
        ("Air filter: น้ำขังในถ้วยกรอง (Bowl ใส)", "ตา", "ไม่มีน้ำขังในถ้วย",
         "มีน้ำ → เปิดวาล์ว Drain (Manual) ระบายออก · แบบ Auto drain ยังมีน้ำขัง → แจ้งช่าง เปลี่ยนชิ้นส่วน *",
         "PDF p.44, p.49 · ต้นกะ *", "5'-C-1, 5'-C-5 · EP28, EP31, EP26"),
    ]),
    ("ชุด 3 ตัว (FRL) · ดูด้วยตา · OPL 5'-C-5", [
        ("Regulator: Lock nut หลวม", "ตา", "Lock nut แน่น · ค่าตั้งไม่เคลื่อน",
         "หลวม → ขันให้แน่น (ค่าตั้งอาจเคลื่อน) · ค่าตั้งเคลื่อนแล้ว → แจ้งช่างตั้งค่าใหม่ *", "PDF p.49, p.39 · * ข้อเสนอ", "5'-C-5, 5'-A-5 · EP31, EP24"),
        ("Lubricator: น้ำมันในถ้วยขุ่นขาว", "ตา", "น้ำมันใส ไม่ขุ่นขาว",
         "ขุ่นขาว = มีน้ำปน → เปลี่ยนน้ำมันใหม่", "PDF p.49", "5'-C-5 · EP31"),
        ("ถ้วยกรอง / ถ้วยน้ำมัน: แตกร้าว · มองไม่เห็นข้างใน", "ตา", "ไม่แตกร้าว · สะอาด มองเห็นระดับชัด",
         "แตกร้าว → หยุดใช้ แจ้งช่าง * · สกปรก → ทำความสะอาด (ปล่อยลมค้างก่อน)", "PDF p.38, p.46 · * ข้อเสนอ", "5'-A-4 · EP23, EP29"),
    ]),
    ("ขณะเดินเครื่อง (Running) · OPL 5'-C-1, 5'-C-5, 5'-A-6", [
        ("ความเร็วการทำงาน (กระบอกสูบ)", "ตา + นาฬิกาจับเวลา", "เหมือนทุกครั้ง (ช่อง เวลารอบปกติ)",
         "ช้า/เร็วผิดปกติ → แจ้งช่างซ่อมบำรุงทันที", "PDF p.44 · ค่าเวลา [DATA REQUIRED]", "5'-C-1 · EP28"),
        ("ท่อลม: สั่นผิดปกติ", "ตา · มือ (จุดปลอดภัย)", "ไม่สั่นผิดปกติ",
         "สั่นผิดปกติ (= มีปัญหา) → แจ้งช่างซ่อมบำรุงทันที", "PDF p.44", "5'-C-1 · EP28"),
        ("เกจแรงดัน: อยู่ในช่วงใช้งานปกติ", "ตา", "อยู่ในแถบเขียว / ที่ค่าตั้ง (ช่อง ค่าตั้งแรงดัน)",
         "นอกช่วง → แจ้งช่างซ่อมบำรุงทันที", "PDF p.44, p.39 · ค่าตั้ง [DATA REQUIRED]", "5'-C-1, 5'-A-5 · EP28, EP24"),
        ("เข็มเกจ Regulator แกว่งมาก", "ตา", "เข็มนิ่ง ไม่แกว่งมาก",
         "แกว่งมาก = ไส้กรองตัน → เปลี่ยนไส้กรอง (Filter element) · แจ้งช่าง *", "PDF p.49 · * ข้อเสนอ", "5'-C-5 · EP31"),
        ("Lubricator: หยดน้ำมันใน Sight glass (นับ 1 นาที)", "ตา", "หยด 2–6 หยด/นาที (หรือค่าที่ฝ่ายซ่อมกำหนด)",
         "ไม่หยด = × → น้ำมันไปไม่ทั่ว ต้องปรับตั้ง + ซ่อม (แจ้งช่าง *) · หยดนอก 2–6 = △ → ปรึกษาฝ่ายซ่อมก่อนปรับ",
         "PDF p.49, p.40 · △ * ข้อเสนอ", "5'-C-5, 5'-A-6 · EP31, EP25"),
        ("หน้าแปลน · โบลต์ · ที่ยึดท่อ ใกล้เครื่อง: หลวม", "ตา", "ไม่หลวม",
         "หลวม → แจ้งช่างซ่อมบำรุงทันที", "PDF p.44", "5'-C-1 · EP28"),
        ("อื่นๆ ที่พบ (Others): ลมรั่วมีเสียงฟู่ ฯลฯ", "ตา · หู · มือ", "ไม่พบสิ่งผิดปกติ",
         "พบ → ติด F-tag + บันทึกในช่องหมายเหตุ + แจ้งช่าง *", "PDF p.44, p.48 · * ข้อเสนอ", "5'-C-1, 5'-C-5 · EP28, EP31"),
    ]),
]

WEEKLY = [
    ("Lubricator · สัปดาห์ละ 1 ครั้ง (อัตราเดินเครื่องสูง: ทุก 3 วัน) · OPL 5'-C-1, 5'-A-6", [
        ("Lubricator: เติมน้ำมัน (ปล่อยลมค้างก่อนเปิดฝา)", "ตา", "เติมถึงระดับที่กำหนด · ไม่มีน้ำมันพุ่งตอนเปิดฝา",
         "ยังมีแรงดันค้าง → หยุด ปล่อยลมค้างก่อน (ดู Catalog ผู้ผลิต)", "PDF p.44, p.40", "5'-C-1, 5'-A-6 · EP28, EP25"),
        ("Lubricator: น้ำมันลดลงเร็วผิดปกติ (เทียบรอบก่อน)", "ตา", "ลดลงตามปกติ",
         "ลดเร็ว = มีจุดรั่ว → หาจุดรั่วทันที · แจ้งช่าง *", "PDF p.44 · * ข้อเสนอ", "5'-C-1 · EP28"),
    ]),
    ("ช่วงไลน์หยุด · รายการตรวจรวม · OPL 5'-C-1", [
        ("รายการที่อันตรายถ้าตรวจขณะเดินเครื่อง (หน่วยงานกำหนด)", "[DATA REQUIRED]", "[DATA REQUIRED]",
         "พบผิดปกติ → แจ้งช่างซ่อมบำรุง *", "PDF p.44 · รายการ [DATA REQUIRED]", "5'-C-1 · EP28"),
    ]),
    ("การรัดสายลม (Air tube binding) · ความถี่ * · OPL 5'-C-4", [
        ("สายลมที่จุดรัด Binder (เคเบิลไทร์): สายบุบ/แบน", "ตา", "สายกลม · รัดเผื่อระยะ (Ample room)",
         "สายบุบ → แจ้งหัวหน้างาน · รัดใหม่ *", "PDF p.47 · * ข้อเสนอ", "5'-C-4 · EP30"),
        ("Lock band (แบนด์ยึดสาย): ขนาด · จำนวนสาย", "ตา", "ตรงขนาดสาย · ไม่เกินจำนวนที่กำหนด · ไม่ใช้ของทดแทน",
         "ไม่ตรง → แจ้งหัวหน้างาน · เปลี่ยน Band *", "PDF p.47 · * ข้อเสนอ", "5'-C-4 · EP30"),
        ("สายลม: เสียดสีกัน / กับขอบโครงเครื่อง", "ตา", "รัดเป็นระเบียบ · ไม่มีรอยสึก",
         "มีรอยสึก → แจ้งช่าง *", "PDF p.47 · * ข้อเสนอ", "5'-C-4 · EP30"),
    ]),
    ("ชุด 3 ตัว (FRL) · ความถี่ * · OPL 5'-A-4, 5'-A-5", [
        ("เกจแรงดัน: กระจกแตก · เข็มผิดปกติ · มีแถบเขียวที่ค่าตั้ง", "ตา", "กระจกไม่แตก · เข็มปกติ · แถบเขียวชัด",
         "กระจกแตก/เข็มผิดปกติ → เปลี่ยนเกจ · ไม่มีแถบ → ทำแถบเขียวที่ค่าตั้ง", "PDF p.39", "5'-A-5 · EP24"),
    ]),
]

PERIODIC = [
    ("ทุก 3 เดือน: ตรวจการทำงาน · Table 1 · OPL 5'-C-2 (ไม่พบปัญหา → ค่อยๆ ยืดรอบ)", [
        ("Air filter: Auto drain ทำงาน", "3 เดือน", "ระบายน้ำได้เอง", "ไม่ระบาย → แจ้งช่าง เปลี่ยนชิ้นส่วน *", "PDF p.45, p.49", "5'-C-2 · EP29"),
        ("Regulator: ลองหมุนปรับแรงดัน", "3 เดือน", "ขัน → แรงดันเพิ่ม · คลาย → ลด · ตั้งกลับค่าตั้ง + ขัน Lock nut",
         "เกจไม่เปลี่ยนตาม → แจ้งช่างซ่อมบำรุง *", "PDF p.45, p.39", "5'-C-2, 5'-A-5 · EP29, EP24"),
        ("Pressure gauge: ปล่อยแรงดันแล้วดูเข็ม", "3 เดือน", "ชี้ 0", "ไม่ชี้ 0 → เปลี่ยนเกจ *", "PDF p.45", "5'-C-2 · EP29"),
        ("Direction valve: Exhaust port ดูการหล่อลื่น", "3 เดือน", "มีละอองน้ำมันพอดี (ดูชีท Reference A)",
         "น้อย/ไม่มี → ตรวจตำแหน่งติดตั้ง + การปรับ Lubricator · มากไป → ปรับ Lubricator ลด · ลมรั่ว → ดู Valve seat / สปริง",
         "PDF p.45", "5'-C-2 · EP29"),
        ("Speed adjust valve: ลองปรับความเร็ว", "3 เดือน", "ความเร็วเปลี่ยนตามการปรับ", "ไม่เปลี่ยน → แจ้งช่าง *", "PDF p.45", "5'-C-2 · EP29"),
        ("Air cylinder: ลมรั่วที่ก้านสูบ", "3 เดือน", "ไม่รั่ว", "รั่ว → แจ้งช่าง *", "PDF p.45", "5'-C-2 · EP29"),
        ("ลมรั่ว: ระบบท่อ (Table 2)", "3 เดือน", "ไม่รั่วทุกจุด (ดูชีท Reference B)", "รั่ว → ติด F-tag แจ้งช่าง *", "PDF p.45", "5'-C-2 · EP29"),
        ("ลมรั่ว: อุปกรณ์ FRL · วาล์ว · กระบอกสูบ (Table 2)", "3 เดือน", "ไม่รั่วทุกจุด (ดูชีท Reference B)", "รั่ว → ติด F-tag แจ้งช่าง *", "PDF p.45", "5'-C-2 · EP29"),
    ]),
    ("ทุก 1 ปี: ถอดตรวจภายใน · OPL 5'-C-3 (ผู้ทำ: ช่างซ่อมบำรุง PM *) · ปิดลม + ปล่อยลมค้างก่อนถอด", [
        ("Air filter: Case แตกร้าว · ไส้กรองอุดตัน", "1 ปี", "ไม่แตกร้าว · ไม่อุดตัน", "เปลี่ยน Case / ไส้กรอง", "PDF p.46, p.38", "5'-C-3 · EP29"),
        ("Regulator: Diaphragm · สปริง (สนิม/ล้า/หัก) · Packing", "1 ปี", "ไม่เสียหาย ไม่มีรอยบาก", "เปลี่ยนชิ้นส่วน", "PDF p.46", "5'-C-3 · EP29"),
        ("Pressure gauge: ค่าเพี้ยน (Accuracy)", "1 ปี", "ไม่เพี้ยน", "เปลี่ยน / สอบเทียบ *", "PDF p.46", "5'-C-3 · EP29"),
        ("Relief valve: Valve seat · Diaphragm · สปริง", "1 ปี", "ไม่มีรอยบาก ไม่เสียหาย ไม่สนิม/หัก", "เปลี่ยนชิ้นส่วน", "PDF p.46", "5'-C-3 · EP29"),
        ("Direction valve: ฉนวน Coil · Magnet core / สนิม · สปริง", "1 ปี", "ฉนวนดี · Core สมบูรณ์ ไม่สนิม · สปริงไม่หัก", "เปลี่ยนชิ้นส่วน", "PDF p.46", "5'-C-3 · EP29"),
        ("Direction valve: Piston screw/ring · Spool · Diaphragm · O-ring · Cam lever", "1 ปี",
         "ไม่หลวม เคลื่อนที่ราบรื่น · Spool ไม่บาก/สึก · O-ring ไม่เสียรูป/บาก/แข็ง · Cam lever ไม่สึก/เสียรูป", "เปลี่ยนชิ้นส่วน", "PDF p.46", "5'-C-3 · EP29"),
        ("Speed adjust valve: Needle valve · Seat packing", "1 ปี", "ไม่มีรอยบาก ไม่เสียหาย", "เปลี่ยนชิ้นส่วน", "PDF p.46", "5'-C-3 · EP29"),
        ("Air cylinder: ผิวใน Tube · O-ring · Packing", "1 ปี", "ไม่มีรอยบาก ไม่เสียรูป ไม่สึก", "เปลี่ยนชิ้นส่วน", "PDF p.46", "5'-C-3 · EP29"),
    ]),
]

EXHAUST = [  # PDF p.45, Table 1, direction change valve
    ("ละอองน้ำมันน้อย / ไม่มี (If NG)", "น้ำมันไปไม่ถึง", "ตรวจตำแหน่งติดตั้ง Lubricator และการปรับตั้ง"),
    ("ละอองน้ำมันมากไป (If too much)", "จ่ายน้ำมันมากเกิน", "ปรับ Lubricator ลด (ปรึกษาฝ่ายซ่อมก่อน, p.40)"),
    ("มีลมรั่ว (If there is leak)", "วาล์วปิดไม่สนิท", "ตรวจ: ฝุ่นบน Valve seat · Valve seat มีรอยบาก · สปริงหัก/สนิม"),
]
LEAKS = [  # PDF p.45, Table 2
    ("ระบบท่อ (Piping system)", "ข้อต่อเชื่อม (Welding coupling) · ข้อต่อเกลียว (Screw coupling) · ข้อต่อหน้าแปลน (Flange coupling) · Stop valve · สายยาง (Hose)"),
    ("อุปกรณ์ (Accessory / Others)", "Air filter: Case และ Drain cock · Regulator และ Relief hole · Lubricator · ช่องเติมน้ำมัน (Oil opening) · Direction valve และ Exhaust port · Air cylinder"),
]
LUBE = [  # PDF p.40
    ("มาตรฐานหยดน้ำมัน", "2–6 หยด/นาที", "p.40"),
    ("ค่าตั้งจริง", "ขึ้นกับชนิดอุปกรณ์และสภาพการใช้งาน → ปรึกษาฝ่ายซ่อมก่อนปรับ", "p.40"),
    ("วิธีตรวจ", "ดูหยดในหน้าต่างหยดน้ำมันขณะเครื่องเดิน หรือดูน้ำมันที่ Silencer / Oil mist collector", "p.40"),
    ("ก่อนเติมน้ำมัน", "ปล่อยแรงดันค้างก่อน (แบบ Selective ถ้าคลายฝาขณะมีแรงดัน น้ำมันจะพุ่งออก) · ดู Catalog ผู้ผลิต", "p.40"),
    ("รอบเติมน้ำมัน", "สัปดาห์ละ 1 ครั้ง · อัตราเดินเครื่องสูง ทุก 3 วัน · ลดเร็ว = มีรั่ว", "p.44"),
]
BINDING = [  # PDF p.47
    ("จุดประสงค์", "กันสายเสียดสีจากการสัมผัสบ่อย · ทำความสะอาดง่าย"),
    ("NG ①", "รัด Binder แน่นเกิน → สายบุบ/แบน → แรงดันและอัตราไหลไม่พอ"),
    ("NG ②", "Lock band ไม่ตรงขนาดสาย หรือใส่สายเกินจำนวน → ผลเหมือน NG ①"),
    ("OK ①", "รัดด้วย Binder: ดึงอย่างระวัง เผื่อระยะ (Ample room)"),
    ("OK ②", "Lock band: ตรงขนาดสาย + จำนวนสาย · ห้ามใช้ของทดแทน"),
    ("OK ③", "ใช้ Band สำหรับรัดสายลมโดยเฉพาะ ให้ตรงสภาพการรัด"),
]
CONFIRM = [
    ("ค่าตั้งแรงดันของ Regulator และแถบเขียวบนเกจ", "ใช้ในข้อ เกจแรงดัน: อยู่ในช่วงใช้งานปกติ", "[DATA REQUIRED] · PDF p.44, p.39"),
    ("เวลาต่อรอบปกติของกระบอกสูบ (วินาที)", "ใช้ในข้อ ความเร็วการทำงาน", "[DATA REQUIRED] · PDF p.44"),
    ("ค่าหยดน้ำมันของเครื่องนี้ (มาตรฐาน 2–6 หยด/นาที)", "ต้นฉบับให้ปรึกษาฝ่ายซ่อมเพราะขึ้นกับอุปกรณ์", "PDF p.40 · ฝ่ายซ่อมกำหนด"),
    ("ระดับ △ เมื่อหยดนอก 2–6 หยด/นาที", "ต้นฉบับมีแค่ หยด/ไม่หยด", "ข้อเสนอ"),
    ("เวลาตรวจ Drain (ต้นกะแรก)", "ต้นฉบับบอก วันละ 1 ครั้ง และกลางคืนอุณหภูมิลดจึงเกิดน้ำ", "ข้อเสนอ · PDF p.44"),
    ("เปิด Drain แบบ Manual ขณะมีลม หรือปล่อยลมก่อน", "ต้นฉบับเตือนเรื่องแรงดันค้างเฉพาะตอนถอดถ้วย/เติมน้ำมัน", "ให้ Safety ยืนยัน · PDF p.38, p.40"),
    ("วิธีปฏิบัติเมื่อ NG ที่มี * (แจ้งช่าง / หยุดใช้ / รัดใหม่)", "ต้นฉบับบอกจุดตรวจ แต่หลายข้อไม่ระบุผู้ทำ", "ข้อเสนอ"),
    ("ความถี่ของการรัดสายลม · เกจ · ถ้วย ในชีท Weekly_Check", "ต้นฉบับไม่ระบุความถี่", "ข้อเสนอ"),
    ("รายการตรวจที่อันตรายถ้าตรวจขณะเดินเครื่อง", "ต้นฉบับให้หน่วยงานทำรายการเองตอนไลน์หยุด", "[DATA REQUIRED] · PDF p.44"),
    ("ผู้ตรวจรอบ 3 เดือน และ 1 ปี (AM / PM)", "ชุดนี้เสนอให้ PM ถอดตรวจ 1 ปี", "ข้อเสนอ · PDF p.45–46"),
    ("เกณฑ์ยืดรอบ 3 เดือน เมื่อไม่พบปัญหา", "ต้นฉบับให้ค่อยๆ ยืดรอบ แต่ไม่บอกเกณฑ์", "ข้อเสนอ · PDF p.45"),
    ("ล้างถ้วยด้วยน้ำมันก๊าด กับถ้วย Polycarbonate", "ต้นฉบับให้ล้างด้วยน้ำหรือน้ำมันก๊าด", "ตรวจคู่มือผู้ผลิต · PDF p.38"),
    ("“Conduct training” ในหัวข้อ Daily inspection", "คำแปลไม่ชัด จึงไม่ใส่ในชีท", "PDF p.44 · ตรวจกับต้นฉบับญี่ปุ่น"),
    ("คำแปลที่แก้: Lock nut “sagging” = หลวม (緩み) · “murky white” = ขุ่นขาว", "ใช้ในชีท Daily_Check", "แก้คำแปล PDF p.49"),
    ("คำแปลที่แก้: “valve sheet” = Valve seat · “confusion” = เกจเพี้ยน (狂い)", "ใช้ในชีท Periodic_Check", "แก้คำแปล PDF p.45–46"),
    ("Exhaust port “If NG” อ่านว่า ละอองน้ำมันน้อย/ไม่มี", "ใช้ในชีท Reference A", "PDF p.45 · ตรวจกับต้นฉบับญี่ปุ่น"),
    ("เกณฑ์ “เผื่อระยะ” ตอนรัด Binder", "ต้นฉบับไม่มีตัวเลข", "[DATA REQUIRED] · PDF p.47"),
]


# ---------------------------------------------------------------- helpers (same as make_am_check_sheet.py)
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
FIXED_W = [5, 30, 11, 28, 36, 17, 16]

wb = Workbook()

# ---------------------------------------------------------------- How_To_Use
ws = wb.active
ws.title = "How_To_Use"
title(ws, "AM Check Sheet — Pneumatic System (自主保全 点検表 = ใบตรวจ AM · ระบบลม)",
      "จากเกณฑ์ใน OPL 5'-C-1 … 5'-C-5 (EP28–EP31) และ 5'-A-4 … 5'-A-6 (EP23–EP25) · JIPM-Solutions · Equipment Skills Training – Pneumatic", 6)
rows = [
    ("ชีท", "ใช้ทำอะไร"),
    ("Daily_Check", "ตรวจทุกวัน: Drain วันละ 1 ครั้ง → ชุด 3 ตัว (FRL) ด้วยตา → ขณะเดินเครื่อง 4 ข้อ + หยดน้ำมัน · ช่องวันที่ 1–31"),
    ("Weekly_Check", "เติมน้ำมัน Lubricator · รายการตรวจช่วงไลน์หยุด · การรัดสายลม · เกจแรงดัน · ช่องสัปดาห์ W1–W5"),
    ("Periodic_Check", "ทุก 3 เดือน: ตรวจการทำงาน + ลมรั่ว (Table 1–2) · ทุก 1 ปี: ถอดตรวจภายใน · ช่องเดือน ม.ค.–ธ.ค."),
    ("Reference", "ผลที่ Exhaust port · จุดตรวจลมรั่ว · มาตรฐานหยดน้ำมัน · หลักการรัดสายลม"),
    ("To_Confirm", "ประเด็นที่หัวหน้างาน/Safety ต้องยืนยันก่อนใช้จริง"),
    ("", ""),
    ("สัญลักษณ์ผลตรวจ", "○ ปกติ (OK) · △ เฝ้าดู (Watch) · × ผิดปกติ (NG → ทำตามช่อง “เมื่อพบ NG” + ติด F-tag) · — ไม่ได้ตรวจ"),
    ("ช่องที่ต้องกรอก", "ช่องสีเหลือง = ข้อมูลเครื่อง/ลายเซ็น · ช่องตาราง = เลือกจาก drop-down (○ △ × —)"),
    ("คำนวณอัตโนมัติ", "ช่องสีเทา “× รวม” และแถว “จำนวน × / △ ต่อวัน” นับจากตารางให้เอง"),
    ("ที่มา", "PDF p.x = มาจากเอกสารต้นฉบับ · * ข้อเสนอ = ต้นฉบับไม่ระบุ ให้หัวหน้างานยืนยัน · [DATA REQUIRED] = ต้องใส่ค่าของเครื่อง"),
    ("ตัวอย่างการกรอก", "วันที่ 3 ข้อ “Lubricator: หยดน้ำมันใน Sight glass” = ×  (0 หยด/นาที) → แจ้งช่างซ่อมบำรุง ติด F-tag แดง และเขียนหมายเหตุ “0 หยด/นาที เวลา 09:15”"),
    ("ความปลอดภัย", "ก่อนถอดถ้วย/เปลี่ยนไส้กรอง/เติมน้ำมัน: ปล่อยลมค้างให้หมด (ถ้วยอาจหลุดกระเด็น, p.38) · ปิดลม + LOTO + ระวังกระบอกสูบขยับตอนจ่ายลมกลับ (ข้อเสนอ — ยืนยันกับขั้นตอนของโรงงาน)"),
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
title(ws, "AM Check Sheet — Pneumatic System · ตรวจประจำวัน (Daily)",
      "○ ปกติ · △ เฝ้าดู · × ผิดปกติ · — ไม่ได้ตรวจ   |   * = ข้อเสนอ ให้หัวหน้างานยืนยัน   |   ที่มา: OPL 5'-C-1, 5'-C-5, 5'-A-6 (EP28, EP31, EP25)", last_col)
info_row(ws, 3, [("เครื่องจักร", 2, 2), ("Line / แผนก", 5, 2)])
info_row(ws, 4, [("ค่าตั้งแรงดัน Regulator", 2, 2), ("เวลารอบปกติ (วินาที)", 5, 2)])
info_row(ws, 5, [("หยดน้ำมัน (หยด/นาที)", 2, 2), ("ผู้รับผิดชอบ", 5, 2)])
info_row(ws, 6, [("เดือน / ปี", 2, 2)])
for (r, c) in ((4, 3), (4, 6)):
    ws.cell(r, c).value = "[DATA REQUIRED]"
    ws.cell(r, c).font = font(size=9, color="B07A00", italic=True)
ws.cell(5, 3).value = "2–6 (มาตรฐาน p.40)"
ws.cell(5, 3).font = font(size=9, color="B07A00", italic=True)
header(ws, 7, FIXED + days + ["× รวม", "หมายเหตุ"], FIXED_W + [3.6] * len(days) + [7, 26])
dv = marks_validation()
ws.add_data_validation(dv)
first_item, last_item, ng_col = check_grid(ws, 8, DAILY, len(FIXED), days, 2, dv)
fg, lg = len(FIXED) + 1, len(FIXED) + len(days)
add_marks_cf(ws, f"{get_column_letter(fg)}{first_item}:{get_column_letter(lg)}{last_item}")
summary_rows(ws, last_item + 1, first_item, last_item, fg, lg,
             [("จำนวน × ต่อวัน", "×"), ("จำนวน △ ต่อวัน", "△"), ("ผู้ตรวจ (ลงชื่อย่อ)", ""), ("หัวหน้างาน (ลงชื่อย่อ)", "")])
ws.freeze_panes = f"{get_column_letter(fg)}8"
ws.print_title_rows = "7:7"
page(ws)

# ---------------------------------------------------------------- Weekly_Check
ws = wb.create_sheet("Weekly_Check")
weeks = ["W1", "W2", "W3", "W4", "W5"]
last_col = len(FIXED) + len(weeks) + 2
title(ws, "AM Check Sheet — Pneumatic System · ตรวจรายสัปดาห์ (Weekly)",
      "เลือกช่วงที่ไลน์หยุด (p.44) · เติมน้ำมัน Lubricator สัปดาห์ละครั้ง (อัตราเดินเครื่องสูง ทุก 3 วัน) · ข้ออื่นความถี่ * = ข้อเสนอ · ที่มา: OPL 5'-C-1, 5'-C-4, 5'-A-5, 5'-A-6", last_col)
info_row(ws, 3, [("เครื่องจักร", 2, 2), ("Line / แผนก", 5, 2)])
info_row(ws, 4, [("เดือน / ปี", 2, 2), ("ผู้รับผิดชอบ", 5, 2)])
header(ws, 5, FIXED + weeks + ["× รวม", "หมายเหตุ"], FIXED_W + [7] * len(weeks) + [7, 30])
dv = marks_validation()
ws.add_data_validation(dv)
first_item, last_item, ng_col = check_grid(ws, 6, WEEKLY, len(FIXED), weeks, 2, dv)
for r in range(first_item, last_item + 1):
    for c in (3, 4):
        if ws.cell(r, c).value == "[DATA REQUIRED]":
            ws.cell(r, c).fill = fill(INPUT)
            ws.cell(r, c).font = font(size=9, color="B07A00", italic=True)
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
title(ws, "AM / PM Check Sheet — Pneumatic System · ตรวจตามรอบ (3 เดือน / 1 ปี)",
      "ทุก 3 เดือน: Table 1 + ลมรั่ว Table 2 (PDF p.45) · ทุก 1 ปี: ถอดตรวจภายใน (PDF p.46) — ช่องสีเหลือง = กำหนดเดือนที่ตรวจ/ผู้ตรวจ", last_col)
info_row(ws, 3, [("เครื่องจักร", 2, 2), ("Line / แผนก", 5, 2)])
info_row(ws, 4, [("ปี", 2, 2), ("ผู้ตรวจ 3 เดือน / 1 ปี *", 5, 2)])
header(ws, 5, fixed_p + months + ["× รวม", "หมายเหตุ"], FIXED_W[:2] + [10] + FIXED_W[3:] + [6] * len(months) + [7, 26])
dv = marks_validation()
ws.add_data_validation(dv)
first_item, last_item, ng_col = check_grid(ws, 6, PERIODIC, len(fixed_p), months, 2, dv)
fg, lg = len(fixed_p) + 1, len(fixed_p) + len(months)
add_marks_cf(ws, f"{get_column_letter(fg)}{first_item}:{get_column_letter(lg)}{last_item}")
summary_rows(ws, last_item + 1, first_item, last_item, fg, lg, [("จำนวน × ต่อเดือน", "×"), ("ผู้ตรวจ (ลงชื่อย่อ)", "")])
ws.freeze_panes = f"{get_column_letter(fg)}6"
ws.print_title_rows = "5:5"
page(ws)

# ---------------------------------------------------------------- Reference
ws = wb.create_sheet("Reference")
title(ws, "Reference — เกณฑ์ประกอบการตรวจ", "ตามต้นฉบับ OPL 5'-C-2, 5'-A-6, 5'-C-1, 5'-C-4 · ใช้ประกอบข้อ “Exhaust port” “ลมรั่ว” “หยดน้ำมัน” “การรัดสายลม”", 3)


def table(ws, r, caption, cols, rows_):
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
        ws.row_dimensions[r].height = 32
        r += 1
    return r + 1


r = table(ws, 4, "A. ดูการหล่อลื่นที่ Exhaust port ของ Direction valve (ทุก 3 เดือน) — PDF p.45", ["สิ่งที่เห็น", "ความหมาย", "สิ่งที่ต้องทำ"], EXHAUST)
r = table(ws, r, "B. จุดตรวจลมรั่ว (Table 2) — ตรวจพร้อมรอบ 3 เดือน — PDF p.45", ["กลุ่ม", "จุดตรวจ", ""], [x + ("",) for x in LEAKS])
r = table(ws, r, "C. Lubricator: มาตรฐานหยดน้ำมันและการเติม — PDF p.40, p.44", ["หัวข้อ", "เกณฑ์", "ที่มา"], LUBE)
table(ws, r, "D. การรัดสายลม (Air tube binding) — PDF p.47", ["", "รายละเอียด", ""], [x + ("",) for x in BINDING])
for col, w in zip("ABC", (34, 62, 44)):
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
