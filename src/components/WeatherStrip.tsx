import React from 'react';
import {
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  AlertOctagon,
  CheckCircle,
  MapPin,
  ExternalLink,
  Calendar,
  Globe,
} from 'lucide-react';
import { ContextResult, Language } from '../types';
import { translations } from '../i18n/translations';

interface WeatherStripProps {
  context: ContextResult;
  language: Language;
}

function getRiskBadge(level: 'low' | 'moderate' | 'high' | 'severe', t: typeof translations[Language]) {
  switch (level) {
    case 'severe':
      return {
        label: t.riskSevere,
        bg: 'bg-red-600 text-white',
        border: 'border-red-700',
        textColor: 'text-red-700',
      };
    case 'high':
      return {
        label: t.riskHigh,
        bg: 'bg-red-100 text-red-800',
        border: 'border-red-300',
        textColor: 'text-red-700',
      };
    case 'moderate':
      return {
        label: t.riskModerate,
        bg: 'bg-amber-100 text-amber-800',
        border: 'border-amber-300',
        textColor: 'text-amber-700',
      };
    default:
      return {
        label: t.riskLow,
        bg: 'bg-emerald-100 text-emerald-800',
        border: 'border-emerald-300',
        textColor: 'text-emerald-700',
      };
  }
}

const WeatherStripComponent: React.FC<WeatherStripProps> = ({ context, language }) => {
  const t = translations[language];
  const { weather, diseaseRiskLevel, diseaseRiskFactors, microclimateSummary, regionalAgroAdvisory, groundingSources } = context;
  const risk = getRiskBadge(diseaseRiskLevel, t);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">{t.weatherHeader}</h3>
            <p className="text-[11px] text-stone-500">Agent 2: Context & Open-Meteo API</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-stone-900">
            {weather?.locationName || (language === 'id' ? 'Lokasi Lahan' : 'Field Location')}
          </span>
        </div>
      </div>

      {/* Main Metric Cards Grid or Fallback if Weather is null */}
      {weather ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Temperature */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-500 font-medium truncate">{t.temperature}</div>
              <div className="text-base font-extrabold text-stone-900">{weather.temperature}°C</div>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-500 font-medium truncate">{t.humidity}</div>
              <div className="text-base font-extrabold text-stone-900">{weather.relativeHumidity}%</div>
            </div>
          </div>

          {/* Precipitation */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-500 font-medium truncate">{t.rainfall}</div>
              <div className="text-base font-extrabold text-stone-900">{weather.precipitation} mm</div>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-500 font-medium truncate">{t.wind}</div>
              <div className="text-base font-extrabold text-stone-900">{weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-stone-400" />
          <span>
            {language === 'id'
              ? 'Data sensor cuaca Open-Meteo sedang tidak dapat dijangkau. Evaluasi risiko menggunakan estimasi iklim tropis lokal.'
              : 'Live Open-Meteo weather data was unavailable. Risk evaluation conducted using typical regional agroclimate estimates.'}
          </span>
        </div>
      )}

      {/* Disease Risk Index Alert Box */}
      <div className={`rounded-xl p-3.5 border ${risk.border} bg-stone-50/70 space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className={`w-4 h-4 ${risk.textColor}`} />
            <span className="text-xs font-bold text-stone-800">{t.diseaseRisk}:</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${risk.bg}`}>
            {risk.label}
          </span>
        </div>

        {diseaseRiskFactors && diseaseRiskFactors.length > 0 && (
          <ul className="text-xs text-stone-700 space-y-1 pl-1">
            {diseaseRiskFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Microclimate Summary */}
      {microclimateSummary && (
        <div className="text-xs text-stone-700 leading-relaxed bg-sky-50/50 p-3 rounded-xl border border-sky-100">
          <span className="font-bold text-sky-900 block mb-0.5">
            {language === 'id' ? 'Evaluasi Mikroklimat Cuaca:' : 'Microclimate Assessment:'}
          </span>
          {microclimateSummary}
        </div>
      )}

      {/* Regional Agronomic Advisory */}
      {regionalAgroAdvisory && (
        <div className="text-xs text-stone-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80">
          <span className="font-bold text-emerald-900 block mb-0.5">
            {t.regionalContext}:
          </span>
          {regionalAgroAdvisory}
        </div>
      )}

      {/* Verified Google Search Grounding Sources */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200/80 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-sky-900">
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {language === 'id'
                ? 'Sumber Agronomi Regional (Google Search):'
                : 'Regional Agronomic Sources (Google Search):'}
            </span>
          </div>
          <ul className="space-y-1 pl-1">
            {groundingSources.map((source, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                <ExternalLink className="w-3 h-3 text-sky-500 flex-shrink-0" />
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-sky-900 underline truncate hover:font-medium transition-colors"
                >
                  {source.title || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3-day forecast trend strip */}
      {weather?.forecast && weather.forecast.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-600 mb-2">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>{language === 'id' ? 'Prakiraan Cuaca 3 Hari (Open-Meteo):' : '3-Day Agro Forecast (Open-Meteo):'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.map((fc, i) => (
              <div
                key={i}
                className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-center space-y-1"
              >
                <div className="text-[10px] font-bold text-stone-700 uppercase">{fc.day}</div>
                <div className="text-xs font-extrabold text-stone-900">{fc.tempMax}° / {fc.tempMin}°</div>
                <div className="text-[10px] text-sky-700 font-semibold flex items-center justify-center gap-0.5">
                  <Droplets className="w-2.5 h-2.5" />
                  {fc.rainProb}% hujan
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const WeatherStrip = React.memo(WeatherStripComponent);

