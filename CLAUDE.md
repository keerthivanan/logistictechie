# CLAUDE.md — CargoLink Project Rules

## WHO YOU ARE
Senior engineer on a production freight logistics platform. Fix only what's asked. No fluff, no summaries, no extra refactoring. Every response must be the shortest path to the correct solution.

## TOKEN EFFICIENCY — MANDATORY
- **No trailing summaries.** Never list what you just did at the end of a response.
- **No preamble.** Don't say "I'll now..." — just do it.
- **One sentence max** for status updates. Lead with the action.
- **Read before editing.** One targeted read, not multiple exploratory reads.
- **Parallel tool calls always** when calls are independent.
- If it can be said in one line, never use three.

---

## PROJECT: CargoLink
Freight logistics marketplace. Shippers post requests → forwarders quote → platform matches them → shipper negotiates and books via chat.

**Stack:**
- Backend: FastAPI + SQLAlchemy async + Neon PostgreSQL + Redis (Railway) — deployed on Railway
- Frontend: Next.js 14 App Router + TypeScript + Tailwind CSS — deployed on Vercel
- Automation: n8n self-hosted v2.12.3 at `n8n.srv1520651.hstgr.cloud` (Hostinger VPS)
- Auth: JWT (15-min access + refresh token) + Redis blacklist + `pw_changed_at` session invalidation

---

## CRITICAL BUGS — ALREADY BITTEN, NEVER REPEAT

### Redis — decode_responses=True
- Set in `backend/app/core/redis.py` — all values are **already strings**
- NEVER call `.decode()` — `int(value.decode())` → must be `int(value)`

### n8n Webhooks typeVersion 1.1
- Body is wrapped: `{ body: { ...actual_data... } }`
- Always unwrap: `const data = raw.body || raw` — never assume flat

### n8n IF Nodes typeVersion 2
- MUST include `options: { caseSensitive: false, leftValue: '', typeValidation: 'loose', version: 2 }`
- Missing `options` crashes: `Cannot read properties of undefined (reading 'caseSensitive')`

### PostgreSQL in n8n — Empty Result = 1 Row
- A `SELECT` returning 0 rows still outputs **1 empty row** in n8n
- Never check `$input.all().length > 0` — always check `string.notEmpty` on `$json.field_name`

### Python datetime naive/aware
- DB stores naive UTC datetimes (`.replace(tzinfo=None)`)
- Never subtract naive from `datetime.now(timezone.utc)` — normalize first:
  ```python
  received = dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
  diff = datetime.now(timezone.utc) - received
  ```

### GPT price extraction (WF2)
- AI returns strings like `"USD 1200"` — always `parseFloat(String(price).replace(/[^0-9.]/g, ''))`
- Validate range: `if (isNaN(price) || price <= 0 || price > 10000000) throw new Error(...)`

### Forwarder Portal Chat — Auth via Headers, NOT Body
- All portal POST endpoints in `forwarder_conversations.py` use `X-Forwarder-Id` + `X-Forwarder-Email` headers
- NEVER put `forwarder_id`/`email` in the request body for these endpoints
- Frontend sends: `headers: { 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail }`
- Body contains only the action data: `{ content }`, `{ action, counter_amount? }`, or empty

### n8n API — Use REST Session, NOT API Key
- Deploy script uses `POST /rest/login` with `emailOrLdapLoginId` field → session cookie
- Update workflow: `PATCH /rest/workflows/{id}` (NOT PUT, NOT `/api/v1/`)
- Activate: `PATCH /rest/workflows/{id}` with `{ active: true }` + full workflow object
- Run: `node deploy_n8n.js Keerthimaster1` from project root

---

## IDENTITY SYSTEM — FORWARDER IDs

```
User registers        → sovereign_id = OMEGO-XXXX,     role = user
Forwarder form submit → Forwarder record created,       forwarder_id = REG-OMEGO-XXXX, status = PENDING
Admin approves        → user.role = forwarder,          user.sovereign_id = REG-OMEGO-XXXX
```

