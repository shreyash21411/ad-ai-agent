"""
═══════════════════════════════════════════════════
  AGENT 6: EVALUATION AGENT — Quality Controller
═══════════════════════════════════════════════════

Role: Critique the generated strategy and ad concept
Input: actions, new_ad_idea, target_audience
Output: quality_score, feedback, needs_improvement

Evaluation Criteria:
  - Hook strength
  - Clarity of message
  - Audience alignment
  - Emotional impact
  - CTA effectiveness
  - Ad length vs expected duration

Rules:
  - If score < 7 → needs_improvement = true
  - If score >= 7 → acceptable output
"""

import time
from app.utils.llm_client import get_client
from app.utils.helpers import parse_llm_output
from mistralai.models.chat_completion import ChatMessage


EVALUATION_PROMPT = """
You are a senior marketing reviewer acting as a Quality Controller.

Your job is to CRITIQUE the generated strategy and ad concept based on the target audience.
If previous outputs are provided, you must VERIFY if the previous issues were actually fixed.

Evaluation Criteria:
1. Hook strength (Is it within the first 3 seconds? Does it grab attention?)
2. Clarity of message (Is the value proposition clear?)
3. Audience alignment (Does it speak directly to the target audience?)
4. Emotional impact (Does it evoke a response?)
5. CTA effectiveness (Is it clear, urgent, and benefit-driven?)
6. Platform optimization & Length (Is it concise and suitable for platforms like Reels/TikTok?)
7. Fix Verification (Did it actually resolve the previous feedback?)

STRICT RULES:
- Return ONLY valid JSON
- No markdown, no explanation, no extra text
- Provide specific, constructive feedback if the score is less than 10.
- Set "needs_improvement" to true if the score is less than 7.

Return format:
{
  "quality_score": 8,
  "feedback": ["feedback point 1", "feedback point 2"],
  "needs_improvement": false,
  "improvement_detected": true,
  "coverage": {
    "issue_id_1": {
      "status": "resolved",
      "confidence": 0.9
    },
    "issue_id_2": {
      "status": "partial",
      "confidence": 0.6
    }
  },
  "issues_resolved": ["issue_id_1"],
  "issues_unresolved": ["issue_id_3"],
  "regressions": ["lost strong CTA"],
  "weighted_improvement": 0.8
}
"""


class EvaluationAgent:
    """
    Quality control agent that critiques the output of the Strategy and Creative Gen agents.
    """

    def evaluate(self, actions: list, new_ad_idea: dict, data, previous_output: dict = None) -> dict:
        start = time.time()

        client = get_client()

        previous_section = ""
        if previous_output:
            previous_section = f"""
        === Previous Ad Concept ===
        Hook: {previous_output.get('new_ad_idea', {}).get('hook', '')}
        Content: {previous_output.get('new_ad_idea', {}).get('content', '')}
        CTA: {previous_output.get('new_ad_idea', {}).get('cta', '')}
        
        === Did they improve? Did they fix issues? ===
        Compare the Previous Ad Concept to the Generated Ad Concept.
            """

        user_input = f"""
        === Target Audience & Ad Details ===
        Target Audience: {data.target_audience}
        Platform: {getattr(data, 'ad_platform', 'Unknown')}
        Marketing Goal: {getattr(data, 'marketing_goal', 'General Engagement')}
        Product Category: {getattr(data, 'product_category', 'General')}
        Brand Voice: {getattr(data, 'brand_voice', 'Professional')}

        === Strategic Actions Proposed ===
        {chr(10).join(f'  - {action}' for action in actions)}

        === Generated Ad Concept ===
        Hook: {new_ad_idea.get('hook', '')}
        Content: {new_ad_idea.get('content', '')}
        CTA: {new_ad_idea.get('cta', '')}
        {previous_section}
        """

        try:
            response = client.chat(
                model="mistral-small-latest",
                messages=[
                    ChatMessage(role="system", content=EVALUATION_PROMPT),
                    ChatMessage(role="user", content=user_input)
                ]
            )

            raw = response.choices[0].message.content
            parsed = parse_llm_output(raw)
            
            score = parsed.get("quality_score", 0)
            needs_improvement = score < 7

            elapsed = round(time.time() - start, 4)

            return {
                "quality_score": score,
                "feedback": parsed.get("feedback", []),
                "needs_improvement": needs_improvement,
                "improvement_detected": parsed.get("improvement_detected", False),
                "coverage": parsed.get("coverage", {}),
                "issues_resolved": parsed.get("issues_resolved", []),
                "issues_unresolved": parsed.get("issues_unresolved", []),
                "regressions": parsed.get("regressions", []),
                "weighted_improvement": parsed.get("weighted_improvement", 0),
                "timing": elapsed
            }

        except Exception as e:
            elapsed = round(time.time() - start, 4)
            return {
                "quality_score": 0,
                "feedback": ["Failed to evaluate output."],
                "needs_improvement": True,
                "improvement_detected": False,
                "coverage": {},
                "issues_resolved": [],
                "issues_unresolved": [],
                "regressions": [],
                "weighted_improvement": 0,
                "timing": elapsed,
                "error": str(e)
            }
