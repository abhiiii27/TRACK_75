<div align="center">

# Track75

### Track Smart. Stay Eligible.

A full-stack attendance intelligence platform that helps college students track, predict, and plan their attendance before the detention list does.

<br />

![Status](https://img.shields.io/badge/status-active%20development-6366f1?style=for-the-badge)
![Frontend](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Server](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Styling](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Database](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)

<br />

[Overview](#project-overview) • [Core Features](#core-features) • [AI Architecture](#ai-notification-architecture) • [Background Scheduler](#background-scheduler) • [Firebase Integration](#firebase--fcm) • [Project Progress](#project-progress) • [Testing & Verification](#testing--verification) • [Tech Stack](#technology-stack)

</div>

---

## Project Overview

Track75 is an intelligent attendance management and student assistance platform designed to help students monitor attendance, understand attendance risk, receive contextual AI recommendations, and receive smart push notifications before attendance shortages turn into detention notices.

Most students only discover their attendance shortage when the detention list is published. Track75 provides an early warning system that evaluates historical logs and current targets to provide deterministic next steps, projections, and proactive alerts.

---

## Core Features

- **JWT Authentication:** Secure user authentication (registration, login, profile setup, and session management).
- **Subject Management:** Create, edit, and delete subjects with real-time UI synchronization.
- **Attendance Tracking:** Mark Present/Absent and edit past records directly in a chronological timeline.
- **Attendance History:** Reverse-chronological timeline of all logged attendance records.
- **Dashboard Analytics:** Live aggregate stats including overall percentage, missed classes, and subjects safely on track.
- **Attendance Goal Tracking:** User-defined minimum target percentage adaptation (default: 75%).
- **Attendance Risk Analysis:** Dynamically evaluates risk per subject (SAFE, MEDIUM, HIGH, CRITICAL).
- **AI Prediction Engine:** Algorithmic forecasting for end-of-semester trends based on recent logging velocity and upcoming schedules.
- **AI Recommendation Engine:** Generates priority tasks and structured recovery plans.
- **Smart Notification Engine:** Generates contextual alerts stored persistently in the database with deduplication logic.
- **In-App Notifications:** Real-time in-app notification center with read/unread tracking and status indicators.
- **Push Notification Delivery:** End-to-end push notification delivery to user devices via Firebase Cloud Messaging.
- **PWA & Service Worker:** Installable web application with offline app shell caching and background notification support.
- **Device Registration:** Secure backend token synchronization mapping active devices to authenticated user accounts.
- **Device Token Lifecycle:** Automatic activation, deactivation, and deduplication of device push tokens.
- **Background Notification Scheduler:** Automated background jobs running on APScheduler to evaluate registers and orchestrate delivery cycles.
- **Developer Tools:** In-app diagnostics for scheduler monitoring, token status verification, and push notification testing.

---

## AI Notification Architecture

The intelligent notification dispatch relies on a sequence of decoupled internal engines that isolate attendance analysis, notification generation, persistence, and delivery orchestration:

```
Attendance Data
      │
      ▼
NotificationRuleEngine ──▶ Evaluates required classes & threshold boundaries
      │
      ▼
AINotificationService   ──▶ Converts system triggers into contextual messages & recovery tasks
      │
      ▼
NotificationService     ──▶ Persists notifications into database with deduplication logic
      │
      ▼
FirebaseService         ──▶ Dispatches multicast message payloads via Firebase Admin SDK
      │
      ▼
Browser / Device        ──▶ Service Worker displays push notification to the user
```

---

## Background Scheduler

The backend integrates an automated task runner responsible for evaluating attendance records and orchestrating the delivery pipeline:
- **Engine:** APScheduler integrated seamlessly into FastAPI startup and shutdown lifecycle events.
- **Automated Cycle:** Periodically queries attendance registers, evaluates notification rules, and dispatches pending alerts.
- **Configurable Interval:** Easily adjustable notification dispatch frequency via configuration.
- **Default Interval:** 30 minutes.
- **Timezone Support:** Enforces standard Asia/Kolkata timezone handling.
- **API Integration:** Dedicated `/api/dev/scheduler-status` endpoint exposing job status, last run, and next run timestamps.
- **Developer Tools UI:** Real-time visual monitoring card displaying scheduler status and interval settings.

---

## Firebase / FCM

The platform is integrated with Firebase Cloud Messaging to ensure reliable push message generation and dispatch:
- **Firebase Web SDK:** Powers the frontend client to negotiate browser permissions and handle incoming messages.
- **Firebase Admin SDK:** Backend SDK configured with Google Cloud credentials for authorized message multicast dispatch.
- **Browser FCM Token Generation:** Dynamically acquires unique browser FCM registration tokens upon user permission.
- **Device Registration API:** Securely registers and updates device tokens against the authenticated user account (`/api/devices/register`).
- **Device Token Persistence:** Stores token string, platform metadata, browser details, and active status in SQLite.
- **Foreground & Background Notification Handling:** Seamless visual alerts whether the app is focused or running in the background via the Service Worker.
- **Notification Deduplication:** Database-level deduplication ensures the same alert is not repeatedly dispatched.
- **Push Notification Delivery Pipeline:** Complete lifecycle from attendance evaluation, to Admin SDK handoff, to verified target device delivery.

---

## Database

- **Engine:** SQLite (file-based persistence).
- **ORM:** SQLAlchemy with declarative models.
- **Entities:**
  - `User`: Authentication credentials, profile preferences, and default threshold settings.
  - `Subject`: Course registers, total lectures, attended count, and target percentages.
  - `AttendanceRecord`: Timestamped chronological check-ins (`present` / `absent`).
  - `Notification`: Generated alert records, priority levels, read status, and message content.
  - `DeviceToken`: User-associated FCM tokens, active state flags, and registration timestamps.

---

## Security

Track75 strictly enforces foundational security practices across client and server layers:
- **Authentication:** Token-based authentication using JSON Web Tokens (JWT) with secure expiration.
- **Password Security:** Salted bcrypt password hashing.
- **Authenticated APIs:** All protected endpoints require authenticated JWT Bearer headers.
- **User-Scoped Device Tokens:** Device tokens are strictly isolated to authenticated user IDs to prevent unauthorized message spoofing.
- **Credential Protection:** Sensitive Firebase Service Account files (`firebase-adminsdk.json`) and `.env` files are fully excluded via `.gitignore`.
- **Environment-based Configuration:** All keys, secrets, and project configurations are dynamically injected via environment variables.
- **Zero-Commit Secrets:** Passwords, API keys, and private credentials are never committed to the repository.

---

## Technology Stack

### Frontend
- **Framework:** React 19, TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **PWA:** Vite PWA Plugin, Workbox Service Worker
- **Push Client:** Firebase Web SDK (v11)

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ASGI Server:** Uvicorn
- **ORM:** SQLAlchemy
- **Database:** SQLite
- **Authentication:** PyJWT, Passlib (Bcrypt)
- **Background Tasks:** APScheduler
- **Push Server:** Firebase Admin SDK

### AI & Intelligence
- **Prediction:** Algorithmic Attendance Projection Engine
- **Recommendations:** Actionable Priority & Recovery Advisory
- **Notifications:** Context-aware Notification Rule Engine

---

## Project Progress

- [x] **Phase 1** — Authentication (Registration, Login, JWT verification)
- [x] **Phase 2** — Attendance Management (Subject registers, logging, history timeline)
- [x] **Phase 3** — Analytics Engine (Trend lines, subject comparison, weekly ratio, lecture heatmap)
- [x] **Phase 4A** — AI Prediction Engine (Simulation calculator, threshold models)
- [x] **Phase 4B** — AI Recommendation Engine (Priority daily focus, recovery roadmap)
- [x] **Phase 5A** — Smart Notification Engine (Rule triggers, persistent alert records)
- [x] **Phase 5B** — PWA Foundation & Browser Notification Framework (Service worker, offline shell)
- [x] **Phase 5C** — Firebase Cloud Messaging Infrastructure & Device Registration (Token lifecycle, backend registry)
- [x] **Phase 5C.3A** — Push Notification Delivery Engine (Firebase Admin SDK multicast delivery)
- [x] **Phase 5C.3B** — AI Smart Notification Generation Engine (In-app & push notification pipeline)
- [x] **Phase 5C.3C** — Background Scheduler & Automated Delivery (APScheduler integration, 30-min cycle)

---

## Testing & Verification

The following components, workflows, and pipelines have been thoroughly tested and verified:

- **Authentication:** Registration, login, password hashing (bcrypt), and JWT token authorization verified.
- **Attendance Management:** Subject creation, editing, deletion, check-in logging, and chronological history timeline verified.
- **Analytics & Visualizations:** Cumulative attendance trend lines, subject comparison bars, 7-day lecture ratios, and 4-week lecture heatmaps verified.
- **AI Prediction Engine:** Custom upcoming lecture scenarios, expected attendance rate parameters, and status calculations verified.
- **AI Recommendation Engine:** Priority task derivation, shortage recovery step calculations, and actionable advice formatting verified.
- **Notification System:**
  - In-app notifications working with unread count tracking.
  - AI notification generation working with contextual messaging.
  - Notification persistence in SQLite and deduplication logic working.
  - Push notification delivery pipeline working.
- **Firebase Cloud Messaging (FCM):**
  - Firebase Cloud Messaging integration verified.
  - Browser notification permission workflow active and working.
  - Service Worker active and listening for background push events.
  - FCM token generation working reliably.
  - Device token registration and database synchronization working.
  - Firebase Admin SDK configured and authenticated with Google Cloud.
  - Google Cloud FCM permissions configured for message dispatch.
  - Actual browser push notification successfully tested (Final test result: `Success: 1, Failed: 0`).
- **Background Scheduler:**
  - APScheduler integrated and running in the FastAPI lifecycle.
  - Automated notification cycle configured to periodically evaluate attendance registers.
  - Default scheduler interval set to 30 minutes.
  - Scheduler runtime status verified via `/api/dev/scheduler-status` and developer diagnostics UI.
- **PWA / Service Worker:** Service worker registration, offline shell caching, and Web App Manifest verified.
- **Frontend Build Verification:** Production build (`npm run build`) verified with zero TypeScript or Vite bundling errors.
- **Backend Syntax & Runtime:** FastAPI routes, Pydantic schemas, database migrations, and Uvicorn runtime verified.

---

## Roadmap

- Final UI Polish
- Production Configuration & Environment Hardening
- Cloud Deployment & CI/CD Pipeline
- API Documentation & Integration Specifications
- Demonstration & Project Showcase Release

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feat/your-feature`
5. Open a Pull Request describing the change, motivation, and testing

---

## License

Released under the **MIT License**. See `LICENSE` for details.

---

## Author

**Abhishek**

<div align="center">

**Track Smart. Stay Eligible.**

</div>
