
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <img 
      src="/logo.png" 
      alt="Sway Logo" 
      className={className}
    />
  );
};

export default Logo;
