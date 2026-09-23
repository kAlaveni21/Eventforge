import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Clock, ExternalLink, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { sponsorAPI } from '../services/api.js';
import { Sponsor, SponsorDeliverable } from '../types.js';
import { useAuthStore } from '../store/useAuthStore.js';

const tierThemes: Record<string, { badge: string; border: string; bg: string; dot: string }> = {
  Platinum: {
    badge: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm',
    border: 'border-purple-300',
    bg: 'bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30',
    dot: 'bg-purple-500',
  },
  Gold: {
    badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm',
    border: 'border-amber-300',
    bg: 'bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30',
    dot: 'bg-amber-500',
  },
  Silver: {
    badge: 'bg-gradient-to-r from-slate-600 to-cyan-700 text-white shadow-sm',
    border: 'border-slate-300',
    bg: 'bg-gradient-to-br from-slate-50/60 via-white to-cyan-50/30',
    dot: 'bg-cyan-500',
  },
  Bronze: {
    badge: 'bg-gradient-to-r from-orange-600 to-amber-700 text-white shadow-sm',
    border: 'border-orange-300',
    bg: 'bg-gradient-to-br from-orange-50/50 via-white to-amber-50/20',
    dot: 'bg-orange-500',
  },
};

export const SponsorsView: React.FC = () => {
  const { user } = useAuthStore();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthorizedToEdit =
    user?.role === 'PLATFORM_ADMIN' ||
    user?.role === 'EVENT_ORGANIZER' ||
    user?.role === 'SPONSOR';

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const res = await sponsorAPI.getAll();
      setSponsors(res.data.data || []);
    } catch (err) {
      console.error('Failed to load sponsors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleUpdateDeliverableStatus = async (
    sponsor: Sponsor,
    delivIdx: number,
    newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    const updatedDeliverables = [...sponsor.assignedDeliverables];
    updatedDeliverables[delivIdx].status = newStatus;

    try {
      await sponsorAPI.update(sponsor._id, {
        assignedDeliverables: updatedDeliverables,
      });
      fetchSponsors();
    } catch (err) {
      console.error('Failed to update deliverable:', err);
    }
  };

  const tiers: Array<'Platinum' | 'Gold' | 'Silver' | 'Bronze'> = [
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200">
              <Award className="h-5 w-5" />
            </div>
            <span>Corporate Sponsors & Tiered Deliverables</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Brand exposure fulfillment, keynote priority, booth allocation, and ROI tracking
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {sponsors.length} Corporate Partners
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-12 text-center shadow-md">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-800 font-bold">Loading enterprise sponsors...</p>
        </div>
      ) : sponsors.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Award className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">No Sponsors Registered Yet</h3>
        </div>
      ) : (
        <div className="space-y-8">
          {tiers.map((tier) => {
            const tierSponsors = sponsors.filter((s) => s.package === tier);
            if (tierSponsors.length === 0) return null;
            const theme = tierThemes[tier] || tierThemes.Platinum;

            return (
              <div key={tier} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className={`rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider ${theme.badge}`}>
                    {tier} Partners
                  </span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-200 via-purple-100 to-transparent"></div>
                  <span className="text-xs font-bold text-slate-400">
                    {tierSponsors.length} {tierSponsors.length === 1 ? 'Organization' : 'Organizations'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tierSponsors.map((sp) => {
                    const completedCount = sp.assignedDeliverables.filter((d) => d.status === 'COMPLETED').length;
                    const progressPct = sp.assignedDeliverables.length > 0
                      ? Math.round((completedCount / sp.assignedDeliverables.length) * 100)
                      : 100;

                    return (
                      <div
                        key={sp._id}
                        className={`rounded-3xl border ${theme.border} ${theme.bg} p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition duration-300 flex flex-col justify-between`}
                      >
                        <div>
                          {/* Company Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-3.5">
                              <img
                                src={sp.logo}
                                alt={sp.companyName}
                                className="h-14 w-14 rounded-2xl object-contain bg-white p-2 border border-slate-200 shadow-2xs"
                              />
                              <div>
                                <h3 className="text-base font-black text-slate-900">{sp.companyName}</h3>
                                <div className="text-xs text-slate-500 font-medium">
                                  Liaison: <strong className="text-slate-700">{sp.contactPerson}</strong>
                                </div>
                                <div className="text-[11px] text-indigo-600 font-semibold">{sp.email}</div>
                              </div>
                            </div>

                            {sp.website && (
                              <a
                                href={sp.website}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition shadow-2xs"
                                title="Visit Website"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>

                          {/* Progress Meter */}
                          <div className="mt-4 pt-3.5 border-t border-slate-200/60">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                              <span>Deliverable Fulfillment:</span>
                              <span className="text-indigo-600 font-extrabold">{progressPct}% Complete ({completedCount}/{sp.assignedDeliverables.length})</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Deliverables Checklist */}
                          <div className="mt-4 space-y-2">
                            {sp.assignedDeliverables.map((deliv, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-xl bg-white/90 border border-slate-200/70 px-3 py-2 text-xs shadow-2xs"
                              >
                                <span className="font-semibold text-slate-800 truncate pr-2">
                                  {deliv.title}
                                </span>

                                {isAuthorizedToEdit ? (
                                  <select
                                    value={deliv.status}
                                    onChange={(e) =>
                                      handleUpdateDeliverableStatus(
                                        sp,
                                        idx,
                                        e.target.value as any
                                      )
                                    }
                                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase cursor-pointer border ${
                                      deliv.status === 'COMPLETED'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : deliv.status === 'IN_PROGRESS'
                                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                                    }`}
                                  >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                                      deliv.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : deliv.status === 'IN_PROGRESS'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {deliv.status}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
