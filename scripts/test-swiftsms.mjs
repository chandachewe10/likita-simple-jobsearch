import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { sendSwiftSms } = require('../api/swiftsms-client.js');

function loadEnv() {
  const raw = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

loadEnv();

const token = process.env.SWIFTSMS_TOKEN;
const senderId = process.env.SWIFTSMS_SENDER_ID || 'FIEROTECHS';
const numbers = '0973750029';
const message = 'Testing API from Likita';

console.log('sender_id:', senderId);
console.log('numbers (formatted):', numbers.replace(/\D/g, '').startsWith('260') ? numbers : '260' + numbers.replace(/\D/g, '').replace(/^0/, ''));

try {
  const result = await sendSwiftSms({ token, senderId, numbers, message });
  console.log('SUCCESS', result.status, JSON.stringify(result.data));
} catch (e) {
  console.log('FAILED', e.status, e.message);
  if (e.details) console.log('details:', JSON.stringify(e.details));
  process.exit(1);
}
