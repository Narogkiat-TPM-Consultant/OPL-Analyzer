"""Current-shift window resolution and snapshot cache (no database)."""

from __future__ import annotations

from datetime import UTC, datetime, time
from zoneinfo import ZoneInfo

from app.services.oee_realtime import (
    _SNAPSHOT_CACHE,
    DEFAULT_SHIFTS,
    SNAPSHOT_TTL_SEC,
    ShiftSpec,
    clear_snapshot_cache,
    resolve_shift_window_at,
    time_in_shift,
)

BKK = ZoneInfo("Asia/Bangkok")
NIGHT = ShiftSpec("NIGHT", "Night Shift", time(22, 0), time(6, 0), 480)


def _bkk(year: int, month: int, day: int, hour: int, minute: int = 0) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=BKK)


def test_time_in_shift_day_and_overnight():
    assert time_in_shift(time(10, 0), time(8, 0), time(16, 0)) is True
    assert time_in_shift(time(16, 0), time(8, 0), time(16, 0)) is False
    assert time_in_shift(time(23, 0), time(22, 0), time(6, 0)) is True
    assert time_in_shift(time(3, 0), time(22, 0), time(6, 0)) is True
    assert time_in_shift(time(12, 0), time(22, 0), time(6, 0)) is False


def test_day_shift_in_progress_clips_end_to_now():
    now = _bkk(2026, 8, 13, 10, 30)
    window = resolve_shift_window_at(now, DEFAULT_SHIFTS, tz_name="Asia/Bangkok", plant_code="PLT01")
    assert window.shift_code == "DAY"
    assert window.is_in_progress is True
    assert window.is_fallback is False
    assert window.start == _bkk(2026, 8, 13, 8, 0).astimezone(UTC)
    assert window.end == now.astimezone(UTC)
    assert window.elapsed_planned_min == 150.0
    assert window.plant_code == "PLT01"


def test_after_day_shift_uses_completed_window():
    now = _bkk(2026, 8, 13, 17, 15)
    window = resolve_shift_window_at(now, DEFAULT_SHIFTS, tz_name="Asia/Bangkok")
    assert window.shift_code == "DAY"
    assert window.is_in_progress is False
    assert window.end == _bkk(2026, 8, 13, 16, 0).astimezone(UTC)
    assert window.elapsed_planned_min == 480.0


def test_overnight_shift_before_midnight():
    now = _bkk(2026, 8, 13, 23, 10)
    window = resolve_shift_window_at(now, [NIGHT], tz_name="Asia/Bangkok")
    assert window.shift_code == "NIGHT"
    assert window.is_in_progress is True
    assert window.start == _bkk(2026, 8, 13, 22, 0).astimezone(UTC)
    assert window.shift_end == _bkk(2026, 8, 14, 6, 0).astimezone(UTC)


def test_overnight_shift_after_midnight():
    now = _bkk(2026, 8, 14, 3, 0)
    window = resolve_shift_window_at(now, [NIGHT], tz_name="Asia/Bangkok")
    assert window.shift_code == "NIGHT"
    assert window.start == _bkk(2026, 8, 13, 22, 0).astimezone(UTC)
    assert window.end == now.astimezone(UTC)


def test_naive_datetime_treated_as_utc():
    now = datetime(2026, 8, 13, 3, 30)  # 10:30 in Bangkok
    window = resolve_shift_window_at(now, DEFAULT_SHIFTS, tz_name="Asia/Bangkok")
    assert window.shift_code == "DAY"


def test_clear_snapshot_cache():
    _SNAPSHOT_CACHE["x"] = (0.0, {"ok": True})
    clear_snapshot_cache()
    assert _SNAPSHOT_CACHE == {}
    assert SNAPSHOT_TTL_SEC == 30.0
