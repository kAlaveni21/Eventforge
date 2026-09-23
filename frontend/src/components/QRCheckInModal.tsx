import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { attendanceAPI, eventAPI, sessionAPI, registrationAPI } from '../services/api.js';
import { Event, Session, Registration } from '../types.js';

export const QRCheckInModal: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('gate'); // 'gate' or sessionId

  const [inputRegId, setInputRegId] = useState('EF-GTS26-DEMO01');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    message: string;
    attendee?: any;
    ticket?: any;
    checkInTime?: string;
  } | null>(null);

  const [attendances, setAttendances] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Load initial events
  useEffect(() => {
    eventAPI.getAll().then((res) => {
      const list = res.data.data || [];
      setEvents(list);
      if (list.length > 0) {
        setSelectedEventId(list[0]._id);
      }
    });
  }, []);

  // When selected event changes, load sessions & attendance
  const loadEventData = async () => {
    if (!selectedEventId) return;
    setLoadingRecords(true);
    try {
      const [sessRes, attRes, regRes] = await Promise.all([
        sessionAPI.getAll({ event: selectedEventId }),
        attendanceAPI.getEventAttendance(selectedEventId),
        registrationAPI.getAll({ event: selectedEventId }),
      ]);
      setSessions(sessRes.data.data || []);
      setAttendances(attRes.data.data?.records || []);
      setRegistrations(regRes.data.data || []);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, [selectedEventId]);

  const handleProcessScan = async (regIdToUse?: string) => {
    const targetId = regIdToUse || inputRegId;
    if (!targetId.trim()) return;

    setScanning(true);
    setScanResult(null);

    try {
      if (selectedSessionId === 'gate') {
        // Main gate check-in
        const res = await attendanceAPI.checkIn({
          registrationId: targetId.trim(),
          eventId: selectedEventId || undefined,
        });

        if (res.data.success) {
          const { attendance, registration } = res.data.data;
          setScanResult({
            success: true,
            message: res.data.message || 'Check-in Verified!',
            attendee: registration?.attendee,
            ticket: registration?.ticket,
            checkInTime: new Date(attendance?.checkInTime).toLocaleTimeString(),
          });
          loadEventData();
        }
      } else {
        // Session-specific attendance marking
        const res = await attendanceAPI.markSession({
          sessionId: selectedSessionId,
          registrationId: targetId.trim(),
        });

        if (res.data.success) {
          setScanResult({
            success: true,
            message: 'Session attendance recorded successfully!',
            checkInTime: new Date().toLocaleTimeString(),
          });
          loadEventData();
        }
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.alreadyCheckedIn) {
        setScanResult({
          success: false,
          alreadyCheckedIn: true,
          message: data.message || 'Attendee was already checked in earlier!',
          attendee: data.registration?.attendee,
          ticket: data.registration?.ticket,
        });
      } else {
        setScanResult({
          success: false,
          message: data?.message || 'Invalid QR code or registration record not found.',
        });
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-indigo-600" />
            <span>Gate Access & Attendance Control</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time optical scanner simulation with instant duplicate check-in prevention
          </p>
        </div>

        {/* Event Selector */}
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none shadow-xs"
        >
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scanner Station */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Check-in Terminal
              </span>
              <span className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Ready to Scan</span>
              </span>
            </div>

            {/* Checkpoint Target: Gate or Breakout Session */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scan Checkpoint
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="gate">Main Gate Admission (Badge & Pass)</option>
                <optgroup label="Breakout Sessions">
                  {sessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.room}: {s.title.substring(0, 35)}...
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* QR / Registration Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scanned QR Payload or Registration ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputRegId}
                  onChange={(e) => setInputRegId(e.target.value)}
                  placeholder="e.g. EF-GTS26-DEMO01"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Scan Action Button */}
            <button
              disabled={scanning || !inputRegId}
              onClick={() => handleProcessScan()}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Zap className="h-4 w-4" />
              <span>{scanning ? 'Verifying...' : 'Verify & Check-In'}</span>
            </button>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Fill Registered Passes:
              </span>
              <div className="space-y-1.5">
                {registrations.slice(0, 4).map((reg) => (
                  <button
                    key={reg._id}
                    onClick={() => {
                      setInputRegId(reg.registrationId);
                      handleProcessScan(reg.registrationId);
                    }}
                    className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{reg.attendee?.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{reg.registrationId}</div>
                    </div>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 border border-slate-200">
                      {(reg.ticket as any)?.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Scan Verification Results & Live Attendance Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Alert Box */}
          {scanResult && (
            <div
              className={`rounded-2xl border p-6 transition shadow-xs ${
                scanResult.success
                  ? 'border-emerald-200 bg-emerald-50/70'
                  : scanResult.alreadyCheckedIn
                  ? 'border-amber-200 bg-amber-50/70'
                  : 'border-rose-200 bg-rose-50/70'
              }`}
            >
              <div className="flex items-start space-x-3">
                {scanResult.success ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                ) : scanResult.alreadyCheckedIn ? (
                  <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-rose-600 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-base font-bold ${
                      scanResult.success
                        ? 'text-emerald-900'
                        : scanResult.alreadyCheckedIn
                        ? 'text-amber-900'
                        : 'text-rose-900'
                    }`}
                  >
                    {scanResult.alreadyCheckedIn
                      ? 'Duplicate Scan Detected'
                      : scanResult.success
                      ? 'Check-in Verified'
                      : 'Verification Failed'}
                  </h3>

                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      scanResult.success
                        ? 'text-emerald-700'
                        : scanResult.alreadyCheckedIn
                        ? 'text-amber-800 font-medium'
                        : 'text-rose-700'
                    }`}
                  >
                    {scanResult.message}
                  </p>

                  {scanResult.attendee && (
                    <div className="mt-3 flex items-center space-x-3 rounded-xl bg-white/80 p-3 border border-slate-200">
                      <img
                        src={
                          scanResult.attendee.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt="Attendee"
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {scanResult.attendee.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {scanResult.attendee.company || scanResult.attendee.email}
                        </div>
                        {scanResult.ticket && (
                          <div className="text-[10px] font-bold text-indigo-600 uppercase mt-0.5">
                            Pass: {scanResult.ticket.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Attendance Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Attendance Log</h3>
                <p className="text-xs text-slate-500">
                  {attendances.length} attendees processed through gate
                </p>
              </div>
              <button
                onClick={loadEventData}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh Log
              </button>
            </div>

            {loadingRecords ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading records...</div>
            ) : attendances.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                No gate check-ins logged yet for this event.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {attendances.map((record) => (
                  <div key={record._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          record.attendee?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{record.attendee?.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {record.attendee?.company || record.attendee?.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-slate-600 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-indigo-500" />
                        <span>{new Date(record.checkInTime).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Gate Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
