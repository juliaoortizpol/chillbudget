import { formatMoney } from '@/lib/financeFormatting';

const recordedAmount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 });

export function reportMoney(value: number, currency: string) {
  if (currency === 'DOP') return `${formatMoney(value)} DOP`;
  return purchaseAmount(value, currency);
}

export function purchaseAmount(value: number, currency: string) {
  return `${recordedAmount.format(value)} ${currency}`;
}
