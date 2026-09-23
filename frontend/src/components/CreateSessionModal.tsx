import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { sessionAPI, eventAPI, speakerAPI } from '../services/api.js';
import { Event, Speaker } from '../types.js';

interface CreateSessionModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ onClose, onCreated }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [eventId, setEventId] = useState('');
  const [speakerId, setSpeakerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState('Grand Ballroom A');
  const [date, setDate] = useState('2026-10-14');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:15');
  const [capacity, setCapacity] = useState(300);
  const [category, setCategory] = useState('Artificial Intelligence');

  useEffect(() => {
    Promise.all([eventAPI.getAll(), speakerAPI.getAll()]).then(([evRes, spRes]) => {
      const evList = evRes.data.data || [];
      const spList = spRes.data.data || [];
      setEvents(evList);
      setSpeakers(spList);
      if (evList.length > 0) setEventId(evList[0]._id);
      if (spList.length > 0) setSpeakerId(spList[0]._id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !title || !room || !startTime || !endTime) {
      setError('Please provide all mandatory scheduling details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sessionAPI.create({
        event: eventId,
        speaker: speakerId || undefined,
        title,
        description,
        room,
        date: new Date(date).toISOString(),
        startTime,
        endTime,
        capacity: Number(capacity),
        category,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to schedule session. Check for room or speaker time conflicts.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Schedule Conference Session</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Target Event */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Session Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecting Distributed AI Agents at Scale"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Speaker & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keynote Speaker</label>
              <select
                value={speakerId}
                onChange={(e) => setSpeakerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No Speaker Assigned</option>
                {speakers.map((sp) => (
                  <option key={sp._id} value={sp._id}>
                    {sp.name} ({sp.company})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Track / Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Room & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room / Stage *</label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Grand Ballroom A"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Seat Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date, Start & End Time */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Synopsis & Learning Outcomes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Validating Conflicts...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
