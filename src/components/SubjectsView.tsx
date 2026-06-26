import React, { useState } from 'react';
import { BookOpen, Search, Plus } from 'lucide-react';
import { Subject } from '../types';
import SubjectCard from './SubjectCard';

interface SubjectsViewProps {
  subjects: Subject[];
  onLogAttendance: (subjectId: string, status: 'present' | 'absent') => void;
  onAddSubject: () => void;
}

export default function SubjectsView({ subjects, onLogAttendance, onAddSubject }: SubjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_track' | 'below_target'>('all');

  // Filter subjects based on query and status selection
  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const percentage = sub.total > 0 ? (sub.attended / sub.total) * 100 : 100;
    const isOnTrack = percentage >= sub.targetPercentage;

    if (statusFilter === 'on_track') {
      return matchesSearch && isOnTrack;
    } else if (statusFilter === 'below_target') {
      return matchesSearch && !isOnTrack;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="subjects-view-stage">
      
      {/* Title & Add Shortcut */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="subjects-view-header">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Tracked Subjects Registers
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#CBD5E1] font-medium">Log your daily attendance status and track required class goals</p>
        </div>

        <button
          onClick={onAddSubject}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-2xl text-xs transition-all cursor-pointer shadow-xs shrink-0"
          id="subjects-btn-trigger-add"
        >
          <Plus className="w-4 h-4" />
          Add New Subject
        </button>
      </div>

      {/* Search & Filtering Navigation bar */}
      <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-4 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between" id="subjects-filters-bar">
        
        {/* Search Input Box */}
        <div className="relative w-full sm:max-w-xs" id="search-box-wrapper">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-2xl py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
            id="subject-search-input"
          />
        </div>

        {/* Filter Badges buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar" id="status-filter-buttons">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 mr-1 hidden md:inline">
            Filter Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' 
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#1E293B]'
            }`}
          >
            All Registers ({subjects.length})
          </button>
          <button
            onClick={() => setStatusFilter('on_track')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'on_track' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            On Track ({subjects.filter(s => (s.total > 0 ? (s.attended / s.total) * 100 : 100) >= s.targetPercentage).length})
          </button>
          <button
            onClick={() => setStatusFilter('below_target')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'below_target' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            Below Target ({subjects.filter(s => (s.total > 0 ? (s.attended / s.total) * 100 : 100) < s.targetPercentage).length})
          </button>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] p-12 text-center flex flex-col items-center justify-center animate-fade-in" id="subjects-empty-state">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-full mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] mb-1">No matching subjects found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mb-6 leading-relaxed">
            Adjust your search keywords or state filters, or register another subject to continue.
          </p>
          {subjects.length === 0 && (
            <button
              onClick={onAddSubject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-2xl text-xs transition-all cursor-pointer shadow-xs"
            >
              Register First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="subjects-cards-grid">
          {filteredSubjects.map((sub) => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              onLogAttendance={onLogAttendance}
            />
          ))}
        </div>
      )}

    </div>
  );
}
