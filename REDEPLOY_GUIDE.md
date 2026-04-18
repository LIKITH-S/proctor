# 🚀 Proctor Platform: 30-Day Redeployment Guide

Render's **Free Tier PostgreSQL** databases expire after 30 days. When this happens, your database will become "Read-only" and then eventually be deleted. Setting up a new one takes only **5 minutes** if you follow this guide!

---

## 📋 The "New Month" Checklist

When your database expires, your backend will start showing "Database Connection Errors." Do not panic! Follow these steps:

### 1. Create a New Database on Render
1.  Go to your [Render Dashboard](https://dashboard.render.com).
2.  Click **+ New** -> **PostgreSQL**.
3.  Name it (e.g., `proctor-db-may` or `proctor-db-june`).
4.  Click **Create Database** (ensure it's on the Free Tier).
5.  Wait for it to say **Available**.
6.  Scroll down to **Internal Database URL** and **COPY it**.

### 2. Update the Backend Environment
1.  Go to your **`proctor-backend`** Web Service on Render.
2.  Click **Environment** in the left menu.
3.  Find the `DATABASE_URL` key.
4.  **Paste your NEW Database URL** here.
5.  Click **Save Changes**.

### 3. Initialize the New Database (Crucial!)
Because the new database is empty, you need to set up the tables again.
1.  On the left menu of your `proctor-backend`, click **Shell**.
2.  Type this command and press Enter:
    ```bash
    python manage.py migrate
    ```
3.  Create yourself a new Admin account by typing:
    ```bash
    python manage.py createsuperuser
    ```
    *(Follow the prompts for username and password)*.

---

## 🔐 Environment Variables Cheat Sheet
Keep these values handy so you can easily paste them when setting up new services. 

| Key | Value Source |
| :--- | :--- |
| `DATABASE_URL` | Render (Changes every 30 days) |
| `CLOUDINARY_URL` | [Cloudinary Dashboard](https://cloudinary.com/console) (Permanent) |
| `EMAIL_HOST_USER` | `likith.innote1@gmail.com` |
| `EMAIL_HOST_PASSWORD` | `ouwssekpcjzwwaca` (Google App Password) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `*` |
| `CORS_ALLOWED_ORIGINS` | `https://proctor-sigma.vercel.app` |
| `FRONTEND_URL` | `https://proctor-sigma.vercel.app` |

---

## 📸 Cloudinary Verification
Your snapshots are permanent! Every time you reset your database, your **old snapshots** will still be safe in your Cloudinary Media Library. You only lose the *database record* of which student took which photo. 

> [!TIP]
> **Pro Tip**: If you want to keep your data forever, you can export your "AllowedCandidate" and "Submission" tables as a CSV from the Django Admin before the 30 days are up!

---

### ✅ Confirmation: All Code Pushed
I have confirmed that **100% of the code changes** (Webcam Fixes, Cloudinary Integration, and Permission UX) are committed and pushed to your GitHub main branch. 

**Your deployment is now fully up to date and production-ready!** 🎓🚀
