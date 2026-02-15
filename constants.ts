import { Tone, Language } from './types';

export const APP_NAME = "SWAY";

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  [Tone.POLITE]: "Soft, respectful, safe",
  [Tone.FRIENDLY]: "Warm, open, conversational",
  [Tone.CONFIDENT]: "Assertive but respectful",
  [Tone.PLAYFUL]: "Light humor, no sarcasm",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.ENGLISH]: "🇬🇧 English",
  [Language.HINGLISH]: "🇮🇳 Hinglish",
  [Language.HINDI]: "🇮🇳 Hindi",
};

export const INITIAL_CREDITS = 5;

export const MOCK_LOADING_MESSAGES = [
  "Analyzing conversation flow...",
  "Checking cultural nuances...",
  "Applying safety filters...",
  "Crafting the perfect reply...",
  "Adding a touch of charm..."
];