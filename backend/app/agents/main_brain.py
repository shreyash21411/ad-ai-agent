"""
═══════════════════════════════════════════════════
  AGENT 6: MAIN BRAIN — Orchestrator / Manager
═══════════════════════════════════════════════════

Role: Central coordinator of the multi-agent system
  - Calls all 5 agents in sequence
  - Merges outputs
  - Deduplicates problems
  - Applies severity + priority
  - Enforces constraints (critical metrics can't be lost)
  - Generates summary
  - Assembles final response

Pipeline:
  1. Metrics Agent → performance_status, flags, score
  2. Creative Agent → creative_issues, content_quality
  3. Insight Agent → root_causes (from 1 + 2)
  4. Strategy Agent → actions (from 3)
  5. Creative Gen Agent → new_ad_idea (from 4)
  6. Merge + Deduplicate + Enrich → final response
"""

import time
from app.agents.metrics_agent import MetricsAgent
from app.agents.creative_agent import CreativeAgent
from app.agents.insight_agent import InsightAgent
from app.agents.strategy_agent import StrategyAgent
from app.agents.creative_gen_agent import CreativeGenAgent
from app.agents.evaluation_agent import EvaluationAgent
from app.agents.video_agent import VideoAgent
from app.utils.helpers import deduplicate_problems


