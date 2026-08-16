"""OEE REST API — dashboard and agent share the same engine."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.api.deps import DBSession
from app.oee_layers.graph import run_workflow
from app.oee_layers.types import OeeScope, WorkflowName
from app.services.oee_engine import (
    calculate_oee,
    estimate_output_for_target_oee,
    rank_machines_by_breakdown,
    summarize_oee,
    top_downtime,
)
from app.services.oee_knowledge_graph import (
    ingest_chunk_to_db,
    rebuild_operational_graph,
    search_graph,
)
from app.services.oee_realtime import build_current_shift_snapshot

router = APIRouter(prefix="/oee", tags=["oee"])


def _period(period_start: datetime | None, period_end: datetime | None) -> tuple[datetime, datetime]:
    end = period_end or datetime.now(UTC)
    start = period_start or (end - timedelta(hours=24))
    if start.tzinfo is None:
        start = start.replace(tzinfo=UTC)
    if end.tzinfo is None:
        end = end.replace(tzinfo=UTC)
    return start, end


@router.get("/realtime/snapshot")
async def oee_realtime_snapshot(
    db: DBSession,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    limit: int = Query(default=5, ge=1, le=20),
) -> dict[str, Any]:
    """Current-shift OEE + downtime + ranking. Numbers come from oee_engine."""
    return await build_current_shift_snapshot(
        db,
        plant_code=plant_code,
        line_code=line_code,
        machine_code=machine_code,
        limit=limit,
    )


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


class WorkflowRunRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    plant_code: str | None = None
    line_code: str | None = None
    machine_code: str | None = None
    period_start: str | None = None
    period_end: str | None = None
    planned_time_min: float | None = Field(default=None, ge=0)
    target_oee_pct: float | None = Field(default=None, gt=0, le=100)
    workflow: WorkflowName | None = None
    alert_threshold_pct: float = Field(default=60.0, gt=0, le=100)


@router.post("/workflows/run")
async def oee_run_workflow(body: WorkflowRunRequest) -> dict[str, Any]:
    """Run Harness + Loop + Graph for an OEE question (no LLM required)."""
    seed = OeeScope(
        question=body.question,
        plant_code=body.plant_code,
        line_code=body.line_code,
        machine_code=body.machine_code,
        period_start=body.period_start,
        period_end=body.period_end,
        planned_time_min=body.planned_time_min,
        target_oee_pct=body.target_oee_pct,
        alert_threshold_pct=body.alert_threshold_pct,
    )
    result = await run_workflow(body.question, seed=seed, workflow=body.workflow)
    return result.as_dict()


@router.get("/knowledge-graph/search")
async def oee_kg_search(
    db: DBSession,
    q: str = Query(..., min_length=1, max_length=128),
    hops: int = Query(default=2, ge=1, le=4),
) -> dict[str, Any]:
    return await search_graph(db, q, hops=hops)


@router.post("/knowledge-graph/rebuild")
async def oee_kg_rebuild(db: DBSession) -> dict[str, Any]:
    graph = await rebuild_operational_graph(db)
    return {"ok": True, **graph.as_stats()}


class KgChunkIn(BaseModel):
    chunk_id: str = Field(..., min_length=1, max_length=128)
    concepts: list[str] = Field(..., min_length=1)
    relations: list[tuple[str, str, str]] = Field(default_factory=list)
    source: str = "sop"


@router.post("/knowledge-graph/chunks")
async def oee_kg_ingest_chunk(db: DBSession, body: KgChunkIn) -> dict[str, Any]:
    stats = await ingest_chunk_to_db(
        db,
        body.chunk_id,
        body.concepts,
        explicit_relations=body.relations,
        source=body.source,
    )
    return {"ok": True, **stats}
