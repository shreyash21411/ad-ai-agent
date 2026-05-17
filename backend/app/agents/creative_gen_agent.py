"""
═══════════════════════════════════════════════════
  AGENT 5: CREATIVE GENERATION AGENT — Ad Creator
═══════════════════════════════════════════════════

Role: Generate a new ad concept
Input: actions + target_audience
Output: hook, content, cta

Creates HOW to fix the ad with a concrete new concept.
"""

import time
from app.utils.llm_client import get_client
from app.utils.helpers import parse_llm_output
from mistralai.models.chat_completion import ChatMessage


CREATIVE_GEN_PROMPT = """
You are an award-winning creative director generating a new video ad concept.

Given the strategic actions to implement and the target audience, create a complete
new ad concept that addresses all the identified issues.

Your concept must include:
1. HOOK (0-3 seconds): Must grab attention immediately. Use pattern interrupts,
   shocking stats, provocative questions, or visual surprises.
2. CONTENT (main body): The core message, structured for maximum retention.
   Include pacing notes, visual suggestions, and key messaging.
3. CTA (call to action): Clear, benefit-driven, urgent. Tell the viewer
   exactly what to do next and why they should do it NOW.

STRICT RULES:
- Return ONLY valid JSON
- No markdown, no explanation, no extra text
- Be creative, specific, and production-ready
- Hook must be attention-grabbing in under 3 seconds
- CTA must create urgency
- MUST match input duration (e.g., concise pacing)
- Must be platform-optimized (Reels/TikTok style)
- Hook MUST be within the first 2-3 seconds
- Total ad duration MUST NOT exceed original input length
- Include explicit brand presence or value prop within first 5 seconds

Return format:
{
  "hook": "detailed description of the first 3 seconds",
  "content": "detailed description of the main content/script with pacing notes",
  "cta": "specific call to action with urgency element"
}
"""


class CreativeGenAgent:
    """
    Creative generation agent that produces new ad concepts.
    Generates HOW to fix the ad with a concrete, production-ready concept.
    """

    def generate(self, actions: list, fix_map: list, data, feedback: list = None) -> dict:
        start = time.time()

        client = get_client()

        feedback_section = ""
        if feedback:
            feedback_section = f"""

=== PREVIOUS ISSUES (FEEDBACK) ===
{chr(10).join(f'  - {fb}' for fb in feedback)}

You are improving a previous ad based on feedback.
You MUST:
- fix each issue explicitly
- keep strengths intact
- do not repeat mistakes"""

        user_input = f"""
        Strategic Actions to Implement:
        {chr(10).join(f'  {i+1}. {action}' for i, action in enumerate(actions))}

        Fix Map (How to fix specific issues):
        {chr(10).join(f'  - {f.get("issue_id")}: {f.get("fix")}' for f in fix_map)}

        Target Audience: {data.target_audience}
        Platform: {getattr(data, 'ad_platform', 'Unknown')}
        Marketing Goal: {getattr(data, 'marketing_goal', 'General Engagement')}
        Product Category: {getattr(data, 'product_category', 'General')}
        Brand Voice: {getattr(data, 'brand_voice', 'Professional')}

        Create a new ad concept that implements ALL of these strategic actions
        and applies the fixes from the Fix Map while resonating with the target audience and brand identity.{feedback_section}
        """

        try:
            response = client.chat(
                model="mistral-small-latest",
                messages=[
                    ChatMessage(role="system", content=CREATIVE_GEN_PROMPT),
                    ChatMessage(role="user", content=user_input)
                ]
            )

            raw = response.choices[0].message.content
            parsed = parse_llm_output(raw)

            elapsed = round(time.time() - start, 4)

            return {
                "hook": parsed.get("hook", ""),
                "content": parsed.get("content", ""),
                "cta": parsed.get("cta", ""),
                "timing": elapsed
            }

        except Exception as e:
            elapsed = round(time.time() - start, 4)
            return {
                "hook": "",
                "content": "",
                "cta": "",
                "timing": elapsed,
                "error": str(e)
            }
