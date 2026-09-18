import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Building, 
  Sliders, 
  Eye, 
  EyeOff, 
  Compass, 
  Calendar, 
  Target,
  AlertCircle,
  X,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthViewProps {
  onAuthSuccess: (token: string, user: any) => void;
  initialStage?: 'splash' | 'welcome' | 'login' | 'register' | 'forgot-password' | 'profile-setup';
}

export default function AuthView({ onAuthSuccess, initialStage = 'splash' }: AuthViewProps) {
  const [stage, setStage] = useState<
    'splash' | 'welcome' | 'login' | 'register' | 'forgot-password' | 'profile-setup'
  >(initialStage);
  
  // Forms states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Profile Setup states
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [attendanceGoal, setAttendanceGoal] = useState(75);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Temporary session token/user for setup stage
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [tempUser, setTempUser] = useState<any>(null);

  // Auto transition for Splash screen
  useEffect(() => {
    if (stage === 'splash') {
      const timer = setTimeout(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          // If we have a stored token, verify it
          fetchUserAndAuthenticate(storedToken);
        } else {
          setStage('welcome');
        }
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Show Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const fetchUserAndAuthenticate = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        const data = contentType && contentType.includes("application/json") ? await res.json() : {};
        if (data.user?.setupComplete) {
          onAuthSuccess(token, data.user);
        } else {
          // Token is valid but user hasn't completed setup
          setTempToken(token);
          setTempUser(data.user);
          setStage('profile-setup');
        }
      } else {
        // Stored token is invalid/expired
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setStage('welcome');
      }
    } catch (err) {
      console.error("Failed to authenticate with stored token", err);
      setStage('welcome');
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server Error: ${res.status} ${text.substring(0, 50)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      showNotification('success', `Welcome back, ${data.user.fullName}!`);
      
      if (rememberMe) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      if (!data.user.setupComplete) {
        setTempToken(data.token);
        setTempUser(data.user);
        setStage('profile-setup');
      } else {
        onAuthSuccess(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message);
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server Error: ${res.status} ${text.substring(0, 50)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      showNotification('success', 'Account created! Please set up your student profile.');
      
      // Store token & user temporarily for setup
      setTempToken(data.token);
      setTempUser(data.user);
      setStage('profile-setup');
    } catch (err: any) {
      setError(err.message);
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Profile Setup handler
  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!collegeName || !department || !semester) {
      setError('Please specify your College, Department, and Semester.');
      return;
    }

    if (!tempToken) {
      setError('Session expired. Please log in again.');
      setStage('login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile-setup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          collegeName,
          department,
          semester,
          attendanceGoal
        })
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server Error: ${res.status} ${text.substring(0, 50)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Profile setup failed.');
      }

      showNotification('success', 'Profile configuration saved!');
      
      // Update persistent storage if rememberMe is true or already was stored
      localStorage.setItem('auth_token', tempToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      // Launch application
      onAuthSuccess(tempToken, data.user);
    } catch (err: any) {
      setError(err.message);
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password handler
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forgotEmail) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
      showNotification('success', 'Password reset instructions have been dispatched.');
    }, 1200);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] font-sans p-4 relative overflow-hidden" id="auth-root">
      
      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className={`fixed top-6 z-50 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg border text-xs font-semibold max-w-sm
              ${toast.type === 'success' 
                ? 'bg-white dark:bg-[#1E293B] border-emerald-500/40 text-emerald-600 dark:text-emerald-300' 
                : 'bg-white dark:bg-[#1E293B] border-rose-500/40 text-rose-600 dark:text-rose-300'
              }
            `}
          >
            {toast.type === 'success' ? (
              <div className="p-1 bg-emerald-500 text-white rounded-full"><Check className="w-3.5 h-3.5" /></div>
            ) : (
              <div className="p-1 bg-rose-500 text-white rounded-full"><AlertCircle className="w-3.5 h-3.5" /></div>
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {/* 1. SPLASH SCREEN (Screen 1 in reference) */}
        {stage === 'splash' && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-between h-[520px] w-full max-w-xs text-center relative py-6"
            id="auth-splash"
          >
            {/* Background concentric lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 300 500">
              <circle cx="150" cy="200" r="140" fill="none" stroke="#38BDF8" strokeWidth="0.7" />
              <circle cx="150" cy="200" r="190" fill="none" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="150" cy="200" r="240" fill="none" stroke="#38BDF8" strokeWidth="0.4" />
            </svg>

            <div /> {/* Spacer */}

            {/* Central Brand */}
            <div className="flex flex-col items-center z-10">
              <div className="w-16 h-16 bg-[#38BDF8] rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-sky-500/20 mb-4">
                75
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none mb-2">
                Track75
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">
                Track Smart. <span className="text-[#38BDF8]">Stay Eligible.</span>
              </p>

              {/* Cyan Loading Indicator Bar */}
              <div className="w-28 h-1 bg-slate-200 dark:bg-[#1E293B] rounded-full overflow-hidden mt-10 border border-slate-300 dark:border-[#26354A]/40">
                <div className="h-full bg-[#38BDF8] rounded-full animate-pulse w-3/4" />
              </div>
            </div>

            {/* Footer Tagline */}
            <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]/80 font-normal z-10">
              Building a better student future...
            </p>
          </motion.div>
        )}

        {/* 2. WELCOME SCREEN */}
        {stage === 'welcome' && (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col items-center text-center"
            id="auth-welcome"
          >
            <div className="w-14 h-14 bg-[#38BDF8] rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-sky-500/20 mb-4">
              75
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none mb-2">
              Track75
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium max-w-[260px] leading-relaxed mb-6">
              Track Smart. <span className="text-[#38BDF8]">Stay Eligible.</span> Attendance intelligence designed for college students.
            </p>

            <div className="w-full space-y-3 mb-4">
              <button
                onClick={() => setStage('login')}
                className="w-full h-11 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                id="welcome-signin-btn"
              >
                <span>Sign In to Account</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStage('register')}
                className="w-full h-11 bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] font-semibold rounded-xl text-xs tracking-wide transition-all cursor-pointer border border-slate-200 dark:border-[#26354A]"
                id="welcome-signup-btn"
              >
                Create Student Account
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. LOGIN SCREEN (Screen 2 in reference) */}
        {stage === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] rounded-2xl p-6 sm:p-7 shadow-xl"
            id="auth-login"
          >
            {/* Top Bar matching reference */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#38BDF8] rounded-lg flex items-center justify-center text-slate-950 font-black text-xs">
                  75
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Track75</span>
              </div>
              <button 
                type="button" 
                onClick={() => setStage('welcome')}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none mb-1.5">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-normal">
                Sign in to continue your attendance journey
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-fade-in" id="login-error-banner">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abhi@example.com"
                  className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-3.5 pr-10 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-[#F8FAFC] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 dark:text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-[#26354A] bg-slate-50 dark:bg-[#0F172A] text-[#38BDF8] focus:ring-[#38BDF8]"
                  />
                  <span className="text-[11px]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setStage('forgot-password')}
                  className="text-[11px] text-[#38BDF8] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#38BDF8] hover:bg-sky-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                id="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200 dark:border-[#26354A]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 dark:text-[#94A3B8]">or continue with</span>
              <div className="flex-grow border-t border-slate-200 dark:border-[#26354A]"></div>
            </div>

            {/* Google & GitHub Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => showNotification('success', 'Google sign-in demo')}
                className="h-10 bg-slate-50 hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-[#172033] text-slate-800 dark:text-[#F8FAFC] font-semibold rounded-xl text-xs transition-all border border-slate-200 dark:border-[#26354A] flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.4 3.65 1.45 7.5l3.79 2.94C6.18 7.35 8.84 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.73-4.87 3.73-8.5z" />
                  <path fill="#FBBC05" d="M5.24 14.44c-.23-.69-.36-1.42-.36-2.19s.13-1.5.36-2.19l-3.79-2.94C.52 8.79 0 10.33 0 12s.52 3.21 1.45 4.88l3.79-2.94z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.16 0-5.82-2.31-6.76-5.4l-3.79 2.94C3.4 20.35 7.35 23 12 23z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => showNotification('success', 'GitHub sign-in demo')}
                className="h-10 bg-slate-50 hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-[#172033] text-slate-800 dark:text-[#F8FAFC] font-semibold rounded-xl text-xs transition-all border border-slate-200 dark:border-[#26354A] flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-[#94A3B8]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setStage('register')}
                className="text-[#38BDF8] hover:underline font-bold cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </motion.div>
        )}

        {/* 4. REGISTER / SIGN UP SCREEN */}
        {stage === 'register' && (
          <motion.div
            key="register-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] rounded-2xl p-6 sm:p-7 shadow-xl"
            id="auth-register"
          >
            <button
              onClick={() => setStage('welcome')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold mb-4 cursor-pointer"
              id="register-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none mb-1.5">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-normal">
                Register as an active student to track your attendance.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-fade-in" id="register-error-banner">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Abhishek Buran"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abhishek@university.edu"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full h-11 pl-10 pr-10 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-3 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                id="register-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
              Already have an account?{' '}
              <button
                onClick={() => setStage('login')}
                className="text-[#38BDF8] hover:underline font-bold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        )}

        {/* 5. FORGOT PASSWORD SCREEN */}
        {stage === 'forgot-password' && (
          <motion.div
            key="forgot-password-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] rounded-2xl p-6 sm:p-7 shadow-xl"
            id="auth-forgot"
          >
            <button
              onClick={() => setStage('login')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold mb-4 cursor-pointer"
              id="forgot-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none mb-1.5">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-normal">
                Enter your registered email to receive reset instructions.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-fade-in" id="forgot-error-banner">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resetSent ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-xl p-4 text-xs font-semibold space-y-2.5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="font-bold">Instructions Dispatched</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Password reset link sent to <strong className="text-[#38BDF8]">{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setResetSent(false);
                    setForgotEmail('');
                  }}
                  className="text-xs text-[#38BDF8] hover:underline font-bold pt-1 block"
                >
                  Send again
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@college.edu"
                      className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                  id="forgot-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending reset code...</span>
                    </>
                  ) : (
                    <span>Request Reset Link</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* 6. PROFILE SETUP SCREEN (First login only) */}
        {stage === 'profile-setup' && (
          <motion.div
            key="profile-setup-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] rounded-2xl p-6 sm:p-7 shadow-xl"
            id="auth-profile-setup"
          >
            <div className="mb-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#38BDF8]/15 text-[#38BDF8] rounded-xl flex items-center justify-center mb-3 border border-[#38BDF8]/30">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none mb-1">
                Profile Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Setup your college academic details
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-fade-in" id="setup-error-banner">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleProfileSetup} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  College Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. RCIT"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  Academic Department
                </label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Data Science"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                  Semester
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#26354A] rounded-xl text-xs font-medium focus:border-[#38BDF8] outline-hidden transition-all text-slate-900 dark:text-[#F8FAFC] appearance-none cursor-pointer"
                    required
                  >
                    {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((sem) => (
                      <option key={sem} value={sem} className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC]">{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                    Attendance Target
                  </label>
                  <span className="px-2 py-0.5 bg-[#38BDF8]/15 text-[#38BDF8] text-[11px] font-bold rounded">
                    {attendanceGoal}%
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#26354A]">
                  <Target className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={attendanceGoal}
                    onChange={(e) => setAttendanceGoal(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-3 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                id="setup-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save & Continue</span>
                )}
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
