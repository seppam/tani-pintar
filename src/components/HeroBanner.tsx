import React from 'react';
import { Sprout } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HeroBannerProps {
  language: Language;
}

export const HeroBanner = React.memo<HeroBannerProps>(function HeroBanner({ language }) {
  const t = translations[language];

  return (
    <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-stone-900 text-white rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden">
      <div className="relative z-10 space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 bg-lime-400/20 text-lime-300 border border-lime-400/30 text-xs font-semibold px-2.5 py-1 rounded-full">
          <Sprout className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'Sistem Diagnostik Tanaman Cerdas' : 'Smart Plant Diagnostic System'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
          {t.tagline}
        </h1>
        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Decorative agricultural leaf ambient pattern */}
      <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none select-none">
        <Sprout className="w-64 h-64 text-lime-300" />
      </div>
    </div>
  );
});
