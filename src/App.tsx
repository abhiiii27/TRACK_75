import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, GraduationCap, AlertCircle, Plus, WifiOff } from 'lucide-react';
import { Subject, PredictionResult, AIPredictionResponse, AIRecommendationResponse } from './types';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import SubjectsView from './components/SubjectsView';
import PredictorView from './components/PredictorView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import AddSubjectModal from './components/AddSubjectModal';
import EditSubjectModal from './components/EditSubjectModal';
import SubjectDetailsView from './components/SubjectDetailsView';
import AuthView from './components/AuthView';
import { useTheme } from './ThemeContext';
import NotificationPanel from './components/NotificationPanel';
import InstallPrompt from './components/InstallPrompt';
import ReloadPrompt from './components/ReloadPrompt';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    overallPercentage: 100,
    totalAttended: 0,
    totalConducted: 0,
    safeSubjects: 0,
    belowTargetSubjects: 0,
  });
  const [riskData, setRiskData] = useState<{
    riskScore: number;
    riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    overallAttendance: number;
    remainingSafeBunks: number;
    reasons: string[];
  }>({
    riskScore: 0,
    riskLevel: 'SAFE',
    overallAttendance: 100,
    remainingSafeBunks: 0,
    reasons: [],
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [predictionData, setPredictionData] = useState<AIPredictionResponse | null>(null);
  const [recommendationData, setRecommendationData] = useState<AIRecommendationResponse | null>(null);
  // Increment to signal TopHeader to refresh notification badge
  const [notificationRefreshTrigger, setNotificationRefreshTrigger] = useState(0);
  const bumpNotifications = () => setNotificationRefreshTrigger((n) => n + 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Tab routing page state
  const [activePage, setActivePage] = useState('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Subject Management States
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [viewingSubjectId, setViewingSubjectId] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Track chronological logs of recent activities during session
  const [activities, setActivities] = useState<Array<{ id: string; text: string; time: string }>>([
    { id: 'act-1', text: 'Checked in Computer Networks lecture', time: 'Just now' },
    { id: 'act-2', text: 'Overall target threshold goal set to 75.0%', time: 'Yesterday' },
    { id: 'act-3', text: 'Registered Mathematics II as active subject', time: '2 days ago' },
  ]);

  // --- AUTHENTICATION STATES ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingUser, setLoadingUser] = useState(true);

  // Helper: Secure, token-injecting fetch request proxy
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      ...Object.fromEntries(Object.entries(options.headers || {})),
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
      throw new Error('Your session has expired. Please sign in again.');
    }
    return res;
  };

  // Fetch initial data
  const fetchData = async (overrideToken?: string) => {
    const currentToken = overrideToken || token || localStorage.getItem('auth_token');
    if (!currentToken) return;

    setLoading(true);
    setError('');
    try {
      const [subsRes, statsRes, riskRes, analyticsRes, predictRes, recommendRes] = await Promise.all([
        fetch('/api/subjects', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
        fetch('/api/attendance/risk', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
        fetch('/api/analytics', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
        fetch('/api/ai/predict', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
        fetch('/api/ai/recommendations', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
      ]);

      if (subsRes.status === 401 || statsRes.status === 401 || riskRes.status === 401 || analyticsRes.status === 401 || predictRes.status === 401 || recommendRes.status === 401) {
        handleLogout();
        return;
      }

      if (!subsRes.ok || !statsRes.ok || !riskRes.ok || !analyticsRes.ok || !predictRes.ok || !recommendRes.ok) {
        throw new Error('Failed to retrieve student records from the database.');
      }

      const subsData = await subsRes.json();
      const statsData = await statsRes.json();
      const riskDataVal = await riskRes.json();
      const analyticsDataVal = await analyticsRes.json();
      const predictData = await predictRes.json();
      const recommendData = await recommendRes.json();

      setSubjects(subsData);
      setStats(statsData);
      setRiskData(riskDataVal);
      setAnalyticsData(analyticsDataVal);
      setPredictionData(predictData);
      setRecommendationData(recommendData);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Could not connect to database. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  // Auth initialization checking
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setToken(savedToken);
            setUser(data.user);
            await fetchData(savedToken);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Initial token validation failed', err);
          // Keep local states as offline fallback if server is briefly down
        }
      }
      setLoadingUser(false);
    };
    initAuth();
  }, []);

  // Network State Listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync fetch whenever token becomes available
  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token]);

  // Auth action triggers
  const handleAuthSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    fetchData(newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setActivePage('dashboard');
  };

  // Handler: Log direct attendance (Present / Absent)
  const handleLogAttendance = async (subjectId: string, status: 'present' | 'absent') => {
    try {
      const res = await authenticatedFetch('/api/attendance', {
        method: 'POST',
        body: JSON.stringify({ subjectId, status }),
      });

      if (!res.ok) throw new Error('Failed to log attendance record');

      const data = await res.json();
      
      // Update local state directly to be lightning fast
      setSubjects((prev) =>
        prev.map((sub) => (sub.id === subjectId ? data.subject : sub))
      );

      // Add to session activities feed
      const subjectName = data.subject?.name || 'Subject';
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
      const newActivity = {
        id: `act-${Date.now()}`,
        text: `Logged ${formattedStatus} for ${subjectName}`,
        time: 'Just now',
      };
      setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);

      // Re-fetch aggregate stats and risk scores to keep everything aligned
      try {
        const [statsRes, riskRes, analyticsRes, predictRes, recommendRes] = await Promise.all([
          authenticatedFetch('/api/stats'),
          authenticatedFetch('/api/attendance/risk'),
          authenticatedFetch('/api/analytics'),
          authenticatedFetch('/api/ai/predict'),
          authenticatedFetch('/api/ai/recommendations')
        ]);
        if (statsRes.ok && riskRes.ok && analyticsRes.ok && predictRes.ok && recommendRes.ok) {
          const statsData = await statsRes.json();
          const riskDataVal = await riskRes.json();
          const analyticsDataVal = await analyticsRes.json();
          const predictData = await predictRes.json();
          const recommendData = await recommendRes.json();
          setStats(statsData);
          setRiskData(riskDataVal);
          setAnalyticsData(analyticsDataVal);
          setPredictionData(predictData);
          setRecommendationData(recommendData);
          bumpNotifications();
        }
      } catch (refreshErr) {
        console.error('Secondary refresh failed:', refreshErr);
      }
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      setError(err.message || 'Failed to update attendance records. Please try again.');
    }
  };

  // Handler: Create a new academic subject
  const handleAddSubject = async (name: string, attended: number, total: number, target: number) => {
    try {
      const res = await authenticatedFetch('/api/subjects', {
        method: 'POST',
        body: JSON.stringify({
          name,
          attended,
          total,
          targetPercentage: target,
        }),
      });

      if (!res.ok) throw new Error('Failed to create new subject entry');

      const newSub = await res.json();
      setSubjects((prev) => [...prev, newSub]);

      // Add to session activities feed
      const newActivity = {
        id: `act-${Date.now()}`,
        text: `Registered new subject: ${name}`,
        time: 'Just now',
      };
      setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);

      // Refresh overall stats and risk scores
      try {
        const [statsRes, riskRes, analyticsRes, predictRes, recommendRes] = await Promise.all([
          authenticatedFetch('/api/stats'),
          authenticatedFetch('/api/attendance/risk'),
          authenticatedFetch('/api/analytics'),
          authenticatedFetch('/api/ai/predict'),
          authenticatedFetch('/api/ai/recommendations')
        ]);
        if (statsRes.ok && riskRes.ok && analyticsRes.ok && predictRes.ok && recommendRes.ok) {
          const statsData = await statsRes.json();
          const riskDataVal = await riskRes.json();
          const analyticsDataVal = await analyticsRes.json();
          const predictData = await predictRes.json();
          const recommendData = await recommendRes.json();
          setStats(statsData);
          setRiskData(riskDataVal);
          setAnalyticsData(analyticsDataVal);
          setPredictionData(predictData);
          setRecommendationData(recommendData);
          bumpNotifications();
        }
      } catch (refreshErr) {
        console.error('Secondary refresh failed:', refreshErr);
      }
    } catch (err: any) {
      console.error('Error adding subject:', err);
      setError(err.message || 'Failed to register the new subject. Please verify data formats.');
    }
  };

  const handleEditSubject = async (subjectId: string, name: string, attended: number, total: number, target: number) => {
    try {
      const res = await authenticatedFetch(`/api/subjects/${subjectId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          attended,
          total,
          targetPercentage: target,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update subject');
      }

      const updatedSub = await res.json();
      setSubjects((prev) => prev.map((s) => s.id === subjectId ? updatedSub : s));

      // Add to session activities feed
      const newActivity = {
        id: `act-${Date.now()}`,
        text: `Updated subject details: ${name}`,
        time: 'Just now',
      };
      setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);

      // Refresh overall stats and risk scores
      try {
        const [statsRes, riskRes, analyticsRes, predictRes, recommendRes] = await Promise.all([
          authenticatedFetch('/api/stats'),
          authenticatedFetch('/api/attendance/risk'),
          authenticatedFetch('/api/analytics'),
          authenticatedFetch('/api/ai/predict'),
          authenticatedFetch('/api/ai/recommendations')
        ]);
        if (statsRes.ok && riskRes.ok && analyticsRes.ok && predictRes.ok && recommendRes.ok) {
          const statsData = await statsRes.json();
          const riskDataVal = await riskRes.json();
          const analyticsDataVal = await analyticsRes.json();
          const predictData = await predictRes.json();
          const recommendData = await recommendRes.json();
          setStats(statsData);
          setRiskData(riskDataVal);
          setAnalyticsData(analyticsDataVal);
          setPredictionData(predictData);
          setRecommendationData(recommendData);
          bumpNotifications();
        }
      } catch (refreshErr) {
        console.error('Secondary refresh failed:', refreshErr);
      }
    } catch (err: any) {
      console.error('Error editing subject:', err);
      setError(err.message || 'Failed to update subject.');
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!deletingSubject) return;
    const subjectName = deletingSubject.name;
    
    try {
      const res = await authenticatedFetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete subject');

      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      setDeletingSubject(null);
      if (viewingSubjectId === subjectId) {
        setViewingSubjectId(null);
        setActivePage('subjects');
      }

      // Add to session activities feed
      const newActivity = {
        id: `act-${Date.now()}`,
        text: `Deleted subject: ${subjectName}`,
        time: 'Just now',
      };
      setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);

      // Refresh overall stats and risk scores
      try {
        const [statsRes, riskRes, analyticsRes, predictRes, recommendRes] = await Promise.all([
          authenticatedFetch('/api/stats'),
          authenticatedFetch('/api/attendance/risk'),
          authenticatedFetch('/api/analytics'),
          authenticatedFetch('/api/ai/predict'),
          authenticatedFetch('/api/ai/recommendations')
        ]);
        if (statsRes.ok && riskRes.ok && analyticsRes.ok && predictRes.ok && recommendRes.ok) {
          const statsData = await statsRes.json();
          const riskDataVal = await riskRes.json();
          const analyticsDataVal = await analyticsRes.json();
          const predictData = await predictRes.json();
          const recommendData = await recommendRes.json();
          setStats(statsData);
          setRiskData(riskDataVal);
          setAnalyticsData(analyticsDataVal);
          setPredictionData(predictData);
          setRecommendationData(recommendData);
          bumpNotifications();
        }
      } catch (refreshErr) {
        console.error('Secondary refresh failed:', refreshErr);
      }
    } catch (err: any) {
      console.error('Error deleting subject:', err);
      setError(err.message || 'Failed to delete subject.');
    }
  };

  // Handler: Query prediction outcomes
  const handlePredict = async (
    subjectId: string,
    upcomingClasses: number,
    expectedAttendanceRate: number
  ): Promise<PredictionResult> => {
    const res = await authenticatedFetch('/api/predict', {
      method: 'POST',
      body: JSON.stringify({
        subjectId,
        upcomingClasses,
        expectedAttendanceRate,
      }),
    });

    if (!res.ok) {
      throw new Error('Prediction module failed to run analysis.');
    }

    return res.json();
  };

  // Handler: Reset registers back to defaults (called from settings)
  const handleResetData = async () => {
    const res = await authenticatedFetch('/api/reset', {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Failed to reset registers.');
    }

    // Add to session activities feed
    const newActivity = {
      id: `act-${Date.now()}`,
      text: 'Database registers reset to initial sandbox records',
      time: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);

    // Re-fetch all data
    await fetchData();
  };

  // Handler: Profile page attendance threshold update
  const handleUpdateGoal = async (newGoal: number) => {
    // Add to session activities feed
    const newActivity = {
      id: `act-${Date.now()}`,
      text: `Default attendance goal threshold set to ${newGoal}.0%`,
      time: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);
    
    // Sync refreshed scores
    await fetchData();
  };

  // Memoized top-level UI handlers
  const handleAddSubjectOpen = useCallback(() => setIsModalOpen(true), []);
  const handleClearActivities = useCallback(() => setActivities([]), []);

  // Dynamically render the active tab view page
  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardView
            subjects={subjects}
            stats={stats}
            riskData={riskData}
            predictionData={predictionData}
            recommendationData={recommendationData}
            onAddSubject={handleAddSubjectOpen}
            onLogAttendance={handleLogAttendance}
            setActivePage={setActivePage}
            activities={activities}
          />
        );
      case 'subjects':
        if (viewingSubjectId) {
          const sub = subjects.find(s => s.id === viewingSubjectId);
          if (sub) {
            return (
              <SubjectDetailsView
                subject={sub}
                onBack={() => setViewingSubjectId(null)}
                authenticatedFetch={authenticatedFetch}
              />
            );
          }
        }
        return (
          <SubjectsView
            subjects={subjects}
            onLogAttendance={handleLogAttendance}
            onAddSubject={handleAddSubjectOpen}
            onEditSubject={(subject) => setEditingSubject(subject)}
            onDeleteSubject={(subject) => setDeletingSubject(subject)}
            onViewDetails={(subjectId) => { setViewingSubjectId(subjectId); setActivePage('subjects'); }}
          />
        );
      case 'predictor':
        return (
          <PredictorView
            subjects={subjects}
            onPredict={handlePredict}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            subjects={subjects}
            stats={stats}
            analyticsData={analyticsData}
          />
        );
      case 'profile':
        return (
          <ProfileView
            stats={stats}
            user={user}
            onUpdateGoal={handleUpdateGoal}
            onLogout={handleLogout}
          />
        );
      case 'settings':
        return (
          <SettingsView
            onResetData={handleResetData}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-slate-500">
            Selected view coming soon.
          </div>
        );
    }
  };

  // RENDER LOADING / SPLASH OR ROOT SYSTEM
  if (loadingUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} initialStage="splash" />;
  }

  // FORCE AUTHENTICATION MODULE SCREEN
  if (!token || !user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} initialStage="welcome" />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans" id="app-root-container">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onAddSubject={handleAddSubjectOpen} 
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        <InstallPrompt />
        <ReloadPrompt />
        {/* Fixed Top Header Navigation */}
        <TopHeader
          activePage={activePage}
          setActivePage={setActivePage}
          onAddSubject={handleAddSubjectOpen}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          activities={activities}
          onClearActivities={handleClearActivities}
          notificationRefreshTrigger={notificationRefreshTrigger}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8 flex flex-col justify-between" id="app-main-content">
          
          {isOffline && (
            <div className="mb-6 bg-slate-800/90 backdrop-blur-md border border-slate-700 text-slate-200 rounded-2xl p-4 flex items-center justify-center gap-3 text-sm font-medium shadow-lg animate-fade-in z-50 sticky top-0">
              <WifiOff className="w-5 h-5 text-slate-400" />
              <span>You are currently offline. Viewing cached data.</span>
            </div>
          )}

          <div>
            {error && (
              <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in" id="error-alert-banner">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  {error}
                </span>
                <button onClick={() => fetchData()} className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer">Retry Now</button>
              </div>
            )}

            {/* Render Active View Stage */}
            {loading && subjects.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-semibold text-slate-400">Loading student dashboards...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {renderActiveView()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer Branding Area (Displays inside scroll container) */}
          <footer className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold gap-3" id="app-footer-branding">
            <span>Student Attendance Planner &copy; 2026. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Use</a>
            </div>
          </footer>
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <BottomNav activePage={activePage} setActivePage={setActivePage} />

      </div>

      {/* Add Subject Modal Panel */}
      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubject}
      />

      {/* Edit Subject Modal Panel */}
      <EditSubjectModal
        isOpen={!!editingSubject}
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={handleEditSubject}
      />

      {/* Delete Confirmation Modal */}
      {deletingSubject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 w-full max-w-sm border border-slate-100 dark:border-[#334155] shadow-xl text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC] mb-2">Delete Subject?</h3>
            <p className="text-sm text-slate-500 dark:text-[#CBD5E1] mb-6">
              Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">{deletingSubject.name}</strong>? 
              This will also permanently delete all attendance history associated with it. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingSubject(null)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteSubject(deletingSubject.id)}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm transition-colors shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
