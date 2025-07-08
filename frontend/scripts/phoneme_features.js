const phonemeFeatures = {
  // Vowels
  'AA': { manner: 'vowel', voiced: true, rounded: false },
  'AE': { manner: 'vowel', voiced: true, rounded: false },
  'AH': { manner: 'vowel', voiced: true, rounded: false },
  'AO': { manner: 'vowel', voiced: true, rounded: true },
  'AW': { manner: 'vowel', voiced: true, rounded: true },
  'AY': { manner: 'vowel', voiced: true, rounded: false },
  'EH': { manner: 'vowel', voiced: true, rounded: false },
  'ER': { manner: 'vowel', voiced: true, rounded: false },
  'EY': { manner: 'vowel', voiced: true, rounded: false },
  'IH': { manner: 'vowel', voiced: true, rounded: false },
  'IY': { manner: 'vowel', voiced: true, rounded: false },
  'OW': { manner: 'vowel', voiced: true, rounded: true },
  'OY': { manner: 'vowel', voiced: true, rounded: true },
  'UH': { manner: 'vowel', voiced: true, rounded: true },
  'UW': { manner: 'vowel', voiced: true, rounded: true },

  // Glides
  'W': { manner: 'glide', voiced: true, rounded: true },
  'Y': { manner: 'glide', voiced: true },

  // Liquids
  'L': { manner: 'liquid', voiced: true },
  'R': { manner: 'liquid', voiced: true },

  // Nasals
  'M': { manner: 'nasal', voiced: true },
  'N': { manner: 'nasal', voiced: true },
  'NG': { manner: 'nasal', voiced: true },

  // Fricatives
  'F': { manner: 'fricative', voiced: false },
  'V': { manner: 'fricative', voiced: true },
  'TH': { manner: 'fricative', voiced: false },
  'DH': { manner: 'fricative', voiced: true },
  'S': { manner: 'fricative', voiced: false },
  'Z': { manner: 'fricative', voiced: true },
  'SH': { manner: 'fricative', voiced: false },
  'ZH': { manner: 'fricative', voiced: true },
  'HH': { manner: 'fricative', voiced: false },

  // Affricates
  'CH': { manner: 'affricate', voiced: false },
  'JH': { manner: 'affricate', voiced: true },

  // Stops / Plosives
  'P': { manner: 'plosive', voiced: false },
  'B': { manner: 'plosive', voiced: true },
  'T': { manner: 'plosive', voiced: false },
  'D': { manner: 'plosive', voiced: true },
  'K': { manner: 'plosive', voiced: false },
  'G': { manner: 'plosive', voiced: true },
};

function extractStress(phoneme) {
  const match = phoneme.match(/^([A-Z]+)([012])?$/);
  if (!match) return { base : phoneme, stress: 0 };

  const [, base, stressStr] = match;
  const stress = stressStr ? parseInt(stressStr) : 0;
  return { base, stress };
}

export function getPhonemeFeatures(phoneme) {
  const { base, stress } = extractStress(phoneme);
  const features = phonemeFeatures[base] || { manner: 'unknown', voiced: true };
  return {
    phoneme,
    base,
    stress,
    ...features
  }
}