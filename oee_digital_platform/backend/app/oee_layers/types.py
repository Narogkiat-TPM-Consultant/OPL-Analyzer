"""Shared types for Harness / Loop / Graph engineering layers."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class WorkflowName(StrEnum):
    STATUS = "status"
    DIAGNOSE = "diagnose"
    TARGET = "target"
    ALERT_OR_REPORT = "alert_or_report"


class StopReason(StrEnum):
    COMPLETED = "completed"
    MAX_ITERATIONS = "max_iterations"
    NO_PROGRESS = "no_progress"
    BUDGET = "budget"
    FAILED_VERIFY = "failed_verify"
    MISSING_SCOPE = "missing_scope"


@dataclass
class OeeScope:
    """Context gathered before any tool call (Harness: Context zone)."""

    question: str = ""
    plant_code: str | None = None
    line_code: str | None = None
    machine_code: str | None = None
    period_start: str | None = None
    period_end: str | None = None
    planned_time_min: float | None = None
    target_oee_pct: float | None = None
    alert_threshold_pct: float = 60.0
    target_threshold_pct: float = 85.0

    def as_tool_kwargs(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "plant_code": self.plant_code,
            "line_code": self.line_code,
            "machine_code": self.machine_code,
            "period_start": self.period_start,
            "period_end": self.period_end,
            "planned_time_min": self.planned_time_min,
        }
        return {k: v for k, v in payload.items() if v is not None}


@dataclass
class VerificationResult:
    ok: bool
    checks: list[dict[str, Any]] = field(default_factory=list)
    repair_hint: str | None = None

    def failed_names(self) -> list[str]:
        return [c["name"] for c in self.checks if not c.get("ok")]


@dataclass
class HarnessResult:
    action: str
    context: dict[str, Any]
    tool_name: str | None
    payload: dict[str, Any]
    verification: VerificationResult
    ok: bool


@dataclass
class LoopConfig:
    max_iterations: int = 3
    no_progress_limit: int = 2
    required_keys: tuple[str, ...] = ()


@dataclass
class LoopResult:
    goal: str
    ok: bool
    stop_reason: StopReason
    iterations: int
    harness_runs: list[HarnessResult] = field(default_factory=list)
    memory: dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphNode:
    id: str
    kind: str  # start | task | decision | branch | parallel | merge | approval
    detail: dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphResult:
    workflow: WorkflowName
    ok: bool
    path: list[GraphNode] = field(default_factory=list)
    loops: dict[str, LoopResult] = field(default_factory=dict)
    decision: dict[str, Any] = field(default_factory=dict)
    recommendation: dict[str, Any] = field(default_factory=dict)
    needs_approval: bool = False
    response: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "workflow": self.workflow.value,
            "ok": self.ok,
            "path": [{"id": n.id, "kind": n.kind, "detail": n.detail} for n in self.path],
            "decision": self.decision,
            "recommendation": self.recommendation,
            "needs_approval": self.needs_approval,
            "response": self.response,
            "loops": {
                name: {
                    "goal": loop.goal,
                    "ok": loop.ok,
                    "stop_reason": loop.stop_reason.value,
                    "iterations": loop.iterations,
                }
                for name, loop in self.loops.items()
            },
        }
