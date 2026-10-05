#!/usr/bin/env python3
"""Build one AM Calendar for a machine that has both a hydraulic unit and a pneumatic system, from the AM_Standard
rows of make_am_standard_hydraulic.py and make_am_standard_pneumatic.py (same data, same month plan).

Sheets: How_To_Use · AM_Calendar (12 months, both systems) · Monthly_Load (minutes per month, formulas) ·
Periodic_Record (plan vs actual for 3M/6M/1Y work) · To_Confirm.

Usage: python3 make_am_calendar_combined.py [output.xlsx]
"""
import sys

from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

import make_am_standard_hydraulic as HYD
import make_am_standard_pneumatic as PN
from am_standard_common import (BOX, CENTER, CILT_FILL, FREQ_FILL, GREY, INK, INPUT, MONTHS, NAVY, WRAPC, fill, font,
                                freq_code, group_row, header, months_for, page, plan_text, put, risk_cf, risk_of, title)

OUT = sys.argv[1] if len(sys.argv) > 1 else "AM_Calendar_Combined.xlsx"
SYSTEMS = [("ไฮดรอลิก", "H", HYD), ("ระบบลม", "P", PN)]
FIRST_MONTH_COL = 10  # J
TARGET = 10  # AM minutes per shift, AM Step 3 target (am-skill)


def activities(mod, prefix):
    """Yield ('GROUP', text) or a dict per AM_Standard row, numbered as in that system's AM_Standard sheet."""
    risk = {p[0]: risk_of(p[11], p[13], p[15]) for p in mod.PARTS}
    no = 0
    for row in mod.STD:
        if row[0] == "GROUP":
            yield ("GROUP", row[1])
            continue
        no += 1
        pid, cp, cilt, _, _, _, freq, mins, _, _, resp, cs, _ = row
        yield {"no": f"{prefix}-{no:02d}", "pid": pid, "cp": cp, "cilt": cilt, "freq": freq, "mins": mins, "resp": resp,
               "cs": cs, "risk": risk.get(pid, "—"), "code": freq_code(freq), "months": months_for(freq_code(freq), mod.T.get("months"))}


wb = Workbook()

# ---------------------------------------------------------------- How_To_Use
ws = wb.active
ws.title = "How_To_Use"
title(ws, "AM Calendar — ไฮดรอลิก + ระบบลม (自主保全カレンダー = ปฏิทิน AM รวม)",
      "รวมกิจกรรม CILT จาก AM_Standard_Hydraulic_Unit.xlsx และ AM_Standard_Pneumatic_System.xlsx ลงปฏิทินเดียว สำหรับเครื่องที่มีทั้ง 2 ระบบ", 6)
for i, (a, b) in enumerate([
        ("ชีท", "ใช้ทำอะไร"),
        ("AM_Calendar", "กิจกรรมทั้ง 2 ระบบ × 12 เดือน · No. H-xx / P-xx = ลำดับในชีท AM_Standard ของแต่ละระบบ · เลื่อนเดือนของงานตามรอบได้ (แก้ตัวอักษรในช่องเดือน)"),
        ("Monthly_Load", "เวลา AM ต่อเดือน (นาที) แยกระบบและงาน PM · ใช้สูตรอ่านจาก AM_Calendar · ช่องเหลือง = วันทำงาน/สัปดาห์ต่อเดือน"),
        ("Periodic_Record", "แผน vs ผลจริงของงานตามรอบ (3M / 6M / 1Y) · กรอกวันที่ทำ ผู้ทำ ผล · % ทำตามแผนคำนวณเอง"),
        ("To_Confirm", "ประเด็นที่ต้องยืนยันก่อนใช้จริง"),
        ("", ""),
        ("รหัสความถี่", "D = ทุกวัน · W = รายสัปดาห์ · Q = ทุก 3 เดือน · S = ทุก 6 เดือน · A = ทุก 1 ปี · งาน “เมื่อพบ / ทุกครั้งที่ซ่อม” ไม่มีเดือน"),
        ("เกลี่ยภาระ (平準化)", "ไฮดรอลิก: " + plan_text(HYD.T.get("months")) + "\nระบบลม: " + plan_text(PN.T.get("months"))
         + "\nเหตุผล: ไม่ให้งานถอดตรวจ 1 ปีของทั้ง 2 ระบบตกเดือนเดียวกัน (ข้อเสนอ * ให้วางตามแผนหยุดเครื่องจริง)"),
        ("บันทึกงานรายวัน/สัปดาห์", "ใช้ AM_Check_Sheet ของแต่ละระบบ (คอลัมน์สุดท้ายของ AM_Calendar บอกเลขข้อ)"),
        ("Risk", "ค่าจาก FMEA ใน AM Standard ณ วันที่สร้างไฟล์ · ถ้าแก้ S/O/D ใน AM Standard ให้รันสคริปต์สร้างไฟล์นี้ใหม่"),
        ("ป้ายที่มา", "* = ข้อเสนอ · [DATA REQUIRED] = ข้อมูลของโรงงาน (ช่องเหลือง) · เวลา = ประมาณการจาก AM Standard [INFER]"),
], start=4):
    head = i == 4
    ws.cell(i, 1, a).font = font(True, 10, "FFFFFF" if head else INK)
    ws.merge_cells(start_row=i, start_column=2, end_row=i, end_column=6)
    ws.cell(i, 2, b).font = font(head, 10, "FFFFFF" if head else INK)
    for k in range(1, 7):
        ws.cell(i, k).border = BOX if a or b else Border()
        ws.cell(i, k).alignment = WRAPC
        if head:
            ws.cell(i, k).fill = fill(NAVY)
    ws.row_dimensions[i].height = 62 if a.startswith("เกลี่ย") else (36 if a else 10)
