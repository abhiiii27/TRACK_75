import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Subject } from '../types';

interface EditSubjectModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSave: (subjectId: string, name: string, attended: number, total: number, target: number) => void;
}

export default function EditSubjectModal({ isOpen, subject, onClose, onSave }: EditSubjectModalProps) {
  const [name, setName] = useState('');
  const [attended, setAttended] = useState(0);
  const [total, setTotal] = useState(0);
  const [target, setTarget] = useState(75);
  const [error, setError] = useState('');

  // Pre-fill when subject changes
  useEffect(() => {
    if (subject && isOpen) {
      setName(subject.name);
      setAttended(subject.attended);
      setTotal(subject.total);
      setTarget(subject.targetPercentage);
      setError('');
    }
  }, [subject, isOpen]);

  if (!isOpen || !subject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }

    if (attended < 0 || total < 0) {
      setError('Numbers cannot be negative');
      return;
    }

    if (attended > total) {
      setError('Attended classes cannot exceed total conducted classes');
      return;
    }

    if (target < 1 || target > 100) {
      setError('Target percentage must be between 1 and 100');
      return;
    }

    onSave(subject.id, name.trim(), attended, total, target);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in" id="edit-subject-modal-overlay">
      <div className="bg-white dark:bg-[#1E293B] rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full max-w-md border border-slate-200 dark:border-[#26354A] shadow-2xl" id="edit-subject-modal-container">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Edit Course Register</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Update course name, attendance counts, or target goal</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-[#F8FAFC] p-1.5 bg-slate-100 dark:bg-[#0F172A] rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            id="btn-close-edit-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="edit-subject-form">
          {error && (
            <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] rounded-lg p-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] mb-1.5">Subject / Course Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Data Structures & Algorithms"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-lg h-10 px-3 text-xs font-medium text-slate-900 dark:text-[#F8FAFC] outline-hidden focus:border-[#38BDF8] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Attended */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] mb-1.5">Classes Attended</label>
              <input
                type="number"
                min="0"
                value={attended}
                onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-lg h-10 px-3 text-xs font-medium text-slate-900 dark:text-[#F8FAFC] outline-hidden focus:border-[#38BDF8] transition-all"
              />
            </div>

            {/* Total Conducted */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] mb-1.5">Total Conducted</label>
              <input
                type="number"
                min="0"
                value={total}
                onChange={(e) => setTotal(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-lg h-10 px-3 text-xs font-medium text-slate-900 dark:text-[#F8FAFC] outline-hidden focus:border-[#38BDF8] transition-all"
              />
            </div>
          </div>

          {/* Target Percentage */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-[#94A3B8]">Target Percentage</label>
              <span className="text-xs font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded">{target}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#0F172A] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-medium mt-1">Standard college requirement is 75% minimum</span>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 bg-[#38BDF8] hover:bg-[#0284C7] active:scale-[0.98] text-slate-950 font-bold h-11 px-4 rounded-xl text-xs transition-all cursor-pointer mt-2 shadow-sm"
            id="btn-edit-subject-submit"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
