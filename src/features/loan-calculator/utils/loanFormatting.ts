import { format, parseISO } from 'date-fns';

export { roundMoney, formatMoney as formatLoanMoney, formatCompactMoney } from '@/lib/financeFormatting';
export const formatLoanDate = (value: string) => format(parseISO(value), 'MMM d, yyyy');
export const formatChartDate = (value: string) => format(parseISO(value), 'MMM yy');