- `users.sovereign_id` — before: `OMEGO-XXXX`, after approval: `REG-OMEGO-XXXX`
- `forwarders.forwarder_id` — always `REG-{original_sovereign_id}`
- `ForwarderBidStatus.forwarder_id` stores `forwarders.forwarder_id`, NOT `users.sovereign_id`
- To query bids: **always look up `forwarders` table by email first to get forwarder_id**
- Portal stores forwarder_id in `localStorage.cl_fwd_id` — set at portal login

---

## AUTH SYSTEM

**Shipper/Admin (JWT):**
```
Login → JWT (15 min) + Refresh token → stored in localStorage.token
Every request → deps.py: validate JWT + check Redis blacklist + check pw_changed_at
401 → AuthContext calls logout() → clears localStorage → redirect to /login
```

**Forwarder Portal (no JWT):**
```
POST /api/forwarders/auth  { forwarder_id, email } → validates against forwarders table (status=ACTIVE)
On success → localStorage.cl_fwd_id + cl_fwd_email
All requests → X-Forwarder-Id + X-Forwarder-Email headers
```

**JWT-Forwarder on dashboard:**
```
user.role === 'forwarder' + JWT → dashboard/messages/[id] redirects to /forwarders/chat/{id}
Before redirect: sets localStorage.cl_fwd_id = user.forwarder_id || user.sovereign_id
```

- `get_current_user` → `backend/app/api/deps.py`
- `get_admin_user` → checks `ADMIN_EMAIL` env var = `keerthivanan.ds.ai@gmail.com`

---

## DUAL-PATH QUOTATION SYSTEM

Both paths write to `quotations` table (`MarketplaceBid`). Either path is sufficient — forwarder does NOT need both.

- **Path A (Email)**: Forwarder replies to WF1 → WF2 Gmail trigger → AI extracts price → PostgreSQL upsert
- **Path B (Portal)**: Forwarder → `/forwarders/portal` → submits price → `POST /api/forwarders/portal-bid`
- **quotation_id format**: Email = `{request_id}-{fwd_suffix}`, Portal = `PORTAL-{forwarder_id}-{request_id}`
- **Dedup**: Both paths cross-check `(request_id, forwarder_id)` — blocks double submission

---

## CONVERSATION FLOW (Negotiation State Machine)

```
start → OPEN
  shipper sends offer → offer_side = 'SHIPPER', current_offer = amount
  forwarder accepts → agreed_price = current_offer, offer_side = null
  forwarder counters → offer_side = 'FORWARDER', current_offer = counter
  shipper accepts counter → agreed_price = current_offer, offer_side = null
  
  either party → confirm-booking → sets their book_req = true
  both book_req = true → status = BOOKED, Booking record created, WF6 fired
  
  either party → close → sets their close_req = true  
  both close_req = true → status = CLOSED, request closed, other convs closed
```

- `offer_side = 'SHIPPER'` → forwarder's turn to respond
- `offer_side = 'FORWARDER'` → shipper must accept or counter
- Shipper min offer = 80% of original_price (`MIN_OFFER_RATIO = 0.80`)

---

## REAL-TIME POLLING MAP

| Component | Polls | Interval | Why |
|-----------|-------|----------|-----|
| `dashboard/layout.tsx` | `/api/dashboard/notifications/` | 15s | Bell badge |
| `dashboard/layout.tsx` | `/api/conversations/unread-count` | 10s | Messages badge |
| `dashboard/page.tsx` | `/api/dashboard/stats/me` | 30s | Metric cards |
| `dashboard/shipments/page.tsx` | `/api/marketplace/my-requests` | 10s | New quotes appear live |
| `dashboard/messages/page.tsx` | `/api/conversations/` | 10s | New threads |
| `dashboard/messages/[id]/page.tsx` | `/api/conversations/{id}/messages` | 3s | Live chat |
| `forwarders/chat/[id]/page.tsx` | `/api/forwarders/conversations/{id}/messages` | 3s | Live chat |
| `forwarders/portal/page.tsx` | `/api/forwarders/portal-dashboard/{id}` | 15s | New freight requests |

