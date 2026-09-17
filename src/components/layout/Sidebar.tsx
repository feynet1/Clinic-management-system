import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  HeartHandshake,
  Stethoscope,
  FlaskConical,
  Pill,
  Receipt,
  Tv,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react';


interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { t, currentRole, currentUser } = useApp();

  // Define nav links with role authorization filters
  const navItems = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'lab_tech', 'cashier'],
    },
    {
      id: 'patients',
      label: t.nav.patients,
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'receptionist', 'nurse', 'doctor'],
    },
    {
      id: 'appointments',
      label: t.nav.appointments,
      icon: <Calendar className="w-5 h-5" />,
      roles: ['admin', 'receptionist', 'doctor', 'nurse'],
    },
    {
      id: 'triage',
      label: t.nav.triage,
      icon: <HeartHandshake className="w-5 h-5" />,
      roles: ['admin', 'nurse', 'doctor'],
    },
    {
      id: 'doctor',
      label: t.nav.doctorDesk,
      icon: <Stethoscope className="w-5 h-5" />,
      roles: ['admin', 'doctor'],
    },
    {
      id: 'lab',
      label: t.nav.labPortal,
      icon: <FlaskConical className="w-5 h-5" />,
      roles: ['admin', 'lab_tech', 'doctor'],
    },
    {
      id: 'pharmacy',
      label: t.nav.pharmacy,
      icon: <Pill className="w-5 h-5" />,
      roles: ['admin', 'pharmacist', 'doctor', 'nurse', 'cashier'],
    },
    {
      id: 'billing',
      label: t.nav.billing,
      icon: <Receipt className="w-5 h-5" />,
      roles: ['admin', 'cashier', 'receptionist'],
    },
    {
      id: 'queue-tv',
      label: t.nav.queueMonitor,
      icon: <Tv className="w-5 h-5" />,
      roles: ['admin', 'receptionist', 'nurse', 'doctor', 'monitor'],
    },
    {
      id: 'analytics',
      label: t.nav.analytics,
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin'],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => currentRole === 'admin' || item.roles.includes(currentRole as any)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* User Card */}
        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.fullName}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.department}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        <span>Offline-First PWA • v1.0</span>
      </div>
    </aside>
  );
};
