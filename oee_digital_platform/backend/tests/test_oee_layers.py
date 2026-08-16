"""Tests for Harness / Loop / Graph layers (injected tools, no database)."""

from __future__ import annotations

import pytest

from app.oee_layers.graph import classify_workflow, run_workflow
from app.oee_layers.harness import OeeToolBelt, gather_scope, run_harness, verify_oee_summary
from app.oee_layers.loop import run_loop
from app.oee_layers.types import OeeScope, StopReason, WorkflowName


def _ok_summary(**overrides):
    payload = {
        "oee_pct": 78.5,
        "availability_pct": 85.2,
        "performance_pct": 88.1,
        "quality_pct": 95.6,
        "planned_time_min": 480,
        "downtime_min": 71,
        "operating_time_min": 409,
        "total_count": 9200,
        "good_count": 8800,
        "reject_count": 400,
        "ideal_cycle_time_sec": 2.5,
        "calc_version": "v1",
        "scope": {"line_code": "PACK-2"},
    }
    payload.update(overrides)
    return payload


def _low_summary():
    # 50 * 90 * 90 / 10000 = 40.5
    return _ok_summary(oee_pct=40.5, availability_pct=50.0, performance_pct=90.0, quality_pct=90.0)


async def _const(payload):
    async def _fn(**_kwargs):
        return payload

    return _fn


@pytest.mark.anyio
async def test_gather_scope_extracts_line_and_target():
    scope = gather_scope("ทำไม OEE ไลน์ PACK-2 ตก และต้องผลิตเท่าไรถึง 85%")
    assert scope.line_code == "PACK-2"
    assert scope.target_oee_pct == 85.0


def test_verify_rejects_invented_identity():
    bad = verify_oee_summary(_ok_summary(oee_pct=99.0))
    assert bad.ok is False
    assert "oee_identity" in bad.failed_names()


def test_verify_accepts_consistent_oee():
    # 85.2 * 88.1 * 95.6 / 10000 ≈ 71.76 — adjust to match
    payload = _ok_summary(oee_pct=71.76)
    assert verify_oee_summary(payload).ok is True


@pytest.mark.anyio
async def test_harness_summary_verifies_tool_payload():
    belt = OeeToolBelt(summary=await _const(_ok_summary(oee_pct=71.76)))
    result = await run_harness("summary", OeeScope(line_code="PACK-2"), tools=belt)
    assert result.ok is True
    assert result.tool_name == "get_oee_summary"


@pytest.mark.anyio
async def test_loop_stops_on_no_progress():
    belt = OeeToolBelt(summary=await _const({"error": "No machines found"}))
    result = await run_loop(
        goal="Need a verified summary",
        action="summary",
        scope=OeeScope(line_code="UNKNOWN"),
        tools=belt,
    )
    assert result.ok is False
    assert result.stop_reason in {StopReason.NO_PROGRESS, StopReason.MAX_ITERATIONS}
    assert result.iterations >= 2


@pytest.mark.anyio
async def test_loop_completes_when_verifier_passes():
    belt = OeeToolBelt(summary=await _const(_ok_summary(oee_pct=71.76)))
    result = await run_loop(
        goal="Verified snapshot",
        action="summary",
        scope=OeeScope(line_code="PACK-2"),
        tools=belt,
    )
    assert result.ok is True
    assert result.stop_reason == StopReason.COMPLETED
    assert result.iterations == 1


@pytest.mark.anyio
async def test_graph_diagnose_fans_out_and_recommends():
    belt = OeeToolBelt(
        summary=await _const(_low_summary()),
        downtime=await _const(
            {
                "total_minutes_in_top": 45,
                "items": [{"reason_code": "BRK-NOZ", "reason_label": "Nozzle jam", "minutes": 45}],
            }
        ),
        ranking=await _const(
            {"items": [{"machine_code": "Filler-01", "breakdown_minutes": 45, "event_count": 1}]}
        ),
        knowledge_graph=await _const(
            {
                "nodes": [{"key": "reason:BRK-NOZ", "kind": "reason", "code": "BRK-NOZ", "degree": 2}],
                "edges": [
                    {
                        "source": "machine:Filler-01",
                        "target": "reason:BRK-NOZ",
                        "source_ref": "evt-1",
                        "source_type": "event",
                    }
                ],
                "hubs": [{"key": "reason:BRK-NOZ", "degree": 2}],
                "yokoten_candidates": [{"key": "machine:Labeler-01", "kind": "machine", "code": "Labeler-01"}],
            }
        ),
    )
    result = await run_workflow("ทำไม OEE PACK-2 ตก", tools=belt)
    assert result.workflow == WorkflowName.DIAGNOSE
    assert result.ok is True
    assert result.needs_approval is True
    kinds = [n.kind for n in result.path]
    assert "decision" in kinds
    assert "parallel" in kinds
    assert "approval" in kinds
    assert result.recommendation["machine_focus"] == "Filler-01"
    assert "BRK-NOZ" in result.recommendation["first_action"]
    assert result.recommendation["yokoten_candidates"][0]["code"] == "Labeler-01"
    assert "knowledge_graph" in result.response


@pytest.mark.anyio
async def test_graph_alert_or_report_branches():
    low_belt = OeeToolBelt(
        summary=await _const(_low_summary()),
        downtime=await _const({"total_minutes_in_top": 0, "items": []}),
    )
    alert = await run_workflow("ส่งรายงาน OEE วันนี้", tools=low_belt, workflow=WorkflowName.ALERT_OR_REPORT)
    assert alert.decision["branch"] == "A_alert"
    assert alert.needs_approval is True

    high_belt = OeeToolBelt(summary=await _const(_ok_summary(oee_pct=71.76)))
    report = await run_workflow("ส่งรายงาน OEE วันนี้", tools=high_belt, workflow=WorkflowName.ALERT_OR_REPORT)
    assert report.decision["branch"] == "B_daily_report"
    assert report.needs_approval is False


def test_classify_workflow():
    assert classify_workflow("ทำไม OEE วันนี้ลดลง") == WorkflowName.DIAGNOSE
    assert classify_workflow("ต้องผลิตเท่าไรถึง 85%") == WorkflowName.TARGET
    assert classify_workflow("ส่งรายงาน daily OEE") == WorkflowName.ALERT_OR_REPORT
    assert classify_workflow("OEE ไลน์ PACK-2 เท่าไหร่") == WorkflowName.STATUS
