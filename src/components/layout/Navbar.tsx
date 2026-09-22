import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Globe, 
  UserCheck, 
  Tv, 
  Stethoscope, 
  HeartHandshake, 
  UserPlus, 
  FlaskConical, 
  Receipt, 
  ShieldAlert,
  LogOut,
  User2,
  Home,
  Pill
} from 'lucide-react';
import type { Language } from '../../i18n/translations';
import type { UserRole } from '../../types';

interface NavbarProps {
  onNavigate?: (route: 'home' | 'login' | 'app' | 'queue') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { 
    language, 
    setLanguage, 
    t, 
    currentUser, 
    currentRole, 
    setCurrentRole, 
    isOnline, 
    isCloudConnected,
    pendingSyncCount, 
    syncNow,
    authUser,
    signOut,
  } = useApp();

  const roles: { role: UserRole | 'monitor'; label: string; icon: React.ReactNode }[] = [
    { role: 'doctor', label: t.roles.doctor, icon: <Stethoscope className="w-4 h-4 text-emerald-600" /> },
    { role: 'nurse', label: t.roles.nurse, icon: <HeartHandshake className="w-4 h-4 text-rose-600" /> },
    { role: 'receptionist', label: t.roles.receptionist, icon: <UserPlus className="w-4 h-4 text-blue-600" /> },
    { role: 'lab_tech', label: t.roles.lab_tech, icon: <FlaskConical className="w-4 h-4 text-amber-600" /> },
    { role: 'pharmacist', label: t.roles.pharmacist, icon: <Pill className="w-4 h-4 text-teal-600" /> },
    { role: 'cashier', label: t.roles.cashier, icon: <Receipt className="w-4 h-4 text-purple-600" /> },
    { role: 'admin', label: t.roles.admin, icon: <ShieldAlert className="w-4 h-4 text-slate-800" /> },
    { role: 'monitor', label: t.roles.monitor, icon: <Tv className="w-4 h-4 text-sky-600" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onNavigate && onNavigate('home')}
            title="Go to Clinic Homepage"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">{t.appName}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 border border-brand-200">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Center/Right Status Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Online/Offline Status Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors">
              {isOnline ? (
                <span className="flex items-center text-emerald-700 bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full border">
                  <Wifi className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  <span className="hidden md:inline">{isCloudConnected ? 'Supabase Cloud' : 'Local PWA'}</span>
                </span>
              ) : (
                <span className="flex items-center text-amber-800 bg-amber-50 border-amber-200 px-2 py-0.5 rounded-full border">
                  <WifiOff className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  <span>{t.common.offline}</span>
                </span>
              )}

              {pendingSyncCount > 0 && (
                <button
                  onClick={syncNow}
                  title="Click to sync pending records"
                  className="flex items-center text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 px-2 py-0.5 rounded-full border text-xs cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  <span>{pendingSyncCount} {t.common.syncPending}</span>
                </button>
              )}
            </div>

            {/* Tri-Lingual Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              {(['en', 'am', 'om'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    language === lang
                      ? 'bg-white text-brand-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'am' ? 'አማ' : 'OM'}
                </button>
              ))}
            </div>

            {/* Back to Public Home Button */}
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                title="Go to Public Landing Page"
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>Home</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative">
              <div className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 transition-colors">
                <UserCheck className="w-4 h-4 text-brand-600" />
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logged-in User Badge + Sign Out */}
            {authUser && (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-1.5 bg-brand-50 border border-brand-200 text-brand-800 rounded-xl px-2.5 py-1.5">
                  <User2 className="w-3.5 h-3.5 text-brand-600" />
                  <span className="text-xs font-semibold truncate max-w-[100px]">
                    {authUser.user_metadata?.full_name?.split(' ').slice(0, 2).join(' ') || authUser.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-500 border border-transparent hover:border-red-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

