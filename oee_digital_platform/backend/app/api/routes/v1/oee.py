"""OEE REST API — dashboard and agent share the same engine."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Query

from app.api.deps import DBSession
from app.services.oee_engine import (
    estimate_output_for_target_oee,
    calculate_oee,
    rank_machines_by_breakdown,
    summarize_oee,
    top_downtime,
)

router = APIRouter(prefix="/oee", tags=["oee"])


def _period(period_start: datetime | None, period_end: datetime | None) -> tuple[datetime, datetime]:
    end = period_end or datetime.now(UTC)
    start = period_start or (end - timedelta(hours=24))
    if start.tzinfo is None:
        start = start.replace(tzinfo=UTC)
    if end.tzinfo is None:
        end = end.replace(tzinfo=UTC)
    return start, end


@router.get("/summary")
async def oee_summary(
    db: DBSession,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    period_start: datetime | None = None,
    period_end: datetime | None = None,
    planned_time_min: float | None = Query(default=None, ge=0),
) -> dict[str, Any]:
    start, end = _period(period_start, period_end)
    return await summarize_oee(
        db,
        period_start=start,
        period_end=end,
        plant_code=plant_code,
        line_code=line_code,
        machine_code=machine_code,
        planned_time_min=planned_time_min,
    )


@router.get("/downtime/top")
async def oee_top_downtime(
    db: DBSession,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    period_start: datetime | None = None,
    period_end: datetime | None = None,
    limit: int = Query(default=5, ge=1, le=20),
    include_planned: bool = False,
) -> dict[str, Any]:
    start, end = _period(period_start, period_end)
    return await top_downtime(
        db,
        period_start=start,
        period_end=end,
        plant_code=plant_code,
        line_code=line_code,
        machine_code=machine_code,
        limit=limit,
        include_planned=include_planned,
    )


@router.get("/machines/ranking")
async def oee_machine_ranking(
    db: DBSession,
    plant_code: str | None = None,
    line_code: str | None = None,
    period_start: datetime | None = None,
    period_end: datetime | None = None,
    limit: int = Query(default=10, ge=1, le=50),
) -> dict[str, Any]:
    start, end = _period(period_start, period_end)
    return await rank_machines_by_breakdown(
        db,
        period_start=start,
        period_end=end,
        plant_code=plant_code,
        line_code=line_code,
        limit=limit,
    )


@router.get("/estimate-target")
async def oee_estimate_target(
    db: DBSession,
    target_oee_pct: float = Query(..., gt=0, le=100),
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    period_start: datetime | None = None,
    period_end: datetime | None = None,
    planned_time_min: float | None = Query(default=None, ge=0),
) -> dict[str, Any]:
    start, end = _period(period_start, period_end)
    summary = await summarize_oee(
        db,
        period_start=start,
        period_end=end,
        plant_code=plant_code,
        line_code=line_code,
        machine_code=machine_code,
        planned_time_min=planned_time_min,
    )
    if "error" in summary:
        return summary
    components = calculate_oee(
        planned_time_min=summary["planned_time_min"],
        downtime_min=summary["downtime_min"],
        total_count=summary["total_count"],
        good_count=summary["good_count"],
        reject_count=summary["reject_count"],
        ideal_cycle_time_sec=summary["ideal_cycle_time_sec"],
    )
    result = estimate_output_for_target_oee(current=components, target_oee=target_oee_pct / 100.0)
    result["scope"] = summary.get("scope")
    return result
