from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse
from g2p_en import G2p

app = FastAPI()
g2p = G2p()

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

# Convert english arpabet to ipa
def arpa_to_ipa(arpa_char):
    end = ''
    arpa_ipa_map = {'AA': 'ɑ', 'AE': 'æ', 'AH': 'ə', 'AO': 'ɔ', 'AW': 'aʊ', 'AY': 'aɪ', 'B': 'b', 'CH': 'ʧ', 'D': 'd', 'DH': 'ð', 'EH': 'ɛ',
        'ER': 'ɚ', 'EY': 'eɪ', 'F': 'f', 'G': 'ɡ', 'HH': 'h', 'IH': 'ɪ', 'IY': 'iː', 'JH': 'ʤ', 'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'NG': 'ŋ',
        'OW': 'oʊ', 'OY': 'ɔɪ', 'P': 'p', 'R': 'ɹ', 'S': 's', 'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'UH': 'ʊ', 'UW': 'uː', 'V': 'v', 'W': 'w', 'Y': 'j',
        'Z': 'z', 'ZH': 'ʒ'
    }
    if arpa_char[-1] in '012':
        arpa_char = arpa_char[:-1]
    return arpa_ipa_map[arpa_char]

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    input_text = request.text.strip()

    # Convert to phonemes
    phonemes = [p for p in g2p(input_text) if p != ' ']
    phoneme_str = ' '.join(phonemes)

    # Mock IPA for now
    
    ipa = '/' + ''.join([arpa_to_ipa(p) for p in phonemes]) + '/'

    mock_similar_words = ["mock", "input", "market", "impact"]
    mock_media_clips = [
        {"url": "https://www.example.com/audio/mock1.mp3"},
        {"url": "https://www.example.com/audio/mock2.mp3"}
    ]

    return AnalyzeResponse(
        ipa=ipa,
        modelPhonemes=phoneme_str,
        similarWords=mock_similar_words,
        mediaClips=mock_media_clips
    )
