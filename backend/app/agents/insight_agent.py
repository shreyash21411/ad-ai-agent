"""
═══════════════════════════════════════════════════
  AGENT 3: INSIGHT AGENT — Root Cause Analyst
═══════════════════════════════════════════════════

Role: Identify WHY the ad is underperforming
Input: metrics_agent output + creative_agent output
Output: root_causes

This is the MOST IMPORTANT agent.
It connects: DATA + CONTENT → CAUSE

Examples:
  - "Weak hook causing low CTR"
  - "Slow pacing causing drop-off"
"""

import time
from app.utils.llm_client import get_client
from app.utils.helpers import parse_llm_output
from mistralai.models.chat_completion import ChatMessage


INSIGHT_PROMPT = """
You are a senior marketing analyst specializing in root cause analysis.

Given performance metrics analysis and creative content analysis, your job is to
identify the ROOT CAUSES of ad underperformance.

Your task: Connect DATA problems to CONTENT problems to find causation.

Think like this:
- What metric is underperforming? → WHY is it underperforming based on the creative?
- What creative weakness → is causing WHICH metric to suffer?

Examples of excellent root causes:
- "Weak hook in first 3 seconds is causing low CTR — viewers scroll past before engaging"
- "Slow pacing is causing early drop-off, reducing watch time below threshold"
- "Content doesn't resonate with target audience, leading to low engagement and poor CTR"
- "No clear CTA is causing viewers to watch but not convert"

STRICT RULES:
- Return ONLY valid JSON
- No markdown, no explanation, no extra text
- Be specific and causal (X is causing Y)
- Each cause must link a content issue to a metric impact
- Maximum 5 root causes

Return format:
{
  "root_causes": ["cause 1", "cause 2"]
}
"""


class InsightAgent:
    """
    Reasoning agent that connects metrics data to creative content issues.
    Identifies WHY the ad is underperforming by finding causal relationships.
    """

    def analyze(self, metrics_result: dict, creative_result: dict, data) -> dict:
        start = time.time()

        client = get_client()

        user_input = f"""
        === AD DETAILS ===
        Platform: {getattr(data, 'ad_platform', 'Unknown')}
        Marketing Goal: {getattr(data, 'marketing_goal', 'General Engagement')}
        Product Category: {getattr(data, 'product_category', 'General')}

        === METRICS ANALYSIS ===
        Performance Status: {metrics_result.get('performance_status')}
        Flags Triggered: {metrics_result.get('flags')}
        Engagement Score: {metrics_result.get('score', {}).get('engagement_score')}
        Rating: {metrics_result.get('score', {}).get('rating')}

        === CREATIVE ANALYSIS ===
        Content Quality: {creative_result.get('content_quality')}
        Creative Issues Found:
        {chr(10).join(f'  - {issue}' for issue in creative_result.get('creative_issues', []))}
        """

        try:
            response = client.chat(
                model="mistral-small-latest",
                messages=[
                    ChatMessage(role="system", content=INSIGHT_PROMPT),
                    ChatMessage(role="user", content=user_input)
                ]
            )

            raw = response.choices[0].message.content
            parsed = parse_llm_output(raw)

            elapsed = round(time.time() - start, 4)

            return {
                "root_causes": parsed.get("root_causes", []),
                "timing": elapsed
            }

        except Exception as e:
            elapsed = round(time.time() - start, 4)
            return {
                "root_causes": ["Unable to determine root causes — review metrics and creative manually"],
                "timing": elapsed,
                "error": str(e)
            }
