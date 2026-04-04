#!/usr/bin/env node
/**
 * CargoLink — n8n Workflow Auto-Deployer
 * Usage: node deploy_n8n.js <n8n-admin-password>
 *    or: node deploy_n8n.js <n8n-admin-email> <n8n-admin-password>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const N8N_BASE = 'https://n8n.srv1520651.hstgr.cloud';

const WORKFLOWS_TO_DEPLOY = [
  'WF1_UPDATED.json',
  'WF2_FIXED.json',
  'WF3_UPDATED.json',
  'WF4_Forwarder_Registration.json',
  'WF5_Forwarder_Decision_Email.json',
  'WF6_Deal_Locked_UPDATED.json',
  'WF7_New_Conversation.json',
  'WF_BID_CONFIRM.json',
  'WF_PASSWORD_RESET.json',
  'WF_WELCOME.json',
];

const PLAN_DIR = path.join(__dirname, 'n8n_plan');

const args = process.argv.slice(2);
let adminEmail, adminPassword;
if (args.length === 2) { adminEmail = args[0]; adminPassword = args[1]; }
else if (args.length === 1) { adminEmail = 'keerthivanan.ds.ai@gmail.com'; adminPassword = args[0]; }
else { console.error('Usage: node deploy_n8n.js <password>'); process.exit(1); }

// ─── HTTP HELPER ────────────────────────────────────────────────────────────
function request(method, urlStr, body, apiKey, cookies) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;
    const bodyStr = body ? JSON.stringify(body) : '';

    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (apiKey) headers['X-N8N-API-KEY'] = apiKey;
    if (cookies) headers['Cookie'] = cookies;
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method, headers,
      rejectUnauthorized: false,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, json, setCookie, raw: data });
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 CargoLink n8n Workflow Deployer');
  console.log('='.repeat(45));
  console.log(`Target: ${N8N_BASE}`);
  console.log(`Email:  ${adminEmail}\n`);

  // 1. LOGIN to get session cookie
  console.log('⏳ Logging in...');
  const loginRes = await request('POST', `${N8N_BASE}/rest/login`, {
    emailOrLdapLoginId: adminEmail,
    password: adminPassword,
  });

  if (loginRes.status !== 200) {
    console.error(`❌ Login failed (HTTP ${loginRes.status}): ${loginRes.raw?.slice(0, 200)}`);
    process.exit(1);
  }
  const cookies = (loginRes.setCookie || []).map(c => c.split(';')[0]).join('; ');
  console.log('✅ Login successful');

  // 2. LIST existing workflows via session cookie
  console.log('⏳ Fetching existing workflows...');
  const listRes = await request('GET', `${N8N_BASE}/rest/workflows?limit=100`, null, null, cookies);
  if (listRes.status !== 200) {
    console.error(`❌ Failed to list workflows (${listRes.status}): ${listRes.raw?.slice(0, 200)}`);
    process.exit(1);
  }
  const allWorkflows = listRes.json?.data || listRes.json || [];
  const existingByName = {};
  for (const wf of allWorkflows) existingByName[wf.name] = wf.id;
  console.log(`   Found ${allWorkflows.length} existing workflows\n`);

  // 4. DEPLOY EACH WORKFLOW
  let created = 0, updated = 0, failed = 0, activated = 0;

  for (const filename of WORKFLOWS_TO_DEPLOY) {
    const filePath = path.join(PLAN_DIR, filename);
    if (!fs.existsSync(filePath)) { console.log(`⚠️  SKIP — Not found: ${filename}`); continue; }

    let wfJson;
    try { wfJson = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
    catch (e) { console.log(`❌ FAIL — Cannot parse ${filename}: ${e.message}`); failed++; continue; }

    const wfName = wfJson.name;
    const existingId = existingByName[wfName];

    const payload = {
      name: wfJson.name,
      nodes: wfJson.nodes,
      connections: wfJson.connections,
      settings: wfJson.settings || { executionOrder: 'v1' },
      staticData: wfJson.staticData || null,
    };

    let workflowId;

    if (existingId) {
      // UPDATE via PATCH /rest/workflows/{id}
      const res = await request('PATCH', `${N8N_BASE}/rest/workflows/${existingId}`, payload, null, cookies);
      if (res.status === 200) {
        workflowId = existingId;
        console.log(`✅ UPDATED — ${wfName}`);
        updated++;
      } else {
        console.log(`❌ UPDATE FAILED (${res.status}) — ${wfName}: ${res.raw?.slice(0, 150)}`);
        failed++;
        continue;
      }
    } else {
      // CREATE via POST /rest/workflows
      const res = await request('POST', `${N8N_BASE}/rest/workflows`, payload, null, cookies);
      if (res.status === 200 || res.status === 201) {
        workflowId = res.json?.id || res.json?.data?.id;
        console.log(`✅ CREATED — ${wfName} (id: ${workflowId})`);
        created++;
      } else {
        console.log(`❌ CREATE FAILED (${res.status}) — ${wfName}: ${res.raw?.slice(0, 150)}`);
        failed++;
        continue;
      }
    }

    // ACTIVATE via POST /rest/workflows/{id}/activate
    if (workflowId) {
      const actRes = await request('POST', `${N8N_BASE}/rest/workflows/${workflowId}/activate`, null, null, cookies);
      if (actRes.status === 200) {
        console.log(`   ▶  Activated`);
        activated++;
      } else {
        console.log(`   ⚠  Could not activate (${actRes.status}) — may need manual activation`);
      }
    }
  }

  // 5. SUMMARY
  console.log('\n' + '='.repeat(45));
  console.log('📊 Deploy Summary:');
  console.log(`   ✅ Updated:   ${updated}`);
  console.log(`   ✅ Created:   ${created}`);
  console.log(`   ▶  Activated: ${activated}`);
  if (failed > 0) {
    console.log(`   ❌ Failed:    ${failed}`);
    console.log('\n   Check errors above.');
  } else {
    console.log('\n   🎉 All workflows deployed successfully!');
  }
  console.log('='.repeat(45) + '\n');
}

main().catch(err => { console.error('Fatal error:', err.message); process.exit(1); });
