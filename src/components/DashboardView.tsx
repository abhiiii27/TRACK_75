import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  ChevronRight,
  Plus,
  BookOpen,
  TrendingUp,
  BarChart3,
  Check,
  X,
  Clock,
  Activity,
  BellRing
} from 'lucide-react';
import { Subject, AIPredictionResponse, AIRecommendationResponse, Notification } from '../types';
import DashboardStats from './DashboardStats';
import AttendanceRiskCard from './AttendanceRiskCard';
import AIPredictionPanel from './AIPredictionPanel';
import AIRecommendationPanel from './AIRecommendationPanel';

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
  predictionData?: AIPredictionResponse | null;
  recommendationData?: AIRecommendationResponse | null;
  onAddSubject: () => void;
  onLogAttendance: (subjectId: string, status: 'present' | 'absent') => void;
  setActivePage: (page: string) => void;
  activities: Array<{ id: string; text: string; time: string }>;
}

export default function DashboardView({
  subjects,
  stats,
  riskData,
  predictionData,
  recommendationData,
  onAddSubject,
  onLogAttendance,
  setActivePage,
  activities,
}: DashboardViewProps) {

  // Current Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Format today's date
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  // Dynamic student name
  const studentName = useMemo(() => {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const parsed = JSON.parse(authUserStr);
        if (parsed.fullName) return parsed.fullName.split(' ')[0];
      }
    } catch {}
    return localStorage.getItem('profile_name')?.split(' ')[0] || 'Student';
  }, []);

  // Fetch Latest Alert
  const [latestAlert, setLatestAlert] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchLatestAlert = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const alerts: Notification[] = data.notifications || [];
          const targetAlert = alerts.find(n => 
            n.status === 'unread' && (n.type === 'Critical' || n.type === 'Warning')
          );
          if (targetAlert) {
            setLatestAlert(targetAlert);
          }
        }
      } catch (e) {
        console.error("Failed to fetch notification alert", e);
      }
    };
    fetchLatestAlert();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-5xl mx-auto" id="dashboard-view-stage">
      
      {/* Greeting & Subtext Header */}
      <div className="flex items-center justify-between gap-3 pt-1 pb-1" id="dashboard-greeting-header">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight flex items-center gap-2">
            <span>{greeting}, {studentName}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium mt-0.5">
            {stats.belowTargetSubjects > 0 
              ? `${stats.belowTargetSubjects} subject${stats.belowTargetSubjects > 1 ? 's need' : ' needs'} attention this week.`
              : 'All subjects are on track above target.'
            }
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] text-xs font-semibold text-slate-600 dark:text-[#94A3B8] shrink-0">
          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-[#38BDF8]" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Priority 1: Overall Attendance Hero */}
      <DashboardStats stats={stats} />

      {/* Priority 2: Eligibility & Risk Assessment */}
      <AttendanceRiskCard riskData={riskData} />

      {/* Alert Banner (if critical or warning unread) */}
      {latestAlert && (
        <div className={`rounded-xl p-3.5 sm:p-4 border flex items-start justify-between gap-3 ${
          latestAlert.type === 'Critical' 
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200' 
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200'
        }`}>
          <div className="flex items-start gap-2.5 min-w-0">
            <BellRing className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                {latestAlert.type} Alert
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate mt-0.5">{latestAlert.title}</p>
              <p className="text-[11px] opacity-90 line-clamp-2 mt-0.5">{latestAlert.message}</p>
            </div>
          </div>
          {latestAlert.action && (
            <button 
              onClick={() => setActivePage('subjects')}
              className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#38BDF8] text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Resolve
            </button>
          )}
        </div>
      )}

      {/* Compact Mobile-Friendly Quick Actions */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3" id="dashboard-quick-actions">
        <button
          onClick={() => setActivePage('subjects')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] shadow-xs hover:bg-slate-50 dark:hover:bg-[#26354A]/40 transition-all cursor-pointer group active:scale-[0.98]"
          id="quick-action-mark-attendance"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-[#22C55E] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-[#F8FAFC] text-center leading-tight">
            Mark Attendance
          </span>
        </button>

        <button
          onClick={() => setActivePage('predictor')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] shadow-xs hover:bg-slate-50 dark:hover:bg-[#26354A]/40 transition-all cursor-pointer group active:scale-[0.98]"
          id="quick-action-bunk-planner"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-[#38BDF8] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-[#F8FAFC] text-center leading-tight">
            Bunk Planner
          </span>
        </button>

        <button
          onClick={() => setActivePage('analytics')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] shadow-xs hover:bg-slate-50 dark:hover:bg-[#26354A]/40 transition-all cursor-pointer group active:scale-[0.98]"
          id="quick-action-view-analytics"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-[#F8FAFC] text-center leading-tight">
            View Analytics
          </span>
        </button>
      </div>

      {/* Priority 3: Subject Attendance Quick Registers */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-xs" id="dashboard-subject-attendance">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-[#38BDF8]" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Subject Attendance
            </h2>
          </div>
          <button
            onClick={() => setActivePage('subjects')}
            className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-[#38BDF8] hover:underline cursor-pointer"
          >
            <span>See All ({subjects.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-[#94A3B8] border border-dashed border-slate-200 dark:border-[#26354A] rounded-xl">
            <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">No subjects added yet.</p>
            <p className="text-[11px] mt-1 text-slate-500 dark:text-[#94A3B8]">Add your semester subjects to start logging attendance.</p>
            <button
              onClick={onAddSubject}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8] text-slate-950 font-bold text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Subject
            </button>
          </div>
        ) : (
          <div className="space-y-2.5" id="dashboard-subjects-list">
            {subjects.map((sub) => {
              const currentPercent = sub.total > 0 ? (sub.attended / sub.total) * 100 : 100;
              const isSafe = currentPercent >= sub.targetPercentage;
              
              // Safe bunks or required classes for this subject
              const targetFrac = sub.targetPercentage / 100;
              let safeBunks = 0;
              let neededConsecutive = 0;

              if (currentPercent >= sub.targetPercentage) {
                if (targetFrac > 0) {
                  safeBunks = Math.max(0, Math.floor((sub.attended - targetFrac * sub.total) / targetFrac));
                }
              } else {
                if (targetFrac < 1.0) {
                  neededConsecutive = Math.max(0, Math.ceil((targetFrac * sub.total - sub.attended) / (1.0 - targetFrac)));
                }
              }

              return (
                <div 
                  key={sub.id}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#26354A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  id={`dashboard-subject-item-${sub.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                          {sub.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSafe 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#22C55E]' 
                            : currentPercent >= 70
                            ? 'bg-amber-500/15 text-amber-600 dark:text-[#F59E0B]'
                            : 'bg-rose-500/15 text-rose-600 dark:text-[#EF4444]'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            isSafe ? 'bg-emerald-500 dark:bg-[#22C55E]' : currentPercent >= 70 ? 'bg-amber-500 dark:bg-[#F59E0B]' : 'bg-rose-500 dark:bg-[#EF4444]'
                          }`} />
                          <span>{isSafe ? 'SAFE' : currentPercent >= 70 ? 'WATCH' : 'AT RISK'}</span>
                        </span>
                      </div>
                      <span className={`text-xs sm:text-sm font-extrabold ${
                        isSafe 
                          ? 'text-emerald-600 dark:text-[#22C55E]' 
                          : currentPercent >= 70
                          ? 'text-amber-600 dark:text-[#F59E0B]'
                          : 'text-rose-600 dark:text-[#EF4444]'
                      }`}>
                        {currentPercent.toFixed(1)}%
                      </span>
                    </div>

                    {/* Small clean progress indicator */}
                    <div className="w-full bg-slate-200 dark:bg-[#0F172A] rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-[#26354A]/60 my-1.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSafe 
                            ? 'bg-emerald-500 dark:bg-[#22C55E]' 
                            : currentPercent >= 70
                            ? 'bg-amber-500 dark:bg-[#F59E0B]'
                            : 'bg-rose-500 dark:bg-[#EF4444]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, currentPercent))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8]">
                      <span>{sub.attended} / {sub.total} classes</span>
                      <span className={`font-semibold ${
                        isSafe 
                          ? 'text-emerald-600 dark:text-[#22C55E]' 
                          : currentPercent >= 70
                          ? 'text-amber-600 dark:text-[#F59E0B]'
                          : 'text-rose-600 dark:text-[#EF4444]'
                      }`}>
                        {isSafe 
                          ? (safeBunks > 0 ? `Can miss ${safeBunks} class${safeBunks === 1 ? '' : 'es'}` : `Target ${sub.targetPercentage}% reached`)
                          : `Need ${neededConsecutive} class${neededConsecutive === 1 ? '' : 'es'} to reach ${sub.targetPercentage}%`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Quick Mark Present/Absent Touch Targets */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                    <button
                      onClick={() => onLogAttendance(sub.id, 'present')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-[#22C55E] hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                      title="Mark Present"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => onLogAttendance(sub.id, 'absent')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-[#EF4444] hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                      title="Mark Absent"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Priority 4 & 5: Forecast & Simulator Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance Projection */}
        <AIPredictionPanel predictionData={predictionData} />

        {/* Quick Tools & Bunk Simulator Banner */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] flex flex-col justify-between" id="dashboard-quick-tools-card">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-sky-600 dark:text-[#38BDF8]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Attendance & Bunk Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Model upcoming lectures to know exactly how missing a class will affect your eligibility before the exam.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <button
              onClick={() => setActivePage('predictor')}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-[#38BDF8] hover:bg-sky-100 dark:hover:bg-sky-500/25 border border-sky-200 dark:border-sky-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Bunk Simulator</span>
            </button>
            <button
              onClick={() => setActivePage('analytics')}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-100 dark:bg-[#172033] text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-[#26354A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-600 dark:text-[#38BDF8]" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Priority 6: Actionable Recommendations */}
      <AIRecommendationPanel data={recommendationData} />

      {/* Priority 7: Recent Activity Feed */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-xs" id="dashboard-recent-activity-panel">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600 dark:text-[#38BDF8]" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider">
              Recent Activity
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Session Logs</span>
        </div>

        <div className="space-y-2">
          {activities && activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#172033] rounded-lg border border-slate-200 dark:border-[#26354A] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[#38BDF8] shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-[#F8FAFC] truncate">{act.text}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] whitespace-nowrap shrink-0 ml-2">{act.time}</span>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-xs text-slate-500 dark:text-[#94A3B8]">No activity logged in this session.</p>
          )}
        </div>
      </div>

    </div>
  );
}
