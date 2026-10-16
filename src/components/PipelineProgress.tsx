import React from 'react';
import { Eye, CloudRain, CalendarCheck, ShieldAlert, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Language, AgentTraceStep } from '../types';
import { translations } from '../i18n/translations';

interface PipelineStepItemProps {
  num: number;
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

const PipelineStepItem = React.memo(
  function PipelineStepItem({
    title,
    desc,
    icon: Icon,
    status,
  }: PipelineStepItemProps) {
    const isDone = status === 'completed';
    const isRunning = status === 'running';
    const isFailed = status === 'failed';
    const isSkipped = status === 'skipped';
    const isPending = status === 'pending';

    return (
      <div
        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors transition-opacity duration-200 ${
          isFailed
            ? 'bg-red-50/70 border-red-300'
            : isRunning
            ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
            : isDone
            ? 'bg-stone-50 border-stone-200/80 opacity-90'
            : 'bg-white border-stone-200/40 opacity-50'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            isFailed
              ? 'bg-red-600 text-white'
              : isDone
              ? 'bg-emerald-600 text-white'
              : isRunning
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-200 text-stone-500'
          }`}
        >
          {isDone ? (
            <CheckCircle className="w-4 h-4" />
          ) : isFailed ? (
            <AlertCircle className="w-4 h-4" />
          ) : isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-900">{title}</h4>
            {isRunning && (
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 transition-colors duration-200 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                Running
              </span>
            )}
            {isDone && (
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 transition-colors duration-200">
                Done
              </span>
            )}
            {isFailed && (
              <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 border border-red-300 transition-colors duration-200">
                Failed
              </span>
            )}
            {isSkipped && (
              <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 transition-colors duration-200">
                Skipped
              </span>
            )}
            {isPending && (
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 transition-colors duration-200">
                Pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.status === next.status &&
      prev.title === next.title &&
      prev.desc === next.desc
    );
  }
);

interface PipelineProgressProps {
  language: Language;
  trace?: AgentTraceStep[];
}

const PipelineProgressComponent: React.FC<PipelineProgressProps> = ({ language, trace }) => {
  const t = translations[language];

  const steps = [
    {
      num: 1,
      id: 'vision' as const,
      title: t.pipelineStep1,
      desc: t.pipelineStep1Desc,
      icon: Eye,
    },
    {
      num: 2,
      id: 'context' as const,
      title: t.pipelineStep2,
      desc: t.pipelineStep2Desc,
      icon: CloudRain,
    },
    {
      num: 3,
      id: 'planner' as const,
      title: t.pipelineStep3,
      desc: t.pipelineStep3Desc,
      icon: CalendarCheck,
    },
    {
      num: 4,
      id: 'safety' as const,
      title: t.pipelineStep4,
      desc: t.pipelineStep4Desc,
      icon: ShieldAlert,
    },
  ];

  // Determine current active step number
  let currentActiveNum = 1;
  if (trace && trace.length > 0) {
    const runningIdx = trace.findIndex((t) => t.status === 'running');
    if (runningIdx !== -1) {
      currentActiveNum = runningIdx + 1;
    } else {
      const lastCompletedIdx = trace.map((t) => t.status).lastIndexOf('completed');
      currentActiveNum = Math.min(4, Math.max(1, lastCompletedIdx + 2));
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          <h3 className="font-bold text-sm text-stone-900">
            {t.pipelineHeader}
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Agent {currentActiveNum} / 4
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((s, idx) => {
          const traceItem = trace?.[idx];
          const status = traceItem?.status || (s.num === 1 ? 'running' : 'pending');

          return (
            <PipelineStepItem
              key={s.id}
              num={s.num}
              id={s.id}
              title={s.title}
              desc={s.desc}
              icon={s.icon}
              status={status}
            />
          );
        })}
      </div>
    </div>
  );
};

export const PipelineProgress = React.memo(PipelineProgressComponent);
