import React from 'react';
import { AIRecommendationResponse } from '../types';
import { Target, ArrowUpCircle, ArrowDownCircle, CheckCircle, AlertTriangle, Info, ListTodo, Activity } from 'lucide-react';

interface AIRecommendationPanelProps {
  data: AIRecommendationResponse | null;
}

const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-[#26354A] space-y-4">
      
      {/* Header */}
      <div className="flex items-center space-x-2.5 border-b border-slate-200 dark:border-[#26354A] pb-3">
        <div className="p-2 bg-[#38BDF8]/10 text-[#38BDF8] rounded-lg">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Attendance Recommendations</h2>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Deterministic recovery targets and study priorities</p>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-slate-50 dark:bg-[#0F172A] rounded-lg p-3.5 border border-slate-200 dark:border-[#26354A]">
        <div className="flex items-center space-x-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">Today's Priority Focus</h3>
        </div>
        <p className="text-xs sm:text-sm font-semibold leading-snug text-slate-900 dark:text-[#F8FAFC]">{data.todayFocus}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#22C55E]/10 rounded-lg p-3 border border-[#22C55E]/20">
          <div className="flex items-center space-x-1.5 mb-1">
            <ArrowUpCircle className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Strongest</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] line-clamp-2 leading-tight">{data.strongestSubject}</p>
        </div>
        <div className="bg-[#EF4444]/10 rounded-lg p-3 border border-[#EF4444]/20">
          <div className="flex items-center space-x-1.5 mb-1">
            <ArrowDownCircle className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider">Needs Attention</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] line-clamp-2 leading-tight">{data.weakestSubject}</p>
        </div>
      </div>

      {/* Summary & Trajectory */}
      <div className="bg-slate-50 dark:bg-[#0F172A] rounded-lg p-3.5 space-y-2.5 border border-slate-200 dark:border-[#26354A]">
        <div className="flex items-start space-x-2.5">
          <Activity className="w-4 h-4 text-[#38BDF8] mt-0.5 shrink-0" />
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Attendance Trajectory</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-line leading-relaxed">{data.attendanceSummary}</p>
          </div>
        </div>
        <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200 dark:border-[#26354A]">
          <Info className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Key Note</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{data.motivationMessage}</p>
          </div>
        </div>
      </div>

      {/* Priority Tasks */}
      <div>
        <div className="flex items-center space-x-2 mb-2.5">
          <ListTodo className="w-4 h-4 text-slate-500 dark:text-[#94A3B8]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Action Items</h3>
        </div>
        <div className="space-y-2">
          {data.priorityTasks.map((task) => (
            <div key={task.id} className="bg-slate-50 dark:bg-[#0F172A] rounded-lg p-3 border border-slate-200 dark:border-[#26354A] flex items-start space-x-2.5">
              <div className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${
                task.priority === 'High' ? 'bg-[#EF4444]' : 
                task.priority === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                    {task.title}
                  </h4>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                    task.priority === 'High' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 
                    task.priority === 'Medium' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 
                    'bg-[#22C55E]/20 text-[#22C55E]'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{task.action}</p>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">{task.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Plan */}
      <div className="bg-slate-50 dark:bg-[#0F172A] rounded-lg p-3.5 border border-slate-200 dark:border-[#26354A]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Recovery Steps</h3>
        <div className="space-y-1.5">
          {data.recoveryPlan.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{step}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default React.memo(AIRecommendationPanel);
