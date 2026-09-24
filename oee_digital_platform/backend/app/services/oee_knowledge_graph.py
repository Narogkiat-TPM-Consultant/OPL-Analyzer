"""OEE knowledge graph — useful pieces from rahulnyk/knowledge_graph.

Adapted for the plant:
- Document chunks: concepts + proximity edges (W1 explicit, W2 same-chunk)
- Operational graph: built from OEE SQL (no LLM)
- Retrieve: hop neighbors, degree (hubs), communities (yokoten)

Does not invent OEE percentages.
"""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.oee import (
    OeeDefectRecord,
    OeeDowntimeEvent,
    OeeImprovementAction,
    OeeLine,
    OeeMachine,
    OeePlant,
)
from app.db.models.oee_kg import OeeKgEdge, OeeKgNode

W1_EXPLICIT = 1.0
W2_PROXIMITY = 0.5


def node_key(kind: str, code: str) -> str:
    return f"{kind}:{code.strip()}"


@dataclass
class KgNode:
    key: str
    kind: str
    code: str
    label: str
    source: str = "event"
    source_ref: str | None = None
    properties: dict[str, Any] = field(default_factory=dict)


@dataclass
class KgEdge:
    source_key: str
    target_key: str
    relation: str
    weight: float
    relations: list[str] = field(default_factory=list)
    source: str = "event"
    source_ref: str | None = None


