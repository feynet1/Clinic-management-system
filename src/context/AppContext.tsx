import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type TranslationDictionary } from '../i18n/translations';
import { INITIAL_STAFF_PROFILES } from '../data/clinicalCatalog';
import { getPendingSyncCount, syncPendingMutations } from '../services/dataService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';
import type { Session, User } from '@supabase/supabase-js';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  currentUser: UserProfile;
  currentRole: UserRole | 'monitor';
  setCurrentRole: (role: UserRole | 'monitor') => void;
  isOnline: boolean;
  isCloudConnected: boolean;
  pendingSyncCount: number;
  syncNow: () => Promise<void>;
  // Auth
  session: Session | null;
  authUser: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('clinic_lang') as Language) || 'en';
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole | 'monitor'>(() => {
    return (localStorage.getItem('clinic_role') as any) || 'doctor';
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Resolve current user profile from role or Supabase session
  const currentUser = (() => {
    if (authUser?.user_metadata?.role) {
      const authRole = authUser.user_metadata.role as UserRole;
      const found = INITIAL_STAFF_PROFILES.find((p) => p.role === authRole);
      if (found) return found;
    }
    return INITIAL_STAFF_PROFILES.find((p) => p.role === currentRole) || INITIAL_STAFF_PROFILES[1];
  })();

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('clinic_lang', lang);
  };

  const setCurrentRole = (role: UserRole | 'monitor') => {
    setCurrentRoleState(role);
    localStorage.setItem('clinic_role', role);
  };

  const checkSyncCount = async () => {
    const count = await getPendingSyncCount();
    setPendingSyncCount(count);
  };

  const syncNow = async () => {
    await syncPendingMutations();
    await checkSyncCount();
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setAuthUser(null);
  };

  // Initialize Supabase Auth session listener
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthUser(s?.user ?? null);

      // Auto-set role from auth metadata
      if (s?.user?.user_metadata?.role) {
        const authRole = s.user.user_metadata.role as UserRole;
        setCurrentRoleState(authRole);
        localStorage.setItem('clinic_role', authRole);
      }

      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthUser(s?.user ?? null);

      if (s?.user?.user_metadata?.role) {
        const authRole = s.user.user_metadata.role as UserRole;
        setCurrentRoleState(authRole);
        localStorage.setItem('clinic_role', authRole);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkSyncCount();
    const interval = setInterval(checkSyncCount, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const value: AppContextType = {
    language,
    setLanguage,
    t: translations[language],
    currentUser,
    currentRole,
    setCurrentRole,
    isOnline,
    isCloudConnected: isSupabaseConfigured,
    pendingSyncCount,
    syncNow,
    session,
    authUser,
    authLoading,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
