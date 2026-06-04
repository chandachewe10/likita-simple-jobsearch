const https = require('https');

const SWIFTSMS_HOST = 'swiftsms.macroit.org';
const SWIFTSMS_PATH = '/api/send_message';

/**
 * SwiftSMS documents GET + JSON body; Node fetch omits body on GET.
 * Use low-level https so the payload is sent like PHP/cURL.
 */
function sendSwiftSms({ token, senderId, numbers, message }) {
  const body = JSON.stringify({
    sender_id: senderId,
    numbers: String(numbers),
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
          const err = new Error(
            data.message || data.error || `SwiftSMS failed (${status}).`
          );
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
