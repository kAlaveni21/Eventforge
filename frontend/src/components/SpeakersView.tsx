import React, { useState, useEffect } from 'react';
import { Users, FileText, ExternalLink, Plus, Upload, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { speakerAPI } from '../services/api.js';
import { Speaker } from '../types.js';
import { useAuthStore } from '../store/useAuthStore.js';

const tagColors = [
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-rose-50 text-rose-700 border-rose-200',
];

export const SpeakersView: React.FC = () => {
  const { user } = useAuthStore();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  // Material upload modal state
  const [uploadModalSpeaker, setUploadModalSpeaker] = useState<Speaker | null>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('https://eventforge.com/slides/keynote-presentation.pdf');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchSpeakers = async () => {
    try {
      setLoading(true);
      const res = await speakerAPI.getAll();
      setSpeakers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load speakers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalSpeaker || !materialTitle || !materialUrl) return;

    setUploading(true);
    try {
      await speakerAPI.uploadMaterial(uploadModalSpeaker._id, {
        title: materialTitle,
        fileUrl: materialUrl,
      });
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadModalSpeaker(null);
        fetchSpeakers();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with colorful accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white shadow-md shadow-rose-200">
              <Users className="h-5 w-5" />
            </div>
            <span>Distinguished Keynote Speakers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global industry visionaries, leading researchers, and enterprise engineering architects
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {speakers.length} Featured Speakers
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-12 text-center shadow-md">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-800 font-bold">Retrieving speaker directory...</p>
        </div>
      ) : speakers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">No Speakers Registered Yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((sp, speakerIdx) => (
            <div
              key={sp._id}
              className="group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/60 hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-4">
                  <div className="relative shrink-0">
                    <img
                      src={sp.profileImage}
                      alt={sp.name}
                      className="h-16 w-16 rounded-2xl object-cover ring-4 ring-indigo-100 group-hover:ring-indigo-400 group-hover:scale-105 transition transform duration-300 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-1 text-white shadow-xs">
                      <Award className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 truncate group-hover:text-indigo-600 transition">
                      {sp.name}
                    </h3>
                    <p className="text-xs font-bold text-indigo-600 truncate mt-0.5">
                      {sp.designation}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 truncate">{sp.company}</p>
                  </div>
                </div>

                <p className="mt-3.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {sp.bio}
                </p>

                {/* Multi-Colored Expertise Badges */}
                {sp.expertise && sp.expertise.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {sp.expertise.map((exp, idx) => {
                      const colorClass = tagColors[(speakerIdx + idx) % tagColors.length];
                      return (
                        <span
                          key={idx}
                          className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-2xs ${colorClass}`}
                        >
                          {exp}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Downloadable Materials with colorful accents */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Session Slides & Handouts</span>
                  </div>
                  {sp.presentationMaterial && sp.presentationMaterial.length > 0 ? (
                    <div className="space-y-1.5">
                      {sp.presentationMaterial.map((m, idx) => (
                        <a
                          key={idx}
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-xl transition"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{m.title}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400 ml-auto shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No slide decks uploaded yet</p>
                  )}
                </div>
              </div>

              {/* Upload Material Button */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setUploadModalSpeaker(sp)}
                  className="flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 transition shadow-2xs"
                >
                  <Upload className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Upload Slide Deck</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-indigo-100">
            <h3 className="text-base font-black text-slate-900 mb-1">
              Upload Slide Deck / Handout
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add presentation materials for <strong className="text-indigo-600">{uploadModalSpeaker.name}</strong>
            </p>

            {uploadSuccess ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="mt-2 text-sm font-bold text-emerald-900">Upload Completed!</h4>
                <p className="text-xs text-emerald-700 mt-1">Presentation deck is now live for attendees.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadMaterial} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Presentation Title
                  </label>
                  <input
                    type="text"
                    required
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="e.g. Next-Gen Distributed Architecture.pdf"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    File URL / Cloud Storage Link
                  </label>
                  <input
                    type="url"
                    required
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalSpeaker(null)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition"
                  >
                    {uploading ? 'Attaching...' : 'Upload & Publish'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
