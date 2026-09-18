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
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm flex flex-col justify-between" id="dashboard-prediction-panel">
      
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4" id="prediction-panel-title">
          <div className="p-2 bg-[#38BDF8]/10 text-[#38BDF8] rounded-lg">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Attendance Projection</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Trajectory forecast based on historical rate</p>
          </div>
        </div>

        {/* Grid for core metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
          {/* Forecast */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-1 block">Forecast</span>
            <div className="flex items-end gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-[#F8FAFC] leading-none">
                {predictionData.predictedPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Required Classes */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-1 block">Req. Classes</span>
            <div className="flex items-end gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-[#F8FAFC] leading-none">
                {predictionData.requiredClasses}
              </span>
            </div>
          </div>

          {/* Trend */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-1 block">Trend</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`p-0.5 rounded ${trendColorClass}`}>
                <TrendIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                {predictionData.attendanceTrend}
              </span>
            </div>
          </div>

          {/* Confidence */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-1 block">Confidence</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Target className={`w-3.5 h-3.5 ${confColor}`} />
              <span className={`text-xs font-bold ${confColor}`}>
                {predictionData.confidenceScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] mt-1">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Advisory Note
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
          {predictionData.aiInsight}
        </p>
      </div>

    </div>
  );
}
