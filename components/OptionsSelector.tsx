import React from 'react';
import { Tone, Language } from '../types';
import { TONE_DESCRIPTIONS, LANGUAGE_LABELS } from '../constants';

interface OptionsSelectorProps {
  selectedTone: Tone;
  setSelectedTone: (tone: Tone) => void;
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
}

const OptionsSelector: React.FC<OptionsSelectorProps> = ({
  selectedTone,
  setSelectedTone,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  return (
    <div className="space-y-6">
      {/* Tone Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Vibe Check</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(Tone).map((tone) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                selectedTone === tone
                  ? 'border-sway-500 bg-sway-50 text-sway-900 ring-1 ring-sway-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-semibold">{tone}</div>
              <div className="text-[10px] opacity-70 leading-tight mt-0.5">
                {TONE_DESCRIPTIONS[tone]}
              </div>
              {selectedTone === tone && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-sway-500 rounded-bl-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Language</label>
        <div className="flex space-x-2">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                selectedLanguage === lang
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptionsSelector;