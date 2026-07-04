import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';
import { Subject } from '../types';
import { useTheme } from '../ThemeContext';

interface AnalyticsViewProps {
  subjects: Subject[];
  stats: {
    totalSubjects: number;
    overallPercentage: number;
    totalAttended: number;
    totalConducted: number;
    safeSubjects: number;
    belowTargetSubjects: number;
  };
  analyticsData?: any;
}

// ----------------------------------------------------------------------
// Memoized Sub-components
// ----------------------------------------------------------------------

const SummaryCards = React.memo(({ weeklySummary, monthlySummary }: { weeklySummary: any, monthlySummary: any }) => {
  return (
    <>
      {/* Weekly Summary */}
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col justify-between" id="weekly-summary-card">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 px-2.5 py-1 rounded-full uppercase">
            Weekly Snapshot
          </span>
          <Award className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h4 className="text-xl font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight mb-1">
            {Math.round(weeklySummary.percentage)}%
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged classes variation {weeklySummary.comparison} vs previous week.</p>
        </div>
        <div className="mt-4 border-t border-slate-50 dark:border-[#334155] pt-3 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
          <span>Classes Attended: {weeklySummary.attended}</span>
          <span className={weeklySummary.status === 'On Track' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
            {weeklySummary.status}
          </span>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col justify-between" id="monthly-summary-card">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45 px-2.5 py-1 rounded-full uppercase">
            Monthly Snapshot
          </span>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-xl font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight mb-1">
            Average: {Math.round(monthlySummary.percentage)}%
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Monthly performance variation {monthlySummary.comparison}.</p>
        </div>
        <div className="mt-4 border-t border-slate-50 dark:border-[#334155] pt-3 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
          <span>Classes Attended: {monthlySummary.attended}</span>
          <span className={monthlySummary.status === 'Optimal Standing' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
            {monthlySummary.status}
          </span>
        </div>
      </div>
    </>
  );
});

const AnalyticsInsights = React.memo(({ belowTargetSubjects, smartInsights }: { belowTargetSubjects: number, smartInsights: any }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-xs flex flex-col justify-between" id="analytics-insight-card">
      <div>
        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-2">Smart recommendation</span>
        <p className="text-xs text-slate-300 font-semibold leading-relaxed">
          {belowTargetSubjects > 0 
            ? `You have ${belowTargetSubjects} subjects below target. Focus effort on recovering shortage registers first. Your weakest subject is ${smartInsights.worstSubject}.`
            : `Excellent work! Every subject registers meet or exceed target metrics. Keep maintaining this pace. Your strongest subject is ${smartInsights.bestSubject}.`
          }
        </p>
      </div>
      <span className="text-[10px] font-bold text-indigo-400 tracking-wider">AI Co-Pilot Advisor</span>
    </div>
  );
});

const TrendChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder }: any) => {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="trend-line-chart-panel">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Cumulative Attendance Trend</h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tracking aggregate performance metrics over recent periods</p>
      </div>
      <div className="h-64" id="trend-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
            <YAxis domain={[0, 100]} stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} cursor={{ stroke: textStroke, strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Line type="monotone" dataKey="Percentage" stroke="#4F46E5" strokeWidth={3} activeDot={{ r: 8 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const ComparisonChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder }: any) => {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="subject-bar-chart-panel">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Subject-wise Class Comparison</h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Lectures attended vs total conducted classes per subject</p>
      </div>
      <div className="h-64" id="comparison-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={10} fontWeight={600} />
            <YAxis stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
            <Bar dataKey="Attended" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="Conducted" fill="#6366F1" opacity={0.3} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const WeeklyRatioChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder }: any) => {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="weekly-stacked-chart-panel">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Weekly Lecture Ratio (7 Days)</h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Hourly breakdown of lectures attended and missed</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
            <YAxis stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
            <Bar dataKey="Attended" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="Missed" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const MonthlyTrajectoryChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder }: any) => {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="monthly-trend-chart-panel">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Monthly Attendance Trajectory (6 Months)</h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tracking monthly performance changes over the semester</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
            <YAxis domain={[0, 100]} stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
            <Bar dataKey="Percentage" fill="#818CF8" radius={[8, 8, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const HeatmapRow = React.memo(({ wk }: { wk: any }) => {
  const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="flex items-center gap-4">
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 w-16">{wk.week}</span>
      <div className="flex-1 grid grid-cols-5 gap-3">
        {wk.days.map((dayStatus: string, dayIdx: number) => {
          const isAttended = dayStatus === 'attended';
          const isMissed = dayStatus === 'missed';
          
          return (
            <div 
              key={dayIdx} 
              className={`p-4 rounded-2xl flex flex-col items-center justify-center border text-center transition-all ${
                isAttended 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                  : isMissed
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-bold opacity-60 uppercase">{daysName[dayIdx]}</span>
              <span className="text-xs font-extrabold mt-1">
                {isAttended ? 'Present' : isMissed ? 'Absent' : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const HeatmapGrid = React.memo(({ heatmapWeeks }: { heatmapWeeks: any[] }) => {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="heatmap-grid-panel">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Lectures Attendance Heatmap
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Grid representation of daily lecture check-ins over the previous 4 weeks</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" /><span>Attended</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" /><span>Missed</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#334155] inline-block" /><span>No Class</span></div>
        </div>
      </div>
      <div className="overflow-x-auto no-scrollbar" id="heatmap-weeks-container">
        <div className="min-w-[450px] space-y-3.5">
          {heatmapWeeks.map((wk: any, weekIdx: number) => (
            <HeatmapRow key={weekIdx} wk={wk} />
          ))}
        </div>
      </div>
    </div>
  );
});

// ----------------------------------------------------------------------
// Main AnalyticsView Component
// ----------------------------------------------------------------------

function AnalyticsView({ subjects, stats, analyticsData }: AnalyticsViewProps) {
  const { resolvedTheme } = useTheme();
  
  // Adaptive chart colors (primitive values, stable across renders unless theme changes)
  const isDark = resolvedTheme === 'dark';
  const gridStroke = isDark ? '#334155' : '#F1F5F9';
  const textStroke = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#111827' : '#1E293B';
  const tooltipBorder = isDark ? '#334155' : 'none';

  if (!analyticsData) {
    return (
      <div className="space-y-8 animate-pulse" id="analytics-view-skeleton">
        <div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (stats.totalConducted === 0 || subjects.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center pt-24 text-center px-4 animate-fade-in" id="analytics-empty-state">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <BarChart3 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-[#F8FAFC] mb-2">Not Enough Data Yet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
          Your Analytics Engine is ready, but it needs real attendance logs to generate insights. Start marking attendance on the Dashboard to unlock this view.
        </p>
      </div>
    );
  }

  const { 
    weeklySummary, 
    monthlySummary, 
    subjectComparison, 
    trendData, 
    weeklyGraphData, 
    monthlyGraphData, 
    heatmapWeeks,
    smartInsights
  } = analyticsData;

  // Memoize data transformations to prevent Recharts from remounting or re-rendering on hover
  const formattedComparisonData = useMemo(() => {
    return subjectComparison.map((sub: any) => ({
      name: sub.name.length > 15 ? `${sub.name.slice(0, 15)}...` : sub.name,
      Attended: sub.attended,
      Conducted: sub.totalClasses,
    }));
  }, [subjectComparison]);

  return (
    <div className="space-y-8 animate-fade-in" id="analytics-view-stage">
      
      {/* Title block */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Academic Analytics & Performance Dashboard
        </h2>
        <p className="text-xs text-slate-400 dark:text-[#CBD5E1] font-medium font-sans">Statistical insights, attendance trends, and curriculum comparisons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="analytics-summary-cards">
        <SummaryCards weeklySummary={weeklySummary} monthlySummary={monthlySummary} />
        <AnalyticsInsights belowTargetSubjects={stats.belowTargetSubjects} smartInsights={smartInsights} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analytics-graphs-row">
        <TrendChart data={trendData} gridStroke={gridStroke} textStroke={textStroke} tooltipBg={tooltipBg} tooltipBorder={tooltipBorder} />
        <ComparisonChart data={formattedComparisonData} gridStroke={gridStroke} textStroke={textStroke} tooltipBg={tooltipBg} tooltipBorder={tooltipBorder} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analytics-detailed-graphs-row">
        <WeeklyRatioChart data={weeklyGraphData} gridStroke={gridStroke} textStroke={textStroke} tooltipBg={tooltipBg} tooltipBorder={tooltipBorder} />
        <MonthlyTrajectoryChart data={monthlyGraphData} gridStroke={gridStroke} textStroke={textStroke} tooltipBg={tooltipBg} tooltipBorder={tooltipBorder} />
      </div>

      <HeatmapGrid heatmapWeeks={heatmapWeeks} />

    </div>
  );
}

export default React.memo(AnalyticsView);
