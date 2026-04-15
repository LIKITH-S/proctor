---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Frontend Dashboard & Locked Monaco Editor

## Objective
Build the main candidate testing interface with a secure, locked-down code editor.

## Context
- .gsd/SPEC.md
- .gsd/REQUIREMENTS.md
- .gsd/phases/2/1-PLAN.md (Backend APIs)

## Tasks

<task type="auto">
  <name>Candidate Dashboard Structure</name>
  <files>
    - frontend/src/pages/DashboardPage.jsx
    - frontend/package.json
  </files>
  <action>
    - Install `@monaco-editor/react`.
    - Create a two-pane layout: Left (Question Description & Test Cases), Right (Monaco Editor & Console).
    - Fetch the current test question using the `api.js` client and display the title/description.
    - Implement the Countdown Timer based on `localStorage.getItem('end_time')`. Auto-submit when time <= 0.
  </action>
  <verify>npm run dev</verify>
  <done>Dashboard renders the question and editor without crashing, timer counts down.</done>
</task>

<task type="auto">
  <name>Lock Down Monaco Editor</name>
  <files>
    - frontend/src/pages/DashboardPage.jsx
  </files>
  <action>
    - Configure `<Editor />` to disable context menus, quick suggestions, and formatters.
    - Attach global/wrapper event listeners to intercept and prevent `copy`, `cut`, `paste`, and `contextmenu`.
  </action>
  <verify>Manually try to right-click or paste inside the editor container.</verify>
  <done>User cannot paste external code or access context menus inside the coding environment.</done>
</task>

## Success Criteria
- [ ] Code environment layout feels premium and matches the dark theme.
- [ ] Editor restrictions (no copy/paste, no intellisense) are fully functional.
- [ ] Timer accurately counts down and triggers a completion event.
