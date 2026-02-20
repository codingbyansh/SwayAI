
import React, { useState } from 'react';
import { ArrowLeft, Ghost, Sparkles, Copy, Check, AlertCircle, Smile, Type as TypeIcon, Globe } from 'lucide-react';
import Button from './Button';
import { recoverFromGhosting } from '../services/geminiService';
import { GhostingResponse, GhostingReply, Language, TextStyle } from '../types';
import { LANGUAGE_LABELS } from '../constants';

interface GhostingRecoveryProps {
  onClose: () => void;
}

const GhostingRecovery: React.FC<GhostingRecoveryProps> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Form State
  const [gender, setGender] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [language, setLanguage] = useState<Language>(Language.HINGLISH);
  const [textStyle, setTextStyle] = useState<TextStyle>(TextStyle.STANDARD);
  const [useEmojis, setUseEmojis] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GhostingResponse | null>(null);

  const handleSubmit = async () => {
    if (!gender || !details.trim()) return;
    
    setLoading(true);
    setStep(2);
    
    try {
      const data = await recoverFromGhosting(gender, details, language, textStyle, useEmojis);
      setResult(data);
      setStep(3);
    } catch (error) {
      console.error(error);
      setStep(1); // Go back on error
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col animate-in fade-in duration-300 h-[100dvh]">
      {/* Navbar for Ghosting Page */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex-none">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex items-center space-x-2">
            <Ghost size={20} className="text-black" />
            <span className="font-bold text-lg text-black">Ghosting Rescue</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
          
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Let's get them back.</h1>
                <p className="text-gray-500">Tell us about the situation and we'll craft the perfect revival text.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Gender Select */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900">Who ghosted you?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          gender === g 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details Input */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900">What happened?</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g., We went on 2 dates, texted for a week, then he stopped replying after I asked about his weekend..."
                    className="w-full h-32 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 resize-none focus:outline-none focus:border-black focus:bg-white transition-all text-gray-700"
                  />
                </div>

                {/* Preferences Section */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customize Reply</span>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 flex items-center">
                      <Globe size={12} className="mr-1" /> Language
                    </label>
                    <div className="flex space-x-2 overflow-x-auto pb-1">
                      {Object.values(Language).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border whitespace-nowrap ${
                            language === lang
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {LANGUAGE_LABELS[lang]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Text Style */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 flex items-center">
                        <TypeIcon size={12} className="mr-1" /> Style / Length
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(TextStyle).map((style) => (
                          <button
                            key={style}
                            onClick={() => setTextStyle(style)}
                            className={`flex-grow py-1.5 px-2 text-xs font-medium rounded-md border transition-all ${
                              textStyle === style
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {style.split('/')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Emojis */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 flex items-center">
                        <Smile size={12} className="mr-1" /> Emojis
                      </label>
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setUseEmojis(true)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                            useEmojis
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          On 😜
                        </button>
                        <button
                          onClick={() => setUseEmojis(false)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                            !useEmojis
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Off
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  fullWidth 
                  onClick={handleSubmit} 
                  disabled={!gender || !details.trim()}
                  className="bg-black hover:bg-gray-800 text-white shadow-none h-14"
                >
                  <Sparkles size={18} className="mr-2" />
                  Generate Recovery Texts
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Analyzing the silence...</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Calculating recovery probabilities based on dating psychology.</p>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
              {/* Analysis */}
              <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex items-start gap-4">
                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-orange-900 text-sm uppercase tracking-wide mb-1">Diagnosis</h4>
                  <p className="text-orange-800 text-sm leading-relaxed">{result.analysis}</p>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-4">
                {result.replies.map((reply) => (
                  <GhostingCard key={reply.id} reply={reply} />
                ))}
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => setStep(1)}
                  className="border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Try Different Details
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

// Sub-component for individual cards
const GhostingCard: React.FC<{ reply: GhostingReply }> = ({ reply }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine color based on recovery chance
  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600 bg-green-100';
    if (pct >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{reply.strategy}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getPercentageColor(reply.recoveryChance)}`}>
          {reply.recoveryChance}% Chance
        </span>
      </div>
      
      <p className="text-lg font-medium text-gray-900 mb-4 font-sans">"{reply.text}"</p>
      
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500 italic flex-1 mr-4">{reply.explanation}</p>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium shrink-0"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};

export default GhostingRecovery;
