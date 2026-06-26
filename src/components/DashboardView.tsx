import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckSquare, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Activity,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Subject } from '../types';
import DashboardStats from './DashboardStats';
import AttendanceRiskCard from './AttendanceRiskCard';

interface DashboardViewProps {
  subjects: Subject[];
  stats: {
    totalSubjects: number;
    overallPercentage: number;
    totalAttended: number;
    totalConducted: number;
    safeSubjects: number;
    belowTargetSubjects: number;
  };
  riskData: {
    riskScore: number;
    riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    overallAttendance: number;
    remainingSafeBunks: number;
    reasons: string[];
  };
  onAddSubject: () => void;
  onLogAttendance: (subjectId: string, status: 'present' | 'absent') => void;
  setActivePage: (page: string) => void;
  activities: Array<{ id: string; text: string; time: string }>;
}

export default function DashboardView({
  subjects,
  stats,
  riskData,
  onAddSubject,
  onLogAttendance,
  setActivePage,
  activities,
}: DashboardViewProps) {

  // Current Date display helper
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Safe Bunks display
  const totalSafeBunks = riskData.remainingSafeBunks;

  // Generate dynamic AI Recommendation
  const getAIRecommendation = () => {
    if (subjects.length === 0) {
      return {
        text: "Register your first subject using 'Add Subject' to start receiving smart AI attendance suggestions.",
        type: 'info',
        title: 'Get Started'
      };
    }

    const worstSubject = [...subjects]
      .filter(s => s.total > 0)
      .map(s => ({
        ...s,
        pct: (s.attended / s.total) * 100
      }))
      .sort((a, b) => a.pct - b.pct)[0];

    if (worstSubject && worstSubject.pct < worstSubject.targetPercentage) {
      const targetFrac = worstSubject.targetPercentage / 100;
      let required = 0;
      if (targetFrac < 1.0) {
        required = Math.ceil((targetFrac * worstSubject.total - worstSubject.attended) / (1 - targetFrac));
      } else {
        required = 999;
      }
      return {
        text: `Urgent attention required for ${worstSubject.name}. Your attendance is at ${worstSubject.pct.toFixed(1)}%. You must attend the next ${required} classes consecutively to reach your ${worstSubject.targetPercentage}% target!`,
        type: 'danger',
        title: 'Critical Risk Alert'
      };
    }

    if (stats.overallPercentage < 75) {
      return {
        text: `Your overall attendance is ${stats.overallPercentage}%, which is below the safe threshold of 75%. Try to log Present in your upcoming classes to prevent detention risk.`,
        type: 'warning',
        title: 'Improve Overall Standing'
      };
    }

    return {
      text: `All systems nominal! Your overall attendance is in outstanding standing (${stats.overallPercentage}%). You have ${totalSafeBunks} safe bunks remaining. Excellent planning!`,
      type: 'success',
      title: 'Smart Advisor Status'
    };
  };

  const aiRecommendation = getAIRecommendation();

  // Create a structured schedule for today based on registered subjects
  const getTodaySchedule = () => {
    const defaultSlots = [
      '09:00 AM - 10:00 AM',
      '11:00 AM - 12:00 PM',
      '01:30 PM - 02:30 PM',
      '03:00 PM - 04:00 PM',
      '04:15 PM - 05:15 PM'
    ];

    return subjects.slice(0, 5).map((sub, idx) => ({
      id: sub.id,
      name: sub.name,
      time: defaultSlots[idx] || 'TBD',
      percentage: sub.total > 0 ? (sub.attended / sub.total) * 100 : 100,
      target: sub.targetPercentage,
    }));
  };

  const todaySchedule = getTodaySchedule();

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-view-stage">
      
      {/* Top Section: Welcome Header & Quick Stats Circular Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-welcome-banner-grid">
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col justify-between relative overflow-hidden" id="dashboard-welcome-card">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 translate-y-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="z-10">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-500/20 px-3 py-1 rounded-full">
              Student Workspace
            </span>
            <h2 className="text-2xl md:text-3xl font-black mt-4 tracking-tight leading-tight">
              Welcome back, Scholar! 👋
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-2 font-medium leading-relaxed max-w-md">
              Semester 4 • Department of Computer Science & Engineering
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-indigo-500/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4 z-10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
              <span className="text-xs font-bold text-slate-200 tracking-wide">{formatDate()}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-300 bg-slate-800/60 px-3 py-1 rounded-xl">
              Target Attendance Goal: <strong className="text-white">75.0%</strong>
            </div>
          </div>
        </div>

        {/* Safe Bunks Remaining Overview Card */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col justify-between" id="dashboard-safe-bunks-summary">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full">
              Instant Check
            </span>
          </div>

          <div className="my-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1] uppercase tracking-widest block mb-1">
              Safe Bunks Remaining
            </span>
            <h3 className="text-4xl font-black text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-baseline gap-1.5">
              {totalSafeBunks}
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">classes</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1] font-medium mt-1 leading-relaxed">
              Cumulative lectures you can safely skip across all active subjects without falling below targets.
            </p>
          </div>

          <button 
            onClick={() => setActivePage('subjects')}
            className="w-full flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 py-3 px-4 rounded-xl transition-all cursor-pointer group"
          >
            <span>Verify per-subject safe margin</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Aggregate Stats Row */}
      <DashboardStats stats={stats} />

      {/* Second Section: Attendance Risk Assessments */}
      <AttendanceRiskCard riskData={riskData} />

      {/* Third Section: Today's Schedule & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="dashboard-middle-section">
        
        {/* Today's Schedule */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col justify-between" id="dashboard-schedule-panel">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Today's Lecture Schedule
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full uppercase">
                Active Logs
              </span>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <span className="text-xs font-semibold">No subjects registered yet.</span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">Add subjects to populate your daily schedule planner.</p>
              </div>
            ) : (
              <div className="space-y-4" id="today-schedule-list">
                {todaySchedule.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-[#1E293B]/40 rounded-2xl gap-3 border border-slate-50 dark:border-[#334155]/60 transition-all hover:bg-slate-100/50 dark:hover:bg-[#1E293B]/80"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-1">{item.time}</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] tracking-tight">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold ${item.percentage >= item.target ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {item.percentage.toFixed(1)}% attendance
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">• Goal: {item.target}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 sm:self-center">
                      <button
                        onClick={() => onLogAttendance(item.id, 'present')}
                        className="bg-white dark:bg-[#1F2937] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-[#CBD5E1] hover:text-emerald-700 dark:hover:text-emerald-400 font-bold py-1.5 px-3 rounded-xl text-[10px] transition-all cursor-pointer border border-slate-200/60 dark:border-[#334155] shadow-2xs"
                        id={`btn-schedule-present-${item.id}`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => onLogAttendance(item.id, 'absent')}
                        className="bg-white dark:bg-[#1F2937] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-[#CBD5E1] hover:text-rose-700 dark:hover:text-rose-400 font-bold py-1.5 px-3 rounded-xl text-[10px] transition-all cursor-pointer border border-slate-200/60 dark:border-[#334155] shadow-2xs"
                        id={`btn-schedule-absent-${item.id}`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-semibold text-center border-t border-slate-50 dark:border-[#334155] pt-3">
            Logs from Today's Schedule automatically updates your main registers.
          </div>
        </div>

        {/* AI Recommendations Box */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col justify-between" id="dashboard-recommendation-panel">
          <div>
            <div className="flex items-center gap-2 mb-6" id="ai-advisor-title">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">AI Co-Pilot Recommendation</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Smart academic strategy analysis</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-100/50 dark:border-[#334155]/50" id="ai-advisor-content-box">
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${
                aiRecommendation.type === 'danger' ? 'text-rose-600 dark:text-rose-400' :
                aiRecommendation.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {aiRecommendation.title}
              </span>
              <p className="text-slate-600 dark:text-[#CBD5E1] text-xs font-semibold leading-relaxed">
                {aiRecommendation.text}
              </p>
            </div>

            {/* Quick insights lists */}
            {subjects.length > 0 && (
              <div className="mt-6 space-y-2.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Core Strategies</span>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-[#CBD5E1] font-medium">
                  <span className="text-indigo-500 shrink-0">•</span>
                  <span>Avoid skipping multiple consecutive classes to prevent rapid risk score gains.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-[#CBD5E1] font-medium">
                  <span className="text-indigo-500 shrink-0">•</span>
                  <span>Use the **Predictor simulator** to preview exam eligibility before skipping.</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActivePage('predictor')}
            className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            Launch Simulator
          </button>
        </div>
      </div>

      {/* Fourth Section: Quick Actions Panel */}
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="dashboard-quick-actions-panel">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-indigo-500" />
          Quick Actions Shortcuts
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-quick-actions-grid">
          {/* Mark Attendance */}
          <button
            onClick={() => setActivePage('subjects')}
            className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-[#1E293B]/40 hover:bg-slate-100/70 dark:hover:bg-[#1E293B]/80 border border-slate-100 dark:border-[#334155]/60 rounded-2xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] block">Mark Attendance</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Quick register update</span>
            </div>
          </button>

          {/* Add Subject */}
          <button
            onClick={onAddSubject}
            className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-[#1E293B]/40 hover:bg-slate-100/70 dark:hover:bg-[#1E293B]/80 border border-slate-100 dark:border-[#334155]/60 rounded-2xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] block">Add New Subject</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Track another course</span>
            </div>
          </button>

          {/* View Analytics */}
          <button
            onClick={() => setActivePage('analytics')}
            className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-[#1E293B]/40 hover:bg-slate-100/70 dark:hover:bg-[#1E293B]/80 border border-slate-100 dark:border-[#334155]/60 rounded-2xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl shrink-0 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] block">View Analytics</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Observe trends & charts</span>
            </div>
          </button>

          {/* Open Predictor */}
          <button
            onClick={() => setActivePage('predictor')}
            className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-[#1E293B]/40 hover:bg-slate-100/70 dark:hover:bg-[#1E293B]/80 border border-slate-100 dark:border-[#334155]/60 rounded-2xl text-left transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] block">Open Predictor</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Simulate future bails</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Activities Feed */}
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="dashboard-recent-activity-panel">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Recent Log Activity Logs
          </h3>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            Chronological
          </span>
        </div>

        <div className="space-y-4" id="recent-activity-timeline">
          {activities && activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-[#1E293B]/20 rounded-2xl border border-slate-50 dark:border-[#334155]/40 text-xs" id={`activity-item-${act.id}`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">{act.text}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">{act.time}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">
              No logged activities during this session. Logging attendance creates timelines.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
