"""OEE domain models — plant hierarchy, events, results, improvement actions."""

from __future__ import annotations

import enum
import uuid
from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class DowntimeCategory(enum.StrEnum):
    PLANNED = "planned"
    UNPLANNED = "unplanned"
    CHANGEOVER = "changeover"
    BREAKDOWN = "breakdown"
    OTHER = "other"


class ActionStatus(enum.StrEnum):
    OPEN = "open"
    DOING = "doing"
    VERIFY = "verify"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class OeePlant(Base, TimestampMixin):
    __tablename__ = "oee_plants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Asia/Bangkok")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    lines: Mapped[list[OeeLine]] = relationship(back_populates="plant", cascade="all, delete-orphan")
    shifts: Mapped[list[OeeShift]] = relationship(
        back_populates="plant", cascade="all, delete-orphan"
    )


class OeeLine(Base, TimestampMixin):
    __tablename__ = "oee_lines"
    __table_args__ = (UniqueConstraint("plant_id", "code", name="uq_oee_lines_plant_code"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_plants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    plant: Mapped[OeePlant] = relationship(back_populates="lines")
    machines: Mapped[list[OeeMachine]] = relationship(
        back_populates="line", cascade="all, delete-orphan"
    )


class OeeMachine(Base, TimestampMixin):
    __tablename__ = "oee_machines"
    __table_args__ = (UniqueConstraint("line_id", "code", name="uq_oee_machines_line_code"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    line_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_lines.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    ideal_cycle_time_sec: Mapped[Decimal] = mapped_column(
        Numeric(12, 4), nullable=False, default=Decimal("1.0")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    line: Mapped[OeeLine] = relationship(back_populates="machines")


class OeeShift(Base, TimestampMixin):
    __tablename__ = "oee_shifts"
    __table_args__ = (UniqueConstraint("plant_id", "code", name="uq_oee_shifts_plant_code"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_plants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    planned_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    plant: Mapped[OeePlant] = relationship(back_populates="shifts")


class OeeProductionRecord(Base, TimestampMixin):
    __tablename__ = "oee_production_records"
    __table_args__ = (UniqueConstraint("source", "external_event_id", name="uq_oee_production_external"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    machine_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("oee_machines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    shift_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True
    )
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    good_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reject_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rework_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="manual")
    external_event_id: Mapped[str | None] = mapped_column(String(128), nullable=True)


class OeeDowntimeEvent(Base, TimestampMixin):
    __tablename__ = "oee_downtime_events"
    __table_args__ = (UniqueConstraint("source", "external_event_id", name="uq_oee_downtime_external"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    machine_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("oee_machines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    shift_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_minutes: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    reason_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    reason_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(32), nullable=False, default=DowntimeCategory.UNPLANNED)
    is_planned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="manual")
    external_event_id: Mapped[str | None] = mapped_column(String(128), nullable=True)


class OeeDefectRecord(Base, TimestampMixin):
    __tablename__ = "oee_defect_records"
    __table_args__ = (UniqueConstraint("source", "external_event_id", name="uq_oee_defect_external"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    machine_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("oee_machines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    shift_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True
    )
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    defect_code: Mapped[str] = mapped_column(String(64), nullable=False)
    defect_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    severity: Mapped[str] = mapped_column(String(16), nullable=False, default="minor")
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="qa")
    external_event_id: Mapped[str | None] = mapped_column(String(128), nullable=True)


class OeeResult(Base, TimestampMixin):
    __tablename__ = "oee_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_plants.id", ondelete="SET NULL"), nullable=True
    )
    line_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_lines.id", ondelete="SET NULL"), nullable=True
    )
    machine_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_machines.id", ondelete="SET NULL"), nullable=True
    )
    shift_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_shifts.id", ondelete="SET NULL"), nullable=True
    )
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    planned_time_min: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    downtime_min: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    operating_time_min: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    good_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reject_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    availability: Mapped[Decimal] = mapped_column(Numeric(8, 6), nullable=False)
    performance: Mapped[Decimal] = mapped_column(Numeric(8, 6), nullable=False)
    quality: Mapped[Decimal] = mapped_column(Numeric(8, 6), nullable=False)
    oee: Mapped[Decimal] = mapped_column(Numeric(8, 6), nullable=False)
    ideal_cycle_time_sec: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    calc_version: Mapped[str] = mapped_column(String(16), nullable=False, default="v1")


class OeeImprovementAction(Base, TimestampMixin):
    __tablename__ = "oee_improvement_actions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_plants.id", ondelete="SET NULL"), nullable=True
    )
    line_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_lines.id", ondelete="SET NULL"), nullable=True
    )
    machine_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("oee_machines.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    root_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=ActionStatus.OPEN)
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    related_reason_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    baseline_oee: Mapped[Decimal | None] = mapped_column(Numeric(8, 6), nullable=True)
    result_oee: Mapped[Decimal | None] = mapped_column(Numeric(8, 6), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
