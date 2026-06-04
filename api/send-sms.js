const SWIFTSMS_URL = 'https://swiftsms.macroit.org/api/send_message';

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
    const senderId = process.env.SWIFTSMS_SENDER_ID || 'FIEROTECHS';
    if (!token) {
      return res.status(500).json({ error: 'SWIFTSMS_TOKEN is not configured on the server.' });
    }

    const response = await fetch(SWIFTSMS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sender_id: senderId,
        numbers,
        message,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || `SwiftSMS failed (${response.status}).`,
        details: data,
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'SMS failed' });
  }
};
