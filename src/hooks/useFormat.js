import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { formatDate, formatDateTime } from '../utils/dateUtils';

/** Currency/date formatters driven by the signed-in user's preferences. */
export function useFormat() {
  const { user } = useAuth();
  const currency = user?.prefs?.currency || 'INR';
  const df = user?.prefs?.dateFormat || 'DD MMM YYYY';
  return useMemo(() => ({
    currency,
    fmt: (n) => formatCurrency(n, currency),
    fmtCompact: (n) => formatCurrency(n, currency, true),
    date: (s) => formatDate(s, df),
    dateTime: (s) => formatDateTime(s, df),
  }), [currency, df]);
}
