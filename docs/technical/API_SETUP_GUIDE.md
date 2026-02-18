# 🔱 SOVEREIGN API ACTIVATION PROTOCOL

To achieve **"Supreme Command"** status (Connectivity Score: 100/100), you must acquire and configure the following High-Intelligence API Keys.

---

## 🧠 1. AI Intelligence (OpenAI)
**Required for:** Creative Cortex, Predictive Risk Analysis, Chatbot.

1.  **Go to:** [OpenAI Platform](https://platform.openai.com/signup)
2.  **Sign Up/Log In.**
3.  **Navigate to:** Dashboard -> API Keys.
4.  **Action:** Click **"Create new secret key"**.
5.  **Copy the key** (starts with `sk-...`).
6.  **Paste into:** `backend/.env` -> `OPENAI_API_KEY`.

---

## 🌍 2. Google Enterprise (Maps & Intelligence)
**Required for:** 3D Global Tracking, Address Autocomplete, Document AI (OCR).

1.  **Go to:** [Google Cloud Console](https://console.cloud.google.com/)
2.  **Create Project:** Name it `OMEGO-logistics-2026`.
3.  **Enable APIs:** Search for and enable:
    *   Maps JavaScript API
    *   Places API (New)
    *   Cloud Document AI API
4.  **Create Credentials:**
    *   Go to **APIs & Services** -> **Credentials**.
    *   Click **Create Credentials** -> **API Key**.
5.  **Copy the key** (starts with `AIza...`).
6.  **Paste into:** 
    *   `backend/.env` -> `GOOGLE_API_KEY`
    *   `frontend/.env.local` -> `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 🌊 3. Ocean Carrier Connectivity (The "True Ocean")
**Required for:** Real-time shipping rates (No Mock Data).

### 🚢 Maersk (Spot Rates)
1.  **Go to:** [Maersk Developer Portal](https://developer.maersk.com/)
2.  **Register/Log In.**
3.  **Create App:** Select "Consumer" access for **Spot Rates API**.
4.  **Get Keys:** Copy your `Consumer Key` and `Consumer Secret`.
5.  **Paste into:** `backend/.env` -> `MAERSK_CONSUMER_KEY` & `MAERSK_CONSUMER_SECRET`.

### 🚢 CMA CGM (Partner API)
1.  **Go to:** [CMA CGM API Portal](https://apis.cma-cgm.net/)
2.  **Register:** Request access to **Pricing/Route API**.
3.  **Get Key:** Copy your `API Key`.
4.  **Paste into:** `backend/.env` -> `CMA_API_KEY`.

### ⚓ SeaRates (Aggregator Fallback)
1.  **Go to:** [SeaRates Developer](https://www.searates.com/reference/)
2.  **Get Key:** Sign up and copy your API Key.
3.  **Paste into:** `frontend/.env.local` -> `SEARATES_API_KEY`.

---

## 🚀 FINAL ACTIVATION
Once you have pasted these keys, run the **Supreme Pulse** to confirm 100% Status:

```powershell
conda run -n logistics_env python backend/supreme_pulse.py
```
