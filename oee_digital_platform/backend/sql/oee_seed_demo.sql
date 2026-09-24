-- Demo seed for 1 plant / 1 line / 2 machines (safe to re-run after truncate)
-- psql "$DATABASE_URL" -f backend/sql/oee_seed_demo.sql

BEGIN;

-- Fixed UUIDs for predictable demos / AI golden questions
INSERT INTO oee_plants (id, code, name, timezone)
VALUES ('11111111-1111-1111-1111-111111111111', 'PLT01', 'Demo Plant Bangkok', 'Asia/Bangkok')
ON CONFLICT (code) DO NOTHING;

INSERT INTO oee_lines (id, plant_id, code, name)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'PACK-2',
    'Packing Line 2'
)
ON CONFLICT (plant_id, code) DO NOTHING;

INSERT INTO oee_machines (id, line_id, code, name, ideal_cycle_time_sec)
VALUES
    (
        '33333333-3333-3333-3333-333333333331',
        '22222222-2222-2222-2222-222222222222',
        'Filler-01',
        'Filler #1',
        2.5
    ),
    (
        '33333333-3333-3333-3333-333333333332',
        '22222222-2222-2222-2222-222222222222',
        'Labeler-01',
        'Labeler #1',
        1.8
    )
ON CONFLICT (line_id, code) DO NOTHING;

INSERT INTO oee_shifts (id, plant_id, code, name, start_time, end_time, planned_minutes)
VALUES (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    'DAY',
    'Day Shift',
    '08:00',
    '16:00',
    480
)
ON CONFLICT (plant_id, code) DO NOTHING;

-- Today day-shift window (assumes seed run "today" in Asia/Bangkok; adjust as needed)
INSERT INTO oee_production_records (
    id, machine_id, shift_id, period_start, period_end,
    total_count, good_count, reject_count, rework_count, source, external_event_id
)
VALUES
    (
        '55555555-5555-5555-5555-555555555551',
        '33333333-3333-3333-3333-333333333331',
        '44444444-4444-4444-4444-444444444441',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '8 hours',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '16 hours',
        9200, 8800, 300, 100, 'mes', 'demo-prod-filler-1'
    ),
    (
        '55555555-5555-5555-5555-555555555552',
        '33333333-3333-3333-3333-333333333332',
        '44444444-4444-4444-4444-444444444441',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '8 hours',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '16 hours',
        9100, 8950, 120, 30, 'mes', 'demo-prod-labeler-1'
    )
ON CONFLICT (source, external_event_id) DO NOTHING;

INSERT INTO oee_downtime_events (
    id, machine_id, shift_id, started_at, ended_at, duration_minutes,
    reason_code, reason_label, category, is_planned, source, external_event_id
)
VALUES
    (
        '66666666-6666-6666-6666-666666666661',
        '33333333-3333-3333-3333-333333333331',
        '44444444-4444-4444-4444-444444444441',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '10 hours',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '10 hours 45 minutes',
        45,
        'BRK-NOZ', 'Nozzle jam / cleanup', 'breakdown', FALSE, 'manual', 'demo-dt-1'
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        '33333333-3333-3333-3333-333333333331',
        '44444444-4444-4444-4444-444444444441',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '13 hours',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '13 hours 20 minutes',
        20,
        'MAT-WAIT', 'Waiting for material', 'unplanned', FALSE, 'manual', 'demo-dt-2'
    ),
    (
        '66666666-6666-6666-6666-666666666663',
        '33333333-3333-3333-3333-333333333332',
        '44444444-4444-4444-4444-444444444441',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '11 hours',
        date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok') AT TIME ZONE 'Asia/Bangkok' + INTERVAL '11 hours 15 minutes',
        15,
        'CHG-LABEL', 'Label roll changeover', 'changeover', TRUE, 'manual', 'demo-dt-3'
    )
ON CONFLICT (source, external_event_id) DO NOTHING;

COMMIT;
