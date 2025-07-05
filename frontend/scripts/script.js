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
    const response = await fetch('http://127.0.0.1:8000/analyze', {
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
    document.getElementById('model-output').textContent = data.modelPhonemes;


    data.similarWords.forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${entry.word}</strong> — <em>${entry.ipa}</em><br/><small>${entry.phonemes}</small>
      `;
      document.getElementById('similar-words').appendChild(li)
    });

    document.getElementById('media-clips').innerHTML = data.mediaClips.map(clip => {
      return `<audio controls src="${clip.url}"></audio>`;
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
  } catch (err) {
    console.error(err);
    alert('There was a problem analyzing your input.');
  }
});

function flipFlashcard() {
  const card = document.querySelector('.flashcard');
  card.classList.toggle('flipped');
}
