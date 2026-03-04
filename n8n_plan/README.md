# 🎯 OMEGO n8n INTEGRATION - USING YOUR EXISTING POSTGRESQL DATABASE

## ✅ YOUR DATABASE IS PERFECT! (Already Complete)

You have:
- ✅ users table with sovereign_id (OMEGO-0001) 
- ✅ requests table with request_id (OMEGO-0001-REQ-01)
- ✅ quotations table with quotation_id
- ✅ forwarders table with forwarder_id
- ✅ All audit tables (n8n_broadcast_logs, n8n_analytics, n8n_events_logs, user_activities)

**Backend generates ALL IDs - n8n just reads and writes!**

---

## 🔄 CORRECT DATA FLOW

```
┌────────────────────────────────────────────────────────┐
│                  USER WEBSITE                          │
│                                                        │
│  User Registration → Backend → PostgreSQL             │
│    ├─ Backend generates: OMEGO-0001                   │
│    └─ Saves to users table ✅                          │
│                                                        │
│  User Submits Request → Backend → PostgreSQL          │
│    ├─ Backend generates: OMEGO-0001-REQ-01            │
│    └─ Saves to requests table ✅                       │
│    └─ Triggers webhook to n8n ✅                       │
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│                  N8N WORKFLOWS                         │
│                                                        │
│  WF1: Broadcast Request to Forwarders                 │
│  ├─ Webhook receives: { request_id: "OMEGO-0001-REQ-01" }│
│  ├─ Read request details from PostgreSQL ✅            │
│  ├─ Read forwarders from PostgreSQL ✅                 │
│  ├─ Send Gmail to each forwarder ✅                    │
│  ├─ Send WhatsApp to each forwarder ✅                 │
│  └─ Log to n8n_broadcast_logs ✅                       │
│                                                        │
│  WF2: Process Quotation Replies                       │
│  ├─ Gmail Trigger (monitors quote@omegoonline.com)    │
│  ├─ Extract request_id from email subject             │
│  ├─ AI extracts quotation data (Claude) ✅            │
│  ├─ Save to quotations table ✅                        │
│  ├─ Update quotation_count in requests ✅              │
│  ├─ Check if 3 quotes → Trigger WF3 ✅                │
│  └─ Log to n8n_events_logs ✅                          │
│                                                        │
│  WF3: Auto-Close After 3 Quotes                       │
│  ├─ Update status=CLOSED in requests ✅                │
│  ├─ Get all 3 quotations from PostgreSQL ✅            │
│  ├─ Send comparison email to user ✅                   │
│  └─ Log closure event ✅                               │
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│              USER DASHBOARD                            │
│                                                        │
│  Website Backend → PostgreSQL                         │
│  ├─ Read requests by user_sovereign_id                │
│  ├─ Read quotations by request_id                     │
│  └─ Display to user ✅                                 │
└────────────────────────────────────────────────────────┘
```

---

## 🔑 KEY CHANGES FROM BEFORE

### **WHAT n8n DOES NOT DO:**
- ❌ Generate OMEGO-0001 IDs (backend does this)
- ❌ Generate OMEGO-0001-REQ-01 IDs (backend does this)
- ❌ Create users in database (backend does this)
- ❌ Handle user authentication (backend does this)

### **WHAT n8n DOES:**
- ✅ Receives webhook when new request created
- ✅ Reads request details from PostgreSQL
- ✅ Reads forwarders from PostgreSQL
- ✅ Sends Gmail + WhatsApp notifications
- ✅ Monitors Gmail for forwarder replies
- ✅ AI extracts quotation data
- ✅ Saves quotations to PostgreSQL
- ✅ Updates quotation counts
- ✅ Auto-closes requests after 3 quotes
- ✅ Logs everything to audit tables

---

## 📊 COMPLETE WORKFLOW BREAKDOWN

### **WF1: BROADCAST REQUEST TO FORWARDERS**

**Trigger:** Webhook from your backend

