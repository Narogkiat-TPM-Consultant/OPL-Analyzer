"""create OEE knowledge graph tables

Revision ID: 0029_create_oee_kg_tables
Revises: 0028_create_oee_tables
Create Date: 2026-08-16
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

revision = "0029_create_oee_kg_tables"
down_revision = "0028_create_oee_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "oee_kg_nodes",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("node_key", sa.String(191), nullable=False),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column("code", sa.String(128), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("source", sa.String(32), nullable=False, server_default="event"),
        sa.Column("source_ref", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("node_key", name="uq_oee_kg_nodes_key"),
    )
    op.create_index("ix_oee_kg_nodes_node_key", "oee_kg_nodes", ["node_key"])
    op.create_index("ix_oee_kg_nodes_kind", "oee_kg_nodes", ["kind"])

    op.create_table(
        "oee_kg_edges",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "source_node_id",
            PG_UUID(as_uuid=True),
            sa.ForeignKey("oee_kg_nodes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "target_node_id",
            PG_UUID(as_uuid=True),
            sa.ForeignKey("oee_kg_nodes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("relation", sa.String(64), nullable=False),
        sa.Column("weight", sa.Numeric(12, 3), nullable=False, server_default="1"),
        sa.Column("relations_text", sa.Text(), nullable=True),
        sa.Column("source", sa.String(32), nullable=False, server_default="event"),
        sa.Column("source_ref", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_oee_kg_edges_source_node_id", "oee_kg_edges", ["source_node_id"])
    op.create_index("ix_oee_kg_edges_target_node_id", "oee_kg_edges", ["target_node_id"])


def downgrade() -> None:
    op.drop_table("oee_kg_edges")
    op.drop_table("oee_kg_nodes")
