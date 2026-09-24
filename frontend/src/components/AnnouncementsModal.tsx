import React, { useState, useEffect } from 'react';
import { Bell, Send, X, Radio, Clock, ShieldCheck } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { announcementAPI, eventAPI } from '../services/api.js';
import { Announcement, Event } from '../types.js';
import { useAuthStore } from '../store/useAuthStore.js';

interface AnnouncementsModalProps {
  onClose: () => void;
  onAnnouncementsCountChange?: (count: number) => void;
}

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  onClose,
  onAnnouncementsCountChange,
}) => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // New announcement form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<string>('All Attendees');
  const [broadcasting, setBroadcasting] = useState(false);

  const canBroadcast =
    user?.role === 'PLATFORM_ADMIN' ||
    user?.role === 'EVENT_ORGANIZER' ||
    user?.role === 'EVENT_STAFF';

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const [annRes, evRes] = await Promise.all([
        announcementAPI.getAll({ event: selectedEventId || undefined }),
        eventAPI.getAll(),
      ]);
      const list = annRes.data.data || [];
      setAnnouncements(list);
      setEvents(evRes.data.data || []);
      if (!selectedEventId && evRes.data.data?.length > 0) {
        setSelectedEventId(evRes.data.data[0]._id);
      }
      if (onAnnouncementsCountChange) {
        onAnnouncementsCountChange(list.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // Socket.IO real-time listener
    const envUrl = import.meta.env.VITE_API_URL;
    const backendUrl = envUrl ? envUrl.replace(/\/api\/?$/, '') : 'https://eventforge-xizc.onrender.com';
    const socket: Socket = io(backendUrl, { path: '/socket.io' });

    socket.on('new_announcement', (newAnn: Announcement) => {
      setAnnouncements((prev) => [newAnn, ...prev]);
    });

    socket.on('event_announcement', (newAnn: Announcement) => {
      setAnnouncements((prev) => [newAnn, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedEventId]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !title.trim() || !message.trim()) return;

    setBroadcasting(true);
    try {
      await announcementAPI.create({
        event: selectedEventId,
        title,
        message,
        targetAudience,
      });
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to broadcast announcement:', err);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Event Broadcasts</h3>
              <p className="text-xs text-slate-500">Real-time alerts streamed across mobile and portal apps</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 py-4 space-y-5">
          {/* Broadcast Form (for Organizers / Staff) */}
          {canBroadcast && (
            <form
              onSubmit={handleBroadcast}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 flex items-center space-x-1.5">
                  <Send className="h-3.5 w-3.5" />
                  <span>Transmit Real-Time Broadcast</span>
                </span>
                <span className="text-[10px] text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded font-semibold">
                  Socket.IO Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="rounded-lg border border-indigo-200 bg-white p-2 text-xs focus:outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </select>

                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="rounded-lg border border-indigo-200 bg-white p-2 text-xs focus:outline-none"
                >
                  <option value="All Attendees">Audience: All Attendees</option>
                  <option value="Speakers">Audience: Speakers Only</option>
                  <option value="Staff">Audience: Event Staff</option>
                  <option value="Sponsors">Audience: Sponsors</option>
                </select>
              </div>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Alert Headline (e.g. Keynote starting in 10 mins in Grand Ballroom A)"
                className="w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs focus:border-indigo-500 focus:outline-none"
              />

              <textarea
                rows={2}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message body..."
                className="w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs focus:border-indigo-500 focus:outline-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  {broadcasting ? 'Broadcasting...' : 'Transmit Now'}
                </button>
              </div>
            </form>
          )}

          {/* Announcements Feed */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Broadcast History
            </h4>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading broadcasts...</div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic border border-dashed rounded-xl">
                No announcements broadcasted yet.
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{ann.title}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {ann.targetAudience}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span>By: {ann.createdBy?.name || 'Organizer'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