**Input:**
```json
POST https://your-n8n-url/webhook/broadcast-request
{
  "request_id": "OMEGO-0001-REQ-01"
}
```

**Steps:**

1. **Receive Webhook**
   - Get request_id from payload

2. **Read Request from PostgreSQL**
```sql
SELECT * FROM requests WHERE request_id = 'OMEGO-0001-REQ-01'
```
Returns:
```json
{
  "request_id": "OMEGO-0001-REQ-01",
  "user_sovereign_id": "OMEGO-0001",
  "origin": "Shanghai",
  "destination": "Los Angeles",
  "cargo_type": "FCL",
  "weight_kg": 15000,
  "incoterms": "FOB",
  "status": "OPEN"
}
```

3. **Get User Details**
```sql
SELECT * FROM users WHERE sovereign_id = 'OMEGO-0001'
```

4. **Read Active Forwarders**
```sql
SELECT * FROM forwarders 
WHERE status IN ('APPROVED', 'ACTIVE')
AND specializations LIKE '%FCL%'
```

5. **Filter Forwarders by Route/Cargo**
```javascript
// Filter forwarders who handle this route
const relevantForwarders = forwarders.filter(f => {
  const routes = f.specializations || '';
  const cargoMatch = routes.includes(cargo_type) || routes.includes('All');
  return cargoMatch && f.status === 'ACTIVE';
});
```

6. **Send Gmail to Each Forwarder**
```
To: forwarder@company.com
Subject: 🚢 [NEW REQUEST] OMEGO-0001-REQ-01 - Shanghai to Los Angeles
Body: [HTML email with request details]
Reply-To: quote@omegoonline.com
```

7. **Send WhatsApp to Each Forwarder**
```
To: +1234567890
Message: New freight request OMEGO-0001-REQ-01
Click to view: https://omegoonline.com/request/OMEGO-0001-REQ-01
```

8. **Log Broadcast**
```sql
INSERT INTO n8n_broadcast_logs (
  request_id, forwarder_id, email_sent, whatsapp_sent, sent_at
) VALUES (
  'OMEGO-0001-REQ-01', 'FWDR-0025', 'SUCCESS', 'SUCCESS', NOW()
)
```

9. **Send Confirmation to User**
```
To: user@example.com
Subject: ✅ Your request OMEGO-0001-REQ-01 is live!
Body: We've notified 15 forwarders. Expect quotes within 24-48 hours.
```

---

### **WF2: PROCESS QUOTATION REPLIES**

**Trigger:** Gmail Trigger (monitors quote@omegoonline.com)

**When:** New email received

**Steps:**

1. **Gmail Trigger Fires**
```json
{
  "from": "forwarder@company.com",
  "subject": "RE: OMEGO-0001-REQ-01 Quote",
  "body": "Our price is USD 2,500, transit 15 days, Maersk..."
}
```

2. **Extract Request ID**
```javascript
const subject = email.subject;
const regex = /OMEGO-\d{4}-REQ-\d{2}/;
const requestId = subject.match(regex)[0]; // "OMEGO-0001-REQ-01"
```

3. **Verify Forwarder Exists**
```sql
SELECT * FROM forwarders 
WHERE email = 'forwarder@company.com' 
AND status = 'ACTIVE'
```

4. **Check Request Status**
```sql
SELECT status, quotation_count FROM requests 
WHERE request_id = 'OMEGO-0001-REQ-01'
```

If status = 'CLOSED' → Send "Request already closed" email, exit

5. **Check for Duplicate**
```sql
SELECT COUNT(*) FROM quotations 
WHERE request_id = 'OMEGO-0001-REQ-01' 
AND forwarder_company = 'Test Freight Co'
```

If count > 0 → Send "Duplicate quote" email, exit

6. **AI Extract Quotation** (Claude Sonnet 4)
```javascript
Input: email.body
Prompt: "Extract: total_price, currency, transit_days, validity_days, carrier, service_type from this email"

Output: {
  "total_price": 2500,
  "currency": "USD",
  "transit_days": 15,
  "validity_days": 7,
  "carrier": "Maersk",
  "service_type": "FCL",
  "ai_summary": "Fast Freight Co offers $2,500 USD for FCL shipment via Maersk with 15-day transit."
}
```