class OeeKnowledgeGraph:
    """In-memory concept/operational graph (NetworkX-style, no extra dependency)."""

    def __init__(self) -> None:
        self.nodes: dict[str, KgNode] = {}
        self.edges: dict[tuple[str, str, str], KgEdge] = {}

    def add_node(
        self,
        kind: str,
        code: str,
        label: str | None = None,
        *,
        source: str = "event",
        source_ref: str | None = None,
        **properties: Any,
    ) -> KgNode:
        key = node_key(kind, code)
        if key in self.nodes:
            node = self.nodes[key]
            if label and len(label) > len(node.label):
                node.label = label
            node.properties.update(properties)
            return node
        node = KgNode(
            key=key,
            kind=kind,
            code=code,
            label=label or code,
            source=source,
            source_ref=source_ref,
            properties=dict(properties),
        )
        self.nodes[key] = node
        return node

    def add_edge(
        self,
        source_key: str,
        target_key: str,
        relation: str,
        *,
        weight: float = 1.0,
        source: str = "event",
        source_ref: str | None = None,
        relation_label: str | None = None,
    ) -> KgEdge | None:
        if source_key not in self.nodes or target_key not in self.nodes:
            return None
        if source_key == target_key:
            return None
        edge_key = (source_key, target_key, relation)
        label = relation_label or relation
        if edge_key in self.edges:
            edge = self.edges[edge_key]
            edge.weight += weight
            if label not in edge.relations:
                edge.relations.append(label)
            if source_ref and edge.source_ref and source_ref not in edge.source_ref:
                edge.source_ref = f"{edge.source_ref},{source_ref}"
            return edge
        edge = KgEdge(
            source_key=source_key,
            target_key=target_key,
            relation=relation,
            weight=weight,
            relations=[label],
            source=source,
            source_ref=source_ref,
        )
        self.edges[edge_key] = edge
        return edge

    def ingest_chunk(
        self,
        chunk_id: str,
        concepts: list[str],
        *,
        explicit_relations: list[tuple[str, str, str]] | None = None,
        source: str = "sop",
    ) -> None:
        """rahulnyk method: concepts in one chunk are related; optional explicit edges."""
        cleaned = [c.strip() for c in concepts if c and c.strip()]
        keys: list[str] = []
        for concept in cleaned:
            node = self.add_node("concept", concept, concept, source=source, source_ref=chunk_id)
            keys.append(node.key)

        for i, left in enumerate(keys):
            for right in keys[i + 1 :]:
                self.add_edge(
                    left,
                    right,
                    "mentioned_with",
                    weight=W2_PROXIMITY,
                    source=source,
                    source_ref=chunk_id,
                    relation_label="contextual proximity",
                )

        for src, relation, dst in explicit_relations or []:
            if not src or not dst:
                continue
            s = self.add_node("concept", src, src, source=source, source_ref=chunk_id)
            t = self.add_node("concept", dst, dst, source=source, source_ref=chunk_id)
            self.add_edge(
                s.key,
                t.key,
                relation,
                weight=W1_EXPLICIT,
                source=source,
                source_ref=chunk_id,
                relation_label=relation,
            )

    def degrees(self) -> dict[str, float]:
        deg: dict[str, float] = dict.fromkeys(self.nodes, 0.0)
        for edge in self.edges.values():
            deg[edge.source_key] += edge.weight
            deg[edge.target_key] += edge.weight
        return deg

    def communities(self) -> dict[str, int]:
        """Connected components (undirected) — yokoten clusters."""
        parent = {k: k for k in self.nodes}

        def find(x: str) -> str:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(a: str, b: str) -> None:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[rb] = ra

        for edge in self.edges.values():
            union(edge.source_key, edge.target_key)

        roots: dict[str, int] = {}
        labels: dict[str, int] = {}
        next_id = 0
        for key in self.nodes:
            root = find(key)
            if root not in roots:
                roots[root] = next_id
                next_id += 1
            labels[key] = roots[root]
        return labels

    def find_keys(self, query: str) -> list[str]:
        q = query.strip().lower()
        if not q:
            return []
        hits = [
            n.key
            for n in self.nodes.values()
            if q in n.key.lower() or q in n.label.lower() or q in n.code.lower()
        ]
        return hits

    def neighbors(self, start_keys: list[str], hops: int = 2) -> tuple[set[str], list[KgEdge]]:
        adj: dict[str, list[KgEdge]] = defaultdict(list)
        for edge in self.edges.values():
            adj[edge.source_key].append(edge)
            adj[edge.target_key].append(edge)

        seen = set(start_keys)
        queue: deque[tuple[str, int]] = deque((k, 0) for k in start_keys if k in self.nodes)
        used_edges: dict[tuple[str, str, str], KgEdge] = {}

        while queue:
            key, depth = queue.popleft()
            if depth >= hops:
                continue
            for edge in adj.get(key, []):
                used_edges[(edge.source_key, edge.target_key, edge.relation)] = edge
                nxt = edge.target_key if edge.source_key == key else edge.source_key
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, depth + 1))
        return seen, list(used_edges.values())

    def search(self, query: str, hops: int = 2, limit: int = 20) -> dict[str, Any]:
        starts = self.find_keys(query)
        if not starts:
            return {
                "query": query,
                "matched": [],
                "nodes": [],
                "edges": [],
                "hubs": [],
                "error": None,
                "message": "No matching concept/node",
            }
        node_keys, edges = self.neighbors(starts, hops=max(1, min(hops, 4)))
        deg = self.degrees()
        comm = self.communities()
        nodes = []
        for key in node_keys:
            node = self.nodes[key]
            nodes.append(
                {
                    "key": node.key,
                    "kind": node.kind,
                    "code": node.code,
                    "label": node.label,
                    "source": node.source,
                    "source_ref": node.source_ref,
                    "degree": round(deg.get(key, 0.0), 3),
                    "community": comm.get(key),
                }
            )
        nodes.sort(key=lambda n: n["degree"], reverse=True)
        edge_payload = [
            {
                "source": e.source_key,
                "target": e.target_key,
                "relation": e.relation,
                "weight": round(e.weight, 3),
                "relations": e.relations,
                "source_type": e.source,
                "source_ref": e.source_ref,
            }
            for e in sorted(edges, key=lambda x: x.weight, reverse=True)
        ]
        hubs = nodes[:5]
        yokoten = [
            n
            for n in nodes
            if n["kind"] in {"machine", "line"} and n["key"] not in starts
        ]
        return {
            "query": query,
            "matched": starts,
            "hops": hops,
            "nodes": nodes[:limit],
            "edges": edge_payload[: limit * 2],
            "hubs": hubs,
            "yokoten_candidates": yokoten[:8],
            "node_count": len(node_keys),
            "edge_count": len(edges),
        }

    def as_stats(self) -> dict[str, Any]:
        return {"node_count": len(self.nodes), "edge_count": len(self.edges)}


