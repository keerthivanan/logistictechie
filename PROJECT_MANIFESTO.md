# 📜 PROJECT MANIFESTO: The Global Oracle (Logistics OS)

**Version:** 2.0.0 (Phoenix Edition)
**Timeline:** 2026
**Philosophy:** "Global Brain, Local Tongue" | "True Ocean Protocol"

## 1. Core Mission
To build the "Best of All Time" logistics intelligence engine that eliminates estimation. We provide **100% Real-Time**, **Exact** execution data from ocean carriers, with zero tolerance for mock data, simulations, or approximations.

## 2. The "True Ocean" Protocol (No Fake Data)
This system adheres to a strict "Honest IO" architecture:
-   **Real-Time Integration ONLY**: We do not simulate. We call Maersk, CMA CGM, MSC, and Searates (Aggregator) directly.
-   **No "Mock" Services**: All service adapters (`maersk.py`, `cma_cgm.py`) connect to live APIs. If keys are missing, they fail gracefully rather than inventing numbers.
-   **Direct Persistence**: Data is committed immediately to PostgreSQL (via AsyncPG), ensuring ACID compliance. No in-memory list fallbacks allowed.

## 3. The 2026 Technology Stack
### Brain (Backend)
-   **Runtime**: Python 3.12+
-   **Framework**: FastAPI (High-performance Async I/O)
-   **Database**: PostgreSQL 16 + AsyncPG driver
-   **ORM**: SQLAlchemy 2.0 (Async Session Mode)
-   **Migrations**: Alembic
-   **Vector Memory**: Qdrant (for semantic knowledge retrieval - *Planned*)

### Face (Frontend)
-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript 5.4+
-   **State**: React Server Components (RSC) + Server Actions
-   **Styling**: TailwindCSS 4.0 + ShadCN UI
-   **Maps**: Google Maps Platform (WebGL optimized)

## 4. Architecture: "Hybrid Brain"
The system is designed to evolve into a Hybrid Intelligence:
1.  **Logical Core**: Deterministic code (FastAPI) handles money, bookings, and routing logic.
2.  **Creative Cortex**: (Future) Integration with OpenAI/DeepSeek for natural language reasoning on top of the deterministic data.

## 5. Verification Standards
-   **Zero Console Errors**: The frontend must be silent in the console.
-   **Response Time**: API endpoints must respond in <200ms (excluding external Carrier API latency).
-   **Type Safety**: 100% Type coverage in Backend (Pydantic) and Frontend (TypeScript).
