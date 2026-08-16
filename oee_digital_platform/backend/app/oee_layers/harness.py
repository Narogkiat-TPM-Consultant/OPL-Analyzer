"""Harness Engineering — one Gather → Act → Verify cycle.

This is the environment layer: context, tools, and a deterministic verifier.
It does not invent OEE numbers. Tools (or injected fakes) are the only source.
"""

from __future__ import annotations

import re
from collections.abc import Awaitable, Callable
from typing import Any

from app.agents.tools.oee_tools import (
    estimate_output_for_target,
    get_oee_summary,
    get_top_downtime,
    rank_machines,
    search_knowledge_graph,
    validate_cited_minutes,
)
from app.oee_layers.types import HarnessResult, OeeScope, VerificationResult

ToolFn = Callable[..., Awaitable[dict[str, Any]]]


class OeeToolBelt:
    """Action zone: tools the harness may call. Inject fakes in tests."""

    def __init__(
        self,
        *,
        summary: ToolFn | None = None,
        downtime: ToolFn | None = None,
        ranking: ToolFn | None = None,
        estimate: ToolFn | None = None,
        knowledge_graph: ToolFn | None = None,
    ) -> None:
        self.summary = summary or get_oee_summary
        self.downtime = downtime or get_top_downtime
        self.ranking = ranking or rank_machines
        self.estimate = estimate or estimate_output_for_target
        self.knowledge_graph = knowledge_graph or search_knowledge_graph


LINE_RE = re.compile(r"\b([A-Z]{2,}[-_]\d+)\b")
PLANT_RE = re.compile(r"\b(PLT\d+)\b", re.IGNORECASE)
MACHINE_RE = re.compile(r"\b((?:Filler|Labeler|Packer|Mixer)[-_]?\d+)\b", re.IGNORECASE)
TARGET_RE = re.compile(r"\b(\d{2,3})\s*%")


def gather_scope(question: str, seed: OeeScope | None = None) -> OeeScope:
    """Context + prompt zone: extract plant/line/machine/target from the question."""
    scope = OeeScope(question=question)
    if seed:
        scope.plant_code = seed.plant_code
        scope.line_code = seed.line_code
        scope.machine_code = seed.machine_code
        scope.period_start = seed.period_start
        scope.period_end = seed.period_end
        scope.planned_time_min = seed.planned_time_min
        scope.target_oee_pct = seed.target_oee_pct
        scope.concept = seed.concept
        scope.alert_threshold_pct = seed.alert_threshold_pct
        scope.target_threshold_pct = seed.target_threshold_pct

    if not scope.line_code:
        match = LINE_RE.search(question)
        if match:
            scope.line_code = match.group(1).upper()
    if not scope.plant_code:
        match = PLANT_RE.search(question)
        if match:
            scope.plant_code = match.group(1).upper()
    if not scope.machine_code:
        match = MACHINE_RE.search(question)
        if match:
            scope.machine_code = match.group(1)
    if scope.target_oee_pct is None:
        match = TARGET_RE.search(question)
        if match:
            value = float(match.group(1))
            if 1 <= value <= 100:
                scope.target_oee_pct = value
    return scope


def _check(name: str, ok: bool, detail: str) -> dict[str, Any]:
    return {"name": name, "ok": ok, "detail": detail}


def verify_oee_summary(payload: dict[str, Any]) -> VerificationResult:
    checks: list[dict[str, Any]] = []
    if payload.get("error"):
        return VerificationResult(
            ok=False,
            checks=[_check("no_error", False, str(payload["error"]))],
            repair_hint="Broaden or correct plant/line/machine scope, then retry summary.",
        )

    oee = payload.get("oee_pct")
    a = payload.get("availability_pct")
    p = payload.get("performance_pct")
    q = payload.get("quality_pct")
    for name, value in (("oee_pct", oee), ("availability_pct", a), ("performance_pct", p), ("quality_pct", q)):
        present = value is not None
        in_range = present and 0 <= float(value) <= 100
        checks.append(_check(f"{name}_present", present, f"{name}={value}"))
        checks.append(_check(f"{name}_range", in_range, "must be 0-100"))

    if all(v is not None for v in (oee, a, p, q)):
        expected = (float(a) * float(p) * float(q)) / 10_000.0
        identity_ok = abs(expected - float(oee)) <= 0.15
        checks.append(
            _check(
                "oee_identity",
                identity_ok,
                f"A*P*Q/10000={expected:.4f} vs oee_pct={float(oee):.4f}",
            )
        )

    ok = all(c["ok"] for c in checks)
    return VerificationResult(
        ok=ok,
        checks=checks,
        repair_hint=None if ok else "Re-run summary from oee_engine; do not accept invented KPIs.",
    )


