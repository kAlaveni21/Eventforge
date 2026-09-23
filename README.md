# EVENTFORGE – Corporate Event & Conference Management System

Production-grade full-stack MERN application for enterprise conferences, summits, and corporate event operations.

---

## 🌟 Core Architecture & Capabilities

- **Unified Full-Stack Engine**: Express backend + Vite React frontend running on port `3000`.
- **Database**: MongoDB with Mongoose ODM (with automatic in-memory fallback for zero-configuration boot).
- **Security & RBAC**: JWT Bearer authentication with 6 distinct user roles and event-scoped authorization:
  1. `PLATFORM_ADMIN`
  2. `EVENT_ORGANIZER`
  3. `EVENT_STAFF`
  4. `SPEAKER`
  5. `ATTENDEE`
  6. `SPONSOR`
- **Real-Time Communication**: Socket.IO integration for live announcements, event broadcasts, and gate attendance updates.
- **Smart Gate Check-In & Scanner**: QR code ticket generation, scan validation, and automated duplicate check-in detection.
- **AI Intelligence Suite**: Server-side Google Gemini 2.5 Flash integration for automated event copy, speaker bios, session summaries, and attendee recommendations.
- **Executive Analytics**: Interactive Recharts telemetry for revenue velocity, ticket distribution, room occupancy, and sponsor deliverable fulfillment.

---

## 🔑 Pre-Seeded Demo Accounts (Password: `password123`)

| Role | Email | Permissions |
|---|---|---|
| **PLATFORM_ADMIN** | `admin@eventforge.com` | Global venue, user, and event management |
| **EVENT_ORGANIZER** | `organizer@eventforge.com` | Event lifecycle, schedule sessions, broadcast alerts |
| **EVENT_STAFF** | `staff@eventforge.com` | Gate QR verification, session attendance control |
| **SPEAKER** | `speaker@eventforge.com` | Manage speaker bio, upload presentation decks |
| **ATTENDEE** | `attendee@eventforge.com` | Browse events, select tickets, apply coupons, review sessions |
| **SPONSOR** | `sponsor@eventforge.com` | Track deliverables, booth specs, view ROI metrics |

---

## 🎟️ Active Demo Coupons

- `FORGE20` – 20% discount on any admission pass
- `WELCOME50` – 50% discount on early registrations

---

## 📡 REST API Route Catalog

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Authenticate with email & password, returns JWT
- `GET /api/auth/me` – Retrieve authenticated user profile
- `POST /api/auth/logout` – Clear authentication session
- `POST /api/auth/forgot-password` – Generate password reset token
- `PUT /api/auth/reset-password/:resetToken` – Reset user password

### Events (`/api/events`)
- `GET /api/events` – Filter and list published events
- `GET /api/events/:id` – Detailed event information with sessions and speakers
- `POST /api/events` – Create event (Organizer / Admin)
- `PUT /api/events/:id` – Update event details
- `DELETE /api/events/:id` – Delete event

### Sessions & Timetable (`/api/sessions`)
- `GET /api/sessions` – List sessions with event and category filters
- `POST /api/sessions` – Schedule session with automatic room & time conflict check
- `PUT /api/sessions/:id` – Update session details
- `DELETE /api/sessions/:id` – Cancel session
- `POST /api/sessions/:id/schedule` – Add/remove session from attendee calendar

### Gate Access & Attendance (`/api/attendance`)
- `POST /api/attendance/check-in` – Verify QR code or registration ID, preventing duplicates
- `POST /api/attendance/check-out` – Log attendee exit
- `GET /api/attendance/event/:eventId` – Live gate attendance feed
- `POST /api/attendance/session` – Track breakout session room attendance

### Tickets & Registration (`/api/tickets`, `/api/registrations`)
- `GET /api/tickets` – List tickets by event
- `POST /api/tickets` – Create ticket tier (VIP, Standard, Early Bird, Student, Corporate)
- `POST /api/tickets/validate-coupon` – Validate promotional vouchers
- `POST /api/registrations` – Register and generate signed QR code badge
- `GET /api/registrations` – List user or event registrations

### AI Intelligence Suite (`/api/ai`)
- `POST /api/ai/generate-event-description` – Synthesize marketing copy
- `POST /api/ai/generate-speaker-bio` – Polish speaker credentials
- `POST /api/ai/generate-session-summary` – Extract executive takeaways
- `POST /api/ai/recommend-sessions` – Match attendee profile to conference agenda

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server with hot reloads and Socket.IO
npm run dev

# Run database seeder manually (if needed)
npm run seed

# Build for production deployment
npm run build

# Start production server
npm start
```
