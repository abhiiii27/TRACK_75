import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Award, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
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
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm flex flex-col justify-between" id="weekly-summary-card">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded uppercase">
            Weekly Snapshot
          </span>
          <Award className="w-4 h-4 text-[#38BDF8]" />
        </div>
        <div>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight mb-1">
            {Math.round(weeklySummary.percentage)}%
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Logged classes variation {weeklySummary.comparison} vs previous week.</p>
        </div>
        <div className="mt-3.5 border-t border-slate-200 dark:border-[#26354A] pt-2.5 flex justify-between text-[11px] text-slate-500 dark:text-[#94A3B8] font-semibold">
          <span>Classes Attended: {weeklySummary.attended}</span>
          <span className={weeklySummary.status === 'On Track' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
            {weeklySummary.status}
          </span>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm flex flex-col justify-between" id="monthly-summary-card">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded uppercase">
            Monthly Snapshot
          </span>
          <TrendingUp className="w-4 h-4 text-[#22C55E]" />
        </div>
        <div>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight mb-1">
            {Math.round(monthlySummary.percentage)}%
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Monthly performance variation {monthlySummary.comparison}.</p>
        </div>
        <div className="mt-3.5 border-t border-slate-200 dark:border-[#26354A] pt-2.5 flex justify-between text-[11px] text-slate-500 dark:text-[#94A3B8] font-semibold">
          <span>Classes Attended: {monthlySummary.attended}</span>
          <span className={monthlySummary.status === 'Optimal Standing' ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
            {monthlySummary.status}
          </span>
        </div>
      </div>
    </>
  );
});

const AnalyticsInsights = React.memo(({ belowTargetSubjects, smartInsights }: { belowTargetSubjects: number, smartInsights: any }) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm flex flex-col justify-between" id="analytics-insight-card">
      <div>
        <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider block mb-1.5">Academic Standing</span>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          {belowTargetSubjects > 0 
            ? `You have ${belowTargetSubjects} course(s) below target. Focus effort on recovering shortage registers first. Weakest course: ${smartInsights.worstSubject}.`
            : `Excellent consistency! Every course register meets or exceeds target metrics. Strongest course: ${smartInsights.bestSubject}.`
          }
        </p>
      </div>
      <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] tracking-wide mt-3">Overall Progress Status</span>
    </div>
  );
});

const TrendChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder, tooltipText = '#fff' }: any) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm" id="trend-line-chart-panel">
      <div className="mb-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Cumulative Attendance Trend</h3>
        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Aggregate performance percentage across periods</p>
      </div>
      <div className="h-56 sm:h-64" id="trend-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
            <YAxis domain={[0, 100]} stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', color: tooltipText, fontSize: '11px', fontWeight: 'bold' }} cursor={{ stroke: textStroke, strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Line type="monotone" dataKey="Percentage" stroke="#38BDF8" strokeWidth={2.5} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const ComparisonChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder, tooltipText = '#fff' }: any) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm" id="subject-bar-chart-panel">
      <div className="mb-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Subject-wise Class Comparison</h3>
        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Lectures attended vs total conducted classes per course</p>
      </div>
      <div className="h-56 sm:h-64" id="comparison-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={10} fontWeight={600} />
            <YAxis stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', color: tooltipText, fontSize: '11px', fontWeight: 'bold' }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '10px' }} />
            <Bar dataKey="Attended" fill="#22C55E" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="Conducted" fill="#38BDF8" opacity={0.35} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const WeeklyRatioChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder, tooltipText = '#fff' }: any) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm" id="weekly-stacked-chart-panel">
      <div className="mb-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Weekly Lecture Ratio (7 Days)</h3>
        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Breakdown of lectures attended and missed</p>
      </div>
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
            <YAxis stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', color: tooltipText, fontSize: '11px', fontWeight: 'bold' }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '10px' }} />
            <Bar dataKey="Attended" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="Missed" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const MonthlyTrajectoryChart = React.memo(({ data, gridStroke, textStroke, tooltipBg, tooltipBorder, tooltipText = '#fff' }: any) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm" id="monthly-trend-chart-panel">
      <div className="mb-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Monthly Attendance Trajectory (6 Months)</h3>
        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Tracking monthly performance changes over the semester</p>
      </div>
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontWeight={600} />
            <YAxis domain={[0, 100]} stroke={textStroke} fontSize={11} fontWeight={600} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', color: tooltipText, fontSize: '11px', fontWeight: 'bold' }} />
            <Bar dataKey="Percentage" fill="#38BDF8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const HeatmapRow = React.memo(({ wk }: { wk: any }) => {
  const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold text-slate-500 dark:text-[#94A3B8] w-14 shrink-0">{wk.week}</span>
      <div className="flex-1 grid grid-cols-5 gap-2">
        {wk.days.map((dayStatus: string, dayIdx: number) => {
          const isAttended = dayStatus === 'attended';
          const isMissed = dayStatus === 'missed';
          
          return (
            <div 
              key={dayIdx} 
              className={`p-2 sm:p-2.5 rounded-lg flex flex-col items-center justify-center border text-center transition-all ${
                isAttended 
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]' 
                  : isMissed
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]' 
                  : 'bg-slate-100 dark:bg-[#0F172A] border-slate-200 dark:border-[#26354A] text-slate-400 dark:text-slate-500'
              }`}
            >
              <span className="text-[9px] font-semibold opacity-80 uppercase">{daysName[dayIdx]}</span>
              <span className="text-[11px] font-bold mt-0.5">
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
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm" id="heatmap-grid-panel">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#38BDF8]" />
            Lecture Attendance Heatmap
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Daily lecture check-in history over the previous 4 weeks</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-[#94A3B8]">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#22C55E] inline-block" /><span>Attended</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#EF4444] inline-block" /><span>Missed</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] inline-block" /><span>No Class</span></div>
        </div>
      </div>
      <div className="overflow-x-auto no-scrollbar" id="heatmap-weeks-container">
        <div className="min-w-[420px] space-y-2">
          {heatmapWeeks.map((wk: any, weekIdx: number) => (
            <HeatmapRow key={weekIdx} wk={wk} />
          ))}
        </div>
      </div>
    </div>
  );
});

function AnalyticsView({ subjects, stats, analyticsData }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'trends'>('overview');
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  
  const gridStroke = isLight ? '#E2E8F0' : '#26354A';
  const textStroke = isLight ? '#64748B' : '#94A3B8';
  const tooltipBg = isLight ? '#FFFFFF' : '#0F172A';
  const tooltipBorder = isLight ? '#E2E8F0' : '#26354A';
  const tooltipText = isLight ? '#0F172A' : '#F8FAFC';

  if (!analyticsData) {
    return (
      <div className="space-y-4 animate-pulse" id="analytics-view-skeleton">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-3"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
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

  const totalClasses = stats.totalConducted || 0;
  const attendedClasses = stats.totalAttended || 0;
  const absentClasses = Math.max(0, totalClasses - attendedClasses);
  const percentage = stats.overallPercentage || 100;

  // Donut distribution data
  const pieData = [
    { name: 'Present', value: attendedClasses, color: '#22C55E' },
    { name: 'Absent', value: absentClasses, color: '#EF4444' },
  ];

  // Memoize comparison data
  const formattedComparisonData = useMemo(() => {
    return subjectComparison.map((sub: any) => ({
      name: sub.name.length > 15 ? `${sub.name.slice(0, 15)}...` : sub.name,
      Attended: sub.attended,
      Conducted: sub.totalClasses,
    }));
  }, [subjectComparison]);

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl mx-auto" id="analytics-view-stage">
      
      {/* Header matching reference */}
      <div className="pt-1" id="analytics-view-header">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Analytics
        </h1>
      </div>

      {/* Filter Tabs matching reference: Overview | Subjects | Trends */}
      <div className="flex items-center gap-2" id="analytics-tabs-bar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#38BDF8] text-slate-950'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-200/60 dark:bg-transparent'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-[#38BDF8] text-slate-950'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-200/60 dark:bg-transparent'
          }`}
        >
          Subjects
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'trends'
              ? 'bg-[#38BDF8] text-slate-950'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-200/60 dark:bg-transparent'
          }`}
        >
          Trends
        </button>
      </div>

      {/* TAB 1: OVERVIEW (Screen 5 in reference) */}
      {activeTab === 'overview' && (
        <div className="space-y-3.5 sm:space-y-4" id="analytics-tab-overview">
          
          {/* Overall Trend Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
                Overall Trend
              </span>
              <span className="text-xs font-bold text-[#38BDF8]">
                {percentage.toFixed(1)}%
              </span>
            </div>

            <div className="h-44 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" stroke={textStroke} fontSize={10} fontWeight={600} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke={textStroke} fontSize={10} fontWeight={600} tickLine={false} ticks={[25, 50, 75, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      border: `1px solid ${tooltipBorder}`, 
                      borderRadius: '10px', 
                      color: tooltipText, 
                      fontSize: '11px', 
                      fontWeight: 'bold' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Percentage" 
                    stroke="#38BDF8" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#trendGradient)" 
                    activeDot={{ r: 5, fill: '#38BDF8' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two Stat Tiles Side-by-Side matching reference */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Classes */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-[#26354A] flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-[#38BDF8] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Total Classes</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">{totalClasses}</span>
              </div>
            </div>

            {/* Attended */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-[#26354A] flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Attended</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">{attendedClasses}</span>
              </div>
            </div>
          </div>

          {/* Attendance Distribution (Donut Chart) Card matching reference */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] block mb-3">
              Attendance Distribution
            </span>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={46}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Legend List on Right */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span className="text-slate-500 dark:text-[#94A3B8]">Present</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">{attendedClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    <span className="text-slate-500 dark:text-[#94A3B8]">Absent</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">{absentClasses}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Comparison Row Shortcut matching reference */}
          <div 
            onClick={() => setActiveTab('subjects')}
            className="bg-white hover:bg-slate-50 dark:bg-[#1E293B] dark:hover:bg-[#26354A]/60 rounded-2xl p-4 border border-slate-200 dark:border-[#26354A] flex items-center justify-between cursor-pointer transition-colors shadow-xs"
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Subject Comparison
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
          </div>

        </div>
      )}

      {/* TAB 2: SUBJECTS COMPARISON */}
      {activeTab === 'subjects' && (
        <div className="space-y-4" id="analytics-tab-subjects">
          <ComparisonChart data={formattedComparisonData} gridStroke={gridStroke} textStroke={textStroke} tooltipBg={tooltipBg} tooltipBorder={tooltipBorder} tooltipText={tooltipText} />
          <AnalyticsInsights belowTargetSubjects={stats.belowTargetSubjects} smartInsights={smartInsights} />
        </div>
      )}

      {/* TAB 3: TRENDS & HEATMAP */}
      {activeTab === 'trends' && (
        <div className="space-y-4" id="analytics-tab-trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCards weeklySummary={weeklySummary} monthlySummary={monthlySummary} />
          </div>
          <WeeklyRatioChart data={weeklyGraphData} gridStroke={gridStroke} textStroke={textStroke} tooltipBg={tooltipBg} tooltipBorder={tooltipBorder} tooltipText={tooltipText} />
          <MonthlyTrajectoryChart data={monthlyGraphData} gridStroke={gridStroke} textStroke={textStroke} tooltipBg={tooltipBg} tooltipBorder={tooltipBorder} tooltipText={tooltipText} />
          <HeatmapGrid heatmapWeeks={heatmapWeeks} />
        </div>
      )}

    </div>
  );
}

export default React.memo(AnalyticsView);

