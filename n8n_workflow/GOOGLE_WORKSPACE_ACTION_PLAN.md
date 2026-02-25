# 🚀 GOOGLE WORKSPACE SETUP - START RIGHT NOW!

## ✅ WHAT YOU CHOSE: Google Workspace
**Cost:** $12/month (totally worth it!)
**Result:** Your workflows work PERFECTLY with ZERO modifications!

---

## 🎯 LET'S DO THIS - STEP BY STEP

### 📱 STEP 1: SIGN UP FOR GOOGLE WORKSPACE (RIGHT NOW - 10 mins)

**Open this link:** https://workspace.google.com/

1. Click **"Get Started"** (blue button)

2. **Business Information:**
   - Business name: OMEGO
   - Number of employees: Just you
   - Country/Region: [Your country]
   - Click "Next"

3. **Contact Information:**
   - Your name
   - Your current email (for admin purposes)
   - Click "Next"

4. **Domain Setup:**
   - Select: **"Yes, I have one I can use"**
   - Enter: **omegoonline.com**
   - Click "Next"

5. **Admin Account:**
   - Username: admin (or your name)
   - This creates: admin@omegoonline.com
   - Password: [CREATE STRONG PASSWORD - SAVE IT!]
   - Click "Next"

6. **Choose Plan:**
   - Select: **"Business Starter"** ($6 per user/month)
   - Click "Next"

7. **Payment:**
   - Add your credit card
   - Confirm subscription
   - Click "Agree and continue"

**✅ DONE! You now have a Google Workspace account!**

---

### 🔐 STEP 2: VERIFY DOMAIN OWNERSHIP (10 mins)

**You'll see a screen that says:** "Verify omegoonline.com"

Google will give you a **TXT record** to add to your domain. It looks like:

```
google-site-verification=abc123xyz456RANDOM789
```

**Copy this code!** Now let's add it to Namecheap:

#### Add TXT Record to Namecheap:

1. **Open new tab:** https://namecheap.com
2. Login to your account
3. Click **"Domain List"** in sidebar
4. Find **omegoonline.com** → Click **"Manage"**
5. Click **"Advanced DNS"** tab
6. Scroll to **"Host Records"** section
7. Click **"Add New Record"** button

8. **Fill in:**
   - Type: **TXT Record**
   - Host: **@**
   - Value: **[paste the google-site-verification code]**
   - TTL: **Automatic**
   - Click **"Save All Changes"** (green checkmark)

**✅ SAVED!**

#### Now Verify in Google:

1. Go back to Google Workspace tab
2. Wait **5-10 minutes** (go grab coffee ☕)
3. Click **"Verify my domain"** button
4. If it says "Success!" → **Continue to Step 3**
5. If it fails → Wait 30 more minutes and try again

**Common issue:** DNS can take up to 1 hour to propagate. Be patient!

---

### 📧 STEP 3: UPDATE MX RECORDS (CRITICAL - 15 mins)

**This makes emails go to Google instead of Namecheap!**

Back in **Namecheap → omegoonline.com → Advanced DNS**:

#### Part A: DELETE OLD MX RECORDS

Look for any **MX Records** in the Host Records section.

**DELETE THESE IF YOU SEE THEM:**
- Any MX record pointing to Namecheap servers
- Any MX record pointing to mail.privateemail.com
- Any email-related records

**How to delete:**
- Click the **trash icon** (🗑️) next to each MX record
- Click "Yes, delete"
- Click "Save All Changes"

#### Part B: ADD GOOGLE MX RECORDS

Click **"Add New Record"** 5 times and create these:

**MX Record #1:**
- Type: **MX Record**
- Host: **@**
- Value: **smtp.google.com.**
- Priority: **1**
- TTL: **Automatic**

**MX Record #2:**
- Type: **MX Record**
- Host: **@**
- Value: **alt1.gmail-smtp-in.l.google.com.**
- Priority: **5**
- TTL: **Automatic**

**MX Record #3:**
- Type: **MX Record**
- Host: **@**
- Value: **alt2.gmail-smtp-in.l.google.com.**
- Priority: **5**
- TTL: **Automatic**

