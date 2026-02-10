# 🦅 AWS EXECUTION PLAN (TACTICAL)
**"The Flight Checklist for the Logistics King"**

You have chosen **AWS**. A wise choice.
This is your **Click-by-Click Guide** to launch the Empire.

---

## 🛑 PREREQUISITE: THE GITHUB SYNC
1.  Go to [GitHub.com](https://github.com).
2.  Create a **New Repository** called `logistics-os`.
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/logistics-os.git
    git push -u origin main
    ```
    *(You must do this so AWS can "see" your code).*

---

## 1. 🖥️ FRONTEND DEPLOYMENT (AWS AMPLIFY)
**Goal:** Host the Next.js Website.
1.  Log in to **AWS Console**.
2.  Search for **"Amplify"**.
3.  Click **"Create New App"** -> **"Host Web App"** (Gen 2).
4.  Select **GitHub**. Authorize it.
5.  Select your `logistics-os` repository.
6.  **Build Settings:**
    *   It should auto-detect `Next.js`.
    *   Look for "Environment Variables".
    *   Add: `NEXT_PUBLIC_BACKEND_URL` = `https://api.your-backend.com` (You will update this later).
7.  Click **"Save and Deploy"**.
8.  **Wait 5 minutes.** You will get a link like `https://main.d123.amplifyapp.com`.

---

## 2. 🚀 BACKEND DEPLOYMENT (AWS APP RUNNER)
**Goal:** Run the FastAPI Server (No Linux).
1.  Search for **"App Runner"**.
2.  Click **"Create Service"**.
3.  **Source:** Select "Source Code Repository" -> **GitHub**.
4.  Select `logistics-os` repo.
5.  **Configure Build:**
    *   **Runtime:** Python 3.12.
    *   **Build Command:** `pip install -r backend/requirements.txt`
    *   **Start Command:** `python backend/run.py`
    *   **Port:** `8000`
6.  **Environment Variables:**
    *   Add `OPENAI_API_KEY`, `MAERSK_CONSUMER_KEY`, etc.
    *   Add `DATABASE_URL` (From Step 3).
7.  Click **"Create & Deploy"**.

---

## 3. 🗄️ DATABASE DEPLOYMENT (AWS RDS)
**Goal:** A Postgres Database that never sleeps.
1.  Search for **"RDS"**.
2.  Click **"Create Database"**.
3.  Select **PostgreSQL**.
4.  **Template:** Select "**Free Tier**".
5.  **Settings:**
    *   **Master Username:** `postgres`
    *   **Master Password:** (Create a strong password).
6.  **Connectivity:** Select "**Public Access: Yes**" (Easier for now).
7.  Click **"Create Database"**.
8.  **Get the Endpoint:** Copy the URL (e.g., `db.abc1234.us-east-1.rds.amazonaws.com`).
9.  **Format for Backend:**
    `postgresql+asyncpg://postgres:PASSWORD@ENDPOINT:5432/logistics_db`

---

## 🏆 FINAL LINKING
1.  Copy the **App Runner URL** (Backend).
2.  Go back to **Amplify** (Frontend) -> Environment Variables.
3.  Update `NEXT_PUBLIC_BACKEND_URL` to your new App Runner URL.
4.  **Redeploy Amplify.**

**Congratulations. You are now live on the world's most powerful cloud.** 🔱
