import sqlite3
import os
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "clips.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def setup_database():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            phonemes TEXT NOT NULL,
            video_url TEXT NOT NULL,
            start_time REAL NOT NULL,
            end_time REAL NOT NULL,
            language TEXT DEFAULT 'en',
            transcript TEXT,
            UNIQUE(word, video_url, start_time, end_time)
        )
    ''')
    conn.commit()
    conn.close()

def insert_clip(word, phonemes, video_url, start_time, end_time, language, transcript=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
      cursor.execute('''
          INSERT INTO clips (word, phonemes, video_url, start_time, end_time, language, transcript)
          VALUES (?, ?, ?, ?, ?, ?, ?)
      ''', (word, phonemes, video_url, start_time, end_time, language, transcript))
      conn.commit()
    except sqlite3.IntegrityError:
      print("Clip already exists. Skipping duplicate.")
    finally:
      conn.close()

# Finds phoneme exact match
def find_clips_by_phoneme_substring(phoneme_seq, lang='en', max_results=6):
  conn = get_connection()
  cursor = conn.cursor()
  cursor.execute("""
    SELECT word, phonemes, video_url, start_time, end_time, transcript
    FROM clips
    WHERE language = ?
  """, (lang,))
  matches = []
  for row in cursor.fetchall():
    db_phonemes = row[1]
    if phoneme_seq == db_phonemes:
      matches.append({
        "word": row[0],
        "phonemes": row[1],
        "url": row[2],
        "start": float(row[3]),
        "end": float(row[4]),
        "transcript": row[5]
      })
      """ Uncomment to not randomize
      if len(matches) >= max_results:
        break
      """
  conn.close()
  output=random.sample(matches, min(len(matches), max_results))
  return output

# Finds near-match phonemes, matching substring. ex: white --> quite
# Include ignore list to ignore certain matches
def find_near_phoneme_clips(phoneme_seq, lang='en', max_results=6, ignore=[]):
  conn = get_connection()
  cursor = conn.cursor()
  cursor.execute("""
    SELECT word, phonemes, video_url, start_time, end_time, transcript
    FROM clips
    WHERE language = ?
  """, (lang,))
  matches = []
  for row in cursor.fetchall():
    is_in_ignore = False
    for entry in ignore:
      if row[2] == entry["url"] and float(row[3]) == entry["start"] and float(row[4]) == entry["end"]:
        is_in_ignore = True
        break
    if is_in_ignore:
      continue
    db_phonemes = row[1]
    if phoneme_seq in db_phonemes:
      matches.append({
        "word": row[0],
        "phonemes": row[1],
        "url": row[2],
        "start": float(row[3]),
        "end": float(row[4]),
        "transcript": row[5]
      })
      if len(matches) >= max_results:
        break
      
  conn.close()
  return matches
