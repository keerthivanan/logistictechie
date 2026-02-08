# 🧠 The "True Ocean" Process Guide

This document defines the **"Think Wise"** strategy for building The Global Oracle. Every feature must pass through these four stages of the Alchemical Process.

## 1. The Principle of Reality (Design Phase)
**"Is this real?"**
Before writing code, we must verify the data source.
-   ❌ **Forbidden:** "Let's mock this for now."
-   ✅ **Required:** "Which API endpoint provides this exact data?"
-   **Action:** Verify API docs (Maersk/CMA) before creating the Pydantic model.

## 2. The Core Construction (Backend Phase)
**"Is it strictly typed?"**
Code must be rigid and precise.
-   **Strict Models:** Define Pydantic models in `schemas.py` that match the *exact* JSON response from the carrier.
-   **Direct Lines:** Service adapters (`maersk.py`) must call `httpx` and return Pydantic objects. No intermediate "fuzzy" dicts.
-   **Persistence:** Save to Postgres immediately via SQLAlchemy.

## 3. The Visual Harmony (Frontend Phase)
**"Does it feel alive?"**
The UI must be "Best of All Time".
-   **Loading:** Never show a blank screen. Use Skeleton loaders that match the final content shape.
-   **Motion:** Use `Framer Motion` for entering/exiting elements. nothing should "pop" into existence.
-   **State:** Handle all 3 states: `Loading`, `Data`, `Error` (Graceful).

## 4. The Verification (Quality Phase)
**"Is it the Truth?"**
-   **Console Check:** Open DevTools. Any red text? Fix it immediately.
-   **Network Check:** Verify the XHR request went to the backend and returned JSON.
-   **Latency Check:** Is it under 500ms? If not, why?

## 5. The Sovereign Execution (Operating Phase)
**"Is the environment legitimate?"**
To ensure "Best of All Time" stability, we use a dedicated Conda environment.
-   **Mandated Env:** `logistics_env`
-   **Protocol:** Always run backend commands via `conda run -n logistics_env`.
-   **Integrity:** Never use local `venv` or global python; maintain the Sovereign boundary.

---

## Current Roadmap Status
1.  ✅ **Foundation:** Real Backend & DB (Done)
2.  ✅ **Sovereign Intelligence:** Phase 7 Metrics & AI (Done)
3.  ✅ **Verification:** Connectivity & Schema Audit (Done)
4.  🚀 **Launch:** Production Deployment (Ready)
