import yt_dlp
import os

"""
This file has two functions

search_youtube_podcasts
  input => query, max results
  output => a list of dictionaries of each video found
download_audio
  input => url, output_dir = raw_audio by default
  output => downloads given video audio into output_dir
            also returns info of downloaded audio
"""

def search_youtube_podcasts(query="ted talk", max_results=20):
  ydl_opts = {
    "quiet": True,
    "extract_flat": True,
    "skip_download": True,
    "default_search": "ytsearch"
  }
  with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    search_query = f"{query} podcast"
    search_results = ydl.extract_info(f"ytsearch{max_results}:{search_query}", download=False)
    entries = search_results.get('entries', [])
    return [
      {
        'title': entry.get('title'),
        'id': entry.get('id'),
        'url': f"https://www.youtube.com/watch?v={entry.get('id')}",
        'duration': entry.get('duration'),
        'channel': entry.get('channel'),
        'description': entry.get('description', '')
      }
      for entry in entries
    ]

def download_audio(video_url, output_dir=os.path.join(os.path.dirname(__file__), "raw_audio")):
  os.makedirs(output_dir, exist_ok=True)

  ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': os.path.join(output_dir, '%(id)s.%(ext)s'),
    'postprocessors': [{
      'key': 'FFmpegExtractAudio',
      'preferredcodec': 'wav',
      'preferredquality': '192',
    }],
    'quiet': False
  }

  with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(video_url, download=True)
    audio_path = os.path.join(output_dir, f"{info['id']}.wav")
    return {
      "id": info['id'],
      "title": info['title'],
      "filepath": audio_path
    }

if __name__ == "__main__":
  videos = search_youtube_podcasts()
  for video in videos:
    url = video['url']
    download_audio(url)