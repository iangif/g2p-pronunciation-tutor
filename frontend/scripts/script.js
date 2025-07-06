const definitionCache = {};
const defaultState = {
  en: { input: '', ipa: '', modelPhonemes: '', similarWords: [], mediaClips: [] },
  fr: { input: '', ipa: '', modelPhonemes: '', similarWords: [], mediaClips: [] }
};
const languageState = JSON.parse(localStorage.getItem('languageState')) || defaultState;
const defaultLang = 'en'; // default to English
let currentLang = JSON.parse(localStorage.getItem('currentLanguage')) || defaultLang;
const translations = {
  en: {
    analyze: "Analyze",
    clear: 'Clear',
    inputLabel: "Enter a word or phrase:",
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
    inputLabel: "Entrez un mot ou une phrase:",
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

// Returns new arpa phonemes with stress markers removed
// Input/Output: phoneme strings
function displayPhonemes(phonemes) {
  return phonemes
    .split(' ')
    .map(p => /[012]$/.test(p) ? p.slice(0, -1) : p)
    .join(' ')
}

document.getElementById('input-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const input = document.getElementById('user-input').value.trim();
  if (!input) return;

  // Clear previous results
  document.getElementById('ipa-output').textContent = 'Loading...';
  document.getElementById('model-output').textContent = 'Loading...';
  document.getElementById('similar-words').innerHTML = '';
  document.getElementById('media-clips').textContent = 'Loading...';
  document.getElementById('flashcard-front').textContent = input;
  document.getElementById('flashcard-back').textContent = 'Loading...';

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

    for (const entry of data.similarWords) {
      const li = document.createElement('li');
      const definition = await fetchDefinition(entry.word);
      const tooltip = definition ? definition : "Definition not found";

      li.innerHTML = `
        <span class="tooltip-container">
          <strong class="hover-word">${entry.word}</strong>
          <span class="tooltip-text">${tooltip}</span>
        </span>
        — <em>${entry.ipa}</em><br/><small>${displayPhonemes(entry.phonemes)}</small>
      `;
      document.getElementById('similar-words').appendChild(li);
    }

    /* Audio only
    document.getElementById('media-clips').innerHTML = data.mediaClips.map(clip => {
      return `<audio controls src="${clip.url}"></audio>`;
    }).join('');
    */

    document.getElementById('media-clips').innerHTML = data.mediaClips.map(clip => {
      return `
        <video controls width="255">
          <source src="${clip.url}" type="video/mp4">
          Your browser does not support the video tag. 
        </video>
      `;
    }).join('');

    document.getElementById('flashcard-back').innerHTML = `
      <strong>IPA:</strong> ${data.ipa}<br />
      <strong>Phonemes:</strong> ${data.modelPhonemes}<br />
      <em>+ phoneme signature graphic</em>
    `;

    // Draw phoneme signature (simplified demo)
    const canvas = document.getElementById('phoneme-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.modelPhonemes.split(' ').forEach((phoneme, i) => {
      ctx.fillStyle = `hsl(${i * 45 % 360}, 70%, 60%)`;
      ctx.fillRect(i * 40 + 10, 100 - (i % 4) * 20, 30, (i % 4) * 20 + 20);
    });

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
  } catch (err) {
    console.error(err);
    alert('There was a problem analyzing your input.');
  }
});

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
});

async function fetchDefinition(word) {
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

function flipFlashcard() {
  const card = document.querySelector('.flashcard');
  card.classList.toggle('flipped');
}

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
  document.getElementById('flashcard-back').textContent = t.flashcardBack;
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
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="tooltip-container">
        <strong class="hover-word">${entry.word}</strong>
        <span class="tooltip-text">${entry.definition || ''}</span>
      </span>
      — <em>${entry.ipa}</em><br/><small>${displayPhonemes(entry.phonemes)}</small>
    `;
    similarList.appendChild(li);
  });

  // Media
  /* Audio only
  document.getElementById('media-clips').innerHTML = state.mediaClips.map(
    clip => `<audio controls src="${clip.url}"></audio>`
  ).join('');
  */
  document.getElementById('media-clips').innerHTML = state.mediaClips.map(clip => {
    return `
      <video controls width="255">
        <source src="${clip.url}" type="video/mp4">
        Your browser does not support the video tag. 
      </video>
    `;
  }).join('');
  

  // Redraw canvas
  const canvas = document.getElementById('phoneme-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.modelPhonemes.split(' ').forEach((phoneme, i) => {
    ctx.fillStyle = `hsl(${i * 45 % 360}, 70%, 60%)`;
    ctx.fillRect(i * 40 + 10, 100 - (i % 4) * 20, 30, (i % 4) * 20 + 20);
  });
}
updateUILanguage(); // apply language on initial load