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

[Overview](#project-overview) • [Core Features](#core-features) • [AI Architecture](#ai-notification-architecture) • [Background Scheduler](#background-scheduler) • [Firebase Integration](#firebase--fcm) • [Project Progress](#project-progress) • [Tech Stack](#technology-stack) 

</div>

---

## Project Overview

Track75 is an intelligent attendance management and student assistance platform designed to help students monitor attendance, understand attendance risk, receive contextual AI recommendations, and receive smart notifications.

Most students only discover their attendance shortage when the detention list is published. Track75 provides an early warning system that evaluates historical logs and current targets to provide deterministic next steps.

---

## Core Features

- **JWT Authentication:** Secure user authentication (register, login, profile-setup).
- **Subject Management:** Create, edit, and delete subjects with real-time UI updates.
- **Attendance Tracking:** Mark Present/Absent and edit past records directly in a chronological timeline.
- **Attendance History:** Reverse-chronological timeline of all logged attendance records.
- **Dashboard Analytics:** Live aggregate stats including overall percentage, missed classes, and subjects safely on track.
- **Attendance Goal Tracking:** User-defined minimum target percentage adaptation.
- **Attendance Risk Analysis:** Dynamically evaluates risk per subject (SAFE, MEDIUM, HIGH, CRITICAL).
- **AI Prediction Engine:** Algorithmic forecasting for end-of-semester trends based on recent logging velocity.
- **AI Recommendation Engine:** Generates priority tasks and recovery plans.
- **Smart Notification Engine:** Generates contextual alerts stored persistently in the database.
- **PWA Support:** Service worker with offline app shell and installable web capabilities.
- **Service Worker:** Efficient static asset caching and background process execution.
- **Firebase Cloud Messaging Integration:** Active FCM service worker registry for background web pushes.
- **FCM Token Generation:** Negotiation and generation of unique browser device tokens.
- **Device Registration:** Secure backend token synchronization mapping active devices to user accounts.
- **Device Token Management:** Intelligent activation and deactivation of stale tokens.
- **Background Notification Scheduler:** Automated background jobs triggering notification generation and delivery.
- **Developer Tools:** In-app diagnostics for scheduler monitoring and token status verification.

---

## AI Notification Architecture

The intelligent notification dispatch relies on a sequence of decoupled internal engines that isolate attendance analysis, notification generation, persistence, and delivery orchestration:

**Attendance Data**  
→ **NotificationRuleEngine:** Evaluates required classes and identifies risk boundaries to trigger logic.  
→ **AINotificationService:** Converts system triggers into actionable string messages and recovery task texts.  
→ **NotificationService:** Upserts generated notifications into the SQLite database and handles cross-device deduplication.  
→ **Firebase Service:** Dispatches the securely constructed message payloads to the device via Firebase Admin SDK.

---

## Background Scheduler

The backend integrates an automated task runner responsible for evaluating attendance records and orchestrating the delivery pipeline:
- **Engine:** APScheduler integrated seamlessly into FastAPI startup and shutdown lifecycle events.
- **Configurable Interval:** Easily adjustable notification dispatch frequency.
- **Default Interval:** 30 minutes.
- **Timezone:** Enforces strict Asia/Kolkata timezone standard.
- **API Integration:** Dedicated `/api/dev/scheduler-status` endpoint for pipeline monitoring.
- **Developer Tools:** UI panel reflecting real-time scheduler state and active background jobs.

---

## Firebase / FCM

The platform is integrated with Firebase Cloud Messaging to ensure reliable push message generation and dispatch:
- **Firebase Web SDK:** Powers the frontend client to negotiate permissions and receive foreground payloads.
- **Firebase Admin SDK:** Powers the backend to authenticate with Google Cloud securely and construct dispatch messages.
- **Browser FCM Token Generation:** Dynamic token generation upon user opt-in.
- **Device Registration:** Secure token payload transmission to the FastAPI backend.
- **Device Token Persistence:** Token metadata, platform, and browser data stored persistently.
- **Foreground & Background Notification Handling:** Seamless visual alerts whether the app is focused or closed.
- **Notification Deduplication:** Database-level de-duping ensures the same alert is not blasted repeatedly.
- **Push Notification Delivery Pipeline:** Complete lifecycle from generation, to Admin SDK handoff, to target device delivery.

---

## Database

- **Engine:** SQLite (file-based persistence).
- **ORM:** SQLAlchemy.
- **Entities:** Robust schema containing User profiles, Subjects, Attendance logs, Notifications, and Device tokens.

---

## Security

Track75 strictly enforces foundational security practices:
- **Authentication:** Bearer tokens via JWT.
- **Password Security:** Bcrypt hashing.
- **Authenticated APIs:** All protected endpoints require authenticated JWT injection.
- **User-Scoped Device Tokens:** Device tokens are strictly isolated to authenticated user IDs to prevent unauthorized message spoofing.
- **Credential Protection:** Sensitive Firebase Service Account files (`firebase-adminsdk.json`) and `.env` files are fully excluded via `.gitignore`.
- **Environment-based Configuration:** All keys, secrets, and project configurations are dynamically injected via environment variables.
- **Zero-Commit Secrets:** Passwords, API keys, and private credentials are never committed to the repository.

---

## Technology Stack

### Frontend
React, TypeScript, Vite, Tailwind CSS, PWA/Service Worker, Firebase Web SDK

### Backend
Python, FastAPI, SQLAlchemy, SQLite, JWT, Firebase Admin SDK, APScheduler

### AI
AI Prediction Engine, AI Recommendation Engine, Smart Notification Engine

---

## Project Progress

- **Phase 1** — Authentication
- **Phase 2** — Attendance Management
- **Phase 3** — Analytics Engine
- **Phase 4A** — AI Prediction Engine
- **Phase 4B** — AI Recommendation Engine
- **Phase 5A** — Smart Notification Engine
- **Phase 5B** — PWA Foundation & Browser Notification Framework
- **Phase 5C** — Firebase Cloud Messaging Infrastructure & Device Registration
- **Phase 5C.3A** — Push Notification Delivery Engine
- **Phase 5C.3B** — AI Smart Notification Generation Engine
- **Phase 5C.3C** — Background Scheduler & Automated Delivery

---

## Testing

The following components and workflows have been successfully tested:
- Authentication testing
- Attendance workflow testing
- Dashboard testing
- AI feature testing
- Scheduler status testing
- Service Worker testing
- FCM permission testing
- FCM token generation testing
- Device registration testing
- Database persistence testing
- Frontend build verification
- Backend syntax verification

---

## Roadmap

- Final QA
- Production configuration
- Deployment
- Documentation refinement
- Demo preparation
- Portfolio/GitHub presentation

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