def verify_downtime(payload: dict[str, Any]) -> VerificationResult:
    if payload.get("error"):
        return VerificationResult(
            ok=False,
            checks=[_check("no_error", False, str(payload["error"]))],
            repair_hint="Retry downtime with a valid line/machine scope.",
        )
    items = payload.get("items")
    checks = [_check("items_list", isinstance(items, list), f"type={type(items).__name__}")]
    if isinstance(items, list):
        minutes = [i.get("minutes") for i in items if isinstance(i, dict)]
        nonneg = all(m is None or float(m) >= 0 for m in minutes)
        checks.append(_check("minutes_nonneg", nonneg, "downtime minutes must be >= 0"))
        cited = payload.get("total_minutes_in_top")
        if cited is not None and minutes:
            tool_sum = sum(float(m or 0) for m in minutes)
            citation = validate_cited_minutes(float(cited), tool_sum)
            checks.append(_check("cited_minutes", citation["ok"], citation["message"]))
    ok = all(c["ok"] for c in checks)
    return VerificationResult(
        ok=ok,
        checks=checks,
        repair_hint=None if ok else "Re-query top downtime; do not quote unmatched minutes.",
    )


def verify_ranking(payload: dict[str, Any]) -> VerificationResult:
    if payload.get("error"):
        return VerificationResult(
            ok=False,
            checks=[_check("no_error", False, str(payload["error"]))],
            repair_hint="Retry machine ranking with a valid plant/line scope.",
        )
    items = payload.get("items")
    checks = [_check("items_list", isinstance(items, list), f"type={type(items).__name__}")]
    ok = all(c["ok"] for c in checks)
    return VerificationResult(ok=ok, checks=checks, repair_hint=None if ok else "Retry ranking.")


def verify_knowledge_graph(payload: dict[str, Any]) -> VerificationResult:
    if payload.get("error") and "Need a concept" in str(payload.get("error")):
        return VerificationResult(
            ok=False,
            checks=[_check("query_present", False, str(payload["error"]))],
            repair_hint="Pass a downtime code, machine code, or line code.",
        )
    nodes = payload.get("nodes")
    edges = payload.get("edges")
    checks = [
        _check("nodes_list", isinstance(nodes, list), f"type={type(nodes).__name__}"),
        _check("edges_list", isinstance(edges, list), f"type={type(edges).__name__}"),
    ]
    if isinstance(nodes, list) and nodes:
        checks.append(_check("node_keys", all(isinstance(n, dict) and n.get("key") for n in nodes), "each node needs key"))
    if isinstance(edges, list) and edges:
        sourced = all(isinstance(e, dict) and (e.get("source_ref") or e.get("source_type")) for e in edges)
        checks.append(_check("edge_provenance", sourced, "edges must cite source_ref or source_type"))
    ok = all(c["ok"] for c in checks)
    return VerificationResult(
        ok=ok,
        checks=checks,
        repair_hint=None if ok else "Rebuild the operational graph from OEE events, then search again.",
    )


def verify_estimate(payload: dict[str, Any]) -> VerificationResult:
    if payload.get("error"):
        return VerificationResult(
            ok=False,
            checks=[_check("no_error", False, str(payload["error"]))],
            repair_hint="Need a non-zero current OEE before estimating a target.",
        )
    required = ("required_total_count", "target_oee_pct", "current_oee_pct")
    checks = [_check(name, name in payload, f"missing {name}") for name in required]
    ok = all(c["ok"] for c in checks)
    return VerificationResult(
        ok=ok,
        checks=checks,
        repair_hint=None if ok else "Re-run estimate_output_for_target from engine data.",
    )


_VERIFIERS = {
    "summary": verify_oee_summary,
    "downtime": verify_downtime,
    "ranking": verify_ranking,
    "estimate": verify_estimate,
    "knowledge_graph": verify_knowledge_graph,
}


async def run_harness(
    action: str,
    scope: OeeScope,
    tools: OeeToolBelt | None = None,
) -> HarnessResult:
    """One environment cycle: gather context, call a tool, verify the payload."""
    belt = tools or OeeToolBelt()
    context = {
        "action": action,
        "question": scope.question,
        "scope": scope.as_tool_kwargs(),
    }
    kwargs = scope.as_tool_kwargs()

    if action == "summary":
        payload = await belt.summary(**kwargs)
        tool_name = "get_oee_summary"
    elif action == "downtime":
        payload = await belt.downtime(**{k: v for k, v in kwargs.items() if k != "planned_time_min"})
        tool_name = "get_top_downtime"
    elif action == "ranking":
        rank_kwargs = {
            k: v
            for k, v in kwargs.items()
            if k not in {"machine_code", "planned_time_min"}
        }
        payload = await belt.ranking(**rank_kwargs)
        tool_name = "rank_machines"
    elif action == "estimate":
        target = scope.target_oee_pct or scope.target_threshold_pct
        payload = await belt.estimate(target_oee_pct=target, **kwargs)
        tool_name = "estimate_output_for_target"
    elif action == "knowledge_graph":
        concept = scope.concept or scope.machine_code or scope.line_code or scope.question
        payload = await belt.knowledge_graph(
            concept=concept,
            plant_code=scope.plant_code,
            line_code=scope.line_code,
            machine_code=scope.machine_code,
        )
        tool_name = "search_knowledge_graph"
    else:
        payload = {"error": f"Unknown harness action: {action}"}
        tool_name = None

    verifier = _VERIFIERS.get(action)
    verification = verifier(payload) if verifier else VerificationResult(ok=False, repair_hint="No verifier")
    return HarnessResult(
        action=action,
        context=context,
        tool_name=tool_name,
        payload=payload,
        verification=verification,
        ok=verification.ok,
    )