7. **Generate Quotation ID**
```sql
-- Backend should handle this, but if n8n needs to:
SELECT COUNT(*) FROM quotations WHERE request_id = 'OMEGO-0001-REQ-01'
-- If count = 2, next ID = OMEGO-0001-REQ-01-Q3
```

8. **Save Quotation to PostgreSQL**
```sql
INSERT INTO quotations (
  quotation_id, request_id, forwarder_company, 
  total_price, currency, transit_days, validity_days,
  carrier, service_type, ai_summary, status
) VALUES (
  'OMEGO-0001-REQ-01-Q3',
  'OMEGO-0001-REQ-01',
  'Fast Freight Co',
  2500, 'USD', 15, 7,
  'Maersk', 'FCL',
  'Fast Freight Co offers $2,500...',
  'ACTIVE'
)
```

9. **Update Quotation Count**
```sql
UPDATE requests 
SET quotation_count = quotation_count + 1,
    status = CASE WHEN quotation_count + 1 >= 3 THEN 'QUOTED' ELSE status END
WHERE request_id = 'OMEGO-0001-REQ-01'
```

10. **Get Updated Count**
```sql
SELECT quotation_count FROM requests WHERE request_id = 'OMEGO-0001-REQ-01'
```

11. **Check if 3 Quotes Reached**
```javascript
if (quotation_count === 3) {
  // Trigger WF3 (Auto-Close)
  executeWorkflow('WF3_Auto_Close', { request_id: 'OMEGO-0001-REQ-01' });
}
```

12. **Send Notification to User**
```
To: user@example.com
Subject: 🎉 New quote received for OMEGO-0001-REQ-01
Body: Fast Freight Co has submitted a quote of $2,500 USD.
View all quotes: https://omegoonline.com/dashboard/requests/OMEGO-0001-REQ-01
```

13. **Send Confirmation to Forwarder**
```
To: forwarder@company.com
Subject: ✅ Your quote for OMEGO-0001-REQ-01 received
Body: Your quotation has been submitted successfully. The customer will review all quotes and may contact you.
```

14. **Log Event**
```sql
INSERT INTO n8n_events_logs (
  event_type, request_id, description
) VALUES (
  'QUOTE_RECEIVED', 'OMEGO-0001-REQ-01', 
  'Quote from Fast Freight Co: $2,500 USD'
)
```

---

### **WF3: AUTO-CLOSE AFTER 3 QUOTES**

**Trigger:** Called by WF2 when quotation_count = 3

**Input:**
```json
{ "request_id": "OMEGO-0001-REQ-01" }
```

**Steps:**

1. **Update Request Status**
```sql
UPDATE requests 
SET status = 'CLOSED',
    closed_reason = 'MAX_QUOTES_REACHED',
    closed_at = NOW()
WHERE request_id = 'OMEGO-0001-REQ-01'
```

2. **Get All Quotations**
```sql
SELECT * FROM quotations 
WHERE request_id = 'OMEGO-0001-REQ-01'
ORDER BY total_price ASC
```

Returns:
```json
[
  { "forwarder": "Company A", "price": 2350, "currency": "USD", "transit": 18 },
  { "forwarder": "Company B", "price": 2500, "currency": "USD", "transit": 15 },
  { "forwarder": "Company C", "price": 2680, "currency": "USD", "transit": 12 }
]
```

3. **Get User Email**
```sql
SELECT u.email, u.full_name 
FROM requests r
JOIN users u ON u.sovereign_id = r.user_sovereign_id
WHERE r.request_id = 'OMEGO-0001-REQ-01'
```

