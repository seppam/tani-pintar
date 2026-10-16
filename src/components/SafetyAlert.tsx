import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckSquare,
  Clock,
  Droplet,
  Info,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SafetyCheckResult, Language } from '../types';
import { translations } from '../i18n/translations';

interface SafetyAlertProps {
  safety: SafetyCheckResult;
  language: Language;
}

const SafetyAlertComponent: React.FC<SafetyAlertProps> = ({ safety, language }) => {
  const t = translations[language];

  return (
    <div className="space-y-4">
      {/* Prominent Warning Container if warningRequired is true */}
      {safety.warningRequired ? (
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-400 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Agent 4: Safety & PPL Checker
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-amber-950">
                {t.safetyWarning}
              </h3>
            </div>
          </div>

          {/* Core Warning Reasons */}
          <div className="space-y-2">
            {safety.confidenceTooLow && (
              <div className="p-3 bg-red-100/90 text-red-900 border border-red-300 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{t.lowConfidenceNotice}</span>
              </div>
            )}

            {safety.containsChemicals && (
              <div className="p-3 bg-amber-100/90 text-amber-900 border border-amber-300 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>{t.chemicalWarning}</span>
              </div>
            )}
          </div>

          {/* Extension Officer (PPL) Advisory */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-300/80 text-xs text-amber-950 space-y-1.5 shadow-xs">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                {language === 'id' ? 'Mandat Konsultasi PPL Resmi:' : 'Mandatory Extension Officer Advisory:'}
              </span>
            </div>
            <p className="leading-relaxed">
              {safety.extensionOfficerAdvisory || t.pplConsultationNotice}
            </p>
          </div>

          {/* Mandatory Critical Notice: Never give dosage without warning */}
          <div className="bg-stone-900 text-amber-200 text-xs font-semibold p-3 rounded-xl border border-stone-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              {safety.criticalNotice || (language === 'id'
                ? 'DILARANG menerapkan dosis bahan kimia tanpa surat rekomendasi atau arahan langsung petugas PPL resmi.'
                : 'NEVER apply chemical dosages without verified advisory from an authorized agricultural extension officer.')}
            </span>
          </div>

          {/* PPE & Application Precautions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* PPE Checklist */}
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.ppeChecklistTitle}</span>
              </div>
              <ul className="space-y-1 text-stone-700 pl-1">
                {(safety.ppeRequired && safety.ppeRequired.length > 0 ? safety.ppeRequired : [
                  t.maskRequirement,
                  t.glovesRequirement,
                  t.bootsRequirement,
                ]).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Spray Timing & PHI */}
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'id' ? 'Panduan Waktu & Panen:' : 'Application & PHI Guidelines:'}</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {t.sprayTimingGuidance}
              </p>
              {safety.preHarvestIntervalDays && (
                <div className="text-[11px] font-bold text-amber-900 bg-amber-100/60 px-2 py-1 rounded-md">
                  {t.phiNotice} {safety.preHarvestIntervalDays} {t.daysBeforeHarvest}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Standard Verified Safety Card
        <div className="bg-emerald-50 rounded-2xl border border-emerald-300 p-4 sm:p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-emerald-950">
                {language === 'id' ? 'Verifikasi Keamanan: Disetujui' : 'Safety Verification: Approved'}
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                100% Organik & Aman
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {language === 'id'
                ? 'Rencana tindakan sepenuhnya menggunakan bahan alami dan ramah lingkungan. Tetap gunakan masker dan sarung tangan standar saat menyemprot pestisida nabati.'
                : 'The action plan strictly employs organic, non-hazardous cultural controls. Standard particulate mask and gloves recommended during botanical spraying.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const SafetyAlert = React.memo(SafetyAlertComponent);

