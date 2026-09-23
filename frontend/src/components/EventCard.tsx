import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Shield, Sparkles, Tag } from 'lucide-react';
import { Event } from '../types.js';
import { useAuthStore } from '../store/useAuthStore.js';

interface EventCardProps {
  event: Event;
  onSelect: (event: Event) => void;
  onManage?: (event: Event) => void;
}

const categoryGradients: Record<string, { badge: string; text: string; lightBg: string }> = {
  Technology: {
    badge: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs',
    text: 'text-indigo-600',
    lightBg: 'bg-indigo-50 border-indigo-200',
  },
  Finance: {
    badge: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs',
    text: 'text-emerald-600',
    lightBg: 'bg-emerald-50 border-emerald-200',
  },
  Healthcare: {
    badge: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs',
    text: 'text-rose-600',
    lightBg: 'bg-rose-50 border-rose-200',
  },
  Design: {
    badge: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs',
    text: 'text-amber-600',
    lightBg: 'bg-amber-50 border-amber-200',
  },
};

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, onManage }) => {
  const { user } = useAuthStore();

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const attendeeCount = event.attendees?.length || 0;
  const isOrganizer =
    user?.role === 'PLATFORM_ADMIN' ||
    (user?.role === 'EVENT_ORGANIZER' &&
      (event.organizer?._id === user._id || (event.organizer as any) === user._id));

  const catTheme =
    categoryGradients[event.category] || {
      badge: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs',
      text: 'text-indigo-600',
      lightBg: 'bg-indigo-50 border-indigo-200',
    };

  const capacityPct = Math.min(100, Math.round((attendeeCount / (event.capacity || 100)) * 100));

  // Determine min price
  const minPrice =
    event.ticketTypes && event.ticketTypes.length > 0
      ? Math.min(...event.ticketTypes.map((t) => t.price))
      : 0;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl hover:shadow-indigo-100/70 hover:border-indigo-300 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      {/* Banner Image with vibrant gradient overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={
            event.bannerImage ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
          }
          alt={event.title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

        {/* Category & Event Type Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide shadow-md ${catTheme.badge}`}>
            {event.category}
          </span>
          <span className="rounded-lg bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-slate-200 border border-slate-700/60">
            {event.eventType}
          </span>
        </div>

        {/* Status Pill */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center space-x-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
            <span>{event.status}</span>
          </span>
        </div>

        {/* Bottom Banner Strip for Ticket Pricing preview */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="rounded-md bg-black/50 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-slate-200 flex items-center space-x-1">
            <Tag className="h-3 w-3 text-amber-400" />
            <span>Passes from {minPrice > 0 ? `$${minPrice}` : 'Free'}</span>
          </span>
          <span className="rounded-md bg-indigo-950/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-indigo-200">
            {capacityPct}% Full
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-2">
          <div className="flex items-center space-x-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
          <span>•</span>
          <span className="truncate text-slate-600">{event.venue?.name || 'Grand Convention Hall'}</span>
        </div>

        <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition">
          {event.title}
        </h3>

        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Location & Capacity Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="truncate font-medium text-slate-700">
                {event.venue?.location || 'Virtual / Hybrid Access'}
              </span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              <span className="font-bold text-slate-900">{attendeeCount}</span>
              <span className="text-slate-400">/ {event.capacity}</span>
            </div>
          </div>

          {/* Vibrant Capacity Gauge */}
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPct > 85
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-emerald-500 via-indigo-500 to-violet-500'
              }`}
              style={{ width: `${capacityPct}%` }}
            ></div>
          </div>
        </div>

        {/* Speakers previews */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Keynote Speakers:</span>
            </span>
            <div className="flex -space-x-2 overflow-hidden">
              {event.speakers.slice(0, 4).map((speaker, idx) => (
                <img
                  key={idx}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover shadow-2xs"
                  src={
                    speaker.profileImage ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={speaker.name}
                  title={speaker.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {isOrganizer && onManage ? (
            <button
              onClick={() => onManage(event)}
              className="flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-600" />
              <span>Manage</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Registration Active</span>
            </div>
          )}

          <button
            onClick={() => onSelect(event)}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition ml-auto"
          >
            <span>View Summit</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
