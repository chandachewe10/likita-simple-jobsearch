import { User } from '../types';

export function isProfileComplete(user: User): boolean {
  if (user.profileComplete) return true;
  const hasPhone = Boolean(user.phone?.trim());
  if (user.role === 'employee') {
    return hasPhone && Boolean(user.skills?.length);
  }
  return hasPhone;
}

export function profileMissingFields(user: User): string[] {
  const missing: string[] = [];
  if (!user.phone?.trim()) missing.push('phone number');
  if (user.role === 'employee' && !user.skills?.length) missing.push('skills');
  return missing;
}
