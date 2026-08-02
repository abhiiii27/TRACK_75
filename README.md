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

[Overview](#-overview) • [Why Track75](#-why-track75) • [Project Progress](#-project-progress) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Author](#-author)

</div>

---

## Overview

Most students only discover their attendance shortage when the detention list is published, the marks are blocked, or the professor makes the announcement in class.

**Track75** flips that timeline. It is a deterministic attendance intelligence platform that gives students continuous visibility into their eligibility, predicts where they are headed, and tells them exactly what to do this week to stay above the line.

The product is opinionated around the **75% eligibility rule** that governs most Indian university examination policies, but every threshold — including the user's personal goal — is configurable.

---

## The Problem

| Symptom | Root Cause |
| --- | --- |
| Students get detained right before exams | Attendance is reviewed at the end of the semester, not continuously |
| Students don't know how many classes they can safely miss | "Safe bunk" math is never taught and never shared |
| Students react to shortage instead of preventing it | No early warning system exists at the student level |
| Manual register tracking is error-prone | Paper registers and CR WhatsApp messages are unreliable |

---

## Why Track75

- **Predictive, not reactive.** Every calculation is forward-looking: if you attend *X* of the next *N* classes, where will you land?
- **Actionable, not just informative.** The risk score is paired with concrete next-step guidance, not a generic warning.
- **Personalized.** Each user sets their own attendance goal. The system adapts.
- **Honest math.** No hand-wavy "AI magic." The predictions are transparent, deterministic formulas the student can audit.

---

## Project Progress

- **Phase 1: Authentication** ✅ Completed
- **Phase 2: Attendance Management System** ✅ Completed
- **Phase 3: Analytics Engine** ✅ Completed
- **Phase 4A: AI Prediction Engine** ✅ Completed
- **Phase 4B: AI Recommendation Engine** ✅ Completed
- **Phase 5A: Smart Notification Engine** ✅ Completed
- **Phase 5B: PWA Foundation & Browser Notification Framework** ✅ Completed
- **Phase 5C: Firebase Cloud Messaging Infrastructure & Device Registration** ✅ Completed
- **Phase 5C.3A: Push Notification Delivery Engine** ✅ Completed

**Current Status:**  
The complete Firebase Cloud Messaging push notification delivery pipeline is now implemented. The FastAPI backend uses the Firebase Admin SDK to send real multicast push notifications to registered browser devices. The PWA registers FCM device tokens automatically on login, stores them in SQLite, and receives background push notifications via an active Service Worker. The database path is now anchored absolutely to prevent multi-DB drift.

**Next Milestones:**  
- **Phase 5C.3B:** Attendance-triggered smart push notification dispatch
- **Phase 6:** Production Deployment

---

## Features

- **JWT-based authentication** with bcrypt password hashing (register, login, profile-setup, persistent sessions)
- **Subject management (CRUD)** — create, edit, view details, delete, and persist per-subject attendance counters
- **Attendance management (CRUD)** — mark a class as Present or Absent, edit/delete past logs directly from the timeline
- **Attendance history** — reverse-chronological timeline of all logged attendance records per subject
- **Live dashboard integration** — immediate UI auto-refresh for overall attendance %, risk score, and missed classes (no page reloads)
- **Attendance calculator** — live percentage per subject and across the semester
- **Safe-bunk planner** — tells the student exactly how many classes they can safely miss without falling below target
- **Attendance risk score** — dynamically recalculates SAFE, MEDIUM, HIGH, CRITICAL states
- **AI Prediction Engine** — rule-based forecasting generating contextual insights (`GET /api/ai/predict`)
- **Attendance Forecasting** — extrapolates recent logging velocity to project final semester attendance
- **Prediction Confidence & Trend** — evaluates available historical data to assign a confidence weight and a direction trend (Improving, Declining, Stable)
- **AI Recommendation Engine** — dynamically builds task priority queues, contextual motivation, and real-time safe recovery plans (`GET /api/ai/recommendations`)
- **Smart Notification Engine** — priority-sorted dynamic alerts with intelligent lifecycle resolution and retention limits (`GET /api/notifications`)
- **Progressive Web App (PWA)** — fully installable application on mobile and desktop platforms.
- **Service Worker & Offline App Shell** — reliable offline caching, SPA routing support, and native fallback mechanisms.
- **Secure Static Asset Caching** — aggressive caching of UI components with explicit zero-caching rules for sensitive attendance data and JWTs.
- **Browser Notification Framework** — extensible local notification system and permission state management built for push readiness.
- **Firebase Cloud Messaging Infrastructure** — active FCM Service Worker registry capable of intercepting background web pushes.
- **Device Registration** — backend token sync (`POST /api/device/register`) to map active browser device tokens to user accounts for targeted notifications.
- **Install Prompt & PWA Diagnostics** — intelligent `beforeinstallprompt` interception, 7-day snooze logic, and over-the-air Service Worker update tools.
- **SQLite Persistence** — fully persistent relational data backed by SQLAlchemy
- **Mobile-first User Experience** — touch-friendly native-feeling components (bottom navigation, bottom sheets, mobile modals)
- **Light / Dark / System theme** with persisted user preference

---

## Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| **React 19** | UI framework |
| **Vite 6** | Build tool and dev server |
| **TypeScript** | Strict typing across the client |
| **Tailwind CSS 4** | Utility-first styling |
| **Lucide React** | Icon system |
| **vite-plugin-pwa** | Service Worker, Manifest, and PWA generation |
| **Workbox** | Production cache strategy and offline routing |
| **Firebase Web SDK** | Cloud Messaging token generation and client library |

### Backend

| Technology | Purpose |
| --- | --- |
| **FastAPI** | High-performance Python web framework |
| **SQLAlchemy** | ORM for relational database interactions |
| **PyJWT** | Stateless JWT authentication |
| **bcrypt** | Secure password hashing |
| **Firebase Admin SDK** | Secure server-to-device push notification delivery |

### Data

| Technology | Purpose |
| --- | --- |
| **SQLite** | Persistent file-based relational database |

---

## System Architecture

```text
┌──────────────────────────┐
│  Browser (React + Vite)  │
│  - Mobile-First UI       │
│  - State Management      │
│  - FCM Service Worker    │
└────────────┬─────────────┘
             │  REST (/api/*) + Bearer JWT
             ▼
┌──────────────────────────┐
│  FastAPI (Python)        │
│  - Auth middleware       │
│  - Subject endpoints     │
│  - Attendance CRUD       │
│  - Device Registration   │
└────────────┬─────────────┘
             │  SQLAlchemy ORM
             ▼
┌──────────────────────────┐
│  SQLite Database         │
│  (track75.db)            │
│  - Users, Subjects,      │
│  - DeviceTokens          │
└──────────────────────────┘
```

The system uses a completely decoupled frontend and backend. The React app runs via Vite, and communicates with the FastAPI server which acts as the sole source of truth connecting to the SQLite database.

---

## Folder Structure

```text
TRACK_75/
├── src/                      # Frontend Source (React/Vite)
│   ├── App.tsx               # Top-level app shell, auth gate, routing
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── firebase/             # FCM Configuration and utilities
│   ├── hooks/useFCM.ts       # Cloud messaging hook
│   └── components/
│       ├── AuthView.tsx      # Login, register, profile-setup
│       ├── DashboardView.tsx # Home dashboard
│       ├── SettingsView.tsx  # Device notification toggles
│       └── ...
│
├── public/
│   └── firebase-cloud-messaging-sw.js # Active background push worker
│
├── fastapi/                  # Backend Source (Python/FastAPI)
│   ├── main.py               # FastAPI application & endpoints
│   ├── models.py             # SQLAlchemy models (User, Subject, DeviceToken)
│   ├── schemas.py            # Pydantic validation schemas
│   ├── database.py           # SQLite connection & session
│   ├── services/             # External Integrations (Firebase Admin)
│   └── requirements.txt      # Python dependencies
│
├── vite.config.ts            # Vite proxy & build config
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10

### Installation

1. Clone the repository
2. Install frontend dependencies:
```bash
npm install
```
3. Install backend dependencies:
```bash
cd fastapi
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the root directory for frontend Vite variables:
```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_domain"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_VAPID_KEY="your_vapid_key"
```

Create a `.env` file in the `fastapi/` directory for backend secrets:

```env
JWT_SECRET=your_super_secret_key_here
```

### Run the App

Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd fastapi
uvicorn main:app --port 8080 --reload
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

The frontend will start on **http://localhost:5173** and automatically proxy API requests to the FastAPI backend on port **8080**.

---

## API Reference

All endpoints require a `Bearer <token>` header except for `/api/auth/register` and `/api/auth/login`.

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a new account. Returns JWT. |
| `POST` | `/api/auth/login` | Sign in. Returns JWT. |
| `GET`  | `/api/auth/me` | Current user profile. |
| `POST` | `/api/auth/profile-setup` | Complete college / department / semester / goal. |

### Subjects

| Method | Path | Description |
| --- | --- | --- |
| `GET`  | `/api/subjects` | List user's subjects. |
| `POST` | `/api/subjects` | Create a new subject. |
| `PUT`  | `/api/subjects/{id}` | Edit an existing subject. |
| `DELETE`| `/api/subjects/{id}` | Delete a subject and cascade its attendance records. |

### Attendance

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/attendance` | Log a present / absent check-in for a subject. |
| `PUT`  | `/api/attendance/{id}` | Edit a specific attendance record (updates subject counts). |
| `DELETE`| `/api/attendance/{id}`| Delete a specific attendance record (rewinds subject counts). |
| `GET`  | `/api/attendance/history` | Retrieve chronological timeline logs for all subjects. |

### Dashboard & Analytics

| Method | Path | Description |
| --- | --- | --- |
| `GET`  | `/api/dashboard` | Live aggregate stats (overall percentage, missed classes, subjects safely on track). |
| `GET`  | `/api/attendance/risk` | Current composite risk score, risk level, and reasons. |
| `GET`  | `/api/stats` | Aggregate semester stats (legacy format compatibility). |
| `GET`  | `/api/analytics` | Comprehensive weekly/monthly metrics, heatmaps, and chart datasets. |
| `GET`  | `/api/ai/predict` | AI Attendance Prediction Engine for forecasting end-of-semester trends. |
| `GET`  | `/api/ai/recommendations` | AI Recommendation Engine generating priority tasks and recovery plans. |

### Notifications

| Method | Path | Description |
| --- | --- | --- |
| `GET`  | `/api/notifications` | List all smart notifications for the current user. |
| `PUT`  | `/api/notifications/{id}/read` | Mark a notification as read. |
| `PUT`  | `/api/notifications/{id}/resolve` | Mark a notification as resolved. |
| `DELETE` | `/api/notifications/{id}` | Delete a notification. |

### Device & Push Notifications

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/device/register` | Register a browser FCM device token for push delivery. |
| `PUT`  | `/api/device/update` | Update device token metadata. |
| `DELETE` | `/api/device/remove` | Deactivate and remove a device token. |
| `POST` | `/api/notifications/test` | Send a Firebase multicast test push to all active devices. |

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

Built as a focused effort to give students the same visibility into their attendance that institutions already have — only earlier, when it actually matters.

<div align="center">

**Track Smart. Stay Eligible.**

</div>
