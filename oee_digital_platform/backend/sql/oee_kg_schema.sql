-- OEE knowledge graph (document concepts + operational links)
-- Applied via Alembic 0029_create_oee_kg_tables.py

BEGIN;

CREATE TABLE IF NOT EXISTS oee_kg_nodes (
    id UUID PRIMARY KEY,
    node_key VARCHAR(191) NOT NULL UNIQUE,
    kind VARCHAR(32) NOT NULL,
    code VARCHAR(128) NOT NULL,
    label VARCHAR(255) NOT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'event',
    source_ref VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_oee_kg_nodes_kind ON oee_kg_nodes(kind);

CREATE TABLE IF NOT EXISTS oee_kg_edges (
    id UUID PRIMARY KEY,
    source_node_id UUID NOT NULL REFERENCES oee_kg_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES oee_kg_nodes(id) ON DELETE CASCADE,
    relation VARCHAR(64) NOT NULL,
    weight NUMERIC(12, 3) NOT NULL DEFAULT 1,
    relations_text TEXT,
    source VARCHAR(32) NOT NULL DEFAULT 'event',
    source_ref VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_oee_kg_edges_source_node_id ON oee_kg_edges(source_node_id);
CREATE INDEX IF NOT EXISTS ix_oee_kg_edges_target_node_id ON oee_kg_edges(target_node_id);

COMMIT;