def build_operational_graph(
    *,
    plants: list[Any],
    lines: list[Any],
    machines: list[Any],
    downtime: list[Any],
    defects: list[Any] | None = None,
    actions: list[Any] | None = None,
) -> OeeKnowledgeGraph:
    """Deterministic graph from OEE records (Graph B — no LLM)."""
    graph = OeeKnowledgeGraph()
    plant_by_id = {p.id: p for p in plants}
    line_by_id = {ln.id: ln for ln in lines}
    machine_by_id = {m.id: m for m in machines}

    for plant in plants:
        graph.add_node("plant", plant.code, plant.name, source="hierarchy", source_ref=str(plant.id))
    for line in lines:
        plant = plant_by_id.get(line.plant_id)
        graph.add_node("line", line.code, line.name, source="hierarchy", source_ref=str(line.id))
        if plant:
            graph.add_edge(
                node_key("plant", plant.code),
                node_key("line", line.code),
                "contains",
                source="hierarchy",
                source_ref=str(line.id),
            )
    for machine in machines:
        line = line_by_id.get(machine.line_id)
        graph.add_node("machine", machine.code, machine.name, source="hierarchy", source_ref=str(machine.id))
        if line:
            graph.add_edge(
                node_key("line", line.code),
                node_key("machine", machine.code),
                "has_machine",
                source="hierarchy",
                source_ref=str(machine.id),
            )

    for event in downtime:
        machine = machine_by_id.get(event.machine_id)
        if not machine:
            continue
        minutes = float(event.duration_minutes or 0)
        reason = event.reason_code
        graph.add_node(
            "reason",
            reason,
            event.reason_label or reason,
            source="event",
            source_ref=str(event.id),
            category=event.category,
        )
        graph.add_edge(
            node_key("machine", machine.code),
            node_key("reason", reason),
            "has_downtime",
            weight=max(minutes, 1.0),
            source="event",
            source_ref=str(event.id),
            relation_label=event.reason_label or reason,
        )
        line = line_by_id.get(machine.line_id)
        if line:
            graph.add_edge(
                node_key("reason", reason),
                node_key("line", line.code),
                "on_line",
                weight=max(minutes, 1.0),
                source="event",
                source_ref=str(event.id),
            )

    for defect in defects or []:
        machine = machine_by_id.get(defect.machine_id)
        if not machine:
            continue
        graph.add_node(
            "defect",
            defect.defect_code,
            defect.defect_label or defect.defect_code,
            source="event",
            source_ref=str(defect.id),
        )
        graph.add_edge(
            node_key("machine", machine.code),
            node_key("defect", defect.defect_code),
            "has_defect",
            weight=float(defect.quantity or 1),
            source="event",
            source_ref=str(defect.id),
        )

    for action in actions or []:
        graph.add_node("action", str(action.id)[:8], action.title, source="event", source_ref=str(action.id))
        if action.related_reason_code:
            graph.add_node("reason", action.related_reason_code, action.related_reason_code, source="event")
            graph.add_edge(
                node_key("action", str(action.id)[:8]),
                node_key("reason", action.related_reason_code),
                "addresses",
                source="event",
                source_ref=str(action.id),
            )
        if action.machine_id and action.machine_id in machine_by_id:
            machine = machine_by_id[action.machine_id]
            graph.add_edge(
                node_key("action", str(action.id)[:8]),
                node_key("machine", machine.code),
                "on_machine",
                source="event",
                source_ref=str(action.id),
            )

    return graph


def demo_document_concepts(graph: OeeKnowledgeGraph) -> None:
    """Seed SOP-style concepts (Graph A) for the PACK-2 demo."""
    graph.ingest_chunk(
        "sop-nozzle-01",
        ["Nozzle jam", "Viscous material", "Tank temperature", "Filler-01"],
        explicit_relations=[
            ("Nozzle jam", "caused_by", "Viscous material"),
            ("Viscous material", "controlled_by", "Tank temperature"),
        ],
    )
    graph.ingest_chunk(
        "sop-label-01",
        ["Label wrinkle", "Labeler tension", "Labeler-01"],
        explicit_relations=[("Label wrinkle", "fixed_by", "Labeler tension")],
    )
    # Bridge document concepts to operational reason codes when both exist
    if "reason:BRK-NOZ" in graph.nodes and "concept:Nozzle jam" in graph.nodes:
        graph.add_edge(
            "reason:BRK-NOZ",
            "concept:Nozzle jam",
            "same_as",
            source="sop",
            source_ref="sop-nozzle-01",
        )


