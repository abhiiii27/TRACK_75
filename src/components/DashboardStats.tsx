import React from 'react';

interface StatsProps {
  stats: {
    totalSubjects: number;
    overallPercentage: number;
    totalAttended: number;
    totalConducted: number;
    safeSubjects: number;
    belowTargetSubjects: number;
  };
}

export default function DashboardStats({ stats }: StatsProps) {
  const percentage = stats.overallPercentage || 100;
  const isSafe = percentage >= 75;
  const buffer = Number((percentage - 75).toFixed(1));

  // Circular gauge calculations (radius 44, circumference ~276.46)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  const strokeColor = isSafe ? '#22C55E' : percentage >= 70 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-xs" id="dashboard-overall-attendance-card">
      <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] block mb-3">
        Overall Attendance
      </span>

      <div className="flex items-center justify-between gap-4">
        {/* Left: Circular Attendance Gauge */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeWidth="8"
              className="gauge-track-circle"
            />
            {/* Active Gauge Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Text in Gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none">
              {percentage.toFixed(1)}%
            </span>
            <div className={`mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${
              buffer >= 0 
                ? 'bg-emerald-500/15 text-[#22C55E]' 
                : 'bg-rose-500/15 text-[#EF4444]'
            }`}>
              <span>{buffer >= 0 ? `↑ +${buffer}%` : `↓ ${buffer}%`}</span>
            </div>
          </div>
        </div>

        {/* Right: Status Pill & Key-Value List */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
          {/* Status pill */}
          <div className="flex justify-end sm:justify-start">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isSafe
                ? 'bg-emerald-500/15 text-[#22C55E] border border-emerald-500/30'
                : 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
              <span>{isSafe ? 'Safe' : 'At Risk'}</span>
            </span>
          </div>

          {/* Stats list */}
          <div className="space-y-1 pt-1 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8]">
              <span>Target</span>
              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">75%</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8]">
              <span>Current</span>
              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{percentage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8]">
              <span>Attended</span>
              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {stats.totalAttended} / {stats.totalConducted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

