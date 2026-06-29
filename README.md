<div align="center">

# Track75

### Track Smart. Stay Eligible.

A full-stack attendance intelligence platform that helps college students track, predict, and plan their attendance before the detention list does.

<br />

![Status](https://img.shields.io/badge/status-active%20development-6366f1?style=for-the-badge)
![Frontend](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Server](https://img.shields.io/badge/Node.js-Express-3c873a?style=for-the-badge&logo=node.js&logoColor=white)
![Styling](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Auth](https://img.shields.io/badge/JWT-secured-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Charts](https://img.shields.io/badge/Recharts-3.x-ff7300?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)

<br />

[Overview](#-overview) • [Why Track75](#-why-track75) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Roadmap](#-roadmap) • [Author](#-author)

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

## Features

### Current (Implemented)

- **JWT-based authentication** with bcrypt password hashing (register, login, profile-setup, persistent sessions)
- **Subject management** — create, view, and persist per-subject attendance counters
- **One-tap attendance logging** — mark a class as Present or Absent directly from the dashboard
- **Attendance calculator** — live percentage per subject and across the semester
- **Attendance predictor** — model *N* upcoming classes at *X%* attendance rate and see the projected result
- **Safe-bunk planner** — tells the student exactly how many classes they can safely miss without falling below target
- **Attendance risk score** — a composite 0–100 score bucketed into `SAFE`, `MEDIUM`, `HIGH`, `CRITICAL` with explanatory reasons
- **Analytics dashboard** — trend line, subject comparison bar chart, weekly ratio, monthly trajectory, and a 4-week attendance heatmap
- **Smart insights** — context-aware recommendations rendered in the dashboard and analytics view based on current data
- **Light / Dark / System theme** with persisted user preference
- **Responsive layout** — sidebar on desktop, bottom navigation on mobile, header search and notifications tray

### Planned (Roadmap)

- AI-powered natural-language advisor (subject to model availability — see [Roadmap](#-roadmap))
- Weekly progress reports and email digests
- Push notifications when risk score crosses a threshold
- Progressive Web App (PWA) support
- Native Android client
- Timetable integration for automatic class reminders
- PostgreSQL persistence and multi-device sync

---

## Screenshots

> Add screenshots of the application here. Recommended shots:
> 1. Dashboard with risk score and live stats
> 2. Predictor screen with a scenario result
> 3. Analytics view with charts
> 4. Mobile bottom-nav layout

```
docs/screenshots/
├── dashboard.png
├── predictor.png
├── analytics.png
└── mobile.png
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| **React 19** | UI framework |
| **Vite 6** | Build tool and dev server |
| **TypeScript** | Strict typing across the client |
| **Tailwind CSS 4** | Utility-first styling via `@tailwindcss/vite` |
| **Recharts** | Charts and data visualization |
| **Framer Motion (`motion`)** | Page transitions and micro-interactions |
| **Lucide React** | Icon system |

### Backend

| Technology | Purpose |
| --- | --- |
| **Node.js + Express 4** | HTTP server and REST API |
| **TypeScript (`tsx`)** | Type-safe server runtime in development |
| **JWT (`jsonwebtoken`)** | Stateless authentication |
| **bcryptjs** | Password hashing |

### Data

> The current build uses an **in-memory store** seeded with default subjects. There is no database yet — see the [Roadmap](#-roadmap) for the PostgreSQL plan.

### Tooling

| Tool | Purpose |
| --- | --- |
| **esbuild** | Server bundling for production |
| **Vite middleware mode** | Dev server integration with Express |

---

## System Architecture

```
┌──────────────────────────┐
│  Browser (React + Vite)  │
│  - Pages & components    │
│  - Recharts visualizer   │
│  - Theme context         │
└────────────┬─────────────┘
             │  REST (/api/*) + Bearer JWT
             ▼
┌──────────────────────────┐
│  Express server.ts       │
│  - Auth middleware       │
│  - Subject endpoints     │
│  - Attendance log        │
│  - Predictor             │
│  - Stats & risk engine   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  In-memory data store    │
│  (db_users, db_subjects) │
└──────────────────────────┘
```

The dev server uses Vite's middleware mode inside Express, so the same Node process serves the API and the React app. In production, Express serves the prebuilt `dist/` static bundle.

---

## Folder Structure

```
TRACK_75/
├── server.ts                 # Express API + Vite middleware
├── vite.config.ts            # Vite + Tailwind plugin config
├── tsconfig.json             # TypeScript config
├── package.json
├── index.html                # Vite entry
├── .env.example              # Environment variable template
│
├── src/
│   ├── main.tsx              # React root
│   ├── App.tsx               # Top-level app shell, auth gate, routing
│   ├── ThemeContext.tsx      # Light/Dark/System theme provider
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── index.css             # Tailwind entry
│   └── components/
│       ├── AuthView.tsx        # Splash, login, register, profile-setup
│       ├── DashboardView.tsx   # Home dashboard
│       ├── SubjectsView.tsx    # Full subject list
│       ├── SubjectCard.tsx     # Individual subject tile
│       ├── PredictorView.tsx   # Predictor page shell
│       ├── PredictorForm.tsx   # Predictor input + result renderer
│       ├── AnalyticsView.tsx   # Charts + heatmap
│       ├── ProfileView.tsx     # User profile + goal
│       ├── SettingsView.tsx    # Theme, threshold, reset
│       ├── DashboardStats.tsx  # Stat tile row
│       ├── AttendanceRiskCard.tsx
│       ├── AddSubjectModal.tsx
│       ├── Sidebar.tsx
│       ├── TopHeader.tsx
│       └── BottomNav.tsx       # Mobile navigation
│
├── fastapi/                  # Standalone Python reference backend
│   ├── main.py               # FastAPI mirror of the Express API
│   └── requirements.txt
│
└── assets/
    └── .aistudio/
```

> The `fastapi/` directory is a **reference implementation** of the same endpoints in Python/FastAPI. It is not wired to the React frontend; the live app uses `server.ts`.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (bundled with Node)

### Installation

```bash
git clone https://github.com/<your-username>/TRACK_75.git
cd TRACK_75
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
JWT_SECRET=replace-with-a-long-random-string
```

> `JWT_SECRET` is required. If unset, the server falls back to a development-only key — **do not ship this to production**.

### Run the App

```bash
npm run dev
```

The server starts on **http://localhost:3000** and serves both the API and the React dev client.

### Build for Production

```bash
npm run build      # builds the React bundle AND the server bundle
npm run start      # serves the compiled build via Express
```

### Lint / Type-check

```bash
npm run lint       # tsc --noEmit
```

---

## API Reference

All endpoints below are mounted under `server.ts`. Authenticated routes require a `Bearer <token>` header.

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | Create a new account. Returns JWT. |
| `POST` | `/api/auth/login` | — | Sign in. Returns JWT. |
| `GET`  | `/api/auth/me` | ✅ | Current user profile. |
| `POST` | `/api/auth/profile-setup` | ✅ | Complete college / department / semester / goal. |

### Subjects

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET`  | `/api/subjects` | ✅ | List user's subjects. |
| `POST` | `/api/subjects` | ✅ | Create a new subject. |

### Attendance

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/attendance` | ✅ | Log a present / absent check-in for a subject. |
| `POST` | `/api/reset` | ✅ | Reset all subject counters to seed values. |

### Analytics & Prediction

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET`  | `/api/stats` | ✅ | Aggregate semester stats. |
| `POST` | `/api/predict` | ✅ | Run a prediction scenario for a subject. |
| `GET`  | `/api/attendance/risk` | ✅ | Current composite risk score, level, and reasons. |

### Prediction Request Shape

```jsonc
POST /api/predict
{
  "subjectId": "sub_1",
  "upcomingClasses": 10,           // 1–50
  "expectedAttendanceRate": 80     // 0–100
}
```

### Prediction Response Shape

```jsonc
{
  "subjectId": "sub_1",
  "currentPercentage": 75.0,
  "predictedPercentage": 77.3,
  "targetPercentage": 75,
  "requiredConsecutiveClasses": 0,
  "safeToMissClasses": 2,
  "status": "safe",                 // safe | at_risk | critical
  "message": "You are on track! ..."
}
```

### Risk Response Shape

```jsonc
{
  "riskScore": 45,                  // 0–100
  "riskLevel": "MEDIUM",            // SAFE | MEDIUM | HIGH | CRITICAL
  "overallAttendance": 73.4,
  "remainingSafeBunks": 1,
  "reasons": ["Overall attendance below target", "..."]
}
```

---

## AI Features

Track75's intelligence layer is currently **deterministic**, not generative:

- The **predictor** uses closed-form math over `attended`, `total`, `upcoming`, and `expectedAttendanceRate`.
- The **risk score** is a weighted sum of normalized signals (subjects below target, overall percentage, consecutive absences, safe-bunk runway).
- The **smart insights** are rule-based, driven by the live data.

The `@google/genai` package is included as a dependency for a planned natural-language advisor (see [Roadmap](#-roadmap)). It is not yet integrated into any UI flow.

---

## Project Workflow

```text
Register / Login
      │
      ▼
Profile setup (college, department, semester, attendance goal)
      │
      ▼
Add subjects (or accept seeded defaults)
      │
      ▼
Log Present / Absent for each class
      │
      ▼
View live Dashboard stats, risk card, and insights
      │
      ├──► Predictor: model upcoming classes and see projected %
      ├──► Analytics: trend, comparison, heatmap
      └──► Profile / Settings: adjust goal, switch theme, reset data
```

---

## Roadmap

- [ ] **PostgreSQL persistence** with SQLAlchemy-equivalent migrations (replacing the in-memory store)
- [ ] **AI Attendance Advisor** — natural-language Q&A powered by the Gemini API
- [ ] **PWA support** — installable app with offline cache
- [ ] **Push notifications** when risk score crosses a threshold
- [ ] **Weekly email reports** summarizing each user's standing
- [ ] **Timetable integration** for automatic class reminders
- [ ] **Native Android client**
- [ ] **Multi-device sync**

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feat/your-feature`
5. Open a Pull Request describing the change, motivation, and testing

Please run `npm run lint` before opening a PR.

---

## License

Released under the **MIT License**. See `LICENSE` for details.

---

## Author

**Abhishek**

Built as a focused effort to give students the same visibility into their attendance that institutions already have — only earlier, when it actually matters.

---

## Acknowledgements

- [Recharts](https://recharts.org) — declarative React charts
- [Lucide](https://lucide.dev) — open-source icon set
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [Vite](https://vitejs.dev) — frontend tooling
- [Express](https://expressjs.com) — HTTP server

<div align="center">

**Track Smart. Stay Eligible.**

</div>