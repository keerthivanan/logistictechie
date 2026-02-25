# OMEGO n8n Workflows 4-7 - Configuration Guide

## WORKFLOW 4: Partner Registration Handler

```json
{
  "name": "WF4 - Partner Registration",
  "nodes": [
    {
      "name": "Webhook - Partner Registration",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "omego-partner-registration",
        "authentication": "headerAuth"
      }
    },
    {
      "name": "Validate Required Fields",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const required = ['company_name', 'contact_person', 'email', 'phone', 'registration_number'];\nconst missing = required.filter(f => !$json.body[f]);\nif (missing.length > 0) {\n  throw new Error(`Missing required fields: ${missing.join(', ')}`);\n}\nreturn { json: $json.body };"
      }
    },
    {
      "name": "Generate Forwarder ID",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Get next FWDR ID from Google Sheets count\nconst forwarders = $('Get Forwarders Count').all();\nconst nextId = forwarders.length + 1;\nreturn { json: { forwarder_id: `FWDR-${String(nextId).padStart(4, '0')}` } };"
      }
    },
    {
      "name": "Save to Forwarders Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "append",
        "range": "REGISTERED_FORWARDERS!A:Z",
        "columns": {
          "forwarder_id": "={{ $('Generate Forwarder ID').item.json.forwarder_id }}",
          "company_name": "={{ $('Validate Required Fields').item.json.company_name }}",
          "contact_person": "={{ $('Validate Required Fields').item.json.contact_person }}",
          "email": "={{ $('Validate Required Fields').item.json.email }}",
          "phone": "={{ $('Validate Required Fields').item.json.phone }}",
          "whatsapp": "={{ $('Validate Required Fields').item.json.whatsapp || $('Validate Required Fields').item.json.phone }}",
          "country": "={{ $('Validate Required Fields').item.json.country }}",
          "specializations": "={{ $('Validate Required Fields').item.json.specializations }}",
          "routes": "={{ $('Validate Required Fields').item.json.routes }}",
          "status": "PENDING_REVIEW",
          "registered_at": "={{ $now.toISO() }}"
        }
      }
    },
    {
      "name": "Upload Documents to Drive",
      "type": "n8n-nodes-base.googleDrive",
      "parameters": {
        "operation": "upload",
        "folderId": "={{ $env.OMEGO_FORWARDER_DOCS_FOLDER }}",
        "name": "={{ $('Generate Forwarder ID').item.json.forwarder_id }}_{{ $json.filename }}"
      }
    },
    {
      "name": "Send Admin Notification",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "sendTo": "={{ $env.OMEGO_ADMIN_EMAIL }}",
        "subject": "🆕 New Forwarder Registration - {{ $('Generate Forwarder ID').item.json.forwarder_id }}",
        "message": "New forwarder registration requires review:\n\nCompany: {{ $('Validate Required Fields').item.json.company_name }}\nContact: {{ $('Validate Required Fields').item.json.contact_person }}\nEmail: {{ $('Validate Required Fields').item.json.email }}\nID: {{ $('Generate Forwarder ID').item.json.forwarder_id }}\n\nPlease review in Google Sheets and update status to APPROVED or REJECTED."
      }
    },
    {
      "name": "Send Applicant Confirmation",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "sendTo": "={{ $('Validate Required Fields').item.json.email }}",
        "subject": "✅ Registration Received - {{ $('Generate Forwarder ID').item.json.forwarder_id }}",
        "message": "Dear {{ $('Validate Required Fields').item.json.contact_person }},\n\nThank you for registering with OMEGO.\n\nYour Reference ID: {{ $('Generate Forwarder ID').item.json.forwarder_id }}\n\nWe will review your application and respond within 2-3 business days."
      }
    }
  ]
}
```

---

## WORKFLOW 5: Late Reply & Error Handler

