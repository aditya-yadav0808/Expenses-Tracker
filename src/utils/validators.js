import { todayISO } from './dateUtils';
export const emailRule = { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } };
export const amountRule = { required: 'Amount is required', validate: (v) => (Number(v) > 0 && Number.isFinite(Number(v))) || 'Amount must be greater than 0' };
export const passwordRule = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Use at least 8 characters' },
  validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Include at least one letter and one number',
};
export const notFuture = (v) => !v || v <= todayISO() || 'Date cannot be in the future. Use Recurring for scheduled items.';
export function passwordStrength(pw = '') {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return { score, label: pw ? ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score] : '' };
}
