import React from 'react';
import { Flame, Star } from 'lucide-react';
import { UserCredits } from '../types';

interface HeaderProps {
  credits: UserCredits;
  onOpenPremium: () => void;
}

const Header: React.FC<HeaderProps> = ({ credits, onOpenPremium }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-sway-500 p-1.5 rounded-lg text-white">
            <Flame size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">SWAY</span>
        </div>
        
        <button 
          onClick={onOpenPremium}
          className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 px-3 py-1.5 rounded-full hover:border-sway-200 transition-colors"
        >
          {credits.isPremium ? (
             <>
               <Star size={14} className="text-yellow-500 fill-yellow-500" />
               <span className="text-xs font-semibold text-gray-700">PREMIUM</span>
             </>
          ) : (
            <>
              <span className="text-xs font-medium text-gray-600">
                {credits.remaining} free replies
              </span>
              <div className="w-px h-3 bg-gray-300 mx-1"></div>
              <span className="text-xs font-bold text-sway-600">UPGRADE</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;