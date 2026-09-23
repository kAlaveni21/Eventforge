import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Ticket as TicketIcon,
  Tag,
  Star,
  Clock,
  Download,
  AlertTriangle,
  Award,
  FileText,
} from 'lucide-react';
import { Event, Ticket, Session, Registration, Feedback } from '../types.js';
import { eventAPI, registrationAPI, ticketAPI, sessionAPI, feedbackAPI } from '../services/api.js';
import { useAuthStore } from '../store/useAuthStore.js';

interface EventDetailsModalProps {
  eventId: string;
  onClose: () => void;
  onRegistered?: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  eventId,
  onClose,
  onRegistered,
}) => {
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'register' | 'agenda' | 'speakers' | 'sponsors' | 'feedback'>('register');

  // Registration state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState<Registration | null>(null);
  const [registerError, setRegisterError] = useState('');

  // Agenda / Feedback state
  const [scheduleStatus, setScheduleStatus] = useState<Record<string, boolean>>({});
  const [scheduleMessage, setScheduleMessage] = useState<{ id: string; msg: string; isError: boolean } | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await eventAPI.getById(eventId);
      const data = res.data.data;
      setEvent(data);
      if (data.tickets && data.tickets.length > 0) {
        setSelectedTicket(data.tickets[0]);
      }

      // Check which sessions current user is attending
      if (user && data.sessions) {
        const statusMap: Record<string, boolean> = {};
        data.sessions.forEach((s: Session) => {
          if (s.attendees?.some((a: any) => (a._id || a) === user.id || (a._id || a) === (user as any)._id)) {
            statusMap[s._id] = true;
          }
        });
        setScheduleStatus(statusMap);
      }

      // Fetch feedback
      const fbRes = await feedbackAPI.getEvent(eventId);
      if (fbRes.data?.data) {
        setFeedbacks(fbRes.data.data.feedbacks || []);
        setAverageRating(fbRes.data.data.averageRating || 0);
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    try {
      const res = await ticketAPI.validateCoupon(couponCode, eventId);
      if (res.data.success) {
        setDiscountPercent(res.data.data.discountPercent);
        setCouponSuccess(`Coupon applied! ${res.data.data.discountPercent}% discount activated.`);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setDiscountPercent(0);
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedTicket) return 0;
    const base = selectedTicket.price;
    if (discountPercent > 0) {
      const discounted = base - (base * discountPercent) / 100;
      return Math.max(0, discounted).toFixed(2);
    }
    return base.toFixed(2);
  };

  const handleRegister = async () => {
    if (!selectedTicket || !event) return;
    setRegistering(true);
    setRegisterError('');

    try {
      const res = await registrationAPI.create({
        event: event._id,
        ticket: selectedTicket._id,
        couponCode: couponCode.trim() || undefined,
      });

      if (res.data.success) {
        setRegisteredSuccess(res.data.data);
        if (onRegistered) onRegistered();
      }
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleToggleSchedule = async (sessionId: string) => {
    setScheduleMessage(null);
    try {
      const res = await sessionAPI.toggleSchedule(sessionId);
      if (res.data.success) {
        const isScheduled = res.data.data.isScheduled;
        setScheduleStatus((prev) => ({ ...prev, [sessionId]: isScheduled }));
        setScheduleMessage({
          id: sessionId,
          msg: isScheduled ? 'Added to your calendar schedule!' : 'Removed from your schedule',
          isError: false,
        });
      }
    } catch (err: any) {
      setScheduleMessage({
        id: sessionId,
        msg: err.response?.data?.message || 'Conflict detected or capacity reached',
        isError: true,
      });
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');
    setSubmittingFeedback(true);

    try {
      const res = await feedbackAPI.submit({
        event: eventId,
        rating: newRating,
        comment: newComment,
      });

      if (res.data.success) {
        setFeedbackSuccess('Thank you! Your feedback has been recorded.');
        setNewComment('');
        // Refresh feedback list
        const fbRes = await feedbackAPI.getEvent(eventId);
        if (fbRes.data?.data) {
          setFeedbacks(fbRes.data.data.feedbacks || []);
          setAverageRating(fbRes.data.data.averageRating || 0);
        }
      }
    } catch (err: any) {
      setFeedbackError(err.response?.data?.message || 'Could not submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading || !event) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-2xl">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Loading Event Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header Hero Banner */}
        <div className="relative h-56 sm:h-64 w-full shrink-0 overflow-hidden bg-slate-900">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="h-full w-full object-cover opacity-60"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-900 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-semibold">
                {event.category}
              </span>
              <span className="rounded bg-slate-800/80 px-2 py-0.5 text-xs font-medium">
                {event.eventType}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2">
              {event.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-200">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-300" />
                <span>
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-indigo-300" />
                <span>{event.venue?.name || 'TBA'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3.5 w-3.5 text-indigo-300" />
                <span>{event.attendees?.length || 0} Registered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 shrink-0 overflow-x-auto">
          {[
            { id: 'register', label: 'Tickets & Pass' },
            { id: 'agenda', label: `Agenda (${event.sessions?.length || 0})` },
            { id: 'speakers', label: `Speakers (${event.speakers?.length || 0})` },
            { id: 'sponsors', label: `Sponsors (${event.sponsors?.length || 0})` },
            { id: 'feedback', label: `Reviews (${feedbacks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: TICKETS & REGISTRATION */}
          {activeTab === 'register' && (
            <div>
              {registeredSuccess ? (
                /* Registration Success with QR Code */
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                  <h3 className="mt-3 text-lg font-bold text-slate-900">Registration Confirmed!</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                    Your digital pass has been verified. Present this QR code at the gate check-in scanner on event day.
                  </p>

                  <div className="my-6 inline-block rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {registeredSuccess.qrCode ? (
                      <img
                        src={registeredSuccess.qrCode}
                        alt="QR Code"
                        className="h-44 w-44 mx-auto object-contain"
                      />
                    ) : (
                      <div className="h-44 w-44 bg-slate-100 flex items-center justify-center text-xs">
                        QR Code Generated
                      </div>
                    )}
                    <div className="mt-2 text-xs font-mono font-bold text-slate-800">
                      ID: {registeredSuccess.registrationId}
                    </div>
                    <div className="text-[11px] font-medium text-indigo-600">
                      Pass: {(registeredSuccess.ticket as any)?.name || 'Standard'}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>Print / Save Badge</span>
                    </button>
                    <button
                      onClick={() => setRegisteredSuccess(null)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Register Another Ticket
                    </button>
                  </div>
                </div>
              ) : (
                /* Ticket Selection Form */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Select Admission Tier</h3>
                    <p className="text-xs text-slate-500">Choose your ticket package for full conference access</p>
                  </div>

                  {registerError && (
                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(event.tickets || []).map((t) => {
                      const isSelected = selectedTicket?._id === t._id;
                      const isSoldOut = t.sold >= t.quantity;
                      return (
                        <div
                          key={t._id}
                          onClick={() => !isSoldOut && setSelectedTicket(t)}
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <TicketIcon className="h-4 w-4 text-indigo-600" />
                                <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                              </div>
                              <div className="mt-1 text-base font-extrabold text-slate-900">
                                ${t.price}
                              </div>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">
                              {isSoldOut ? 'Sold Out' : `${t.quantity - t.sold} left`}
                            </span>
                          </div>

                          {t.benefits && t.benefits.length > 0 && (
                            <ul className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                              {t.benefits.map((b, i) => (
                                <li key={i} className="flex items-center space-x-1.5">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 mb-2">
                      <Tag className="h-4 w-4 text-indigo-600" />
                      <span>Promotional Code or Corporate Voucher</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Try 'FORGE20' for 20% off or 'WELCOME50'"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs uppercase placeholder:normal-case focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                      >
                        Apply
                      </button>
                    </div>
                    {couponSuccess && (
                      <p className="mt-2 text-xs text-emerald-600 font-medium">{couponSuccess}</p>
                    )}
                    {couponError && (
                      <p className="mt-2 text-xs text-rose-600 font-medium">{couponError}</p>
                    )}
                  </div>

                  {/* Summary & Checkout Button */}
                  <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500">Order Total</div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-slate-900">
                          ${calculateFinalPrice()}
                        </span>
                        {discountPercent > 0 && selectedTicket && (
                          <span className="text-xs text-slate-400 line-through">
                            ${selectedTicket.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={registering || !selectedTicket}
                      onClick={handleRegister}
                      className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {registering ? 'Processing Pass...' : 'Confirm Registration'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AGENDA / SESSIONS */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Conference Sessions & Tracks</h3>
                <span className="text-xs text-slate-500">
                  {event.sessions?.length || 0} scheduled sessions
                </span>
              </div>

              {(!event.sessions || event.sessions.length === 0) && (
                <p className="text-xs text-slate-500 italic">No sessions announced yet.</p>
              )}

              {event.sessions?.map((session) => {
                const isScheduled = !!scheduleStatus[session._id];
                const msg = scheduleMessage?.id === session._id ? scheduleMessage : null;

                return (
                  <div
                    key={session._id}
                    className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 bg-white transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {session.startTime} - {session.endTime}
                          </span>
                          <span>•</span>
                          <span className="text-slate-600">{session.room}</span>
                          <span>•</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                            {session.category}
                          </span>
                        </div>
                        <h4 className="mt-1 text-sm font-bold text-slate-900">{session.title}</h4>
                      </div>

                      <button
                        onClick={() => handleToggleSchedule(session._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                          isScheduled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isScheduled ? '✓ In My Schedule' : '+ Add to Schedule'}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {session.description}
                    </p>

                    {session.speaker && (
                      <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600">
                        <img
                          src={
                            session.speaker.profileImage ||
                            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={session.speaker.name}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-800">{session.speaker.name}</span>
                        <span className="text-slate-400">
                          ({session.speaker.designation} at {session.speaker.company})
                        </span>
                      </div>
                    )}

                    {msg && (
                      <div
                        className={`mt-2 rounded p-2 text-xs ${
                          msg.isError
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {msg.msg}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: SPEAKERS */}
          {activeTab === 'speakers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(event.speakers || []).map((sp) => (
                <div
                  key={sp._id}
                  className="rounded-xl border border-slate-200 p-4 bg-white flex space-x-3 items-start"
                >
                  <img
                    src={sp.profileImage}
                    alt={sp.name}
                    className="h-16 w-16 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{sp.name}</h4>
                    <p className="text-xs text-indigo-600 font-medium truncate">{sp.designation}</p>
                    <p className="text-[11px] text-slate-500 truncate">{sp.company}</p>
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {sp.bio}
                    </p>

                    {sp.presentationMaterial && sp.presentationMaterial.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Materials:
                        </div>
                        {sp.presentationMaterial.map((m, idx) => (
                          <a
                            key={idx}
                            href={m.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:underline mt-0.5"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="truncate">{m.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SPONSORS */}
          {activeTab === 'sponsors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Event Corporate Partners</h3>
                <p className="text-xs text-slate-500">Supporting technology innovations & community engagement</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(event.sponsors || []).map((sp) => (
                  <div
                    key={sp._id}
                    className="rounded-xl border border-slate-200 p-4 bg-white flex items-center space-x-4"
                  >
                    <img
                      src={sp.logo}
                      alt={sp.companyName}
                      className="h-12 w-12 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{sp.companyName}</h4>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            sp.package === 'Platinum'
                              ? 'bg-purple-100 text-purple-700'
                              : sp.package === 'Gold'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sp.package} Tier
                        </span>
                      </div>
                      {sp.website && (
                        <a
                          href={sp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline mt-0.5 block"
                        >
                          {sp.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Average Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Average Attendee Rating
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-3xl font-black text-slate-900">{averageRating}</span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= Math.round(averageRating) ? 'fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">({feedbacks.length} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Submit Feedback Form */}
              <form onSubmit={handleSubmitFeedback} className="rounded-xl border border-slate-200 p-4 bg-white">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Share Your Experience
                </h4>

                {feedbackSuccess && (
                  <div className="mb-3 text-xs text-emerald-600 font-medium">{feedbackSuccess}</div>
                )}
                {feedbackError && (
                  <div className="mb-3 text-xs text-rose-600 font-medium">{feedbackError}</div>
                )}

                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs text-slate-600">Your Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="text-amber-400 hover:scale-110 transition"
                      >
                        <Star
                          className={`h-5 w-5 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What did you learn? How was the session pacing and speaker delivery?"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingFeedback ? 'Posting...' : 'Submit Review'}
                </button>
              </form>

              {/* Verified Feedbacks */}
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div key={fb._id} className="rounded-xl border border-slate-100 p-3 bg-white">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">{fb.attendee?.name || 'Verified Attendee'}</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= fb.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{fb.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
