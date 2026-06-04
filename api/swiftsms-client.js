const https = require('https');

const SWIFTSMS_HOST = 'swiftsms.macroit.org';
const SWIFTSMS_PATH = '/api/send_message';

/** SwiftSMS Postman collection: 260973750029,260769891754 */
function formatSwiftSmsPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('260')) return digits;
  if (digits.startsWith('0')) return `260${digits.slice(1)}`;
  if (digits.length === 9) return `260${digits}`;
  return digits;
}

function formatSwiftSmsNumbers(numbers) {
  return String(numbers)
    .split(',')
    .map((n) => formatSwiftSmsPhone(n.trim()))
    .filter(Boolean)
    .join(',');
}

function formatSwiftSmsError(data, status) {
  const parts = [];
  if (data?.message) parts.push(data.message);
  if (data?.errors && typeof data.errors === 'object') {
    for (const [field, msgs] of Object.entries(data.errors)) {
      const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
      parts.push(`${field}: ${text}`);
    }
  }
  return parts.join(' — ') || `SwiftSMS failed (${status}).`;
}

/**
 * SwiftSMS documents GET + JSON body; Node fetch omits body on GET.
 * Use low-level https so the payload is sent like PHP/cURL.
 */
function sendSwiftSms({ token, senderId, numbers, message }) {
  const formattedNumbers = formatSwiftSmsNumbers(numbers);
  const body = JSON.stringify({
    sender_id: senderId,
    numbers: formattedNumbers,
    message: String(message),
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SWIFTSMS_HOST,
        path: SWIFTSMS_PATH,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let text = '';
        res.on('data', (chunk) => {
          text += chunk;
        });
        res.on('end', () => {
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = { raw: text };
          }
          const status = res.statusCode || 500;
          if (status >= 200 && status < 300) {
            resolve({ status, data });
            return;
          }
          const err = new Error(formatSwiftSmsError(data, status));
          err.status = status;
          err.details = data;
          reject(err);
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { sendSwiftSms };