async def rebuild_operational_graph(session: AsyncSession, *, include_demo_concepts: bool = True) -> OeeKnowledgeGraph:
    plants = list((await session.scalars(select(OeePlant))).all())
    lines = list((await session.scalars(select(OeeLine))).all())
    machines = list((await session.scalars(select(OeeMachine))).all())
    downtime = list((await session.scalars(select(OeeDowntimeEvent))).all())
    defects = list((await session.scalars(select(OeeDefectRecord))).all())
    actions = list((await session.scalars(select(OeeImprovementAction))).all())
    graph = build_operational_graph(
        plants=plants,
        lines=lines,
        machines=machines,
        downtime=downtime,
        defects=defects,
        actions=actions,
    )
    if include_demo_concepts:
        demo_document_concepts(graph)
    await persist_graph(session, graph)
    return graph


async def persist_graph(session: AsyncSession, graph: OeeKnowledgeGraph) -> None:
    existing_nodes = list((await session.scalars(select(OeeKgNode))).all())
    existing_edges = list((await session.scalars(select(OeeKgEdge))).all())
    for row in existing_edges:
        await session.delete(row)
    for row in existing_nodes:
        await session.delete(row)
    await session.flush()

    key_to_id: dict[str, UUID] = {}
    for node in graph.nodes.values():
        row = OeeKgNode(
            node_key=node.key,
            kind=node.kind,
            code=node.code,
            label=node.label,
            source=node.source,
            source_ref=node.source_ref,
        )
        session.add(row)
        await session.flush()
        key_to_id[node.key] = row.id

    for edge in graph.edges.values():
        session.add(
            OeeKgEdge(
                source_node_id=key_to_id[edge.source_key],
                target_node_id=key_to_id[edge.target_key],
                relation=edge.relation,
                weight=edge.weight,
                relations_text=" | ".join(edge.relations),
                source=edge.source,
                source_ref=edge.source_ref,
            )
        )
    await session.flush()


async def load_graph(session: AsyncSession) -> OeeKnowledgeGraph:
    graph = OeeKnowledgeGraph()
    nodes = list((await session.scalars(select(OeeKgNode))).all())
    if not nodes:
        return graph
    id_to_key = {}
    for node in nodes:
        graph.add_node(
            node.kind,
            node.code,
            node.label,
            source=node.source,
            source_ref=node.source_ref,
        )
        id_to_key[node.id] = node.node_key
    edges = list((await session.scalars(select(OeeKgEdge))).all())
    for edge in edges:
        src = id_to_key.get(edge.source_node_id)
        dst = id_to_key.get(edge.target_node_id)
        if src and dst:
            graph.add_edge(
                src,
                dst,
                edge.relation,
                weight=float(edge.weight),
                source=edge.source,
                source_ref=edge.source_ref,
                relation_label=edge.relations_text,
            )
    return graph


async def ingest_chunk_to_db(
    session: AsyncSession,
    chunk_id: str,
    concepts: list[str],
    *,
    explicit_relations: list[tuple[str, str, str]] | None = None,
    source: str = "sop",
) -> dict[str, Any]:
    graph = await load_graph(session)
    graph.ingest_chunk(chunk_id, concepts, explicit_relations=explicit_relations, source=source)
    await persist_graph(session, graph)
    return graph.as_stats()


async def search_graph(
    session: AsyncSession,
    query: str,
    *,
    hops: int = 2,
    rebuild_if_empty: bool = True,
) -> dict[str, Any]:
    graph = await load_graph(session)
    if not graph.nodes and rebuild_if_empty:
        graph = await rebuild_operational_graph(session)
    result = graph.search(query, hops=hops)
    result["graph_stats"] = graph.as_stats()
    return result
