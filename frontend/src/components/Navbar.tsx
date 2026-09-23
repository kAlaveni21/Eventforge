import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Building2,
  Award,
  QrCode,
  BarChart3,
  Sparkles,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { UserRole } from '../types.js';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
  onOpenAnnouncements?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

const roleLabels: Record<UserRole, { label: string; badgeClass: string; dotClass: string }> = {
  PLATFORM_ADMIN: {
    label: 'Platform Admin',
    badgeClass: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/40',
    dotClass: 'bg-rose-400',
  },
  EVENT_ORGANIZER: {
    label: 'Event Organizer',
    badgeClass: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 border-indigo-500/40',
    dotClass: 'bg-indigo-400',
  },
  EVENT_STAFF: {
    label: 'Event Staff',
    badgeClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
    dotClass: 'bg-emerald-400',
  },
  SPEAKER: {
    label: 'Featured Speaker',
    badgeClass: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400',
  },
  ATTENDEE: {
    label: 'Attendee',
    badgeClass: 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/40',
    dotClass: 'bg-sky-400',
  },
  SPONSOR: {
    label: 'Corporate Sponsor',
    badgeClass: 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-300 border-purple-500/40',
    dotClass: 'bg-purple-400',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  onOpenAnnouncements,
  onOpenAuth,
}) => {
  const { user, quickLogin, logout } = useAuthStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navItems = [
    { id: 'events', label: 'Events', icon: Calendar, color: 'from-indigo-600 to-blue-600' },
    { id: 'schedule', label: 'Agenda & Schedule', icon: Clock, color: 'from-violet-600 to-indigo-600' },
    { id: 'speakers', label: 'Speakers', icon: Users, color: 'from-pink-600 to-rose-600' },
    { id: 'venues', label: 'Venues', icon: Building2, color: 'from-amber-500 to-orange-600' },
    { id: 'sponsors', label: 'Sponsors', icon: Award, color: 'from-purple-600 to-indigo-600' },
    { id: 'checkin', label: 'Gate Check-In', icon: QrCode, roles: ['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'], color: 'from-emerald-600 to-teal-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'], color: 'from-cyan-600 to-blue-600' },
    { id: 'ai-tools', label: 'AI Studio', icon: Sparkles, color: 'from-violet-600 to-fuchsia-600' },
  ];

  const currentRoleConfig = user?.role ? roleLabels[user.role] : roleLabels.ATTENDEE;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-100/60 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Quick Role Switcher Banner with rich gradient */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 px-4 py-2 text-xs text-slate-200 border-b border-indigo-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`flex h-2.5 w-2.5 rounded-full ${currentRoleConfig.dotClass} animate-pulse`}></span>
            <span className="font-semibold text-white tracking-wide">Live Role Simulator:</span>
            <span className="hidden sm:inline text-indigo-200/80">
              Instant test environment for multi-tier RBAC permissions
            </span>
          </div>

          <div className="relative">
            <button
              id="role-switcher-dropdown-btn"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/60 px-3 py-1 text-slate-100 transition shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
              <span className="font-bold text-white text-xs">
                {user ? currentRoleConfig.label : 'Switch Demo Account'}
              </span>
              <ChevronDown className="h-3 w-3 text-indigo-300" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-indigo-800 bg-slate-900/98 p-1.5 shadow-2xl z-50 backdrop-blur-md">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300/80">
                  Switch Active Role Profile
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => {
                  const cfg = roleLabels[r];
                  const isSelected = user?.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        quickLogin(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/90'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`}></span>
                        <span>{cfg.label}</span>
                      </div>
                      {isSelected && <Zap className="h-3.5 w-3.5 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div
            onClick={() => setActiveTab('events')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-300/50 group-hover:scale-105 transition transform">
              <Zap className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-800 bg-clip-text text-transparent">
                  EVENTFORGE
                </span>
                <span className="rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-2xs">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Corporate Conference Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links with vibrant active pills */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            if (item.roles && user && !item.roles.includes(user.role)) {
              return null;
            }
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-md shadow-indigo-200/50`
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & User Info */}
        <div className="flex items-center space-x-3">
          {/* Announcements Bell with vibrant badge */}
          <button
            id="announcements-bell-btn"
            onClick={onOpenAnnouncements}
            className="relative rounded-xl p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 transition"
            title="Live Announcements"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[9px] font-black text-white shadow-sm shadow-rose-200 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile or Sign In / Register Buttons */}
          {user ? (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={user?.name || 'User'}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500 ring-offset-2 shadow-xs"
                />
                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${currentRoleConfig.dotClass} ring-2 ring-white`}></span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name}
                </div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide leading-tight">
                  {currentRoleConfig.label}
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <button
                id="btn-navbar-login"
                onClick={() => onOpenAuth ? onOpenAuth('login') : setActiveTab('auth')}
                className="flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
              <button
                id="btn-navbar-register"
                onClick={() => onOpenAuth ? onOpenAuth('register') : setActiveTab('auth')}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 px-3 py-2 space-x-2 scrollbar-none bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-slate-50">
        {navItems.map((item) => {
          if (item.roles && user && !item.roles.includes(user.role)) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-xs`
                  : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
