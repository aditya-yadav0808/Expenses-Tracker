const LOCALES = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE' };
export const CURRENCIES = ['INR', 'USD', 'EUR'];
/** Formatting only – the app does not convert between currencies. */
export const formatCurrency = (n, cur = 'INR', compact = false) =>
  new Intl.NumberFormat(LOCALES[cur] || 'en-IN', {
    style: 'currency', currency: cur,
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(n || 0);
