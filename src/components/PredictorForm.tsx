import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Info } from 'lucide-react';
import { Subject, PredictionResult } from '../types';

interface PredictorFormProps {
  subjects: Subject[];
  onPredict: (subjectId: string, upcomingClasses: number, expectedAttendanceRate: number) => Promise<PredictionResult>;
}

export default function PredictorForm({ subjects, onPredict }: PredictorFormProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [upcomingClasses, setUpcomingClasses] = useState(5);
  const [expectedRate, setExpectedRate] = useState(80);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    setLoading(true);
    try {
      const res = await onPredict(selectedSubjectId, upcomingClasses, expectedRate);
      setPrediction(res);
    } catch (err) {
      console.error('Error generating prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] shadow-sm h-full flex flex-col justify-between animate-fade-in" id="predictor-calculator-panel">
      <div>
        <div className="flex items-center gap-2.5 mb-5" id="predictor-panel-title">
          <div className="p-2 bg-[#38BDF8]/10 text-[#38BDF8] rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Attendance Calculator</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">Model future lecture schedules & risk levels</p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4" id="predictor-form">
          {/* Subject Dropdown */}
          <div className="flex flex-col" id="predictor-subject-select">
            <label className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] mb-1.5">Select Course Register</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setPrediction(null); // Reset when subject changes
              }}
              className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-lg h-10 px-3 text-xs font-medium text-slate-900 dark:text-[#F8FAFC] outline-hidden focus:border-[#38BDF8] transition-all cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC]">
                  {sub.name} (Current: {sub.total > 0 ? ((sub.attended / sub.total) * 100).toFixed(1) : '100'}%)
                </option>
              ))}
            </select>
          </div>

          {/* Upcoming Classes Slider */}
          <div className="flex flex-col" id="predictor-upcoming-slider">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Upcoming Classes</label>
              <span className="text-xs font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded">
                {upcomingClasses} lectures
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium mb-2">Simulate attendance for next scheduled lectures</p>
            <input
              type="range"
              min="1"
              max="30"
              value={upcomingClasses}
              onChange={(e) => {
                setUpcomingClasses(Number(e.target.value));
                setPrediction(null);
              }}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#0F172A] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>

          {/* Expected Attendance Rate Slider */}
          <div className="flex flex-col" id="predictor-rate-slider">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expected Attendance Rate</label>
              <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded">
                {expectedRate}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium mb-2">
              {expectedRate === 100 ? 'I will attend every single class' : expectedRate >= 75 ? 'I plan to attend almost all' : 'I expect to miss a few'}
            </p>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={expectedRate}
              onChange={(e) => {
                setExpectedRate(Number(e.target.value));
                setPrediction(null);
              }}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#0F172A] rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedSubjectId}
            className="w-full h-10 flex items-center justify-center gap-2 bg-[#38BDF8] hover:bg-[#0284C7] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-slate-950 font-bold px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            id="btn-run-prediction"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'Analyzing...' : 'Calculate Projection'}
          </button>
        </form>
      </div>

      {/* Prediction Output Results */}
      <div className="mt-5 border-t border-slate-200 dark:border-[#26354A] pt-4" id="predictor-result-panel">
        {prediction ? (
          <div className="space-y-3" id="prediction-result-view">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Projection Summary</span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                prediction.status === 'safe' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                prediction.status === 'at_risk' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                'bg-[#EF4444]/15 text-[#EF4444]'
              }`}>
                {prediction.status === 'safe' ? 'Safe' :
                 prediction.status === 'at_risk' ? 'At Risk' : 'Critical'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#0F172A] rounded-lg p-3 border border-slate-200 dark:border-[#26354A]">
              <div className="text-center border-r border-slate-200 dark:border-[#26354A]">
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] block mb-0.5">Current</span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F8FAFC]">{prediction.currentPercentage}%</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] block mb-0.5">Projected</span>
                <span className={`text-base sm:text-lg font-black ${prediction.predictedPercentage >= prediction.targetPercentage ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {prediction.predictedPercentage}%
                </span>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-lg p-3 leading-relaxed">
              {prediction.message}
            </p>
          </div>
        ) : (
          <div className="text-center py-5 text-slate-500 dark:text-[#94A3B8] flex flex-col items-center justify-center" id="prediction-result-placeholder">
            <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 mb-1" />
            <span className="text-xs font-medium">Adjust parameters and click calculate to view simulation</span>
          </div>
        )}
      </div>
    </div>
  );
}
