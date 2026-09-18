import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Check, 
  X,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Subject, AttendanceRecord } from '../types';

interface SubjectDetailsViewProps {
  subject: Subject;
  onBack: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function SubjectDetailsView({ subject, onBack, authenticatedFetch }: SubjectDetailsViewProps) {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await authenticatedFetch('/api/attendance/history');
        if (!res.ok) throw new Error('Failed to fetch attendance history');
        const data = await res.json();
        if (isMounted) {
          setHistory(data.filter((r: any) => r.subjectId === subject.id));
        }
      } catch (err: any) {
        if (isMounted) setError('Could not load history');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [subject.id, authenticatedFetch]);

  // Derived stats
  const currentPercentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 100;
  const target = subject.targetPercentage;
  const isSafe = currentPercentage >= target;

  const targetFrac = target / 100;
  let requiredConsecutive = 0;
  if (currentPercentage < target) {
    if (targetFrac < 1.0) {
      const val = (targetFrac * subject.total - subject.attended) / (1.0 - targetFrac);
      requiredConsecutive = Math.max(0, Math.ceil(val));
    } else {
      requiredConsecutive = subject.attended < subject.total ? 999 : 0;
    }
  }

  let safeToMiss = 0;
  if (currentPercentage >= target) {
    if (targetFrac > 0) {
      const val = (subject.attended - targetFrac * subject.total) / targetFrac;
      safeToMiss = Math.max(0, Math.floor(val));
    } else {
      safeToMiss = 999;
    }
  }

  // Circular gauge calculations
  const radius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, currentPercentage)) / 100) * circumference;

  // Flatten and sort history
  const sortedRecords = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  const displayedRecords = showAllHistory ? sortedRecords : sortedRecords.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-2xl mx-auto" id="subject-details-view">
      
      {/* Top Header: Screen 10 style */}
      <div className="flex items-center gap-3 pt-1 pb-1">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#26354A] border border-slate-200 dark:border-[#26354A] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight truncate">
            {subject.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">
            Course details & historical records
          </p>
        </div>
      </div>

      {/* Hero Circular Gauge Card (Screen 10) */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-[#26354A] flex flex-col items-center text-center relative overflow-hidden shadow-xs">
        
        {/* Status Pill Badge (Top Right) */}
        <div className="absolute top-4 right-4">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
            isSafe 
              ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' 
              : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
          }`}>
            {isSafe ? 'On Track' : 'Below Target'}
          </span>
        </div>

        {/* Circular Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center my-2">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              strokeWidth={strokeWidth}
              className="gauge-track-circle"
            />
            {/* Value Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={isSafe ? '#22C55E' : '#EF4444'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Percentage & Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {currentPercentage.toFixed(1)}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mt-0.5">
              {subject.attended} / {subject.total} classes
            </span>
          </div>
        </div>

        {/* Target Indicator */}
        <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium mt-1">
          Minimum Target: <strong className="text-slate-900 dark:text-[#F8FAFC]">{target}%</strong>
        </span>
      </div>

      {/* 3-Column Stats Row (Screen 10) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 text-center border border-slate-200 dark:border-[#26354A] shadow-xs">
          <span className="text-lg sm:text-xl font-black text-[#22C55E] block">
            {subject.attended}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
            Present
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 text-center border border-slate-200 dark:border-[#26354A] shadow-xs">
          <span className="text-lg sm:text-xl font-black text-[#EF4444] block">
            {subject.total - subject.attended}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
            Absent
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 text-center border border-slate-200 dark:border-[#26354A] shadow-xs">
          <span className="text-lg sm:text-xl font-black text-[#38BDF8] block">
            {subject.total}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
            Total
          </span>
        </div>
      </div>

      {/* Eligibility Callout Banner */}
      {isSafe ? (
        <div className="bg-[#22C55E]/10 rounded-xl p-3.5 flex items-start gap-2.5 border border-[#22C55E]/20">
          <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#22C55E]">Attendance is safe</p>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              You can safely miss <strong className="text-slate-900 dark:text-[#F8FAFC]">{safeToMiss}</strong> more {safeToMiss === 1 ? 'class' : 'classes'} without falling below {target}%.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#F59E0B]/10 rounded-xl p-3.5 flex items-start gap-2.5 border border-[#F59E0B]/20">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#F59E0B]">Attendance Recovery Needed</p>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              You need to attend the next <strong className="text-slate-900 dark:text-[#F8FAFC]">{requiredConsecutive}</strong> {requiredConsecutive === 1 ? 'class' : 'classes'} consecutively to reach your {target}% target.
            </p>
          </div>
        </div>
      )}

      {/* Recent Classes (Screen 10) */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#26354A] overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[#26354A]/60 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Recent Classes</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            {sortedRecords.length} recorded
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">Loading attendance history...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#EF4444]">{error}</div>
        ) : sortedRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">No classes recorded yet for this subject.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#26354A]/60">
            {displayedRecords.map((rec) => {
              const dateObj = new Date(rec.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={rec.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">
                      {formattedDate}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                      {formattedTime !== 'Invalid Date' ? formattedTime : 'Class session'}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    rec.status === 'present'
                      ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                      : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                  }`}>
                    {rec.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* View Full History Outline Button (Screen 10) */}
        {sortedRecords.length > 5 && (
          <div className="p-3 border-t border-slate-100 dark:border-[#26354A]/60 text-center">
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-[#26354A] hover:bg-slate-50 dark:hover:bg-[#26354A]/40 text-xs font-bold text-[#38BDF8] transition-colors cursor-pointer"
            >
              {showAllHistory ? 'Show Recent Only' : 'View Full History'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
