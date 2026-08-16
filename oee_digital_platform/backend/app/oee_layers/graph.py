"""Graph Engineering — OEE workflow topology (start → task → decision → branch/parallel → merge)."""

from __future__ import annotations

import asyncio
import re

from app.oee_layers.harness import OeeToolBelt, gather_scope
from app.oee_layers.loop import run_loop
from app.oee_layers.types import (
    GraphNode,
    GraphResult,
    LoopResult,
    OeeScope,
    WorkflowName,
)

_DIAGNOSE_RE = re.compile(
    r"why|drop|fell|root\s*cause|ทำไม|ตก|ลด|สาเหตุ|พัง|breakdown|บ่อย",
    re.IGNORECASE,
)
_TARGET_RE = re.compile(r"target|reach|เป้า|ถึง|85|ต้องผลิต", re.IGNORECASE)
_ALERT_RE = re.compile(r"alert|แจ้งเตือน|รายงาน|report|daily", re.IGNORECASE)


def classify_workflow(question: str, seed: OeeScope | None = None) -> WorkflowName:
    """Route a user question onto a named OEE graph."""
    if seed and seed.target_oee_pct is not None and _TARGET_RE.search(question or ""):
        return WorkflowName.TARGET
    if _TARGET_RE.search(question or ""):
        return WorkflowName.TARGET
    if _ALERT_RE.search(question or "") and not _DIAGNOSE_RE.search(question or ""):
        return WorkflowName.ALERT_OR_REPORT
    if _DIAGNOSE_RE.search(question or ""):
        return WorkflowName.DIAGNOSE
    return WorkflowName.STATUS


def _oee_pct(loop: LoopResult | None) -> float | None:
    if not loop or not loop.memory:
        return None
    payload = loop.memory.get("summary") or {}
    value = payload.get("oee_pct")
    return None if value is None else float(value)


def _recommend_from_diagnose(
    summary: dict,
    downtime: dict | None,
    ranking: dict | None,
    *,
    alert_threshold: float,
) -> dict:
    oee = summary.get("oee_pct")
    items = (downtime or {}).get("items") or []
    top = items[0] if items else None
    worst = ((ranking or {}).get("items") or [None])[0]
    priority = "critical" if oee is not None and float(oee) < alert_threshold else "medium"
    title = "Investigate top availability loss"
    if top:
        title = f"Reduce {top.get('reason_label') or top.get('reason_code')} downtime"
    return {
        "priority": priority,
        "title": title,
        "first_action": (
            f"Focus {top.get('reason_code')} ({top.get('minutes')} min)"
            if top
            else "Collect downtime codes for this shift"
        ),
        "machine_focus": (worst or {}).get("machine_code"),
        "oee_pct": oee,
    }


async def run_workflow(
    question: str,
    *,
    seed: OeeScope | None = None,
    tools: OeeToolBelt | None = None,
    workflow: WorkflowName | None = None,
) -> GraphResult:
    """Execute a named OEE graph. Loops run inside graph nodes; harness runs inside loops."""
    scope = gather_scope(question, seed)
    belt = tools or OeeToolBelt()
    name = workflow or classify_workflow(question, scope)

    if name == WorkflowName.STATUS:
        return await _graph_status(scope, belt)
    if name == WorkflowName.TARGET:
        return await _graph_target(scope, belt)
    if name == WorkflowName.ALERT_OR_REPORT:
        return await _graph_alert_or_report(scope, belt)
    return await _graph_diagnose(scope, belt)


async def _graph_status(scope: OeeScope, belt: OeeToolBelt) -> GraphResult:
    live = scope.use_current_shift or not (scope.period_start and scope.period_end)
    action = "snapshot" if live else "summary"
    path = [GraphNode("start", "start"), GraphNode(action, "task", {"action": action})]
    status_loop = await run_loop(
        goal="Produce a verified current-shift OEE snapshot"
        if live
        else "Produce a verified OEE / A / P / Q snapshot",
        action=action,
        scope=scope,
        tools=belt,
    )
    path.append(GraphNode("merge", "merge", {"ok": status_loop.ok}))
    raw = status_loop.memory.get(action) or {}
    summary = raw.get("summary") if action == "snapshot" else raw
    oee = (summary or {}).get("oee_pct") if isinstance(summary, dict) else None
    return GraphResult(
        workflow=WorkflowName.STATUS,
        ok=status_loop.ok,
        path=path,
        loops={action: status_loop},
        recommendation={"title": "Review current-shift OEE" if live else "Review current OEE", "oee_pct": oee},
        response=raw,
    )