ws.column_dimensions["A"].width = 20
for col in "BCDEF":
    ws.column_dimensions[col].width = 26
page(ws, landscape=False, paper=9)

# ---------------------------------------------------------------- AM_Calendar
ws = wb.create_sheet("AM_Calendar")
cols = ["No.", "ระบบ", "Part ID", "กิจกรรม (Check point)", "CILT", "ความถี่", "เวลา (นาที)", "Risk", "ผู้รับผิดชอบ"] + MONTHS + ["ข้อใน AM Check Sheet"]
title(ws, "AM Calendar รวม — ไฮดรอลิก + ระบบลม · ปี ……",
      "D ทุกวัน · W รายสัปดาห์ · Q 3 เดือน · S 6 เดือน · A 1 ปี · เดือนของงานตามรอบเกลี่ยแล้ว (ข้อเสนอ *) · แก้ตัวอักษรในช่องเดือนได้ ชีท Monthly_Load จะคำนวณใหม่", len(cols))
header(ws, 4, cols, [7, 10, 7, 40, 6, 15, 7, 11, 13] + [5.5] * 12 + [12])
r = 5
first_row = None
records = []
for sys_name, prefix, mod in SYSTEMS:
    group_row(ws, r, f"ระบบ{sys_name}" if not sys_name.startswith("ระบบ") else sys_name, len(cols))
    ws.cell(r, 1).font = font(True, 11, "FFFFFF")
    for k in range(1, len(cols) + 1):
        ws.cell(r, k).fill = fill("1F5FBF")
    r += 1
    for a in activities(mod, prefix):
        if isinstance(a, tuple):
            group_row(ws, r, a[1], len(cols))
            r += 1
            continue
        first_row = first_row or r
        vals = (a["no"], sys_name, a["pid"], a["cp"], a["cilt"], a["freq"], a["mins"], a["risk"], a["resp"])
        for k, v in enumerate(vals, start=1):
            put(ws, r, k, v, bold=(k in (1, 8)), align=WRAPC if k == 4 else CENTER)
        ws.cell(r, 5).fill = fill(CILT_FILL.get(a["cilt"][0], GREY))
        for m in range(12):
            c = put(ws, r, FIRST_MONTH_COL + m, None, align=CENTER)
            if a["code"] and m in a["months"]:
                c.value = a["code"]
        put(ws, r, FIRST_MONTH_COL + 12, a["cs"], align=CENTER)
        ws.row_dimensions[r].height = 30
        if a["code"] in ("Q", "S", "A"):
            records.append((a, sys_name))
        elif a["code"] is None:
            records.append((a, sys_name))
        r += 1
last_row = r - 1
risk_cf(ws, f"H{first_row}:H{last_row}")
mrange = f"{get_column_letter(FIRST_MONTH_COL)}{first_row}:{get_column_letter(FIRST_MONTH_COL + 11)}{last_row}"
for code, color in FREQ_FILL.items():
    ws.conditional_formatting.add(mrange, CellIsRule(operator="equal", formula=[f'"{code}"'], fill=fill(color), font=font(True, 9)))
