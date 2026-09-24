# OEE Domain Layer (added on top of Full-Stack AI Agent Template)

Scaffold generated with `fastapi-fullstack` (PydanticAI + Next.js + pgvector + Celery), then extended with OEE-specific domain code.

## What was added

| Path | Purpose |
|---|---|
| `backend/sql/oee_schema.sql` | Reference SQL schema |
| `backend/sql/oee_seed_demo.sql` | Demo plant PACK-2 data |
| `backend/alembic/versions/0028_create_oee_tables.py` | Migration |
| `backend/app/db/models/oee.py` | SQLAlchemy models |
| `backend/app/services/oee_engine.py` | A/P/Q/OEE math + queries |
| `backend/app/agents/tools/oee_tools.py` | Agent tools |
| `backend/app/oee_layers/` | Harness + Loop + Graph |
| `backend/app/services/oee_knowledge_graph.py` | Concept + operational graph, hop search |
| `backend/app/services/oee_realtime.py` | Current-shift window + 30s snapshot cache |
| `backend/app/services/rag/query_rewrite.py` | OEE synonym expansion before Hybrid search |
| `backend/app/db/models/oee_kg.py` | `oee_kg_nodes` / `oee_kg_edges` |
| `backend/app/api/routes/v1/oee.py` | REST API for dashboard + workflows |
| `backend/tests/test_oee_engine.py` | Engine unit tests |
| `backend/tests/test_oee_layers.py` | Layer unit tests |
| `backend/tests/test_oee_rag_advanced.py` | Query rewrite + lexical rerank |
| `backend/tests/test_oee_realtime.py` | Shift window + snapshot cache |

## OEE formula (v1)

```
Availability = Operating Time / Planned Time
Performance  = (Ideal Cycle Time × Total Count) / Operating Time
Quality      = Good Count / Total Count
OEE          = A × P × Q
```

Planned downtime (`is_planned=true`) does **not** reduce Availability in v1.

## Bootstrap after `make bootstrap`

```bash
cd oee_digital_platform
make db-upgrade   # includes 0028 OEE tables

# optional demo data
docker compose -f docker-compose.dev.yml exec -T db \
  psql -U postgres -d app -f - < backend/sql/oee_seed_demo.sql
# or copy SQL into the running DB container
```

## API (examples)

- `GET /api/v1/oee/summary?line_code=PACK-2`
- `GET /api/v1/oee/downtime/top?line_code=PACK-2&limit=3`
- `GET /api/v1/oee/machines/ranking?line_code=PACK-2`
- `GET /api/v1/oee/estimate-target?line_code=PACK-2&target_oee_pct=85`
- `GET /api/v1/oee/realtime/snapshot?line_code=PACK-2` — current-shift OEE + downtime + ranking
- `GET /api/v1/oee/knowledge-graph/search?q=BRK-NOZ`
- `POST /api/v1/oee/knowledge-graph/rebuild`
- `POST /api/v1/oee/knowledge-graph/chunks` — ingest SOP concepts (proximity + relations)

## Agent tools

Registered in `assistant.py`:

- `get_oee_summary_tool` — defaults to the current plant shift when dates are omitted
- `get_top_downtime_tool`
- `rank_machines_tool`
- `estimate_output_for_target_tool`
- `get_current_shift_snapshot_tool` — live OEE + Pareto + ranking (30s cache)
- `search_knowledge_graph_tool`
- `run_oee_workflow_tool`

Plus template tools: `search_documents` (query rewrite + Hybrid + lexical rerank), `create_chart_tool`, `ask_user`.

### Hybrid Advanced RAG (why / how, never OEE numbers)

1. **Query rewrite** — Thai/EN + downtime-code synonyms (`หัวฉีดติด` → `nozzle jam BRK-NOZ`)
2. **Hybrid retrieve** — vector + BM25 fused with RRF
3. **OEE lexical rerank** — token overlap + plant-term boost (no cross-encoder API key)

OEE / A / P / Q still come only from `oee_engine`. RAG answers SOP, codes, and related "why/how".

### Real-Time current-shift snapshot

`oee_realtime` resolves `oee_shifts` in the plant timezone (demo: DAY 08:00–16:00 Asia/Bangkok). Mid-shift, `period_end` is now and planned minutes are elapsed. After the shift, the last completed window is used. Between shifts with no history, it falls back to calendar day. The `status` graph uses this snapshot when the question is live (`กะนี้` / `ตอนนี้` / `today`) or no dates were given.

## 3 Engineering Layers (Harness / Loop / Graph)

Reliable OEE agents are split into three layers. Diagnose failures by layer:
missing tools/context → **Harness**; repeats/weak checks → **Loop**;
wrong branch/order → **Graph**.

```
Harness (environment): Gather context → Act (tools) → Verify
        ↑ used by
Loop (iterate): Goal + success criteria + stopping rules
        ↑ used by
Graph (workflow): Start → Task → Decision → Branch / Parallel → Approval → Merge
```

| Layer | Package | OEE meaning |
|---|---|---|
| Harness | `app/oee_layers/harness.py` | Scope + `oee_tools` + verifiers (OEE 0–100, A×P×Q identity, cited minutes) |
| Loop | `app/oee_layers/loop.py` | Retry until verified, or stop on max iterations / no progress |
| Graph | `app/oee_layers/graph.py` | `status` / `diagnose` / `target` / `alert_or_report` |

### Workflows

| Name | Path |
|---|---|
| `status` | current-shift snapshot (or dated summary) |
| `diagnose` | summary → decision (below target?) → parallel downtime + ranking → approval if OEE < 60% |
| `target` | summary → estimate output for target % |
| `alert_or_report` | summary → if OEE < 60% branch A alert + top downtime, else branch B daily report |

### API / Agent

- `POST /api/v1/oee/workflows/run` — deterministic graph (no LLM required)
- Chat tool: `run_oee_workflow_tool`

```bash
curl -X POST http://localhost:8000/api/v1/oee/workflows/run \
  -H 'Content-Type: application/json' \
  -d '{"question":"ทำไม OEE ไลน์ PACK-2 ตก"}'
```

## Next build steps

1. Frontend OEE dashboard pages under `frontend/src/components/oee/`
2. Ingest adapters (PLC/MES/manual) writing into `oee_*` tables
3. Celery jobs: daily OEE summary + Top 3 downtime → Email/LINE/Teams
4. Golden-question eval harness for the AI assistant
5. PDCA action UI bound to `oee_improvement_actions`
