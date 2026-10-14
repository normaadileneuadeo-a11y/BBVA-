import React from 'react';

interface BBVALogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

export const BBVALogo: React.FC<BBVALogoProps> = ({ 
  className = '', 
  size = 'md',
  color = '#ffffff'
}) => {
  const heights = {
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
    xl: 'h-12'
  };

  return (
    <svg 
      viewBox="0 0 380 90" 
      className={`${heights[size]} w-auto ${className}`}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* First B */}
      <path d="M 0 0 L 48 0 C 74 0 88 10 88 30 C 88 41 81 51 68 58 C 84 65 92 76 92 95 C 92 118 76 130 48 130 L 0 130 Z M 26 24 L 26 50 L 45 50 C 56 50 62 45 62 37 C 62 29 56 24 45 24 Z M 26 74 L 26 106 L 47 106 C 59 106 66 100 66 90 C 66 80 59 74 47 74 Z" transform="scale(0.68)"/>
      
      {/* Second B */}
      <path d="M 104 0 L 152 0 C 178 0 192 10 192 30 C 192 41 185 51 172 58 C 188 65 196 76 196 95 C 196 118 180 130 152 130 L 104 130 Z M 130 24 L 130 50 L 149 50 C 160 50 166 45 166 37 C 166 29 160 24 149 24 Z M 130 74 L 130 106 L 151 106 C 163 106 170 100 170 90 C 170 80 163 74 151 74 Z" transform="scale(0.68)"/>
      
      {/* V */}
      <path d="M 210 0 L 240 0 L 268 95 L 296 0 L 326 0 L 284 130 L 252 130 Z" transform="scale(0.68)"/>
      
      {/* A (BBVA iconic apex without crossbar) */}
      <path d="M 336 130 L 372 0 L 404 0 L 440 130 L 412 130 L 403 98 L 373 98 L 364 130 Z M 378 74 L 398 74 L 388 34 Z" transform="scale(0.68)"/>
    </svg>
  );
};
