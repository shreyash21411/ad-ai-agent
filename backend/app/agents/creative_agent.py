"""
═══════════════════════════════════════════════════
  AGENT 2: CREATIVE AGENT — Content Strategist
═══════════════════════════════════════════════════

Role: LLM-powered creative content analysis
Input: video_description, target_audience
Output: creative_issues, content_quality

Focus ONLY on:
  - Hook strength (first 3 seconds)
  - Pacing and flow
  - Storytelling structure
  - Audience relatability

Does NOT:
  - Analyze metrics
  - Generate recommendations
"""

import time
from app.utils.llm_client import get_client
from app.utils.helpers import parse_llm_output
from mistralai.models.chat_completion import ChatMessage


CREATIVE_PROMPT = """
You are a senior creative strategist analyzing video ad content quality.

Analyze ONLY the creative aspects of this ad:
- Hook strength (first 3 seconds — does it grab attention?)
- Pacing and flow (is it too slow, too fast, or well-paced?)
- Storytelling structure (does it have a clear narrative arc?)
- Audience relatability (does the content resonate with the target audience?)

DO NOT analyze metrics or numbers.
DO NOT provide recommendations or solutions.
ONLY identify creative issues.

STRICT RULES:
- Return ONLY valid JSON
- No markdown, no explanation, no extra text
- Be specific about issues found
- Maximum 5 issues

Return format:
{
  "creative_issues": ["specific issue 1", "specific issue 2"],
  "content_quality": "high" | "medium" | "low"
}
"""


class CreativeAgent:
    """
    LLM-powered creative content analyst.
    Analyzes video description for hook, pacing, storytelling quality.
    """

    def analyze(self, video_description: str, data) -> dict:
        start = time.time()

        client = get_client()

        user_input = f"""
        Video Description: {video_description}
        Target Audience: {data.target_audience}
        Platform: {getattr(data, 'ad_platform', 'Unknown')}
        Marketing Goal: {getattr(data, 'marketing_goal', 'General Engagement')}
        Product Category: {getattr(data, 'product_category', 'General')}
        Brand Voice: {getattr(data, 'brand_voice', 'Professional')}
        """

        try:
            response = client.chat(
                model="mistral-small-latest",
                messages=[
                    ChatMessage(role="system", content=CREATIVE_PROMPT),
                    ChatMessage(role="user", content=user_input)
                ]
            )

            raw = response.choices[0].message.content
            parsed = parse_llm_output(raw)

            elapsed = round(time.time() - start, 4)

            return {
                "creative_issues": parsed.get("creative_issues", []),
                "content_quality": parsed.get("content_quality", "medium"),
                "timing": elapsed
            }

        except Exception as e:
            elapsed = round(time.time() - start, 4)
            return {
                "creative_issues": ["Unable to analyze creative content"],
                "content_quality": "low",
                "timing": elapsed,
                "error": str(e)
            }
