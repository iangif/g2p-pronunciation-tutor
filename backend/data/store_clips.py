import os
import json
from urllib.parse import quote
import sys

original_sys_path = sys.path.copy()
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from db import insert_clip
sys.path = original_sys_path

DATA_FOLDER = os.path.join(os.path.dirname(__file__),"all_aligned_clips")

"""
This file has one function

load_and_store_clips
  input => all word entries in aligned_clips.json
  output => writes all of these word entries into clips.db
"""
def load_and_store_clips():
  for file_name in os.listdir(DATA_FOLDER):
    if not file_name.endswith(".json"):
      continue
    
    file_path = os.path.join(DATA_FOLDER, file_name)
    with open(file_path, "r", encoding="utf-8") as f:
      words = json.load(f)
    
    for entry in words:
      word = entry["word"]
      phonemes = entry["phonemes"]
      start = entry["start_time"]
      end = entry["end_time"]
      transcript = entry["transcript"]
      video_url = entry["video_url"]

      insert_clip(
        word=word,
        phonemes=phonemes,
        video_url=video_url,
        start_time=start,
        end_time=end,
        language='en',
        transcript=transcript
      )

if __name__ == "__main__":
  load_and_store_clips()
  print(f"All aligned clips have been added to the database.")