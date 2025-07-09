import { getPhonemeFeatures } from './phoneme_features.js';

export function renderPhonemeBloom(canvas, phonemeStr, isAnimation=true) {
  if (!canvas || !phonemeStr) return;

  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const phonemes = phonemeStr.trim().split(/\s+/);
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = 20;
  const spiralSpacing = 0.5;

  const mannerToColor = {
    vowel: '#4ad12c',      // green
    glide: '#4d2ee8',      // indigo
    liquid: '#e64839',     // red
    nasal: '#fafa41',      // yellow
    fricative: '#2994f2',  // blue
    affricate: '#d038e0',  // violet
    plosive: '#fca71e'     // orange
  };

  const repeatCount = 18;
  const totalPetals = repeatCount * phonemes.length;
  let frame = 0;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function drawNextPetal() {
    if (frame >= totalPetals) {
      return;
    }

    const r = Math.floor(frame / phonemes.length);
    const index = frame % phonemes.length;
    const p = phonemes[phonemes.length - 1 - index]; // reverse order
    const globalIndex = frame;

    const delayNorm = globalIndex / totalPetals;
    const delay = 100 - 180 * easeOutCubic(delayNorm);

    const features = getPhonemeFeatures(p);
    const angle = globalIndex * 1.618;
    const radius = baseRadius + spiralSpacing * angle;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const dx = centerX - x;
    const dy = centerY - y;
    const rotationAngle = Math.atan2(dy, dx);

    const color = mannerToColor[features.manner] || '#999';
    const isVoiced = features.voiced || false;
    const isRounded = features.rounded || false;
    const stress = features.stress;
    const size = 12 + (stress ? 1 : 0);
    const opacity = 1 - (r / repeatCount);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle + (Math.PI * 1.5)); // point toward center
    ctx.globalAlpha = opacity;

    ctx.beginPath();
    if (!isVoiced) {
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.4, size);
      ctx.lineTo(-size * 0.4, size);
      ctx.closePath();
    } else if (isRounded) {
      ctx.ellipse(0, 0, size * 0.7, size, 0, 0, 2 * Math.PI);
    } else {
      ctx.ellipse(0, 0, size * 0.3, size, 0, 0, 2 * Math.PI);
    }

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    frame++;
    if(isAnimation) {
      setTimeout(() => requestAnimationFrame(drawNextPetal), delay);
    } else {
      drawNextPetal();
    }
  }

  drawNextPetal();
}
