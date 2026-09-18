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
      className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-[#334155] shadow-xs cursor-pointer"
      id={`subject-card-${subject.id}`}
      onClick={() => onViewDetails && onViewDetails(subject.id)}
    >
      <div>
        {/* Top row: Subject Code + Full Name + Percentage + Status Pill + 3 dots */}
        <div className="flex justify-between items-start mb-1" id={`subject-header-${subject.id}`}>
          <div className="pr-2 min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight truncate">
              {subject.name}
            </h4>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal block mt-0.5">
              {subject.code || subject.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                {currentPercentage.toFixed(0)}%
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isSafe 
                  ? 'bg-emerald-500/15 text-[#22C55E]' 
                  : currentPercentage >= 70
                  ? 'bg-amber-500/15 text-[#F59E0B]'
                  : 'bg-rose-500/15 text-[#EF4444]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isSafe ? 'bg-[#22C55E]' : currentPercentage >= 70 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                }`} />
                <span>{isSafe ? 'SAFE' : currentPercentage >= 70 ? 'WATCH' : 'AT RISK'}</span>
              </span>
            </div>
            
            {/* 3-Dot Action Menu */}
            <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#0F172A] transition-colors cursor-pointer"
                aria-label="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-slate-200 dark:border-[#26354A] py-1.5 z-20 overflow-hidden origin-top-right">
                  <button 
                    onClick={() => { setShowMenu(false); onViewDetails && onViewDetails(subject.id); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-[#38BDF8]" /> View Details
                  </button>
                  <button 
                    onClick={() => { setShowMenu(false); onEdit && onEdit(subject); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#22C55E]" /> Edit Subject
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-[#26354A] my-1"></div>
                  <button 
                    onClick={() => { setShowMenu(false); onDelete && onDelete(subject); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" /> Delete Subject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Lecture Count & Clear Action Needed */}
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-500 dark:text-[#94A3B8]">
            {subject.attended} / {subject.total} lectures
          </span>
          <span className={`text-[11px] font-semibold ${
            isSafe 
              ? 'text-emerald-600 dark:text-[#22C55E]' 
              : currentPercentage >= 70 
              ? 'text-amber-600 dark:text-[#F59E0B]' 
              : 'text-rose-600 dark:text-[#EF4444]'
          }`}>
            {isSafe 
              ? (safeToMiss > 0 ? `Can miss ${safeToMiss} class${safeToMiss === 1 ? '' : 'es'}` : `Target ${target}% reached`) 
              : `Need ${requiredConsecutive} class${requiredConsecutive === 1 ? '' : 'es'} to reach ${target}%`
            }
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-[#0F172A] rounded-full h-1.5 mb-3 overflow-hidden border border-slate-200 dark:border-[#26354A]/60" id={`subject-progress-container-${subject.id}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isSafe ? 'bg-[#22C55E]' : currentPercentage >= 70 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
            }`}
            style={{ width: `${Math.min(100, currentPercentage)}%` }}
            id={`subject-progress-bar-${subject.id}`}
          />
        </div>
      </div>

      {/* Quick Action Logging Buttons */}
      <div 
        className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#26354A]/60" 
        id={`subject-actions-${subject.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onLogAttendance(subject.id, 'present')}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#22C55E]/30"
          id={`btn-present-${subject.id}`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Present</span>
        </button>
        <button
          onClick={() => onLogAttendance(subject.id, 'absent')}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#EF4444]/30"
          id={`btn-absent-${subject.id}`}
        >
          <X className="w-3.5 h-3.5" />
          <span>Absent</span>
        </button>
      </div>
    </div>
  );
}
