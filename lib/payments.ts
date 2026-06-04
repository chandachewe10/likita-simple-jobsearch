import { Platform } from 'react-native';

export type MobileMoneyCollectionInput = {
  phone: string;
  operator: 'airtel' | 'mtn';
  amount: number;
  reference: string;
};

/** @deprecated use MobileMoneyCollectionInput */
export type MobileMoneyPaymentInput = MobileMoneyCollectionInput;

function getPaymentApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_PAYMENT_API_URL?.trim();
  if (configured) return configured;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api/lenco-payment';
    }
    return `${window.location.origin}/api/lenco-payment`;
  }
  return '';
}

export async function collectMobileMoney(
  input: MobileMoneyCollectionInput
): Promise<{ reference: string }> {
  const url = getPaymentApiUrl();
  if (!url) {
    throw new Error('Payment API URL is not configured.');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      'Could not reach the payment server. Run "npm run web" or deploy with the API routes enabled.'
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Collection failed (${response.status}).`);
  }

  return { reference: data.reference || input.reference };
}

/** Collect from employer mobile money (Lenco collections API). */
export const payViaMobileMoney = collectMobileMoney;
