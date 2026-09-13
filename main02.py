#!/usr/bin/env python3
"""OEE calculator สำหรับชีต NS Loss Analysis (scratch tool — ไม่ใช่ส่วนของ OPL pipeline)

Time-based OEE cascade:
    Availability = Operating Time / Loading Time
    Performance  = Net Operating Time / Operating Time
    Quality      = (Net Operating Time - Quality Loss) / Net Operating Time
    OEE          = A x P x Q

หาแถวจาก "label" ในคอลัมน์แรกเสมอ ไม่ใช้ตำแหน่งแถว (row index) —
ชีตขยับกี่แถวก็ยังคำนวณถูก และถ้าหาไม่เจอจะหยุดพร้อมบอกว่าขาดอะไร ไม่เดาค่า

ใช้งาน:
    python main02.py --csv "NS Loss Analysis OEE FY25.csv" --list-rows
    python main02.py --csv "NS Loss Analysis OEE FY25.csv"
    python main02.py --csv "..." --line L1 --line YTD
    python main02.py --csv "..." --loading 9 --operating 17 --net 21 --quality-loss 20
"""
from __future__ import annotations

import argparse
import re
import sys

import pandas as pd

# label ที่ยอมรับได้ของแต่ละองค์ประกอบ OEE — เพิ่มได้ตามที่ชีตจริงเขียน
METRIC_ALIASES: dict[str, list[str]] = {
    "loading": [
        "loading time", "load time", "loading", "available time",
        "เวลารับภาระ", "เวลาโหลด",
    ],
    "operating": [
        "operating time", "operation time", "run time", "running time",
        "เวลาเดินเครื่อง",
    ],
    "net": [
        "net operating time", "net operation time", "net run time",
        "เวลาเดินเครื่องสุทธิ",
    ],
    "quality_loss": [
        "quality loss", "quality losses", "defect loss", "rework loss",
        "quality defect", "ความสูญเสียคุณภาพ", "ของเสีย",
    ],
}
METRIC_LABEL_TH = {
    "loading": "Loading Time",
    "operating": "Operating Time",
    "net": "Net Operating Time",
    "quality_loss": "Quality Loss",
}


def norm(value) -> str:
    """ทำ label ให้เทียบกันได้: ตัดวรรค/เครื่องหมาย/ตัวพิมพ์ใหญ่-เล็ก"""
    return re.sub(r"[^\w]+", " ", str(value).lower()).strip()


def to_number(value, where: str) -> float:
    """แปลงค่าในเซลล์เป็น float รองรับ '1,234', '(56)', '85.3%', เซลล์ว่าง = error"""
    if isinstance(value, (int, float)) and not pd.isna(value):
        return float(value)
    text = str(value).strip().replace(",", "").replace("%", "")
    negative = text.startswith("(") and text.endswith(")")
    if negative:
        text = text[1:-1].strip()
    if text.lower() in ("", "-", "nan", "none", "n/a"):
        raise ValueError(f"{where}: เซลล์ว่างหรืออ่านไม่ได้ ({value!r})")
    try:
        number = float(text)
    except ValueError:
        raise ValueError(f"{where}: แปลงเป็นตัวเลขไม่ได้ ({value!r})") from None
    return -number if negative else number


def find_row(labels: list[str], metric: str) -> int:
    """คืน index ของแถวที่ตรงกับ metric — ไม่เจอหรือกำกวมให้ raise ไม่เดา"""
    normalized = [norm(x) for x in labels]
    aliases = [norm(a) for a in METRIC_ALIASES[metric]]

    exact = [i for i, lab in enumerate(normalized) if lab in aliases]
    if len(exact) == 1:
        return exact[0]
    if len(exact) > 1:
        found = ", ".join(f"[{i}] {labels[i]!r}" for i in exact)
        raise LookupError(
            f"{METRIC_LABEL_TH[metric]}: label ซ้ำหลายแถว ({found}) "
            f"— ระบุแถวตรง ๆ ด้วย --{metric.replace('_', '-')} <index>"
        )

    # ไม่เจอแบบตรงตัว -> ลอง substring แต่กันไม่ให้ไปชนแถวของ metric อื่น
    reserved = {
        norm(a)
        for other, alias_list in METRIC_ALIASES.items()
        if other != metric
        for a in alias_list
    }
    candidates = [
        i
        for i, lab in enumerate(normalized)
        if lab and lab not in reserved and any(a in lab for a in aliases)
    ]
    if len(candidates) == 1:
        return candidates[0]

    flag = f"--{metric.replace('_', '-')}"
    if not candidates:
        raise LookupError(
            f"{METRIC_LABEL_TH[metric]}: หาแถวไม่เจอ "
            f"(label ที่รองรับ: {', '.join(METRIC_ALIASES[metric])}) "
            f"— ดู label จริงด้วย --list-rows แล้วระบุ {flag} <label หรือ index>"
        )
    found = ", ".join(f"[{i}] {labels[i]!r}" for i in candidates)
    raise LookupError(
        f"{METRIC_LABEL_TH[metric]}: ตรงหลายแถว ({found}) — ระบุ {flag} <index>"
    )


