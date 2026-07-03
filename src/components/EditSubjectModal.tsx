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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" id="edit-subject-modal-overlay">
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 w-full max-w-md border border-slate-100 dark:border-[#334155] shadow-xl" id="edit-subject-modal-container">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC] tracking-tight">Edit Subject</h3>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-[#F8FAFC] p-1 bg-slate-50 dark:bg-[#1E293B] rounded-xl hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors cursor-pointer"
            id="btn-close-edit-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="edit-subject-form">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-400 rounded-2xl p-3 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Data Structures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Attended */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Classes Attended</label>
              <input
                type="number"
                min="0"
                value={attended}
                onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
              />
            </div>

            {/* Total Conducted */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Total Conducted</label>
              <input
                type="number"
                min="0"
                value={total}
                onChange={(e) => setTotal(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
              />
            </div>
          </div>

          {/* Target Percentage */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1]">Target Percentage</label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">{target}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Most universities require 75% minimum</span>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all cursor-pointer mt-2 shadow-xs"
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