class MainBrain:
    """
    Central orchestrator — the 'Manager' of the marketing team.
    Coordinates all agents, merges outputs, and produces the final decision.
    """

    def __init__(self):
        self.metrics_agent = MetricsAgent()
        self.creative_agent = CreativeAgent()
        self.insight_agent = InsightAgent()
        self.strategy_agent = StrategyAgent()
        self.creative_gen_agent = CreativeGenAgent()
        self.evaluation_agent = EvaluationAgent()
        self.video_agent = VideoAgent()

    def analyze(self, data) -> dict:
        start = time.time()
        agents_used = []
        rules_triggered = []
        timings = {}

        # ═══════════════════════════════════════
        # STAGE 0: Video Agent (Optional)
        # ═══════════════════════════════════════
        video_description = data.video_description or ""
        if data.video_url:
            video_result = self.video_agent.analyze(data.video_url)
            if "error" in video_result:
                raise ValueError(f"Video Agent failed: {video_result['error']}")
            agents_used.append("video_agent")
            timings["video_agent"] = video_result.get("timing", 0)
            video_description = video_result.get("transcript", "")
            # Validation Layer: Duration <= 45s is already handled in VideoAgent

        # ═══════════════════════════════════════
        # STAGE 1: Metrics Agent (Deterministic)
        # ═══════════════════════════════════════
        metrics_result = self.metrics_agent.analyze(data.metrics)
        agents_used.append("metrics_agent")
        rules_triggered = metrics_result.get("flags", [])
        timings["metrics_agent"] = metrics_result.get("timing", 0)

        # ═══════════════════════════════════════
        # STAGE 2: Creative Agent (LLM)
        # ═══════════════════════════════════════
        creative_result = self.creative_agent.analyze(
            video_description, data
        )
        agents_used.append("creative_agent")
        timings["creative_agent"] = creative_result.get("timing", 0)

        # ═══════════════════════════════════════
        # STAGE 3: Insight Agent (LLM Reasoning)
        # ═══════════════════════════════════════
        insight_result = self.insight_agent.analyze(metrics_result, creative_result, data)
        agents_used.append("insight_agent")
        timings["insight_agent"] = insight_result.get("timing", 0)

        # ═══════════════════════════════════════
        # SELF-IMPROVING LOOP (Max 2 iterations)
        # ═══════════════════════════════════════
        iterations = 0
        max_iterations = 2
        feedback = []
        evaluation_result = {}
        evaluation_history = []
        previous_output = None
        previous_score = 0
        approval_reason = "Approved initially"

        while iterations < max_iterations:
            iterations += 1

            # STAGE 4: Strategy Agent (LLM Decision)
            strategy_result = self.strategy_agent.analyze(
                insight_result.get("root_causes", []),
                feedback=feedback if feedback else None
            )
            if "strategy_agent" not in agents_used:
                agents_used.append("strategy_agent")
            timings["strategy_agent"] = timings.get("strategy_agent", 0) + strategy_result.get("timing", 0)

            # STAGE 5: Creative Generation Agent (LLM)
            creative_gen_result = self.creative_gen_agent.generate(
                strategy_result.get("actions", []),
                strategy_result.get("fix_map", []),
                data,
                feedback=feedback if feedback else None
            )
            if "creative_gen_agent" not in agents_used:
                agents_used.append("creative_gen_agent")
            timings["creative_gen_agent"] = timings.get("creative_gen_agent", 0) + creative_gen_result.get("timing", 0)

            # STAGE 6: Evaluation Agent (Quality Control)
            evaluation_result = self.evaluation_agent.evaluate(
                strategy_result.get("actions", []),
                creative_gen_result,
                data,
                previous_output=previous_output
            )
            if "evaluation_agent" not in agents_used:
                agents_used.append("evaluation_agent")
            timings["evaluation_agent"] = timings.get("evaluation_agent", 0) + evaluation_result.get("timing", 0)

            current_score = evaluation_result.get("quality_score", 0)
            coverage = evaluation_result.get("coverage", {})
            regressions = evaluation_result.get("regressions", [])

            # Compute weighted improvement
            weights = {
                "low_ctr": 0.4,
                "weak_hook": 0.4,
                "slow_pacing": 0.3,
                "low_watch_time": 0.3,
                "cta_issue": 0.2,
                "branding": 0.1
            }
            weighted_improvement = 0
            total_confidence = 0
            num_issues = 0
            for issue_id, details in coverage.items():
                weight = weights.get(issue_id, 0.2) # Default weight 0.2
                if isinstance(details, dict):
                    status = details.get("status", "unresolved")
                    confidence = details.get("confidence", 0)
                else:
                    status = details
                    confidence = 0.5

                if status == "resolved":
                    weighted_improvement += weight
                elif status == "partial":
                    weighted_improvement += weight * 0.5
                
                total_confidence += confidence
                num_issues += 1

            avg_confidence = total_confidence / num_issues if num_issues > 0 else 1.0
            
            # Penalize regressions
            if regressions:
                current_score = max(0, current_score - (len(regressions) * 0.5))

            evaluation_history.append({
                "iteration": iterations,
                "score": current_score,
                "needs_improvement": evaluation_result.get("needs_improvement", False),
                "coverage": coverage,
                "regressions": regressions,
                "weighted_improvement": round(weighted_improvement, 2),
                "score_delta": round(current_score - previous_score, 1) if iterations > 1 else 0
            })

            termination_type = ""
            if not evaluation_result.get("needs_improvement"):
                approval_reason = "Score meets quality threshold"
                termination_type = "success"
                break # Output is acceptable
                
            # Check for lack of improvement to prevent useless loops
            if iterations > 1:
                if not evaluation_result.get("improvement_detected"):
                    approval_reason = "Loop stopped: Stalled"
                    termination_type = "stalled"
                    break
                if weighted_improvement < 0.2:
                    approval_reason = "Loop stopped: Weak improvement"
                    termination_type = "stalled"
                    break
                if current_score - previous_score < 1:
                    approval_reason = "Loop stopped: Score delta too small"
                    termination_type = "stalled"
                    break
                if avg_confidence < 0.6:
                    approval_reason = "Loop stopped: Low confidence"
                    termination_type = "low_confidence"
                    break

            # If needs improvement, pass feedback to next iteration
            feedback = evaluation_result.get("feedback", [])
            previous_output = {"actions": strategy_result.get("actions", []), "new_ad_idea": creative_gen_result}
            previous_score = current_score
            
            # Confidence decay if struggling
            if metrics_result.get("score", {}).get("confidence"):
                metrics_result["score"]["confidence"] = max(0.1, metrics_result["score"]["confidence"] - 0.05)

        if iterations == max_iterations and evaluation_result.get("needs_improvement") and not termination_type:
            approval_reason = "Max iterations reached"
            termination_type = "max_iterations"

        # ═══════════════════════════════════════
        # STAGE 7: Orchestration — Merge + Enrich
        # ═══════════════════════════════════════

        # Collect all problems from both data and creative agents
        all_problems = []

        # Convert metric flags to human-readable problems
        flag_to_problem = {
            "low_ctr": "Low CTR indicates weak hook or poor audience targeting",
            "low_watch_time": "Low watch time indicates weak content retention and early drop-off"
        }
        for flag in metrics_result.get("flags", []):
            if flag in flag_to_problem:
                all_problems.append(flag_to_problem[flag])

        # Add creative issues
        all_problems.extend(creative_result.get("creative_issues", []))

        # Deduplicate
        deduped = deduplicate_problems(all_problems)

        # Add severity + priority
        structured_problems = self._add_severity(deduped)
        structured_problems = self._sort_and_prioritize(structured_problems)

        # Enforce constraints — critical issues must not be lost
        structured_problems = self._enforce_constraints(
            structured_problems, data.metrics
        )

        # ═══════════════════════════════════════
        # FINAL RESPONSE ASSEMBLY
        # ═══════════════════════════════════════
        total_time = round(time.time() - start, 4)
        timings["total"] = total_time

        return {
            "problems": structured_problems,
            "causes": insight_result.get("root_causes", []),
            "recommendations": strategy_result.get("actions", []),
            "new_ad_idea": {
                "hook": creative_gen_result.get("hook", ""),
                "content": creative_gen_result.get("content", ""),
                "cta": creative_gen_result.get("cta", "")
            },
            "score": metrics_result.get("score", {}),
            "summary": self._generate_summary(structured_problems),
            "meta": {
                "agents_used": agents_used,
                "rules_triggered": rules_triggered,
                "llm_used": True,
                "timings": timings,
                "iterations": iterations,
                "evaluation_score": evaluation_result.get("quality_score", 0),
                "needs_improvement": evaluation_result.get("needs_improvement", False),
                "evaluation_history": evaluation_history,
                "approval_reason": approval_reason,
                "termination_type": termination_type if 'termination_type' in locals() else "success",
                "coverage": evaluation_result.get("coverage", {}),
                "weighted_improvement": weighted_improvement if 'weighted_improvement' in locals() else 0,
                "regressions": evaluation_result.get("regressions", []),
                "conflicts": [],
                "video_agent": {
                    "transcript": video_result.get("transcript") if 'video_result' in locals() else None,
                    "summary": video_result.get("summary") if 'video_result' in locals() else None
                } if data.video_url else None
            }
        }

    # ─────────────────────────────────────────
    # INTERNAL: Severity assignment
    # ─────────────────────────────────────────
    def _add_severity(self, problems: list) -> list:
        """Assign severity level based on keyword analysis."""
        enriched = []
        for p in problems:
            p_lower = p.lower()

            if any(x in p_lower for x in ["ctr", "watch time", "retention", "hook", "drop-off"]):
                severity = "high"
            elif any(x in p_lower for x in ["pacing", "content", "storytelling", "narrative"]):
                severity = "medium"
            else:
                severity = "low"

            enriched.append({
                "issue": p,
                "severity": severity,
                "impact": (
                    "High impact on performance" if severity == "high"
                    else "Moderate impact on performance" if severity == "medium"
                    else "Low impact on performance"
                )
            })
        return enriched

    # ─────────────────────────────────────────
    # INTERNAL: Sorting + priority assignment
    # ─────────────────────────────────────────
    def _sort_and_prioritize(self, problems: list) -> list:
        """Sort by severity and assign priority numbers."""
        severity_order = {"high": 0, "medium": 1, "low": 2}
        sorted_problems = sorted(
            problems,
            key=lambda x: severity_order.get(x["severity"], 3)
        )
        for i, p in enumerate(sorted_problems):
            p["priority"] = i + 1
        return sorted_problems

    # ─────────────────────────────────────────
    # INTERNAL: Constraint enforcement
    # ─────────────────────────────────────────
    def _enforce_constraints(self, problems: list, metrics: dict) -> list:
        """Ensure critical metric issues are never lost in deduplication."""
        if metrics.get("ctr", 0) < 1:
            if not any("ctr" in p["issue"].lower() for p in problems):
                problems.append({
                    "issue": "Critically low CTR detected — immediate hook/audience issues",
                    "severity": "high",
                    "impact": "High impact on performance",
                    "priority": 99
                })

        if metrics.get("watch_time", 0) < 2:
            if not any("watch time" in p["issue"].lower() for p in problems):
                problems.append({
                    "issue": "Critically low watch time — severe content drop-off",
                    "severity": "high",
                    "impact": "High impact on performance",
                    "priority": 99
                })

        # Re-sort after constraint injection
        return self._sort_and_prioritize(problems)

    # ─────────────────────────────────────────
    # INTERNAL: Summary generation
    # ─────────────────────────────────────────
    def _generate_summary(self, problems: list) -> str:
        """Generate a one-line summary from the top-priority issue."""
        if not problems:
            return "No major issues detected"
        top_issue = problems[0]["issue"]
        return f"Ad underperformance is driven primarily by: {top_issue.lower()}"
