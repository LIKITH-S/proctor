---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Backend Models and Details API

## Objective
Extend the database to support Questions, TestCases, and Submissions. Build APIs that serve the test details to the candidate dashboard.

## Context
- .gsd/SPEC.md
- .gsd/REQUIREMENTS.md
- .gsd/phases/2/RESEARCH.md

## Tasks

<task type="auto">
  <name>Create Evaluation Models</name>
  <files>
    - backend/tests/models.py
    - backend/tests/admin.py
  </files>
  <action>
    - Add `Question` model linked to `Test`.
    - Add `TestCase` model linked to `Question` (with `is_hidden` boolean).
    - Add `Submission` model linked to `AllowedCandidate` and `Question`.
    - Register these models in `admin.py` with inlines where appropriate (e.g., TestCases inside Question).
    - Run `makemigrations` and `migrate`.
  </action>
  <verify>python backend/manage.py showmigrations</verify>
  <done>Models are successfully registered and migrated to the database.</done>
</task>

<task type="auto">
  <name>Test Details & Submission APIs</name>
  <files>
    - backend/tests/views.py
    - backend/tests/urls.py
  </files>
  <action>
    - Create a JWT authentication class to protect Candidate endpoints.
    - Implement `TestDetailsView` to fetch the questions and public testcases for the authenticated candidate's test.
    - *(Submission execution logic will be handled later, just return basic JSON for now)*.
  </action>
  <verify>curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/tests/current/</verify>
  <done>Candidate can retrieve their test questions securely.</done>
</task>

## Success Criteria
- [ ] Database contains tables for Questions and TestCases.
- [ ] Admin can add questions and testcases to a test.
- [ ] Candidates can fetch their test contents via a secure API.
