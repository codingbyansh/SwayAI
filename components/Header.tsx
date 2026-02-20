
import React from 'react';
import { Star, Ghost, HeartHandshake, LogOut, User as UserIcon } from 'lucide-react';
import { UserCredits, User } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  credits: UserCredits;
  onOpenPremium: () => void;
  onOpenGhosting: () => void;
  onOpenConflict: () => void;
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ credits, onOpenPremium, onOpenGhosting, onOpenConflict, user, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg">
            <Logo className="w-9 h-9" />
          </div>
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent hidden sm:block">
            SWAY
          </span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Conflict Resolution Button */}
          <button 
            onClick={onOpenConflict}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
            title="Conflict Resolution"
          >
            <HeartHandshake size={16} />
            <span className="text-xs font-semibold">Talk It Out</span>
          </button>
          
          <button 
            onClick={onOpenConflict}
            className="md:hidden w-9 h-9 rounded-full border border-teal-200 flex items-center justify-center bg-teal-50 text-teal-700"
            title="Conflict Resolution"
          >
            <HeartHandshake size={18} />
          </button>

          {/* Ghosting Recovery Button */}
          <button 
            onClick={onOpenGhosting}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-black flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-colors shadow-sm group relative"
            title="Ghosting Recovery Tool"
          >
            <Ghost size={20} strokeWidth={2} />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>

          <button 
            onClick={onOpenPremium}
            className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 px-3 py-1.5 rounded-full hover:border-pink-200 transition-colors"
          >
            {credits.isPremium ? (
               <>
                 <Star size={14} className="text-yellow-500 fill-yellow-500" />
                 <span className="text-xs font-semibold text-gray-700">PREMIUM</span>
               </>
            ) : (
              <>
                <span className={`text-xs font-medium ${credits.remaining < 3 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                  {credits.remaining} free
                </span>
                <div className="w-px h-3 bg-gray-300 mx-1"></div>
                <span className="text-xs font-bold text-pink-600">UPGRADE</span>
              </>
            )}
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-xs font-bold text-gray-900">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