mdv = DataValidation(type="list", formula1='"D,W,Q,S,A"', allow_blank=True)
mdv.prompt, mdv.promptTitle = "D ทุกวัน · W รายสัปดาห์ · Q 3 เดือน · S 6 เดือน · A 1 ปี · ลบ = ไม่ทำเดือนนี้", "รหัสความถี่"
ws.add_data_validation(mdv)
mdv.add(mrange)
r += 1
for i, (code, txt) in enumerate([("D", "ทุกวัน"), ("W", "รายสัปดาห์"), ("Q", "3 เดือน"), ("S", "6 เดือน"), ("A", "1 ปี")]):
    c = put(ws, r, FIRST_MONTH_COL + i * 2, code, bold=True, align=CENTER)
    c.fill = fill(FREQ_FILL[code])
    put(ws, r, FIRST_MONTH_COL + i * 2 + 1, txt, align=CENTER)
ws.freeze_panes = "E5"
ws.print_title_rows = "4:4"
page(ws)

# ---------------------------------------------------------------- Monthly_Load
ws = wb.create_sheet("Monthly_Load")
title(ws, "Monthly Load — เวลา AM ต่อเดือน (นาที)",
      "สูตรอ่านจาก AM_Calendar · ช่องเหลือง = วันทำงาน / จำนวนสัปดาห์ต่อเดือน (ค่าตัวอย่าง [ASSUME] แก้ตามปฏิทินโรงงาน) · ตามรอบ = ผลรวมเวลาของ Q/S/A ในเดือนนั้น", 14)
header(ws, 4, ["รายการ"] + MONTHS + ["รวมทั้งปี"], [40] + [8] * 12 + [11])
CAL = "AM_Calendar"
rng = lambda col: f"{CAL}!${col}${first_row}:${col}${last_row}"


def label(r, text, bold=False, fill_hex=None):
    c = put(ws, r, 1, text, bold=bold, align=WRAPC)
    if fill_hex:
        c.fill = fill(fill_hex)


label(5, "วันทำงานในเดือน (ตัวอย่าง [ASSUME])", True)
label(6, "จำนวนสัปดาห์ในเดือน (ตัวอย่าง [ASSUME])", True)
for m in range(12):
    col = 2 + m
    for rr, v in ((5, 26), (6, 4)):
        c = put(ws, rr, col, v, align=CENTER)
        c.fill = fill(INPUT)
row = 8
total_rows, pm_terms = [], []
daily_cells = {}
for sys_name, prefix, mod in SYSTEMS:
    group_row(ws, row, f"ระบบ{sys_name}" if not sys_name.startswith("ระบบ") else sys_name, 14)
    row += 1
    d_per_day = f'SUMIFS({rng("G")},{rng("B")},"{sys_name}",{rng("F")},"D*")'
    w_per_week = f'SUMIFS({rng("G")},{rng("B")},"{sys_name}",{rng("F")},"W*")'
    label(row, "งานรายวัน (นาที/วัน × วันทำงาน)")
    label(row + 1, "งานรายสัปดาห์ (นาที/สัปดาห์ × สัปดาห์)")
    label(row + 2, "งานตามรอบ Q / S / A")
    label(row + 3, f"รวม{sys_name}", True, "E3ECF9")
    for m in range(12):
        col = get_column_letter(2 + m)
        mcol = get_column_letter(FIRST_MONTH_COL + m)
        put(ws, row, 2 + m, f"={d_per_day}*{col}$5", align=CENTER)
        put(ws, row + 1, 2 + m, f"={w_per_week}*{col}$6", align=CENTER)
        per = "+".join(f'SUMIFS({rng("G")},{rng("B")},"{sys_name}",{rng(mcol)},"{q}")' for q in ("Q", "S", "A"))
        put(ws, row + 2, 2 + m, f"={per}", align=CENTER)
        c = put(ws, row + 3, 2 + m, f"=SUM({col}{row}:{col}{row + 2})", bold=True, align=CENTER)
        c.fill = fill("E3ECF9")
        pm_terms.append((m, "+".join(f'SUMIFS({rng("G")},{rng("B")},"{sys_name}",{rng(mcol)},"{q}",{rng("I")},"PM*")' for q in ("Q", "S", "A"))))
    for rr in range(row, row + 4):
        put(ws, rr, 14, f"=SUM(B{rr}:M{rr})", bold=(rr == row + 3), align=CENTER).fill = fill(GREY)
    total_rows.append(row + 3)
    daily_cells[sys_name] = d_per_day
    row += 5
