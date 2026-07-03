import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ShieldCheck, AlertCircle, MoreVertical, Edit2, Trash2, Info } from 'lucide-react';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onLogAttendance: (subjectId: string, status: 'present' | 'absent') => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
  onViewDetails?: (subjectId: string) => void;
}

export default function SubjectCard({ subject, onLogAttendance, onEdit, onDelete, onViewDetails }: SubjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const currentPercentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 100;
  const target = subject.targetPercentage;
  const isSafe = currentPercentage >= target;

  // Compute consecutive classes to reach target
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

  // Compute classes safe to miss without falling below target
  let safeToMiss = 0;
  if (currentPercentage >= target) {
    if (targetFrac > 0) {
      const val = (subject.attended - targetFrac * subject.total) / targetFrac;
      safeToMiss = Math.max(0, Math.floor(val));
    } else {
      safeToMiss = 999;
    }
  }

  return (
    <div 
      className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-slate-200 dark:hover:border-[#334155]/80 animate-fade-in"
      id={`subject-card-${subject.id}`}
    >
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4" id={`subject-header-${subject.id}`}>
          <div className="pr-2">
            <h4 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC] tracking-tight leading-snug">{subject.name}</h4>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Target: {target}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className={`text-xl font-extrabold ${isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {currentPercentage.toFixed(1)}%
              </span>
            </div>
            
            {/* 3-Dot Action Menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-100 dark:border-[#334155] py-2 z-10 animate-fade-in overflow-hidden origin-top-right">
                  <button 
                    onClick={() => { setShowMenu(false); onViewDetails && onViewDetails(subject.id); }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Info className="w-4 h-4 text-indigo-500" /> View Details
                  </button>
                  <button 
                    onClick={() => { setShowMenu(false); onEdit && onEdit(subject); }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-emerald-500" /> Edit Subject
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                  <button 
                    onClick={() => { setShowMenu(false); onDelete && onDelete(subject); }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" /> Delete Subject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden" id={`subject-progress-container-${subject.id}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isSafe ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, currentPercentage)}%` }}
            id={`subject-progress-bar-${subject.id}`}
          />
        </div>

        {/* Attendance Ratio Stats */}
        <div className="flex justify-between text-xs text-slate-500 dark:text-[#CBD5E1] font-medium mb-5" id={`subject-ratio-${subject.id}`}>
          <span>Attended: <strong className="text-slate-800 dark:text-[#F8FAFC]">{subject.attended}</strong></span>
          <span>Conducted: <strong className="text-slate-800 dark:text-[#F8FAFC]">{subject.total}</strong></span>
        </div>

        {/* Smart Advisor Alert Box */}
        <div className="mb-6" id={`subject-alert-box-${subject.id}`}>
          {isSafe ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-2xl p-3 flex items-start gap-2 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span>You are above the target! You can safely miss </span>
                <span className="font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">
                  {safeToMiss} {safeToMiss === 1 ? 'class' : 'classes'}
                </span>
                <span> without falling below.</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 rounded-2xl p-3 flex items-start gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span>Under target! You must attend the next </span>
                <span className="font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded animate-pulse">
                  {requiredConsecutive} {requiredConsecutive === 1 ? 'class' : 'classes'}
                </span>
                <span> consecutively to secure {target}%.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Logging Buttons */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-50 dark:border-[#334155] pt-4" id={`subject-actions-${subject.id}`}>
        <button
          onClick={() => onLogAttendance(subject.id, 'present')}
          className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-[#1E293B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-600 dark:text-[#CBD5E1] font-bold py-2.5 px-4 rounded-2xl text-xs transition-all duration-200 cursor-pointer"
          id={`btn-present-${subject.id}`}
        >
          Mark Present
        </button>
        <button
          onClick={() => onLogAttendance(subject.id, 'absent')}
          className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-[#1E293B] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 text-slate-600 dark:text-[#CBD5E1] font-bold py-2.5 px-4 rounded-2xl text-xs transition-all duration-200 cursor-pointer"
          id={`btn-absent-${subject.id}`}
        >
          Mark Absent
        </button>
      </div>
    </div>
  );
}
