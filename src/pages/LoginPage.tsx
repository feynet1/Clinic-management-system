import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Stethoscope, Lock, Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigate?: (route: 'home' | 'login' | 'app' | 'queue') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        setError('Supabase is not configured. Check your .env file.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password. Please verify your staff credentials.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        {onNavigate && (
          <div className="mb-4">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Homepage</span>
            </button>
          </div>
        )}

        {/* Centered Sign In Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-sky-400 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-4">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Sign In</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter your clinic email and password to access the clinical system
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@cliniccare.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-brand-600/25 transition-all cursor-pointer"
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

          {/* Quick Demo Staff Logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick Demo Staff Access (1-Click Fill)
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                { label: 'Doctor', email: 'doctor@cliniccare.com' },
                { label: 'Nurse', email: 'nurse@cliniccare.com' },
                { label: 'Reception', email: 'reception@cliniccare.com' },
                { label: 'Pharmacist', email: 'pharmacy@cliniccare.com' },
                { label: 'Lab Tech', email: 'lab@cliniccare.com' },
                { label: 'Cashier', email: 'cashier@cliniccare.com' },
                { label: 'Admin', email: 'admin@cliniccare.com' },
              ].map((role) => (
                <button
                  key={role.email}
                  type="button"
                  onClick={() => {
                    setEmail(role.email);
                    setPassword('Clinic@2026');
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtle Clinic ID footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Haramaya University Hiwot Fana Comprehensive Specialized Hospital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
