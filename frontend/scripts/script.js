import {
  displayPhonemes,
  fetchDefinition,
  drawPhonemeSignature,
  definitionCache,
  flipFlashcard,
  renderMediaClips,
  createSimilarWordItem,
  renderFlashcardBack,
  renderFlashcardFront,
  translations,
  showSpinner,
  hideSpinner
} from "./utils.js";

// Refresh logic
const defaultState = {
  en: { input: '', ipa: '', modelPhonemes: '', similarWords: [], mediaClips: [] },
  fr: { input: '', ipa: '', modelPhonemes: '', similarWords: [], mediaClips: [] }
};
const languageState = JSON.parse(localStorage.getItem('languageState')) || defaultState;
const defaultLang = 'en'; // default to English
let currentLang = JSON.parse(localStorage.getItem('currentLanguage')) || defaultLang;
// Handle output animation on refresh
if (currentLang === 'en' && !(languageState.en.input === '')) {
  document.getElementById('output').classList.add('visible');
}
if (currentLang === 'fr' && !(languageState.fr.input === '')) {
  document.getElementById('output').classList.add('visible');
}


// Submitting logic
document.getElementById('input-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  document.getElementById('output').classList.remove('visible');

  const input = document.getElementById('user-input').value.trim();
  if (!input) return;

  // Clear previous results
  document.getElementById('ipa-output').textContent = 'Loading...';
  document.getElementById('model-output').textContent = 'Loading...';
  document.getElementById('similar-words').innerHTML = '';
  document.getElementById('media-clips').textContent = 'Loading...';
  document.getElementById('flashcard-front').textContent = 'Loading...';
  document.getElementById('flashcard-back').textContent = 'Loading...';

  showSpinner();
  try {
    const response = await fetch(`http://127.0.0.1:8000/analyze/${currentLang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input })
    });

    if (!response.ok) throw new Error('Server error');

    const data = await response.json();

    // Populate results
    document.getElementById('ipa-output').textContent = data.ipa;
    document.getElementById('model-output').textContent = displayPhonemes(data.modelPhonemes);

    // Add definition to title
    const inputWord = data.inputWord || '...';
    const wordSpan = document.getElementById('input-word');
    const tooltipSpan = document.getElementById('input-word-tooltip');
    wordSpan.textContent = inputWord;
    fetchDefinition(inputWord).then(def => {
      tooltipSpan.textContent = def || "Definition not found";
    });

    // Similar words
    for (const entry of data.similarWords) {
      const definition = await fetchDefinition(entry.word);
      const tooltip = definition || "Definition not found";
      const li = createSimilarWordItem(entry, tooltip);
      document.getElementById('similar-words').appendChild(li);
    }

    // Media clips
    document.getElementById('media-clips').innerHTML = renderMediaClips(data.mediaClips);

    // Flashcards
    document.getElementById('flashcard-back').innerHTML = renderFlashcardBack(data);
    document.getElementById('flashcard-front').textContent = renderFlashcardFront(input);

    // Draw phoneme signature
    drawPhonemeSignature(document.getElementById('phoneme-canvas'), data.modelPhonemes);


    // Store language state
    languageState[currentLang] = {
      input,
      ipa: data.ipa,
      modelPhonemes: data.modelPhonemes,
      similarWords: data.similarWords.map(word => ({
        ...word,
        definition: definitionCache[word.word] || ''
      })),
      mediaClips: data.mediaClips
    };
    localStorage.setItem('languageState', JSON.stringify(languageState));

    // Load animation
    document.getElementById('output').classList.add('visible');
    hideSpinner();
  } catch (err) {
    console.error(err);
    alert('There was a problem analyzing your input.');
    hideSpinner();
  }
});

// Clear button logic
document.getElementById('clear-button').addEventListener('click', () => {
  languageState[currentLang] = {
    input: '',
    ipa: '',
    modelPhonemes: '',
    similarWords: [],
    mediaClips: []
  };
  localStorage.setItem('languageState', JSON.stringify(languageState));
  updateUILanguage();
  document.getElementById('output').classList.remove('visible');
});

// Flip button logic
document.getElementById('flip-button').addEventListener('click', () => {
  flipFlashcard();
})

// Dark mode toggle logic
const darkToggle = document.getElementById('dark-toggle');
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  darkToggle.textContent = 'Light Mode';
}
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    darkToggle.textContent = 'Light Mode';
  } else {
    darkToggle.textContent = 'Dark Mode';
  }

  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
})

// Language toggle logic
const langToggle = document.getElementById('lang-toggle');
langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  // Store current language
  localStorage.setItem('currentLanguage', JSON.stringify(currentLang));
  updateUILanguage();
});

// Click on similar word event
window.addEventListener('similar-word-clicked', (e) => {
  const newWord = e.detail;
  document.getElementById('user-input').value = newWord;

  // Trigger form submission
  document.getElementById('input-form').dispatchEvent(new Event('submit'));
})

// Update UI Logic (when refresh, language swap, etc.)
function updateUILanguage() {
  const t = translations[currentLang];

  // Update static UI labels
  document.querySelector('label[for="user-input"]').textContent = t.inputLabel;
  document.querySelector('#input-form button[type="submit"]').textContent = t.analyze;
  document.getElementById('clear-button').textContent = t.clear;
  document.querySelector('#output h2').textContent = t.results;
  document.querySelector('#phoneme-title').childNodes[0].textContent = t.phonemeTitle + ' ';
  document.querySelector('.matches-section h3').textContent = t.similarWords;
  document.querySelector('.media-section h3').textContent = t.clips;
  document.querySelector('.art-section h3').textContent = t.signature;
  document.querySelector('.flashcard-section h3').textContent = t.flashcard;
  document.getElementById('flashcard-front').textContent = t.flashcardFront;
  langToggle.textContent = t.langToggle;

  // Load state for selected language
  const state = languageState[currentLang];

  document.getElementById('user-input').value = state.input || '';
  document.getElementById('ipa-output').textContent = state.ipa || '—';
  document.getElementById('model-output').textContent = displayPhonemes(state.modelPhonemes) || '—';

  // Input word and tooltip
  document.getElementById('input-word').textContent = state.input || '...';
  if (state.input) fetchDefinition(state.input).then(def => {
    document.getElementById('input-word-tooltip').textContent = def || "Definition not found";
  });

  // Similar words
  const similarList = document.getElementById('similar-words');
  similarList.innerHTML = '';
  state.similarWords.forEach(entry => {
    const li = createSimilarWordItem(entry, entry.definition);
    similarList.appendChild(li);
  });

  // Media clips
  document.getElementById('media-clips').innerHTML = renderMediaClips(state.mediaClips);

  // Flashcards
  if (state.ipa && state.modelPhonemes) {
    document.getElementById('flashcard-back').innerHTML = renderFlashcardBack(state);  
  } else {
    document.getElementById('flashcard-back').textContent = t.flashcardBack;
  }

  document.getElementById('flashcard-front').textContent = renderFlashcardFront(state.input);

  // Redraw canvas
  drawPhonemeSignature(document.getElementById('phoneme-canvas'), state.modelPhonemes);

}
updateUILanguage(); // apply language on initial load