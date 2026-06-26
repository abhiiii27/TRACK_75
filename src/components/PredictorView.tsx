import React from 'react';
import { HelpCircle, ShieldCheck, ShieldAlert, TrendingUp } from 'lucide-react';
import { Subject, PredictionResult } from '../types';
import PredictorForm from './PredictorForm';

interface PredictorViewProps {
  subjects: Subject[];
  onPredict: (subjectId: string, upcomingClasses: number, expectedAttendanceRate: number) => Promise<PredictionResult>;
}

export default function PredictorView({ subjects, onPredict }: PredictorViewProps) {
  return (
    <div className="space-y-6 animate-fade-in" id="predictor-view-stage">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          AI Attendance Simulation & Predictor
        </h2>
        <p className="text-xs text-slate-400 dark:text-[#CBD5E1] font-medium">Model custom scenarios to preview future attendance ratios and keep safe from detention</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="predictor-page-layout">
        
        {/* Left/Center Column: Main Calculator Form & Outputs */}
        <div className="lg:col-span-2" id="predictor-calculator-column">
          <PredictorForm subjects={subjects} onPredict={onPredict} />
        </div>

        {/* Right Column: Dynamic Simulation Helper Card */}
        <div className="lg:col-span-1 space-y-6" id="predictor-guide-column">
          
          {/* Quick Simulation Guides */}
          <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs space-y-5" id="predictor-how-it-works">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
              How Simulation Works
            </h3>

            <div className="space-y-4 text-xs text-slate-600 dark:text-[#CBD5E1] font-medium leading-relaxed">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <strong className="text-slate-800 dark:text-[#F8FAFC]">Select Subject:</strong> Choose any active course register to simulate goals for.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <strong className="text-slate-800 dark:text-[#F8FAFC]">Set Upcoming Lectures:</strong> Choose how many upcoming classes are left or scheduled in the coming weeks.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <strong className="text-slate-800 dark:text-[#F8FAFC]">Expected Attendance Rate:</strong> Slider representing your personal confidence to attend scheduled lectures.
                </div>
              </div>
            </div>

            <div className="border-t border-slate-50 dark:border-[#334155] pt-4 text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
              The AI Co-pilot models these inputs against your current logs, evaluating required consecutive attendances or safe skip quotas.
            </div>
          </div>

          {/* Core Safe Skipping Rules */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden" id="predictor-rules-guide">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">
              Strategic Guide
            </h3>
            <h4 className="text-sm font-bold text-white mb-2 leading-tight">
              Rule of Thumb for Safe Bunks
            </h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
              A single safe bunk requires that your current percentage remains higher than your target percentage by at least one class's total share.
            </p>

            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 space-y-2.5 text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Percent &ge; Target: Bunks are secure</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Percent &lt; Target: Attend consecutive lectures</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
