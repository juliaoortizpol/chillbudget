import { formatMoney } from '@/lib/financeFormatting';

const recordedAmount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 });

export function reportMoney(value: number, currency: string) {
  if (currency === 'DOP') return `${formatMoney(value)} DOP`;
  return purchaseAmount(value, currency);
}

export function purchaseAmount(value: number, currency: string) {
  return `${recordedAmount.format(value)} ${currency}`;
}

export function planningCurrencyLabel(context?: { currency: string; origin: string }) {
  if (!context?.currency) return 'Unresolved';
  if (context.currency !== 'DOP') return `${context.currency} (unsupported for planning)`;
  if (context.origin === 'dop-v1-planning') return 'DOP (set when the budget was created)';
  if (context.origin === 'explicit-resolution') return 'DOP (confirmed for a legacy budget)';
  return 'DOP (source unavailable)';
}

export function purchaseCurrencyEvidenceLabel(origin: string) {
  switch (origin) {
    case 'manual-default': return 'Defaulted on manual entry';
    case 'explicit': return 'Entered with the purchase';
    case 'mail-parser': return 'Recorded from the imported email';
    case 'explicit-resolution': return 'Verified and recorded later';
    case 'legacy-explicit': return 'Recorded on a legacy purchase';
    default: return 'Source unavailable';
  }
}
