export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const moneyFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
export const formatMoney = (value: number) => `RD$ ${moneyFormatter.format(roundMoney(value))}`;
export const formatCompactMoney = (value: number) => `RD$ ${compactFormatter.format(value)}`;
export const formatPercentage = (value: number) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}%`;