**MX Record #4:**
- Type: **MX Record**
- Host: **@**
- Value: **alt3.gmail-smtp-in.l.google.com.**
- Priority: **10**
- TTL: **Automatic**

**MX Record #5:**
- Type: **MX Record**
- Host: **@**
- Value: **alt4.gmail-smtp-in.l.google.com.**
- Priority: **10**
- TTL: **Automatic**

**⚠️ SUPER IMPORTANT:**
- Each value MUST have a **DOT at the end** (like smtp.google.com**.**)
- Priority numbers must be EXACT (1, 5, 5, 10, 10)
- Host must be **@** (not blank, not omegoonline.com)

Click **"Save All Changes"**

**✅ MX Records Updated!**

**Note:** It takes 24-48 hours for emails to fully switch to Google. But you can create accounts now!

---

### 👥 STEP 4: CREATE YOUR EMAIL ACCOUNTS (5 mins)

Back in **Google Workspace Admin Console**:

1. Click **"Users"** in the left menu
2. You'll see your admin account already there

#### Create quote@omegoonline.com:

3. Click **"Add new user"** (blue button)
4. Fill in:
   - First name: **OMEGO**
   - Last name: **Quotes**
   - Primary email: **quote** (it auto-adds @omegoonline.com)
   - Password: Click **"Create password"** or make your own
   - **SAVE THIS PASSWORD!**
   - Click **"Add new user"**

**✅ quote@omegoonline.com created!**

#### Create support@omegoonline.com:

5. Click **"Add new user"** again
6. Fill in:
   - First name: **OMEGO**
   - Last name: **Support**
   - Primary email: **support**
   - Password: Click **"Create password"** or make your own
   - **SAVE THIS PASSWORD!**
   - Click **"Add new user"**

**✅ support@omegoonline.com created!**

---

### ✉️ STEP 5: TEST EMAILS (5 mins - DO THIS TOMORROW)

**Wait 24 hours after updating MX records**, then:

1. From your personal Gmail, send email to: **quote@omegoonline.com**
2. Check if you receive it:
   - Go to: https://mail.google.com
   - Login with: quote@omegoonline.com
   - Check inbox
3. If email arrived → **Perfect! Continue to Step 6**
4. If no email → Wait another 24 hours (DNS propagation)

---

### 🔗 STEP 6: CONNECT TO N8N (10 mins)

**Make sure you've imported my workflow files first!**

Now let's connect your emails to n8n:

#### Connect quote@omegoonline.com:

1. Open n8n
2. Go to **Settings** → **Credentials**
3. Click **"New Credential"**
4. Search for and select: **"Gmail OAuth2 API"**
5. Click **"Sign in with Google"**
6. **Login with:** quote@omegoonline.com (and its password)
7. Google will ask: "Allow n8n to access Gmail?"
8. Click **"Allow"**
9. Back in n8n, name it: **"Gmail OAuth - Quotes"**
10. Click **"Save"**

**✅ quote@ connected!**

#### Connect support@omegoonline.com:

11. Click **"New Credential"** again
12. Select: **"Gmail OAuth2 API"**
13. Click **"Sign in with Google"**
14. **Login with:** support@omegoonline.com (and its password)
15. Click **"Allow"**
16. Name it: **"Gmail OAuth - Support"**
17. Click **"Save"**

**✅ support@ connected!**

---

### ⚙️ STEP 7: UPDATE N8N ENVIRONMENT VARIABLES (5 mins)

In n8n, go to **Settings** → **Variables**:

Click **"Add Variable"** for each of these:

```bash
Variable Name: OMEGO_REPLY_EMAIL
Value: quote@omegoonline.com

Variable Name: OMEGO_ADMIN_EMAIL
Value: support@omegoonline.com

Variable Name: OMEGO_SUPPORT_EMAIL
Value: support@omegoonline.com

Variable Name: OMEGO_DASHBOARD_URL
Value: https://www.omegoonline.com

Variable Name: OMEGO_FORWARDER_DASHBOARD_URL
Value: https://www.omegoonline.com/forwarder

Variable Name: OMEGO_REGISTRATION_URL
Value: https://www.omegoonline.com/register

Variable Name: OMEGO_MASTER_SHEET_ID
Value: [your Google Sheet ID - we'll set this up next]
```

