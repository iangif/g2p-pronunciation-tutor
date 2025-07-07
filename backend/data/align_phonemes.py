import os
import json
from g2p_en import G2p
import re
from collections import defaultdict

TRANSCRIPT_DIR = os.path.join(os.path.dirname(__file__), "transcripts")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "all_aligned_clips/aligned_clips.json")
BASE_VIDEO_URL = "https://youtube.com/watch?v="  # Replace if needed
MAX_PER_VIDEO = 5

"""
This file has two main functions

process_transcripts
  input => loops through all json files in transcripts
  output => returns a list of dicts representing aligned entries

save_to_file
  input => the list outputted from process_transcripts
  output => saves all aligned clips in OUTPUT_FILE
"""

g2p = G2p()

def strip_stress(arpa):
  return [p[:-1] if p[-1] in '012' else p for p in arpa]

def clean_word(word):
  return re.sub(r"[^\w']", "", word).lower()

def process_transcripts():
  aligned_entries = []

  for filename in os.listdir(TRANSCRIPT_DIR):
    if not filename.endswith(".json"):
      continue
    
    video_id = os.path.splitext(filename)[0]
    video_url = BASE_VIDEO_URL + video_id

    with open(os.path.join(TRANSCRIPT_DIR, filename), 'r', encoding='utf-8') as f:
      segments = json.load(f)
    
    counter = defaultdict(int)
    for segment in segments:
      raw_text = segment.get("text", "")
      start = segment.get("start", 0.0)
      end = segment.get("end", 0.0)
      words = [clean_word(w) for w in raw_text.strip().split()]
      words = [w for w in words if w.isalpha()]
      if not words:
        continue

      duration = end - start
      time_per_word = duration / len(words)

      for word in words:
        if counter[word] >= MAX_PER_VIDEO:
          continue
        counter[word] += 1

        arpa = [p for p in g2p(word) if p != ' ']
        phonemes = ' '.join(strip_stress(arpa))

        aligned_entries.append({
          "word": word,
          "phonemes": phonemes,
          "video_url": video_url,
          "start_time": start,
          "end_time": end,
          "transcript": raw_text
        })
    
    print(f"{video_url} converted to phonemes successfully.")
  
  return aligned_entries

def save_to_file(entries):
  with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(entries, f, indent=2)

if __name__ == "__main__":
  entries = process_transcripts()
  save_to_file(entries)
  print(f"Aligned {len(entries)} entries written to {OUTPUT_FILE}")
  print(f"{len(set(i['word'] for i in entries))} unique words found.")