def resolve_rows(labels: list[str], overrides: dict[str, str | None]) -> dict[str, int]:
    """map metric -> row index โดยให้ override ของผู้ใช้ชนะการค้นหาอัตโนมัติ"""
    rows: dict[str, int] = {}
    errors: list[str] = []
    for metric in METRIC_ALIASES:
        override = overrides.get(metric)
        try:
            if override is None:
                rows[metric] = find_row(labels, metric)
            elif re.fullmatch(r"-?\d+", override.strip()):
                index = int(override)
                if not 0 <= index < len(labels):
                    raise LookupError(
                        f"{METRIC_LABEL_TH[metric]}: index {index} เกินช่วง 0..{len(labels) - 1}"
                    )
                rows[metric] = index
            else:
                matched = [i for i, lab in enumerate(labels) if norm(lab) == norm(override)]
                if len(matched) != 1:
                    raise LookupError(
                        f"{METRIC_LABEL_TH[metric]}: label {override!r} เจอ {len(matched)} แถว "
                        f"(ต้องเจอ 1 แถวเท่านั้น)"
                    )
                rows[metric] = matched[0]
        except LookupError as exc:
            errors.append(str(exc))
    if errors:
        raise LookupError("\n".join(errors))
    return rows


def oee_for_column(
    df: pd.DataFrame, label_col: str, column: str, rows: dict[str, int]
) -> dict[str, float]:
    values = {
        metric: to_number(
            df.iloc[index][column], f"คอลัมน์ {column!r} แถว {df.iloc[index][label_col]!r}"
        )
        for metric, index in rows.items()
    }
    for metric in ("loading", "operating", "net"):
        if values[metric] <= 0:
            raise ValueError(f"{METRIC_LABEL_TH[metric]} ต้องมากกว่า 0 (ได้ {values[metric]})")

    availability = values["operating"] / values["loading"]
    performance = values["net"] / values["operating"]
    quality = (values["net"] - values["quality_loss"]) / values["net"]
    return {
        **values,
        "availability": availability,
        "performance": performance,
        "quality": quality,
        "oee": availability * performance * quality,
    }


def print_result(column: str, result: dict[str, float]) -> None:
    print(f"\n=== {column} ===")
    for metric, label in METRIC_LABEL_TH.items():
        print(f"  {label:<22} {result[metric]:>12,.2f}")
    for key, label in (
        ("availability", "Availability (A)"),
        ("performance", "Performance (P)"),
        ("quality", "Quality (Q)"),
        ("oee", "OEE"),
    ):
        warn = "  <-- ผิดปกติ: เกิน 100%" if key != "oee" and result[key] > 1 else ""
        print(f"  {label:<22} {result[key] * 100:>11.2f}%{warn}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="คำนวณ OEE จากชีต Loss Analysis โดยหาแถวจาก label ไม่ใช่ row index",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--csv", default="NS Loss Analysis OEE FY25.csv", help="ไฟล์ CSV ต้นทาง")
    parser.add_argument("--label-col", default=None, help="ชื่อคอลัมน์ label (ปกติเดาจากคอลัมน์แรก)")
    parser.add_argument(
        "--line", action="append", dest="lines", metavar="COL",
        help="คอลัมน์สายการผลิตที่ต้องการ ใส่ซ้ำได้ (ไม่ใส่ = ทุกคอลัมน์)",
    )
    parser.add_argument("--list-rows", action="store_true", help="แสดง index + label ทุกแถวแล้วจบ")
    parser.add_argument("--out", default=None, help="เขียนตารางที่เลือกลง CSV (optional)")
    for metric in METRIC_ALIASES:
        parser.add_argument(
            f"--{metric.replace('_', '-')}", default=None, metavar="LABEL|INDEX",
            help=f"ระบุแถว {METRIC_LABEL_TH[metric]} เอง เมื่อหาอัตโนมัติไม่เจอ",
        )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    try:
        df = pd.read_csv(args.csv, dtype=str)
    except FileNotFoundError:
        print(f"ไม่พบไฟล์: {args.csv}", file=sys.stderr)
        return 1
    if df.empty:
        print(f"ไฟล์ว่าง: {args.csv}", file=sys.stderr)
        return 1

    df.columns = [str(c).strip() for c in df.columns]
    label_col = args.label_col or df.columns[0]
    if label_col not in df.columns:
        print(f"ไม่พบคอลัมน์ label {label_col!r} (มี: {list(df.columns)})", file=sys.stderr)
        return 1

    df[label_col] = df[label_col].fillna("").map(lambda v: str(v).strip())
    df.loc[df[label_col].str.casefold() == "total", label_col] = "YTD"

    if args.list_rows:
        print(f"label column: {label_col!r}")
        for i, label in enumerate(df[label_col]):
            print(f"  [{i:>3}] {label}")
        return 0

    data_cols = [c for c in df.columns if c != label_col]
    columns = args.lines or data_cols
    unknown = [c for c in columns if c not in data_cols]
    if unknown:
        print(f"ไม่พบคอลัมน์ {unknown} (มี: {data_cols})", file=sys.stderr)
        return 1

    overrides = {metric: getattr(args, metric) for metric in METRIC_ALIASES}
    try:
        rows = resolve_rows(list(df[label_col]), overrides)
    except LookupError as exc:
        print(exc, file=sys.stderr)
        return 1

    print(f"แถวที่ใช้ (จาก {args.csv}):")
    for metric, index in rows.items():
        print(f"  {METRIC_LABEL_TH[metric]:<22} -> [{index}] {df.iloc[index][label_col]!r}")

    failed = False
    for column in columns:
        try:
            print_result(column, oee_for_column(df, label_col, column, rows))
        except ValueError as exc:
            print(f"\n=== {column} ===\n  ข้าม: {exc}", file=sys.stderr)
            failed = True

    if args.out:
        df[[label_col, *columns]].to_csv(args.out, index=False)
        print(f"\nเขียนตารางที่เลือกลง {args.out}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
