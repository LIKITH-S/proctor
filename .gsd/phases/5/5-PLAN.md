---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Polish & Production Readiness

## Objective
Ensure the platform looks ultra-premium on all devices (UI polish) and configure Django and Vite for cloud deployment (e.g. Render and Vercel).

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md

## Tasks

<task type="auto">
  <name>Install Frontend Dependencies</name>
  <files>frontend/package.json</files>
  <action>
    - Resolve the missing `react-markdown` installation error seen in the user's terminal by ensuring it is properly installed and saved to package.json.
  </action>
  <verify>npm list react-markdown</verify>
  <done>React app runs without module resolution errors.</done>
</task>

<task type="auto">
  <name>Configure Production Settings (Backend)</name>
  <files>backend/server/settings.py, backend/requirements.txt</files>
  <action>
    - Configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to accept dynamic environment variables.
    - (Optional) Configure `dj-database-url` and `whitenoise` if moving away from SQLite/local media for production.
  </action>
  <verify>python manage.py check --deploy</verify>
  <done>Django backend is capable of running securely behind a reverse proxy.</done>
</task>

<task type="auto">
  <name>UI Responsiveness & Polish (Frontend)</name>
  <files>frontend/src/pages/DashboardPage.jsx, frontend/index.css</files>
  <action>
    - Ensure the Monaco Editor and Split-pane layout respond gracefully to 1080p and smaller screens.
    - Add micro-animations or glassmorphism tweaks to solidify the "ultra-premium" feel.
  </action>
  <verify>npm run build</verify>
  <done>Production bundle compiles successfully.</done>
</task>

## Success Criteria
- [ ] Missing markdown dependency is resolved.
- [ ] Django backend is secure and ready for cloud deployment.
- [ ] Frontend dashboard layout is robust and compiles flawlessly.
