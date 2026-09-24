import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Sparkles,
  RefreshCw,
  Bell,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Layers,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuthStore } from './store/useAuthStore.js';
import { eventAPI } from './services/api.js';
import { Event } from './types.js';

import { Navbar } from './components/Navbar.js';
import { EventCard } from './components/EventCard.js';
import { EventDetailsModal } from './components/EventDetailsModal.js';
import { ScheduleView } from './components/ScheduleView.js';
import { SpeakersView } from './components/SpeakersView.js';
import { VenuesView } from './components/VenuesView.js';
import { SponsorsView } from './components/SponsorsView.js';
import { QRCheckInModal } from './components/QRCheckInModal.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { AIToolsModal } from './components/AIToolsModal.js';
import { CreateEventModal } from './components/CreateEventModal.js';
import { CreateSessionModal } from './components/CreateSessionModal.js';
import { AnnouncementsModal } from './components/AnnouncementsModal.js';
import { AuthPage } from './components/AuthPage.js';

const categoryPills = [
  { id: 'all', label: 'All Categories', activeClass: 'bg-indigo-600 text-white shadow-indigo-200' },
  { id: 'Technology', label: 'Technology & AI', activeClass: 'bg-violet-600 text-white shadow-violet-200' },
  { id: 'Finance', label: 'Finance & Fintech', activeClass: 'bg-emerald-600 text-white shadow-emerald-200' },
  { id: 'Healthcare', label: 'Healthcare & Biotech', activeClass: 'bg-rose-600 text-white shadow-rose-200' },
  { id: 'Design', label: 'Design & Product', activeClass: 'bg-amber-600 text-white shadow-amber-200' },
];