label(row, "รวมทั้งสองระบบ (นาที/เดือน)", True, "FCE7B2")
label(row + 1, "ในนั้นเป็นงาน PM ตามรอบ (ผู้รับผิดชอบ PM)", True)
for m in range(12):
    col = get_column_letter(2 + m)
    c = put(ws, row, 2 + m, "=" + "+".join(f"{col}{t}" for t in total_rows), bold=True, align=CENTER)
    c.fill = fill("FCE7B2")
    put(ws, row + 1, 2 + m, "=" + "+".join(t for mm, t in pm_terms if mm == m), align=CENTER)
for rr in (row, row + 1):
    put(ws, rr, 14, f"=SUM(B{rr}:M{rr})", bold=True, align=CENTER).fill = fill(GREY)
peak_row = row + 3
label(peak_row, "เดือนที่ภาระรวมสูงสุด", True)
ws.merge_cells(start_row=peak_row, start_column=2, end_row=peak_row, end_column=4)
put(ws, peak_row, 2, f"=INDEX($B$4:$M$4,MATCH(MAX(B{row}:M{row}),B{row}:M{row},0))&\" · \"&MAX(B{row}:M{row})&\" นาที\"", bold=True, align=CENTER)

# daily time vs target
t0 = peak_row + 2
ws.merge_cells(start_row=t0, start_column=1, end_row=t0, end_column=14)
ws.cell(t0, 1, "เวลา AM รายวัน เทียบเป้า AM Step 3 (< 10 นาที/กะ) — กรณีเครื่องเดียวมีทั้ง 2 ระบบ").font = font(True, 11, "1F5FBF")
for i, (lab, formula) in enumerate([
        ("ไฮดรอลิก (นาที/วัน)", "=" + daily_cells["ไฮดรอลิก"]),
        ("ระบบลม (นาที/วัน)", "=" + daily_cells["ระบบลม"]),
        ("รวม 2 ระบบ (นาที/วัน)", f"=B{t0 + 1}+B{t0 + 2}"),
], start=1):
    label(t0 + i, lab, True)
    put(ws, t0 + i, 2, formula, bold=True, align=CENTER).fill = fill(GREY)
    res = put(ws, t0 + i, 3, f'=IF(B{t0 + i}<{TARGET},"ผ่าน","เกิน")', bold=True, align=CENTER)
ws.conditional_formatting.add(f"C{t0 + 1}:C{t0 + 3}", CellIsRule(operator="equal", formula=['"เกิน"'], fill=fill("F8C9CF")))
ws.conditional_formatting.add(f"C{t0 + 1}:C{t0 + 3}", CellIsRule(operator="equal", formula=['"ผ่าน"'], fill=fill("C8E6C9")))
ws.merge_cells(start_row=t0 + 4, start_column=1, end_row=t0 + 4, end_column=14)
ws.cell(t0 + 4, 1, "เกินเป้า → ใช้ Kaizen ในชีท Kaizen_IoT_CBM ของ AM Standard (เช่น Match mark · แผ่นซับใต้จุดรั่ว · Auto drain) และจับเวลาจริงก่อนสรุป").font = font(size=9, color="B07A00", italic=True)
ws.freeze_panes = "B5"
page(ws)

# ---------------------------------------------------------------- Periodic_Record
ws = wb.create_sheet("Periodic_Record")
cols = ["No.", "ระบบ", "กิจกรรม", "ความถี่", "เดือนตามแผน", "เวลา (นาที)", "ผู้รับผิดชอบ", "วันที่ทำจริง", "ผู้ทำ", "ผล", "หมายเหตุ"]
title(ws, "Periodic Record — แผน vs ผลจริง งานตามรอบ (3M / 6M / 1Y)",
      "เดือนตามแผนมาจาก AM_Calendar ตอนสร้างไฟล์ (ถ้าเลื่อนเดือนในปฏิทิน ให้แก้ช่องเดือนที่นี่ด้วย) · ผล: ○ ปกติ · △ เฝ้าดู · × ผิดปกติ (ติด F-tag)", len(cols))
header(ws, 4, cols, [9, 10, 44, 15, 12, 8, 14, 13, 14, 7, 28])
rdv = DataValidation(type="list", formula1='"○,△,×"', allow_blank=True)
ws.add_data_validation(rdv)
r = 5
for a, sys_name in records:
    if a["code"] is None:
        continue
    for m in a["months"]:
        vals = (a["no"], sys_name, a["cp"], a["freq"], MONTHS[m], a["mins"], a["resp"])
        for k, v in enumerate(vals, start=1):
            put(ws, r, k, v, align=WRAPC if k == 3 else CENTER)
        for k in (8, 9, 10, 11):
            put(ws, r, k, None, align=CENTER).fill = fill(INPUT)
        rdv.add(f"J{r}")
        ws.row_dimensions[r].height = 28
        r += 1
