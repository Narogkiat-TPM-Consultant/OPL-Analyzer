"""OEE domain tools for the AI agent.

All numeric answers MUST come from these tools (via oee_engine), never from model memory.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from app.db.session import get_db_context
from app.services.oee_engine import (
    calculate_oee,
    estimate_output_for_target_oee,
    rank_machines_by_breakdown,
    summarize_oee,
    top_downtime,
)


def _parse_dt(value: str | None, *, default: datetime) -> datetime:
    if not value:
        return default
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    dt = datetime.fromisoformat(text)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt


def _default_period(period_start: str | None, period_end: str | None) -> tuple[datetime, datetime]:
    """Default to the last 24 hours UTC when the user did not specify a window."""
    end = _parse_dt(period_end, default=datetime.now(UTC))
    start = _parse_dt(period_start, default=end - timedelta(hours=24))
    return start, end


async def get_oee_summary(
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    period_start: str | None = None,
    period_end: str | None = None,
    planned_time_min: float | None = None,
) -> dict[str, Any]:
    """Return OEE / Availability / Performance / Quality for a plant, line, or machine.

    Use this whenever the user asks about OEE level, why OEE dropped, or A/P/Q status.
    Pass ISO-8601 timestamps when a specific shift/day is mentioned. Prefer line_code
    like "PACK-2" when the user names a line.

    Args:
        plant_code: Optional plant code (e.g. "PLT01").
        line_code: Optional line code (e.g. "PACK-2").
        machine_code: Optional machine code (e.g. "Filler-01").
        period_start: ISO datetime start (default: 24h ago).
        period_end: ISO datetime end (default: now).
        planned_time_min: Optional planned production minutes (shift length). If omitted,
            wall-clock span is used.

    Returns:
        Structured OEE summary with percentages and supporting counts/times.
    """
    start, end = _default_period(period_start, period_end)
    async with get_db_context() as session:
        return await summarize_oee(
            session,
            period_start=start,
            period_end=end,
            plant_code=plant_code,
            line_code=line_code,
            machine_code=machine_code,
            planned_time_min=planned_time_min,
        )


async def get_top_downtime(
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    period_start: str | None = None,
    period_end: str | None = None,
    limit: int = 5,
    include_planned: bool = False,
) -> dict[str, Any]:
    """Return the top downtime reason codes (Pareto) for the selected scope.

    Use for "why did we stop", "Top 3 downtime", or root-cause of Availability loss.

    Args:
        plant_code: Optional plant code.
        line_code: Optional line code.
        machine_code: Optional machine code.
        period_start: ISO datetime start (default: 24h ago).
        period_end: ISO datetime end (default: now).
        limit: Number of reasons to return (default 5).
        include_planned: Include planned stops when True (default False).
    """
    start, end = _default_period(period_start, period_end)
    async with get_db_context() as session:
        return await top_downtime(
            session,
            period_start=start,
            period_end=end,
            plant_code=plant_code,
            line_code=line_code,
            machine_code=machine_code,
            limit=max(1, min(limit, 20)),
            include_planned=include_planned,
        )


async def rank_machines(
    plant_code: str | None = None,
    line_code: str | None = None,
    period_start: str | None = None,
    period_end: str | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    """Rank machines by breakdown downtime minutes.

    Use when asked which machine breaks down most often / loses the most time.
    """
    start, end = _default_period(period_start, period_end)
    async with get_db_context() as session:
        return await rank_machines_by_breakdown(
            session,
            period_start=start,
            period_end=end,
            plant_code=plant_code,
            line_code=line_code,
            limit=max(1, min(limit, 50)),
        )


async def estimate_output_for_target(
    target_oee_pct: float,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    period_start: str | None = None,
    period_end: str | None = None,
    planned_time_min: float | None = None,
) -> dict[str, Any]:
    """Estimate how much output is needed to reach a target OEE percent.

    Example: target_oee_pct=85 asks what throughput is needed to hit 85% OEE
    given the current period's Availability/Quality profile.
    """
    target = target_oee_pct / 100.0 if target_oee_pct > 1 else target_oee_pct

    start, end = _default_period(period_start, period_end)
    async with get_db_context() as session:
        summary = await summarize_oee(
            session,
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
    result = estimate_output_for_target_oee(current=components, target_oee=target)
    result["scope"] = summary.get("scope")
    return result


async def search_knowledge_graph(
    concept: str | None = None,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    hops: int = 2,
) -> dict[str, Any]:
    """Search the OEE knowledge graph (related machines, reasons, SOP concepts).

    Use after you know a downtime code, machine, or symptom. Walks neighboring
    nodes instead of keyword-only search. Does not return OEE percentages.
    """
    from app.services.oee_knowledge_graph import search_graph

    query = concept or machine_code or line_code or plant_code
    if not query:
        return {"error": "Need a concept, machine_code, or line_code", "nodes": [], "edges": []}
    async with get_db_context() as session:
        return await search_graph(session, query, hops=max(1, min(hops, 4)))


async def run_oee_workflow(
    question: str,
    plant_code: str | None = None,
    line_code: str | None = None,
    machine_code: str | None = None,
    period_start: str | None = None,
    period_end: str | None = None,
    planned_time_min: float | None = None,
    target_oee_pct: float | None = None,
    workflow: str | None = None,
) -> dict[str, Any]:
    """Run the OEE Graph (status / diagnose / target / alert_or_report).

    Prefer this for multi-step questions: why OEE dropped, which machine to fix
    first, how to reach a target, or whether to alert vs send a daily report.
    Returns verified tool data plus a recommendation. Do not invent KPIs.
    """
    from app.oee_layers.graph import run_workflow
    from app.oee_layers.types import OeeScope, WorkflowName

    seed = OeeScope(
        question=question,
        plant_code=plant_code,
        line_code=line_code,
        machine_code=machine_code,
        period_start=period_start,
        period_end=period_end,
        planned_time_min=planned_time_min,
        target_oee_pct=target_oee_pct,
    )
    selected = None
    if workflow:
        try:
            selected = WorkflowName(workflow)
        except ValueError:
            return {"error": f"Unknown workflow: {workflow}. Use status|diagnose|target|alert_or_report"}
    result = await run_workflow(question, seed=seed, workflow=selected)
    return result.as_dict()


def validate_cited_minutes(cited_minutes: float, tool_total_minutes: float, tolerance: float = 0.5) -> dict[str, Any]:
    """Validate that a spoken/cited downtime total matches the tool result.

    Call before finalizing answers that quote downtime minutes.
    """
    delta = abs(float(cited_minutes) - float(tool_total_minutes))
    ok = delta <= tolerance
    return {
        "ok": ok,
        "cited_minutes": cited_minutes,
        "tool_total_minutes": tool_total_minutes,
        "delta": delta,
        "tolerance": tolerance,
        "message": "Citation matches tool data" if ok else "Citation does not match tool data — refine answer",
    }
