
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import OptionsSelector from './components/OptionsSelector';
import Button from './components/Button';
import ReplyCard from './components/ReplyCard';
import PremiumModal from './components/PremiumModal';
import GhostingRecovery from './components/GhostingRecovery';
import ConflictResolutionModal from './components/ConflictResolutionModal';
import { AuthPage } from './components/AuthPage';
import { Logo } from './components/Logo';
import { 
  InputMode, Tone, Language, GeneratedResponse, UserCredits, TextStyle, User 
} from './types';
import { INITIAL_CREDITS, MOCK_LOADING_MESSAGES } from './constants';
import { generateReplies } from './services/geminiService';
import { Sparkles } from 'lucide-react';
import { userService } from './services/userService';

const HeroSection: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-6 lg:py-10 text-center space-y-6">
    <div className="p-6 bg-white rounded-full shadow-lg shadow-pink-100 border border-pink-50 transform hover:scale-105 transition-transform duration-300">
      <Logo className="w-20 h-20 md:w-24 md:h-24" />
    </div>
    <div className="space-y-3 max-w-lg mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
        Reply with <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Confidence</span>
      </h1>
      <p className="text-base md:text-lg text-gray-500 leading-relaxed">
        Say Hey! Because You Have Sway . Your Personalised AI Dating Assistant
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<User | null>(() => userService.getCurrentUser());
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showGhostingModal, setShowGhostingModal] = useState(false); 
  const [showConflictModal, setShowConflictModal] = useState(false);
  
  const [mode, setMode] = useState<InputMode>(InputMode.TEXT);
  const [textInput, setTextInput] = useState('');
  const [imageInput, setImageInput] = useState<string | null>(null);
  
  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.CONFIDENT);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.HINGLISH);
  const [useEmojis, setUseEmojis] = useState<boolean>(true);
  const [textStyle, setTextStyle] = useState<TextStyle>(TextStyle.STANDARD);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(MOCK_LOADING_MESSAGES[0]);
  
  const [result, setResult] = useState<GeneratedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to results when generated
  useEffect(() => {
    if (result && !isGenerating) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [result, isGenerating]);

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

    if (!user) return;

    // Credits Check
    if (!user.isPremium && user.credits <= 0) {
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
        selectedLanguage,
        useEmojis,
        textStyle
      );

      setResult(response);
      
      // Deduct credit if not premium
      if (!user.isPremium) {
        try {
          const updatedUser = userService.deductCredit(user.email);
          setUser(updatedUser);
        } catch (e) {
          // Should not happen due to check above, but safe fallback
          setShowPremiumModal(true);
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgrade = () => {
    if (!user) return;
    const updatedUser = userService.upgradeUser(user.email);
    setUser(updatedUser);
    setShowPremiumModal(false);
    alert("Welcome to Sway Premium! 🚀");
  };

  const handleLogout = () => {
    userService.logout();
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-[#fafafa]">
      <Header 
        credits={{ remaining: user.credits, isPremium: user.isPremium }} 
        onOpenPremium={() => setShowPremiumModal(true)} 
        onOpenGhosting={() => setShowGhostingModal(true)}
        onOpenConflict={() => setShowConflictModal(true)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
        
        {/* Mobile Hero: Visible only on mobile/tablet */}
        <div className="lg:hidden mb-6">
          <HeroSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Input Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
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
                useEmojis={useEmojis}
                setUseEmojis={setUseEmojis}
                textStyle={textStyle}
                setTextStyle={setTextStyle}
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
          </div>

          {/* RIGHT COLUMN: Desktop Hero & Results */}
          <div className="lg:col-span-7">
            {/* Desktop Hero: Visible only on large screens */}
            <div className="hidden lg:block">
              <HeroSection />
            </div>

            {/* Results Section - Appears below Hero */}
            {result && (
              <div ref={resultsRef} className="space-y-6 animate-in slide-in-from-bottom-10 duration-500 pt-8 lg:border-t lg:border-gray-100">
                {/* Analysis Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 border border-blue-100 p-5 rounded-2xl gap-4">
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                      AI Context Analysis
                    </p>
                    <div className="text-sm md:text-base text-gray-800">
                      <span className="font-semibold">{result.analysis.stage}</span> • {result.analysis.intent}
                    </div>
                  </div>
                  <div className="sm:text-right sm:max-w-[60%]">
                     <p className="text-sm text-gray-600 italic leading-relaxed">"{result.analysis.advice}"</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 ml-1">Suggested Replies</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {result.replies.map((reply) => (
                      <ReplyCard key={reply.id} reply={reply} />
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4 lg:text-left">
                  <button 
                    onClick={handleGenerate}
                    className="text-sm font-medium text-gray-500 hover:text-sway-600 underline"
                  >
                    Not satisfied? Try generating again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-12"></div> {/* Spacer */}
      </main>

      {/* Modals */}
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
        isPremium={user?.isPremium || false}
      />
      
      {showGhostingModal && (
        <GhostingRecovery onClose={() => setShowGhostingModal(false)} />
      )}

      {showConflictModal && (
        <ConflictResolutionModal onClose={() => setShowConflictModal(false)} />
      )}
    </div>
  );
};

// Internal wrapper to prevent circular dependency mess if extracting InputSection purely
const InputModeSection: React.FC<any> = (props) => {
  return <InputSection {...props} />
}

export default App;