Click **"Save"** after adding all variables.

**✅ Variables set!**

---

### 📊 STEP 8: SETUP GOOGLE SHEETS (10 mins)

1. Go to: https://sheets.google.com
2. Create new spreadsheet
3. Name it: **"OMEGO Master Database"**
4. Create these **8 tabs** (click + at bottom):
   - USERS
   - REQUESTS
   - REGISTERED_FORWARDERS
   - QUOTATIONS
   - BROADCAST_LOG
   - EVENTS_LOG
   - ANALYTICS
   - REJECTED_ATTEMPTS

5. In each tab, add column headers from **COMPLETE_SETUP_GUIDE.md**

6. Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
   ```

7. Go back to n8n → Settings → Variables
8. Edit **OMEGO_MASTER_SHEET_ID** variable
9. Paste your Sheet ID
10. Save

**✅ Google Sheets ready!**

---

### 📥 STEP 9: IMPORT WORKFLOWS (5 mins)

**In n8n:**

1. Go to **Workflows**
2. Click **"Import from File"**
3. Upload: **WF1_Request_Intake_Broadcast.json**
4. Click on the workflow
5. For each node with a credential:
   - Click the credential dropdown
   - Select **"Gmail OAuth - Quotes"** or **"Gmail OAuth - Support"**
6. Click **"Save"**
7. Click **"Activate"** toggle

**Repeat for:**
- WF2_AI_Quotation_Catcher.json
- WF3_Auto_Close_Request.json
- WF4-7 (from the configuration guide)

**✅ Workflows imported!**

---

### 🧪 STEP 10: TEST! (15 mins)

**Test Request Submission:**

1. In WF1, click **"Webhook - New Request"** node
2. Click **"Test Step"**
3. Copy the webhook URL

4. Use Postman or curl:

```bash
curl -X POST [your_webhook_url] \
-H "Content-Type: application/json" \
-H "X-OMEGO-Auth: your_secret_token" \
-d '{
  "name": "Test User",
  "email": "test@test.com",
  "phone": "+1234567890",
  "origin": "Shanghai",
  "destination": "Los Angeles",
  "cargo_type": "FCL",
  "weight": 15000,
  "dimensions": "20ft container",
  "incoterms": "FOB",
  "currency": "USD"
}'
```

**Check:**
- ✅ New row in Google Sheets
- ✅ Email received from support@omegoonline.com
- ✅ Confirmation shows Request ID

**✅ IT WORKS!**

---

## 🎉 YOU'RE LIVE!

**You now have:**
- ✅ Google Workspace with quote@ and support@ emails
- ✅ Emails connected to n8n with OAuth2
- ✅ All workflows imported and working
- ✅ Professional email setup that won't go to spam
- ✅ 2,000 emails/day capacity
- ✅ Zero modifications needed!

---

## 📋 QUICK CHECKLIST:

**TODAY (30 mins):**
- [ ] Sign up Google Workspace
- [ ] Add verification TXT record to Namecheap
- [ ] Verify domain

**TOMORROW (30 mins):**
- [ ] Update MX records in Namecheap
- [ ] Create quote@ and support@ accounts
- [ ] Test email delivery
- [ ] Connect to n8n

**DAY 3 (30 mins):**
- [ ] Setup Google Sheets
- [ ] Import workflows
- [ ] Test webhook
- [ ] 🚀 GO LIVE!

---

## 🆘 STUCK? COMMON ISSUES:

**"Can't verify domain"**
→ Wait 1 hour, DNS takes time

**"Emails not arriving"**
→ Wait 24 hours after MX records update

**"n8n won't connect"**
→ Make sure 2FA is OFF on those accounts

**"Workflow fails"**
→ Check credential assignments in each node

---

## 💪 YOU GOT THIS!

Google Workspace is the right choice! Your OMEGO platform will be professional and reliable.

**Need help?** Just ask! I'm here for you! 🚀

Start with Step 1 RIGHT NOW! 👆
