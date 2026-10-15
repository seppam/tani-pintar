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
} from 'lucide-react';
import { AgentTraceStep, Language } from '../types';
import { translations } from '../i18n/translations';

interface AgentTraceRowProps {
  step: AgentTraceStep;
  idx: number;
  isExpanded: boolean;
  copiedId: string | null;
  onToggleExpand: (agentId: string) => void;
  onCopy: (id: string, text: string) => void;
  language: Language;
}

const getAgentIcon = (id: AgentTraceStep['agentId']) => {
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
};

const AgentTraceRow = React.memo<AgentTraceRowProps>(function AgentTraceRow({
  step,
  idx,
  isExpanded,
  copiedId,
  onToggleExpand,
  onCopy,
  language,
}) {
  const t = translations[language];
  const Icon = getAgentIcon(step.agentId);
  const jsonString = JSON.stringify(step.rawOutput, null, 2);

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/90 overflow-hidden">
      {/* Step Header */}
      <div
        onClick={() => onToggleExpand(step.agentId)}
        className="p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-stone-800/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-stone-800 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-stone-700">
            {idx + 1}
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800">
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
            <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800 hidden sm:inline">
              {step.modelUsed}
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
                className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 transition"
              >
                {copiedId === step.agentId ? (
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
});

interface AgentTraceModalProps {
  trace: AgentTraceStep[];
  overallDurationMs: number;
  language: Language;
}

export const AgentTraceModal = React.memo<AgentTraceModalProps>(function AgentTraceModal({
  trace,
  overallDurationMs,
  language,
}) {
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

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-lg overflow-hidden transition-all">
      {/* Accordion Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-stone-900 hover:bg-stone-800/80 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                {t.agentTraceHeader}
              </span>
              <span className="text-[10px] font-mono bg-stone-800 text-emerald-400 px-2 py-0.5 rounded-full border border-stone-700">
                {overallDurationMs}ms total
              </span>
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
        <div className="p-4 sm:p-6 border-t border-stone-800 bg-stone-950/60 space-y-4">
          <div className="space-y-3">
            {trace.map((step, idx) => (
              <AgentTraceRow
                key={step.agentId}
                step={step}
                idx={idx}
                isExpanded={expandedAgent === step.agentId}
                copiedId={copiedId}
                onToggleExpand={handleToggleExpand}
                onCopy={handleCopy}
                language={language}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
