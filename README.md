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

[Overview](#project-overview) • [Core Features](#core-features) • [AI Architecture](#ai-architecture) • [Notification System](#notification-system) • [Project Status](#project-status) • [Tech Stack](#tech-stack) • [API Reference](#api-reference)

</div>

---

## Project Overview

Track75 is an attendance tracking and intelligent student assistance application designed to help students monitor attendance, understand attendance risk, receive rule-based AI recommendations, and receive smart notifications.

Most students only discover their attendance shortage when the detention list is published. Track75 provides an early warning system that evaluates historical logs and current targets to provide deterministic next steps.

---

## Core Features

- **Authentication:** JWT-based user authentication (register, login, profile-setup).
- **Subject Management:** Create, edit, and delete subjects.
- **Attendance Tracking:** Mark Present/Absent and edit past records directly in a timeline.
- **Attendance History:** Reverse-chronological timeline of all logged attendance records.
- **Dashboard Analytics:** Live aggregate stats (overall percentage, missed classes, subjects safely on track).
- **Attendance Goal:** User-defined minimum target percentage.
- **Attendance Risk Evaluation:** Dynamically evaluates risk (SAFE, MEDIUM, HIGH, CRITICAL).
- **AI Prediction:** Rule-based algorithmic forecasting for end-of-semester trends based on recent logging velocity.
- **AI Recommendations:** Generates priority tasks and recovery plans using rule-based algorithms.
- **Smart Notifications:** Generates contextual alerts stored in the database.
- **PWA Support:** Service worker with offline app shell and installable capabilities.
- **Firebase Cloud Messaging Infrastructure:** Handles token lifecycle and background web pushes.
- **Device Registration:** Backend tracks active device tokens mapped to user accounts.
- **Background Notification Scheduler:** Automated trigger jobs using APScheduler.
- **Developer Tools:** In-app diagnostics for scheduler status, token status, and test push delivery.

---

## AI Architecture

The intelligent notification dispatch relies on a sequence of internal rule-based algorithms:

**Attendance Data**  
→ **Attendance/Risk Analysis:** Evaluates required classes against user goal.  
→ **NotificationRuleEngine:** Identifies risk boundaries and triggers logic.  
→ **AINotificationService:** Converts triggers into actionable string messages and recovery task texts.  
→ **NotificationService:** Upserts notifications into the SQLite database and handles deduplication.  
→ **Firebase Delivery:** Dispatches the message via Firebase Admin SDK.

*Note: The "AI" features use deterministic rule-based algorithms for forecasting, trend analysis, and action recommendations, not generative language models.*

---

## Notification System

### Working
- Browser notification permission prompt and management.
- FCM token generation using Firebase Web SDK.
- Device registration and device token persistence in SQLite.
- Smart Notification generation and deduplication in the database.
- Foreground and background push message handling (Service Worker).
- Notification click interception.
- Background scheduler orchestration.
- Firebase Admin SDK configuration and initialization.

### Current Limitation
Firebase Cloud Messaging delivery is implemented and reaches the Firebase Admin SDK, but final push delivery currently requires the appropriate Google Cloud IAM permission for the Firebase service account. 

Specifically, the `cloudmessaging.messages.create` IAM permission is missing for the active credentials, resulting in a `PERMISSION_DENIED` response from the Firebase HTTP v1 API.

---

## Scheduler

The backend integrates an automated task runner:
- **Engine:** APScheduler integrated into FastAPI lifecycle events.
- **Frequency:** Configurable interval (default: 30 minutes).
- **Timezone:** Asia/Kolkata timezone standard.
- **Diagnostics:** Custom `/api/dev/scheduler-status` API endpoint.
- **UI:** Developer Tools panel reflecting real-time scheduler state and device registration.

---

## Database

- **Engine:** SQLite (file-based).
- **ORM:** SQLAlchemy.
- **Entities:** User profiles, Subjects, Attendance logs, Notifications, Device tokens.

---

## Security

- **Authentication:** Bearer tokens via JWT.
- **Password Security:** Bcrypt hashing.
- **API Security:** All protected endpoints require authenticated JWT injection.
- **Token Segregation:** Device tokens are strictly scoped to authenticated user IDs.
- **Credential Protection:** Sensitive Firebase Service Account files (`firebase-adminsdk.json`) and `.env` files are fully excluded via `.gitignore`. No private keys or secrets are committed to the repository.

---

## Tech Stack

### Frontend
- **React** (TypeScript)
- **Vite**
- **Tailwind CSS**
- **Firebase Web SDK**
- **vite-plugin-pwa** (Service Worker)

### Backend
- **Python**
- **FastAPI**
- **SQLAlchemy**
- **SQLite**
- **PyJWT & passlib (bcrypt)**
- **Firebase Admin SDK**
- **APScheduler**

---

## API Reference

### Authentication
- `POST /api/auth/register` - Create account.
- `POST /api/auth/login` - Sign in.
- `GET /api/auth/me` - Profile lookup.

### Attendance & Subjects
- `GET /api/subjects` - List subjects.
- `POST /api/attendance` - Log attendance.
- `GET /api/attendance/history` - Timeline retrieval.
- `GET /api/attendance/risk` - Calculate current risk thresholds.

### AI & Analytics
- `GET /api/ai/predict` - Forecasting algorithm results.
- `GET /api/ai/recommendations` - Priority recovery tasks.
- `GET /api/analytics` - Aggregate datasets.

### Notifications & Devices
- `GET /api/notifications` - Retrieve persistent notifications.
- `POST /api/device/register` - Register FCM token.
- `DELETE /api/device/remove` - Deactivate device token.
- `POST /api/notifications/test` - Trigger a test push notification.
- `GET /api/dev/scheduler-status` - Query background task status.

---

## Project Status

### Completed Phases
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

### Current Blocker
Firebase Admin SDK is configured and the backend can reach Firebase, but Firebase message delivery is currently blocked by the Google Cloud IAM permission:

`cloudmessaging.messages.create`

The required permission must be granted to the Firebase Admin service account before final push-delivery verification can succeed.

---

## Testing Status

The following components have been successfully verified:
- Login and Authentication
- Dashboard rendering and state
- Subject creation and Attendance logging
- AI algorithms and analytics endpoints
- Scheduler startup and execution
- Service Worker registration
- FCM permission prompting
- FCM token generation
- Device registration and SQLite persistence
- Firebase Admin SDK authentication initialization
- Frontend production build (`npm run build`)
- Backend Python syntax validation

**Actual Push Delivery:** `Pending final IAM permission verification`

---

## Roadmap

### Immediate Next Step
- Fix Google Cloud IAM permission
- Re-run FCM test
- Verify actual browser push
- Verify background push
- Verify notification click behavior

### Phase 6
- Final QA
- Production configuration
- Deployment
- Final documentation
- Demo preparation
- GitHub/portfolio polish

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
