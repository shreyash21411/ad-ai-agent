from faster_whisper import WhisperModel
import os

try:
    print("Initializing Whisper model...")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
