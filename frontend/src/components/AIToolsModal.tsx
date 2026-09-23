import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  UserCheck,
  Compass,
  ArrowRight,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { aiAPI } from '../services/api.js';

export const AIToolsModal: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'desc' | 'bio' | 'summary' | 'recommend'>('desc');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [eventTitle, setEventTitle] = useState('NextGen Enterprise Cloud & AI Summit');
  const [eventCategory, setEventCategory] = useState('Technology & Cloud Infrastructure');
  const [eventThemes, setEventThemes] = useState('Autonomous Agents, Multi-Cloud Security, FinOps');

  const [speakerName, setSpeakerName] = useState('Dr. Elizabeth Vance');
  const [speakerDesignation, setSpeakerDesignation] = useState('VP of Machine Learning');
  const [speakerCompany, setSpeakerCompany] = useState('Synthetix Systems');
  const [speakerRawBio, setSpeakerRawBio] = useState('Did PhD at MIT. worked on deep learning and distributed systems for 12 years. authored papers on transformer efficiency.');

  const [sessionTitle, setSessionTitle] = useState('Autonomous Enterprise Agents in Production');
  const [sessionNotes, setSessionNotes] = useState('Discussing how enterprises can deploy LLM agents reliably. Covering human-in-the-loop validation, cost controls, latency reduction, and observability.');

  const [attendeeRole, setAttendeeRole] = useState('Senior Cloud Architect');
  const [attendeeInterests, setAttendeeInterests] = useState('Kubernetes, Zero Trust Security, High Scale Data');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      if (activeTool === 'desc') {
        const res = await aiAPI.generateDescription({
          title: eventTitle,
          category: eventCategory,
          keyThemes: eventThemes,
        });
        setResult(res.data.data);
      } else if (activeTool === 'bio') {
        const res = await aiAPI.generateSpeakerBio({
          name: speakerName,
          designation: speakerDesignation,
          company: speakerCompany,
          rawBio: speakerRawBio,
        });
        setResult(res.data.data);
      } else if (activeTool === 'summary') {
        const res = await aiAPI.generateSessionSummary({
          title: sessionTitle,
          rawDescription: sessionNotes,
        });
        setResult(res.data.data);
      } else if (activeTool === 'recommend') {
        const sampleSessions = [
          { title: 'Opening Keynote: Autonomous Agents in Enterprise', category: 'Artificial Intelligence' },
          { title: 'Zero-Trust Architecture in Multi-Cloud Environments', category: 'Cybersecurity & Cloud' },
          { title: 'Scaling Real-Time Event Driven Data Pipelines', category: 'Engineering & Scalability' },
        ];
        const res = await aiAPI.recommendSessions({
          role: attendeeRole,
          interests: attendeeInterests,
          availableSessions: sampleSessions,
        });
        setResult(res.data.data);
      }
    } catch (err: any) {
      setResult({ error: err.response?.data?.message || 'AI generation failed. Please check server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <span>EventForge AI Studio (Gemini 2.5 Flash)</span>
        </h2>
        <p className="text-xs text-slate-500">
          Intelligent content generation for event organizers, conference speakers, and attendees
        </p>
      </div>

      {/* Tool Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'desc', label: 'Event Description', icon: FileText },
          { id: 'bio', label: 'Speaker Bio Polisher', icon: UserCheck },
          { id: 'summary', label: 'Session Summaries', icon: Zap },
          { id: 'recommend', label: 'Smart Recommender', icon: Compass },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id as any);
                setResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Configure AI Generation</h3>

          {activeTool === 'desc' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category & Domain</label>
                <input
                  type="text"
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Key Themes & Highlights</label>
                <textarea
                  rows={3}
                  value={eventThemes}
                  onChange={(e) => setEventThemes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTool === 'bio' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Speaker Name</label>
                <input
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={speakerDesignation}
                    onChange={(e) => setSpeakerDesignation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Organization</label>
                  <input
                    type="text"
                    value={speakerCompany}
                    onChange={(e) => setSpeakerCompany(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rough Notes or Bullet Points</label>
                <textarea
                  rows={3}
                  value={speakerRawBio}
                  onChange={(e) => setSpeakerRawBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTool === 'summary' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Session Title</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Session Talk Details & Outline</label>
                <textarea
                  rows={4}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTool === 'recommend' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Attendee Professional Role</label>
                <input
                  type="text"
                  value={attendeeRole}
                  onChange={(e) => setAttendeeRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Core Tech Focus & Interests</label>
                <textarea
                  rows={3}
                  value={attendeeInterests}
                  onChange={(e) => setAttendeeInterests(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            disabled={loading}
            onClick={handleGenerate}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Synthesizing with Gemini...' : 'Generate with Gemini AI'}</span>
          </button>
        </div>

        {/* Right: Output */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Synthesized Output</h3>
            {result && !result.error && (
              <button
                onClick={() => handleCopy(typeof result === 'string' ? result : JSON.stringify(result, null, 2))}
                className="flex items-center space-x-1 text-xs text-indigo-600 font-semibold hover:underline"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 overflow-y-auto min-h-[250px] text-xs leading-relaxed text-slate-700">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
                <span className="mt-3 text-slate-500 font-medium text-xs">
                  Calling Gemini 2.5 Flash server-side...
                </span>
              </div>
            ) : result?.error ? (
              <div className="text-rose-600 font-medium">{result.error}</div>
            ) : result ? (
              <div>
                {result.marketingDescription && (
                  <div className="space-y-3">
                    <div>
                      <div className="font-bold text-slate-900 mb-1">Generated Marketing Copy:</div>
                      <p className="whitespace-pre-line text-slate-600">{result.marketingDescription}</p>
                    </div>
                    {result.headline && (
                      <div>
                        <div className="font-bold text-slate-900 mb-1">Headline Hook:</div>
                        <p className="text-indigo-600 font-semibold">{result.headline}</p>
                      </div>
                    )}
                  </div>
                )}

                {result.polishedBio && (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-900 mb-1">Professional Speaker Bio:</div>
                    <p className="whitespace-pre-line text-slate-600">{result.polishedBio}</p>
                  </div>
                )}

                {result.executiveSummary && (
                  <div className="space-y-3">
                    <div>
                      <div className="font-bold text-slate-900 mb-1">Executive Summary:</div>
                      <p className="text-slate-600">{result.executiveSummary}</p>
                    </div>
                    {result.keyTakeaways && (
                      <div>
                        <div className="font-bold text-slate-900 mb-1">Key Takeaways:</div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          {result.keyTakeaways.map((t: string, idx: number) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {result.recommendations && (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-900 mb-2">Recommended Agenda Tracks:</div>
                    <div className="space-y-2">
                      {result.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <div className="font-bold text-indigo-700">{rec.sessionTitle || rec.title}</div>
                          <div className="mt-1 text-slate-600 text-[11px]">{rec.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!result.marketingDescription &&
                  !result.polishedBio &&
                  !result.executiveSummary &&
                  !result.recommendations && (
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                    </pre>
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Sparkles className="h-8 w-8 text-slate-300 mb-2" />
                <p>Select inputs on the left and click Generate to view AI responses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