rec_last = r - 1
ws.conditional_formatting.add(f"J5:J{rec_last}", CellIsRule(operator="equal", formula=['"×"'], fill=fill("F8C9CF")))
ws.conditional_formatting.add(f"J5:J{rec_last}", CellIsRule(operator="equal", formula=['"△"'], fill=fill("FCE7B2")))
r += 1
put(ws, r, 3, "ทำตามแผนแล้ว (%)", bold=True, align=Alignment(horizontal="right", vertical="center"))
c = put(ws, r, 5, f"=IFERROR(COUNTA(H5:H{rec_last})/ROWS(H5:H{rec_last}),0)", bold=True, align=CENTER)
c.number_format = "0%"
c.fill = fill(GREY)
put(ws, r + 1, 3, "พบผิดปกติ (×)", bold=True, align=Alignment(horizontal="right", vertical="center"))
put(ws, r + 1, 5, f'=COUNTIF(J5:J{rec_last},"×")', bold=True, align=CENTER).fill = fill(GREY)
r += 3
group_row(ws, r, "งานตามเหตุการณ์ (ไม่มีเดือน) — บันทึกเมื่อเกิด", len(cols))
r += 1
for a, sys_name in records:
    if a["code"] is not None:
        continue
    for k, v in enumerate((a["no"], sys_name, a["cp"], a["freq"], "—", a["mins"], a["resp"]), start=1):
        put(ws, r, k, v, align=WRAPC if k == 3 else CENTER)
    for k in (8, 9, 10, 11):
        put(ws, r, k, None, align=CENTER).fill = fill(INPUT)
    rdv.add(f"J{r}")
    ws.row_dimensions[r].height = 28
    r += 1
ws.freeze_panes = "D5"
ws.print_title_rows = "4:4"
page(ws)

# ---------------------------------------------------------------- To_Confirm
ws = wb.create_sheet("To_Confirm")
title(ws, "To Confirm — ประเด็นที่ต้องยืนยันก่อนใช้จริง", "ให้หัวหน้างาน / ฝ่ายซ่อมบำรุง / ฝ่ายวางแผนผลิต ยืนยัน", 7)
header(ws, 4, ["No.", "ประเด็น", "รายละเอียด", "ที่มา / สถานะ", "ผู้ยืนยัน", "วันที่", "ผล / ค่าที่ใช้"], [5, 48, 42, 24, 16, 12, 26])
for i, (a, b, c) in enumerate([
        ("เดือนของงาน Q / S / A", "เกลี่ยแล้วไม่ให้ 1Y ของ 2 ระบบชนกัน · ต้องวางตรงแผนหยุดเครื่อง/วันหยุดยาว", "ข้อเสนอ *"),
        ("วันทำงานและจำนวนสัปดาห์ต่อเดือน", "ค่าตัวอย่าง 26 วัน / 4 สัปดาห์", "[ASSUME] → ปฏิทินโรงงาน"),
        ("เวลาต่อกิจกรรม", "ประมาณการจาก AM Standard · จับเวลาจริงช่วงทดลองใช้", "[INFER]"),
        ("งานรายวันทำกะไหน", "เวลา AM รายวันคิดครั้งเดียวต่อวัน · ถ้าแบ่งหลายกะ ให้กำหนดกะที่รับผิดชอบ", "[DATA REQUIRED]"),
        ("แบ่งงาน Operator (AM) / PM", "ผู้รับผิดชอบที่มี * เป็นข้อเสนอ (เช่น ถอดตรวจ 1 ปี = PM)", "ข้อเสนอ · AM Step 5 แบ่งบทบาท"),
        ("Risk ในปฏิทิน", "สำเนาจาก FMEA ณ วันที่สร้าง · แก้ S/O/D แล้วต้องสร้างไฟล์ใหม่", "จาก AM Standard"),
], start=1):
    rr = 4 + i
    for k, v in enumerate((i, a, b, c), start=1):
        put(ws, rr, k, v, align=CENTER if k == 1 else WRAPC)
    for k in (5, 6, 7):
        put(ws, rr, k, None).fill = fill(INPUT)
    ws.row_dimensions[rr].height = 36
page(ws)

wb.save(OUT)
print("wrote", OUT, "activities", sum(1 for _ in range(first_row, last_row + 1)), "periodic records", rec_last - 4)
