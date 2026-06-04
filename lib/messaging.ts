import { Platform } from 'react-native';

function getSmsApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_SMS_API_URL?.trim();
  if (configured) return configured;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api/send-sms';
    }
    return `${window.location.origin}/api/send-sms`;
  }
  return '';
}

export async function sendSms(numbers: string, message: string): Promise<void> {
  const url = getSmsApiUrl();
  if (!url) {
    throw new Error('SMS API URL is not configured.');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numbers, message }),
    });
  } catch {
    throw new Error(
      'Could not reach the SMS server. Run "npm run web" or deploy with the API routes enabled.'
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `SMS failed (${response.status}).`);
  }
}

export function buildAcceptanceMessage(applicantName: string, jobTitle: string): string {
  return `Hi ${applicantName}, your application for "${jobTitle}" on Likita has been ACCEPTED. The employer will contact you soon.`;
}
