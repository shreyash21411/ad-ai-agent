import os
import time
import glob
import yt_dlp
from faster_whisper import WhisperModel
from app.utils.llm_client import get_client
from app.utils.helpers import parse_llm_output
from mistralai.models.chat_completion import ChatMessage

SUMMARY_PROMPT = """
You are an expert copywriter. Read the following video transcript and summarize what happens in 1-2 short sentences. Focus on the core message, visual actions (if implied), and the hook.

STRICT RULES:
- Return ONLY valid JSON
- Format: {"summary": "your short summary"}
"""

class VideoAgent:
    """
    Agent responsible for downloading audio from a video URL,
    transcribing it locally using faster-whisper, and summarizing.
    """
    def __init__(self):
        self.model_size = "base"
        self.whisper = WhisperModel(self.model_size, device="cpu", compute_type="int8")

    def analyze(self, video_url: str = None, local_path: str = None) -> dict:
        start = time.time()
        temp_prefix = f"temp_audio_{int(time.time())}"
        downloaded_file = None
        duration = 0
        
        try:
            if local_path and os.path.exists(local_path):
                # Use the local file directly
                downloaded_file = local_path
                # Try to get duration if possible, but might be 0 without extra tools
            elif video_url:
                # 1. Extract audio metadata & download
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'outtmpl': f'{temp_prefix}.%(ext)s',
                    'quiet': True,
                    'no_warnings': True,
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(video_url, download=False)
                    duration = info.get('duration', 0)
                    ydl.download([video_url])

                # Find the downloaded file
                files = glob.glob(f"{temp_prefix}.*")
                if not files:
                    raise ValueError("Failed to download audio track.")
                downloaded_file = files[0]
            else:
                raise ValueError("Must provide either video_url or local_path.")

            # 2. Transcribe
            segments, info = self.whisper.transcribe(downloaded_file, beam_size=5)
            transcript = " ".join([segment.text for segment in segments]).strip()

            if not transcript:
                raise ValueError("Could not extract any speech from the video.")

            # 3. Summarize using Mistral
            client = get_client()
            user_input = f"Transcript: {transcript}"
            
            response = client.chat(
                model="mistral-small-latest",
                messages=[
                    ChatMessage(role="system", content=SUMMARY_PROMPT),
                    ChatMessage(role="user", content=user_input)
                ]
            )
            raw = response.choices[0].message.content
            parsed = parse_llm_output(raw)
            summary = parsed.get("summary", transcript[:100] + "...")

            elapsed = round(time.time() - start, 4)

            return {
                "transcript": transcript,
                "summary": summary,
                "duration": duration,
                "timing": elapsed
            }

        except Exception as e:
            elapsed = round(time.time() - start, 4)
            return {
                "error": str(e),
                "timing": elapsed
            }
        finally:
            # Cleanup
            if downloaded_file and os.path.exists(downloaded_file):
                os.remove(downloaded_file)
            else:
                for f in glob.glob(f"{temp_prefix}.*"):
                    try:
                        os.remove(f)
                    except:
                        pass
