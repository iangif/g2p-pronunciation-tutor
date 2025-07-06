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
            transcript TEXT
        )
    ''')
    conn.commit()
    conn.close()

def insert_clip(word, phonemes, video_url, start_time, end_time, transcript=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO clips (word, phonemes, video_url, start_time, end_time, transcript)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (word, phonemes, video_url, start_time, end_time, transcript))
    conn.commit()
    conn.close()

def search_clips_by_phonemes(phonemes):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM clips WHERE phonemes = ?', (phonemes,))
    results = cursor.fetchall()
    conn.close()
    return results
