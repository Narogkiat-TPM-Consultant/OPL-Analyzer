-- OEE Digital Platform — initial domain schema (PostgreSQL)
-- Source of truth for plant hierarchy, production events, and OEE results.
-- Apply via Alembic migration 0028_create_oee_tables.py (preferred) or:
--   psql "$DATABASE_URL" -f backend/sql/oee_schema.sql

BEGIN;

CREATE TABLE IF NOT EXISTS oee_plants (
    id UUID PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Bangkok',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS oee_lines (
    id UUID PRIMARY KEY,
    plant_id UUID NOT NULL REFERENCES oee_plants(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_oee_lines_plant_code UNIQUE (plant_id, code)
);
CREATE INDEX IF NOT EXISTS ix_oee_lines_plant_id ON oee_lines(plant_id);

CREATE TABLE IF NOT EXISTS oee_machines (
    id UUID PRIMARY KEY,
    line_id UUID NOT NULL REFERENCES oee_lines(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    ideal_cycle_time_sec NUMERIC(12, 4) NOT NULL DEFAULT 1.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_oee_machines_line_code UNIQUE (line_id, code),
    CONSTRAINT ck_oee_machines_ideal_cycle_positive CHECK (ideal_cycle_time_sec > 0)
);
CREATE INDEX IF NOT EXISTS ix_oee_machines_line_id ON oee_machines(line_id);

CREATE TABLE IF NOT EXISTS oee_shifts (
    id UUID PRIMARY KEY,
    plant_id UUID NOT NULL REFERENCES oee_plants(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(64) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    planned_minutes INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_oee_shifts_plant_code UNIQUE (plant_id, code),
    CONSTRAINT ck_oee_shifts_planned_positive CHECK (planned_minutes > 0)
);
CREATE INDEX IF NOT EXISTS ix_oee_shifts_plant_id ON oee_shifts(plant_id);

-- Canonical production counts (good / reject / rework) per machine + shift window
CREATE TABLE IF NOT EXISTS oee_production_records (
    id UUID PRIMARY KEY,
    machine_id UUID NOT NULL REFERENCES oee_machines(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES oee_shifts(id) ON DELETE SET NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_count INTEGER NOT NULL DEFAULT 0,
    good_count INTEGER NOT NULL DEFAULT 0,
    reject_count INTEGER NOT NULL DEFAULT 0,
    rework_count INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(32) NOT NULL DEFAULT 'manual', -- plc | mes | erp | manual | qa
    external_event_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT ck_oee_production_period CHECK (period_end > period_start),
    CONSTRAINT ck_oee_production_counts_nonneg CHECK (
        total_count >= 0 AND good_count >= 0 AND reject_count >= 0 AND rework_count >= 0
    ),
    CONSTRAINT uq_oee_production_external UNIQUE (source, external_event_id)
);
CREATE INDEX IF NOT EXISTS ix_oee_production_machine_period
    ON oee_production_records(machine_id, period_start, period_end);

-- Downtime / stop events
CREATE TABLE IF NOT EXISTS oee_downtime_events (
    id UUID PRIMARY KEY,
    machine_id UUID NOT NULL REFERENCES oee_machines(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES oee_shifts(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_minutes NUMERIC(12, 2),
    reason_code VARCHAR(64) NOT NULL,
    reason_label VARCHAR(255),
    category VARCHAR(32) NOT NULL DEFAULT 'unplanned', -- planned | unplanned | changeover | breakdown | other
    is_planned BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    source VARCHAR(32) NOT NULL DEFAULT 'manual',
    external_event_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT ck_oee_downtime_ended_after_start CHECK (
        ended_at IS NULL OR ended_at >= started_at
    ),
    CONSTRAINT uq_oee_downtime_external UNIQUE (source, external_event_id)
);
CREATE INDEX IF NOT EXISTS ix_oee_downtime_machine_started
    ON oee_downtime_events(machine_id, started_at);
CREATE INDEX IF NOT EXISTS ix_oee_downtime_reason_code
    ON oee_downtime_events(reason_code);

-- Defect / quality events (optional detail beyond production_records aggregates)
CREATE TABLE IF NOT EXISTS oee_defect_records (
    id UUID PRIMARY KEY,
    machine_id UUID NOT NULL REFERENCES oee_machines(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES oee_shifts(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    defect_code VARCHAR(64) NOT NULL,
    defect_label VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    severity VARCHAR(16) NOT NULL DEFAULT 'minor', -- minor | major | critical
    source VARCHAR(32) NOT NULL DEFAULT 'qa',
    external_event_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT ck_oee_defect_qty_positive CHECK (quantity > 0),
    CONSTRAINT uq_oee_defect_external UNIQUE (source, external_event_id)
);
CREATE INDEX IF NOT EXISTS ix_oee_defect_machine_recorded
    ON oee_defect_records(machine_id, recorded_at);

-- Materialized-style snapshots computed by oee_engine (store for dashboards/AI)
CREATE TABLE IF NOT EXISTS oee_results (
    id UUID PRIMARY KEY,
    plant_id UUID REFERENCES oee_plants(id) ON DELETE SET NULL,
    line_id UUID REFERENCES oee_lines(id) ON DELETE SET NULL,
    machine_id UUID REFERENCES oee_machines(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES oee_shifts(id) ON DELETE SET NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    planned_time_min NUMERIC(12, 2) NOT NULL,
    downtime_min NUMERIC(12, 2) NOT NULL DEFAULT 0,
    operating_time_min NUMERIC(12, 2) NOT NULL,
    total_count INTEGER NOT NULL DEFAULT 0,
    good_count INTEGER NOT NULL DEFAULT 0,
    reject_count INTEGER NOT NULL DEFAULT 0,
    availability NUMERIC(8, 6) NOT NULL,
    performance NUMERIC(8, 6) NOT NULL,
    quality NUMERIC(8, 6) NOT NULL,
    oee NUMERIC(8, 6) NOT NULL,
    ideal_cycle_time_sec NUMERIC(12, 4),
    calc_version VARCHAR(16) NOT NULL DEFAULT 'v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT ck_oee_results_period CHECK (period_end > period_start),
    CONSTRAINT ck_oee_results_components CHECK (
        availability >= 0 AND performance >= 0 AND quality >= 0 AND oee >= 0
    )
);
CREATE INDEX IF NOT EXISTS ix_oee_results_scope_period
    ON oee_results(plant_id, line_id, machine_id, period_start, period_end);

-- PDCA / improvement actions linked to losses
CREATE TABLE IF NOT EXISTS oee_improvement_actions (
    id UUID PRIMARY KEY,
    plant_id UUID REFERENCES oee_plants(id) ON DELETE SET NULL,
    line_id UUID REFERENCES oee_lines(id) ON DELETE SET NULL,
    machine_id UUID REFERENCES oee_machines(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    problem TEXT NOT NULL,
    root_cause TEXT,
    plan TEXT,
    owner_name VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- open | doing | verify | closed | cancelled
    priority VARCHAR(16) NOT NULL DEFAULT 'medium', -- low | medium | high | critical
    related_reason_code VARCHAR(64),
    due_date DATE,
    baseline_oee NUMERIC(8, 6),
    result_oee NUMERIC(8, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_oee_actions_status ON oee_improvement_actions(status);
CREATE INDEX IF NOT EXISTS ix_oee_actions_machine ON oee_improvement_actions(machine_id);

COMMIT;
