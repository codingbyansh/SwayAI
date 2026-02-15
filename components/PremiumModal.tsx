import React from 'react';
import { X, Check, Star, Zap, Shield } from 'lucide-react';
import Button from './Button';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header Image/Gradient */}
        <div className="h-32 bg-gradient-to-br from-sway-400 to-sway-600 relative flex items-center justify-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
             <div className="w-64 h-64 bg-white rounded-full blur-3xl absolute -top-10 -left-10 mix-blend-overlay"></div>
             <div className="w-64 h-64 bg-purple-500 rounded-full blur-3xl absolute -bottom-10 -right-10 mix-blend-overlay"></div>
          </div>
          <Star size={48} className="text-white drop-shadow-md relative z-10" fill="currentColor" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 text-white p-1 rounded-full hover:bg-black/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Unlock Sway Premium</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">Master the dating game with unlimited power.</p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-1 rounded-full mt-0.5">
                <Check size={14} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Unlimited Replies</h3>
                <p className="text-xs text-gray-500">Never run out of witty responses.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
               <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                <Zap size={14} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Faster Generation</h3>
                <p className="text-xs text-gray-500">Skip the queue, get replies instantly.</p>
              </div>
            </div>
             <div className="flex items-start space-x-3">
               <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                <Shield size={14} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Advanced Context</h3>
                <p className="text-xs text-gray-500">Deeper analysis of screenshots.</p>
              </div>
            </div>
          </div>

          <Button 
            fullWidth 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-sway-500 to-sway-600 shadow-xl shadow-sway-200"
          >
            Get Premium for ₹299/mo
          </Button>
          <p className="text-[10px] text-gray-400 text-center mt-4">
            Recurring billing. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;