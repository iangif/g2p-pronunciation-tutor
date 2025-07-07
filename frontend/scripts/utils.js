export const definitionCache = {}

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
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!phonemeStr) return;

  const phonemes = phonemeStr.split(' ');
  phonemes.forEach((phoneme, i) => {
    ctx.fillStyle = `hsl(${i * 45 % 360}, 70%, 60%)`;
    ctx.fillRect(i * 40 + 10, 100 - (i % 4) * 20, 30, (i % 4) * 20 + 20);
  });
}

export function flipFlashcard() {
  const card = document.querySelector('.flashcard');
  card.classList.toggle('flipped');
}

export function renderMediaClips(clips) {
  return clips.map(clip => {
    const url = new URL(clip.url);
    const videoId = url.searchParams.get("v");

    let start = Math.floor(clip.start || 0) - 1;
    if (start < 0) start = 0;
    const end = Math.floor(clip.end || 0) + 1;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}&version=3&autoplay=0&rel=0`;

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
      <span class="tooltip-text">${tooltip}</span>
    </span>
    — <em>${entry.ipa}</em><br/><small>${displayPhonemes(entry.phonemes)}</small>
  `;
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