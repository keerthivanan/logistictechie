# AGENTS.md — CargoLink n8n Automation Rules

## INFRASTRUCTURE
- **n8n host**: `https://n8n.srv1520651.hstgr.cloud` (Hostinger VPS, self-hosted v2.12.3)
- **n8n credentials**: email = `keerthivanan.ds.ai@gmail.com`, password in `deploy_n8n.js`
- **n8n API auth**: Session cookie (NOT API key) — login via `POST /rest/login`
- **Deploy script**: `node deploy_n8n.js Keerthimaster1` — handles login, update, activate for all 10 workflows
- **Gmail accounts**: `quote@cargolink.sa` | `support@cargolink.sa`
- **Backend webhook auth**: All inbound webhooks validated via `OMEGO_API_SECRET` (Bearer + `X-OMEGO-Auth` header)

---

## N8N API — CORRECT METHODS (learned the hard way)

```
Login:      POST  /rest/login            body: { emailOrLdapLoginId, password }
                                          MUST use 'emailOrLdapLoginId' NOT 'email'
Get WF:     GET   /rest/workflows/{id}   with session cookie
Update WF:  PATCH /rest/workflows/{id}   with session cookie + full workflow object
Activate:   PATCH /rest/workflows/{id}   body: { active: true } + full workflow object
Create WF:  POST  /rest/workflows        with session cookie
Archive WF: POST  /rest/workflows/{id}/archive
Delete WF:  DELETE /rest/workflows/{id}
```

**NEVER use**: `PUT /rest/workflows/{id}` (404), `POST /rest/workflows/{id}/activate` (400 versionId required), `/api/v1/` paths

---

## EMAIL ROUTING — ABSOLUTE RULE

| Sender | Used For |
|--------|----------|
| `quote@cargolink.sa` | Outbound to **forwarders only**: freight broadcasts (WF1), bid confirmations (WF_BID_CONFIRM) |
| `support@cargolink.sa` | Everything else: welcome, password reset, shipper emails, booking confirmed, forwarder decision, new conversation alerts |

**Why**: Forwarders reply to `quote@` — WF2 Gmail trigger watches that inbox. Any non-forwarder email from `quote@` pollutes the WF2 trigger and causes false processing.

### Gmail OAuth Credential IDs (n8n internal)
- `quote@cargolink.sa` → credential ID: `eYtkasWvTHeG4DMV`
- `support@cargolink.sa` → credential ID: `QYlpY7lFFdn2TQhy`

---

## WF1 — Freight Broadcast
- **Trigger**: `POST /webhook/marketplace-submit` (backend fires after shipper submits request)
- **Flow**: Receive request → `GET /api/forwarders/active` → filter by cargo_type → send broadcast email to each forwarder from `quote@`
- **Cargo type matching** (against `forwarder.specializations` field):
  - `Sea` / `Ocean FCL` / `Ocean LCL` → match `ocean`
  - `Air` → match `air`
  - `Land` / `Road` → match `road` or `land`
  - `Rail` → match `rail`
- **Reply-to**: Must be `quote@cargolink.sa` so forwarder replies go to the WF2 inbox
- **Webhook typeVersion**: 1.1 — access body as `$json.body.field_name`

---

## WF2 — Quote Processor (Gmail → DB)
- **Trigger**: Gmail trigger on `quote@cargolink.sa` every minute
- **Gmail filter**: `q: 'subject:REQ- -from:mailer-daemon -from:postmaster -from:noreply'`
- **Flow**: Gmail trigger → Code node (extract REQ-XXXX + price) → PostgreSQL lookup → 5 IF nodes → Save quotation → IF 3rd quote → Execute WF3

### IF Nodes — All typeVersion 2, all with `options: { caseSensitive: false, leftValue: '', typeValidation: 'loose', version: 2 }`
| Node | Check | Operator |
|------|-------|----------|
| Forwarder Exists? | `$json.forwarder_id` | `string.notEmpty` |
| Request is OPEN? | `$json.status` = `OPEN` | `string.equals` |
| Less than 3 Quotes? | `Number($json.existing_count)` < `3` | `number.lt` |
| Not Duplicate? | `Number($json.duplicate_count)` = `0` | `number.equals` |
| Reached 3 Quotes? | `Number($json.quotation_count)` >= `3` | `number.gte` |

### Code Node — Price Extraction
```javascript
const raw = $input.first().json;
const data = raw.body || raw;
// AI returns prices as strings like "USD 1200" — always sanitize:
var price = parseFloat(String(extractedData.total_price).replace(/[^0-9.]/g, ''));
if (isNaN(price) || price <= 0 || price > 10000000) {
  throw new Error('Invalid total_price: ' + extractedData.total_price);
}
extractedData.total_price = price;
```

