# Personalized Pronunciation Tutor

An interactive tool for language learners to improve pronunciation by exploring native phoneme patterns, similar-sounding words, and audio clips.

## Features

- **Grapheme-to-Phoneme (G2P) Conversion**: Uses `g2p-en` to convert English text into ARPAbet phonemes and IPA.
- **Similar Word Matching**: Finds similar-sounding words based on phoneme distance, with differences underlined in IPA.
- **Frequency Weighting**: Prioritizes common English words to enhance relevance for learners.
- **Phoneme Signature Visualization** *(in progress)*: Generates visual cues to aid in sound memory.
- **Flashcard Support** *(planned)*: Uses phoneme structure, IPA, and audio examples to create engaging study tools.

## Technologies

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: FastAPI (Python)
- **NLP Tools**: `g2p-en`, NLTK's CMUdict, `wordfreq`

## Getting Started

1. Install dependencies:
    ```bash
    pip install fastapi uvicorn g2p-en nltk wordfreq
    ```

2. Run the backend (in backend folder):
    ```bash
    uvicorn main:app --reload
    ```

3. Open `index.html` in your browser and test it locally.

## Future Plans

- Multilingual G2P support
- Learner audio comparison and feedback
- Pronunciation flashcards with memory aids
- User accounts and spaced repetition system

---

## Author

Built by [Ian Gifford] for personal use and open-source experimentation.
