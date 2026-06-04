const LENCO_COLLECTION_URL = 'https://api.lenco.co/access/v2/collections/mobile-money';

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
    const { phone, operator, amount, reference } = req.body || {};
    if (!phone || !operator || amount == null || !reference) {
      return res.status(400).json({ error: 'phone, operator, amount, and reference are required.' });
    }

    const token = process.env.LENCO_API_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'LENCO_API_TOKEN must be configured on the server.' });
    }

    const response = await fetch(LENCO_COLLECTION_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        operator,
        phone: String(phone),
        amount: String(amount),
        reference: String(reference),
        bearer: 'customer',
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
        error: data.message || data.error || `Lenco collection failed (${response.status}).`,
        details: data,
      });
    }

    const lencoRef =
      data.data?.reference ||
      data.data?.id ||
      data.reference ||
      reference;

    return res.status(200).json({
      success: true,
      reference: lencoRef,
      data,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Collection failed' });
  }
};
