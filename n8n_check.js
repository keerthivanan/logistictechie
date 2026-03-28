const Database = require('better-sqlite3');
const db = new Database('/home/node/.n8n/database.sqlite', { readonly: true });

const workflows = db.prepare('SELECT id, name, active FROM workflow_entity ORDER BY createdAt DESC').all();
console.log('=== WORKFLOWS ===');
workflows.forEach(w => {
  const status = w.active ? '[ACTIVE]  ' : '[off]     ';
  console.log(status + w.name);
});

const creds = db.prepare('SELECT name, type FROM credentials_entity').all();
console.log('\n=== CREDENTIALS ===');
if (!creds.length) console.log('  none configured');
creds.forEach(c => console.log(' - ' + c.name + ' (' + c.type + ')'));

const hooks = db.prepare('SELECT webhookPath, method FROM webhook_entity').all();
console.log('\n=== ACTIVE WEBHOOKS ===');
if (!hooks.length) console.log('  none registered');
hooks.forEach(h => console.log('  ' + h.method + ' /' + h.webhookPath));

db.close();
