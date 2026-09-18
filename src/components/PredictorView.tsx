import React, { useState } from 'react';
import { ArrowLeft, Calendar, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Subject, PredictionResult } from '../types';
import PredictorForm from './PredictorForm';

interface PredictorViewProps {
  subjects: Subject[];
  onPredict: (subjectId: string, upcomingClasses: number, expectedAttendanceRate: number) => Promise<PredictionResult>;
  onBack?: () => void;
}

export default function PredictorView({ subjects, onPredict, onBack }: PredictorViewProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Compute total attended and conducted across all subjects
  const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
  const totalConducted = subjects.reduce((acc, s) => acc + s.total, 0);
  const currentPercentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;

  // Compute overall safe bunks before falling below 75%
  // (attended / (conducted + B)) >= 0.75  =>  attended >= 0.75 * conducted + 0.75 * B  =>  B <= (attended - 0.75 * conducted) / 0.75
  const maxSafeBunks = Math.max(0, Math.floor((totalAttended - 0.75 * totalConducted) / 0.75));

  // 5 Scenarios
  const scenarios = [1, 2, 3, 4, 5].map((miss) => {
    const projectedConducted = totalConducted + miss;
    const projectedPercent = projectedConducted > 0 ? (totalAttended / projectedConducted) * 100 : 100;
    const isSafe = projectedPercent >= 75;
    const isWatch = projectedPercent >= 70 && projectedPercent < 75;

    return {
      miss,
      percent: projectedPercent.toFixed(1),
      isSafe,
      isWatch,
    };
  });

  return (
    <div className="space-y-4 animate-fade-in max-w-xl mx-auto" id="bunk-planner-stage">
      
      {/* Top Header matching reference Screen 6 */}
      <div className="flex items-center gap-3 pt-1" id="bunk-planner-header">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-1 -ml-1 text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Bunk Planner
        </h1>
      </div>

      {/* Current Status Card matching reference */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-xs relative">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] block mb-1">
              Current Status
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight block">
              {currentPercentage.toFixed(1)}%
            </span>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-2">
              {maxSafeBunks > 0 
                ? `You can miss ${maxSafeBunks} more ${maxSafeBunks === 1 ? 'lecture' : 'lectures'} and still stay above 75%.`
                : 'You have no safe bunks remaining. Attend upcoming classes to stay eligible.'}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] flex items-center justify-center text-[#38BDF8] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* What if you miss classes? Section */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] block">
          What if you miss classes?
        </span>

        <div className="space-y-2">
          {scenarios.map((sc) => (
            <div 
              key={sc.miss}
              className="bg-white dark:bg-[#1E293B] rounded-xl px-4 py-3 border border-slate-200 dark:border-[#26354A] flex items-center justify-between shadow-xs"
            >
              <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Miss {sc.miss} {sc.miss === 1 ? 'lecture' : 'lectures'}
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                sc.isSafe 
                  ? 'bg-emerald-500/15 text-[#22C55E]' 
                  : sc.isWatch 
                  ? 'bg-amber-500/15 text-[#F59E0B]' 
                  : 'bg-rose-500/15 text-[#EF4444]'
              }`}>
                {sc.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Big Action Button: Plan Ahead */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full h-11 bg-[#38BDF8] hover:bg-sky-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
        id="btn-bunk-planner-plan-ahead"
      >
        <span>Plan Ahead</span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Tip Box matching reference */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3.5 border border-slate-200 dark:border-[#26354A] flex items-start gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[#F59E0B] flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">Tip</span>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Try to maintain a buffer of 2-3% to stay safe against unexpected absences or emergencies.
          </p>
        </div>
      </div>

      {/* Advanced Custom Course Simulator (when Plan Ahead is toggled) */}
      {showAdvanced && (
        <div className="pt-2 animate-fade-in">
          <PredictorForm subjects={subjects} onPredict={onPredict} />
        </div>
      )}

    </div>
  );
}

