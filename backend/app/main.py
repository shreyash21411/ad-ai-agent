"""
═══════════════════════════════════════════════════
  AD AI AGENT — Multi-Agent Marketing System
═══════════════════════════════════════════════════

FastAPI application entry point.
Thin controller — all business logic is in the agent system.

Architecture:
  1. Metrics Agent    → deterministic metrics analysis
  2. Creative Agent   → LLM content analysis
  3. Insight Agent    → LLM root cause reasoning
  4. Strategy Agent   → LLM action decisions
  5. Creative Gen     → LLM new ad generation
  6. Main Brain       → orchestrator
"""

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from app.core.models import AdInput
from app.agents.main_brain import MainBrain
import shutil
import os


# =========================
# 🚀 APP SETUP
# =========================
app = FastAPI(
    title="Ad AI Agent — Multi-Agent System",
    description="AI-powered marketing team that diagnoses ad performance, identifies root causes, generates strategy, and creates new ad concepts.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the orchestrator
brain = MainBrain()


# =========================
# 🌐 ROUTES
# =========================
@app.get("/")
def home():
    return {"message": "Ad AI Agent running 🚀", "version": "2.0.0", "agents": 6}


@app.post("/analyze")
def analyze_ad(data: AdInput):
    try:
        return brain.analyze(data)
    except Exception as e:
        return {
            "error": "Analysis failed",
            "details": str(e)
        }

@app.post("/analyze/video")
def analyze_video(data: AdInput):
    try:
        if not data.video_url:
            return {"error": "Video URL is required for this endpoint"}
        return brain.video_agent.analyze(data.video_url)
    except Exception as e:
        return {
            "error": "Video analysis failed",
            "details": str(e)
        }

@app.post("/analyze/marketing")
def analyze_marketing(data: AdInput):
    try:
        # Force video_url to None to skip video processing in MainBrain
        data.video_url = None
        return brain.analyze(data)
    except Exception as e:
        return {
            "error": "Marketing analysis failed",
            "details": str(e)
        }

@app.post("/analyze/video/upload")
def analyze_video_upload(file: UploadFile = File(...)):
    try:
        temp_file_path = f"temp_upload_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = brain.video_agent.analyze(local_path=temp_file_path)
        
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            
        return result
    except Exception as e:
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return {
            "error": "Video upload analysis failed",
            "details": str(e)
        }