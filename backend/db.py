import sqlite3

DB_PATH = "clips.db"

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
            UNIQUE(video_url, start_time, end_time)
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

# Finds phoneme substring match
# Note: also finds exact match
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
    if phoneme_seq in db_phonemes:
      matches.append({
        "word": row[0],
        "phonemes": row[1],
        "url": f"{row[2]}#t={row[3]},{row[4]}",
        "transcript": row[5]
      })
      if len(matches) >= max_results:
        break
  conn.close()
  return matches

# Finds near-match phonemes, using edit distance
def find_near_phoneme_clips(phoneme_seq, lang='en', max_results=6, max_distance=2):
  def edit_distance(a, b):
    a_list, b_list = a.split(), b.split()
    dp = [[0] * (len(b_list)+1) for _ in range(len(a_list)+1)]
    for i in range(len(a_list)+1):
      for j in range(len(b_list)+1):
        if i == 0: dp[i][j] = j
        elif j == 0: dp[i][j] = i
        elif a_list[i-1] == b_list[j-1]:
          dp[i][j] = dp[i-1][j-1]
        else:
          dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[-1][-1]

  conn = get_connection()
  cursor = conn.cursor()
  cursor.execute("""
    SELECT word, phonemes, video_url, start_time, end_time, transcript
    FROM clips
    WHERE language = ?
  """, (lang,))
  matches = []
  for row in cursor.fetchall():
    dist = edit_distance(phoneme_seq, row[1])
    if dist <= max_distance:
      matches.append({
        "word": row[0],
        "phonemes": row[1],
        "url": f"{row[2]}#t={row[3]},{row[4]}",
        "transcript": row[5]
      })
      if len(matches) > max_results:
        break
  conn.close()
  return matches
