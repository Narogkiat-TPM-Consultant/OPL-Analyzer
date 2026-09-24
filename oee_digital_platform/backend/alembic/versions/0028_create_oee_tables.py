"""create OEE domain tables

Revision ID: 0028_create_oee_tables
Revises: 0027_user_magic_link_epoch
Create Date: 2026-08-13

Plant hierarchy, production/downtime/defect events, OEE results, improvement actions.
Mirrors backend/sql/oee_schema.sql.
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

revision = "0028_create_oee_tables"
down_revision = "0027_user_magic_link_epoch"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "oee_plants",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="Asia/Bangkok"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("code", name="oee_plants_code_key"),
    )
    op.create_index("ix_oee_plants_code", "oee_plants", ["code"])

    op.create_table(
        "oee_lines",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_plants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("plant_id", "code", name="uq_oee_lines_plant_code"),
    )
    op.create_index("ix_oee_lines_plant_id", "oee_lines", ["plant_id"])

    op.create_table(
        "oee_machines",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("line_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_lines.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("ideal_cycle_time_sec", sa.Numeric(12, 4), nullable=False, server_default="1.0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("line_id", "code", name="uq_oee_machines_line_code"),
    )
    op.create_index("ix_oee_machines_line_id", "oee_machines", ["line_id"])

    op.create_table(
        "oee_shifts",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_plants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("planned_minutes", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("plant_id", "code", name="uq_oee_shifts_plant_code"),
    )
    op.create_index("ix_oee_shifts_plant_id", "oee_shifts", ["plant_id"])

    op.create_table(
        "oee_production_records",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("machine_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_machines.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shift_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("period_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("period_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("total_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("good_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reject_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rework_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("source", sa.String(32), nullable=False, server_default="manual"),
        sa.Column("external_event_id", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("source", "external_event_id", name="uq_oee_production_external"),
    )
    op.create_index(
        "ix_oee_production_machine_period",
        "oee_production_records",
        ["machine_id", "period_start", "period_end"],
    )

    op.create_table(
        "oee_downtime_events",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("machine_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_machines.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shift_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_minutes", sa.Numeric(12, 2), nullable=True),
        sa.Column("reason_code", sa.String(64), nullable=False),
        sa.Column("reason_label", sa.String(255), nullable=True),
        sa.Column("category", sa.String(32), nullable=False, server_default="unplanned"),
        sa.Column("is_planned", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("source", sa.String(32), nullable=False, server_default="manual"),
        sa.Column("external_event_id", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("source", "external_event_id", name="uq_oee_downtime_external"),
    )
    op.create_index("ix_oee_downtime_machine_started", "oee_downtime_events", ["machine_id", "started_at"])
    op.create_index("ix_oee_downtime_reason_code", "oee_downtime_events", ["reason_code"])

    op.create_table(
        "oee_defect_records",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("machine_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_machines.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shift_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("defect_code", sa.String(64), nullable=False),
        sa.Column("defect_label", sa.String(255), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("severity", sa.String(16), nullable=False, server_default="minor"),
        sa.Column("source", sa.String(32), nullable=False, server_default="qa"),
        sa.Column("external_event_id", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("source", "external_event_id", name="uq_oee_defect_external"),
    )
    op.create_index("ix_oee_defect_machine_recorded", "oee_defect_records", ["machine_id", "recorded_at"])

    op.create_table(
        "oee_results",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_plants.id", ondelete="SET NULL"), nullable=True),
        sa.Column("line_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_lines.id", ondelete="SET NULL"), nullable=True),
        sa.Column("machine_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_machines.id", ondelete="SET NULL"), nullable=True),
        sa.Column("shift_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("period_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("period_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("planned_time_min", sa.Numeric(12, 2), nullable=False),
        sa.Column("downtime_min", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("operating_time_min", sa.Numeric(12, 2), nullable=False),
        sa.Column("total_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("good_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reject_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("availability", sa.Numeric(8, 6), nullable=False),
        sa.Column("performance", sa.Numeric(8, 6), nullable=False),
        sa.Column("quality", sa.Numeric(8, 6), nullable=False),
        sa.Column("oee", sa.Numeric(8, 6), nullable=False),
        sa.Column("ideal_cycle_time_sec", sa.Numeric(12, 4), nullable=True),
        sa.Column("calc_version", sa.String(16), nullable=False, server_default="v1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_oee_results_scope_period",
        "oee_results",
        ["plant_id", "line_id", "machine_id", "period_start", "period_end"],
    )

    op.create_table(
        "oee_improvement_actions",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_plants.id", ondelete="SET NULL"), nullable=True),
        sa.Column("line_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_lines.id", ondelete="SET NULL"), nullable=True),
        sa.Column("machine_id", PG_UUID(as_uuid=True), sa.ForeignKey("oee_machines.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("problem", sa.Text(), nullable=False),
        sa.Column("root_cause", sa.Text(), nullable=True),
        sa.Column("plan", sa.Text(), nullable=True),
        sa.Column("owner_name", sa.String(128), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="open"),
        sa.Column("priority", sa.String(16), nullable=False, server_default="medium"),
        sa.Column("related_reason_code", sa.String(64), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("baseline_oee", sa.Numeric(8, 6), nullable=True),
        sa.Column("result_oee", sa.Numeric(8, 6), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_oee_actions_status", "oee_improvement_actions", ["status"])
    op.create_index("ix_oee_actions_machine", "oee_improvement_actions", ["machine_id"])


def downgrade() -> None:
    op.drop_table("oee_improvement_actions")
    op.drop_table("oee_results")
    op.drop_table("oee_defect_records")
    op.drop_table("oee_downtime_events")
    op.drop_table("oee_production_records")
    op.drop_table("oee_shifts")
    op.drop_table("oee_machines")
    op.drop_table("oee_lines")
    op.drop_table("oee_plants")
