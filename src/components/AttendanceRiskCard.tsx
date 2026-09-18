import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

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
  const { riskScore, riskLevel, reasons, overallAttendance } = riskData;

  const isSafe = riskLevel === 'SAFE';
  const isWatch = riskLevel === 'MEDIUM';
  const isDanger = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';

  const iconColor = isSafe ? 'text-[#22C55E]' : isWatch ? 'text-[#F59E0B]' : 'text-[#EF4444]';
  const iconBg = isSafe ? 'bg-emerald-500/10 border-emerald-500/20' : isWatch ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

  const label = isSafe ? 'Safe' : isWatch ? 'Watch' : 'At Risk';
  const labelColor = isSafe ? 'text-[#22C55E]' : isWatch ? 'text-[#F59E0B]' : 'text-[#EF4444]';

  // Format contextual message
  const buffer = (overallAttendance - 75).toFixed(1);
  let detailMessage = `You are ${Math.abs(Number(buffer))}% ${Number(buffer) >= 0 ? 'above' : 'below'} target.`;
  if (reasons && reasons.length > 0) {
    detailMessage += ` ${reasons[0]}`;
  } else if (riskData.remainingSafeBunks > 0) {
    detailMessage += ` You have ${riskData.remainingSafeBunks} safe bunk(s) available.`;
  }

  return (
    <div>
      <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] block mb-2">
        Attendance Risk
      </span>
      <div 
        className="bg-white dark:bg-[#1E293B] rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-[#26354A] flex items-center gap-3.5 shadow-xs"
        id="attendance-risk-card-root"
      >
        {/* Shield Icon Box */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} ${iconColor}`}>
          {isSafe ? <ShieldCheck className="w-5 h-5" /> : isWatch ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${labelColor}`}>{label}</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC]">{riskScore}/100</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5 truncate">
            {detailMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

