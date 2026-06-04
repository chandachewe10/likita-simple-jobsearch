const { sendSwiftSms } = require('./swiftsms-client');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { numbers, message } = req.body || {};
    if (!numbers || !message) {
      return res.status(400).json({ error: 'numbers and message are required.' });
    }

    const token = process.env.SWIFTSMS_TOKEN;
    const senderId = process.env.SWIFTSMS_SENDER_ID?.trim();
    if (!token) {
      return res.status(500).json({ error: 'SWIFTSMS_TOKEN is not configured on the server.' });
    }
    if (!senderId) {
      return res.status(500).json({
        error:
          'SWIFTSMS_SENDER_ID is not configured. Set it in Vercel (or .env) to your approved sender ID from the SwiftSMS dashboard.',
      });
    }

    const { data } = await sendSwiftSms({
      token,
      senderId,
      numbers,
      message,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return res.status(status).json({
      error: error.message || 'SMS failed',
      details: error.details,
    });
  }
};
