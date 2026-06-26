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
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-[#334155] h-full flex flex-col justify-between animate-fade-in" id="predictor-calculator-panel">
      <div>
        <div className="flex items-center gap-2 mb-6" id="predictor-panel-title">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC] tracking-tight">AI Attendance Predictor</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Model future lecture schedules & risk levels</p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-5" id="predictor-form">
          {/* Subject Dropdown */}
          <div className="flex flex-col" id="predictor-subject-select">
            <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setPrediction(null); // Reset when subject changes
              }}
              className="bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="dark:bg-[#1F2937] dark:text-[#F8FAFC]">
                  {sub.name} (Current: {sub.total > 0 ? ((sub.attended / sub.total) * 100).toFixed(1) : '100'}%)
                </option>
              ))}
            </select>
          </div>

          {/* Upcoming Classes Slider */}
          <div className="flex flex-col" id="predictor-upcoming-slider">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1]">Upcoming Classes</label>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                {upcomingClasses} lectures
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-2">Simulate attendance for next scheduled lectures</p>
            <input
              type="range"
              min="1"
              max="30"
              value={upcomingClasses}
              onChange={(e) => {
                setUpcomingClasses(Number(e.target.value));
                setPrediction(null);
              }}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Expected Attendance Rate Slider */}
          <div className="flex flex-col" id="predictor-rate-slider">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1]">Expected Attendance Rate</label>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                {expectedRate}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-2">
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
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedSubjectId}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all cursor-pointer shadow-xs"
            id="btn-run-prediction"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Analyzing Trends...' : 'Calculate Projection'}
          </button>
        </form>
      </div>

      {/* Prediction Output Results */}
      <div className="mt-6 border-t border-slate-50 dark:border-[#334155] pt-6" id="predictor-result-panel">
        {prediction ? (
          <div className="space-y-4" id="prediction-result-view">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1]">Projection Summary</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                prediction.status === 'safe' ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400' :
                prediction.status === 'at_risk' ? 'bg-amber-50 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400' :
                'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
              }`}>
                {prediction.status === 'safe' ? 'Safe' :
                 prediction.status === 'at_risk' ? 'At Risk' : 'Critical'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-[#1E293B]/40 rounded-2xl p-4">
              <div className="text-center border-r border-slate-200/50 dark:border-[#334155]/50">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-0.5">Current</span>
                <span className="text-lg font-extrabold text-slate-700 dark:text-[#F8FAFC]">{prediction.currentPercentage}%</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-0.5">Projected</span>
                <span className={`text-lg font-extrabold ${prediction.predictedPercentage >= prediction.targetPercentage ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {prediction.predictedPercentage}%
                </span>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-600 dark:text-[#CBD5E1] bg-slate-50 dark:bg-[#1E293B]/30 border border-slate-100 dark:border-[#334155]/50 rounded-2xl p-4 leading-relaxed">
              {prediction.message}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center" id="prediction-result-placeholder">
            <Info className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
            <span className="text-xs font-semibold">Adjust settings and click calculate to see models</span>
          </div>
        )}
      </div>
    </div>
  );
}
