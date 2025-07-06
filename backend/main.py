from fastapi import FastAPI, Request, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse
from g2p_en import G2p
from nltk.corpus import cmudict
from difflib import SequenceMatcher
from wordfreq import word_frequency
from db import setup_database, find_clips_by_phoneme_substring, find_near_phoneme_clips

setup_database()
app = FastAPI()
g2p = G2p()
cmu = cmudict.dict()

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

class SimilarWord(BaseModel):
    word: str
    ipa: str
    phonemes: str

class AnalyzeResponse(BaseModel):
    inputWord: str
    ipa: str
    modelPhonemes: str
    similarWords: List[SimilarWord]
    mediaClips: List[MediaClip]

def weight_by_position(arpa1, arpa2):
    # Give +1 weight if prefix or suffix matches
    score = 0
    if arpa1[:2] == arpa2[:2]:
        score -= 1
    if arpa1[-2:] == arpa2[-2:]:
        score -= 1
    return score    

# Levenshtein Distance aka "edit distance"
def phoneme_edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]

    for i in range(m+1):
        for j in range(n+1):
            if i == 0: dp[i][j] = j
            elif j == 0: dp[i][j] = i
            elif a[i-1] == b[j-1]: dp[i][j] = dp[i-1][j-1]
            else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]

# Find similar words
def get_similar_phoneme_words(target_arpa, max_distance=1):
    similar = []
    for word, arpa_list in cmu.items():
        for arpa in arpa_list:
            dist = phoneme_edit_distance(target_arpa, arpa)
            if dist <= max_distance:
                similar.append((word, arpa, dist))
    
    # sort by lowest distance
    similar.sort(key=lambda x: (
        x[2],
        weight_by_position(target_arpa, x[1]),
        -word_frequency(x[0], 'en') if word_frequency(x[0], 'en') else -1e-9
    ))
    return similar

def find_similar_words_with_ipa(input_arpa, input_text, max_results=12, max_dist=3):
    seen = set()
    result = []

    for distance in range(1, max_dist + 1):
        candidates = get_similar_phoneme_words(input_arpa, max_distance=distance)
        for word, arpa, dist in candidates:
            # Avoid duplicates and having the same word as a similar word
            if word.lower() in seen or word == input_text or not(word.isalpha()):
                continue
            seen.add(word.lower())
            ipa = '/' + ''.join(arpa_to_ipa(p) for p in arpa if p != ' ') + '/'
            ipa_diff = find_ipa_diff(input_arpa, arpa)
            result.append(SimilarWord(word=word, ipa=ipa_diff, phonemes=' '.join(arpa)))
            if len(result) >= max_results:
                return result
    
    return result

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

# Levenschtein Alignment to find differences between sequences
def find_ipa_diff(base_arpa, compare_arpa):
    base_ipa = [arpa_to_ipa(p) for p in base_arpa if p != ' ']
    comp_ipa = [arpa_to_ipa(p) for p in compare_arpa if p != ' ']
    
    m, n = len(base_ipa), len(comp_ipa)
    dp = [[0]*(n+1) for _ in range(m+1)]
    backtrace = [[(0, 0)]*(n+1) for _ in range(m+1)]

    # Fill DP matrix
    for i in range(m+1):
        for j in range(n+1):
            if i == 0:
                dp[i][j] = j
                backtrace[i][j] = (i, j-1)
            elif j == 0:
                dp[i][j] = i
                backtrace[i][j] = (i-1, j)
            elif base_ipa[i-1] == comp_ipa[j-1]:
                dp[i][j] = dp[i-1][j-1]
                backtrace[i][j] = (i-1, j-1)
            else:
                choices = [
                    (dp[i-1][j] + 1, (i-1, j)),   # delete
                    (dp[i][j-1] + 1, (i, j-1)),   # insert
                    (dp[i-1][j-1] + 1, (i-1, j-1)) # substitute
                ]
                dp[i][j], backtrace[i][j] = min(choices)

    # Trace back
    i, j = m, n
    aligned = []
    while i > 0 or j > 0:
        pi, pj = backtrace[i][j]
        if pi == i - 1 and pj == j - 1:
            if i > 0 and j > 0 and base_ipa[i-1] == comp_ipa[j-1]:
                aligned.append(comp_ipa[j-1])
            else:
                aligned.append(f'<span class="custom-underline">{comp_ipa[j-1]}</span>')
        elif pi == i and pj == j - 1:
            aligned.append(f'<span class="custom-underline">{comp_ipa[j-1]}</span>')
        elif pi == i - 1 and pj == j:
            aligned.append("_")
        i, j = pi, pj

    aligned.reverse()
    return '/' + ''.join(aligned) + '/'


@app.post("/analyze/{language}", response_model=AnalyzeResponse)
async def analyze_text(language: str = Path(..., pattern="^(en|fr)$"), request: AnalyzeRequest = None):
    input_text = request.text.strip()

    max_clip_results = 6
    if language == "en":
        phonemes = [p for p in g2p(input_text) if p != ' ']
        phoneme_str = ' '.join(phonemes)
        ipa = '/' + ''.join([arpa_to_ipa(p) for p in phonemes]) + '/'
        similar_words = find_similar_words_with_ipa(phonemes, input_text)

        # Video clip lookup
        media_clips = find_clips_by_phoneme_substring(
            # Remove stress marker
            ' '.join([p[:-1] if p[-1] in '012' else p for p in phonemes]),
            lang='en',
            max_results = max_clip_results
        )
        if len(media_clips) != 6:
            media_clips = find_near_phoneme_clips(
                ' '.join([p[:-1] if p[-1] in '012' else p for p in phonemes]),
                lang='en',
                max_results = max_clip_results - len(media_clips)
            )
    elif language == "fr":
        phonemes = ["placeholder"]
        phoneme_str = 'placeholder'
        ipa = '/placeholder/'
        similar_words = []
        media_clips = []

    return AnalyzeResponse(
        inputWord=input_text,
        ipa=ipa,
        modelPhonemes=phoneme_str,
        similarWords=similar_words,
        mediaClips=media_clips
    )
