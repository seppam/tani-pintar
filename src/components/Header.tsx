import React from 'react';
import { Sprout, Globe, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onReset?: () => void;
}

export const Header = React.memo<HeaderProps>(function Header({
  language,
  onLanguageChange,
  onReset,
}) {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white border-b border-emerald-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          onClick={onReset}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 p-0.5 shadow-md flex items-center justify-center transform transition group-hover:scale-105">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                Tani Pintar
              </span>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                4-Agent
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 hidden sm:block">
              {language === 'id' ? 'Penasihat Kesehatan Tanaman Petani' : 'Crop Health Advisor for Smallholders'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-emerald-950/80 rounded-lg p-1 border border-emerald-700/60 shadow-inner">
            <button
              type="button"
              onClick={() => onLanguageChange('id')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                language === 'id'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Bahasa Indonesia"
            >
              <span>🇮🇩</span>
              <span className="text-[11px]">ID</span>
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="English"
            >
              <span>🇬🇧</span>
              <span className="text-[11px]">EN</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-200/70 bg-emerald-800/40 px-2.5 py-1 rounded-md border border-emerald-700/40">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            <span>PPL Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
});
