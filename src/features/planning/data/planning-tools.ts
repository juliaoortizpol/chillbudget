import { Banknote, CalendarClock, Target, ShieldCheck, CreditCard, TrendingUp, Gauge, ShoppingBag, type LucideIcon } from 'lucide-react';

export const planningCategories = [
  { id: 'all', label: 'All', shortLabel: 'All' },
  { id: 'loans', label: 'Loans & Debt', shortLabel: 'Loans & Debt' },
  { id: 'savings', label: 'Savings', shortLabel: 'Savings' },
  { id: 'retirement', label: 'Future & Retirement', shortLabel: 'Retirement' },
  { id: 'projections', label: 'Financial Projections', shortLabel: 'Projections' },
] as const;

export type PlanningCategory = typeof planningCategories[number]['id'];
export interface PlanningTool {
  id: string;
  title: string;
  description: string;
  category: Exclude<PlanningCategory, 'all'>;
  icon: LucideIcon;
  caption: string;
}

export const planningTools: readonly PlanningTool[] = [
  { id: 'loan', title: 'Loan Calculator', description: 'Estimate monthly payments, interest, and total loan cost.', category: 'loans', icon: Banknote, caption: 'Amortization' },
  { id: 'retirement', title: 'Retirement Planner', description: 'Estimate how much you may need and how much to save.', category: 'retirement', icon: CalendarClock, caption: 'Coast & FIRE' },
  { id: 'savings-goal', title: 'Savings Goal', description: 'Calculate how much you need to save to reach a goal.', category: 'savings', icon: Target, caption: 'Milestone Engine' },
  { id: 'emergency-fund', title: 'Emergency Fund', description: 'Estimate an emergency fund based on your monthly expenses.', category: 'savings', icon: ShieldCheck, caption: 'Buffer Scale' },
  { id: 'debt-payoff', title: 'Debt Payoff', description: 'Estimate how long it could take to eliminate your debt.', category: 'loans', icon: CreditCard, caption: 'Avalanche/Snowball' },
  { id: 'compound-interest', title: 'Compound Interest', description: 'See how your money could grow over time.', category: 'projections', icon: TrendingUp, caption: 'Growth Curve' },
  { id: 'borrowing-capacity', title: 'Borrowing Capacity', description: 'Estimate a healthy debt level based on your finances.', category: 'loans', icon: Gauge, caption: 'DTI Ratio Check' },
  { id: 'purchase-planner', title: 'Purchase Planner', description: 'Plan how much to save each month for a future purchase.', category: 'savings', icon: ShoppingBag, caption: 'Target Date Sinking' },
];