4. **Send Comparison Email**
```html
To: user@example.com
Subject: 🎯 3 Quotes Received - OMEGO-0001-REQ-01 Closed

<h1>Your request is complete!</h1>
<p>We received 3 competitive quotations:</p>

<table>
  <tr style="background: #d4edda;">
    <td>Company A</td>
    <td>$2,350 USD</td>
    <td>18 days</td>
    <td>⭐ BEST PRICE</td>
  </tr>
  <tr>
    <td>Company B</td>
    <td>$2,500 USD</td>
    <td>15 days</td>
    <td>⚡ FASTEST</td>
  </tr>
  <tr>
    <td>Company C</td>
    <td>$2,680 USD</td>
    <td>12 days</td>
    <td>🚀 EXPRESS</td>
  </tr>
</table>

<a href="https://omegoonline.com/dashboard">View Full Details</a>
```

5. **Get Non-Quoting Forwarders**
```sql
SELECT f.email, f.company_name
FROM n8n_broadcast_logs bl
JOIN forwarders f ON f.forwarder_id = bl.forwarder_id
WHERE bl.request_id = 'OMEGO-0001-REQ-01'
AND bl.forwarder_id NOT IN (
  SELECT DISTINCT forwarder_id FROM quotations 
  WHERE request_id = 'OMEGO-0001-REQ-01'
)
```

6. **Notify Non-Quoting Forwarders**
```
To: non-quoting-forwarder@company.com
Subject: Request OMEGO-0001-REQ-01 is now closed

The request has received 3 quotations and has been automatically closed.
No further quotes will be accepted.
```

7. **Log Closure Event**
```sql
INSERT INTO n8n_events_logs (
  event_type, request_id, description
) VALUES (
  'REQUEST_CLOSED', 'OMEGO-0001-REQ-01',
  'Auto-closed with 3 quotations. Lowest: $2,350 USD'
)
```

8. **Update Analytics**
```sql
INSERT INTO n8n_analytics (date, total_requests, total_quotations, requests_closed)
VALUES (CURRENT_DATE, 1, 3, 1)
ON CONFLICT (date) DO UPDATE SET
  total_requests = n8n_analytics.total_requests + 1,
  total_quotations = n8n_analytics.total_quotations + 3,
  requests_closed = n8n_analytics.requests_closed + 1
```

---

## 🔧 N8N NODES REQUIRED

### **WF1 Nodes (15 nodes):**
1. Webhook Trigger
2. PostgreSQL - Read Request
3. PostgreSQL - Read User
4. PostgreSQL - Read Forwarders
5. Code - Filter Forwarders
6. Split Into Batches
7. Code - Build Email
8. Gmail - Send Email
9. Code - Build WhatsApp
10. HTTP Request - Send WhatsApp
11. PostgreSQL - Log Broadcast
12. Code - Build User Confirmation
13. Gmail - Send User Confirmation
14. PostgreSQL - Log Event
15. Webhook Response

### **WF2 Nodes (20 nodes):**
1. Gmail Trigger
2. Code - Extract Request ID
3. PostgreSQL - Read Forwarder
4. If - Forwarder Exists
5. PostgreSQL - Read Request Status
6. If - Status is OPEN
7. PostgreSQL - Check Duplicate
8. If - Not Duplicate
9. Anthropic AI - Extract Quotation
10. Code - Validate AI Output
11. PostgreSQL - Save Quotation
12. PostgreSQL - Update Count
13. PostgreSQL - Get Updated Count
14. If - Check if 3 Quotes
15. Execute Workflow - Trigger WF3
16. Gmail - Notify User
17. Gmail - Confirm to Forwarder
18. PostgreSQL - Log Event
19. Error Handler - Send Rejection Email
20. PostgreSQL - Log Rejected Attempt

### **WF3 Nodes (10 nodes):**
1. Execute Workflow Trigger
2. PostgreSQL - Update Status
3. PostgreSQL - Get All Quotations
4. Code - Sort Quotations
5. PostgreSQL - Get User Email
6. Code - Build Comparison Email
7. Gmail - Send to User
8. PostgreSQL - Get Non-Quoters
9. Gmail - Notify Non-Quoters
10. PostgreSQL - Log Closure + Update Analytics

---

