"""
═══════════════════════════════════════════════════
  AGENT 1: METRICS AGENT — Data Analyst
═══════════════════════════════════════════════════

Role: Deterministic metrics analysis
Input: metrics dict (ctr, watch_time)
Output: performance_status, flags, raw_metrics, score

Rules:
  - CTR < 1 → low_ctr flag
  - Watch time < 2 → low_watch_time flag
  - No LLM — fully deterministic
"""

import time


class MetricsAgent:
    """
    Deterministic metrics analyst.
    Analyzes CTR, watch time, and generates engagement score.
    No LLM dependency — fully rule-based.
    """

    def analyze(self, metrics: dict) -> dict:
        start = time.time()

        ctr = metrics.get("ctr", 0)
        watch_time = metrics.get("watch_time", 0)

        # ── Rule-based flag detection ──
        flags = []
        if ctr < 1:
            flags.append("low_ctr")
        if watch_time < 2:
            flags.append("low_watch_time")

        # ── Performance status ──
        if len(flags) >= 2:
            performance_status = "poor"
        elif len(flags) == 1:
            performance_status = "average"
        else:
            performance_status = "good"

        # ── Engagement scoring ──
        score = self._generate_score(ctr, watch_time)

        elapsed = round(time.time() - start, 4)

        return {
            "performance_status": performance_status,
            "flags": flags,
            "raw_metrics": metrics,
            "score": score,
            "timing": elapsed
        }

    def _generate_score(self, ctr: float, watch_time: float) -> dict:
        """
        Engagement score formula:
        - CTR contributes up to 5 points (ctr * 3, capped at 5)
        - Watch time contributes up to 5 points (wt * 1.2, capped at 5)
        - Total out of 10
        """
        ctr_score = min(ctr * 3, 5)
        wt_score = min(watch_time * 1.2, 5)
        total = ctr_score + wt_score

        return {
            "engagement_score": round(total, 2),
            "rating": "poor" if total < 5 else "average" if total < 7 else "good",
            "confidence": 0.9
        }