export default function App() {
  const { user, checkAuth, activeAuthView, setActiveAuthView } = useAuthStore();
  const [activeTab, setActiveTab] = useState('events');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');

  // Modals
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(2);
  const [liveToast, setLiveToast] = useState<{ title: string; message: string } | null>(null);

  // Initial Auth & Data Load
  useEffect(() => {
    checkAuth();
    loadEvents();

    // Setup Socket.IO listener for live notification toast
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '';
    const socket = io(backendUrl || undefined, { path: '/socket.io' });
    socket.on('new_announcement', (ann: any) => {
      setUnreadAnnouncements((prev) => prev + 1);
      setLiveToast({ title: ann.title, message: ann.message });
      setTimeout(() => setLiveToast(null), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync store activeAuthView if triggered by logout or other actions
  useEffect(() => {
    if (activeAuthView) {
      setAuthMode(activeAuthView);
      setActiveTab('auth');
    }
  }, [activeAuthView]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventAPI.getAll({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        eventType: selectedEventType !== 'all' ? selectedEventType : undefined,
      });
      setEvents(res.data.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, selectedEventType]);

  const canCreateEvent =
    user?.role === 'PLATFORM_ADMIN' || user?.role === 'EVENT_ORGANIZER';

  const filteredEvents = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.venue?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/60 to-purple-50/40 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Ambient Background Color Orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl"></div>
      <div className="pointer-events-none fixed top-1/4 -right-32 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl"></div>
      <div className="pointer-events-none fixed -bottom-32 left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadAnnouncements}
        onOpenAnnouncements={() => {
          setAnnouncementsOpen(true);
          setUnreadAnnouncements(0);
        }}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setActiveTab('auth');
          setActiveAuthView(mode);
        }}
      />

      {/* Live Socket.IO Toast */}
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-indigo-400 bg-slate-950 text-white p-4 shadow-2xl shadow-indigo-900/50 animate-bounce">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase mb-1">
            <Bell className="h-3.5 w-3.5" />
            <span>Live Broadcast Incoming</span>
          </div>
          <h4 className="text-sm font-bold text-white">{liveToast.title}</h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{liveToast.message}</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 relative z-10">
        {/* TAB: REGISTER & LOGIN PAGE */}
        {activeTab === 'auth' && (
          <AuthPage
            initialMode={authMode}
            onClose={() => {
              setActiveTab('events');
              setActiveAuthView(null);
            }}
          />
        )}

        {/* TAB 1: EVENTS EXPLORE */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            {/* Colorful Hero Showcase Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/20 border border-indigo-800/40">
              <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/30 blur-2xl"></div>
              <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-emerald-500/15 blur-2xl"></div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
                      <Zap className="h-3 w-3 text-amber-300" />
                      <span>Next-Gen Corporate Summits</span>
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      Live Telemetry Active
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    Global Conferences & Corporate Gatherings
                  </h1>

                  <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                    End-to-end conference management: interactive multi-track agendas, digital badges, RFID/QR gate check-in, and automated corporate sponsor ROI tracking.
                  </p>

                  {/* 4 Colorful Metric Pills */}
                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-2xl border border-indigo-700/50 bg-indigo-900/40 p-3 backdrop-blur-md">
                      <div className="flex items-center space-x-1.5 text-indigo-300 text-[11px] font-bold">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Active Summits</span>
                      </div>
                      <div className="text-xl font-black text-white mt-1">14 Global</div>
                    </div>

                    <div className="rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-3 backdrop-blur-md">
                      <div className="flex items-center space-x-1.5 text-emerald-300 text-[11px] font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Check-In Rate</span>
                      </div>
                      <div className="text-xl font-black text-white mt-1">98.4% Fast</div>
                    </div>

                    <div className="rounded-2xl border border-amber-700/50 bg-amber-950/40 p-3 backdrop-blur-md">
                      <div className="flex items-center space-x-1.5 text-amber-300 text-[11px] font-bold">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                        <span>Ticket Volume</span>
                      </div>
                      <div className="text-xl font-black text-white mt-1">$480K+</div>
                    </div>

                    <div className="rounded-2xl border border-purple-700/50 bg-purple-950/40 p-3 backdrop-blur-md">
                      <div className="flex items-center space-x-1.5 text-purple-300 text-[11px] font-bold">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span>AI Studio</span>
                      </div>
                      <div className="text-xl font-black text-white mt-1">Gemini 2.5</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  {canCreateEvent && (
                    <button
                      id="create-event-btn"
                      onClick={() => setCreateEventOpen(true)}
                      className="flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-700 transition transform hover:scale-[1.02]"
                    >
                      <Plus className="h-4 w-4 text-white" />
                      <span>Create New Summit</span>
                    </button>
                  )}

                  <button
                    onClick={loadEvents}
                    className="flex items-center justify-center space-x-2 rounded-2xl border border-indigo-700/60 bg-indigo-900/50 hover:bg-indigo-800/70 px-4 py-2.5 text-xs font-bold text-indigo-200 transition"
                    title="Reload Events"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Summits</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Colorful Filter Category Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-1">
                Filter Track:
              </span>
              {categoryPills.map((pill) => {
                const isSelected = selectedCategory === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedCategory(pill.id)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                      isSelected
                        ? `${pill.activeClass} shadow-md`
                        : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-indigo-50/70 hover:text-indigo-600'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Filter Search and Event Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-indigo-400" />
                <input
                  type="text"
                  placeholder="Search summits, topics, keynote themes, or venues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-100 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold focus:border-indigo-500 focus:outline-none shadow-xs text-slate-800"
                />
              </div>

              {/* Event Type Filter */}
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="rounded-2xl border border-indigo-100 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                <option value="all">All Event Formats</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Seminar">Seminar</option>
                <option value="Exhibition">Exhibition</option>
              </select>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-12 text-center shadow-md">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                <p className="mt-3 text-sm text-indigo-950 font-bold">Synchronizing registered summits...</p>
                <p className="text-xs text-slate-500 mt-0.5">Fetching ticket tiers, capacity quotas, and speakers</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-indigo-200 bg-white p-12 text-center">
                <Calendar className="h-10 w-10 text-indigo-300 mx-auto" />
                <h3 className="mt-3 text-sm font-bold text-slate-800">No events found matching this filter</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try clearing filters or click &ldquo;Create New Summit&rdquo; to launch your summit.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((ev) => (
                  <EventCard
                    key={ev._id}
                    event={ev}
                    onSelect={(event) => setSelectedEventId(event._id)}
                    onManage={(event) => setSelectedEventId(event._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCHEDULE */}
        {activeTab === 'schedule' && (
          <ScheduleView onCreateSessionClick={() => setCreateSessionOpen(true)} />
        )}

        {/* TAB 3: SPEAKERS */}
        {activeTab === 'speakers' && <SpeakersView />}

        {/* TAB 4: VENUES */}
        {activeTab === 'venues' && <VenuesView />}

        {/* TAB 5: SPONSORS */}
        {activeTab === 'sponsors' && <SponsorsView />}

        {/* TAB 6: GATE CHECK-IN */}
        {activeTab === 'checkin' && <QRCheckInModal />}

        {/* TAB 7: ANALYTICS */}
        {activeTab === 'analytics' && <AnalyticsView />}

        {/* TAB 8: AI TOOLS */}
        {activeTab === 'ai-tools' && <AIToolsModal />}
      </main>

      {/* Footer with colorful badges */}
      <footer className="border-t border-indigo-100 bg-white/90 backdrop-blur-md py-6 mt-12 relative z-10 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-[10px]">
              E
            </span>
            <span className="font-extrabold text-slate-900">EVENTFORGE Enterprise</span>
            <span>•</span>
            <span className="font-semibold text-slate-600">Production MERN Architecture</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>REST & Socket.IO Active</span>
            </span>
            <span className="flex items-center space-x-1.5 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Gemini 2.5 Flash Enabled</span>
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedEventId && (
        <EventDetailsModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onRegistered={() => loadEvents()}
        />
      )}

      {createEventOpen && (
        <CreateEventModal
          onClose={() => setCreateEventOpen(false)}
          onCreated={() => loadEvents()}
        />
      )}

      {createSessionOpen && (
        <CreateSessionModal
          onClose={() => setCreateSessionOpen(false)}
          onCreated={() => loadEvents()}
        />
      )}

      {announcementsOpen && (
        <AnnouncementsModal onClose={() => setAnnouncementsOpen(false)} />
      )}
    </div>
  );
}
