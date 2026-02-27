# 🚀 OMEGO WORKFLOWS - COMPLETE SETUP GUIDE

## 📦 WHAT YOU HAVE

**3 Production-Ready n8n Workflows:**

1. **WF1_OMEGO_Broadcast_Request.json** - Broadcasts requests to forwarders
2. **WF2_OMEGO_Process_Quotations.json** - AI extraction + 3-quote limit
3. **WF3_OMEGO_Auto_Close.json** - Auto-closes after 3 quotes

---

## 🎯 BEFORE YOU START

### **Requirements Checklist:**

- [ ] n8n installed and running
- [ ] PostgreSQL database with all tables created
- [ ] Gmail accounts created (quote@omegoonline.com, support@omegoonline.com)
- [ ] Anthropic Claude API key
- [ ] Backend webhook endpoint ready

---

## 📊 STEP 1: CREATE MISSING DATABASE TABLE

**You need to create ONE new table:**

```sql
-- Connect to your PostgreSQL database first
\c logistics_db

-- Create forwarder_bid_status table
CREATE TABLE IF NOT EXISTS forwarder_bid_status (
    id SERIAL PRIMARY KEY,
    forwarder_id VARCHAR(50) NOT NULL,
    request_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    -- Status values:
    -- "ANSWERED" = Successfully quoted
    -- "DECLINED_LATE" = Tried to quote after 3 received
    -- "DUPLICATE" = Tried to quote twice
    -- "COMPLETED" = Request closed, quote was one of the 3
    quoted_at TIMESTAMP,
    attempted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forwarder_id) REFERENCES forwarders(forwarder_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE,
    UNIQUE (forwarder_id, request_id)
);

CREATE INDEX idx_forwarder_bid_status_forwarder ON forwarder_bid_status(forwarder_id);
CREATE INDEX idx_forwarder_bid_status_request ON forwarder_bid_status(request_id);

-- Verify table created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'forwarder_bid_status';
```

---

## 🔐 STEP 2: CONNECT n8n TO POSTGRESQL

### **In n8n:**

1. Go to **Settings** → **Credentials**
2. Click **"+ New Credential"**
3. Search for **"Postgres"**
4. Fill in:

```
Credential Name: OMEGO PostgreSQL

Host: localhost (or your server IP)
Port: 5432
Database: logistics_db
User: postgres
Password: 2003
SSL Mode: disable (if localhost) or true (if remote)
```

5. Click **"Test Connection"**
6. Should show: ✅ **"Connection successful"**
7. Click **"Save"**

---

## 📧 STEP 3: CONNECT n8n TO GMAIL

### **Connect quote@omegoonline.com:**

1. **Settings** → **Credentials** → **"+ New Credential"**
2. Search for **"Gmail OAuth2"**
3. Click **"Sign in with Google"**
4. Select: **quote@omegoonline.com**
5. Enter password: **356B9mT=**
6. Click **"Allow"**
7. **Credential Name:** `Gmail OAuth - Quotes`
8. Click **"Save"**

### **Connect support@omegoonline.com:**

1. **"+ New Credential"** → **"Gmail OAuth2"**
2. **"Sign in with Google"**
3. Select: **support@omegoonline.com**
4. Enter password: **HKXq6nC***
5. Click **"Allow"**
6. **Credential Name:** `Gmail OAuth - Support`
7. Click **"Save"**

---

## 🤖 STEP 4: CONNECT n8n TO ANTHROPIC CLAUDE

1. Get API key from: https://console.anthropic.com/
2. In n8n: **Credentials** → **"+ New Credential"**
3. Search for **"Anthropic API"**
4. **Credential Name:** `Anthropic Claude API`
5. **API Key:** [paste your key]
6. Click **"Save"**

---

## 📥 STEP 5: IMPORT WORKFLOWS

### **Import Order (CRITICAL!):**

**Import in this exact order:**

### **1. Import WF1 First:**

1. In n8n, click **"Workflows"** (left sidebar)
2. Click **"Import from File"**
3. Upload **WF1_OMEGO_Broadcast_Request.json**
4. Click **"Import"**
5. Open the workflow
6. **Update ALL credential references:**
   - Click on any **PostgreSQL** node → Select `OMEGO PostgreSQL`
   - Click on **Gmail** nodes → Select appropriate credential
   - Do this for EVERY node that needs credentials
7. **Save** the workflow
8. **Activate** the workflow (toggle switch at top)

### **2. Import WF3 Second:**

1. **"Import from File"**
2. Upload **WF3_OMEGO_Auto_Close.json**
3. Update credentials
4. **Save**
5. **Activate**
6. **IMPORTANT:** Copy the workflow ID from the URL:
   - URL looks like: `https://app.n8n.cloud/workflow/ABC123XYZ`
   - Copy: `ABC123XYZ`
   - Save this - you need it for WF2!

