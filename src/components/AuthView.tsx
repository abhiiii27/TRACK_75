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
  ChevronRight
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
        const data = await res.json();
        if (data.user.setupComplete) {
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

      const data = await res.json();
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

      const data = await res.json();
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

      const data = await res.json();
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
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans p-4 relative overflow-hidden" id="auth-root">
      
      {/* Background visual accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-indigo-50),transparent_40%)] dark:bg-[radial-gradient(ellipse_at_top_right,var(--color-indigo-950),transparent_40%)] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-slate-100),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,var(--color-slate-950),transparent_45%)] opacity-30 pointer-events-none" />

      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className={`fixed top-6 z-50 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg border text-xs font-semibold max-w-sm
              ${toast.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200' 
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-200'
              }
            `}
          >
            {toast.type === 'success' ? (
              <div className="p-1 bg-emerald-500 text-white rounded-full"><Check className="w-3.5 h-3.5" /></div>
            ) : (
              <div className="p-1 bg-rose-500 text-white rounded-full"><AlertCircle className="w-3.5 h-3.5" /></div>
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {/* 1. SPLASH SCREEN */}
        {stage === 'splash' && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-xs"
            id="auth-splash"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, -3, 3, 0]
              }}
              transition={{ 
                duration: 2.2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="p-4.5 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 shrink-0"
            >
              <GraduationCap className="w-12 h-12" />
            </motion.div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
              Attendance
            </h1>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mb-6">
              Planner Pro
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-bold">
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              <span>Initializing secure container...</span>
            </div>
          </motion.div>
        )}

        {/* 2. WELCOME SCREEN */}
        {stage === 'welcome' && (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40 dark:shadow-none flex flex-col items-center text-center"
            id="auth-welcome"
          >
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/60 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-5 shadow-2xs">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-2.5">
              Welcome to Attendance Planner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[280px] leading-relaxed mb-8">
              Master your university attendance, secure lecture thresholds, and avoid detention risks.
            </p>

            <div className="w-full space-y-3.5 mb-6">
              <button
                onClick={() => setStage('login')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                id="welcome-signin-btn"
              >
                Sign In to Account
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStage('register')}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs tracking-wide transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-700/60"
                id="welcome-signup-btn"
              >
                Create Student Account
              </button>
            </div>

            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Secure SaaS Student Platform
            </span>
          </motion.div>
        )}

        {/* 3. LOGIN SCREEN */}
        {stage === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40 dark:shadow-none"
            id="auth-login"
          >
            <button
              onClick={() => setStage('welcome')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold mb-6 cursor-pointer"
              id="login-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                Sign In
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                Enter credentials to securely connect your dashboards.
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-300 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-semibold animate-fade-in" id="login-error-banner">
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3.5 pl-11 pr-11 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-md border-slate-200 dark:border-slate-700 bg-slate-50 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setStage('forgot-password')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                id="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <span>Secure Login</span>
                )}
              </button>
            </form>

            <div className="relative flex py-3 items-center mb-6">
              <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
            </div>

            {/* Google Authentication (UI only) */}
            <button
              onClick={() => showNotification('success', 'Google integration sandbox active.')}
              className="w-full py-3 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs tracking-wide transition-all border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2.5 cursor-pointer"
              id="google-oauth-btn"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.4 3.65 1.45 7.5l3.79 2.94C6.18 7.35 8.84 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.73-4.87 3.73-8.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.44c-.23-.69-.36-1.42-.36-2.19s.13-1.5.36-2.19l-3.79-2.94C.52 8.79 0 10.33 0 12s.52 3.21 1.45 4.88l3.79-2.94z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.16 0-5.82-2.31-6.76-5.4l-3.79 2.94C3.4 20.35 7.35 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => setStage('register')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
              >
                Create one now
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
            className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40 dark:shadow-none"
            id="auth-register"
          >
            <button
              onClick={() => setStage('welcome')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold mb-6 cursor-pointer"
              id="register-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                Register as an active student to scope your attendance tracking.
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-300 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-semibold animate-fade-in" id="register-error-banner">
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Abhishek Buran"
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abhishek@university.edu"
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full py-3.5 pl-11 pr-11 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                id="register-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating your secure account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => setStage('login')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
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
            className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40 dark:shadow-none"
            id="auth-forgot"
          >
            <button
              onClick={() => setStage('login')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold mb-6 cursor-pointer"
              id="forgot-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                Lost your keys? Enter your email address to receive password reset links.
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-300 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-semibold animate-fade-in" id="forgot-error-banner">
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resetSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-2xl p-5 text-xs font-semibold space-y-3"
                id="forgot-success-box"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-emerald-500 text-white rounded-full"><Check className="w-4 h-4" /></div>
                  <span className="font-extrabold">Instructions Dispatched</span>
                </div>
                <p className="leading-relaxed font-semibold text-slate-600 dark:text-slate-400 pl-8">
                  We've emailed a password reset link to <strong className="text-indigo-600 dark:text-indigo-400 font-black">{forgotEmail}</strong>. 
                  Please check your spam/junk folders if you don't receive it in 1-2 minutes.
                </p>
                <div className="pt-2 pl-8">
                  <button
                    onClick={() => {
                      setResetSent(false);
                      setForgotEmail('');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    Didn't get the email? Send again
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@college.edu"
                      className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
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
            className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40 dark:shadow-none"
            id="auth-profile-setup"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/60 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4 shadow-2xs">
                <Sliders className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
                Profile Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-[280px]">
                Almost there! Setup your college academic baselines.
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-300 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-semibold animate-fade-in" id="setup-error-banner">
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleProfileSetup} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  College Name
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. SaaS University"
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Academic Department
                </label>
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Semester
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-800 dark:text-white appearance-none"
                    required
                  >
                    {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Attendance Goal
                  </label>
                  <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg">
                    {attendanceGoal}%
                  </span>
                </div>
                <div className="relative flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                  <Target className="w-5 h-5 text-indigo-500 shrink-0" />
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={attendanceGoal}
                    onChange={(e) => setAttendanceGoal(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  The default recommended academic attendance goal is 75%.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                id="setup-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving configurations...</span>
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
