from db import insert_clip

def seed_sample_clips():
  insert_clip(
    word="hello",
    phonemes="HH AH L OW",
    video_url="https://example.com.clip1.mp4",
    start_time=0.5,
    end_time=3.0,
    transcript="She said hello before leaving."
  )
  insert_clip(
    word="market",
    phonemes="M AA R K AH T",
    video_url="https://example.com/clip2.mp4",
    start_time=12.0,
    end_time=15.0,
    transcript="He walked to the market in the morning."
  )
  insert_clip(
    word="enough",
    phonemes="IH N AH F",
    video_url="https://www.youtube.com/shorts/59L96x6LeH4",
    start_time=0.0,
    end_time=2.0,
    transcript="Enough is enough."
  )

if __name__ == "__main__":
  seed_sample_clips()