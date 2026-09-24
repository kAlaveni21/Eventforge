import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventforge_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect immediately in development; let component handle state
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const eventAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

export const sessionAPI = {
  getAll: (params?: any) => api.get('/sessions', { params }),
  getById: (id: string) => api.get(`/sessions/${id}`),
  create: (data: any) => api.post('/sessions', data),
  update: (id: string, data: any) => api.put(`/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/sessions/${id}`),
  toggleSchedule: (id: string) => api.post(`/sessions/${id}/schedule`),
};

export const speakerAPI = {
  getAll: (params?: any) => api.get('/speakers', { params }),
  getById: (id: string) => api.get(`/speakers/${id}`),
  create: (data: any) => api.post('/speakers', data),
  update: (id: string, data: any) => api.put(`/speakers/${id}`, data),
  delete: (id: string) => api.delete(`/speakers/${id}`),
  uploadMaterial: (id: string, data: { title: string; fileUrl: string }) =>
    api.post(`/speakers/${id}/materials`, data),
};

export const venueAPI = {
  getAll: () => api.get('/venues'),
  getById: (id: string) => api.get(`/venues/${id}`),
  create: (data: any) => api.post('/venues', data),
  update: (id: string, data: any) => api.put(`/venues/${id}`, data),
  delete: (id: string) => api.delete(`/venues/${id}`),
};

export const ticketAPI = {
  getAll: (params?: any) => api.get('/tickets', { params }),
  getById: (id: string) => api.get(`/tickets/${id}`),
  create: (data: any) => api.post('/tickets', data),
  validateCoupon: (code: string, eventId?: string) =>
    api.post('/tickets/validate-coupon', { code, eventId }),
};

export const registrationAPI = {
  create: (data: { event: string; ticket: string; couponCode?: string }) =>
    api.post('/registrations', data),
  getAll: (params?: any) => api.get('/registrations', { params }),
  getById: (id: string) => api.get(`/registrations/${id}`),
  updateStatus: (id: string, statusData: any) => api.put(`/registrations/${id}`, statusData),
};

export const attendanceAPI = {
  checkIn: (payload: { registrationId?: string; qrData?: string; eventId?: string }) =>
    api.post('/attendance/check-in', payload),
  checkOut: (payload: { attendanceId?: string; registrationId?: string }) =>
    api.post('/attendance/check-out', payload),
  getEventAttendance: (eventId: string) => api.get(`/attendance/event/${eventId}`),
  markSession: (payload: { sessionId: string; attendeeId?: string; registrationId?: string }) =>
    api.post('/attendance/session', payload),
};

export const sponsorAPI = {
  getAll: (params?: any) => api.get('/sponsors', { params }),
  getById: (id: string) => api.get(`/sponsors/${id}`),
  getPackages: () => api.get('/sponsors/packages'),
  create: (data: any) => api.post('/sponsors', data),
  update: (id: string, data: any) => api.put(`/sponsors/${id}`, data),
  delete: (id: string) => api.delete(`/sponsors/${id}`),
};

export const announcementAPI = {
  getAll: (params?: any) => api.get('/announcements', { params }),
  create: (data: { event: string; title: string; message: string; targetAudience?: string }) =>
    api.post('/announcements', data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

export const feedbackAPI = {
  submit: (data: { event: string; session?: string; rating: number; comment?: string }) =>
    api.post('/feedback', data),
  getEvent: (eventId: string) => api.get(`/feedback/event/${eventId}`),
  getSession: (sessionId: string) => api.get(`/feedback/session/${sessionId}`),
};

export const analyticsAPI = {
  getEvent: (eventId: string) => api.get(`/analytics/events/${eventId}`),
  getAdminOverview: () => api.get('/analytics/admin/overview'),
};

export const aiAPI = {
  generateDescription: (data: {
    title: string;
    category?: string;
    eventType?: string;
    keyThemes?: string;
    targetAudience?: string;
  }) => api.post('/ai/generate-event-description', data),
  generateSpeakerBio: (data: {
    name: string;
    designation: string;
    company?: string;
    rawBio?: string;
    topics?: string;
  }) => api.post('/ai/generate-speaker-bio', data),
  generateSessionSummary: (data: {
    title: string;
    rawDescription?: string;
    speakerName?: string;
    category?: string;
  }) => api.post('/ai/generate-session-summary', data),
  recommendSessions: (data: {
    role?: string;
    interests?: string;
    availableSessions: any[];
  }) => api.post('/ai/recommend-sessions', data),
};

export const uploadAPI = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
