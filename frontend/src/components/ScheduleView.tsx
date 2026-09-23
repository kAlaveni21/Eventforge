import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User as UserIcon, Plus, Search, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Session, Event } from '../types.js';
import { sessionAPI, eventAPI } from '../services/api.js';
import { useAuthStore } from '../store/useAuthStore.js';

interface ScheduleViewProps {
  onCreateSessionClick?: () => void;
}

const categoryStyles: Record<string, { badge: string; border: string }> = {
  Keynote: { badge: 'bg-purple-100 text-purple-800 border-purple-200', border: 'border-l-purple-500' },
  Technical: { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', border: 'border-l-indigo-500' },
  Workshop: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', border: 'border-l-emerald-500' },
  Panel: { badge: 'bg-amber-100 text-amber-800 border-amber-200', border: 'border-l-amber-500' },
  Networking: { badge: 'bg-rose-100 text-rose-800 border-rose-200', border: 'border-l-rose-500' },
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onCreateSessionClick }) => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [mySchedule, setMySchedule] = useState<Record<string, boolean>>({});
  const [actionNotice, setActionNotice] = useState<{ id: string; msg: string; isError: boolean } | null>(null);

  const isOrganizerOrAdmin = user?.role === 'PLATFORM_ADMIN' || user?.role === 'EVENT_ORGANIZER';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, sessionsRes] = await Promise.all([
        eventAPI.getAll(),
        sessionAPI.getAll({
          event: selectedEventId !== 'all' ? selectedEventId : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        }),
      ]);

      setEvents(eventsRes.data.data || []);
      const sessList = sessionsRes.data.data || [];
      setSessions(sessList);

      // Track current user schedule
      if (user) {
        const scheduleMap: Record<string, boolean> = {};
        sessList.forEach((s: Session) => {
          if (s.attendees?.some((a: any) => (a._id || a) === user.id || (a._id || a) === (user as any)._id)) {
            scheduleMap[s._id] = true;
          }
        });
        setMySchedule(scheduleMap);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEventId, selectedCategory]);

  const handleToggleSchedule = async (sessionId: string) => {
    setActionNotice(null);
    try {
      const res = await sessionAPI.toggleSchedule(sessionId);
      if (res.data.success) {
        const isScheduled = res.data.data.isScheduled;
        setMySchedule((prev) => ({ ...prev, [sessionId]: isScheduled }));
        setActionNotice({
          id: sessionId,
          msg: isScheduled ? 'Added to your calendar!' : 'Removed from your calendar',
          isError: false,
        });
        fetchData();
      }
    } catch (err: any) {
      setActionNotice({
        id: sessionId,
        msg: err.response?.data?.message || 'Schedule conflict or capacity reached',
        isError: true,
      });
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.room.toLowerCase().includes(q) ||
      s.speaker?.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const categories = Array.from(new Set(sessions.map((s) => s.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header with colorful flair */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200">
              <Clock className="h-5 w-5" />
            </div>
            <span>Conference Agenda & Master Timetable</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-track schedule with automated room conflict avoidance
          </p>
        </div>

        {isOrganizerOrAdmin && (
          <button
            onClick={onCreateSessionClick}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-violet-700 hover:to-indigo-700 transition self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Session</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions, speakers, rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs font-medium focus:border-indigo-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Event Filter */}
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
        >
          <option value="all">All Events</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none shadow-xs"
        >
          <option value="all">All Categories / Tracks</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions Timetable List */}
      {loading ? (
        <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-12 text-center shadow-md">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-800 font-bold">Synchronizing timetable...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Clock className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">No sessions match your filter</h3>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or schedule a new session.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isAttending = !!mySchedule[session._id];
            const notice = actionNotice?.id === session._id ? actionNotice : null;
            const attendeeCount = session.attendees?.length || 0;
            const occupancyPct = Math.round((attendeeCount / session.capacity) * 100);
            const style = categoryStyles[session.category] || {
              badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
              border: 'border-l-indigo-500',
            };

            return (
              <div
                key={session._id}
                className={`group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/60 hover:border-indigo-300 transition-all duration-200 border-l-4 ${style.border}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Time & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 px-3 py-1 font-extrabold text-indigo-800 shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-indigo-600" />
                        <span>
                          {session.startTime} - {session.endTime}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>{session.room}</span>
                      </span>
                      <span className={`rounded-xl border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${style.badge}`}>
                        {session.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                      {session.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {session.description}
                    </p>

                    {/* Speaker Info */}
                    {session.speaker && (
                      <div className="mt-3 flex items-center space-x-2.5 text-xs">
                        <img
                          src={session.speaker.profileImage}
                          alt={session.speaker.name}
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-indigo-400 shadow-2xs"
                        />
                        <span className="font-bold text-slate-900">{session.speaker.name}</span>
                        <span className="text-slate-500 font-medium">
                          • {session.speaker.designation} at {session.speaker.company}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Capacity & Action */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">
                        Capacity: <strong className="text-indigo-600 font-black">{attendeeCount}</strong> / {session.capacity}
                      </div>
                      <div className="mt-1.5 h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            occupancyPct > 90
                              ? 'bg-gradient-to-r from-rose-500 to-red-600'
                              : occupancyPct > 60
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          }`}
                          style={{ width: `${Math.min(100, occupancyPct)}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSchedule(session._id)}
                      className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                        isAttending
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700'
                      }`}
                    >
                      {isAttending ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>In My Schedule</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add to Schedule</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {notice && (
                  <div
                    className={`mt-3 rounded-xl p-2.5 text-xs font-bold flex items-center space-x-2 ${
                      notice.isError
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {notice.isError ? (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    )}
                    <span>{notice.msg}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
