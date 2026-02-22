import React, { useState, useEffect, useRef } from 'react';
import SiteHeader from './components/SiteHeader';
import InputSection from './components/InputSection';
import OptionsSelector from './components/OptionsSelector';
import Button from './components/Button';
import SwipeableReplyCard from './components/SwipeableReplyCard';
import PremiumModal from './components/PremiumModal';
import GhostingRecovery from './components/GhostingRecovery';
import ConflictResolutionModal from './components/ConflictResolutionModal';
import CreditsBar from './components/CreditsBar';
import { AuthPage } from './components/AuthPage';
import { Logo } from './components/Logo';
import {
  InputMode, Tone, Language, GeneratedResponse, UserCredits, TextStyle, User
} from './types';
import { MOCK_LOADING_MESSAGES } from './constants';
import { generateReplies } from './services/geminiService';
import { Sparkles, Crown } from 'lucide-react';
import { userService } from './services/userService';
import { auth, isFirebaseSetup } from './services/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const HeroSection: React.FC<{ isPremium?: boolean }> = ({ isPremium }) => (
  <div className="flex flex-col items-center justify-center py-6 lg:py-10 text-center space-y-6">
    <div className="p-6 bg-white rounded-full shadow-lg shadow-pink-100 border border-pink-50 transform hover:scale-105 transition-transform duration-300 relative">
      <Logo className="w-24 h-24 md:w-32 md:h-32" />
      {isPremium && (
        <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-2 rounded-full shadow-lg">
          <Crown size={20} />
        </div>
      )}
    </div>
    <div className="space-y-3 max-w-lg mx-auto">
      {isPremium ? (
        <div className="bg-pink-500/10 text-pink-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-2 border border-pink-500/20">
          Sway Premium Member
        </div>
      ) : null}
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
        Reply with <span className="bg-gradient-to-r from-pink-300 via-rose-500 to-red-500 bg-clip-text text-transparent">Confidence</span>
      </h1>
      <p className="text-base md:text-lg text-gray-500 leading-relaxed">
        {isPremium ? "Welcome back, Premium User! You have 50 daily credits." : "Say Hey! Because You Have Sway . Your Personalised AI Dating Assistant"}
      </p>
    </div>
  </div>
);

// --- LocalStorage helpers ---
const saveToStorage = (key: string, data: any) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
};
const loadFromStorage = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const App: React.FC = () => {
  // --- State (restore from localStorage on mount) ---
  const [user, setUser] = useState<User | null>(() => loadFromStorage<User>('sway_user'));
  const [authLoading, setAuthLoading] = useState(true);
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

  const [result, setResult] = useState<GeneratedResponse | null>(() => loadFromStorage<GeneratedResponse>('sway_replies'));
  const [currentReplyIndex, setCurrentReplyIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Persist user & replies to localStorage ---
  useEffect(() => {
    if (user) saveToStorage('sway_user', user);
    else localStorage.removeItem('sway_user');
  }, [user]);

  useEffect(() => {
    if (result) saveToStorage('sway_replies', result);
    else localStorage.removeItem('sway_replies');
  }, [result]);

  // --- Effects ---
  useEffect(() => {
    if (!isFirebaseSetup || !auth) {
      setAuthLoading(false);
      return;
    }

    let resolved = false;
    const resolve = () => {
      if (!resolved) {
        resolved = true;
        setAuthLoading(false);
      }
    };

    // Safety timeout — never stay stuck on loading screen
    const timeout = setTimeout(resolve, 3000);

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser?.email) {
            const swayUser = await userService.getUser(firebaseUser.email);
            setUser(swayUser);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Auth state check error:", err);
          setUser(null);
        }
        resolve();
      }, (error) => {
        console.error("onAuthStateChanged error:", error);
        resolve();
      });

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    } catch (err) {
      console.error("Firebase auth listener failed:", err);
      resolve();
      return () => clearTimeout(timeout);
    }
  }, []);

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
    if (user.credits <= 0) {
      setShowPremiumModal(true);
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setCurrentReplyIndex(0);

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

      // Deduct credit locally (instant UI update)
      const newCredits = Math.max(0, user.credits - 1);
      setUser({ ...user, credits: newCredits });

      // Sync to Firestore in background (non-blocking)
      userService.deductCredit(user.email).catch(() => { });

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    const updatedUser = await userService.upgradeUser(user.email);
    setUser(updatedUser);
    setShowPremiumModal(false);
  };

  const handleLogout = async () => {
    if (isFirebaseSetup && auth) {
      await signOut(auth);
    }
    setUser(null);
    setResult(null);
    localStorage.removeItem('sway_user');
    localStorage.removeItem('sway_replies');
  };

  const handleGhostingClick = () => {
    if (user?.isPremium) {
      setShowGhostingModal(true);
    } else {
      setShowPremiumModal(true);
    }
  };

  const handleConflictClick = () => {
    if (user?.isPremium) {
      setShowConflictModal(true);
    } else {
      setShowPremiumModal(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Logo className="w-20 h-20 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  const FREE_CREDITS = 10;
  const PREMIUM_CREDITS = 50;

  return (
    <div className="min-h-screen pb-24 bg-[#fafafa]">
      <SiteHeader
        credits={{ remaining: user.credits, isPremium: user.isPremium }}
        onOpenPremium={() => setShowPremiumModal(true)}
        onOpenGhosting={handleGhostingClick}
        onOpenConflict={handleConflictClick}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8">

        <div className="lg:hidden mb-6">
          <HeroSection isPremium={user.isPremium} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* LEFT COLUMN: Input Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <InputSection
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
            <div className="hidden lg:block">
              <HeroSection isPremium={user.isPremium} />
            </div>

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
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-semibold text-gray-900">Suggested Replies</h3>
                    <span className="text-xs text-gray-400 font-medium">
                      {currentReplyIndex + 1} of {result.replies.length}
                    </span>
                  </div>

                  <div className="relative">
                    {result.replies[currentReplyIndex] ? (
                      <SwipeableReplyCard
                        key={result.replies[currentReplyIndex].id}
                        reply={result.replies[currentReplyIndex]}
                        onNext={() => {
                          if (currentReplyIndex < result.replies.length - 1) {
                            setCurrentReplyIndex(currentReplyIndex + 1);
                          } else {
                            // Reset or show finished state
                            setResult(null);
                          }
                        }}
                      />
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-400 italic">
                        No more replies. Generate again!
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center pt-8">
                  <button
                    onClick={handleGenerate}
                    className="text-sm font-medium text-gray-500 hover:text-pink-600 underline underline-offset-4"
                  >
                    Generate a fresh batch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-12"></div>
      </main>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
        isPremium={user.isPremium}
      />

      {showGhostingModal && (
        <GhostingRecovery onClose={() => setShowGhostingModal(false)} />
      )}

      {showConflictModal && (
        <ConflictResolutionModal onClose={() => setShowConflictModal(false)} />
      )}

      <CreditsBar
        credits={user.credits}
        maxCredits={user.isPremium ? PREMIUM_CREDITS : FREE_CREDITS}
        isPremium={user.isPremium}
        onUpgrade={() => setShowPremiumModal(true)}
      />
    </div>
  );
};

export default App;