```json
{
  "name": "WF5 - Error Handler & Late Replies",
  "nodes": [
    {
      "name": "Execute Workflow Trigger",
      "type": "n8n-nodes-base.executeWorkflowTrigger"
    },
    {
      "name": "Check Error Type",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "dataPropertyName": "error_type",
        "rules": {
          "rules": [
            { "value": "REQUEST_CLOSED", "output": 0 },
            { "value": "UNKNOWN_SENDER", "output": 1 },
            { "value": "DUPLICATE_QUOTE", "output": 2 },
            { "value": "REQUEST_FULL", "output": 3 }
          ]
        }
      }
    },
    {
      "name": "Reply - Request Closed",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "sendTo": "={{ $json.sender_email }}",
        "subject": "RE: {{ $json.request_id }} - Request Closed",
        "message": "Dear Forwarder,\n\nThank you for your quotation for {{ $json.request_id }}.\n\nUnfortunately, this request has already received 3 quotations and has been automatically closed. No further quotations can be accepted.\n\nWe appreciate your interest and look forward to working with you on future requests.\n\nBest regards,\nOMEGO Platform"
      }
    },
    {
      "name": "Reply - Unknown Sender",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "sendTo": "={{ $json.sender_email }}",
        "subject": "RE: Quotation - Registration Required",
        "message": "Hello,\n\nWe received your email but your address ({{ $json.sender_email }}) is not registered in our OMEGO partner network.\n\nTo submit quotations, please register at: {{ $env.OMEGO_REGISTRATION_URL }}\n\nBest regards,\nOMEGO Platform"
      }
    },
    {
      "name": "Reply - Duplicate Quote",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "sendTo": "={{ $json.sender_email }}",
        "subject": "RE: {{ $json.request_id }} - Duplicate Submission",
        "message": "Dear {{ $json.sender_name }},\n\nWe already received your quotation for {{ $json.request_id }}.\n\nOnly one quotation per request is allowed. Your original submission is on record.\n\nBest regards,\nOMEGO Platform"
      }
    },
    {
      "name": "Log Rejected Attempt",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "append",
        "range": "REJECTED_ATTEMPTS!A:Z",
        "columns": {
          "timestamp": "={{ $now.toISO() }}",
          "sender_email": "={{ $json.sender_email }}",
          "request_id": "={{ $json.request_id }}",
          "error_type": "={{ $json.error_type }}",
          "error_message": "={{ $json.error_message }}"
        }
      }
    }
  ]
}
```

---

## WORKFLOW 6: Admin Approval & Forwarder Activation

```json
{
  "name": "WF6 - Forwarder Activation",
  "nodes": [
    {
      "name": "Google Sheets Trigger",
      "type": "n8n-nodes-base.googleSheetsTrigger",
      "parameters": {
        "sheetId": "={{ $env.OMEGO_MASTER_SHEET_ID }}",
        "range": "REGISTERED_FORWARDERS!A:Z",
        "event": "row-updated",
        "filters": {
          "column": "status",
          "condition": "equals",
          "value": "APPROVED"
        }
      }
    },
    {
      "name": "Update Activation Date",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "update",
        "columns": {
          "activated_at": "={{ $now.toISO() }}",
          "status": "ACTIVE"
        }
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "sendTo": "={{ $json.email }}",
        "subject": "🎉 Welcome to OMEGO - Account Activated!",
        "emailType": "html",
        "message": "<!DOCTYPE html>\n<html>\n<body style=\"font-family: Arial;\">\n  <div style=\"background: #28A745; color: white; padding: 30px; text-align: center;\">\n    <h1>🎉 Welcome to OMEGO!</h1>\n  </div>\n  <div style=\"padding: 30px;\">\n    <p>Dear {{ $json.contact_person }},</p>\n    <p>Congratulations! Your OMEGO partner account has been activated.</p>\n    <div style=\"background: #E8F4F8; padding: 20px; margin: 20px 0; border-radius: 5px;\">\n      <h3>Your Partner Details</h3>\n      <p><strong>Company:</strong> {{ $json.company_name }}</p>\n      <p><strong>Partner ID:</strong> {{ $json.forwarder_id }}</p>\n      <p><strong>Status:</strong> ACTIVE</p>\n    </div>\n    <h3>What's Next?</h3>\n    <ul>\n      <li>You'll start receiving freight request notifications via email and WhatsApp</li>\n      <li>Submit quotations by replying to request emails</li>\n      <li>Track your submissions in your dashboard</li>\n    </ul>\n    <div style=\"text-align: center; margin: 30px 0;\">\n      <a href=\"{{ $env.OMEGO_FORWARDER_DASHBOARD_URL }}\" style=\"background: #2E75B6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;\">Access Your Dashboard</a>\n    </div>\n  </div>\n</body>\n</html>"
      }
    },
    {
      "name": "Update Dashboard API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $env.OMEGO_DASHBOARD_URL }}/api/forwarder/activate",
        "body": {
          "forwarder_id": "={{ $json.forwarder_id }}",
          "status": "ACTIVE",
          "activated_at": "={{ $now.toISO() }}"
        }
      }
    }
  ]
}
```

---

## WORKFLOW 7: Daily Health Check & Analytics

