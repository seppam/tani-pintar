import React from 'react';
import { Eye, CloudRain, CalendarCheck, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import { Language, AgentTraceStep } from '../types';
import { translations } from '../i18n/translations';

interface PipelineStepRowProps {
  id: string;
  num: number;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

const PipelineStepRow = React.memo<PipelineStepRowProps>(function PipelineStepRow({
  num,
  title,
  desc,
  icon: Icon,
  status,
}) {
  const isDone = status === 'completed';
  const isRunning = status === 'running';
  const isFailed = status === 'failed';
  const isSkipped = status === 'skipped';
  const isPending = status === 'pending';

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors transition-opacity duration-200 ${
        isFailed
          ? 'bg-red-50/70 border-red-300 opacity-100'
          : isRunning
          ? 'bg-emerald-50/70 border-emerald-300 shadow-xs opacity-100'
          : isDone
          ? 'bg-stone-50 border-stone-200/80 opacity-80'
          : 'bg-white border-transparent opacity-45'
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
        ) : isRunning ? (
          <Loader2 className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-900">
            {title}
          </h4>
          {isRunning && (
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
              running
            </span>
          )}
          {isDone && (
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
              done
            </span>
          )}
          {isFailed && (
            <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">
              failed
            </span>
          )}
          {isSkipped && (
            <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
              skipped
            </span>
          )}
          {isPending && (
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
              pending
            </span>
          )}
        </div>
        <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
});

interface PipelineProgressProps {
  language: Language;
  trace?: AgentTraceStep[];
}

export const PipelineProgress = React.memo<PipelineProgressProps>(function PipelineProgress({
  language,
  trace,
}) {
  const t = translations[language];

  const stepsConfig = [
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

  // Derive active agent number
  let currentActiveNum = 1;
  if (trace && trace.length > 0) {
    const runningIdx = trace.findIndex((t) => t.status === 'running');
    if (runningIdx !== -1) {
      currentActiveNum = runningIdx + 1;
    } else {
      const lastCompletedIdx = trace.map((t) => t.status).lastIndexOf('completed');
      currentActiveNum = Math.min(4, Math.max(1, lastCompletedIdx + 1));
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-stone-900">
            {t.pipelineHeader}
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Agent {currentActiveNum} / 4
        </span>
      </div>

      <div className="space-y-3">
        {stepsConfig.map((s) => {
          const traceItem = trace?.find((ti) => ti.agentId === s.id);
          const stepStatus: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' =
            traceItem?.status || (s.num === 1 ? 'running' : 'pending');

          return (
            <PipelineStepRow
              key={s.id}
              id={s.id}
              num={s.num}
              title={s.title}
              desc={s.desc}
              icon={s.icon}
              status={stepStatus}
            />
          );
        })}
      </div>
    </div>
  );
});
