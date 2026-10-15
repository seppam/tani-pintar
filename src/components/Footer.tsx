import React from 'react';
import { Sprout, Heart, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  language: Language;
}

export const Footer = React.memo<FooterProps>(function Footer({ language }) {
  return (
    <footer className="border-t border-stone-200 bg-white/70 py-6 mt-12 text-center text-xs text-stone-500">
      <div className="max-w-4xl mx-auto px-4 space-y-2">
        <div className="flex items-center justify-center gap-1.5 font-bold text-stone-800">
          <Sprout className="w-4 h-4 text-emerald-700" />
          <span>Tani Pintar</span>
          <span className="text-stone-400 font-normal">|</span>
          <span className="font-normal text-stone-600">
            {language === 'id' ? 'Sahabat Petani Nusantara' : 'Smallholder Farmer Companion'}
          </span>
        </div>
        <p className="text-[11px] text-stone-500 max-w-md mx-auto leading-relaxed">
          {language === 'id'
            ? 'Didukung arsitektur multi-agen cerdas dengan pemantauan mikroklimat Open-Meteo & kepatuhan standar Penyuluh Pertanian Lapangan (PPL).'
            : 'Powered by multi-agent reasoning, Open-Meteo microclimate forecasting, and agricultural extension compliance.'}
        </p>
        <div className="text-[10px] text-stone-400 pt-1">
          © {new Date().getFullYear()} Tani Pintar. {language === 'id' ? 'Dibuat untuk kedaulatan pangan petani.' : 'Built for farmer prosperity.'}
        </div>
      </div>
    </footer>
  );
});
