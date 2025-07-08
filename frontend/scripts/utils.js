import { renderPhonemeBloom } from './bloom.js';

export const definitionCache = {}

export const translations = {
  en: {
    analyze: "Analyze",
    clear: 'Clear',
    inputLabel: "Enter a word:",
    results: "Results",
    phonemeTitle: "Phoneme Representation of",
    similarWords: "Similar Sounding Words",
    clips: "Example Clips",
    signature: "Phoneme Signature",
    flashcard: "Flashcard",
    flashcardFront: "Your word here",
    flashcardBack: "IPA, phonemes, artwork",
    langToggle: "🇺🇸 English"
  },
  fr: {
    analyze: "Analyser",
    clear: 'Effacer',
    inputLabel: "Entrez un mot:",
    results: "Résultats",
    phonemeTitle: "Représentation phonémique de",
    similarWords: "Mots au son similaire",
    clips: "Exemples audio",
    signature: "Signature phonémique",
    flashcard: "Carte mémoire",
    flashcardFront: "Votre mot ici",
    flashcardBack: "API, phonèmes, illustration",
    langToggle: "🇫🇷 Français"
  }
};

export function displayPhonemes(phonemes) {
  return phonemes
    .split(' ')
    .map(p => /[012]$/.test(p) ? p.slice(0, -1) : p)
    .join(' ');
}

export async function fetchDefinition(word) {
  if (definitionCache[word]) {
    return definitionCache[word];
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    if (!res.ok) return null;
    const data = await res.json();
    const def = data[0]?.meanings[0]?.definitions[0]?.definition;
    definitionCache[word] = def;
    return def || null;
  } catch {
    return null;
  }
}

export function drawPhonemeSignature(canvas, phonemeStr) {
  renderPhonemeBloom(canvas, phonemeStr);
}

export function flipFlashcard() {
  const card = document.querySelector('.flashcard');
  card.classList.toggle('flipped');

  // flip animation
  card.classList.remove('pulse');
  void card.offsetWidth;
  card.classList.add('pulse');
}

export function renderMediaClips(clips) {
  return clips.map(clip => {
    const url = new URL(clip.url);
    const videoId = url.searchParams.get("v");

    let start = Math.floor(clip.start || 0) - 1;
    if (start < 0) start = 0;
    const end = Math.floor(clip.end || 0) + 1;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}&version=3&autoplay=0&rel=0&controls=0&modestbranding=1&autohide=1&showinfo=0`;

    return `
      <div class="video-clip">
        <iframe width="255" height="150"
          src="${embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
        <div class="clip-caption"><small>${clip.transcript || 'no transcript'}</small></div>
      </div>
    `;
  }).join('');
}

export function createSimilarWordItem(entry, tooltip) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="tooltip-container">
      <strong class="hover-word">${entry.word}</strong>
      <span class="tooltip-text">${tooltip || 'No definition found.'}</span>
    — <em>${entry.ipa}</em><br/><small>${displayPhonemes(entry.phonemes)}</small>
    </span>
  `;

  li.classList.add('clickable-similar-word');
  li.addEventListener('click', () => {
    const inputEvent = new CustomEvent('similar-word-clicked', {
      detail: entry.word
    });
    window.dispatchEvent(inputEvent)
  })
  return li;
}

export function renderFlashcardBack(data) {
  return `
    <strong>IPA:</strong> ${data.ipa}<br />
    <strong>Phonemes:</strong> ${data.modelPhonemes}<br />
    <em>+ phoneme signature graphic</em>
  `;
}

export function renderFlashcardFront(input) {
  return input || "Your word here";
}

export function showSpinner() {
  document.getElementById('loading-indicator').classList.add('visible');
}

export function hideSpinner() {
  document.getElementById('loading-indicator').classList.remove('visible');
}