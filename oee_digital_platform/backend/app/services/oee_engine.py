"""OEE calculation engine and query helpers.

Formulas (calc_version=v1) — lock with the customer in OEE Rulebook before go-live:

  Availability = Operating Time / Planned Production Time
  Performance  = (Ideal Cycle Time × Total Count) / Operating Time
  Quality      = Good Count / Total Count
  OEE          = Availability × Performance × Quality

Planned stops (is_planned=True) are excluded from downtime that reduces Availability.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import Select, and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.oee import (
    OeeDowntimeEvent,
    OeeLine,
    OeeMachine,
    OeePlant,
    OeeProductionRecord,
    OeeResult,
)


def _d(value: float | int | Decimal | None) -> Decimal:
    if value is None:
        return Decimal("0")
    return Decimal(str(value))


def _ratio(numerator: Decimal, denominator: Decimal) -> Decimal:
    if denominator <= 0:
        return Decimal("0")
    return (numerator / denominator).quantize(Decimal("0.000001"))


@dataclass
class OeeComponents:
    planned_time_min: Decimal
    downtime_min: Decimal
    operating_time_min: Decimal
    total_count: int
    good_count: int
    reject_count: int
    ideal_cycle_time_sec: Decimal
    availability: Decimal
    performance: Decimal
    quality: Decimal
    oee: Decimal
    calc_version: str = "v1"

    def as_percent_dict(self) -> dict[str, Any]:
        return {
            "availability_pct": float(self.availability * 100),
            "performance_pct": float(self.performance * 100),
            "quality_pct": float(self.quality * 100),
            "oee_pct": float(self.oee * 100),
            "planned_time_min": float(self.planned_time_min),
            "downtime_min": float(self.downtime_min),
            "operating_time_min": float(self.operating_time_min),
            "total_count": self.total_count,
            "good_count": self.good_count,
            "reject_count": self.reject_count,
            "ideal_cycle_time_sec": float(self.ideal_cycle_time_sec),
            "calc_version": self.calc_version,
        }


def calculate_oee(
    *,
    planned_time_min: Decimal | float | int,
    downtime_min: Decimal | float | int,
    total_count: int,
    good_count: int,
    ideal_cycle_time_sec: Decimal | float | int,
    reject_count: int | None = None,
) -> OeeComponents:
    """Pure OEE math — unit-testable without a database."""
    planned = _d(planned_time_min)
    downtime = max(_d(downtime_min), Decimal("0"))
    operating = max(planned - downtime, Decimal("0"))
    total = max(int(total_count), 0)
    good = max(int(good_count), 0)
    reject = max(int(reject_count if reject_count is not None else max(total - good, 0)), 0)
    ict = _d(ideal_cycle_time_sec)

    availability = _ratio(operating, planned)
    # Performance uses operating time in seconds
    operating_sec = operating * Decimal("60")
    performance = _ratio(ict * Decimal(total), operating_sec) if operating_sec > 0 else Decimal("0")
    # Cap performance at 1.0 for v1 (speed losses only; no "over 100%" display by default)
    if performance > Decimal("1"):
        performance = Decimal("1.000000")
    quality = _ratio(Decimal(good), Decimal(total)) if total > 0 else Decimal("0")
    oee = (availability * performance * quality).quantize(Decimal("0.000001"))

    return OeeComponents(
        planned_time_min=planned,
        downtime_min=downtime,
        operating_time_min=operating,
        total_count=total,
        good_count=good,
        reject_count=reject,
        ideal_cycle_time_sec=ict,
        availability=availability,
        performance=performance,
        quality=quality,
        oee=oee,
    )


def estimate_output_for_target_oee(
    *,
    current: OeeComponents,
    target_oee: float,
) -> dict[str, Any]:
    """Estimate good/total counts needed to reach target OEE, holding A and Q drivers.

    Uses: required_total ≈ current_total * (target_oee / current_oee)
    when current_oee > 0. Also reports required good count at current quality rate.
    """
    target = _d(target_oee)
    if target <= 0 or target > 1:
        return {"error": "target_oee must be between 0 and 1 (e.g. 0.85 for 85%)"}
    if current.oee <= 0:
        return {
            "error": "current_oee is zero; cannot scale. Fix availability/production first.",
            "current": current.as_percent_dict(),
            "target_oee_pct": float(target * 100),
        }

    scale = target / current.oee
    required_total = int((Decimal(current.total_count) * scale).to_integral_value(rounding="ROUND_CEILING"))
    quality_rate = current.quality if current.quality > 0 else Decimal("1")
    required_good = int((Decimal(required_total) * quality_rate).to_integral_value(rounding="ROUND_CEILING"))

    return {
        "target_oee_pct": float(target * 100),
        "current_oee_pct": float(current.oee * 100),
        "scale_factor": float(scale.quantize(Decimal("0.0001"))),
        "required_total_count": required_total,
        "required_good_count": required_good,
        "delta_total_count": required_total - current.total_count,
        "delta_good_count": required_good - current.good_count,
        "assumption": "Holds Availability and Quality rate; scales throughput (Performance) toward target.",
        "current": current.as_percent_dict(),
    }


async def _machine_ids_for_scope(
    session: AsyncSession,
    *,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
) -> list[UUID]:
    stmt: Select[tuple[UUID]] = select(OeeMachine.id).join(OeeLine).join(OeePlant)
    filters = [OeeMachine.is_active.is_(True)]
    if plant_code:
        filters.append(OeePlant.code == plant_code)
    if line_code:
        filters.append(OeeLine.code == line_code)
    if machine_code:
        filters.append(OeeMachine.code == machine_code)
    stmt = stmt.where(and_(*filters))
    rows = await session.scalars(stmt)
    return list(rows.all())


async def summarize_oee(
    session: AsyncSession,
    *,
    period_start: datetime,
    period_end: datetime,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    planned_time_min: float | None = None,
) -> dict[str, Any]:
    """Aggregate production + unplanned downtime and compute OEE for a scope."""
    machine_ids = await _machine_ids_for_scope(
        session, plant_code=plant_code, line_code=line_code, machine_code=machine_code
    )
    if not machine_ids:
        return {
            "error": "No machines found for the given scope",
            "scope": {
                "plant_code": plant_code,
                "line_code": line_code,
                "machine_code": machine_code,
            },
        }

    prod = await session.execute(
        select(
            func.coalesce(func.sum(OeeProductionRecord.total_count), 0),
            func.coalesce(func.sum(OeeProductionRecord.good_count), 0),
            func.coalesce(func.sum(OeeProductionRecord.reject_count), 0),
        ).where(
            OeeProductionRecord.machine_id.in_(machine_ids),
            OeeProductionRecord.period_start >= period_start,
            OeeProductionRecord.period_end <= period_end,
        )
    )
    total_count, good_count, reject_count = prod.one()

    dt = await session.execute(
        select(func.coalesce(func.sum(OeeDowntimeEvent.duration_minutes), 0)).where(
            OeeDowntimeEvent.machine_id.in_(machine_ids),
            OeeDowntimeEvent.is_planned.is_(False),
            OeeDowntimeEvent.started_at >= period_start,
            OeeDowntimeEvent.started_at < period_end,
        )
    )
    downtime_min = _d(dt.scalar_one())

    ict_row = await session.execute(
        select(func.avg(OeeMachine.ideal_cycle_time_sec)).where(OeeMachine.id.in_(machine_ids))
    )
    ideal_cycle = _d(ict_row.scalar_one() or 1)

    if planned_time_min is None:
        # Default: wall-clock span in minutes (caller should pass shift planned minutes when known)
        planned = _d((period_end - period_start).total_seconds() / 60.0)
    else:
        planned = _d(planned_time_min)

    components = calculate_oee(
        planned_time_min=planned,
        downtime_min=downtime_min,
        total_count=int(total_count),
        good_count=int(good_count),
        reject_count=int(reject_count),
        ideal_cycle_time_sec=ideal_cycle,
    )

    return {
        "scope": {
            "plant_code": plant_code,
            "line_code": line_code,
            "machine_code": machine_code,
            "machine_count": len(machine_ids),
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
        },
        **components.as_percent_dict(),
        "components": asdict(components),
    }


async def top_downtime(
    session: AsyncSession,
    *,
    period_start: datetime,
    period_end: datetime,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    limit: int = 5,
    include_planned: bool = False,
) -> dict[str, Any]:
    machine_ids = await _machine_ids_for_scope(
        session, plant_code=plant_code, line_code=line_code, machine_code=machine_code
    )
    if not machine_ids:
        return {"error": "No machines found for the given scope", "items": []}

    filters = [
        OeeDowntimeEvent.machine_id.in_(machine_ids),
        OeeDowntimeEvent.started_at >= period_start,
        OeeDowntimeEvent.started_at < period_end,
    ]
    if not include_planned:
        filters.append(OeeDowntimeEvent.is_planned.is_(False))

    stmt = (
        select(
            OeeDowntimeEvent.reason_code,
            func.max(OeeDowntimeEvent.reason_label).label("reason_label"),
            func.coalesce(func.sum(OeeDowntimeEvent.duration_minutes), 0).label("minutes"),
            func.count().label("event_count"),
        )
        .where(and_(*filters))
        .group_by(OeeDowntimeEvent.reason_code)
        .order_by(func.sum(OeeDowntimeEvent.duration_minutes).desc())
        .limit(limit)
    )
    rows = (await session.execute(stmt)).all()
    items = [
        {
            "reason_code": r.reason_code,
            "reason_label": r.reason_label,
            "minutes": float(_d(r.minutes)),
            "event_count": int(r.event_count),
        }
        for r in rows
    ]
    total_minutes = sum(i["minutes"] for i in items)
    return {
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "total_minutes_in_top": total_minutes,
        "items": items,
    }


async def rank_machines_by_breakdown(
    session: AsyncSession,
    *,
    period_start: datetime,
    period_end: datetime,
    plant_code: str | None = None,
    line_code: str | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    machine_ids = await _machine_ids_for_scope(
        session, plant_code=plant_code, line_code=line_code, machine_code=None
    )
    if not machine_ids:
        return {"error": "No machines found for the given scope", "items": []}

    stmt = (
        select(
            OeeMachine.code,
            OeeMachine.name,
            OeeLine.code.label("line_code"),
            func.coalesce(func.sum(OeeDowntimeEvent.duration_minutes), 0).label("breakdown_min"),
            func.count(OeeDowntimeEvent.id).label("event_count"),
        )
        .join(OeeLine, OeeMachine.line_id == OeeLine.id)
        .outerjoin(
            OeeDowntimeEvent,
            and_(
                OeeDowntimeEvent.machine_id == OeeMachine.id,
                OeeDowntimeEvent.category == "breakdown",
                OeeDowntimeEvent.started_at >= period_start,
                OeeDowntimeEvent.started_at < period_end,
            ),
        )
        .where(OeeMachine.id.in_(machine_ids))
        .group_by(OeeMachine.id, OeeMachine.code, OeeMachine.name, OeeLine.code)
        .order_by(func.coalesce(func.sum(OeeDowntimeEvent.duration_minutes), 0).desc())
        .limit(limit)
    )
    rows = (await session.execute(stmt)).all()
    return {
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "items": [
            {
                "machine_code": r.code,
                "machine_name": r.name,
                "line_code": r.line_code,
                "breakdown_minutes": float(_d(r.breakdown_min)),
                "event_count": int(r.event_count),
            }
            for r in rows
        ],
    }


async def persist_result(
    session: AsyncSession,
    *,
    components: OeeComponents,
    period_start: datetime,
    period_end: datetime,
    plant_id: UUID | None = None,
    line_id: UUID | None = None,
    machine_id: UUID | None = None,
    shift_id: UUID | None = None,
) -> OeeResult:
    row = OeeResult(
        plant_id=plant_id,
        line_id=line_id,
        machine_id=machine_id,
        shift_id=shift_id,
        period_start=period_start,
        period_end=period_end,
        planned_time_min=components.planned_time_min,
        downtime_min=components.downtime_min,
        operating_time_min=components.operating_time_min,
        total_count=components.total_count,
        good_count=components.good_count,
        reject_count=components.reject_count,
        availability=components.availability,
        performance=components.performance,
        quality=components.quality,
        oee=components.oee,
        ideal_cycle_time_sec=components.ideal_cycle_time_sec,
        calc_version=components.calc_version,
    )
    session.add(row)
    await session.flush()
    return row
