import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.AI_REVIEW_PORT || 3001);

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional if env vars are already set
  }
}

loadEnvFile();

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function buildPrompt(input) {
  const ratingText =
    input.previousRating != null
      ? `${input.previousRating.toFixed(1)} / 5 from ${input.ratedJobsCount} completed job${input.ratedJobsCount === 1 ? '' : 's'}`
      : 'No previous ratings yet';

  return `You are a hiring assistant for a job platform. Review this applicant and give a concise hiring recommendation.

Job title: ${input.jobTitle}
Job description: ${input.jobDescription}
Required skills: ${input.skillsRequired.join(', ') || 'Not specified'}

Applicant name: ${input.applicantName}
Applicant skills: ${input.applicantSkills.join(', ') || 'Not specified'}
Qualifications: ${input.qualifications || 'Not provided'}
Years of experience: ${input.yearsOfExperience}
Previous rating: ${ratingText}
Application letter: ${input.coverLetter?.trim() || 'Not provided'}

Respond ONLY with valid JSON in this exact shape:
{"recommendation":"strong"|"moderate"|"weak","summary":"2-3 sentences explaining the recommendation"}

Use:
- "strong" = good fit, recommend interviewing/hiring
- "moderate" = mixed fit, worth considering with caution
- "weak" = poor fit based on the available information`;
}

function parseReview(content) {
  const parsed = JSON.parse(content);
  if (!['strong', 'moderate', 'weak'].includes(parsed.recommendation)) {
    throw new Error('AI returned an invalid recommendation.');
  }
  if (!parsed.summary?.trim()) {
    throw new Error('AI returned an empty summary.');
  }
  return { recommendation: parsed.recommendation, summary: parsed.summary.trim() };
}

async function handleReviewRequest(body) {
  const input = body?.input;
  if (!input) throw new Error('Missing applicant input.');

  const apiKey = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.');
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You help employers review job applicants. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: buildPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 401) throw new Error('Invalid OpenAI API key.');
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned an empty response.');

  const parsed = parseReview(content);
  return {
    recommendation: parsed.recommendation,
    summary: parsed.summary,
    generatedAt: Date.now(),
  };
}

async function handleSmsRequest(body) {
  const { numbers, message } = body || {};
  if (!numbers || !message) throw new Error('numbers and message are required.');

  const token = process.env.SWIFTSMS_TOKEN;
  const senderId = process.env.SWIFTSMS_SENDER_ID || 'FIEROTECHS';
  if (!token) throw new Error('SWIFTSMS_TOKEN is not configured in .env');

  const response = await fetch('https://swiftsms.macroit.org/api/send_message', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sender_id: senderId, numbers, message }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || `SwiftSMS failed (${response.status}).`);
  }
  return { success: true, data };
}

async function handleLencoPayment(body) {
  const { phone, operator, amount, reference } = body || {};
  if (!phone || !operator || amount == null || !reference) {
    throw new Error('phone, operator, amount, and reference are required.');
  }

  const token = process.env.LENCO_API_TOKEN;
  if (!token) {
    throw new Error('LENCO_API_TOKEN must be set in .env');
  }

  const response = await fetch('https://api.lenco.co/access/v2/collections/mobile-money', {
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
    throw new Error(data.message || data.error || `Lenco collection failed (${response.status}).`);
  }
  return {
    success: true,
    reference: data.data?.reference || data.data?.id || data.reference || reference,
    data,
  };
}

const routes = {
  '/api/ai-review': handleReviewRequest,
  '/api/send-sms': handleSmsRequest,
  '/api/lenco-payment': handleLencoPayment,
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const handler = routes[req.url || ''];
  if (req.method !== 'POST' || !handler) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
  });

  req.on('end', async () => {
    try {
      const body = raw ? JSON.parse(raw) : {};
      const result = await handler(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message || 'Request failed' }));
    }
  });
});

async function isApiAlreadyRunning() {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/ai-review`, { method: 'OPTIONS' });
    return response.ok || response.status === 404 || response.status === 405;
  } catch {
    return false;
  }
}

server.on('error', async (error) => {
  if (error.code === 'EADDRINUSE') {
    if (await isApiAlreadyRunning()) {
      console.log(`AI review API already running at http://localhost:${PORT}/api/ai-review`);
      process.exit(0);
    }
    console.error(`Port ${PORT} is already in use. Stop the other process or set AI_REVIEW_PORT to another port.`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, () => {
  console.log(`Likita API server at http://localhost:${PORT}`);
  console.log('  /api/ai-review  /api/send-sms  /api/lenco-payment');
});
