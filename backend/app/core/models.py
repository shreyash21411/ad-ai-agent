"""
Shared Pydantic models for the multi-agent system.
These define the contract between agents and the orchestrator.
"""

from pydantic import BaseModel
from typing import Optional


# =========================
# 📦 API INPUT MODEL
# =========================
class AdInput(BaseModel):
    video_url: Optional[str] = None
    video_description: Optional[str] = None
    metrics: dict
    target_audience: str
    
    # New Digital Agent Fields for in-depth analysis
    ad_platform: Optional[str] = "Unknown"
    marketing_goal: Optional[str] = "General Engagement"
    product_category: Optional[str] = "General"
    brand_voice: Optional[str] = "Professional"
