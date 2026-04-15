---
phase: 2
plan: 3
wave: 3
---

# Plan 2.3: Judge0 Integration

## Objective
Enable secure, live Python code execution by sending student code to the backend, which forwards it to Judge0.

## Context
- .gsd/SPEC.md
- .gsd/REQUIREMENTS.md

## Tasks

<task type="auto">
  <name>Backend Judge0 Service</name>
  <files>
    - backend/tests/services.py
    - backend/tests/views.py
  </files>
  <action>
    - Create a simple HTTP client to proxy requests to the public Judge0 API for code execution (Python language ID).
    - Implement `SubmissionView` that takes the code, evaluates it against all testcases.
    - Save the result to the `Submission` database model.
  </action>
  <verify>Call Judge0 backend execution unit block</verify>
  <done>Code correctly executes and returns output logs/scores.</done>
</task>

<task type="auto">
  <name>Frontend Execution Wiring</name>
  <files>
    - frontend/src/pages/DashboardPage.jsx
    - frontend/src/services/api.js
  </files>
  <action>
    - Connect the `Run Code` and `Submit` buttons in the dashboard to the backend `SubmissionView`.
    - Display standard output and evaluation results in the right-pane console UI.
  </action>
  <verify>Click "Run Code" in browser</verify>
  <done>Console displays actual code output/errors seamlessly.</done>
</task>

## Success Criteria
- [ ] Valid Python code executes successfully via Judge0.
- [ ] Test cases are evaluated correctly, factoring hidden cases.
