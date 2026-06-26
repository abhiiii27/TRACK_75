import React from 'react';
import { BookOpen, CheckCircle, AlertTriangle, GraduationCap } from 'lucide-react';

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
  const isSafe = stats.overallPercentage >= 75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" id="dashboard-stats-grid">
      {/* Overall Circular Progress Card */}
      <div 
        className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155] flex flex-col items-center justify-center md:col-span-1 text-center animate-fade-in"
        id="stat-card-circular"
      >
        <span className="text-xs font-semibold text-slate-400 dark:text-[#CBD5E1] uppercase tracking-wider mb-3">Overall Attendance</span>
        <div className="relative w-32 h-32 flex items-center justify-center mb-2">
          {/* Circular Track */}
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
              stroke={isSafe ? "#10B981" : "#F59E0B"}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats.overallPercentage || 100) / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-bold text-slate-800 dark:text-[#F8FAFC] tracking-tight">
              {stats.overallPercentage}%
            </span>
          </div>
        </div>
        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
          isSafe 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
            : 'bg-amber-50 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400'
        }`}>
          {isSafe ? 'Good Standing' : 'Needs Attendance Boost'}
        </div>
      </div>

      {/* Stats Breakdown Cards */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6" id="stats-breakdown-container">
        {/* Total Classes Stats */}
        <div 
          className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155] flex flex-col justify-between"
          id="stat-card-classes"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-[#CBD5E1] bg-slate-50 dark:bg-[#1E293B] px-2 py-1 rounded-md">
              Classes Logged
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight mb-1">
              {stats.totalAttended} <span className="text-lg font-medium text-slate-400 dark:text-slate-500">/ {stats.totalConducted}</span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#CBD5E1] font-medium">Conducted lectures attended</p>
          </div>
        </div>

        {/* Safe Subjects Card */}
        <div 
          className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155] flex flex-col justify-between"
          id="stat-card-safe-subjects"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
              On Track
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight mb-1">
              {stats.safeSubjects} <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/ {stats.totalSubjects}</span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#CBD5E1] font-medium">Subjects meeting goals</p>
          </div>
        </div>

        {/* Shortage Alert Card */}
        <div 
          className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155] flex flex-col justify-between"
          id="stat-card-shortage"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stats.belowTargetSubjects > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-[#1E293B] text-slate-400 dark:text-slate-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${
              stats.belowTargetSubjects > 0 
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 animate-pulse' 
                : 'bg-slate-50 dark:bg-[#1E293B] text-slate-500 dark:text-[#CBD5E1]'
            }`}>
              {stats.belowTargetSubjects > 0 ? 'Warning' : 'All Safe'}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight mb-1">
              {stats.belowTargetSubjects}
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#CBD5E1] font-medium">Subjects below target %</p>
          </div>
        </div>
      </div>
    </div>
  );
}
