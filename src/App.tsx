import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { TriagePage } from './pages/TriagePage';
import { DoctorDeskPage } from './pages/DoctorDeskPage';
import { LabPortalPage } from './pages/LabPortalPage';
import { CashierPage } from './pages/CashierPage';
import { QueueMonitorPage } from './pages/QueueMonitorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { initializeDatabaseSeed } from './services/dataService';
import { isSupabaseConfigured } from './lib/supabase';
import { Loader2, ArrowLeft, Home, LogIn } from 'lucide-react';

export type AppRoute = 'home' | 'login' | 'app' | 'queue';

const MainAppContent: React.FC = () => {
  const { currentRole, session, authLoading, authUser, setCurrentRole } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Resolve initial route from URL hash or query params
  const getRouteFromUrl = (): AppRoute => {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (hash === '#queue' || search.includes('mode=tv')) return 'queue';
    if (hash === '#login') return 'login';
    if (hash === '#app') return 'app';
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromUrl);

  // Initialize offline seed DB
  useEffect(() => {
    initializeDatabaseSeed();
  }, []);

  // Listen to browser forward/back hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromUrl());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync role from auth metadata whenever session changes
  useEffect(() => {
    if (authUser?.user_metadata?.role) {
      const authRole = authUser.user_metadata.role;
      setCurrentRole(authRole);
    }
  }, [authUser]);

  // If user switches role dropdown to monitor, open queue view
  useEffect(() => {
    if (currentRole === 'monitor' && currentRoute === 'app') {
      setCurrentTab('queue-tv');
    }
  }, [currentRole, currentRoute]);

  const handleNavigate = (route: AppRoute) => {
    // If navigating to clinical app but not signed in, route to login first
    if (route === 'app' && isSupabaseConfigured && !session) {
      window.location.hash = 'login';
      setCurrentRoute('login');
      return;
    }

    if (route === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = route;
    }
    setCurrentRoute(route);
  };

  // Loading spinner while checking initial Supabase Auth session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-400" />
          <p className="text-sm text-slate-400">Connecting to ClinicCare System...</p>
        </div>
      </div>
    );
  }

  // 1. PUBLIC LANDING PAGE ROUTE
  if (currentRoute === 'home') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  // 2. WAITING ROOM TV MONITOR ROUTE (Standalone Fullscreen Display)
  if (currentRoute === 'queue') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Subtle Top Control Bar */}
        <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Clinic Homepage</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
              LIVE WAITING ROOM TV DISPLAY
            </span>
            <button
              onClick={() => handleNavigate(session ? 'app' : 'login')}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center space-x-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{session ? 'Staff Workspace' : 'Staff Login'}</span>
            </button>
          </div>
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <QueueMonitorPage />
        </main>
      </div>
    );
  }

  // 3. STAFF LOGIN ROUTE
  if (currentRoute === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => handleNavigate('app')}
        onNavigate={handleNavigate}
      />
    );
  }

  // 4. CLINICAL STAFF WORKSPACE ROUTE
  // Gate behind login if Supabase is configured and no active session
  if (isSupabaseConfigured && !session) {
    return (
      <LoginPage
        onLoginSuccess={() => handleNavigate('app')}
        onNavigate={handleNavigate}
      />
    );
  }

  // If role is TV monitor inside workspace
  if (currentRole === 'monitor') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar onNavigate={handleNavigate} />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <QueueMonitorPage />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar onNavigate={handleNavigate} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
          {currentTab === 'patients' && (
            <PatientsPage
              onNavigateToTriage={(_patientId) => {
                setCurrentTab('triage');
              }}
            />
          )}
          {currentTab === 'triage' && <TriagePage />}
          {currentTab === 'doctor' && <DoctorDeskPage />}
          {currentTab === 'lab' && <LabPortalPage />}
          {currentTab === 'billing' && <CashierPage />}
          {currentTab === 'queue-tv' && <QueueMonitorPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
