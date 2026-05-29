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
  if (!input) {
    throw new Error('Missing applicant input.');
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured on the server.');
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
    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key.');
    }
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI returned an empty response.');
  }

  const parsed = parseReview(content);
  return {
    recommendation: parsed.recommendation,
    summary: parsed.summary,
    generatedAt: Date.now(),
  };
}

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
    const result = await handleReviewRequest(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'AI review failed' });
  }
};
