import React, { useState } from 'react';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Building2,
  Briefcase,
  Phone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { UserRole } from '../types.js';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onClose,
}) => {
  const { login, register, quickLogin, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('ATTENDEE');
  const [regCompany, setRegCompany] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [formValidationMsg, setFormValidationMsg] = useState('');

  const handleTabSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
    setFormValidationMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationMsg('');
    clearError();

    if (!loginEmail.trim() || !loginPassword) {
      setFormValidationMsg('Please fill in both email and password.');
      return;
    }

    const success = await login(loginEmail.trim(), loginPassword);
    if (success && onClose) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationMsg('');
    clearError();

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setFormValidationMsg('Please complete all required fields (Name, Email, Password).');
      return;
    }

    if (regPassword.length < 6) {
      setFormValidationMsg('Password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setFormValidationMsg('Passwords do not match. Please verify.');
      return;
    }

    const success = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      company: regCompany.trim() || undefined,
      title: regTitle.trim() || undefined,
      phone: regPhone.trim() || undefined,
    });

    if (success && onClose) {
      onClose();
    }
  };

  const demoRoles: Array<{ role: UserRole; name: string; title: string }> = [
    { role: 'PLATFORM_ADMIN', name: 'Alexander Vance', title: 'Platform Admin' },
    { role: 'EVENT_ORGANIZER', name: 'Elena Rostova', title: 'Lead Organizer' },
    { role: 'EVENT_STAFF', name: 'Marcus Chen', title: 'Event Staff' },
    { role: 'SPEAKER', name: 'Dr. Aris Thorne', title: 'Keynote Speaker' },
    { role: 'ATTENDEE', name: 'Sophia Patel', title: 'Attendee' },
    { role: 'SPONSOR', name: 'David Sterling', title: 'Corporate Sponsor' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700"></div>

        {/* Close Button if opened in modal/overlay */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100 mb-3">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {mode === 'login' ? 'Welcome Back to EVENTFORGE' : 'Create Your Account'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {mode === 'login'
                ? 'Sign in to access conference agendas, digital badges, gate access, and organizer tools'
                : 'Join the corporate event platform for attendees, organizers, speakers, and sponsors'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              id="tab-login"
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`rounded-lg py-2.5 transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`rounded-lg py-2.5 transition ${
                mode === 'register'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Notice */}
          {(error || formValidationMsg) && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error || formValidationMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Fill Buttons */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Instant Demo Accounts
                  </span>
                  <span className="text-[10px] text-slate-400">Password: password123</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {demoRoles.map((d) => (
                    <button
                      key={d.role}
                      type="button"
                      onClick={async () => {
                        await quickLogin(d.role);
                        if (onClose) onClose();
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left text-xs hover:border-indigo-300 hover:bg-indigo-50/50 transition"
                    >
                      <div className="font-bold text-slate-800 text-[11px] truncate">{d.name}</div>
                      <div className="text-[10px] text-indigo-600 font-medium">{d.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="rachel.adams@enterprise.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Platform Role *
                </label>
                <select
                  id="register-role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="ATTENDEE">Attendee (Browse & Register for Summits)</option>
                  <option value="EVENT_ORGANIZER">Event Organizer (Create & Manage Conferences)</option>
                  <option value="EVENT_STAFF">Event Staff (Gate QR Verification & Operations)</option>
                  <option value="SPEAKER">Speaker (Manage Profiles & Slide Materials)</option>
                  <option value="SPONSOR">Corporate Sponsor (Booth & Deliverables Management)</option>
                </select>
              </div>

              {/* Company & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Apex Global"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Director of Engineering"
                      value={regTitle}
                      onChange={(e) => setRegTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="register-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="register-confirm-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
