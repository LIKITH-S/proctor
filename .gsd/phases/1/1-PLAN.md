---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Backend Foundation & Models

## Objective
Initialize the Django project and define the core database models for Tests and Allowed Candidates, enabling manual test management via Django Admin.

## Context
- .gsd/SPEC.md
- .gsd/REQUIREMENTS.md
- .gsd/phases/1/RESEARCH.md

## Tasks

<task type="auto">
  <name>Initialize Django Project</name>
  <files>
    - backend/manage.py
    - backend/core/settings.py
  </files>
  <action>
    - Create a Django project named `core` in the `backend/` directory.
    - Set up a basic `requirements.txt` with `django`, `djangorestframework`, `django-cors-headers`, `pyjwt`, `psycopg2-binary`, `dj-database-url`, `gunicorn`, and `whitenoise`.
    - Configure `CORS_ALLOWED_ORIGINS` to allow both local development and Vercel domains (using env variables).
    - Configure `DATABASES` in `settings.py` to use `dj-database-url` for easy PostgreSQL connection on Render.
  </action>

  <verify>python backend/manage.py check</verify>
  <done>Django project initialized and runs without errors.</done>
</task>

<task type="auto">
  <name>Define Test & Candidate Models</name>
  <files>
    - backend/tests/models.py
    - backend/tests/admin.py
  </files>
  <action>
    - Create a Django app `tests`.
    - Implement `Test` model (title, start_time, end_time, isActive).
    - Implement `AllowedCandidate` model (test FK, email).
    - Register both models in the Django Admin for easy management.
    - Run migrations.
  </action>
  <verify>python backend/manage.py makemigrations && python backend/manage.py migrate</verify>
  <done>Models created and visible in Django Admin after creating a superuser.</done>
</task>

## Success Criteria
- [ ] Django backend is running.
- [ ] Admin can create a Test and add e-mails to the Allowed list via the default Django Admin interface.
