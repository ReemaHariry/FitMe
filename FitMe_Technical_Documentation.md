# FitMe — AI Fitness Trainer: Technical Documentation

> A complete engineering reference for the FitMe project.  
> Covers architecture, frontend, backend, AI pipeline, API flows, and key functions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Folder & File Reference](#3-folder--file-reference)
4. [Core Architecture](#4-core-architecture)
5. [Frontend Logic](#5-frontend-logic)
6. [Backend Logic](#6-backend-logic)
7. [API Flow](#7-api-flow)
8. [Data Flow Diagram](#8-data-flow-diagram)
9. [Key Functions](#9-key-functions)
10. [End-to-End Scenarios](#10-end-to-end-scenarios)
11. [How Everything Connects](#11-how-everything-connects)
12. [Important Notes](#12-important-notes)

---

## 1. Project Overview

**FitMe** is an AI-powered fitness trainer web application. Users can:

- **Register / Log in** and complete an onboarding profile.
- **Upload a recorded workout video** → the system auto-detects the exercise type and runs AI pose analysis.
- **Start a live training session** → the webcam streams frames in real-time over a WebSocket → the AI analyses each frame instantly.
- **View detailed reports** — form score, mistake list, injury risk warnings, and correction tips.
- **Track statistics** — total sessions, average form score, best exercise.

**Supported exercises:** Squat · Push-Up · Sit-Up

---

## 2. Repository Structure

```
codes/
├── Ui/                   ← React + TypeScript frontend (Vite)
├── backend/              ← Python FastAPI backend (AI + API server)
├── Ai_fit final/         ← Research / experimental AI notebooks
└── README.md
```

---

## 3. Folder & File Reference

### 3.1 `Ui/` — Frontend

```
Ui/
├── index.html             ← HTML entry point (mounts <div id="root">)
├── vite.config.ts         ← Vite dev server configuration
├── tailwind.config.js     ← Tailwind CSS configuration
├── package.json           ← Node dependencies and scripts
├── .env                   ← VITE_API_URL=http://localhost:8000
└── src/
    ├── main.tsx           ← React entry: mounts <App> inside <BrowserRouter>
    ├── App.tsx            ← Root component: routing + auth guard
    ├── index.css          ← Global CSS & Tailwind directives
    ├── vite-env.d.ts      ← TypeScript type declarations for import.meta.env
    │
    ├── app/
    │   ├── store.ts       ← Zustand global state (auth + workout)
    │   ├── theme.ts       ← Zustand dark/light theme state
    │   └── i18n.ts        ← Internationalisation strings
    │
    ├── api/               ← HTTP API layer (Axios)
    │   ├── client.ts      ← Axios instance + interceptors (auth token, 401 redirect)
    │   ├── auth.ts        ← authApi: login / register / logout / getCurrentUser
    │   ├── videos.ts      ← videosApi: upload video / get session status
    │   ├── reports.ts     ← reportsApi: getAll / getOne / getStats / seedTestData
    │   ├── sessions.ts    ← sessionsApi: start live session / end live session
    │   ├── users.ts       ← usersApi: get/update profile
    │   └── index.ts       ← Re-exports all api modules
    │
    ├── pages/             ← Full-page route components
    │   ├── auth/          ← Login.tsx, Register.tsx
    │   ├── onboarding/    ← Onboarding.tsx (multi-step profile setup)
    │   ├── dashboard/     ← Dashboard.tsx (home after login)
    │   ├── workout/       ← Workouts.tsx, WorkoutDetail.tsx
    │   ├── live-training/ ← LiveTraining.tsx (WebSocket + webcam)
    │   ├── VideoUpload.tsx← Upload video & watch analysis progress
    │   ├── reports/       ← Reports.tsx (list), ReportDetail.tsx (detail)
    │   ├── profile/       ← Profile.tsx
    │   └── settings/      ← Settings.tsx
    │
    ├── components/        ← Reusable UI components
    │   ├── layout/        ← Layout.tsx (sidebar + header shell)
    │   ├── ui/            ← Primitives: Button, Card, Input, Badge …
    │   ├── cards/         ← Stat cards, session cards
    │   ├── charts/        ← Form score charts
    │   ├── live-training/ ← Webcam feed, feedback overlay components
    │   ├── upload/        ← VideoUploadZone, UploadProgress, AnalysisStatus
    │   ├── modals/        ← Dialog components
    │   └── workouts/      ← Workout list items
    │
    ├── hooks/             ← Custom React hooks
    ├── services/          ← WebSocket service (live training)
    ├── types/             ← Shared TypeScript interfaces
    ├── utils/             ← Helper functions
    ├── lib/               ← Utility libs (e.g. cn() className helper)
    └── data/              ← Static mock/seed data
```

---

### 3.2 `backend/` — Backend

```
backend/
├── .env                         ← SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.
├── requirements.txt             ← Python dependencies
├── start_server.bat / .sh       ← Helper scripts to start uvicorn
├── test_model_load.py           ← Standalone script to test model loading
├── trained_pose_model/
│   ├── best_model.keras         ← Trained LSTM model file
│   └── label_encoder.npy        ← Class labels array (squat, push_up, sit_up)
└── app/
    ├── __init__.py
    ├── main.py                  ← FastAPI app factory + startup + CORS + router registration
    ├── config.py                ← Settings class (pydantic-settings reads .env)
    │
    ├── routes/                  ← HTTP route handlers
    │   ├── auth.py              ← POST /auth/register, /auth/login, /auth/logout, GET /auth/me
    │   ├── users.py             ← GET/PUT /users/profile, GET /users/stats
    │   ├── videos.py            ← POST /videos/upload, GET /videos/session/{id}/status
    │   ├── sessions.py          ← POST /sessions/start, POST /sessions/{id}/end
    │   └── reports.py           ← GET /reports, GET /reports/{id}, GET /reports/stats
    │
    ├── services/                ← Business logic services
    │   ├── supabase_service.py  ← Supabase client + all DB operations (profiles, sessions, reports)
    │   ├── video_service.py     ← Full video analysis pipeline (OpenCV + MediaPipe + Keras)
    │   └── session_service.py   ← In-memory live session registry (dict of active sessions)
    │
    ├── ai/                      ← AI/ML helpers
    │   ├── pose_utils.py        ← extract_pose_features(), calculate_form_score()
    │   └── form_checks.py       ← check_pushup_form(), check_squat_form(), check_situp_form()
    │
    ├── reports/                 ← Report generation
    │   ├── session_tracker.py   ← SessionTracker dataclass: records mistakes during a session
    │   ├── mistake_classifier.py← MistakeClassifier: maps raw feedback → typed mistake + tip
    │   └── report_generator.py  ← ReportGenerator: builds the final structured report JSON
    │
    └── websockets/
        └── live_handler.py      ← WebSocket handler for real-time live sessions
```

---

### 3.3 `Ai_fit final/` — Research Module

Contains experimental notebooks and scripts used during model training.  
Not part of the production server. The trained model output (`best_model.keras`, `label_encoder.npy`) is copied into `backend/trained_pose_model/`.

---

## 4. Core Architecture

### Architecture Style

**3-Tier Client-Server with AI Pipeline**

```
┌──────────────────────────────────────────────┐
│  Tier 1 — Frontend (React / TypeScript)      │
│  Vite dev server · Tailwind · Zustand        │
└──────────────────────────┬───────────────────┘
              REST / WebSocket
┌──────────────────────────▼───────────────────┐
│  Tier 2 — Backend (Python FastAPI)           │
│  Routes → Services → AI Pipeline             │
│  Uvicorn ASGI server                         │
└──────────────────────────┬───────────────────┘
              Supabase SDK / PostgreSQL
┌──────────────────────────▼───────────────────┐
│  Tier 3 — Database (Supabase / PostgreSQL)   │
│  Tables: profiles, exercise_sessions, reports │
│  Storage bucket: workout-videos (private)     │
└──────────────────────────────────────────────┘
```

### Separation of Concerns

| Layer | Where | What it owns |
|---|---|---|
| **Routing** | `routes/*.py` | HTTP path, request validation, response schema |
| **Business logic** | `services/supabase_service.py`, `services/video_service.py` | DB queries, AI orchestration |
| **AI inference** | `ai/pose_utils.py`, `ai/form_checks.py`, `websockets/live_handler.py` | Pose detection, form checking, predictions |
| **Report generation** | `reports/report_generator.py`, `reports/session_tracker.py` | Data aggregation, scoring, formatting |
| **State** (frontend) | `app/store.ts` | Auth state, user object |
| **API calls** (frontend) | `api/*.ts` | HTTP requests, response types |

### Where Business Logic Lives

- **Authentication logic** → `routes/auth.py` + `services/supabase_service.py`
- **Video analysis** → `services/video_service.py` (the biggest business function)
- **Live session logic** → `websockets/live_handler.py` + `services/session_service.py`
- **Report generation** → `reports/report_generator.py`

### State Management

- **Backend:** The AI model is loaded once on startup into `app.state.model`. Live sessions are stored in an in-memory Python dict (`session_service.py`).
- **Frontend:** Zustand stores manage auth (`useAuthStore`) and workout state (`useWorkoutStore`). Auth is persisted to `localStorage` via Zustand's `persist` middleware.

---

## 5. Frontend Logic

### UI Structure

The app uses **React Router v6** with a nested, protected route structure.

```
<BrowserRouter>
  <Routes>
    /login            ← Login page  (public)
    /register         ← Register page (public)
    /                 ← <Layout> shell (protected — requires auth)
      /dashboard
      /onboarding
      /workouts
      /workouts/:id
      /live-training
      /upload-video
      /reports
      /reports/:id
      /profile
      /settings
  </Routes>
</BrowserRouter>
```

### Route Guards (App.tsx)

On startup, `App.tsx` calls `checkAuth()` (which hits `GET /auth/me`) to restore the session. Until the check completes, a spinner is shown. Then:

- **Not logged in** → redirected to `/login`
- **Logged in, onboarding incomplete** → redirected to `/onboarding`
- **Logged in, onboarding complete** → allowed to `/dashboard`

### Main Pages

| Page | Path | Purpose |
|---|---|---|
| `Login` | `/login` | Email + password form, calls `useAuthStore.login()` |
| `Register` | `/register` | Name + email + password form, calls `useAuthStore.register()` |
| `Onboarding` | `/onboarding` | Multi-step profile form (age, weight, goals) |
| `Dashboard` | `/dashboard` | Stats overview, recent sessions |
| `Workouts` | `/workouts` | Workout library browsing |
| `LiveTraining` | `/live-training` | Webcam → WebSocket → real-time feedback |
| `VideoUpload` | `/upload-video` | File picker → upload → AI analysis → results |
| `Reports` | `/reports` | List of all past session reports |
| `ReportDetail` | `/reports/:id` | Full report: mistakes, correction tips, warnings |
| `Profile` | `/profile` | View & edit user profile |

### State Handling

```
useAuthStore (Zustand + persist)
├── isAuthenticated: boolean
├── user: { id, name, email, onboarding_complete, profile? }
├── login(email, password)      → calls authApi.login() → sets state + localStorage
├── register(name, email, pwd)  → calls authApi.register() → sets state
├── logout()                    → calls authApi.logout() → clears state + localStorage
├── checkAuth()                 → calls authApi.getCurrentUser() → restores session
├── completeOnboarding()        → sets user.onboarding_complete = true in state
└── updateProfile(profile)      → merges profile into user state
```

### How UI Talks to APIs

All API calls go through `src/api/client.ts` — a configured **Axios instance**:

- **Base URL:** read from `VITE_API_URL` env variable (default `http://localhost:8000`).
- **Request interceptor:** automatically attaches `Authorization: Bearer <token>` from `localStorage`.
- **Response interceptor:** if a `401` is received, clears `localStorage` and redirects to `/login`.

The typed API modules (`auth.ts`, `videos.ts`, `reports.ts`, `sessions.ts`, `users.ts`) wrap Axios calls with TypeScript interfaces and are used directly by components and the Zustand store.

---

## 6. Backend Logic

### Routing Structure

All routers are registered in `app/main.py`:

| Prefix | File | Tags |
|---|---|---|
| `/auth` | `routes/auth.py` | Authentication |
| `/users` | `routes/users.py` | Users |
| `/reports` | `routes/reports.py` | Reports |
| `/videos` | `routes/videos.py` | Videos |
| `/sessions` | `routes/sessions.py` | Sessions |
| `ws://…/ws/live/{session_id}` | `websockets/live_handler.py` | WebSocket |

### Controllers / Services / Models

**Pattern:** Routes (controllers) → call Service functions → interact with DB or AI.

- **Routes** validate request data using Pydantic models, call the service layer, and format responses.
- **Services** (`supabase_service.py`, `video_service.py`, `session_service.py`) contain all DB queries and AI orchestration.
- **There are no separate ORM models.** The database schema lives in Supabase/PostgreSQL; the backend interacts with it through the Supabase Python SDK using raw table queries (`supabase.table("profiles").select(...)`).

### Authentication

Authentication uses **Supabase Auth** (JWT-based):

- `POST /auth/register` → `supabase.auth.sign_up()` → returns JWT.
- `POST /auth/login` → `supabase.auth.sign_in_with_password()` → returns JWT.
- Protected endpoints receive the JWT in the `Authorization: Bearer <token>` header.
- `verify_token(token)` calls `supabase.auth.get_user(token)` to validate.
- The backend uses the **Service Role Key** (bypasses Supabase Row Level Security) for all server-side operations.

### Validation

- **Request body validation:** Pydantic `BaseModel` classes in each route file.
- **Auth validation:** `get_current_user` dependency injected into protected route handlers.
- **File validation:** Extension whitelist (`mp4, mov, avi, mkv`), max 500 MB size check.
- **Business validation:** Exercise name whitelist, session existence checks.

---

## 7. API Flow

### Complete API Endpoint Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register new user |
| `POST` | `/auth/login` | No | Login user |
| `POST` | `/auth/logout` | Yes | Logout user |
| `GET` | `/auth/me` | Yes | Get current user |
| `GET` | `/users/profile` | Yes | Get profile |
| `PUT` | `/users/profile` | Yes | Update profile |
| `POST` | `/videos/upload` | Yes | Upload & analyze video |
| `GET` | `/videos/session/{id}/status` | Yes | Poll analysis status |
| `POST` | `/sessions/start` | Yes | Start live session |
| `POST` | `/sessions/{id}/end` | Yes | End live session + generate report |
| `GET` | `/reports` | Yes | List all reports |
| `GET` | `/reports/stats` | Yes | Get aggregate stats |
| `GET` | `/reports/{id}` | Yes | Get single report |
| `WS` | `/ws/live/{session_id}` | (session token) | Real-time live training |
| `GET` | `/health` | No | API health check |

---

### Example: Login

**Request:**
```json
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ahmed Ali",
    "email": "user@example.com",
    "onboarding_complete": true
  }
}
```

---

### Example: Upload Video

**Request:**
```
POST /videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

video: <binary file>
session_name: "Morning Squat Practice"
```

**Response (200 OK):**
```json
{
  "session_id": "abc-123",
  "report_id": "def-456",
  "message": "Video analyzed successfully",
  "metrics": {
    "form_score": 78,
    "performance_rating": "good",
    "total_mistakes": 3,
    "duration_seconds": 45.0,
    "total_frames_processed": 1350,
    "exercise_detected": "squat"
  },
  "report": { ... },
  "video_storage_path": "user_id/20240421_093000_video.mp4"
}
```

---

### Example: WebSocket Frame (Live Training)

**Client sends (every ~33ms):**
```json
{
  "type": "frame",
  "frame": "data:image/jpeg;base64,/9j/4AAQSkZJR...",
  "timestamp": 12.5
}
```

**Server responds:**
```json
{
  "status": "analyzing",
  "exercise": "squat",
  "confidence": 0.923,
  "form_status": "bad",
  "feedback": "Keep chest up (too much forward lean)",
  "mistakes_this_frame": ["Keep chest up (too much forward lean)"],
  "frame_id": 375,
  "total_mistakes_so_far": 7,
  "buffer_progress": 50,
  "metrics": {
    "knee_angle": 102.3,
    "torso_lean_deg": 58.4
  }
}
```

---

## 8. Data Flow Diagram

### Video Upload Flow

```
User selects video file
       │
       ▼
VideoUpload.tsx
  handleUpload()
       │  POST multipart/form-data
       ▼
/videos/upload (FastAPI)
  get_current_user() ── verify JWT ──► Supabase Auth
       │
       ├── validate file type & size
       ├── upload_video_to_storage() ──────────────────► Supabase Storage (workout-videos bucket)
       ├── create_session_record()  ──────────────────► DB: exercise_sessions (status=processing)
       │
       └── analyze_video()  [run in thread executor]
               │
               ├── OpenCV reads frames
               ├── MediaPipe Holistic ── pose detection per frame
               ├── extract_pose_features() ── 99 floats (33 landmarks × x,y,z)
               ├── Append to feature_buffer (deque, maxlen=50)
               ├── When buffer full → model.predict() [LSTM Keras]
               ├── If confidence > 0.70 → classify exercise
               ├── check_pushup/squat/situp_form() ── angle calculations
               ├── MistakeClassifier.classify_feedback() ── typed mistake
               ├── SessionTracker.record_mistake()
               └── After all frames:
                       │
                       ├── Counter(all_predictions) → dominant exercise_type
                       ├── ReportGenerator.generate_report()
                       └── calculate_form_score()
       │
       ├── save_report_record() ──────────────────────► DB: reports
       ├── update_session_after_analysis() ───────────► DB: exercise_sessions (status=completed)
       │
       ▼
Response: { session_id, report_id, metrics, report }
       │
       ▼
VideoUpload.tsx
  setAnalysisResult(result)
  setUploadPhase('complete')
  ── displays form_score, total_mistakes, performance_rating
  ── "View Full Report" → navigate('/reports/def-456')
```

---

### Live Training Flow

```
User clicks "Start Session"
       │
       ▼
LiveTraining.tsx
  POST /sessions/start  { exercise_name: "squat" }
       │
       ▼
sessions.py → start_session()
  create_live_session() ──► in-memory dict { session_id → { tracker, user_id, … } }
  INSERT exercise_sessions ► DB (status=processing)
  returns: { session_id, websocket_url: "/ws/live/{id}" }
       │
       ▼
LiveTraining.tsx
  Opens WebSocket: ws://localhost:8000/ws/live/{session_id}
  Grabs webcam stream
  Every ~33ms → sends { frame: base64JPEG, timestamp }
       │
       ▼
live_handler.py → handle_live_session()
  Per frame:
    decode base64 → numpy array (cv2)
    MediaPipe Holistic.process(frame_rgb)
    extract_pose_features() → 99-dim vector
    append to feature_buffer
    if buffer == 50 → model.predict() [in executor]
    if confidence > 0.70 → check form
    MistakeClassifier → typed mistake
    SessionTracker.record_mistake()
    send JSON feedback back to React
       │
       ▼
LiveTraining.tsx
  displays: exercise detected, form_status (good/bad), feedback text, mistake count
       │
User clicks "End Session"
       │
       ▼
POST /sessions/{id}/end
  end_live_session() → tracker from memory
  ReportGenerator.generate_report()
  calculate_form_score()
  INSERT reports ──────────────────────────────────────► DB
  UPDATE exercise_sessions (status=completed) ─────────► DB
  returns: { report_id, report, metrics }
       │
       ▼
LiveTraining.tsx navigates → /reports/{report_id}
```

---

## 9. Key Functions

| Function | File | What it does | When called |
|---|---|---|---|
| `analyze_video()` | `services/video_service.py` | Full video AI pipeline: OpenCV → MediaPipe → LSTM → form check → report | On `POST /videos/upload`, run in thread executor |
| `handle_live_session()` | `websockets/live_handler.py` | Main WebSocket loop: receives frames, runs AI per frame, sends feedback | For every live session WebSocket connection |
| `process_single_frame()` | `websockets/live_handler.py` | Processes one Base64 frame: decode → MediaPipe → predict → form check | Called inside the WebSocket loop, per frame |
| `extract_pose_features()` | `ai/pose_utils.py` | Converts MediaPipe results → 99-float numpy array (33 landmarks × x,y,z) | Every frame that has a detected pose |
| `calculate_form_score()` | `ai/pose_utils.py` | Calculates 0–100 score from mistake ratio + performance rating adjustment | After analysis ends |
| `check_pushup_form()` | `ai/form_checks.py` | Uses joint angles (back, elbow) to detect push-up form issues | Per frame, when exercise is push_up |
| `check_squat_form()` | `ai/form_checks.py` | Uses torso lean, knee-over-toe, depth to detect squat form issues | Per frame, when exercise is squat |
| `check_situp_form()` | `ai/form_checks.py` | Uses torso angle and neck-forward proxy for sit-up form issues | Per frame, when exercise is sit_up |
| `MistakeClassifier.classify_feedback()` | `reports/mistake_classifier.py` | Maps raw form feedback string → (mistake_type, message, severity) | After a "Bad Form" result from form checks |
| `SessionTracker.record_mistake()` | `reports/session_tracker.py` | Appends a `MistakeEvent` to the session's mistake list | Every time a bad form frame is confirmed |
| `ReportGenerator.generate_report()` | `reports/report_generator.py` | Aggregates mistakes, determines performance rating, builds full report JSON | After video analysis or live session ends |
| `verify_token()` | `services/supabase_service.py` | Calls Supabase `get_user(token)` to validate JWT | On every protected API request |
| `get_supabase_client()` | `services/supabase_service.py` | Lazy singleton: creates and caches the Supabase Python client | At first DB operation |
| `upload_video_to_storage()` | `services/supabase_service.py` | Uploads raw video bytes to Supabase Storage private bucket | During video upload |
| `useAuthStore.checkAuth()` | `app/store.ts` | Verifies JWT on app startup, restores user session | In `App.tsx` `useEffect` on mount |
| `useAuthStore.login()` | `app/store.ts` | Calls `authApi.login()`, saves token, updates Zustand state | When user submits login form |
| `videosApi.upload()` | `api/videos.ts` | Sends multipart video + session_name to backend, tracks upload progress | In `VideoUpload.tsx` `handleUpload()` |

---

## 10. End-to-End Scenarios

### Scenario A: "User Logs In"

```
1. User types email + password → clicks "Sign In"

2. Login.tsx calls useAuthStore.login(email, password)

3. store.ts → authApi.login(email, password)
   → Axios POST /auth/login  { email, password }
   → client.ts adds Content-Type header (no token yet)

4. FastAPI auth.py: login()
   → supabase.auth.sign_in_with_password({ email, password })
   → Supabase verifies credentials
   → Returns session.access_token + user object

5. auth.py → get_profile(user_id)
   → supabase.table("profiles").select("*").eq("user_id", uid)
   → Returns onboarding_complete status

6. Returns: { token: "eyJ...", user: { id, name, email, onboarding_complete } }

7. store.ts:
   → localStorage.setItem('auth_token', token)
   → set({ isAuthenticated: true, user })

8. App.tsx re-renders:
   → if onboarding_complete: navigate to /dashboard
   → else: navigate to /onboarding
```

---

### Scenario B: "User Uploads a Workout Video"

```
1. User goes to /upload-video
   → picks file from drag-drop zone (VideoUploadZone component)
   → optionally enters session name
   → clicks "Analyze Video"

2. VideoUpload.tsx: handleUpload()
   → setUploadPhase('uploading')
   → calls videosApi.upload({ video: file, session_name })

3. videos.ts:
   → creates FormData with video + session_name
   → Axios POST /videos/upload
      Content-Type: multipart/form-data
      Authorization: Bearer <token>
   → tracks upload progress → calls onProgress(percent)
   → when percent=100: setUploadPhase('analyzing')

4. FastAPI videos.py: upload_video()
   → get_current_user() → verify_token() → Supabase validates JWT → user_id

   STEP 1: Validate file extension, size
   STEP 2: Read bytes into memory
   STEP 3: Write to /tmp/fitpose_videos/{uuid}.mp4
   STEP 4: upload_video_to_storage() → Supabase Storage
   STEP 5: create_session_record() → DB exercise_sessions (status unset/processing)
   STEP 6: Check app.state.model_loaded
   STEP 7: loop.run_in_executor(None, lambda: analyze_video(...))

5. video_service.py: analyze_video()
   → OpenCV VideoCapture(temp_path)
   → MediaPipe Holistic context
   → Per frame:
       resize to 520×300
       BGR→RGB
       holistic.process(frame_rgb)
       if no pose: skip
       extract_pose_features() → 99-float vector
       append to deque(maxlen=50)
       if buffer < 50: skip
       model.predict(input_seq) → probabilities over [squat, push_up, sit_up]
       if confidence >= 0.70:
           record prediction → all_predictions[]
           check form for detected exercise
           if "Bad Form": MistakeClassifier → SessionTracker.record_mistake()
   → Counter(all_predictions) → dominant exercise_type
   → tracker.end_session()
   → ReportGenerator.generate_report(session_data)
   → calculate_form_score(report, total_frames)

6. Back in videos.py:
   → save_report_record() → DB reports table
   → update_session_after_analysis() → DB exercise_sessions (status=completed)
   → os.remove(temp_path) [cleanup]

7. Returns VideoUploadResponse:
   { session_id, report_id, metrics, report, video_storage_path }

8. VideoUpload.tsx:
   → setAnalysisResult(result)
   → setUploadPhase('complete')
   → Renders: form_score, total_mistakes, performance_rating badge
   → "View Full Report" button → navigate(/reports/{report_id})
```

---

### Scenario C: "User Does a Live Training Session"

```
1. User goes to /live-training → selects exercise → clicks "Start"

2. LiveTraining.tsx:
   → POST /sessions/start { exercise_name: "squat" }
   → Returns { session_id, websocket_url }
   → Opens WebSocket: ws://localhost:8000/ws/live/{session_id}
   → navigator.mediaDevices.getUserMedia({ video: true }) → webcam stream

3. live_handler.py: handle_live_session()
   → accepts WebSocket
   → looks up session in in-memory dict (session_service)
   → initialises feature_buffer (deque maxlen=50)
   → initialises MediaPipe Holistic

4. Main loop:
   → await websocket.receive_text() (with 10s timeout)
   → parse JSON: { type, frame, timestamp }
   → if ping: send pong
   → process_single_frame(frame_b64, holistic, feature_buffer, model, labels, tracker)
       decode base64 → numpy → cv2
       holistic.process(frame_rgb)
       extract_pose_features()
       append to feature_buffer
       if buffer < 50: return { status: "buffering", buffer_progress: N }
       model.predict() [in executor]
       if confidence > 0.70:
           check form (squat/pushup/situp)
           if "Bad Form": record mistake
   → send result JSON back to React

5. React overlay updates every frame:
   → Shows: exercise name, confidence bar, "Good/Bad" indicator
   → Shows: real-time feedback text
   → Shows: mistake count

6. User clicks "End Session":
   → POST /sessions/{id}/end { exercise_name }
   → sessions.py: end_live_session(session_id) → gets tracker from memory
   → ReportGenerator.generate_report(tracker.get_session_summary())
   → INSERT reports, UPDATE exercise_sessions → DB
   → Returns report + metrics

7. React navigates to /reports/{report_id}
```

---

## 11. How Everything Connects

### Frontend ↔ Backend

- All HTTP calls use Axios via `src/api/client.ts`.
- The **JWT token** is stored in `localStorage` and automatically attached to every request by the request interceptor.
- A 401 response triggers automatic logout and redirect.
- **Video upload** uses `multipart/form-data` with up to 10-minute timeout.
- **Live training** uses a permanent WebSocket connection (`ws://`). Frames are sent as Base64 JSON strings.

### Backend ↔ Database (Supabase)

- The Supabase Python client (`supabase-py`) is initialized once as a singleton in `get_supabase_client()`.
- **Service Role Key** is used server-side (bypasses Row Level Security).
- Operations: `table().select()`, `.insert()`, `.update()`, `.upsert()`, `.eq()`.
- Video files go to **Supabase Storage** (private bucket `workout-videos`), not directly in the DB. Only the storage path is stored in the DB.

### Key DB Tables

| Table | Purpose |
|---|---|
| `auth.users` | Managed by Supabase Auth (email, password hash) |
| `profiles` | User profile data (height, weight, fitness goal, onboarding status) |
| `exercise_sessions` | Each workout session (metadata, status, scores) |
| `reports` | Full report JSON stored as JSONB field + summary columns |

### Module Communication

```
routes/ ──calls──► services/supabase_service.py ──► Supabase DB
routes/ ──calls──► services/video_service.py ──────► ai/ + reports/
routes/ ──calls──► services/session_service.py ────► in-memory dict

websockets/live_handler.py ──calls──► ai/pose_utils.py
                            ──calls──► ai/form_checks.py
                            ──calls──► reports/mistake_classifier.py
                            ──calls──► services/session_service.py
```

---

## 12. Important Notes

### Design Decisions

- **Exercise auto-detection:** The system does not require the user to specify the exercise type before uploading a video. The LSTM model predicts the class per window; the most frequent prediction across the video becomes the `exercise_type`.
- **LSTM Sequence Length = 50 frames:** The model needs 50 consecutive pose frames before making its first prediction. During live sessions this means ~1.7 seconds of buffering at 30 fps.
- **Confidence Threshold = 0.70:** Predictions below this are ignored to avoid false feedback.
- **Thread executor for AI:** TensorFlow `model.predict()` is CPU-bound and blocking. It is wrapped in `asyncio.run_in_executor()` to prevent blocking FastAPI's async event loop.
- **Single Supabase client (singleton):** `_supabase_client` is a module-level global to avoid re-creating connections on every request.
- **Temp file for video processing:** OpenCV requires a file path, not bytes. The uploaded video is written to `/tmp/fitpose_videos/` and always cleaned up in a `finally` block.

### Assumptions

- Users have a modern browser with `getUserMedia` (for live training webcam).
- The backend server and `best_model.keras` are on the same machine.
- Supabase credentials are set via `.env`.
- The `workout-videos` Supabase Storage bucket already exists.

### Limitations

- **Video analysis is synchronous** — the HTTP request blocks for 1–3 minutes for long videos. There is no async job queue (e.g., Celery/Redis). This could time out for very long videos.
- **In-memory sessions:** Live sessions are stored in a Python dict. If the server restarts, all active sessions are lost.
- **Form check heuristics:** The angle-based form checks are approximate (especially squat knee-over-toe uses 2D pixel distance, not real 3D depth).
- **3 exercise types only:** The model was trained on squat, push-up, and sit-up. Other exercises will be classified as one of these.
- **Single server:** No load balancing. All AI work happens in one process.

### Potential Improvements

- Add an **async job queue** (e.g., Celery + Redis) for video processing so the HTTP call can return immediately with a job ID the frontend polls.
- **Persist live sessions** in Redis or DB so server restarts don't lose sessions.
- Refine form checks with **3D depth estimation** or side-camera angles for more accurate readings.
- Add more exercise classes to the LSTM model.
- Add a **Refresh Token** flow for longer sessions without re-login.
- Remove the `/reports/seed-test-data` endpoint before production deployment.

---

*Documentation generated from source code analysis — April 2026.*
