from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse

app = FastAPI()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class AnalyzeRequest(BaseModel):
    text: str

# Define response model
class MediaClip(BaseModel):
    url: str

class AnalyzeResponse(BaseModel):
    ipa: str
    modelPhonemes: str
    similarWords: List[str]
    mediaClips: List[MediaClip]

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    # Mock G2P + phoneme logic (placeholder for now)
    input_text = request.text
    mock_ipa = "/ˈmɒk ˈɪn.pʊt/"
    mock_model_phonemes = "M AA K IH N P UH T"
    mock_similar_words = ["mock", "input", "market", "impact"]
    mock_media_clips = [
        {"url": "https://www.example.com/audio/mock1.mp3"},
        {"url": "https://www.example.com/audio/mock2.mp3"}
    ]

    return AnalyzeResponse(
        ipa=mock_ipa,
        modelPhonemes=mock_model_phonemes,
        similarWords=mock_similar_words,
        mediaClips=mock_media_clips
    )
