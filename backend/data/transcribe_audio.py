import whisper
import os
import json
import sys
from pathlib import Path

"""
This file has one function

transcribe_audio
  input => path to audiofile - ex: raw_audio/12344567.wav
  output => audio segment transcriptions into TRANSCRIPT_DIR in json format
"""

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "raw_audio")
TRANSCRIPT_DIR = os.path.join(os.path.dirname(__file__), "transcripts")

model = whisper.load_model("base")

# example audio_path = .../raw_audio/12344567.wav
def transcribe_audio(audio_path):
  transcript_path = os.path.join(TRANSCRIPT_DIR, (os.path.splitext(os.path.basename(audio_path))[0] + ".json"))
  if os.path.exists(transcript_path):
    with open(transcript_path, "r", encoding="utf-8") as f:
      return json.load(f)
  
  print(f"Transcribing: {os.path.basename(audio_path)}")
  result = model.transcribe(audio_path, verbose=False)

  segments = [
    {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
    for seg in result.get("segments", [])
  ]

  with open(transcript_path, "w", encoding="utf-8") as f:
    json.dump(segments, f, ensure_ascii=False, indent=2)

  return segments

if __name__ == "__main__":
  for filename in os.listdir(AUDIO_DIR):
    filename = os.path.join(AUDIO_DIR, filename)
    transcribe_audio(filename)