"""
═══════════════════════════════════════════════════
  AGENT 4: STRATEGY AGENT — Decision Maker
═══════════════════════════════════════════════════

Role: Decide WHAT actions to take
Input: root_causes
Output: actions

This agent does NOT analyze — it only makes decisions.

Examples:
  - "Replace first 3 seconds with strong pattern-interrupt hook"
  - "Increase pacing with fast cuts every 2 seconds"
"""

import time
from app.utils.llm_client import get_client
from app.utils.helpers import parse_llm_output
from mistralai.models.chat_completion import ChatMessage


STRATEGY_PROMPT = """
You are a performance marketing strategist making tactical decisions.

Given the root causes of ad underperformance, decide WHAT specific actions to take.

Your job is to make DECISIONS, not to analyze or explain.
Each action must be concrete, specific, and immediately implementable.

Examples of excellent strategic actions:
- "Replace first 3 seconds with a strong pattern-interrupt hook (question or shocking stat)"
- "Increase pacing with fast cuts every 2 seconds in the first 10 seconds"
- "Add social proof (testimonial or user count) within first 5 seconds"
- "Rewrite CTA to be benefit-driven instead of feature-driven"
- "Shorten total ad to under 15 seconds for better retention"

STRICT RULES:
- Return ONLY valid JSON
- No markdown, no explanation, no extra text
- Be specific and actionable
- Each action must be implementable by a video editor
- Maximum 5 actions, ordered by expected impact

Return format:
{
  "actions": ["action 1", "action 2"],
  "fix_map": [
    {
      "issue_id": "short_snake_case_id (e.g. low_ctr, weak_hook, slow_pacing)",
      "fix": "description of how the action fixes it"
    }
  ]
}
"""


class StrategyAgent:
    """
    Decision agent that converts root causes into actionable strategy.
    Tells WHAT to fix — no analysis, only decisions.
    """

    def analyze(self, root_causes: list, feedback: list = None) -> dict:
        start = time.time()

        client = get_client()

        feedback_section = ""
        if feedback:
            feedback_section = f"\n\n=== PREVIOUS FEEDBACK TO ADDRESS ===\n{chr(10).join(f'  - {fb}' for fb in feedback)}\n\nYou MUST explicitly address ALL feedback points. Include them in your fix_map."

        user_input = f"""
        Root Causes of Underperformance:
        {chr(10).join(f'  {i+1}. {cause}' for i, cause in enumerate(root_causes))}{feedback_section}
        """

        try:
            response = client.chat(
                model="mistral-small-latest",
                messages=[
                    ChatMessage(role="system", content=STRATEGY_PROMPT),
                    ChatMessage(role="user", content=user_input)
                ]
            )

            raw = response.choices[0].message.content
            parsed = parse_llm_output(raw)

            elapsed = round(time.time() - start, 4)

            return {
                "actions": parsed.get("actions", []),
                "fix_map": parsed.get("fix_map", []),
                "timing": elapsed
            }

        except Exception as e:
            elapsed = round(time.time() - start, 4)
            return {
                "actions": ["Review and improve ad creative based on identified root causes"],
                "timing": elapsed,
                "error": str(e)
            }
