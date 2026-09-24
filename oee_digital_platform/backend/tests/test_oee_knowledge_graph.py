"""Knowledge-graph algorithms adapted from rahulnyk/knowledge_graph (no database)."""

from types import SimpleNamespace
from uuid import uuid4

from app.oee_layers.harness import verify_knowledge_graph
from app.services.oee_knowledge_graph import (
    OeeKnowledgeGraph,
    build_operational_graph,
    demo_document_concepts,
)


def test_ingest_chunk_proximity_and_explicit_weights():
    graph = OeeKnowledgeGraph()
    graph.ingest_chunk(
        "chunk-1",
        ["Nozzle jam", "Viscous material"],
        explicit_relations=[("Nozzle jam", "caused_by", "Viscous material")],
    )
    graph.ingest_chunk("chunk-2", ["Nozzle jam", "Viscous material"])

    prox = graph.edges[("concept:Nozzle jam", "concept:Viscous material", "mentioned_with")]
    assert prox.weight == 1.0  # 0.5 + 0.5 from two chunks
    caused = graph.edges[("concept:Nozzle jam", "concept:Viscous material", "caused_by")]
    assert caused.weight == 1.0
    assert caused.source_ref == "chunk-1"


def test_operational_graph_search_and_yokoten():
    plant_id, line_id = uuid4(), uuid4()
    filler_id, labeler_id = uuid4(), uuid4()
    plants = [SimpleNamespace(id=plant_id, code="PLT01", name="Demo")]
    lines = [SimpleNamespace(id=line_id, plant_id=plant_id, code="PACK-2", name="Packing 2")]
    machines = [
        SimpleNamespace(id=filler_id, line_id=line_id, code="Filler-01", name="Filler"),
        SimpleNamespace(id=labeler_id, line_id=line_id, code="Labeler-01", name="Labeler"),
    ]
    downtime = [
        SimpleNamespace(
            id=uuid4(),
            machine_id=filler_id,
            reason_code="BRK-NOZ",
            reason_label="Nozzle jam",
            category="breakdown",
            duration_minutes=45,
        )
    ]
    graph = build_operational_graph(
        plants=plants, lines=lines, machines=machines, downtime=downtime, defects=[], actions=[]
    )
    demo_document_concepts(graph)

    result = graph.search("BRK-NOZ", hops=2)
    kinds = {n["kind"] for n in result["nodes"]}
    assert "reason" in kinds
    assert "machine" in kinds
    assert any(n["code"] == "Filler-01" for n in result["nodes"])
    assert result["hubs"]
    assert any(e.get("source_ref") for e in result["edges"])


def test_communities_group_connected_concepts():
    graph = OeeKnowledgeGraph()
    graph.ingest_chunk("a", ["Alpha", "Beta"])
    graph.ingest_chunk("b", ["Gamma"])
    comm = graph.communities()
    assert comm["concept:Alpha"] == comm["concept:Beta"]
    assert comm["concept:Gamma"] != comm["concept:Alpha"]


def test_verify_knowledge_graph_requires_provenance():
    ok = verify_knowledge_graph(
        {
            "nodes": [{"key": "reason:BRK-NOZ"}],
            "edges": [{"source": "a", "target": "b", "source_ref": "evt-1", "source_type": "event"}],
        }
    )
    assert ok.ok is True
    bad = verify_knowledge_graph({"nodes": [{"key": "x"}], "edges": [{"source": "a", "target": "b"}]})
    assert bad.ok is False
