import { Platform } from 'react-native';
import { AiReview, AiReviewRecommendation } from '../types';

export type ReviewApplicantInput = {
  jobTitle: string;
  jobDescription: string;
  skillsRequired: string[];
  applicantName: string;
  applicantSkills: string[];
  qualifications?: string;
  previousRating?: number;
  ratedJobsCount: number;
  yearsOfExperience: number;
  coverLetter?: string;
};

type OpenAiReviewPayload = {
  recommendation: AiReviewRecommendation;
  summary: string;
};

function buildPrompt(input: ReviewApplicantInput): string {
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

function parseReview(content: string): OpenAiReviewPayload {
  const parsed = JSON.parse(content) as Partial<OpenAiReviewPayload>;
  const recommendation = parsed.recommendation;
  const summary = parsed.summary?.trim();

  if (recommendation !== 'strong' && recommendation !== 'moderate' && recommendation !== 'weak') {
    throw new Error('AI returned an invalid recommendation.');
  }
  if (!summary) {
    throw new Error('AI returned an empty summary.');
  }

  return { recommendation, summary };
}

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'OpenAI API key is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file and restart the dev server.'
    );
  }
  return key;
}

function getReviewApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_AI_REVIEW_API_URL?.trim();
  if (configured) return configured;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api/ai-review';
    }
    return `${window.location.origin}/api/ai-review`;
  }

  return '';
}

async function callOpenAiDirect(input: ReviewApplicantInput): Promise<AiReview> {
  const apiKey = getApiKey();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      throw new Error('Invalid OpenAI API key. Check your EXPO_PUBLIC_OPENAI_API_KEY.');
    }
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('AI returned an empty response.');
  }

  const parsed = parseReview(content);
  return {
    recommendation: parsed.recommendation,
    summary: parsed.summary,
    generatedAt: Date.now(),
  };
}

async function callOpenAiViaProxy(input: ReviewApplicantInput): Promise<AiReview> {
  const url = getReviewApiUrl();
  if (!url) {
    throw new Error('AI review API URL is not configured.');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
  } catch {
    throw new Error(
      'Could not reach the AI review server. Run "npm run web" (starts the local API on port 3001) and try again.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `AI review request failed (${response.status}).`);
  }

  if (!data.recommendation || !data.summary) {
    throw new Error('AI returned an invalid response.');
  }

  return {
    recommendation: data.recommendation,
    summary: data.summary,
    generatedAt: data.generatedAt || Date.now(),
  };
}

export async function generateApplicantReview(input: ReviewApplicantInput): Promise<AiReview> {
  if (Platform.OS === 'web') {
    return callOpenAiViaProxy(input);
  }
  return callOpenAiDirect(input);
}

export function recommendationLabel(recommendation: AiReviewRecommendation): string {
  switch (recommendation) {
    case 'strong':
      return 'Strong fit';
    case 'moderate':
      return 'Moderate fit';
    case 'weak':
      return 'Not recommended';
  }
}

export function recommendationColor(recommendation: AiReviewRecommendation): string {
  switch (recommendation) {
    case 'strong':
      return '#16A34A';
    case 'moderate':
      return '#D97706';
    case 'weak':
      return '#DC2626';
  }
}
