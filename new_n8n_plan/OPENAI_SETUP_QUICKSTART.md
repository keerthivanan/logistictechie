# OMEGO n8n integration: OpenAI Edition 🚀

### 1. Get Your OpenAI API Key
1. Go to: [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new secret key named `OMEGO n8n`.
3. Copy it immediately!

### 2. Add Credentials in n8n
1. n8n -> **Settings** -> **Credentials**.
2. **+ New Credential** -> Search **OpenAI**.
3. Name it: `OpenAI API`.
4. Paste your key and click **Save**.

### 3. Finalize WF2 Workflow
1. Delete any old `WF2` in n8n.
2. Import the NEW `WF2_OMEGO_Process_Quotations.json`.
3. Click on the **OpenAI** node and ensure the `OpenAI API` credential is selected.
4. Click on the **Execute Workflow - Trigger WF3** node and paste your **WF3 Workflow ID**.
5. **Save** and **Activate**.

### 4. Final Handshake
Ensure your `backend/.env` has the correct `N8N_MARKETPLACE_SUBMIT_WEBHOOK` from **WF1**.

**Your system is now powered by GPT-4o! 💪**
