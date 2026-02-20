import React, { useState } from 'react';
import { X, Check, Star, Zap, Shield, QrCode } from 'lucide-react';
import Button from './Button';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isPremium: boolean;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade, isPremium }) => {
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    setShowQR(true);
  };

  const handleConfirmPayment = () => {
    // In a real app, we would verify the transaction ID here
    onUpgrade();
    setShowQR(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header Image/Gradient */}
        <div className="h-32 bg-gradient-to-br from-sway-400 to-sway-600 relative flex items-center justify-center overflow-hidden shrink-0">
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
          {isPremium ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You are using Premium Sway</h2>
                <p className="text-gray-500">Enjoy unlimited replies and advanced features.</p>
              </div>
              <Button 
                fullWidth 
                onClick={onClose}
                className="bg-gray-900 shadow-lg"
              >
                Continue
              </Button>
            </div>
          ) : !showQR ? (
            <>
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
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-sway-500 to-sway-600 shadow-xl shadow-sway-200"
              >
                Get Premium for ₹99/mo
              </Button>
              <p className="text-[10px] text-gray-400 text-center mt-4">
                Recurring billing. Cancel anytime.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">Scan to Pay</h3>
                <p className="text-sm text-gray-500">Pay ₹99 via any UPI App</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm relative group">
                 {/* Placeholder for QR Code - User should replace this image */}
                 <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden relative">
                    <img 
                      src="/payment-qr.png" 
                      alt="Payment QR Code" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback if image not found
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-gray-200');
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ display: 'none' }}> {/* Hide fallback icon if image loads */}
                       <QrCode size={48} className="text-gray-400" />
                    </div>
                 </div>
                 <p className="text-xs text-center mt-2 text-gray-400 font-mono">UPI: 9625841121@ptyes</p>
              </div>

              <div className="w-full space-y-3">
                <Button 
                  fullWidth 
                  onClick={handleConfirmPayment}
                  className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                >
                  I have made the payment
                </Button>
                <button 
                  onClick={() => setShowQR(false)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;