### **3. Import WF2 Last:**

1. **"Import from File"**
2. Upload **WF2_OMEGO_Process_Quotations.json**
3. Update credentials
4. **CRITICAL:** Find the **"Execute Workflow - Trigger WF3"** node
5. Click on it
6. In the **"Workflow ID"** field, paste the WF3 workflow ID you copied
7. **Save**
8. **Activate**

---

## ⚙️ STEP 6: SET ENVIRONMENT VARIABLES

### **In n8n: Settings → Variables:**

Add these variables (click **"+ Add Variable"** for each):

```bash
Variable 1:
Name: WF3_AUTO_CLOSE_WORKFLOW_ID
Value: [the WF3 workflow ID you copied]

Variable 2:
Name: OMEGO_REPLY_EMAIL
Value: quote@omegoonline.com

Variable 3:
Name: OMEGO_ADMIN_EMAIL
Value: support@omegoonline.com

Variable 4:
Name: OMEGO_SUPPORT_EMAIL
Value: support@omegoonline.com
```

---

## 🌐 STEP 7: GET YOUR WEBHOOK URL

### **From WF1:**

1. Open **WF1 - OMEGO Broadcast Request**
2. Click on the **"Webhook - Trigger from Backend"** node
3. You'll see a URL like: `https://your-n8n-url.app.n8n.cloud/webhook/broadcast-request`
4. **Copy this URL** - this is what your backend will call!

---

## 🔧 STEP 8: UPDATE YOUR BACKEND

### **Add this to your FastAPI backend:**

```python
import httpx

@app.post("/api/marketplace/requests/create")
async def create_request(request: RequestCreate, user: User):
    # 1. Generate request_id
    request_count = await db.count_user_requests(user.sovereign_id)
    request_id = f"{user.sovereign_id}-REQ-{str(request_count + 1).zfill(2)}"
    
    # 2. Save to PostgreSQL
    await db.execute("""
        INSERT INTO requests (
            request_id, user_sovereign_id, user_email, user_name,
            origin, destination, cargo_type, weight_kg,
            incoterms, status, quotation_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'OPEN', 0)
    """, request_id, user.sovereign_id, user.email, user.full_name,
        request.origin, request.destination, request.cargo_type,
        request.weight_kg, request.incoterms)
    
    # 3. Trigger n8n webhook
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://your-n8n-url.app.n8n.cloud/webhook/broadcast-request",
                json={"request_id": request_id},
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            response.raise_for_status()
    except Exception as e:
        print(f"n8n webhook error: {e}")
        # Don't fail the request if n8n webhook fails
    
    return {
        "success": True,
        "request_id": request_id,
        "message": "Request created and broadcasted"
    }
```

---

## 🧪 STEP 9: TEST EVERYTHING

### **Test 1: Broadcast Request**

1. Use Postman or your website
2. Submit a test request
3. **Expected:**
   - Request saved to PostgreSQL ✅
   - n8n WF1 triggers ✅
   - Emails sent to forwarders ✅
   - User receives confirmation ✅

### **Test 2: First Quotation**

1. Send test email to **quote@omegoonline.com**:

```
From: forwarder@test.com
To: quote@omegoonline.com
Subject: RE: OMEGO-0001-REQ-01 Quote

Our quotation:
Price: USD 2,500
Transit: 15 days
Validity: 7 days
Carrier: Maersk
Service: FCL
```

2. **Expected:**
   - n8n WF2 triggers ✅
   - AI extracts data ✅
   - Saved to quotations table ✅
   - quotation_count = 1 ✅
   - User notified ✅
   - Forwarder confirmed ✅

### **Test 3: Second & Third Quotations**

1. Send 2 more quotations from different forwarders
2. **Expected:**
   - Each processed successfully ✅
   - quotation_count increments ✅
   - After 3rd quote: WF3 triggers ✅
   - Request status = CLOSED ✅
   - User receives comparison email ✅

### **Test 4: Late Quotation (4th)**

1. Send a 4th quotation
2. **Expected:**
   - WF2 detects request is CLOSED ✅
   - Sends DECLINED email ✅
   - Logs to forwarder_bid_status ✅
   - Quotation NOT saved ✅

---

## 📊 STEP 10: VERIFY DASHBOARDS

### **User Dashboard Test:**

