"""Unit tests for OEE calculation engine (no database required)."""

from decimal import Decimal

import pytest

from app.agents.tools.oee_tools import validate_cited_minutes
from app.services.oee_engine import calculate_oee, estimate_output_for_target_oee


def test_calculate_oee_basic():
    # 480 planned min, 48 downtime -> A = 0.9
    # ICT 60s, total 432 counts in 432 operating min -> P = 1.0
    # good 410 / 432 -> Q ≈ 0.949074
    result = calculate_oee(
        planned_time_min=480,
        downtime_min=48,
        total_count=432,
        good_count=410,
        ideal_cycle_time_sec=60,
    )
    assert result.availability == Decimal("0.900000")
    assert result.performance == Decimal("1.000000")
    assert float(result.quality) == pytest.approx(410 / 432, rel=1e-5)
    assert float(result.oee) == pytest.approx(0.9 * (410 / 432), rel=1e-5)


def test_estimate_output_scales_toward_target():
    current = calculate_oee(
        planned_time_min=480,
        downtime_min=48,
        total_count=400,
        good_count=380,
        ideal_cycle_time_sec=60,
    )
    est = estimate_output_for_target_oee(current=current, target_oee=0.85)
    assert "required_total_count" in est
    assert est["required_total_count"] >= current.total_count
    assert est["target_oee_pct"] == 85.0


def test_validate_cited_minutes():
    ok = validate_cited_minutes(65, 65.2)
    assert ok["ok"] is True
    bad = validate_cited_minutes(100, 65)
    assert bad["ok"] is False
