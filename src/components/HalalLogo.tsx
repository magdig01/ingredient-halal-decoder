import React from 'react';

export function HalalLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#059669" />
      <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="2" />
      <text 
        x="50" 
        y="58" 
        fill="white" 
        fontSize="36" 
        fontWeight="bold" 
        textAnchor="middle" 
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        حلال
      </text>
      <text 
        x="50" 
        y="80" 
        fill="white" 
        fontSize="14" 
        fontWeight="bold" 
        textAnchor="middle" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        letterSpacing="2"
      >
        HALAL
      </text>
    </svg>
  );
}
