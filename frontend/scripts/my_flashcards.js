import { renderFlashcardBack, renderFlashcardFront } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Apply dark mode if previously set
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
  }
  const toggleDark = document.getElementById('toggle-dark');
  toggleDark.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
      toggleDark.textContent = 'Light Mode';
    } else {
      toggleDark.textContent = 'Dark Mode';
    }
    localStorage.setItem('darkMode', isDarkMode);
  });

  const container = document.getElementById("flashcard-container");

  // Retrieve saved flashcards
  const flashcards = JSON.parse(localStorage.getItem("savedFlashcards")) || [];

  flashcards.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "flashcard";
    cardDiv.innerHTML = `
      <div class="front">
        <div id="flashcard-front-word">${card.word}</div>
        <canvas id="flashcard-canvas-${index}" width="300" height="150"></canvas>
      </div>
      <div class="back">
        ${renderFlashcardBack({ipa: card.ipa, modelPhonemes: card.phonemes})}
      </div>
    `;
    container.appendChild(cardDiv);
    cardDiv.addEventListener('click', () => {
      cardDiv.classList.toggle('flipped');
    })

    // Draw phoneme signature
    document.getElementById('flashcard-front-word').textContent = renderFlashcardFront(card.word, document.getElementById(`flashcard-canvas-${index}`), card.phonemes);
  });

  // Audio button
  container.addEventListener("click", function (e) {
    if (e.target.classList.contains("audio-button")) {
      const phonemes = e.target.getAttribute("data-phonemes");
      // Here you’d plug in TTS (if needed)
      alert(`Playing: ${phonemes}`); // Placeholder
    }
  });



});
