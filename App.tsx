import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import OptionsSelector from './components/OptionsSelector';
import Button from './components/Button';
import ReplyCard from './components/ReplyCard';
import PremiumModal from './components/PremiumModal';
import { 
  InputMode, Tone, Language, GeneratedResponse, UserCredits 
} from './types';
import { INITIAL_CREDITS, MOCK_LOADING_MESSAGES } from './constants';
import { generateReplies } from './services/geminiService';
import { Sparkles, Info } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [credits, setCredits] = useState<UserCredits>({
    remaining: INITIAL_CREDITS,
    isPremium: false,
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const [mode, setMode] = useState<InputMode>(InputMode.TEXT);
  const [textInput, setTextInput] = useState('');
  const [imageInput, setImageInput] = useState<string | null>(null);
  
  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.CONFIDENT);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.HINGLISH);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(MOCK_LOADING_MESSAGES[0]);
  
  const [result, setResult] = useState<GeneratedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      let i = 0;
      interval = window.setInterval(() => {
        i = (i + 1) % MOCK_LOADING_MESSAGES.length;
        setLoadingMessage(MOCK_LOADING_MESSAGES[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // --- Handlers ---
  const handleGenerate = async () => {
    setError(null);

    // Validation
    if (mode === InputMode.TEXT && !textInput.trim()) {
      setError("Please paste a text message first.");
      return;
    }
    if (mode === InputMode.IMAGE && !imageInput) {
      setError("Please upload a screenshot first.");
      return;
    }

    // Credits Check
    if (credits.remaining <= 0 && !credits.isPremium) {
      setShowPremiumModal(true);
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await generateReplies(
        mode === InputMode.TEXT ? textInput : "",
        mode === InputMode.IMAGE ? imageInput : null,
        selectedTone,
        selectedLanguage
      );

      setResult(response);
      
      // Deduct credit if not premium
      if (!credits.isPremium) {
        setCredits(prev => ({ ...prev, remaining: prev.remaining - 1 }));
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgrade = () => {
    // Mock upgrade process
    setCredits({ remaining: 9999, isPremium: true });
    setShowPremiumModal(false);
    alert("Welcome to Sway Premium! 🚀");
  };

  return (
    <div className="min-h-screen pb-20 bg-[#fafafa]">
      <Header 
        credits={credits} 
        onOpenPremium={() => setShowPremiumModal(true)} 
      />

      <main className="max-w-md mx-auto px-4 pt-6 space-y-8">
        
        {/* Hero / Intro */}
        {!result && (
          <div className="text-center space-y-1 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reply with Confidence</h1>
            <p className="text-gray-500">Your AI wingman for the perfect text.</p>
          </div>
        )}

        {/* Configuration Section */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <InputModeSection 
            mode={mode} 
            setMode={setMode} 
            textInput={textInput}
            setTextInput={setTextInput}
            imageInput={imageInput}
            setImageInput={setImageInput}
          />
          
          <OptionsSelector 
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <Button 
            fullWidth 
            onClick={handleGenerate} 
            isLoading={isGenerating}
            disabled={isGenerating}
            className="h-14 text-lg shadow-sway-200"
          >
            {isGenerating ? loadingMessage : (
              <span className="flex items-center">
                <Sparkles size={20} className="mr-2" /> 
                Generate Replies
              </span>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
            {/* Analysis Badge */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                  AI Context Analysis
                </p>
                <div className="text-sm text-gray-800">
                  <span className="font-semibold">{result.analysis.stage}</span> • {result.analysis.intent}
                </div>
              </div>
              <div className="text-right max-w-[50%]">
                 <p className="text-xs text-gray-500 italic">"{result.analysis.advice}"</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 ml-1">Suggested Replies</h3>
              {result.replies.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>

            <div className="text-center pt-4">
              <button 
                onClick={handleGenerate}
                className="text-sm font-medium text-gray-500 hover:text-sway-600 underline"
              >
                Not satisfied? Try generating again
              </button>
            </div>
          </div>
        )}

        <div className="h-12"></div> {/* Spacer */}
      </main>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

// Internal wrapper to prevent circular dependency mess if extracting InputSection purely
const InputModeSection: React.FC<any> = (props) => {
  return <InputSection {...props} />
}

export default App;