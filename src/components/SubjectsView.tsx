import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Subject } from '../types';
import SubjectCard from './SubjectCard';

interface SubjectsViewProps {
  subjects: Subject[];
  onLogAttendance: (subjectId: string, status: 'present' | 'absent') => void;
  onAddSubject: () => void;
  onEditSubject?: (subject: Subject) => void;
  onDeleteSubject?: (subject: Subject) => void;
  onViewDetails?: (subjectId: string) => void;
}

export default function SubjectsView({
  subjects,
  onLogAttendance,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onViewDetails,
}: SubjectsViewProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [searchQuery] = useState('');

  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl mx-auto" id="subjects-view-stage">
      {/* Top Header: "Subjects" + Blue Circle "+" button */}
      <div className="flex justify-between items-center pt-1" id="subjects-view-header">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Subjects
        </h1>

        <button
          onClick={onAddSubject}
          className="w-8 h-8 rounded-full bg-[#38BDF8] hover:bg-sky-400 active:scale-95 text-slate-950 flex items-center justify-center font-bold shadow-sm transition-all cursor-pointer"
          id="subjects-btn-trigger-add"
          title="Add Subject"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Tabs: "Current" and "All" */}
      <div className="flex items-center gap-2" id="subjects-filter-pills">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'current'
              ? 'bg-[#38BDF8] text-slate-950'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-200/60 dark:bg-slate-800/60'
          }`}
        >
          Current
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#38BDF8] text-slate-950'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-200/60 dark:bg-slate-800/60'
          }`}
        >
          All
        </button>
      </div>

      {/* List of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-slate-200 dark:border-[#26354A] p-10 text-center flex flex-col items-center justify-center animate-fade-in shadow-xs" id="subjects-empty-state">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">No subjects registered yet</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-sm mb-4">
            Tap the + button above to register your semester subjects.
          </p>
          <button
            onClick={onAddSubject}
            className="bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-bold h-10 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
          >
            Add Subject
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5" id="subjects-cards-list">
          {filteredSubjects.map((sub) => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              onLogAttendance={onLogAttendance}
              onEdit={onEditSubject}
              onDelete={onDeleteSubject}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
