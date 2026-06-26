import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';

interface AttendanceRiskCardProps {
  riskData: {
    riskScore: number;
    riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    overallAttendance: number;
    remainingSafeBunks: number;
    reasons: string[];
  };
}

export default function AttendanceRiskCard({ riskData }: AttendanceRiskCardProps) {
  const { riskScore, riskLevel, reasons } = riskData;

  // Determine colors based on score
  // Green 0-30, Yellow 31-60, Orange 61-80, Red 81-100
  let ringColor = '#10B981'; // Green
  let textColorClass = 'text-emerald-600 dark:text-emerald-400';
  let badgeColorClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
  let statusEmoji = '🟢';
  let iconElement = <ShieldCheck className="w-12 h-12 text-emerald-500 shrink-0" />;

  if (riskScore >= 81) {
    ringColor = '#EF4444'; // Red
    textColorClass = 'text-rose-600 dark:text-rose-400';
    badgeColorClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
    statusEmoji = '🔴';
    iconElement = <ShieldAlert className="w-12 h-12 text-rose-500 shrink-0" />;
  } else if (riskScore >= 61) {
    ringColor = '#F97316'; // Orange
    textColorClass = 'text-orange-600 dark:text-orange-400';
    badgeColorClass = 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/50';
    statusEmoji = '🟠';
    iconElement = <ShieldAlert className="w-12 h-12 text-orange-500 shrink-0" />;
  } else if (riskScore >= 31) {
    ringColor = '#F59E0B'; // Yellow
    textColorClass = 'text-amber-600 dark:text-amber-400';
    badgeColorClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
    statusEmoji = '🟡';
    iconElement = <AlertTriangle className="w-12 h-12 text-amber-500 shrink-0" />;
  }

  // Choose summary sentence based on level
  let summarySentence = 'Your attendance is healthy.';
  if (riskLevel === 'CRITICAL') {
    summarySentence = 'Your attendance level is critical! You are at high risk of falling below university requirements.';
  } else if (riskLevel === 'HIGH') {
    summarySentence = 'You are at risk of falling below the required attendance.';
  } else if (riskLevel === 'MEDIUM') {
    summarySentence = 'Your attendance status is moderate, but several classes are nearing the risk margin.';
  }

  return (
    <div 
      className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155] hover:shadow-md transition-all duration-300 animate-fade-in mb-8"
      id="attendance-risk-card-root"
    >
      <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 justify-between">
        
        {/* Area 1: Left Side - Circular Risk Score Indicator */}
        <div className="flex flex-col items-center justify-center text-center md:border-r md:border-slate-100 dark:md:border-[#334155] md:pr-8 shrink-0 w-full md:w-auto" id="risk-area-circular-score">
          <span className="text-xs font-semibold text-slate-400 dark:text-[#CBD5E1] uppercase tracking-wider mb-3">Risk Score</span>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-[#334155]"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={ringColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (riskScore || 0) / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-800 dark:text-[#F8FAFC] tracking-tight">
                {riskScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">/ 100</span>
            </div>
          </div>
        </div>

        {/* Area 2: Center Left - Risk Status Badge & Summary */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left w-full" id="risk-area-status-summary">
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase border tracking-wider shadow-2xs ${badgeColorClass}`}>
              <span className="text-xs leading-none">{statusEmoji}</span> {riskLevel} RISK
            </span>
          </div>
          <p className="text-slate-600 dark:text-[#CBD5E1] text-sm font-semibold leading-relaxed max-w-md">
            {summarySentence}
          </p>
        </div>

        {/* Area 3: Center Right - Risk Factors List */}
        <div className="flex-1 flex flex-col justify-center border-t border-b border-slate-50 dark:border-[#334155] md:border-none py-4 md:py-0 w-full" id="risk-area-factors">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1] uppercase tracking-widest mb-3 block text-center md:text-left">Risk Factors</span>
          <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-[#CBD5E1]" id="risk-factors-list">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))
            ) : (
              <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="shrink-0">✓</span>
                <span>All parameters in perfect standing.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Area 4: Right Side - Action Icon Indicator */}
        <div className="hidden lg:flex items-center justify-center pl-4 shrink-0" id="risk-area-status-icon">
          <div className="p-4 bg-slate-50/50 dark:bg-[#1E293B]/40 rounded-3xl border border-slate-100 dark:border-[#334155]">
            {iconElement}
          </div>
        </div>

      </div>
    </div>
  );
}
