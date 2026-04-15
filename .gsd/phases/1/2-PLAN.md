---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Frontend Foundation & Layout

## Objective
Initialize the React frontend using Vite and establish the core routing and styling system.

## Context
- .gsd/SPEC.md
- .gsd/phases/1/RESEARCH.md

## Tasks

<task type="auto">
  <name>Initialize React Project</name>
  <files>
    - frontend/package.json
    - frontend/index.html
    - frontend/src/main.jsx
  </files>
  <action>
    - Initialize a Vite project with React and JavaScript in the `frontend/` directory.
    - Install dependencies: `react-router-dom`, `axios`.
    - Set up a basic `App.jsx` with `BrowserRouter`.
    - Configure environment variable `VITE_API_URL` to point to the backend (defaulting to localhost:8000).
  </action>

  <verify>cd frontend && npm install && npm run build</verify>
  <done>React project initialized and builds successfully.</done>
</task>

<task type="auto">
  <name>Global Styles & Theme</name>
  <files>
    - frontend/src/index.css
  </files>
  <action>
    - Create a modern, dark-themed CSS system using CSS variables.
    - Focus on accessibility and a "premium" feel (using Inter or Roboto fonts if possible from Google Fonts).
  </action>
  <verify>Open frontend in browser (during execution)</verify>
  <done>Global styles applied and visible.</done>
</task>

## Success Criteria
- [ ] Frontend development server can be started.
- [ ] Basic "Proctor Platform" title visible on a dark, themed background.
