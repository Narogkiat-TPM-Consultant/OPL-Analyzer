"""Current-shift window + short-TTL OEE snapshot.

KPI numbers still come from oee_engine. This module only resolves "now / กะนี้"
to a plant-local shift window and caches the combined snapshot briefly.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from datetime import time as dt_time
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.oee import OeePlant, OeeShift
from app.services.oee_engine import rank_machines_by_breakdown, summarize_oee, top_downtime

DEFAULT_PLANT_TZ = "Asia/Bangkok"
SNAPSHOT_TTL_SEC = 30.0


@dataclass(frozen=True)
class ShiftSpec:
    code: str
    name: str
    start_time: dt_time
    end_time: dt_time
    planned_minutes: int


DEFAULT_SHIFTS: tuple[ShiftSpec, ...] = (
    ShiftSpec("DAY", "Day Shift", dt_time(8, 0), dt_time(16, 0), 480),
)


@dataclass(frozen=True)
class ShiftWindow:
    shift_code: str
    shift_name: str
    timezone: str
    start: datetime
    end: datetime
    shift_end: datetime
    planned_minutes: int
    elapsed_planned_min: float
    is_fallback: bool
    is_in_progress: bool
    plant_code: str | None

    def as_dict(self) -> dict[str, Any]:
        return {
            "code": self.shift_code,
            "name": self.shift_name,
            "timezone": self.timezone,
            "period_start": self.start.isoformat(),
            "period_end": self.end.isoformat(),
            "shift_end": self.shift_end.isoformat(),
            "planned_minutes": self.planned_minutes,
            "elapsed_planned_min": self.elapsed_planned_min,
            "is_fallback": self.is_fallback,
            "is_in_progress": self.is_in_progress,
            "plant_code": self.plant_code,
        }


def _as_tz(name: str) -> ZoneInfo:
    try:
        return ZoneInfo(name)
    except Exception:
        return ZoneInfo(DEFAULT_PLANT_TZ)


def _aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


def time_in_shift(now_t: dt_time, start: dt_time, end: dt_time) -> bool:
    """True when local clock is inside [start, end). Overnight: start > end."""
    if start < end:
        return start <= now_t < end
    return now_t >= start or now_t < end


def resolve_shift_window_at(
    now: datetime,
    shifts: list[ShiftSpec] | tuple[ShiftSpec, ...],
    *,
    tz_name: str = DEFAULT_PLANT_TZ,
    plant_code: str | None = None,
) -> ShiftWindow:
    """Pick the in-progress shift, else the latest completed today, else calendar day."""
    now = _aware(now)
    tz = _as_tz(tz_name)
    now_local = now.astimezone(tz)
    specs = list(shifts) or list(DEFAULT_SHIFTS)

    for spec in specs:
        if not time_in_shift(now_local.time(), spec.start_time, spec.end_time):
            continue
        start_utc, shift_end_utc = _absolute_shift_bounds(now_local, spec, tz)
        end_utc = min(now, shift_end_utc)
        elapsed = max(0.0, (end_utc - start_utc).total_seconds() / 60.0)
        return ShiftWindow(
            shift_code=spec.code,
            shift_name=spec.name,
            timezone=tz_name,
            start=start_utc,
            end=end_utc,
            shift_end=shift_end_utc,
            planned_minutes=spec.planned_minutes,
            elapsed_planned_min=min(elapsed, float(spec.planned_minutes)),
            is_fallback=False,
            is_in_progress=now < shift_end_utc,
            plant_code=plant_code,
        )

    completed: list[tuple[datetime, datetime, ShiftSpec]] = []
    for spec in specs:
        start_utc, shift_end_utc = _absolute_shift_bounds(now_local, spec, tz)
        if spec.start_time > spec.end_time and now_local.time() >= spec.start_time:
            pass
        elif shift_end_utc > now:
            # Upcoming shift later today — look at yesterday's occurrence
            start_utc, shift_end_utc = _absolute_shift_bounds(
                now_local - timedelta(days=1), spec, tz
            )
        if shift_end_utc <= now:
            completed.append((start_utc, shift_end_utc, spec))

    if completed:
        start_utc, shift_end_utc, spec = max(completed, key=lambda item: item[1])
        elapsed = (shift_end_utc - start_utc).total_seconds() / 60.0
        return ShiftWindow(
            shift_code=spec.code,
            shift_name=spec.name,
            timezone=tz_name,
            start=start_utc,
            end=shift_end_utc,
            shift_end=shift_end_utc,
            planned_minutes=spec.planned_minutes,
            elapsed_planned_min=min(elapsed, float(spec.planned_minutes)),
            is_fallback=False,
            is_in_progress=False,
            plant_code=plant_code,
        )

    day_start = datetime.combine(now_local.date(), dt_time(0, 0), tzinfo=tz).astimezone(UTC)
    elapsed = max(0.0, (now - day_start).total_seconds() / 60.0)
    return ShiftWindow(
        shift_code="CALENDAR_DAY",
        shift_name="Calendar day (no matching shift)",
        timezone=tz_name,
        start=day_start,
        end=now,
        shift_end=now,
        planned_minutes=max(1, int(elapsed)),
        elapsed_planned_min=elapsed,
        is_fallback=True,
        is_in_progress=True,
        plant_code=plant_code,
    )


def _absolute_shift_bounds(
    now_local: datetime,
    spec: ShiftSpec,
    tz: ZoneInfo,
) -> tuple[datetime, datetime]:
    local_date = now_local.date()
    if spec.start_time < spec.end_time:
        start_local = datetime.combine(local_date, spec.start_time, tzinfo=tz)
        end_local = datetime.combine(local_date, spec.end_time, tzinfo=tz)
        return start_local.astimezone(UTC), end_local.astimezone(UTC)

    # Overnight: if we are after start (evening) the window ends tomorrow;
    # if we are before end (early morning) it started yesterday.
    if now_local.time() >= spec.start_time:
        start_local = datetime.combine(local_date, spec.start_time, tzinfo=tz)
        end_local = datetime.combine(local_date + timedelta(days=1), spec.end_time, tzinfo=tz)
    else:
        start_local = datetime.combine(local_date - timedelta(days=1), spec.start_time, tzinfo=tz)
        end_local = datetime.combine(local_date, spec.end_time, tzinfo=tz)
    return start_local.astimezone(UTC), end_local.astimezone(UTC)


async def load_shift_specs(
    session: AsyncSession,
    plant_code: str | None = None,
) -> tuple[str | None, str, list[ShiftSpec]]:
    """Return (plant_code, timezone, shifts). Falls back to demo DAY 08-16."""
    stmt = select(OeePlant).where(OeePlant.is_active.is_(True))
    stmt = stmt.where(OeePlant.code == plant_code) if plant_code else stmt.order_by(OeePlant.code)
    plant = (await session.scalars(stmt)).first()
    if plant is None:
        return plant_code, DEFAULT_PLANT_TZ, list(DEFAULT_SHIFTS)

    shift_rows = (
        await session.scalars(
            select(OeeShift).where(
                OeeShift.plant_id == plant.id,
                OeeShift.is_active.is_(True),
            )
        )
    ).all()
    specs = [
        ShiftSpec(
            code=row.code,
            name=row.name,
            start_time=row.start_time,
            end_time=row.end_time,
            planned_minutes=row.planned_minutes,
        )
        for row in shift_rows
    ]
    if not specs:
        specs = list(DEFAULT_SHIFTS)
    return plant.code, plant.timezone or DEFAULT_PLANT_TZ, specs


async def resolve_current_shift_window(
    session: AsyncSession,
    *,
    plant_code: str | None = None,
    now: datetime | None = None,
) -> ShiftWindow:
    resolved_code, tz_name, specs = await load_shift_specs(session, plant_code)
    return resolve_shift_window_at(
        now or datetime.now(UTC),
        specs,
        tz_name=tz_name,
        plant_code=resolved_code,
    )


_SNAPSHOT_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}


def clear_snapshot_cache() -> None:
    _SNAPSHOT_CACHE.clear()


def _cache_key(
    plant_code: str | None,
    line_code: str | None,
    machine_code: str | None,
    window: ShiftWindow,
) -> str:
    bucket = int(time.time() // SNAPSHOT_TTL_SEC)
    return (
        f"{plant_code}|{line_code}|{machine_code}|"
        f"{window.shift_code}|{window.start.isoformat()}|{bucket}"
    )


async def build_current_shift_snapshot(
    session: AsyncSession,
    *,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    now: datetime | None = None,
    limit: int = 5,
) -> dict[str, Any]:
    """OEE + top downtime + ranking for the current (or just-ended) shift."""
    window = await resolve_current_shift_window(session, plant_code=plant_code, now=now)
    key = _cache_key(plant_code or window.plant_code, line_code, machine_code, window)
    cached = _SNAPSHOT_CACHE.get(key)
    if cached and (time.time() - cached[0]) < SNAPSHOT_TTL_SEC:
        payload = dict(cached[1])
        payload["cache"] = {"hit": True, "ttl_sec": SNAPSHOT_TTL_SEC}
        return payload

    planned = window.elapsed_planned_min if window.is_in_progress else float(window.planned_minutes)
    summary = await summarize_oee(
        session,
        period_start=window.start,
        period_end=window.end,
        plant_code=plant_code or window.plant_code,
        line_code=line_code,
        machine_code=machine_code,
        planned_time_min=planned,
    )
    downtime = await top_downtime(
        session,
        period_start=window.start,
        period_end=window.end,
        plant_code=plant_code or window.plant_code,
        line_code=line_code,
        machine_code=machine_code,
        limit=max(1, min(limit, 20)),
        include_planned=False,
    )
    ranking = await rank_machines_by_breakdown(
        session,
        period_start=window.start,
        period_end=window.end,
        plant_code=plant_code or window.plant_code,
        line_code=line_code,
        limit=max(1, min(limit, 50)),
    )
    payload = {
        "source": "oee_engine",
        "shift": window.as_dict(),
        "cache": {"hit": False, "ttl_sec": SNAPSHOT_TTL_SEC},
        "summary": summary,
        "downtime": downtime,
        "ranking": ranking,
    }
    _SNAPSHOT_CACHE[key] = (time.time(), payload)
    return payload