## 🌐 YOUR BACKEND WEBHOOK INTEGRATION

### **When User Submits Request:**

```python
# Your FastAPI/Django backend
@app.post("/api/requests/create")
async def create_request(request: RequestCreate, user: User):
    # 1. Generate IDs (your backend does this)
    sovereign_id = user.sovereign_id  # Already has OMEGO-0001
    request_count = await db.count_user_requests(sovereign_id)
    request_id = f"{sovereign_id}-REQ-{str(request_count + 1).zfill(2)}"
    
    # 2. Save to PostgreSQL
    await db.execute("""
        INSERT INTO requests (
            request_id, user_sovereign_id, origin, destination, 
            cargo_type, weight_kg, incoterms, status, quotation_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', 0)
    """, request_id, sovereign_id, origin, destination, 
        cargo_type, weight, incoterms)
    
    # 3. Trigger n8n webhook
    await httpx.post(
        "https://your-n8n-url/webhook/broadcast-request",
        json={"request_id": request_id},
        headers={"X-OMEGO-Auth": "your_secret_token"}
    )
    
    return {"request_id": request_id, "status": "broadcasted"}
```

---

## 📋 SETUP CHECKLIST

### **Phase 1: n8n Setup (30 mins)**
- [ ] Connect n8n to PostgreSQL
  - Host: localhost
  - Database: logistics_db
  - User: postgres
  - Password: 2003
- [ ] Test connection
- [ ] Connect Gmail OAuth (quote@omegoonline.com)
- [ ] Connect Gmail OAuth (support@omegoonline.com)
- [ ] Connect Anthropic Claude API
- [ ] Connect Twilio/WhatsApp API

### **Phase 2: Import Workflows (30 mins)**
- [ ] Import WF1 - Broadcast Request
- [ ] Import WF2 - Process Quotations
- [ ] Import WF3 - Auto-Close
- [ ] Update all credentials
- [ ] Activate all workflows

### **Phase 3: Backend Integration (15 mins)**
- [ ] Add webhook call after request creation
- [ ] Test webhook endpoint
- [ ] Verify request appears in PostgreSQL

### **Phase 4: Testing (1 hour)**
- [ ] Submit test request from website
- [ ] Check n8n receives webhook
- [ ] Verify emails sent to forwarders
- [ ] Reply with test quotation
- [ ] Verify AI extraction works
- [ ] Check quotation saved to database
- [ ] Submit 2 more quotations
- [ ] Verify auto-close triggers
- [ ] Check comparison email sent

---

## ✅ SUCCESS CRITERIA

**System is working when:**

1. ✅ User submits request → Backend saves → n8n receives webhook
2. ✅ n8n reads from PostgreSQL correctly
3. ✅ Forwarders receive Gmail + WhatsApp
4. ✅ Forwarder replies → AI extracts → Saves to PostgreSQL
5. ✅ User sees quotation on dashboard immediately
6. ✅ 3rd quote triggers auto-close
7. ✅ User receives comparison email
8. ✅ Request status = CLOSED in database

---

## 🎯 KEY DIFFERENCES FROM BEFORE

### **OLD (WRONG) APPROACH:**
- n8n generates IDs ❌
- n8n creates users ❌
- Google Sheets is primary storage ❌

### **NEW (CORRECT) APPROACH:**
- Backend generates ALL IDs ✅
- Backend manages users ✅
- PostgreSQL is ONLY storage ✅
- n8n just handles notifications + AI ✅
- No Google Sheets needed! ✅

---

## 🚀 READY TO BUILD?

**I'll create the updated WF1, WF2, WF3 JSON files that:**
- ✅ Use PostgreSQL for ALL operations
- ✅ No Google Sheets
- ✅ No ID generation (backend does it)
- ✅ Just handles emails + AI + logging

**Tell me:**
1. **Ready for updated workflow files?** YES / NO
2. **What's your n8n webhook URL?**
3. **Do you use Twilio or WATI for WhatsApp?**

**Then I'll create the perfect workflows!** 🔥💪
