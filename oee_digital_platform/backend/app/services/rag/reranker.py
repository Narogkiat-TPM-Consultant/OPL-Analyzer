"""Reranker implementations for RAG retrieval quality improvement."""

import logging
from abc import ABC, abstractmethod

from app.services.rag.config import RAGSettings
from app.services.rag.models import SearchResult
from app.services.rag.query_rewrite import OEE_SYNONYMS, tokenize_oee_query

logger = logging.getLogger(__name__)

# Extra plant terms that should lift a chunk even if the raw query missed them.
_OEE_BOOST_TERMS = (
    "oee",
    "downtime",
    "breakdown",
    "availability",
    "nozzle",
    "brk-noz",
    "หัวฉีด",
    "changeover",
    "sop",
)


class BaseReranker(ABC):
    """Abstract base for reranker providers."""

    @abstractmethod
    async def rerank(
        self,
        query: str,
        results: list[SearchResult],
        top_k: int,
    ) -> list[SearchResult]: ...

    @abstractmethod
    def warmup(self) -> None: ...

    @property
    @abstractmethod
    def name(self) -> str: ...


class OeeLexicalReranker(BaseReranker):
    """Local lexical reranker: token overlap + OEE synonym boost.

    Works without API keys or cross-encoder weights. Hybrid (vector+BM25) still
    proposes candidates; this reorders them for plant SOP / downtime-code search.
    """

    @property
    def name(self) -> str:
        return "oee-lexical"

    def warmup(self) -> None:
        return None

    async def rerank(
        self,
        query: str,
        results: list[SearchResult],
        top_k: int,
    ) -> list[SearchResult]:
        query_tokens = set(tokenize_oee_query(query))
        scored: list[SearchResult] = []
        for result in results:
            overlap = _overlap_score(query_tokens, result.content)
            boost = _keyword_boost(query, result.content)
            combined = 0.45 * float(result.score) + 0.40 * overlap + boost
            metadata = dict(result.metadata)
            metadata["rerank_score"] = combined
            metadata["lexical_overlap"] = overlap
            metadata["reranker"] = self.name
            scored.append(
                SearchResult(
                    content=result.content,
                    score=combined,
                    metadata=metadata,
                    parent_doc_id=result.parent_doc_id,
                )
            )
        scored.sort(key=lambda item: item.score, reverse=True)
        return scored[:top_k]


def _overlap_score(query_tokens: set[str], content: str) -> float:
    if not query_tokens:
        return 0.0
    content_tokens = set(tokenize_oee_query(content))
    if not content_tokens:
        return 0.0
    return len(query_tokens & content_tokens) / len(query_tokens)


def _keyword_boost(query: str, content: str) -> float:
    content_l = (content or "").lower()
    query_l = (query or "").lower()
    boost = 0.0
    for term in _OEE_BOOST_TERMS:
        if term not in content_l:
            continue
        boost += 0.12 if term in query_l else 0.04
    for key, synonyms in OEE_SYNONYMS.items():
        if key in query_l and any(syn.lower() in content_l for syn in synonyms):
            boost += 0.08
    return min(boost, 0.40)


class RerankService:
    """Orchestrates reranking with the configured reranker provider."""

    def __init__(self, settings: RAGSettings):
        self.settings = settings
        config = getattr(settings, "reranker_config", None)
        provider = getattr(config, "provider", "oee_lexical") if config else "oee_lexical"
        self._reranker: BaseReranker | None
        if provider == "oee_lexical":
            self._reranker = OeeLexicalReranker()
            logger.info("[RERANKER] Using %s", self._reranker.name)
        else:
            self._reranker = None
            logger.warning(
                "[RERANKER] No reranker configured (provider: %s). Reranking will be skipped.",
                provider,
            )

    @property
    def reranker(self) -> BaseReranker | None:
        return self._reranker

    @property
    def is_enabled(self) -> bool:
        return self._reranker is not None

    async def rerank(
        self,
        query: str,
        results: list[SearchResult],
        top_k: int,
    ) -> list[SearchResult]:
        if not self._reranker:
            logger.debug("[RERANKER] No reranker configured, returning original results")
            return results[:top_k]

        logger.debug(
            "[RERANKER] Starting reranking with %s, query: '%.50s...', results: %d, top_k: %d",
            self._reranker.name,
            query,
            len(results),
            top_k,
        )

        for i, r in enumerate(results[:5]):
            logger.debug("[RERANKER] Pre-rerank #%d: score=%.4f", i + 1, r.score)

        reranked = await self._reranker.rerank(query, results, top_k)

        for i, r in enumerate(reranked[:5]):
            logger.debug("[RERANKER] Post-rerank #%d: score=%.4f", i + 1, r.score)

        return reranked

    def warmup(self) -> None:
        if self._reranker:
            logger.info("[RERANKER] Warming up %s", self._reranker.name)
            self._reranker.warmup()
            logger.info("[RERANKER] %s warmup complete", self._reranker.name)
