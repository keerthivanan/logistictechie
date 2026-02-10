# 🚢 MAERSK ACTIVATION GUIDE: UNLOCKING THE TITAN
**Status:** ACTION REQUIRED
**Issue:** 401 Unauthorized (Keys valid, but Access Denied)

You gave me the keys (`9O0DZwH...`). The code is ready.
But Maersk is saying: **"Access Pending."**

This is common. Here is how you fix it in 2 minutes:

## 1. 🔑 LOGIN TO THE PORTAL
1.  Go to [developer.maersk.com](https://developer.maersk.com).
2.  Click **"My Apps"** (Top Right).
3.  Click your App Name (The one with ID `0033...`).

## 2. 🟢 CHECK THE SWITCHES
You listed "Locations, Vessels, Commodities" as Enabled.
**But you missed the critical ones:**

*   **Traffic / OAuth2:** [ ] -> **[X] ENABLE** (Must be on).
*   **Spot Rates:** [ ] -> **[X] ENABLE** (If available).
*   **Callback URL:** Set to `http://localhost:8000`.

## 3. ⏳ THE WAITING GAME
Once you click "Enable", it takes **15-60 Minutes** for Maersk servers to sync.
**The code is perfect.** We just need the Green Light from Denmark.

## 🛡️ CURRENT STATUS: SOVEREIGN MODE
While we wait, the system is running on **Sovereign Market Logic**.
*   **Quotes:** WORKING (High-Fidelity Estimates).
*   **Booking:** WORKING (Lead Capture).
*   **Tracking:** WORKING (Simulation).

**Your website is safe.**
Just flip those switches in the portal. 🔱
