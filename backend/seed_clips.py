from db import insert_clip

def seed_test_clips():
  test_clips = [
    {
      "word": "cat",
      "phonemes": "K AE T",
      "video_url": "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
      "start_time": 12.5,
      "end_time": 14.0,
      "language": "en",
      "transcript": "The cat sat on the mat."
    },
    {
      "word": "bat",
      "phonemes": "B AE T",
      "video_url": "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
      "start_time": 45.0,
      "end_time": 46.5,
      "language": "en",
      "transcript": "He swung the bat hard."
    },
    {
      "word": "mat",
      "phonemes": "M AE T",
      "video_url": "https://sample-videos.com/video123/mp4/720/big_buck_bunny.mp4",
      "start_time": 78.0,
      "end_time": 79.5,
      "language": "en",
      "transcript": "She wiped her feet on the mat."
    }
  ]

  for clip in test_clips:
    insert_clip(
      clip["word"],
      clip["phonemes"],
      clip["video_url"],
      clip["start_time"],
      clip["end_time"],
      clip["language"],
      clip["transcript"]
    )
    print(f"\tInserted clip for '{clip['word']}'")

if __name__ == "__main__":
  seed_test_clips()