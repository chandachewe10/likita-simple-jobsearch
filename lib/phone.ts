/** Normalize Zambian numbers to 260XXXXXXXXX (international digits, no +). */
export function normalizeZmPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('260')) return digits;
  if (digits.startsWith('0')) return `260${digits.slice(1)}`;
  if (digits.length === 9) return `260${digits}`;
  return digits;
}

/** Local Zambian format 09XXXXXXXX (Lenco, SwiftSMS). */
export function formatLencoPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('260')) return `0${digits.slice(3)}`;
  if (digits.startsWith('0')) return digits;
  if (digits.length === 9) return `0${digits}`;
  return digits;
}

/** SwiftSMS / Postman: 260973750029 (international without +). */
export function formatSwiftSmsPhone(phone: string): string {
  return normalizeZmPhone(phone);
}

/** Comma-separated list for bulk SMS. */
export function formatSwiftSmsNumbers(numbers: string): string {
  return numbers
    .split(',')
    .map((n) => formatSwiftSmsPhone(n.trim()))
    .filter(Boolean)
    .join(',');
}

export function detectMobileOperator(phone: string): 'airtel' | 'mtn' {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('260') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits;
  const prefix = local.slice(0, 2);
  if (['97', '77', '57'].includes(prefix)) return 'airtel';
  return 'mtn';
}
