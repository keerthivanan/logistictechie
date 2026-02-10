# 🔱 SOVEREIGN MAINTENANCE MANUAL
**"How to Rule Your Kingdom"**

You asked: *"How to maintain and fulfill the website?"*
This is your **Operational Bible**.

---

## 📅 1. DAILY RITUALS (The Health Check)
**Frequency:** Every Morning (9:00 AM)
*   **Check the Pulse:**
    *   Run `.\dev.bat` -> `python backend/supreme_pulse.py`
    *   **Goal:** Ensure "Database" and "Backend Heartbeat" are ACTIVE.
*   **Check the Brain:**
    *   Open the Website -> Click "Chat with Cortex".
    *   Ask: *"What is the risk in the Red Sea?"*
    *   **Goal:** Ensure OpenAI answers intelligently. If it fails, check your API credits.

## 📅 2. WEEKLY RITUALS (The Security Audit)
**Frequency:** Every Monday
*   **Backup the Database:**
    *   Command: `pg_dump logistics_db > backup_YYYY_MM_DD.sql`
    *   **Goal:** If the server crashes, you lose nothing.
*   **Update Dependencies:**
    *   Command: `conda update --all`
    *   **Goal:** Keep Python and Node.js secure from hackers.

## 💰 3. COST MANAGEMENT (The Royal Treasury)
You are using paid APIs. Watch them like a hawk.
*   **OpenAI:** Set a hard limit of **$50/month** in the OpenAI Dashboard.
*   **Google Maps:** Google gives $200 free credit monthly. Monitor usage if you exceed 100,000 views.
*   **Maersk/SeaRates:** These are usually per-transaction. Check your invoices.

## 🚨 4. EMERGENCY PROTOCOLS (When Things Break)
*   **Scenario A: "The Map is Gray"**
    *   **Cause:** Google API Key expired or billing failed.
    *   **Action:** Go to Google Cloud Console -> Billing -> Fix Payment Method.
*   **Scenario B: "No Routes Found"**
    *   **Cause:** Maersk API is down (rare) or Key is invalid.
    *   **Action:** Check [Maersk Developer Status](https://developer.maersk.com/status). If down, wait.
*   **Scenario C: "System Crash"**
    *   **Action:** Restart the server.
    *   `Ctrl+C` in terminal -> `.\dev.bat` -> `python start_services.py`.

---

## 🚀 HOW TO "FULFILL" (Scale Up)
To turn this into a **billion-dollar company**:
1.  **Hire a Sales Team:** Use the App to show clients *real-time* quotes. Dazzle them with the 3D Map.
2.  **Marketing:** Screenshot the "King's Dashboard" and post on LinkedIn. "We don't guess. We know."
3.  **Expansion:** Once you have 50 clients, hire a DevOps engineer to move from Railway to **AWS Kubernetes**.

**You have the tool. Now go build the business.** 🔱
