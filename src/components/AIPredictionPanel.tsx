import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  BrainCircuit
} from 'lucide-react';
import { AIPredictionResponse } from '../types';

interface AIPredictionPanelProps {
  predictionData?: AIPredictionResponse | null;
}

export default function AIPredictionPanel({ predictionData }: AIPredictionPanelProps) {
  if (!predictionData) {
    return null; // Do not render if no data
  }

  // Trend icon and color logic
  let TrendIcon = Minus;
  let trendColorClass = "text-slate-500 bg-slate-100 dark:bg-slate-800";
  if (predictionData.attendanceTrend === "Improving") {
    TrendIcon = TrendingUp;
    trendColorClass = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40";
  } else if (predictionData.attendanceTrend === "Declining") {
    TrendIcon = TrendingDown;
    trendColorClass = "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40";
  }

  // Confidence color
  const confColor = predictionData.confidenceScore === "High" 
    ? "text-emerald-600 dark:text-emerald-400"
    : predictionData.confidenceScore === "Medium"
    ? "text-amber-600 dark:text-amber-400"
    : "text-slate-500 dark:text-slate-400";

  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col" id="dashboard-prediction-panel">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6" id="prediction-panel-title">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">AI Prediction Engine</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Smart semester forecasting</p>
        </div>
      </div>

      {/* Grid for core metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Forecast */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-100/50 dark:border-[#334155]/50 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Forecast</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-[#F8FAFC] leading-none">
              {predictionData.predictedPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Required Classes */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-100/50 dark:border-[#334155]/50 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Req. Classes</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-[#F8FAFC] leading-none">
              {predictionData.requiredClasses}
            </span>
          </div>
        </div>

        {/* Trend */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-100/50 dark:border-[#334155]/50 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Trend</span>
          <div className="flex items-center gap-2 mt-1">
            <div className={`p-1 rounded-md ${trendColorClass}`}>
              <TrendIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">
              {predictionData.attendanceTrend}
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-100/50 dark:border-[#334155]/50 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Confidence</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Target className={`w-4 h-4 ${confColor}`} />
            <span className={`text-sm font-bold ${confColor}`}>
              {predictionData.confidenceScore}
            </span>
          </div>
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Dynamic Insight
          </span>
        </div>
        <p className="text-slate-600 dark:text-[#CBD5E1] text-xs font-semibold leading-relaxed">
          {predictionData.aiInsight}
        </p>
      </div>

    </div>
  );
}
