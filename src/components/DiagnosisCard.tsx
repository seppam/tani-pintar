import React from 'react';
import { Stethoscope, AlertTriangle, CheckCircle2, Info, ChevronRight, Activity } from 'lucide-react';
import { VisionDiagnosisResult, Language } from '../types';
import { translations } from '../i18n/translations';

interface DiagnosisCardProps {
  vision: VisionDiagnosisResult;
  language: Language;
}

function getSeverityBadge(sev: 'low' | 'medium' | 'high', t: typeof translations[Language]) {
  switch (sev) {
    case 'high':
      return {
        label: t.severityHigh,
        bg: 'bg-red-100 text-red-800 border-red-200',
      };
    case 'medium':
      return {
        label: t.severityMedium,
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    default:
      return {
        label: t.severityLow,
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
  }
}

const DiagnosisCardComponent: React.FC<DiagnosisCardProps> = ({ vision, language }) => {
  const t = translations[language];
  const primaryConfidencePct = Math.round((vision.overallConfidence || 0) * 100);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">{t.diagnosisHeader}</h3>
            <p className="text-[11px] text-stone-500">Agent 1: Vision Diagnostician</p>
          </div>
        </div>

        {/* Identified Crop Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {vision.isHealthy && (
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'id' ? 'Tanaman Sehat' : 'Healthy Plant'}</span>
            </span>
          )}

          {vision.image_quality && vision.image_quality !== 'good' && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {vision.image_quality === 'not_a_plant'
                  ? (language === 'id' ? 'Bukan Tanaman' : 'Not a Plant')
                  : (language === 'id' ? 'Foto Buram' : 'Poor Quality')}
              </span>
            </span>
          )}

          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="text-emerald-600 font-normal">{t.identifiedCrop}:</span>
            <span>{vision.crop}</span>
            {vision.cropScientificName && (
              <span className="text-[10px] text-emerald-700 italic font-mono hidden sm:inline">
                ({vision.cropScientificName})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Diagnosis Box */}
      <div className="bg-gradient-to-br from-emerald-50/80 to-lime-50/50 rounded-xl p-4 border border-emerald-200/90 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-800">
            {t.primaryDiagnosis}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-emerald-950">
              {primaryConfidencePct}%
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              ({t.confidenceScore})
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug">
            {vision.primaryDiagnosis}
          </h4>
          {vision.primaryScientificName && (
            <p className="text-xs text-stone-600 italic font-mono mt-0.5">
              Patogen: {vision.primaryScientificName}
            </p>
          )}
        </div>

        {/* Primary Confidence Bar */}
        <div className="space-y-1">
          <div className="w-full bg-emerald-200/60 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                primaryConfidencePct >= 75
                  ? 'bg-emerald-600'
                  : primaryConfidencePct >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, primaryConfidencePct))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-500">
            <span>0%</span>
            <span className="font-semibold text-emerald-800">
              {primaryConfidencePct >= 60
                ? (language === 'id' ? 'Keyakinan Tinggi (Aman)' : 'High Confidence')
                : (language === 'id' ? 'Keyakinan Rendah (<60%)' : 'Low Confidence (<60%)')}
            </span>
            <span>100%</span>
          </div>
        </div>

        {vision.reasoning && (
          <p className="text-xs text-stone-700 bg-white/70 p-2.5 rounded-lg border border-emerald-100/80 leading-relaxed">
            {vision.reasoning}
          </p>
        )}
      </div>

      {/* Top 3 Likely Problems Differential List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          {t.topProblemsTitle}
        </h4>

        <div className="space-y-2.5">
          {vision.issues?.map((issue, idx) => {
            const sev = getSeverityBadge(issue.severity, t);
            const confPct = Math.round(issue.confidence * 100);

            return (
              <div
                key={idx}
                className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-2 hover:border-stone-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-xs text-stone-900 truncate">
                        {issue.name}
                      </span>
                      {issue.scientificName && (
                        <span className="text-[10px] text-stone-500 italic font-mono hidden sm:inline">
                          ({issue.scientificName})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sev.bg}`}>
                      {sev.label}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      {confPct}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      confPct >= 70
                        ? 'bg-emerald-600'
                        : confPct >= 40
                        ? 'bg-amber-500'
                        : 'bg-stone-400'
                    }`}
                    style={{ width: `${confPct}%` }}
                  />
                </div>

                {/* Symptoms / description */}
                {issue.symptoms && issue.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {issue.symptoms.map((sym, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] bg-white text-stone-600 px-2 py-0.5 rounded-md border border-stone-200"
                      >
                        • {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Observations Tags */}
      {vision.visualObservations && vision.visualObservations.length > 0 && (
        <div className="pt-1">
          <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
            {t.visualObservations}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {vision.visualObservations.map((obs, i) => (
              <span
                key={i}
                className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                {obs}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const DiagnosisCard = React.memo(DiagnosisCardComponent);

