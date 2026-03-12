# OMEGO — AI-Powered Freight Forwarding Marketplace

> **Connecting shippers with the world's best freight forwarders through AI automation.**

---

## 📌 Problem Statement

International freight shipping is **broken for small and medium businesses**:

| Problem | Impact |
|---|---|
| **No price transparency** | Rates hidden behind "email us for a quote" |
| **No competition** | Shippers contact 1-2 known forwarders, overpaying by 15-40% |
| **Painfully slow** | Getting one quote takes 24-72 hours of emails |
| **No standardization** | Every forwarder quotes differently (PDF, text, Excel) |
| **100% manual** | No automation for broadcasting, collection, or comparison |

**Who suffers?**
- Indian exporters/importers paying premium rates
- First-time shippers who don't know HS codes, Incoterms, or surcharges
- Freight forwarders missing opportunities outside their network
- Logistics managers comparing quotes manually in spreadsheets

---

## 💡 Solution — OMEGO

OMEGO automates the **entire freight quoting lifecycle** using AI:

```
Shipper submits request
        ↓
n8n WF1 broadcasts to matching forwarders via email
        ↓
Forwarders reply with quotes (plain email)
        ↓
n8n WF2 uses GPT-4o to extract structured data from emails
        ↓
After 3 quotes arrive → WF3 auto-closes the request
        ↓
Shipper receives a comparison email with all 3 quotes
        ↓
Shipper picks the best option and books
```

### What Makes OMEGO Different

1. **AI-Powered Quote Extraction** — Forwarders just reply to an email. GPT-4o extracts price, transit time, carrier, surcharges automatically
2. **3-Quote Auto-Close** — Creates urgency and competition. First 3 to respond win
3. **Instant Rate Engine** — AI-predicted freight rates before formal submission
4. **Sanctions Screening** — 10 OFAC/EU sanctioned countries checked automatically
5. **Real Maersk Data** — Ports, commodities, vessels, HS codes from live Maersk APIs
6. **Zero Mock Data** — Everything is real. TRUE_OCEAN_PROTOCOL

---

## 🏗️ Technical Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, Tailwind CSS, shadcn/ui (34 pages, 20 components) |
| **Backend** | FastAPI (Python 3.12+), Async SQLAlchemy (51 API endpoints) |
| **Database** | Neon PostgreSQL Serverless (11 tables) |
| **AI Engine** | OpenAI GPT-4o (quote extraction + instant rates) |
| **Automation** | n8n (3 workflows, 60 nodes total) |
| **Email** | Gmail OAuth (2 accounts: Quotes + Support) |
| **Auth** | JWT + Google OAuth + bcrypt |
| **Security** | Redis rate limiting, CORS, security headers, webhook auth |
| **External APIs** | Maersk Locations, Commodities, Vessels |

### System Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FRONTEND   │────▶│   BACKEND    │────▶│  DATABASE    │
│  Next.js 15  │     │   FastAPI    │     │ Neon Postgres│
│  34 pages    │     │ 51 endpoints │     │  11 tables   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────▼───────┐
                    │  n8n ENGINE  │
                    │ 3 Workflows  │
                    └──┬───┬───┬──┘
                       │   │   │
              ┌────────┘   │   └────────┐
              ▼            ▼            ▼
         ┌────────┐  ┌─────────┐  ┌─────────┐
         │  WF1   │  │   WF2   │  │   WF3   │
         │Broadcast│  │AI Quote │  │Auto-Close│
         │16 nodes │  │29 nodes │  │15 nodes │
         └────────┘  └─────────┘  └─────────┘
              │            │            │
              ▼            ▼            ▼
         ┌────────┐  ┌─────────┐  ┌─────────┐
         │ Gmail  │  │ GPT-4o  │  │ Gmail   │
         │  Send  │  │ Extract │  │Compare  │
         └────────┘  └─────────┘  └─────────┘
