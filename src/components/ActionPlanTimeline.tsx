import React from 'react';
import {
  CalendarCheck,
  Leaf,
  DollarSign,
  Clock,
  Sparkles,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { PlannerResult, Language, PlanStep } from '../types';
import { translations } from '../i18n/translations';

interface ActionPlanTimelineProps {
  planner: PlannerResult;
  language: Language;
}

export const ActionPlanTimeline = React.memo<ActionPlanTimelineProps>(function ActionPlanTimeline({ planner, language }) {
  const t = translations[language];

  const getCategoryBadge = (cat: PlanStep['category']) => {
    switch (cat) {
      case 'organic':
        return {
          label: t.badgeOrganic,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: Leaf,
        };
      case 'cultural':
        return {
          label: t.badgeCultural,
          className: 'bg-teal-100 text-teal-800 border-teal-300',
          icon: Wrench,
        };
      case 'biological':
        return {
          label: t.badgeBiological,
          className: 'bg-lime-100 text-lime-800 border-lime-300',
          icon: Sparkles,
        };
      case 'chemical':
        return {
          label: t.badgeChemical,
          className: 'bg-red-100 text-red-800 border-red-300',
          icon: AlertTriangle,
        };
      default:
        return {
          label: t.badgeLowCost,
          className: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: DollarSign,
        };
    }
  };

  const getCostBadge = (cost: PlanStep['estimatedCost']) => {
    switch (cost) {
      case 'free':
        return { label: t.costFree, className: 'bg-stone-100 text-stone-700' };
      case 'low':
        return { label: t.costLow, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: t.costModerate, className: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">{t.actionPlanHeader}</h3>
            <p className="text-[11px] text-stone-500">Agent 3: Action Planner</p>
          </div>
        </div>

        {planner.estimatedRecoveryTime && (
          <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200/80 font-semibold">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.recoveryEstimate} {planner.estimatedRecoveryTime}</span>
          </div>
        )}
      </div>

      {/* Strategy & Organic Priority Rationale */}
      <div className="bg-gradient-to-r from-emerald-50/70 to-lime-50/40 rounded-xl p-3.5 border border-emerald-200/80 space-y-2">
        {planner.strategyOverview && (
          <p className="text-xs text-stone-800 font-medium leading-relaxed">
            {planner.strategyOverview}
          </p>
        )}
        {planner.organicPriorityExplanation && (
          <div className="flex items-start gap-2 pt-1 border-t border-emerald-100 text-[11px] text-emerald-900">
            <Leaf className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <span>{planner.organicPriorityExplanation}</span>
          </div>
        )}
      </div>

      {/* Sequential Timeline of Steps */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200">
        {planner.steps?.map((step) => {
          const category = getCategoryBadge(step.category);
          const CategoryIcon = category.icon;
          const cost = getCostBadge(step.estimatedCost);

          return (
            <div key={step.stepNumber} className="relative group">
              {/* Step indicator node on timeline */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-[11px] flex items-center justify-center ring-4 ring-white shadow-xs">
                {step.stepNumber}
              </div>

              {/* Card content */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 hover:border-emerald-300 transition-all space-y-2.5">
                {/* Step meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-700" />
                    {step.timeFrame}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${category.className}`}>
                      <CategoryIcon className="w-3 h-3" />
                      {category.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cost.className}`}>
                      {cost.label}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {step.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Materials Needed */}
                {step.materialsNeeded && step.materialsNeeded.length > 0 && (
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-stone-500" />
                      {t.materialsLabel}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {step.materialsNeeded.map((mat, mIdx) => (
                        <span
                          key={mIdx}
                          className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200/90"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Method / Practical Field Tip */}
                {step.applicationMethod && (
                  <p className="text-[11px] text-emerald-900 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{step.applicationMethod}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
