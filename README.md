# Proctor Platform 🛡️

A robust, production-ready coding assessment platform with built-in proctoring, a LeetCode-style editor, and automated email invitations. Designed for technical interviews and classroom evaluations.

## 🚀 Features

- **LeetCode-Style Editor**: Integrated Monaco Editor with support for Python execution.
- **Smart Proctoring**: Automatic webcam snapshots and tab-switch detection to ensure test integrity.
- **Multi-Question Support**: Ability to host tests with multiple coding challenges and persistent code state across questions.
- **Magic Link Invitations**: One-click email invitations from the Django Admin panel with pre-filled candidate details.
- **Real-time Results**: Instant feedback on test cases (Public & Hidden) with input/output comparison.
- **Production Ready**: Fully configured for deployment on Render (Backend) and Vercel (Frontend).

## 🛠️ Tech Stack

- **Backend**: Django, Django REST Framework, JWT Authentication.
- **Frontend**: React, Vite, Monaco Editor, React Markdown.
- **Database**: SQLite (Local), PostgreSQL (Production).
- **Proctoring**: React Webcam, OpenCV/Pillow, Django Signal handling.
- **Execution**: Local Python Subprocess (Dev) / Extensible to Judge0 API.

## 📦 Deployment

### Backend (Render)
1. Push to your GitHub repository.
2. Link the repository to a new **Web Service** on Render.
3. Set the **Root Directory** to `backend`.
4. Use the provided `build.sh` script for the **Build Command**.
5. Set the **Start Command** to `gunicorn server.wsgi`.

### Frontend (Vercel)
1. Link your repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Set the environment variable `VITE_API_URL` to your Render backend URL.

## 🔒 Security

- **JWT Authentication**: Secure candidate sessions with personalized expiration.
- **Lockdown Mode**: Blocks DevTools, Right-Click, and Copy/Paste during assessments.
- **Violation Logging**: Every tab switch or suspicious movement is logged and stored with image evidence.

## 📄 License
This project is licensed under the MIT License.