```

---

## 📊 Platform Statistics

| Metric | Count |
|---|---|
| **Frontend Pages** | 34 |
| **UI Components** | 20 |
| **Backend Endpoints** | 51 |
| **Database Tables** | 11 |
| **n8n Workflow Nodes** | 60 |
| **Security Layers** | 5 |
| **External APIs** | 3 |
| **Total Logic Units** | 107+ |

---

## 🔧 Backend API — 51 Endpoints

### Auth (`/api/auth`) — 9 endpoints
- Google OAuth social sync
- Email/password login with JWT + refresh tokens
- User registration with duplicate detection
- Profile read/update
- Logout with Redis token blacklisting
- Password change and forgot password

### Marketplace (`/api/marketplace`) — 11 endpoints
- Submit freight request (with role gatekeeper — blocks forwarders)
- View user's requests with nested quotations
- Request detail with full quote data
- n8n sync endpoints: request-sync, quotations/new, requests/close, bid-status-sync

### Forwarders (`/api/forwarders`) — 7 endpoints
- Partner registration and activation
- Active forwarder listing
- Self-promotion (user → forwarder upgrade)
- Passwordless forwarder login with brute-force lockout
- Bid history and dashboard

### Dashboard (`/api/dashboard`) — 4 endpoints
- Real-time stats (active requests, total quotes, win rate, savings)
- Full activity audit log with pagination
- Lead capture (Book Demo / Start Trial)
- Market ticker (SCFI indices)

### Instant Quotes (`/api/quotes`) — 1 endpoint
- AI-powered instant freight rates using GPT-4o-mini
- Trade lane detection (Asia, Europe, Middle East, Americas)
- Container size multipliers (20FT, 40FT, 40HC, 45HC, LCL)
- Deterministic fallback if AI unavailable

### Freight Tools (`/api/tools`) — 2 endpoints
- **Freight Estimate Calculator**: Base rate + surcharges (BAF, CAF, PSS, ECA, congestion) + customs duties + insurance + sanctions check
- **HS Code Classifier**: Live Maersk commodity catalogue (5,529 items), word-boundary scoring, 24h caching

### Reference Data (`/api/references`) — 5 endpoints
- Port search (Maersk Live API)
- Commodity search
- Vessel search
- Market indices
- Sailing schedules

### Tasks (`/api/tasks`) — 3 endpoints
- User task list, toggle status, create task

---

## 🤖 n8n Automation Workflows

### WF1 — Broadcast Request to Forwarders (16 nodes)
```
Webhook Trigger → Read Request → Read User → Read Forwarders
    → Filter by Specialization → Build HTML Email → Send via Gmail
    → Log Broadcast → Log Bid Status → Create Summary
    → Send User Confirmation → Log Event → Webhook Response
```

### WF2 — AI Quotation Processing (29 nodes)
```
Gmail Trigger (every minute) → Extract Request ID from Subject
    → Verify Forwarder in DB
        ├─ NOT FOUND → Send "Registration Required" email
        └─ FOUND → Check Request Status
            ├─ CLOSED → Send "Request Closed" email
            └─ OPEN → Count Existing Quotes
                ├─ ≥ 3 → Send "DECLINED" email → Log DECLINED
                └─ < 3 → Check Duplicate
                    ├─ DUPLICATE → Log DUPLICATE → Log Rejected
                    └─ NEW → GPT-4o Extract Quotation → Validate AI Output
                        → Save Quotation → Update Count → Update Bid Status
                        → Check if 3 Quotes Reached
                            ├─ YES → Trigger WF3 (Auto-Close)
                            └─ BOTH → Get User Email → Notify User + Confirm Forwarder
```

### WF3 — Auto-Close After 3 Quotes (15 nodes)
```
Execute Workflow Trigger → Close Request (status=CLOSED)
    → Get All 3 Quotations (sorted by price) → Get User
    → Build Comparison Email (cheapest + fastest badges)
    → Send Comparison to User → Get Non-Quoting Forwarders
        ├─ NON-QUOTERS EXIST → Notify Non-Quoters
        └─ BOTH → Update Forwarder Statuses (COMPLETED/EXPIRED)
            → Log Closure Event → Update Analytics (daily aggregates)
