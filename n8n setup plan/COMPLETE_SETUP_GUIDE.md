# 🚀 OMEGO n8n COMPLETE SETUP GUIDE

## 📋 TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [Google Sheets Setup](#google-sheets-setup)
3. [n8n Installation & Configuration](#n8n-configuration)
4. [Workflow Import](#workflow-import)
5. [API Credentials](#api-credentials)
6. [Testing Procedures](#testing)
7. [Go-Live Checklist](#go-live)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 PREREQUISITES

### Required Accounts & Services:
- ✅ n8n Cloud account (or self-hosted n8n)
- ✅ Google Workspace account (for Gmail & Sheets)
- ✅ Anthropic Claude API key
- ✅ Twilio account for WhatsApp (or WATI)
- ✅ Your website/dashboard with API endpoints

### Required Skills:
- Basic JSON understanding
- Google Sheets familiarity
- API concepts
- Webhook configuration

---

## 📊 GOOGLE SHEETS SETUP

### Step 1: Create Master Spreadsheet

1. Go to Google Sheets: https://sheets.google.com
2. Create new spreadsheet named: **"OMEGO Master Database"**
3. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit
   ```
4. Save this ID - you'll need it for n8n

### Step 2: Create All Required Sheets

Create these 8 tabs (exact names):

#### **USERS**
```
Column A: sovereign_id
Column B: name
Column C: email
Column D: phone
```

#### **REQUESTS**
```
Column A: request_id
Column B: user_sovereign_id
Column C: user_email
Column D: user_name
Column E: origin
Column F: destination
Column G: cargo_type
Column H: weight_kg
Column I: dimensions
Column J: special_requirements
Column K: incoterms
Column L: currency
Column M: status
Column N: quotation_count
Column O: submitted_at
Column P: closed_at
Column Q: closed_reason
```

#### **REGISTERED_FORWARDERS**
```
Column A: forwarder_id
Column B: company_name
Column C: contact_person
Column D: email
Column E: phone
Column F: whatsapp
Column G: country
Column H: specializations
Column I: routes
Column J: status
Column K: registered_at
Column L: activated_at
```

#### **QUOTATIONS**
```
Column A: quotation_id
Column B: request_id
Column C: forwarder_id
Column D: forwarder_company
Column E: total_price
Column F: currency
Column G: transit_days
Column H: validity_days
Column I: carrier
Column J: service_type
Column K: surcharges
Column L: payment_terms
Column M: notes
Column N: ai_summary
Column O: raw_email
Column P: status
Column Q: received_at
Column R: expires_at
```

#### **BROADCAST_LOG**
```
Column A: log_id
Column B: request_id
Column C: forwarder_id
Column D: forwarder_company
Column E: email_sent
Column F: whatsapp_sent
Column G: sent_at
```

#### **EVENTS_LOG**
```
Column A: event_id
Column B: event_type
Column C: request_id
Column D: actor
Column E: description
Column F: timestamp
```

#### **ANALYTICS**
```
Column A: date
Column B: total_requests
Column C: total_quotations
Column D: requests_closed
Column E: avg_quotes_per_request
Column F: stale_requests_count
```

#### **REJECTED_ATTEMPTS**
```
Column A: timestamp
Column B: sender_email
Column C: request_id
Column D: error_type
Column E: error_message
```

### Step 3: Format Headers

1. Select Row 1 in each sheet
2. Make it **BOLD**
3. Apply background color (light blue recommended)
4. Freeze Row 1: View > Freeze > 1 row

### Step 4: Share with n8n Service Account

You'll get a service account email when setting up Google Sheets in n8n. Share the spreadsheet with that email (Editor access).

---

## 🔐 API CREDENTIALS SETUP

### 1. Google Sheets API (n8n)

In n8n:
1. Go to **Credentials** > **New Credential**
2. Select **Google Sheets OAuth2 API**
3. Follow OAuth flow to authorize
4. Save as "Google Sheets OAuth"

### 2. Gmail API (n8n)

In n8n:
1. Go to **Credentials** > **New Credential**
2. Select **Gmail OAuth2 API**
3. Ensure these scopes are enabled:
   - `gmail.readonly`
   - `gmail.send`
   - `gmail.modify`
4. Save as "Gmail OAuth"

### 3. Anthropic Claude API

1. Get API key from: https://console.anthropic.com/
2. In n8n: **Credentials** > **New Credential** > **Anthropic API**
3. Paste your API key
4. Save as "Anthropic Claude API"

### 4. Twilio WhatsApp API

1. Create Twilio account: https://www.twilio.com/
2. Get WhatsApp-enabled number
3. Get Account SID and Auth Token
4. In n8n: **Credentials** > **New Credential** > **Twilio API**
5. Enter Account SID and Auth Token
6. Save as "Twilio API"

**Alternative: WATI**
- Use WATI for easier WhatsApp Business API
- Get API endpoint and token from WATI dashboard

### 5. Webhook Authentication

1. Generate a secret token:
   ```bash
   openssl rand -hex 32
   ```
2. In n8n: **Credentials** > **New Credential** > **Header Auth**
3. Set:
   - Header Name: `X-OMEGO-Auth`
   - Value: [your generated token]
4. Save as "OMEGO Webhook Auth"

### 6. Your Dashboard API

1. Create API key in your dashboard system
2. In n8n: **Credentials** > **New Credential** > **Header Auth**
3. Set:
   - Header Name: `Authorization`
   - Value: `Bearer [your_api_key]`
4. Save as "OMEGO API Auth"

---

## 🌍 ENVIRONMENT VARIABLES

In n8n (Settings > Variables):

```bash
# Google Sheets
OMEGO_MASTER_SHEET_ID=your_spreadsheet_id_here

# Email Configuration
OMEGO_REPLY_EMAIL=quotations@omego.com
OMEGO_ADMIN_EMAIL=admin@omego.com
OMEGO_SUPPORT_EMAIL=support@omego.com

# Dashboard URLs
OMEGO_DASHBOARD_URL=https://dashboard.omego.com
OMEGO_FORWARDER_DASHBOARD_URL=https://dashboard.omego.com/forwarder
OMEGO_REGISTRATION_URL=https://omego.com/register

# WhatsApp (Twilio)
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json
WHATSAPP_FROM_NUMBER=whatsapp:+14155238886

# Google Drive
OMEGO_FORWARDER_DOCS_FOLDER=your_google_drive_folder_id

# Workflow IDs (fill these after importing workflows)
WF3_AUTO_CLOSE_WORKFLOW_ID=
WF5_ERROR_HANDLER_WORKFLOW_ID=
```

---

## 📥 WORKFLOW IMPORT

### Import Order (CRITICAL):

Import in this exact order:

1. **WF1_Request_Intake_Broadcast.json** - Test webhook first
2. **WF3_Auto_Close_Request.json** - Get workflow ID
3. **WF5** (Error Handler) - Get workflow ID  
4. **WF2_AI_Quotation_Catcher.json** - Update WF3 & WF5 IDs
5. **WF4-WF7** - Import remaining workflows

### How to Import:

1. In n8n, click **Workflows** > **Import from File**
2. Upload the `.json` file
3. Click on the workflow
4. Update all credential references:
   - Google Sheets OAuth2 → Select your credential
   - Gmail OAuth2 → Select your credential
   - Anthropic API → Select your credential
   - Twilio API → Select your credential
5. **Save** the workflow
6. **Activate** the workflow

### Get Workflow IDs:

After importing WF3 and WF5:
1. Open the workflow
2. Look at the URL: `https://app.n8n.cloud/workflow/[THIS_IS_THE_ID]`
3. Copy the ID
4. Update your environment variables:
   ```bash
   WF3_AUTO_CLOSE_WORKFLOW_ID=the_id_from_wf3
   WF5_ERROR_HANDLER_WORKFLOW_ID=the_id_from_wf5
   ```
5. Go back to WF2 and update the "Trigger Auto-Close Workflow" node with WF3's ID

---

## 🧪 TESTING PROCEDURES

### Test 1: Request Intake (WF1)

1. Activate WF1
2. In WF1, click on "Webhook - New Request" node
3. Click "Test Step" to get the test URL
4. Use Postman to send a POST request:

```json
POST [your_test_webhook_url]
Headers:
  X-OMEGO-Auth: your_secret_token
  Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@test.com",
  "phone": "+1234567890",
  "origin": "Shanghai",
  "destination": "Los Angeles",
  "cargo_type": "FCL",
  "weight": 15000,
  "dimensions": "20ft container",
  "special_requirements": "Temperature controlled",
  "incoterms": "FOB",
  "currency": "USD"
}
```

**Expected Results:**
- ✅ New row in USERS sheet (if new user)
- ✅ New row in REQUESTS sheet with ID like `OMEGO-0001-REQ-01`
- ✅ Email sent to test forwarder addresses
- ✅ Row in BROADCAST_LOG
- ✅ Confirmation email to user

### Test 2: Quotation Submission (WF2)

1. Activate WF2
2. Add a test forwarder to REGISTERED_FORWARDERS sheet:
   ```
   FWDR-TEST | Test Company | John | test@forwarder.com | +123 | +123 | US | FCL,LCL | All | APPROVED
   ```
3. Send a test email to your OMEGO_REPLY_EMAIL:
   ```
   From: test@forwarder.com
   Subject: RE: OMEGO-0001-REQ-01 Quote
   
   Hello,
   
   Here is our quotation for request OMEGO-0001-REQ-01:
   
   Total Price: USD 2,500
   Transit Time: 18 days
   Validity: 7 days
   Carrier: Maersk
   Service: FCL
   
   Best regards,
   Test Company
   ```

**Expected Results:**
- ✅ AI extracts price=2500, currency=USD, transit=18, etc.
- ✅ New row in QUOTATIONS sheet
- ✅ quotation_count in REQUESTS increments to 1
- ✅ User receives email notification
- ✅ Forwarder receives confirmation email

### Test 3: Auto-Close (WF3)

1. Manually trigger WF2 twice more with different forwarder emails
2. On the 3rd quotation, WF3 should auto-trigger

**Expected Results:**
- ✅ Request status changes to CLOSED
- ✅ User receives summary email with all 3 quotations
- ✅ Non-quoting forwarders receive closure notification
- ✅ Row in EVENTS_LOG

---

## ✅ GO-LIVE CHECKLIST

Before launching to production:

### Phase 1: Infrastructure
- [ ] Google Sheets with all 8 tabs created
- [ ] All column headers added and formatted
- [ ] All n8n credentials configured and tested
- [ ] All environment variables set correctly
- [ ] Webhook authentication enabled

### Phase 2: Workflows
- [ ] All 7 workflows imported
- [ ] All credentials linked to workflows
- [ ] Workflow IDs updated in environment variables
- [ ] Error handling workflows linked
- [ ] All workflows activated

### Phase 3: Testing
- [ ] Test request submission works
- [ ] Test email broadcasting to forwarders
- [ ] Test WhatsApp sending (if enabled)
- [ ] Test AI quotation extraction
- [ ] Test auto-close on 3rd quotation
- [ ] Test error handler for late replies
- [ ] Test partner registration
- [ ] Test admin approval flow

### Phase 4: Production Setup
- [ ] Production webhook URLs configured
- [ ] Website form pointing to production webhook
- [ ] Dashboard API endpoints ready
- [ ] Real forwarders added to REGISTERED_FORWARDERS
- [ ] Gmail filters set up for "Forwarder-Replies" label
- [ ] Monitoring/alerts configured

### Phase 5: Documentation
- [ ] Team trained on how to use n8n
- [ ] Admin guide for approving forwarders
- [ ] Support guide for handling failed workflows
- [ ] Backup strategy for Google Sheets

---

## 🔍 TROUBLESHOOTING

### Issue: "Webhook not receiving data"
**Solution:**
- Check webhook authentication header matches
- Verify URL is correct (copy from test step)
- Check n8n workflow is active
- Look at execution history for errors

### Issue: "AI extraction fails"
**Solution:**
- Check Anthropic API key is valid
- Verify API key has credits/quota
- Check email body is being passed correctly
- Test with simpler email format first

### Issue: "Google Sheets update fails"
**Solution:**
- Verify service account has Editor access
- Check sheet ID is correct
- Ensure tab names match exactly (case-sensitive)
- Check column names in mapping

### Issue: "WhatsApp not sending"
**Solution:**
- Verify Twilio account is active
- Check WhatsApp number is approved
- Ensure phone numbers have country codes
- Check Twilio API credentials

### Issue: "No emails being sent"
**Solution:**
- Check Gmail OAuth is authorized
- Verify Gmail daily sending limits (500/day free, 2000/day Workspace)
- Check spam folder
- Look at Gmail quota in Google Admin

### Issue: "Quotation count not incrementing"
**Solution:**
- Check lookup column is set to "request_id"
- Verify lookup value matches exactly
- Try using VLOOKUP in Google Sheets manually
- Check update permissions

---

## 📞 SUPPORT & NEXT STEPS

### Optimization Recommendations:

1. **Week 1**: Run with 5-10 beta forwarders
2. **Week 2**: Monitor AI extraction accuracy
3. **Week 3**: Add more forwarders gradually
4. **Week 4**: Implement rate limiting if needed

### Scaling Considerations:

- **50+ requests/day**: Consider migrating from Google Sheets to Supabase
- **100+ forwarders**: Implement smart routing by specialization
- **Multiple currencies**: Add currency conversion API
- **Global expansion**: Add timezone handling

### Future Enhancements:

- Payment processing integration
- Booking confirmation workflow
- Shipment tracking integration
- Mobile app for forwarders
- Advanced analytics dashboard
- A/B testing for email templates

---

## 🎉 YOU'RE READY!

Your OMEGO automation system is now production-ready with:

✅ **7 Intelligent Workflows**
✅ **AI-Powered Quotation Processing**
✅ **Automatic Request Closure**
✅ **Smart Forwarder Routing**
✅ **Complete Error Handling**
✅ **Real-time Dashboard Updates**
✅ **Dual-Channel Notifications**

**Start with 5 test requests and scale from there. Good luck! 🚀**
