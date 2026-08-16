"""Query rewrite + OEE lexical reranker (no embeddings / DB)."""

from __future__ import annotations

import pytest

from app.services.rag.config import RAGSettings, RerankerConfig
from app.services.rag.models import SearchResult
from app.services.rag.query_rewrite import rewrite_oee_query, tokenize_oee_query
from app.services.rag.reranker import OeeLexicalReranker, RerankService


def test_rewrite_expands_nozzle_thai():
    rewritten = rewrite_oee_query("หัวฉีดติดที่ Filler")
    assert rewritten.original == "หัวฉีดติดที่ Filler"
    joined = rewritten.rewritten.lower()
    assert "brk-noz" in joined
    assert "nozzle jam" in joined
    assert "brk-noz" in [e.lower() for e in rewritten.expansions]


def test_rewrite_expands_oee_and_skips_empty():
    assert rewrite_oee_query("").rewritten == ""
    rewritten = rewrite_oee_query("Why did OEE drop after breakdown?")
    assert "overall equipment effectiveness" in rewritten.rewritten.lower()
    assert "เครื่องเสีย" in rewritten.rewritten or "brk" in rewritten.rewritten.lower()


def test_tokenize_keeps_codes_and_thai():
    tokens = tokenize_oee_query("BRK-NOZ หัวฉีดติด")
    assert "brk-noz" in tokens
    assert "หัวฉีดติด" in tokens


@pytest.mark.anyio
async def test_lexical_reranker_prefers_matching_sop():
    query = rewrite_oee_query("หัวฉีดติด").rewritten
    weak = SearchResult(
        content="General safety briefing for visitors at the gate.",
        score=0.92,
        metadata={"filename": "safety.md"},
    )
    strong = SearchResult(
        content="SOP: clear BRK-NOZ nozzle jam on Filler-01. Stop, purge, restart.",
        score=0.41,
        metadata={"filename": "sop-noz.md"},
    )
    reranked = await OeeLexicalReranker().rerank(query, [weak, strong], top_k=2)
    assert reranked[0].metadata["filename"] == "sop-noz.md"
    assert reranked[0].metadata["reranker"] == "oee-lexical"


def test_rerank_service_defaults_to_lexical():
    service = RerankService(RAGSettings(reranker_config=RerankerConfig(provider="oee_lexical")))
    assert service.is_enabled is True
    disabled = RerankService(RAGSettings(reranker_config=RerankerConfig(provider="none")))
    assert disabled.is_enabled is False
