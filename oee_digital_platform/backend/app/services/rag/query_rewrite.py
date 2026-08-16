"""OEE query rewrite — expand plant synonyms before Hybrid retrieval.

No LLM. Numbers still come from oee_engine; this only improves SOP / code search.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

# Latin keys match on word boundaries; Thai / code keys match as substrings.
OEE_SYNONYMS: dict[str, list[str]] = {
    "oee": ["overall equipment effectiveness", "ประสิทธิภาพเครื่องจักร", "ประสิทธิภาพรวม"],
    "downtime": ["หยุดเครื่อง", "เครื่องหยุด", "lost time", "dt"],
    "breakdown": ["เครื่องเสีย", "brk", "failure"],
    "availability": ["ความพร้อมใช้", "พร้อมใช้"],
    "performance": ["speed loss", "รอบช้า"],
    "quality": ["ของเสีย", "reject", "ng"],
    "nozzle jam": ["หัวฉีดติด", "brk-noz", "nozzle"],
    "brk-noz": ["nozzle jam", "หัวฉีดติด"],
    "หัวฉีด": ["nozzle", "nozzle jam", "brk-noz"],
    "changeover": ["เปลี่ยนรุ่น", "setup"],
    "เปลี่ยนรุ่น": ["changeover", "setup"],
    "filler": ["filler-01", "เครื่องบรรจุ"],
    "labeler": ["labeler-01", "เครื่องติดฉลาก"],
    "pack-2": ["packing line 2", "ไลน์แพ็ค"],
    "กะนี้": ["current shift"],
    "ตอนนี้": ["current shift", "now"],
}

_LATIN_KEY = re.compile(r"^[a-z0-9][a-z0-9\s\-]*$", re.IGNORECASE)
_TOKEN_RE = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)?|[\u0e00-\u0e7f]+", re.IGNORECASE)


@dataclass(frozen=True)
class RewrittenQuery:
    original: str
    rewritten: str
    expansions: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, object]:
        return {
            "original": self.original,
            "rewritten": self.rewritten,
            "expansions": list(self.expansions),
        }


def tokenize_oee_query(text: str) -> list[str]:
    """Split Latin words/codes and Thai runs for overlap scoring."""
    return [m.group(0).lower() for m in _TOKEN_RE.finditer(text or "")]


def rewrite_oee_query(query: str) -> RewrittenQuery:
    """Append synonym expansions that are not already present in the query."""
    original = (query or "").strip()
    if not original:
        return RewrittenQuery(original="", rewritten="", expansions=[])

    lowered = original.lower()
    expansions: list[str] = []
    seen = {lowered}

    for key, synonyms in OEE_SYNONYMS.items():
        if not _key_in_query(key, lowered):
            continue
        for synonym in synonyms:
            token = synonym.strip()
            if not token:
                continue
            marker = token.lower()
            if marker in seen or marker in lowered:
                continue
            seen.add(marker)
            expansions.append(token)

    rewritten = original
    if expansions:
        rewritten = f"{original} {' '.join(expansions)}"
    return RewrittenQuery(original=original, rewritten=rewritten, expansions=expansions)


def _key_in_query(key: str, lowered_query: str) -> bool:
    key_l = key.lower()
    if _LATIN_KEY.match(key_l) and " " not in key_l and "-" not in key_l:
        return re.search(rf"\b{re.escape(key_l)}\b", lowered_query) is not None
    return key_l in lowered_query
