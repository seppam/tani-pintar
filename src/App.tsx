/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { PhotoUploader } from './components/PhotoUploader';
import { PipelineProgress } from './components/PipelineProgress';
import { DiagnosisCard } from './components/DiagnosisCard';
import { WeatherStrip } from './components/WeatherStrip';
import { ActionPlanTimeline } from './components/ActionPlanTimeline';
import { SafetyAlert } from './components/SafetyAlert';
import { AgentTraceModal } from './components/AgentTraceModal';
import { Footer } from './components/Footer';
import { Language, FullAnalysisResponse, AgentTraceStep } from './types';
import { translations } from './i18n/translations';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { runCropHealthPipeline } from './services/geminiPipeline';

export default function App() {
  const [language, setLanguage] = useState<Language>('id');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveTrace, setLiveTrace] = useState<AgentTraceStep[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setErrorMessage(null);
    setLiveTrace([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnalyze = useCallback(
    async (payload: {
      imageBase64: string;
      mimeType: string;
      cropType: string;
      location: string;
      coordinates?: { lat: number; lon: number };
      farmerNote: string;
    }) => {
      setIsLoading(true);
      setErrorMessage(null);
      setAnalysisResult(null);
      setLiveTrace([]);

      try {
        const data = await runCropHealthPipeline(
          {
            ...payload,
            language,
          },
          (traceUpdate) => {
            // Only update trace state - do NOT auto-scroll here to prevent jumping
            setLiveTrace(traceUpdate);
          }
        );

        setAnalysisResult(data);
        setLiveTrace(data.trace);

        // Scroll once to the result at the very end
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } catch (err: unknown) {
        console.error('Diagnosis failed:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error during analysis';
        setErrorMessage(
          language === 'id'
            ? `Gagal menganalisis tanaman: ${msg}`
            : `Crop analysis failed: ${msg}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [language]
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onReset={handleReset}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Hero Banner for Farmers (Memoized) */}
        <HeroBanner language={language} />

        {/* Error Notification */}
        {errorMessage && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-800 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold block mb-0.5">
                  {language === 'id' ? 'Terjadi Masalah:' : 'Notice:'}
                </span>
                <span>{errorMessage}</span>
              </div>
            </div>

            {liveTrace.length > 0 && (
              <AgentTraceModal
                trace={liveTrace}
                overallDurationMs={0}
                language={language}
              />
            )}
          </div>
        )}

        {/* Upload Form (Memoized) */}
        <PhotoUploader
          language={language}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />

        {/* Persistent Results Container with reserved min-height */}
        <div
          ref={resultsRef}
          className={
            isLoading || analysisResult || liveTrace.length > 0
              ? 'min-h-[440px] space-y-6 pt-2'
              : 'min-h-0'
          }
        >
          {/* Pipeline Multi-Agent Progress during loading */}
          {isLoading && (
            <PipelineProgress language={language} trace={liveTrace} />
          )}

          {/* Results Section */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Results Header Action Bar */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    {language === 'id' ? 'Hasil Analisis Lengkap' : 'Complete Analysis Report'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'id'
                      ? '4 Agen selesai bekerja dalam ' + analysisResult.overallDurationMs + ' ms'
                      : '4 Agents completed execution in ' + analysisResult.overallDurationMs + ' ms'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetButton}</span>
                </button>
              </div>

              {/* Agent 1: Diagnosis Card */}
              <DiagnosisCard
                vision={analysisResult.vision}
                language={language}
              />

              {/* Agent 2: Weather & Microclimate Strip */}
              <WeatherStrip
                context={analysisResult.context}
                language={language}
              />

              {/* Agent 3: Action Plan Timeline (Prioritizing Low-Cost & Organic) */}
              <ActionPlanTimeline
                planner={analysisResult.planner}
                language={language}
              />

              {/* Agent 4: Safety & PPL Verification Alert */}
              <SafetyAlert
                safety={analysisResult.safety}
                language={language}
              />

              {/* Collapsible Agent Trace Panel */}
              <AgentTraceModal
                trace={analysisResult.trace}
                overallDurationMs={analysisResult.overallDurationMs}
                language={language}
              />
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
