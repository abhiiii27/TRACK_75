import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Mail, 
  Save, 
  LogOut, 
  Camera, 
  ChevronRight, 
  GraduationCap, 
  Building, 
  Calendar, 
  Target,
  Edit3,
  X
} from 'lucide-react';

interface ProfileViewProps {
  stats: any;
  user: any;
  onUpdateGoal?: (newGoal: number) => void;
  onLogout?: () => void;
}

export default function ProfileView({ stats, user, onUpdateGoal, onLogout }: ProfileViewProps) {
  const [name, setName] = useState(() => user?.fullName || localStorage.getItem('profile_name') || 'Abhishek Buran');
  const [email, setEmail] = useState(() => user?.email || localStorage.getItem('profile_email') || 'abhishekburan47@gmail.com');
  const [rollNo, setRollNo] = useState(() => localStorage.getItem('profile_roll') || 'CSE-2026-084');
  const [semester, setSemester] = useState(() => user?.semester || localStorage.getItem('profile_semester') || 'Semester 6');
  const [department, setDepartment] = useState(() => user?.department || localStorage.getItem('profile_dept') || 'Computer Science & Engineering');
  const [college, setCollege] = useState(() => user?.collegeName || localStorage.getItem('profile_college') || 'SaaS University');
  const [goal, setGoal] = useState(() => user?.attendanceGoal || Number(localStorage.getItem('profile_goal')) || 75);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const initial = name.trim().charAt(0).toUpperCase() || 'A';

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

    setSaveMessage('Profile updated successfully! 🎉');
    setIsEditing(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-2xl mx-auto" id="profile-view-stage">
      
      {/* Header: Screen 8 style */}
      <div className="flex items-center justify-between gap-3 pt-1 pb-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Profile
        </h1>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#26354A] border border-slate-200 dark:border-[#26354A] text-xs font-semibold text-[#38BDF8] transition-colors cursor-pointer"
        >
          {isEditing ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </>
          )}
        </button>
      </div>

      {saveMessage && (
        <div className="bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] rounded-xl p-3 text-xs font-semibold text-center animate-fade-in">
          {saveMessage}
        </div>
      )}

      {/* Top Centered Avatar Area (Screen 8) */}
      <div className="flex flex-col items-center justify-center pt-2 pb-2">
        <div className="relative">
          <div className="w-22 h-22 rounded-full bg-white dark:bg-[#1E293B] border-2 border-[#38BDF8]/40 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-black text-[#38BDF8] tracking-wider">{initial}</span>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#38BDF8] text-slate-950 flex items-center justify-center border-2 border-white dark:border-[#0F172A] shadow-xs cursor-pointer hover:bg-sky-400 transition-colors"
            title="Edit Profile"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-3">
          {name}
        </h2>
        <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] mt-0.5">
          {rollNo}
        </span>
      </div>

      {/* If in edit mode, show the form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#26354A] space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Edit Profile Details</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-[#94A3B8] font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl h-10 px-3 text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold outline-hidden focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-[#94A3B8] font-bold mb-1">Roll Number</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl h-10 px-3 text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold outline-hidden focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-[#94A3B8] font-bold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl h-10 px-3 text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold outline-hidden focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-[#94A3B8] font-bold mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl h-10 px-3 text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold outline-hidden focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-[#94A3B8] font-bold mb-1">Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl h-10 px-3 text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold outline-hidden focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-[#94A3B8] font-bold mb-1">College</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl h-10 px-3 text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold outline-hidden focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-500 dark:text-[#94A3B8] font-bold">Attendance Target</label>
                <span className="text-[#38BDF8] font-bold">{goal}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-[#0F172A] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] text-xs font-bold text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#38BDF8] text-slate-950 text-xs font-bold hover:bg-sky-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Card 1: Academic Information (Screen 8) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#26354A] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-[#26354A]/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                Academic Information
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#26354A]/60">
              {/* Department */}
              <div 
                onClick={() => setIsEditing(true)}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Department</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate block">{department}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] shrink-0 ml-2" />
              </div>

              {/* Semester */}
              <div 
                onClick={() => setIsEditing(true)}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Semester</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">{semester}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] shrink-0 ml-2" />
              </div>

              {/* College */}
              <div 
                onClick={() => setIsEditing(true)}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">College / University</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate block">{college}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] shrink-0 ml-2" />
              </div>
            </div>
          </div>

          {/* Card 2: Attendance Target (Screen 8) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#26354A] p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                  Attendance Target
                </h3>
              </div>
              <span className="text-xs font-black text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded">
                Target: {goal}%
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">{stats.overallPercentage}%</span>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] ml-1.5 font-medium">Current Average</span>
              </div>
              <span className={`text-xs font-bold ${
                stats.overallPercentage >= goal ? 'text-[#22C55E]' : 'text-[#EF4444]'
              }`}>
                {stats.overallPercentage >= goal 
                  ? `+${(stats.overallPercentage - goal).toFixed(1)}% buffer`
                  : `-${(goal - stats.overallPercentage).toFixed(1)}% deficit`
                }
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-[#0F172A] rounded-full h-2 overflow-hidden border border-slate-200 dark:border-[#26354A]">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.overallPercentage >= goal ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                }`}
                style={{ width: `${Math.min(100, (stats.overallPercentage / goal) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Card 3: Account (Screen 8) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#26354A] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-[#26354A]/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                Account
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#26354A]/60">
              <div 
                onClick={() => setIsEditing(true)}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Email Address</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate block">{email}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] shrink-0 ml-2" />
              </div>
            </div>
          </div>

          {/* Sign Out Button (Red button as shown in reference) */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-3 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              id="btn-profile-logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </>
      )}

    </div>
  );
}
