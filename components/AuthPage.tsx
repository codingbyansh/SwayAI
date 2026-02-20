import React, { useState } from 'react';
import { Logo } from './Logo';
import Button from './Button';
import { Eye, EyeOff, Calendar, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { userService } from '../services/userService';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Basic Validation
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields.');
      }

      if (mode === 'signup') {
        if (!formData.name) throw new Error('Name is required.');
        if (!formData.dob) throw new Error('Date of birth is required.');
        
        const age = calculateAge(formData.dob);
        if (age < 18) {
          throw new Error('You must be at least 18 years old to use Sway.');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use userService to login/signup
      const user = userService.login(formData.email, formData.name);
      
      onLogin(user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // In a real app, this would redirect to Google OAuth
    // For this demo, we'll simulate a click and show an alert if not configured
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      // If no client ID, we'll just mock login for the preview experience
      // but warn the developer in console
      console.warn('VITE_GOOGLE_CLIENT_ID not set. Mocking Google Login.');
      setIsLoading(true);
      setTimeout(() => {
        const user = userService.login('user@gmail.com', 'Google User');
        onLogin(user);
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Real implementation would go here
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${window.location.origin}&response_type=token&scope=email profile`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-50 rounded-full">
              <Logo className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-gray-500">
            {mode === 'login' 
              ? 'Enter your details to access your account' 
              : 'Start your journey to better conversations'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 ml-1">You must be 18+ to use this app.</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <Button 
            fullWidth 
            type="submit"
            isLoading={isLoading}
            className="h-12 text-lg shadow-lg shadow-pink-200"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
            {!isLoading && <ArrowRight size={20} className="ml-2" />}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setFormData({ name: '', email: '', password: '', dob: '' });
              }}
              className="font-medium text-pink-600 hover:text-pink-500"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