---

## EMAIL ROUTING — NEVER SWAP

| From | Used For |
|------|----------|
| `quote@cargolink.sa` | Outbound to forwarders: freight broadcasts (WF1), bid confirmations (WF_BID_CONFIRM) |
| `support@cargolink.sa` | Everything else: welcome, password reset, shipper emails, admin decisions, booking confirmed, new conversation |

**Why**: Forwarders reply to `quote@` so WF2 Gmail trigger captures their reply. Shipper emails from `quote@` would pollute the WF2 inbox.

---

## N8N WORKFLOWS — QUICK REFERENCE

| ID | Trigger | Purpose |
|----|---------|---------|
| WF1 | `POST /webhook/marketplace-submit` | Broadcast request to matching forwarders via `quote@` |
| WF2 | Gmail trigger on `quote@` inbox | Parse forwarder reply → save to `quotations` table |
| WF3 | Execute Workflow (from WF2 at 3rd quote) | Send comparison email to shipper via `support@` |
| WF4 | `POST /webhook/forwarder-register` | Save forwarder application → notify admin |
| WF5 | `POST /webhook/forwarder-decision` | Send approval/rejection email to forwarder via `support@` |
| WF6 | `POST /webhook/booking-confirmed` | Booking confirmation to both parties via `support@` |
| WF7 | `POST /webhook/new-conversation` | Notify forwarder when shipper opens chat via `support@` |
| WF_BID_CONFIRM | `POST /webhook/bid-confirmation` | Confirm portal bid to forwarder via `quote@` |
| WF_PASSWORD_RESET | `POST /webhook/password-reset` | Reset link or password-changed security alert via `support@` |
| WF_WELCOME | `POST /webhook/user-welcome` | Welcome email to new shipper via `support@` |

---

## KEY FILE LOCATIONS

```
backend/app/api/deps.py                     — Auth (get_current_user, verify_n8n_webhook)
backend/app/api/routers/auth.py             — Login, register, refresh, password reset
backend/app/api/routers/admin.py            — Admin: approve/reject forwarder, stats
backend/app/api/routers/forwarders.py       — Forwarder: portal auth, portal-bid, my-bids, dashboard
backend/app/api/routers/marketplace.py      — Shipper: submit request, my-requests + quotations with forwarder_last_seen
backend/app/api/routers/dashboard.py        — Stats, activity, notifications endpoint
backend/app/api/routers/conversations.py    — Shipper chat (JWT auth)
backend/app/api/routers/forwarder_conversations.py — Forwarder chat (header auth: X-Forwarder-Id/Email)
backend/app/api/routers/quotes.py           — Quote endpoints
backend/app/services/webhook.py             — All n8n webhook dispatch methods
backend/app/core/redis.py                   — Redis client (decode_responses=True)
backend/.env                                — All secrets and webhook URLs

frontend/src/context/AuthContext.tsx        — JWT storage, fetchProfile, logout on 401
frontend/src/lib/config.ts                  — apiFetch() helper, API base URL
frontend/src/app/dashboard/layout.tsx       — Nav, notification bell, polling (15s notifs, 10s unread)
frontend/src/app/dashboard/page.tsx         — Main dashboard (30s poll)
frontend/src/app/dashboard/shipments/page.tsx — Shipments + quotes (10s poll, online indicator)
frontend/src/app/dashboard/messages/page.tsx  — Conversations list (10s poll)
frontend/src/app/dashboard/messages/[id]/page.tsx — Shipper chat (3s poll, redirects forwarders)
frontend/src/app/dashboard/partner/page.tsx — Forwarder partner dashboard (JWT)
frontend/src/app/dashboard/tasks/page.tsx   — Tasks page
frontend/src/app/dashboard/activity/page.tsx — Activity log
frontend/src/app/dashboard/_components/OpenRequestsPanel.tsx — Requests panel (online indicator)
frontend/src/app/forwarders/portal/page.tsx — Forwarder portal (no JWT, 15s poll)
frontend/src/app/forwarders/chat/[id]/page.tsx — Forwarder chat (header auth, 3s poll)
frontend/src/app/forwarders/register/page.tsx — Forwarder registration form
frontend/src/app/forwarders/success/page.tsx  — Post-registration: pending or approved screen

deploy_n8n.js   — Auto-deploys all 10 n8n workflows. Run: node deploy_n8n.js Keerthimaster1
```

