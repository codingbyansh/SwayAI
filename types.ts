export enum InputMode {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export enum Tone {
  POLITE = 'Polite',
  FRIENDLY = 'Friendly',
  CONFIDENT = 'Confident',
  PLAYFUL = 'Playful',
}

export enum Language {
  ENGLISH = 'English',
  HINGLISH = 'Hinglish',
  HINDI = 'Hindi',
}

export interface ReplyOption {
  id: string;
  text: string;
  style: 'Safe' | 'Balanced' | 'Bold';
}

export interface AnalysisResult {
  stage: string;
  intent: string;
  advice: string;
}

export interface GeneratedResponse {
  replies: ReplyOption[];
  analysis: AnalysisResult;
}

export interface UserCredits {
  remaining: number;
  isPremium: boolean;
}