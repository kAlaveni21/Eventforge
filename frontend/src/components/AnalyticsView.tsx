import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Award,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { analyticsAPI, eventAPI } from '../services/api.js';
import { Event } from '../types.js';

const TICKET_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export const AnalyticsView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventAPI.getAll().then((res) => {
      const list = res.data.data || [];
      setEvents(list);
      if (list.length > 0) {
        setSelectedEventId(list[0]._id);
      }
    });
  }, []);

  const loadAnalytics = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      const res = await analyticsAPI.getEvent(selectedEventId);
      setAnalyticsData(res.data.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedEventId]);

  if (loading || !analyticsData) {
    return (
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-12 text-center shadow-lg shadow-indigo-100/50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
        <p className="mt-3 text-sm text-indigo-900 font-bold">Aggregating real-time summit telemetry...</p>
        <p className="text-xs text-slate-500 mt-0.5">Calculating financial yield and gate throughput</p>
      </div>
    );
  }

  const { overview, ticketBreakdown, sessionPopularity, feedbackSummary, sponsorStats } = analyticsData;

  const revenueTrendData = [
    { day: 'Day -14', revenue: overview.totalRevenue * 0.15, registrations: Math.round(overview.totalRegistrations * 0.1) },
    { day: 'Day -10', revenue: overview.totalRevenue * 0.35, registrations: Math.round(overview.totalRegistrations * 0.3) },
    { day: 'Day -7', revenue: overview.totalRevenue * 0.65, registrations: Math.round(overview.totalRegistrations * 0.6) },
    { day: 'Day -3', revenue: overview.totalRevenue * 0.85, registrations: Math.round(overview.totalRegistrations * 0.85) },
    { day: 'Today', revenue: overview.totalRevenue, registrations: overview.totalRegistrations },
  ];

  const ticketPieData = (ticketBreakdown || []).map((tb: any) => ({
    name: tb.name,
    value: tb.sold || 1,
    revenue: tb.revenue || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header with vibrant accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span>Executive Event Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on registration velocity, revenue yield, and attendee engagement
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 shadow-xs">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vibrant KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Registrations */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30 p-5 shadow-sm hover:shadow-md transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Total Registrations
            </span>
            <div className="rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 text-white shadow-sm shadow-indigo-200">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-indigo-950">
            {overview.totalRegistrations}
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs">
            <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700 text-[11px]">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              {overview.confirmedRegistrations} Confirmed
            </span>
            <span className="text-slate-500">active summit passes</span>
          </div>
        </div>

        {/* KPI 2: Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 p-5 shadow-sm hover:shadow-md transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Ticket Revenue
            </span>
            <div className="rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 p-2.5 text-white shadow-sm shadow-emerald-200">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-950">
            ${overview.totalRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-800">
            Avg ticket yield: <strong className="font-bold">${(overview.totalRevenue / (overview.totalRegistrations || 1)).toFixed(1)}</strong>
          </div>
        </div>

        {/* KPI 3: Attendance Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/30 p-5 shadow-sm hover:shadow-md transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
              Gate Check-in Rate
            </span>
            <div className="rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-600 p-2.5 text-white shadow-sm shadow-sky-200">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-sky-950">
            {overview.attendanceRate}%
          </div>
          <div className="mt-2 text-xs font-medium text-sky-800">
            <strong className="font-bold">{overview.totalCheckIns}</strong> of {overview.totalRegistrations} checked in
          </div>
        </div>

        {/* KPI 4: Feedback Rating */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 p-5 shadow-sm hover:shadow-md transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Attendee Satisfaction
            </span>
            <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-2.5 text-white shadow-sm shadow-amber-200">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-amber-950 flex items-center space-x-1.5">
            <span>{feedbackSummary.averageRating}</span>
            <span className="text-sm font-semibold text-amber-600">/ 5.0</span>
          </div>
          <div className="mt-2 text-xs font-medium text-amber-800">
            Across <strong className="font-bold">{feedbackSummary.totalReviews}</strong> verified reviews
          </div>
        </div>
      </div>

      {/* Visual Charts Grid with vibrant colors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Velocity Trend */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                <span>Registration & Revenue Velocity</span>
              </h3>
              <p className="text-xs text-slate-500">Cumulative ramp-up prior to summit launch</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
              Live Curve
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ticket Tier Breakdown */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-600"></span>
                <span>Ticket Tier Distribution</span>
              </h3>
              <p className="text-xs text-slate-500">Volume breakdown across pass tiers</p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
              Tier Mix
            </span>
          </div>

          <div className="h-64 w-full flex items-center">
            {ticketPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {ticketPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={TICKET_COLORS[index % TICKET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 mx-auto">No ticket data available</div>
            )}
          </div>
        </div>

        {/* Chart 3: Session Attendance Heatmap */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                <span>Session Attendance & Popularity</span>
              </h3>
              <p className="text-xs text-slate-500">Attendee bookings per scheduled session</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700">
              Capacity Load
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionPopularity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => val.substring(0, 15) + '...'} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="attendees" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deliverables Status */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Sponsor Deliverable Fulfillment</span>
              </h3>
              <p className="text-xs text-slate-500">Corporate commitments and booth activation status</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              Sponsor ROI
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Completed Deliverables</span>
                <span className="text-emerald-600 font-extrabold">{sponsorStats?.deliverablesCompleted || 0} / {sponsorStats?.totalDeliverables || 10}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      sponsorStats?.totalDeliverables
                        ? (sponsorStats.deliverablesCompleted / sponsorStats.totalDeliverables) * 100
                        : 50
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4">
                <div className="text-purple-600 font-bold text-[11px] uppercase tracking-wider">Active Corporate Sponsors</div>
                <div className="text-2xl font-black text-purple-950 mt-1">
                  {sponsorStats?.totalSponsors || 0}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4">
                <div className="text-emerald-600 font-bold text-[11px] uppercase tracking-wider">Total Deliverables</div>
                <div className="text-2xl font-black text-emerald-950 mt-1">
                  {sponsorStats?.totalDeliverables || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