---

## ENV VARS — REQUIRED

```
DATABASE_URL                    Neon PostgreSQL connection string
REDIS_URL                       Redis connection string
SECRET_KEY                      JWT signing key
OMEGO_API_SECRET                n8n webhook auth secret (Bearer + X-OMEGO-Auth header)
ADMIN_EMAIL                     keerthivanan.ds.ai@gmail.com
FRONTEND_URL                    https://cargolink.sa (used in email links)
N8N_FORWARDER_REGISTER_WEBHOOK  https://n8n.srv1520651.hstgr.cloud/webhook/forwarder-register
N8N_MARKETPLACE_SUBMIT_WEBHOOK  https://n8n.srv1520651.hstgr.cloud/webhook/broadcast-request
N8N_FORWARDER_DECISION_WEBHOOK  https://n8n.srv1520651.hstgr.cloud/webhook/forwarder-decision
N8N_BOOKING_WEBHOOK             https://n8n.srv1520651.hstgr.cloud/webhook/booking-confirmed
N8N_QUOTES_COMPLETE_WEBHOOK     https://n8n.srv1520651.hstgr.cloud/webhook/quotes-complete
N8N_NEW_CONVERSATION_WEBHOOK    https://n8n.srv1520651.hstgr.cloud/webhook/new-conversation
N8N_BID_CONFIRMATION_WEBHOOK    https://n8n.srv1520651.hstgr.cloud/webhook/bid-confirmation
N8N_PASSWORD_RESET_WEBHOOK      https://n8n.srv1520651.hstgr.cloud/webhook/password-reset
N8N_WELCOME_WEBHOOK             https://n8n.srv1520651.hstgr.cloud/webhook/user-welcome
```

---

## DATABASE MODELS — KEY RELATIONSHIPS

```
User.sovereign_id              → MarketplaceRequest.user_sovereign_id
User.email                     → Forwarder.email (same person, two records)
Forwarder.forwarder_id         → ForwarderBidStatus.forwarder_id + MarketplaceBid.forwarder_id
MarketplaceRequest.request_id  → MarketplaceBid.request_id + ForwarderBidStatus.request_id + Conversation.request_id
MarketplaceBid.quotation_id    → Conversation.quote_id
Conversation.public_id         → used in all chat URLs (/dashboard/messages/{id}, /forwarders/chat/{id})
Conversation.shipper_id        → User.sovereign_id (shipper)
Conversation.forwarder_id      → Forwarder.forwarder_id
```

---

## CODING RULES

- **Read the file before editing.** Never assume current state.
- **Fix the bug only.** Don't refactor, clean up, or add comments to surrounding code.
- **No new files** unless strictly required (never create helper files for one-time use).
- **Async SQLAlchemy**: always `await db.execute(...)`, always `.scalars().first()` or `.scalars().all()`.
- **Background tasks for all webhook calls** — never `await` them inline in request handlers.
- **`activity_service.log()`** always in `try/except` — never let it crash a request.
- **Forwarder online indicator**: `isOnline(lastSeen)` = `(Date.now() - new Date(lastSeen + 'Z').getTime()) < 120000`
- **n8n changes** → run `node deploy_n8n.js Keerthimaster1` immediately — never ask user to import manually.
- **If a new n8n workflow is needed**, say so explicitly — don't silently add a webhook call with no WF.
