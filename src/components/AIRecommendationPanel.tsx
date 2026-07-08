import React from 'react';
import { AIRecommendationResponse } from '../types';
import { Target, ArrowUpCircle, ArrowDownCircle, CheckCircle, AlertTriangle, Info, ListTodo, Activity } from 'lucide-react';

interface AIRecommendationPanelProps {
  data: AIRecommendationResponse | null;
}

const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 pb-24 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">AI Recommendations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Personalized action plan</p>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-indigo-100" />
          <h3 className="font-semibold text-indigo-50">Today's Focus</h3>
        </div>
        <p className="text-lg font-medium leading-tight">{data.todayFocus}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center space-x-2 mb-1">
            <ArrowUpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Strongest</span>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{data.strongestSubject}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/30">
          <div className="flex items-center space-x-2 mb-1">
            <ArrowDownCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Weakest</span>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{data.weakestSubject}</p>
        </div>
      </div>

      {/* Summary & Motivation */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <Activity className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Status Summary</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">{data.attendanceSummary}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Insight</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{data.motivationMessage}</p>
          </div>
        </div>
      </div>

      {/* Priority Tasks */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <ListTodo className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h3 className="font-semibold text-slate-800 dark:text-white">Priority Tasks</h3>
        </div>
        <div className="space-y-3">
          {data.priorityTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
              <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                task.priority === 'High' ? 'bg-rose-500' : 
                task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <span>{task.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    task.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 
                    task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  }`}>
                    {task.priority}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.action}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{task.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Plan */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Recovery Plan</h3>
        <div className="space-y-2">
          {data.recoveryPlan.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 dark:text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default React.memo(AIRecommendationPanel);