### PostgreSQL Empty Row Gotcha
- `SELECT` returning 0 results still outputs **1 empty row** in n8n
- Check `$json.forwarder_id` with `string.notEmpty`, NOT `$input.all().length`

---

## WF3 — Auto Close + Comparison Email
- **Trigger**: Execute Workflow (called by WF2 when 3rd quote arrives) OR direct webhook
- **Flow**: Fetch all 3 quotes for request → format comparison table → send email to shipper from `support@`
- **Also triggered by**: Backend `trigger_quotes_complete_webhook` when 3rd quote arrives via portal

---

## WF4 — Forwarder Registration
- **Trigger**: `POST /webhook/forwarder-register`
- **Flow**: Receive forwarder data → log to Google Sheets → save via `POST /api/forwarders/save` → notify admin
- **Auth**: Sends `OMEGO_API_SECRET` as Bearer token to backend
- **Webhook typeVersion**: 1.1

---

## WF5 — Forwarder Decision Email
- **Trigger**: `POST /webhook/forwarder-decision`
- **Payload**: `{ decision: "APPROVED" | "REJECTED", company_name, email, new_sovereign_id }`
- **Flow**: IF node on `decision` → approved path or rejected path → email from `support@`
- **IF node**: Both Gmail nodes MUST use `support@` credential — never `quote@`
- **IF options**: MUST have `caseSensitive: false, typeValidation: 'loose', version: 2`

---

## WF6 — Booking Confirmed
- **Trigger**: `POST /webhook/booking-confirmed`
- **Payload**: `reference, user_email, forwarder_email, forwarder_company, total_price, currency, origin, destination, transit_days`
- **Flow**: Sends confirmation email to BOTH shipper and forwarder from `support@`

---

## WF7 — New Conversation
- **Trigger**: `POST /webhook/new-conversation`
- **Payload**: `forwarder_email, company_name, shipper_name, request_id, origin, destination, conversation_url`
- **Webhook typeVersion**: 1.1 — access via `$json.body.forwarder_email`
- **Flow**: Sends email to forwarder from `support@` with link to `/forwarders/chat/{id}`

---

## WF_BID_CONFIRM — Portal Bid Confirmation
- **Trigger**: `POST /webhook/bid-confirmation`
- **Payload**: `forwarder_email, forwarder_company, forwarder_id, request_id, origin, destination, price, currency, submitted_at`
- **Flow**: Sends confirmation to forwarder from `quote@` (NOT support@)

---

## WF_PASSWORD_RESET — Password Reset
- **Trigger**: `POST /webhook/password-reset`
- **Payload**: `{ email, full_name, reset_url, is_confirmation: bool }`
  - `is_confirmation = false` → send reset link email
  - `is_confirmation = true` → send "your password was changed" security alert
- **IF node**: Check `branch` field (`reset` vs `security`) with `string.equals`
- **Both paths**: Send from `support@`

---

## WF_WELCOME — New User Welcome
- **Trigger**: `POST /webhook/user-welcome`
- **Webhook node**: Must have `webhookId: 'cargolink-user-welcome'` to avoid path conflicts
- **Payload**: `email, full_name, company_name, sovereign_id, registered_at`
- **Flow**: Sends welcome email from `support@`
- **Body access**: `const d = $json.body || $json` (typeVersion 1.1 wrapping)

---

## N8N GENERAL RULES

### Webhook Body Access Template
```javascript
const raw = $input.first().json;
const data = raw.body || raw;  // typeVersion 1.1 wraps body
```

### IF Node Template (typeVersion 2) — copy-paste this every time
```json
{
  "typeVersion": 2,
  "parameters": {
    "conditions": {
      "combinator": "and",
      "conditions": [{
        "id": "unique-uuid-here",
        "leftValue": "={{ $json.field_name }}",
        "rightValue": "expected_value",
        "operator": { "type": "string", "operation": "equals", "name": "filter.operator.equals" }
      }],
      "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose", "version": 2 }
    }
  }
}
```

### Deploying Changes
1. Edit workflow JSON in `n8n_plan/` directory
2. `node deploy_n8n.js Keerthimaster1` — deploys all 10 workflows automatically
3. Never ask user to import manually
4. If a new workflow conflicts on webhook path: archive + delete the old one first, then activate

### Adding a New Workflow
- Add JSON file to `n8n_plan/`
- Add entry to `WORKFLOWS` array in `deploy_n8n.js`
- Add webhook URL env var to `backend/.env`
- Add trigger method to `backend/app/services/webhook.py`
- Test webhook receipt before activating in production

### PostgreSQL nodes in n8n
- Always `continueOnFail: true` so one DB error doesn't kill the whole workflow
- Use parameterized queries — never string concatenation
- Empty result = 1 empty row — always check field value, never array length