```json
{
  "name": "WF7 - Daily Analytics & Health Check",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "value": "0 8 * * *" }]
        }
      }
    },
    {
      "name": "Get All OPEN Requests",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "read",
        "range": "REQUESTS!A:Z",
        "filters": {
          "conditions": [
            { "column": "status", "condition": "equal", "value": "OPEN" }
          ]
        }
      }
    },
    {
      "name": "Find Stale Requests",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Find requests older than 3 days with <3 quotations\nconst requests = $input.all();\nconst staleRequests = [];\nconst now = new Date();\nconst threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);\n\nfor (const req of requests) {\n  const submittedAt = new Date(req.json.submitted_at);\n  const quotationCount = parseInt(req.json.quotation_count) || 0;\n  \n  if (submittedAt < threeDaysAgo && quotationCount < 3) {\n    staleRequests.push(req);\n  }\n}\n\nreturn staleRequests;"
      }
    },
    {
      "name": "Calculate Daily Stats",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Calculate analytics for yesterday\nconst allRequests = $('Get All Requests (24h)').all();\nconst allQuotations = $('Get All Quotations (24h)').all();\n\nconst stats = {\n  date: new Date().toISOString().split('T')[0],\n  total_requests: allRequests.length,\n  total_quotations: allQuotations.length,\n  requests_closed: allRequests.filter(r => r.json.status === 'CLOSED').length,\n  avg_quotes_per_request: allRequests.length > 0 ? (allQuotations.length / allRequests.length).toFixed(2) : 0,\n  stale_requests_count: $('Find Stale Requests').all().length\n};\n\nreturn { json: stats };"
      }
    },
    {
      "name": "Save Analytics to Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "append",
        "range": "ANALYTICS!A:Z",
        "columns": {
          "date": "={{ $json.date }}",
          "total_requests": "={{ $json.total_requests }}",
          "total_quotations": "={{ $json.total_quotations }}",
          "requests_closed": "={{ $json.requests_closed }}",
          "avg_quotes_per_request": "={{ $json.avg_quotes_per_request }}",
          "stale_requests_count": "={{ $json.stale_requests_count }}"
        }
      }
    },
    {
      "name": "Send Admin Daily Report",
      "type": "n8n-nodes-base.gmail",
      "parameters": {
        "sendTo": "={{ $env.OMEGO_ADMIN_EMAIL }}",
        "subject": "📊 OMEGO Daily Report - {{ $json.date }}",
        "message": "OMEGO Platform Daily Report\n\n📈 Yesterday's Activity:\n• Total Requests: {{ $json.total_requests }}\n• Total Quotations: {{ $json.total_quotations }}\n• Requests Closed: {{ $json.requests_closed }}\n• Avg Quotes/Request: {{ $json.avg_quotes_per_request }}\n\n⚠️ Stale Requests (>3 days old, <3 quotes): {{ $json.stale_requests_count }}\n\n{{ $json.stale_requests_count > 0 ? 'Consider re-broadcasting or following up on stale requests.' : 'All requests are performing well!' }}"
      }
    },
    {
      "name": "Re-Broadcast Stale Requests",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 1
      }
    }
  ]
}
```

---

## CRITICAL SETUP REQUIREMENTS

### Environment Variables Needed:
```bash
OMEGO_MASTER_SHEET_ID=your_google_sheet_id
OMEGO_REPLY_EMAIL=quotations@omego.com
OMEGO_ADMIN_EMAIL=admin@omego.com
OMEGO_SUPPORT_EMAIL=support@omego.com
OMEGO_DASHBOARD_URL=https://your-dashboard.com
OMEGO_FORWARDER_DASHBOARD_URL=https://your-dashboard.com/forwarder
OMEGO_REGISTRATION_URL=https://your-site.com/register
OMEGO_FORWARDER_DOCS_FOLDER=google_drive_folder_id
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
WHATSAPP_FROM_NUMBER=+14155238886
WF3_AUTO_CLOSE_WORKFLOW_ID=workflow_id_from_n8n
WF5_ERROR_HANDLER_WORKFLOW_ID=workflow_id_from_n8n
```

### Google Sheets Structure:

**USERS Sheet:**
```
sovereign_id | name | email | phone
```

**REQUESTS Sheet:**
```
request_id | user_sovereign_id | user_email | user_name | origin | destination | 
cargo_type | weight_kg | dimensions | special_requirements | incoterms | currency | 
status | quotation_count | submitted_at | closed_at | closed_reason
```

**REGISTERED_FORWARDERS Sheet:**
```
forwarder_id | company_name | contact_person | email | phone | whatsapp | 
country | specializations | routes | status | registered_at | activated_at
```

**QUOTATIONS Sheet:**
```
quotation_id | request_id | forwarder_id | forwarder_company | total_price | 
currency | transit_days | validity_days | carrier | service_type | surcharges | 
payment_terms | notes | ai_summary | raw_email | status | received_at | expires_at
```

**BROADCAST_LOG Sheet:**
```
log_id | request_id | forwarder_id | forwarder_company | email_sent | 
whatsapp_sent | sent_at
```

**EVENTS_LOG Sheet:**
```
event_id | event_type | request_id | actor | description | timestamp
```

**ANALYTICS Sheet:**
```
date | total_requests | total_quotations | requests_closed | 
avg_quotes_per_request | stale_requests_count
```

**REJECTED_ATTEMPTS Sheet:**
```
timestamp | sender_email | request_id | error_type | error_message
```
