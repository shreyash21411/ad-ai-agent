"""
Shared utility functions used by the orchestrator.
- Problem normalization (category mapping)
- Deduplication (keeps most descriptive version)
- LLM output parsing (JSON extraction)
"""

import json


# =========================
# 🔧 NORMALIZATION
# =========================
def normalize_problem(p: str) -> str:
    """Map a problem description to a canonical category key for deduplication."""
    s = p.lower()

    if "ctr" in s:
        return "ctr_issue"
    if "watch time" in s or "retention" in s or "drop-off" in s or "drop off" in s:
        return "watch_time_issue"
    if "hook" in s or "intro" in s or "opening" in s:
        return "hook_issue"
    if "pacing" in s or "pace" in s or "fast cut" in s:
        return "pacing_issue"
    if "storytelling" in s or "narrative" in s or "story" in s:
        return "storytelling_issue"
    if "audience" in s or "targeting" in s or "relatab" in s:
        return "audience_issue"
    if "cta" in s or "call to action" in s:
        return "cta_issue"

    return s.strip()


# =========================
# 🔧 DEDUPLICATION
# =========================
def deduplicate_problems(problems: list) -> list:
    """Remove duplicate problems, keeping the most descriptive version per category."""
    seen = {}

    for p in problems:
        key = normalize_problem(p)
        # Keep the longer (more descriptive) version
        if key not in seen or len(p) > len(seen[key]):
            seen[key] = p

    return list(seen.values())


# =========================
# 🔧 LLM OUTPUT PARSER
# =========================
def parse_llm_output(raw_output: str) -> dict:
    """Extract JSON from raw LLM response, handling markdown fences."""
    cleaned = raw_output.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except Exception:
        return {
            "error": "Invalid JSON from AI",
            "raw_output": cleaned
        }