async def _graph_target(scope: OeeScope, belt: OeeToolBelt) -> GraphResult:
    path = [GraphNode("start", "start"), GraphNode("summary", "task", {"action": "summary"})]
    summary_loop = await run_loop(
        goal="Verified current OEE before estimating target",
        action="summary",
        scope=scope,
        tools=belt,
    )
    loops = {"summary": summary_loop}
    if not summary_loop.ok:
        path.append(GraphNode("merge", "merge", {"ok": False}))
        return GraphResult(
            workflow=WorkflowName.TARGET,
            ok=False,
            path=path,
            loops=loops,
            response=summary_loop.memory.get("summary") or {},
        )

    path.append(GraphNode("estimate", "task", {"action": "estimate"}))
    estimate_loop = await run_loop(
        goal="Estimate output required to reach target OEE",
        action="estimate",
        scope=scope,
        tools=belt,
    )
    loops["estimate"] = estimate_loop
    path.append(GraphNode("merge", "merge", {"ok": estimate_loop.ok}))
    estimate = estimate_loop.memory.get("estimate") or {}
    return GraphResult(
        workflow=WorkflowName.TARGET,
        ok=estimate_loop.ok,
        path=path,
        loops=loops,
        recommendation={
            "title": f"Plan output to reach {scope.target_oee_pct or scope.target_threshold_pct}% OEE",
            "required_total_count": estimate.get("required_total_count"),
            "delta_total_count": estimate.get("delta_total_count"),
        },
        response=estimate,
    )


async def _graph_diagnose(scope: OeeScope, belt: OeeToolBelt) -> GraphResult:
    path = [GraphNode("start", "start"), GraphNode("summary", "task", {"action": "summary"})]
    summary_loop = await run_loop(
        goal="Verified OEE snapshot for diagnosis",
        action="summary",
        scope=scope,
        tools=belt,
    )
    loops = {"summary": summary_loop}
    if not summary_loop.ok:
        path.append(GraphNode("merge", "merge", {"ok": False}))
        return GraphResult(
            workflow=WorkflowName.DIAGNOSE,
            ok=False,
            path=path,
            loops=loops,
            response=summary_loop.memory.get("summary") or {},
        )

    oee = _oee_pct(summary_loop)
    low = oee is not None and oee < scope.target_threshold_pct
    path.append(
        GraphNode(
            "oee_gate",
            "decision",
            {"oee_pct": oee, "below_target": low, "threshold": scope.target_threshold_pct},
        )
    )

    # Diagnose always fans out: losses + worst machine. The gate only records severity.
    path.append(GraphNode("fanout", "parallel", {"branches": ["downtime", "ranking"]}))
    downtime_loop, ranking_loop = await asyncio.gather(
        run_loop(
            goal="Top downtime reasons for Availability loss",
            action="downtime",
            scope=scope,
            tools=belt,
        ),
        run_loop(
            goal="Machines ranked by breakdown minutes",
            action="ranking",
            scope=scope,
            tools=belt,
        ),
    )
    loops["downtime"] = downtime_loop
    loops["ranking"] = ranking_loop

    summary = summary_loop.memory.get("summary") or {}
    downtime = (downtime_loop.memory.get("downtime") if downtime_loop else None) or {}
    ranking = (ranking_loop.memory.get("ranking") if ranking_loop else None) or {}
    top_reason = ((downtime.get("items") or [{}])[0] or {}).get("reason_code")
    kg_scope = OeeScope(
        question=scope.question,
        plant_code=scope.plant_code,
        line_code=scope.line_code,
        machine_code=scope.machine_code,
        concept=top_reason or scope.line_code or scope.machine_code,
    )
    path.append(GraphNode("knowledge_graph", "task", {"action": "knowledge_graph", "concept": kg_scope.concept}))
    kg_loop = await run_loop(
        goal="Related machines, reasons, and SOP concepts",
        action="knowledge_graph",
        scope=kg_scope,
        tools=belt,
    )
    loops["knowledge_graph"] = kg_loop
    kg_payload = kg_loop.memory.get("knowledge_graph") or {}
    recommendation = _recommend_from_diagnose(
        summary, downtime, ranking, alert_threshold=scope.alert_threshold_pct
    )
    yokoten = kg_payload.get("yokoten_candidates") or []
    if yokoten:
        recommendation["yokoten_candidates"] = yokoten[:5]
    if kg_payload.get("hubs"):
        recommendation["related_hubs"] = kg_payload["hubs"][:3]
    needs_approval = oee is not None and oee < scope.alert_threshold_pct
    if needs_approval:
        path.append(GraphNode("approval", "approval", {"reason": "OEE below alert threshold"}))
    path.append(GraphNode("merge", "merge", {"ok": True}))

    return GraphResult(
        workflow=WorkflowName.DIAGNOSE,
        ok=True,
        path=path,
        loops=loops,
        decision={"oee_pct": oee, "below_target": low, "branch": "loss_analysis"},
        recommendation=recommendation,
        needs_approval=needs_approval,
        response={
            "summary": summary,
            "downtime": downtime,
            "ranking": ranking,
            "knowledge_graph": kg_payload,
        },
    )


