# RESEARCH.md — Phase 1: Foundation & Auth

## Goal
Establish the technical foundation for the Proctor Platform, including the backend (Django), frontend (React), and the unique "Email Match" authentication flow.

## 1. Technical Stack Selection
- **Backend**: Django + Django REST Framework (DRF).
  - Why: Django Admin is perfect for REQ-01 (test management) and REQ-10 (reviewing snapshots).
- **Frontend**: React + Vite + Vanilla CSS.
  - Why: Fast development, modern ecosystem.
- **Database**: SQLite (for MVP) or PostgreSQL. SQLite is sufficient for the initial build and local testing.
- **Auth**: Custom "Email Match" flow.
  - No passwords/OTPs for candidates.
  - Verification: `GET /api/enter-test?email=...&test_id=...` -> Checks if email is in `AllowedCandidate` list for the test.
  - If match: Issue a signed JWT or session cookie.

## 2. Data Models (Draft)

### Test
- `id`: UUID
- `title`: String
- `start_time`: DateTime
- `end_time`: DateTime
- `duration_minutes`: Integer
- `is_active`: Boolean

### AllowedCandidate
- `test`: ForeignKey(Test)
- `email`: EmailField
- `has_started`: Boolean
- `start_time`: DateTime (actual)

### ViolationLog
- `candidate`: ForeignKey(AllowedCandidate)
- `type`: Choice (TAB_SWITCH, BLUR, FULLSCREEN_EXIT)
- `timestamp`: DateTime

## 3. Implementation Strategy: "Email Match" Auth
1. Candidate enters email on a landing page.
2. Frontend sends request to `/api/auth/candidate/`.
3. Backend checks `AllowedCandidate` table for that `email` and current `test_id`.
4. If found and test is active:
   - Backend returns a token (JWT) containing `email` and `test_id`.
   - Frontend stores token in `localStorage`.
5. All proctoring and submission APIs require this token.

## 4. Project Structure (Proposed)
```
proctor-platform/
├── backend/ (Django)
│   ├── core/ (Project config)
│   ├── tests/ (Test management app)
│   ├── proctor/ (Proctoring/snapshots app)
│   └── manage.py
├── frontend/ (React/Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── .gsd/
```

## 5. Deployment Strategy (Render & Vercel)
- **Backend (Render)**:
  - Framework: Django + Gunicorn.
  - Database: **PostgreSQL** (Render's managed DB).
  - Config: `dj-database-url` for easy connection strings.
  - WhiteNoise: For serving static files in production.
- **Frontend (Vercel)**:
  - Framework: React (Vite).
  - Environment: `VITE_API_URL` for pointing to Render.

## 6. Risks & Mitigations
- **Auth Security**: Since there's no password, anyone who knows someone's email can enter.
  - *Mitigation*: Accepted risk per SPEC ("Low Barrier Access"). The system is for internal/classroom use where emails are unique and stakes are monitored.
- **Judge0 Connectivity**: Relying on Hosted Judge0.
  - *Mitigation*: Ensure robust error handling for API timeouts.

