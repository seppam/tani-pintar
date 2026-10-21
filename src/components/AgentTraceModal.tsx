import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Terminal,
  Clock,
  Wrench,
  Copy,
  Check,
  Eye,
  CloudRain,
  CalendarCheck,
  ShieldAlert,
  Code2,
  Loader2,
  Globe,
  ExternalLink,
  Coins,
} from 'lucide-react';
import { AgentTraceStep, Language } from '../types';
import { translations } from '../i18n/translations';

function getAgentIcon(id: AgentTraceStep['agentId']) {
  switch (id) {
    case 'vision':
      return Eye;
    case 'context':
      return CloudRain;
    case 'planner':
      return CalendarCheck;
    case 'safety':
      return ShieldAlert;
    default:
      return Terminal;
  }
}

interface AgentTraceStepRowProps {
  step: AgentTraceStep;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onCopy: (id: string, text: string) => void;
  isCopied: boolean;
  language: Language;
}

const AgentTraceStepRow = React.memo(
  function AgentTraceStepRow({
    step,
    index,
    isExpanded,
    onToggleExpand,
    onCopy,
    isCopied,
    language,
  }: AgentTraceStepRowProps) {
    const t = translations[language];
    const jsonString = JSON.stringify(step.rawOutput, null, 2);

    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900/90 overflow-hidden transition-colors duration-200">
        {/* Step Header */}
        <div
          onClick={() => onToggleExpand(step.agentId)}
          className="p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-stone-800/50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-stone-800 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-stone-700">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {step.agentName}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">
                  • {step.agentRole}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Agent status badge */}
            {step.status === 'completed' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                DONE
              </span>
            )}
            {step.status === 'running' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                RUNNING
              </span>
            )}
            {step.status === 'failed' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-950 text-red-400 border border-red-800">
                FAILED
              </span>
            )}
            {step.status === 'skipped' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 border border-stone-700">
                SKIPPED
              </span>
            )}
            {step.status === 'pending' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-900 text-stone-500 border border-stone-800">
                PENDING
              </span>
            )}

            {/* Model used badge */}
            {step.modelUsed && (
              <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800">
                {step.modelUsed}
              </span>
            )}

            {/* Token usage & cost badge */}
            {step.tokenUsage && (
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800 hidden md:inline-block">
                {step.tokenUsage.totalTokens.toLocaleString()} tok • {step.tokenUsage.estimatedCostUsd !== null && step.tokenUsage.estimatedCostUsd !== undefined ? `$${step.tokenUsage.estimatedCostUsd.toFixed(5)}` : 'price n/a'}
              </span>
            )}

            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-700">
              <Clock className="w-3 h-3 text-stone-400" />
              {step.durationMs}ms
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </div>
        </div>

        {/* Step Error Notice */}
        {step.error && (
          <div className="px-4 py-2.5 bg-red-950/90 border-t border-red-800 text-xs text-red-200 font-mono space-y-1">
            <div className="font-bold text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Execution Error {step.modelUsed ? `(Model: ${step.modelUsed})` : ''}</span>
            </div>
            <div className="text-red-300 break-words leading-relaxed pl-5">
              {step.error}
            </div>
          </div>
        )}

        {/* Step Expanded Details */}
        {isExpanded && (
          <div className="p-3 sm:p-4 border-t border-stone-800/80 bg-stone-950 space-y-3 text-xs font-mono">
            {/* Thought process */}
            {step.thoughtProcess && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  {t.thoughtProcessTitle}
                </span>
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 font-sans text-xs leading-relaxed">
                  {step.thoughtProcess}
                </div>
              </div>
            )}

            {/* Token Usage & Cost Breakdown */}
            {step.tokenUsage && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    <span>Tokens & Cost</span>
                  </span>
                  <span className="text-stone-300 font-mono text-[10px]">
                    Estimated: {step.tokenUsage.estimatedCostUsd !== null && step.tokenUsage.estimatedCostUsd !== undefined
                      ? `$${step.tokenUsage.estimatedCostUsd.toFixed(5)} USD`
                      : 'price n/a'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-stone-300">
                  <div>
                    <span className="text-stone-500 block">Prompt:</span>
                    <span className="text-white font-bold">{step.tokenUsage.promptTokens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Candidates:</span>
                    <span className="text-white font-bold">{step.tokenUsage.candidatesTokens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Thoughts:</span>
                    <span className="text-white font-bold">{((step.tokenUsage.thoughtsTokens || 0)).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Total Tokens:</span>
                    <span className="text-emerald-400 font-bold">{step.tokenUsage.totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tool Invocations if any */}
            {step.toolCalls && step.toolCalls.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  {t.toolCallsTitle}
                </span>
                {step.toolCalls.map((tc, tcIdx) => (
                  <div
                    key={tcIdx}
                    className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-sky-300 font-bold">
                        tool: {tc.toolName}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400 space-y-1">
                      <div>
                        <span className="text-stone-500">input: </span>
                        <span className="text-stone-300 font-mono">
                          {JSON.stringify(tc.input)}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500">output: </span>
                        <span className="text-stone-300 font-mono">
                          {JSON.stringify(tc.output)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sources section for Context Agent or grounded steps */}
            {step.agentId === 'context' && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Sources</span>
                </span>
                {step.sources && step.sources.length > 0 ? (
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1.5">
                    {step.sources.map((src, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5 text-[11px]">
                        <ExternalLink className="w-3 h-3 text-sky-400 flex-shrink-0" />
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-300 hover:text-sky-100 underline truncate font-mono text-[10px]"
                        >
                          {src.title || src.url}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 italic font-mono">
                    Search grounding unavailable
                  </div>
                )}
              </div>
            )}

            {/* Raw JSON Payload */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  {t.rawOutputTitle}
                </span>
                <button
                  type="button"
                  onClick={() => onCopy(step.agentId, jsonString)}
                  className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{t.copyJson}</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-stone-900/95 border border-stone-800 text-emerald-300 text-[11px] overflow-x-auto max-h-60 leading-tight">
                {jsonString}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.step.status === next.step.status &&
      prev.step.durationMs === next.step.durationMs &&
      prev.step.thoughtProcess === next.step.thoughtProcess &&
      prev.step.rawOutput === next.step.rawOutput &&
      prev.step.error === next.step.error &&
      prev.step.modelUsed === next.step.modelUsed &&
      prev.step.tokenUsage?.totalTokens === next.step.tokenUsage?.totalTokens &&
      prev.step.tokenUsage?.estimatedCostUsd === next.step.tokenUsage?.estimatedCostUsd &&
      prev.isExpanded === next.isExpanded &&
      prev.isCopied === next.isCopied &&
      prev.language === next.language
    );
  }
);

interface AgentTraceModalProps {
  trace: AgentTraceStep[];
  overallDurationMs: number;
  language: Language;
}

const AgentTraceModalComponent: React.FC<AgentTraceModalProps> = ({
  trace,
  overallDurationMs,
  language,
}) => {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>('vision');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleToggleExpand = useCallback((agentId: string) => {
    setExpandedAgent((prev) => (prev === agentId ? null : agentId));
  }, []);

  const totalTokens = trace.reduce((acc, s) => acc + (s.tokenUsage?.totalTokens || 0), 0);
  let allPriced = true;
  let totalCostSum = 0;
  let hasAnyCompleted = false;

  for (const s of trace) {
    if (s.status === 'completed' && s.tokenUsage) {
      hasAnyCompleted = true;
      if (s.tokenUsage.estimatedCostUsd !== null && s.tokenUsage.estimatedCostUsd !== undefined) {
        totalCostSum += s.tokenUsage.estimatedCostUsd;
      } else {
        allPriced = false;
      }
    }
  }

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-lg overflow-hidden transition-colors">
      {/* Accordion Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-stone-900 hover:bg-stone-800/80 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-white">
                {t.agentTraceHeader}
              </span>
              <span className="text-[10px] font-mono bg-stone-800 text-emerald-400 px-2 py-0.5 rounded-full border border-stone-700">
                {overallDurationMs}ms total
              </span>
              {totalTokens > 0 && (
                <span className="text-[10px] font-mono bg-stone-800 text-sky-300 px-2 py-0.5 rounded-full border border-stone-700">
                  {totalTokens.toLocaleString()} tokens
                </span>
              )}
              {hasAnyCompleted && totalTokens > 0 && (
                <span className="text-[10px] font-mono bg-stone-800 text-amber-300 px-2 py-0.5 rounded-full border border-stone-700">
                  {allPriced ? `$${totalCostSum.toFixed(5)}` : 'price n/a'}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {t.agentTraceSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-400 hover:text-white">
          <span className="text-xs font-semibold hidden sm:inline">
            {isOpen ? t.collapseTrace : t.expandTrace}
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Trace Body */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-stone-800 bg-stone-950 space-y-4">
          <div className="space-y-3">
            {trace.map((step, idx) => (
              <AgentTraceStepRow
                key={step.agentId}
                step={step}
                index={idx}
                isExpanded={expandedAgent === step.agentId}
                onToggleExpand={handleToggleExpand}
                onCopy={handleCopy}
                isCopied={copiedId === step.agentId}
                language={language}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const AgentTraceModal = React.memo(AgentTraceModalComponent);
