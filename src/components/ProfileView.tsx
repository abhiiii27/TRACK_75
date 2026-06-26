import React, { useState } from 'react';
import { User, Settings, Mail, Save, LogOut } from 'lucide-react';

interface ProfileViewProps {
  stats: any;
  user: any;
  onUpdateGoal?: (newGoal: number) => void;
  onLogout?: () => void;
}

export default function ProfileView({ stats, user, onUpdateGoal, onLogout }: ProfileViewProps) {
  // Use state with prop fallback, then localStorage
  const [name, setName] = useState(() => user?.fullName || localStorage.getItem('profile_name') || 'Abhishek Buran');
  const [email, setEmail] = useState(() => user?.email || localStorage.getItem('profile_email') || 'abhishekburan47@gmail.com');
  const [rollNo, setRollNo] = useState(() => localStorage.getItem('profile_roll') || 'CSE-2026-084');
  const [semester, setSemester] = useState(() => user?.semester || localStorage.getItem('profile_semester') || 'Semester 6');
  const [department, setDepartment] = useState(() => user?.department || localStorage.getItem('profile_dept') || 'Computer Science & Engineering');
  const [college, setCollege] = useState(() => user?.collegeName || localStorage.getItem('profile_college') || 'SaaS University');
  const [goal, setGoal] = useState(() => user?.attendanceGoal || Number(localStorage.getItem('profile_goal')) || 75);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('profile_name', name);
    localStorage.setItem('profile_email', email);
    localStorage.setItem('profile_roll', rollNo);
    localStorage.setItem('profile_semester', semester);
    localStorage.setItem('profile_dept', department);
    localStorage.setItem('profile_college', college);
    localStorage.setItem('profile_goal', String(goal));
    
    // Save locally to auth_user state
    const authUserStr = localStorage.getItem('auth_user');
    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr);
        authUser.fullName = name;
        authUser.email = email;
        authUser.semester = semester;
        authUser.department = department;
        authUser.collegeName = college;
        authUser.attendanceGoal = goal;
        localStorage.setItem('auth_user', JSON.stringify(authUser));
      } catch (err) {}
    }

    if (onUpdateGoal) {
      onUpdateGoal(goal);
    }

    setSaveMessage('Profile saved successfully! 🎉');
    setIsEditing(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="profile-view-stage">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          Student Profile & Preferences
        </h2>
        <p className="text-xs text-slate-400 dark:text-[#CBD5E1] font-medium">Manage academic credentials and customize attendance parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="profile-layout-grid">
        
        {/* Left Column: Avatar & Quick Info Cards */}
        <div className="lg:col-span-1 space-y-6" id="profile-left-column">
          {/* Avatar Banner Card */}
          <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-black text-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-2xs relative">
              {name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AB'}
              <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full border-4 border-white dark:border-[#1F2937]" />
            </div>

            <h3 className="text-lg font-black text-slate-800 dark:text-[#F8FAFC] mt-4 leading-snug">{name}</h3>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{rollNo}</span>

            <div className="w-full mt-6 pt-6 border-t border-slate-50 dark:border-[#334155] space-y-3.5 text-xs text-slate-500 dark:text-[#CBD5E1] font-semibold text-left">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[10px]">Active Matriculate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Department:</span>
                <span className="text-slate-700 dark:text-[#F8FAFC] truncate max-w-[150px]">{department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Current Semester:</span>
                <span className="text-slate-700 dark:text-[#F8FAFC]">{semester}</span>
              </div>
            </div>
          </div>

          {/* Goals performance card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
            
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-2">Goal Metric Target</span>
            <h4 className="text-xl font-bold leading-tight mb-2">Performance vs Attendance Goal</h4>
            
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold">{stats.overallPercentage}%</span>
              <span className="text-xs text-slate-300">average / {goal}% target</span>
            </div>

            <div className="mt-5 w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (stats.overallPercentage / goal) * 100)}%` }} 
              />
            </div>

            <p className="text-[10px] text-indigo-200 mt-3 font-semibold leading-relaxed">
              {stats.overallPercentage >= goal 
                ? '🎉 Excellent Standing! You are successfully meeting your desired attendance targets.' 
                : '⚠️ Attendance Booster Needed. Attend upcoming classes to recover register targets.'
              }
            </p>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/15 dark:hover:bg-rose-950/25 text-rose-700 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/30 font-bold rounded-2xl text-xs tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              id="btn-profile-logout"
            >
              <LogOut className="w-4.5 h-4.5" />
              Sign Out of Account
            </button>
          )}
        </div>

        {/* Right Column: Information form fields */}
        <div className="lg:col-span-2" id="profile-details-column">
          <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-[#334155] shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Account & Academic Credentials Settings
              </h3>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#334155] text-slate-700 dark:text-[#CBD5E1] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  id="btn-edit-profile"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {saveMessage && (
              <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 rounded-2xl p-4 text-xs font-semibold animate-fade-in">
                {saveMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6" id="profile-settings-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Student Name</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-50 dark:bg-[#1E293B] disabled:opacity-70 border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
                  />
                </div>

                {/* Email address */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      disabled={!isEditing}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1E293B] disabled:opacity-70 border border-slate-100 dark:border-[#334155] rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Roll / Registration Number</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="bg-slate-50 dark:bg-[#1E293B] disabled:opacity-70 border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
                  />
                </div>

                {/* Semester */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Current Academic Semester</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="bg-slate-50 dark:bg-[#1E293B] disabled:opacity-70 border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
                  />
                </div>

                {/* Department */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">Academic Department</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="bg-slate-50 dark:bg-[#1E293B] disabled:opacity-70 border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
                  />
                </div>

                {/* College */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1] mb-2">College / Institution</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="bg-slate-50 dark:bg-[#1E293B] disabled:opacity-70 border border-slate-100 dark:border-[#334155] rounded-2xl py-3 px-4 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all"
                  />
                </div>
              </div>

              {/* Attendance Target Goal slider */}
              <div className="border-t border-slate-50 dark:border-[#334155] pt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#CBD5E1]">Attendance Threshold Goal Target</label>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">{goal}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  disabled={!isEditing}
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 disabled:opacity-60 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">This threshold sets the target boundary for smart advisor warnings across all registers.</span>
              </div>

              {/* Form submit buttons */}
              {isEditing && (
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-50 dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3 bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#334155] text-slate-600 dark:text-[#CBD5E1] font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all cursor-pointer shadow-xs"
                    id="btn-save-profile"
                  >
                    <Save className="w-4 h-4" />
                    Save Details
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