```

---

## 🗄️ Database Schema (11 Tables)

| Table | Purpose | Key Fields |
|---|---|---|
| `users` | User accounts | id, email, sovereign_id, full_name, role |
| `forwarders` | Logistics partners | forwarder_id, company_name, specializations, routes, status |
| `requests` | Freight RFQs | request_id, origin, destination, cargo_type, quotation_count, status |
| `quotations` | Price quotes | quotation_id, request_id, forwarder_id, total_price, transit_days, ai_summary |
| `forwarder_bid_status` | Bid tracking | request_id, forwarder_id, status (PENDING/ANSWERED/DECLINED/EXPIRED) |
| `tasks` | Onboarding checklist | user_id, title, status |
| `user_activities` | Full audit log | user_id, action, entity_type, metadata |
| `n8n_events_logs` | Workflow events | event_type, request_id, description |
| `n8n_broadcast_logs` | Email records | request_id, forwarder_id, email_sent |
| `n8n_analytics` | Daily aggregates | date, requests_closed, total_quotations |
| `rejected_attempts` | Security log | sender_email, request_id, error_type |

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **CORS** | Whitelisted origins only |
| **Rate Limiting** | Redis sliding window (per IP, 60-second window) |
| **Security Headers** | HSTS, X-Frame-Options, XSS Protection, Content-Type-Options |
| **n8n Webhook Auth** | `OMEGO_API_SECRET` verification on all bridge endpoints |
| **Brute-Force Protection** | 5-attempt lockout on forwarder portal (15 min cooldown) |
| **JWT Security** | Access + refresh tokens with Redis blacklisting on logout |
| **Password Security** | bcrypt hashing with salt |

---

## 🌐 Frontend Pages (34)

| Category | Pages |
|---|---|
| **Core** | Home, About, Contact, Demo, Help |
| **Auth** | Login, Signup |
| **Marketplace** | Search, Results, Marketplace, Marketplace/[id] |
| **Booking** | Booking, Booking/Confirmation |
| **Dashboard** | Dashboard, Activity, Shipments, Tasks, Partner |
| **Forwarders** | Listing, Portal, Register, Success |
| **Tools** | Freight Calculator, HS Code Classifier |
| **User** | Profile, Settings |
| **Services** | Services/[slug], Coming Soon |
| **Legal** | Terms, Privacy, Cookies, MSA |
| **Other** | Carriers, Tracking |

---

## ✅ Current Status

**Platform completion: 85-90%**

### What's Working
- ✅ Full frontend (34 pages, zero build errors)
- ✅ Backend API (51 endpoints, all tested)
- ✅ Database (11 tables on Neon PostgreSQL, pooler endpoint)
- ✅ Auth system (Google OAuth + Email/Password)
- ✅ Instant quotes (GPT-4o powered)
- ✅ Freight calculator with sanctions screening
- ✅ HS code classifier (5,529 Maersk items)
- ✅ Port/commodity/vessel search (Maersk Live)
- ✅ n8n workflows (3/3 verified, WF2 bug fixed)
- ✅ 5 security layers active

### What's Remaining
| Task | Effort |
|---|---|
| Connect Gmail OAuth credentials in n8n | < 1 day |
| Import fixed WF2 JSON into live n8n | 2 minutes |
| End-to-end live test | 1-2 hours |
| Production deployment (Vercel + backend) | 1-2 days |
| Domain + SSL setup | < 1 day |

---

## 🚀 Future Enhancements

1. **Google Form Partner Onboarding** — Self-service registration via Google Form + Stripe payment
2. **Real-time WebSocket Dashboard** — Live quote notifications
3. **WhatsApp Integration** — Quote notifications via WhatsApp Business API
4. **Multi-currency Support** — Auto-convert rates based on user preference
5. **Rating System** — Shippers rate forwarders after shipment completion
6. **Mobile App** — React Native companion app

---

## 📁 Project Structure

```
logistics/
├── backend/
│   ├── app/
│   │   ├── api/routers/        # 8 API routers (auth, marketplace, dashboard, etc.)
│   │   ├── core/               # Config, security, Redis
│   │   ├── db/                 # SQLAlchemy session + models
│   │   ├── models/             # ORM models (User, Forwarder, Request, etc.)
│   │   ├── services/           # Webhook, activity logging
│   │   └── crud/               # Database operations
│   ├── .env                    # Environment variables
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                # 34 Next.js pages (App Router)
│   │   ├── components/         # 20 React components
│   │   ├── context/            # AuthContext (JWT + Google OAuth)
│   │   └── lib/                # Config + utilities
│   ├── public/                 # Static assets + sitemap
│   └── package.json            # Node dependencies
├── n8n_plan/
│   ├── WF1_OMEGO_Broadcast_Request.json
│   ├── WF2_OMEGO_Process_Quotations.json
│   └── WF3_OMEGO_Auto_Close.json
└── PROJECT_REPORT.md           # This file
```

---

**Built with ❤️ by Keerthivanan | OMEGO © 2026**
