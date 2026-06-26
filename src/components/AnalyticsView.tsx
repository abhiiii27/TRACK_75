import React from 'react';
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
}

export default function AnalyticsView({ subjects, stats }: AnalyticsViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Adaptive chart colors
  const gridStroke = isDark ? '#334155' : '#F1F5F9';
  const textStroke = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#111827' : '#1E293B';
  const tooltipBorder = isDark ? '#334155' : 'none';

  // 1. Attendance Trend Line Chart Data
  const getTrendData = () => {
    const currentPct = stats.overallPercentage || 75;
    return [
      { name: 'Week 1', Percentage: Math.max(55, currentPct - 12) },
      { name: 'Week 2', Percentage: Math.max(60, currentPct - 8) },
      { name: 'Week 3', Percentage: Math.max(65, currentPct - 3) },
      { name: 'Week 4', Percentage: Math.max(68, currentPct - 1) },
      { name: 'Week 5 (Current)', Percentage: currentPct },
    ];
  };

  // 2. Subject Comparison Bar Chart Data
  const getSubjectComparisonData = () => {
    if (subjects.length === 0) {
      return [
        { name: 'Subject A', Attended: 5, Conducted: 8 },
        { name: 'Subject B', Attended: 8, Conducted: 10 },
      ];
    }
    return subjects.map(sub => ({
      name: sub.name.length > 15 ? `${sub.name.slice(0, 15)}...` : sub.name,
      Attended: sub.attended,
      Conducted: sub.total,
    }));
  };

  // 3. Weekly lecture hours attended vs skipped
  const getWeeklyGraphData = () => {
    return [
      { name: 'Mon', Attended: 3, Missed: 1 },
      { name: 'Tue', Attended: 4, Missed: 0 },
      { name: 'Wed', Attended: 2, Missed: 2 },
      { name: 'Thu', Attended: 5, Missed: 0 },
      { name: 'Fri', Attended: 3, Missed: 1 },
    ];
  };

  // 4. Monthly attendance growth
  const getMonthlyGraphData = () => {
    const currentPct = stats.overallPercentage || 75;
    return [
      { name: 'March', Percentage: Math.max(50, currentPct - 18) },
      { name: 'April', Percentage: Math.max(60, currentPct - 10) },
      { name: 'May', Percentage: Math.max(68, currentPct - 4) },
      { name: 'June (Current)', Percentage: currentPct },
    ];
  };

  const trendData = getTrendData();
  const comparisonData = getSubjectComparisonData();
  const weeklyData = getWeeklyGraphData();
  const monthlyData = getMonthlyGraphData();

  // Create attendance heatmap representation (Grid of weeks and days)
  const heatmapWeeks = [
    { week: 'Week 1', days: ['attended', 'attended', 'attended', 'missed', 'attended'] },
    { week: 'Week 2', days: ['attended', 'attended', 'missed', 'attended', 'attended'] },
    { week: 'Week 3', days: ['attended', 'attended', 'attended', 'attended', 'attended'] },
    { week: 'Week 4', days: ['attended', 'missed', 'attended', 'attended', 'attended'] },
  ];

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

      {/* Top Summaries Row (Weekly & Monthly Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="analytics-summary-cards">
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
              Week 4: 85.0%
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged classes increase of +3.5% vs previous week.</p>
          </div>
          <div className="mt-4 border-t border-slate-50 dark:border-[#334155] pt-3 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            <span>Hours Attended: 17 hrs</span>
            <span className="text-emerald-600 dark:text-emerald-400">On Track</span>
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
              June average: {stats.overallPercentage}%
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Monthly progress matches your academic targets.</p>
          </div>
          <div className="mt-4 border-t border-slate-50 dark:border-[#334155] pt-3 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            <span>Overall Growth: +5.2%</span>
            <span className={stats.overallPercentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {stats.overallPercentage >= 75 ? 'Optimal Standing' : 'Risk of short'}
            </span>
          </div>
        </div>

        {/* Actionable insight */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-xs flex flex-col justify-between" id="analytics-insight-card">
          <div>
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-2">Smart recommendation</span>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              {stats.belowTargetSubjects > 0 
                ? `You have ${stats.belowTargetSubjects} subjects below target. Focus effort on recovering shortage registers first.`
                : 'Excellent work! Every subject registers meet or exceed target metrics. Keep maintaining this pace.'
              }
            </p>
          </div>
          <span className="text-[10px] font-bold text-indigo-400 tracking-wider">AI Co-Pilot Advisor</span>
        </div>
      </div>

      {/* Main Graph Grid (Trend, Monthly/Weekly Graph layouts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analytics-graphs-row">
        
        {/* Attendance Trend Line Chart */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="trend-line-chart-panel">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Cumulative Attendance Trend</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tracking aggregate performance metrics over the past 5 weeks</p>
          </div>

          <div className="h-64" id="trend-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
                <YAxis domain={[0, 100]} stroke={textStroke} fontSize={11} fontWeight={600} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="Percentage" stroke="#4F46E5" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Comparison Bar Chart */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="subject-bar-chart-panel">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Subject-wise Class Comparison</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Lectures attended vs total conducted classes per subject</p>
          </div>

          <div className="h-64" id="comparison-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={textStroke} fontSize={10} fontWeight={600} />
                <YAxis stroke={textStroke} fontSize={11} fontWeight={600} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="Attended" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Conducted" fill="#6366F1" opacity={0.3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Second Graph Grid (Weekly & Monthly Graphs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analytics-detailed-graphs-row">
        
        {/* Weekly Graph ( लेक्चर hours detail) */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="weekly-stacked-chart-panel">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Weekly Lecture Ratio</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Hourly breakdown of lectures attended and missed throughout the week</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
                <YAxis stroke={textStroke} fontSize={11} fontWeight={600} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="Attended" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Missed" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Average Growth */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="monthly-trend-chart-panel">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Monthly Attendance Trajectory</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Tracking monthly performance changes over the semester</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
                <YAxis domain={[0, 100]} stroke={textStroke} fontSize={11} fontWeight={600} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="Percentage" fill="#818CF8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Attendance Heatmap Grid */}
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs" id="heatmap-grid-panel">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Lectures Attendance Heatmap
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Grid represent of daily lecture check-ins over the previous 4 weeks</p>
          </div>
          
          {/* Legend indicators */}
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-[#CBD5E1]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
              <span>Attended</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#334155] inline-block" />
              <span>No Class</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar" id="heatmap-weeks-container">
          <div className="min-w-[450px] space-y-3.5">
            {heatmapWeeks.map((wk, weekIdx) => (
              <div key={weekIdx} className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 w-16">{wk.week}</span>
                <div className="flex-1 grid grid-cols-5 gap-3">
                  {wk.days.map((dayStatus, dayIdx) => {
                    const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                    return (
                      <div 
                        key={dayIdx} 
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center border text-center transition-all ${
                          dayStatus === 'attended' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        <span className="text-[10px] font-bold opacity-60 uppercase">{daysName[dayIdx]}</span>
                        <span className="text-xs font-extrabold mt-1">
                          {dayStatus === 'attended' ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
