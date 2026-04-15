import React from 'react';
import { motion } from 'motion/react';
import { type Language } from '../translations';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: (lang: Language) => void;
}

export function LanguageToggle({ currentLang, onToggle }: LanguageToggleProps) {
  return (
    <div className="relative bg-gray-100 p-1 rounded-full flex items-center w-32 h-10 shadow-inner">
      {/* Sliding background */}
      <motion.div
        className="absolute h-8 w-[60px] bg-white rounded-full shadow-sm"
        initial={false}
        animate={{
          x: currentLang === 'en' ? 0 : 60,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      <button
        onClick={() => onToggle('en')}
        className={`relative z-10 flex-1 text-xs font-bold transition-colors duration-200 ${
          currentLang === 'en' ? 'text-emerald-700' : 'text-gray-500'
        }`}
      >
        EN
      </button>
      
      <button
        onClick={() => onToggle('id')}
        className={`relative z-10 flex-1 text-xs font-bold transition-colors duration-200 ${
          currentLang === 'id' ? 'text-emerald-700' : 'text-gray-500'
        }`}
      >
        ID
      </button>
    </div>
  );
}
