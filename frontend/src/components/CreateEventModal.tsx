import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { eventAPI, venueAPI, aiAPI } from '../services/api.js';
import { Venue } from '../types.js';

interface CreateEventModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreated }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [eventType, setEventType] = useState('Conference');
  const [startDate, setStartDate] = useState('2026-11-12T09:00');
  const [endDate, setEndDate] = useState('2026-11-14T17:00');
  const [venueId, setVenueId] = useState('');
  const [capacity, setCapacity] = useState(1500);
  const [bannerImage, setBannerImage] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  );

  useEffect(() => {
    venueAPI.getAll().then((res) => {
      const list = res.data.data || [];
      setVenues(list);
      if (list.length > 0) setVenueId(list[0]._id);
    });
  }, []);

  const handleAiGenerate = async () => {
    if (!title.trim()) {
      setError('Please provide an event title first for AI generation.');
      return;
    }
    setError('');
    setAiGenerating(true);
    try {
      const res = await aiAPI.generateDescription({
        title,
        category,
        eventType,
      });
      if (res.data.success && res.data.data.marketingDescription) {
        setDescription(res.data.data.marketingDescription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await eventAPI.create({
        title,
        description,
        category,
        eventType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        registrationStart: new Date().toISOString(),
        registrationEnd: new Date(endDate).toISOString(),
        venue: venueId || undefined,
        capacity: Number(capacity),
        bannerImage,
        status: 'PUBLISHED',
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold text-slate-900">Create New Corporate Event</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. European AI & Cloud Infrastructure Summit"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Networking Event">Networking Event</option>
              </select>
            </div>
          </div>

          {/* Description with AI generation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Description *</label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{aiGenerating ? 'Generating...' : 'AI Generate with Gemini'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive summary of event goals, audience, and keynote topics..."
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Venue & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Venue</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Virtual / TBA</option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.location})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacity Limit</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
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
              {loading ? 'Creating...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
