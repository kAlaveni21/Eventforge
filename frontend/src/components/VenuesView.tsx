import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Users, Wifi, Phone, Mail, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { venueAPI } from '../services/api.js';
import { Venue } from '../types.js';

export const VenuesView: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    venueAPI.getAll().then((res) => {
      setVenues(res.data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-200">
              <Building2 className="h-5 w-5" />
            </div>
            <span>World-Class Convention Centers & Venues</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Auditoriums, breakout suites, exhibition halls, and hybrid broadcast stages
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {venues.length} Facilities Configured
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-12 text-center shadow-md">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-800 font-bold">Loading venue facilities...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">No Venues Found</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {venues.map((venue) => (
            <div
              key={venue._id}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-amber-100/40 hover:border-amber-300 transition duration-300 space-y-6"
            >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-xl font-black text-slate-900">{venue.name}</h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-300 shadow-2xs">
                      ● Active Facility
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center space-x-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    <span className="font-medium text-slate-700">{venue.address}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-5 text-xs">
                  <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 px-4 py-2 text-right">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Total Seating Capacity</span>
                    <div className="text-lg font-black text-amber-950">
                      {venue.capacity.toLocaleString()} Attendees
                    </div>
                  </div>
                  {venue.contactPerson && (
                    <div className="border-l border-slate-200 pl-4 text-slate-600">
                      <div className="font-bold text-slate-900 text-xs">{venue.contactPerson.name}</div>
                      <div className="text-[11px] text-indigo-600 font-semibold">{venue.contactPerson.email}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rooms & Halls */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>Configured Stage Auditoriums & Breakout Rooms</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {venue.rooms.map((room, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 p-4 text-xs shadow-2xs hover:border-indigo-300 transition"
                    >
                      <div className="font-black text-slate-900 text-sm">{room.name}</div>
                      <div className="mt-2 flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-600">Floor: {room.floor || 'Level 1'}</span>
                        <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                          {room.capacity} seats
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities Chips */}
              {venue.facilities && venue.facilities.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Venue Amenities & Connectivity:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {venue.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs flex items-center space-x-1.5"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span>{fac}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
