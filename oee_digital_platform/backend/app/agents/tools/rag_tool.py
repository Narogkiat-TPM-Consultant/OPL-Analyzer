"""RAG tool for agent knowledge base search."""

import contextvars
import logging
from typing import TYPE_CHECKING, Any

from app.core.config import settings
from app.core.exceptions import ExternalServiceError
from app.services.rag.embeddings import EmbeddingService
from app.services.rag.query_rewrite import rewrite_oee_query
from app.services.rag.retrieval import make_retrieval_service
from app.services.rag.vectorstore import PgVectorStore

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from app.services.rag.retrieval import BaseRetrievalService

_retrieval_service: "BaseRetrievalService | None" = None


def get_retrieval_service() -> "BaseRetrievalService":
    """Get or create retrieval service singleton."""
    global _retrieval_service
    if _retrieval_service is not None:
        return _retrieval_service

    rag_settings = settings.rag
    embedding_service = EmbeddingService(rag_settings)
    vector_store = PgVectorStore(rag_settings, embedding_service)
    _retrieval_service = make_retrieval_service(vector_store, rag_settings)
    return _retrieval_service


def _format_results(results: list[Any], *, rewritten_query: str, original: str) -> str:
    header = (
        "Search results (cite inline using [1], [2], etc. — do NOT list sources at the end):\n"
        f"Retrieval: hybrid (vector+BM25) + oee-lexical rerank\n"
        f"Query rewrite: {original} -> {rewritten_query}\n"
    )
    if not results:
        return header + "\nNo relevant documents found in the knowledge base."
    formatted = []
    for i, result in enumerate(results, start=1):
        source = result.metadata.get("filename", "unknown")
        page = result.metadata.get("page_num", "")
        chunk = result.metadata.get("chunk_num", "")
        col = result.metadata.get("collection", "")
        page_info = f", page {page}" if page else ""
        chunk_info = f", chunk {chunk}" if chunk else ""
        col_info = f" [{col}]" if col else ""
        formatted.append(
            f"[{i}] Source: {source}{page_info}{chunk_info}{col_info} (score: {result.score:.3f})\n"
            f"{result.content}"
        )
    return header + "\n" + "\n\n".join(formatted)


# ContextVar set by non-PydanticAI frameworks before each agent invocation so that
# the tool can read the active KB collections without needing explicit Deps injection.
# Default is None (not []) — mutable defaults on ContextVar are a foot-gun
# because every reader gets the same shared list. Callers should treat None
# as "no collections active".
_active_kb_collections: contextvars.ContextVar[list[str] | None] = contextvars.ContextVar(
    "_active_kb_collections", default=None
)


async def search_knowledge_base(
    query: str,
    kb_collection_names: list[str] | None = None,
    top_k: int = 5,
) -> str:
    """Search the knowledge base and return formatted results.

    Args:
        query: The search query string.
        kb_collection_names: Vector-store collection names resolved server-side from the
            conversation's active_knowledge_base_ids. Never supplied by the LLM directly —
            injected via PydanticAI Deps or the _active_kb_collections ContextVar.
        top_k: Number of top results to retrieve (default: 5).
    """
    resolved = kb_collection_names if kb_collection_names else (_active_kb_collections.get() or [])
    if not resolved:
        return "No active knowledge bases selected for this conversation."

    rewritten = rewrite_oee_query(query)
    service: Any = get_retrieval_service()
    try:
        retrieve_kwargs = {
            "query": rewritten.rewritten,
            "limit": top_k,
            "use_hybrid": True,
            "use_reranker": True,
        }
        if len(resolved) == 1:
            results = await service.retrieve(collection_name=resolved[0], **retrieve_kwargs)
        else:
            results = await service.retrieve_multi(collection_names=resolved, **retrieve_kwargs)
    except Exception as e:
        logger.error("Knowledge base search failed: %s", e, exc_info=True)
        raise ExternalServiceError(
            message="Knowledge base search failed",
            details={"query": query, "error": str(e)},
        ) from e

    return _format_results(
        results,
        rewritten_query=rewritten.rewritten,
        original=rewritten.original,
    )


__all__ = ["search_knowledge_base"]