async def _graph_alert_or_report(scope: OeeScope, belt: OeeToolBelt) -> GraphResult:
    path = [GraphNode("start", "start"), GraphNode("summary", "task", {"action": "summary"})]
    summary_loop = await run_loop(
        goal="Verified OEE for alert-or-report decision",
        action="summary",
        scope=scope,
        tools=belt,
    )
    loops = {"summary": summary_loop}
    if not summary_loop.ok:
        path.append(GraphNode("merge", "merge", {"ok": False}))
        return GraphResult(
            workflow=WorkflowName.ALERT_OR_REPORT,
            ok=False,
            path=path,
            loops=loops,
            response=summary_loop.memory.get("summary") or {},
        )

    oee = _oee_pct(summary_loop)
    alert = oee is not None and oee < scope.alert_threshold_pct
    path.append(
        GraphNode(
            "severity_gate",
            "decision",
            {"oee_pct": oee, "alert": alert, "threshold": scope.alert_threshold_pct},
        )
    )

    summary = summary_loop.memory.get("summary") or {}
    if alert:
        path.append(GraphNode("branch_alert", "branch", {"name": "A_alert"}))
        downtime_loop = await run_loop(
            goal="Top 3 downtime for the alert payload",
            action="downtime",
            scope=scope,
            tools=belt,
        )
        loops["downtime"] = downtime_loop
        recommendation = {
            "channel": "LINE/Email/Teams",
            "severity": "critical",
            "title": f"OEE alert: {oee:.1f}% below {scope.alert_threshold_pct}%",
            "top_downtime": (downtime_loop.memory.get("downtime") or {}).get("items", [])[:3],
        }
        needs_approval = True
        response = {"mode": "alert", "summary": summary, "downtime": downtime_loop.memory.get("downtime")}
    else:
        path.append(GraphNode("branch_report", "branch", {"name": "B_daily_report"}))
        recommendation = {
            "channel": "Email",
            "severity": "info",
            "title": f"Daily OEE report: {oee:.1f}%" if oee is not None else "Daily OEE report",
        }
        needs_approval = False
        response = {"mode": "report", "summary": summary}

    path.append(GraphNode("merge", "merge", {"ok": True}))
    return GraphResult(
        workflow=WorkflowName.ALERT_OR_REPORT,
        ok=True,
        path=path,
        loops=loops,
        decision={"oee_pct": oee, "alert": alert, "branch": "A_alert" if alert else "B_daily_report"},
        recommendation=recommendation,
        needs_approval=needs_approval,
        response=response,
    )
