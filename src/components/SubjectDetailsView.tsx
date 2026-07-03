import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, AlertCircle, Clock, Check, X } from 'lucide-react';
import { Subject, AttendanceRecord } from '../types';

interface SubjectDetailsViewProps {
  subject: Subject;
  onBack: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function SubjectDetailsView({ subject, onBack, authenticatedFetch }: SubjectDetailsViewProps) {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await authenticatedFetch('/api/attendance/history');
        if (!res.ok) throw new Error('Failed to fetch attendance history');
        const data = await res.json();
        if (isMounted) {
          // Filter history for this specific subject
          setHistory(data.filter((r: any) => r.subjectId === subject.id));
        }
      } catch (err: any) {
        if (isMounted) setError('Could not load history');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [subject.id, authenticatedFetch]);

  // Derived stats
  const currentPercentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 100;
  const target = subject.targetPercentage;
  const isSafe = currentPercentage >= target;

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

  let safeToMiss = 0;
  if (currentPercentage >= target) {
    if (targetFrac > 0) {
      const val = (subject.attended - targetFrac * subject.total) / targetFrac;
      safeToMiss = Math.max(0, Math.floor(val));
    } else {
      safeToMiss = 999;
    }
  }

  const groupedHistory = history.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6 animate-fade-in" id="subject-details-view">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">{subject.name}</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Subject Details & History</p>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${isSafe ? 'border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : 'border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'}`}>
              <span className="text-xl font-extrabold">{currentPercentage.toFixed(0)}%</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">Current Attendance</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Target Goal: {target}%</p>
            </div>
          </div>
          
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isSafe ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'}`}>
            {isSafe ? 'SAFE' : 'AT RISK'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-[#1E293B] rounded-2xl p-4 text-center">
            <div className="text-xl font-extrabold text-slate-800 dark:text-[#F8FAFC] mb-1">{subject.attended}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present</div>
          </div>
          <div className="bg-slate-50 dark:bg-[#1E293B] rounded-2xl p-4 text-center">
            <div className="text-xl font-extrabold text-slate-800 dark:text-[#F8FAFC] mb-1">{subject.total - subject.attended}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent</div>
          </div>
          <div className="bg-slate-50 dark:bg-[#1E293B] rounded-2xl p-4 text-center">
            <div className="text-xl font-extrabold text-slate-800 dark:text-[#F8FAFC] mb-1">{subject.total}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
          </div>
        </div>

        {isSafe ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">You are on track</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">You can safely miss <strong className="font-extrabold">{safeToMiss}</strong> more {safeToMiss === 1 ? 'class' : 'classes'} without falling below {target}%.</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Action Required</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">You need to attend the next <strong className="font-extrabold">{requiredConsecutive}</strong> {requiredConsecutive === 1 ? 'class' : 'classes'} consecutively to reach your {target}% target.</p>
            </div>
          </div>
        )}
      </div>

      {/* History Timeline */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" /> Attendance History
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm animate-pulse">Loading history...</div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="bg-white dark:bg-[#1F2937] rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] p-8 text-center text-slate-500 text-sm">
            No attendance logged yet.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 ml-2">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                <div className="bg-white dark:bg-[#1F2937] rounded-3xl border border-slate-100 dark:border-[#334155] overflow-hidden">
                  {groupedHistory[date].map((record, idx) => (
                    <div key={record.id} className={`p-4 flex items-center justify-between ${idx !== groupedHistory[date].length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'}`}>
                          {record.status === 'present' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">Marked {record.status === 'present' ? 'Present' : 'Absent'}</p>
                          {record.notes && <p className="text-xs text-slate-500 mt-0.5">{record.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
