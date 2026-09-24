"""Loop Engineering — repeat a harness cycle until the goal is met or a stop rule fires."""

from __future__ import annotations

from collections.abc import Callable

from app.oee_layers.harness import OeeToolBelt, run_harness
from app.oee_layers.types import LoopConfig, LoopResult, OeeScope, StopReason


def _fingerprint(payload: dict) -> str:
    return repr(sorted((payload or {}).items()))


async def run_loop(
    *,
    goal: str,
    action: str,
    scope: OeeScope,
    tools: OeeToolBelt | None = None,
    config: LoopConfig | None = None,
    success: Callable[[dict], bool] | None = None,
) -> LoopResult:
    """Run Gather→Act→Verify until success criteria or a stopping rule.

    Stopping rules (from the model):
    - max iterations
    - no progress (same failed payload twice)
    - completion check (verifier ok + optional success predicate)
    """
    cfg = config or LoopConfig()
    belt = tools or OeeToolBelt()
    runs = []
    seen: list[str] = []
    memory: dict = {}

    for iteration in range(1, cfg.max_iterations + 1):
        result = await run_harness(action, scope, tools=belt)
        runs.append(result)
        memory[action] = result.payload
        memory["last_verification"] = {
            "ok": result.verification.ok,
            "failed": result.verification.failed_names(),
            "repair_hint": result.verification.repair_hint,
        }

        if result.ok:
            extra_ok = True if success is None else success(result.payload)
            if extra_ok and all(key in result.payload for key in cfg.required_keys):
                return LoopResult(
                    goal=goal,
                    ok=True,
                    stop_reason=StopReason.COMPLETED,
                    iterations=iteration,
                    harness_runs=runs,
                    memory=memory,
                )

        mark = _fingerprint(result.payload)
        if mark in seen and seen.count(mark) + 1 >= cfg.no_progress_limit:
            return LoopResult(
                goal=goal,
                ok=False,
                stop_reason=StopReason.NO_PROGRESS,
                iterations=iteration,
                harness_runs=runs,
                memory=memory,
            )
        seen.append(mark)

    last_ok = bool(runs and runs[-1].ok)
    return LoopResult(
        goal=goal,
        ok=last_ok,
        stop_reason=StopReason.MAX_ITERATIONS if not last_ok else StopReason.COMPLETED,
        iterations=len(runs),
        harness_runs=runs,
        memory=memory,
    )
