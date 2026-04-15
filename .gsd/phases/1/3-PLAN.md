---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: Email Match Authentication Flow

## Objective
Implement the "Low Barrier" authentication flow where candidates enter their email and are admitted if they exist in the allowed list for an active test.

## Context
- .gsd/SPEC.md
- .gsd/phases/1/RESEARCH.md
- e:/Test/proctor-platform/.gsd/phases/1/1-PLAN.md

## Tasks

<task type="auto">
  <name>Candidate Auth API</name>
  <files>
    - backend/tests/views.py
    - backend/tests/urls.py
  </files>
  <action>
    - Implement a DRF View `CandidateAuthView`.
    - It should accept `email` and `test_id`.
    - Logic: Check if `test_id` exists, is active, and current time is within `start_time` and `end_time`.
    - Logic: Check if `email` is in `AllowedCandidate` for that test.
    - If match: Return a JWT containing `email` and `test_id`.
  </action>
  <verify>curl -X POST http://localhost:8000/api/auth/candidate/ -d "email=test@example.com&test_id=..."</verify>
  <done>API returns 200 with a token for valid candidates and 403/404 for invalid ones.</done>
</task>

<task type="auto">
  <name>Frontend Login Page</name>
  <files>
    - frontend/src/pages/LoginPage.jsx
    - frontend/src/services/api.js
  </files>
  <action>
    - Create a simple, elegant login page with an Email input and a "Join Test" button.
    - Implement `api.js` service using Axios to interact with the backend.
    - On success: Store token and redirect to Candidate Dashboard (placeholder for now).
  </action>
  <verify>Manually test login flow on UI.</verify>
  <done>Candidate can log in and token is saved in localStorage.</done>
</task>

## Success Criteria
- [ ] Backend validates candidate email against allowed list.
- [ ] Frontend successfully authenticates and stores the session token.