```python
# Your backend API
@app.get("/api/marketplace/my-requests")
async def get_user_requests(user_email: str):
    query = """
        SELECT 
            r.*,
            (
                SELECT json_agg(q.*)
                FROM quotations q
                WHERE q.request_id = r.request_id
                ORDER BY q.total_price ASC
            ) as quotations
        FROM requests r
        WHERE r.user_email = $1
        ORDER BY r.submitted_at DESC
    """
    return await db.fetch_all(query, user_email)
```

**Should return:**
```json
{
  "requests": [
    {
      "request_id": "OMEGO-0001-REQ-01",
      "status": "CLOSED",
      "quotation_count": 3,
      "quotations": [
        {"forwarder_company": "Company A", "total_price": 2350},
        {"forwarder_company": "Company B", "total_price": 2500},
        {"forwarder_company": "Company C", "total_price": 2680}
      ]
    }
  ]
}
```

### **Forwarder Dashboard Test:**

```python
@app.get("/api/forwarder/my-bids")
async def get_forwarder_bids(forwarder_id: str):
    query = """
        SELECT 
            r.request_id,
            r.origin,
            r.destination,
            r.status as request_status,
            fbs.status as bid_status,
            fbs.quoted_at,
            fbs.attempted_at
        FROM forwarder_bid_status fbs
        JOIN requests r ON r.request_id = fbs.request_id
        WHERE fbs.forwarder_id = $1
        ORDER BY COALESCE(fbs.quoted_at, fbs.attempted_at) DESC
    """
    return await db.fetch_all(query, forwarder_id)
```

**Should return:**
```json
{
  "bids": [
    {
      "request_id": "OMEGO-0001-REQ-01",
      "request_status": "CLOSED",
      "bid_status": "COMPLETED",
      "quoted_at": "2024-02-26T11:00:00"
    },
    {
      "request_id": "OMEGO-0002-REQ-01",
      "request_status": "CLOSED",
      "bid_status": "DECLINED_LATE",
      "attempted_at": "2024-02-26T15:00:00"
    }
  ]
}
```

---

## ✅ SUCCESS CHECKLIST

### **Phase 1: Setup**
- [ ] forwarder_bid_status table created
- [ ] n8n connected to PostgreSQL
- [ ] Gmail credentials added (both accounts)
- [ ] Anthropic Claude API connected
- [ ] Environment variables set

### **Phase 2: Workflows**
- [ ] WF1 imported and activated
- [ ] WF3 imported and activated (ID saved)
- [ ] WF2 imported with WF3 ID and activated
- [ ] All credentials assigned
- [ ] Webhook URL copied

### **Phase 3: Backend**
- [ ] Backend webhook call added
- [ ] API endpoints for dashboards created
- [ ] Tested request creation

### **Phase 4: Testing**
- [ ] Test request broadcasted successfully
- [ ] First quotation processed
- [ ] Second quotation processed
- [ ] Third quotation triggers auto-close
- [ ] Fourth quotation gets declined
- [ ] User dashboard shows all data
- [ ] Forwarder dashboard shows statuses

---

## 🚨 TROUBLESHOOTING

### **Issue: Workflow not triggering**
**Check:**
- Is the workflow activated? (toggle at top)
- Are credentials properly assigned?
- Is PostgreSQL connection working?

### **Issue: AI extraction fails**
**Check:**
- Is Anthropic API key valid?
- Does API key have credits?
- Is email body being passed correctly?

### **Issue: Emails not sending**
**Check:**
- Gmail OAuth credentials valid?
- Gmail daily limit not exceeded?
- Check spam folder

### **Issue: 3-quote limit not working**
**Check:**
- Is WF2 checking quotation count before AI extraction?
- Is the "Less than 3 Quotes?" node configured correctly?
- Check PostgreSQL logs

### **Issue: Forwarder dashboard not showing status**
**Check:**
- Is forwarder_bid_status table created?
- Is WF2 inserting records to this table?
- Check backend API query

---

## 🎯 WORKFLOW NODE COUNT

**WF1:** 15 nodes
**WF2:** 30 nodes (most complex!)
**WF3:** 14 nodes

**Total:** 59 nodes of pure automation power! 💪

---

## 📞 SUPPORT

### **If you get stuck:**

1. Check n8n execution history for errors
2. Check PostgreSQL logs
3. Verify all credentials are valid
4. Make sure all workflows are activated
5. Test each workflow individually

---

## 🎉 YOU'RE READY!

**Your Sovereign Logistics Engine is complete with:**

- ✅ AI-powered quotation extraction
- ✅ 3-quote hard limit enforcement
- ✅ Real-time dashboard updates
- ✅ Forwarder bid status tracking
- ✅ Auto-close logic
- ✅ Comprehensive email notifications
- ✅ Complete audit trail

**Now GO LIVE and DOMINATE the freight forwarding industry!** 🚀🌍💪
