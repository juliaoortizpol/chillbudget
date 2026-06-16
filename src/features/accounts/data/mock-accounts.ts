export interface Account {
  id: string;
  institution: string;
  accountName: string;
  type: string;
  status: 'Active' | 'Pending' | 'Re-auth Required';
  lastSynced: string;
  icon: string;
  iconBg: string;
  actionRequired?: boolean;
}

export const mockAccounts: Account[] = [
  {
    id: '1',
    institution: 'JP Morgan Chase',
    accountName: 'Checking •••• 4402',
    type: 'Checking',
    status: 'Active',
    lastSynced: 'Today, 09:42 AM',
    icon: 'J',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: '2',
    institution: 'Goldman Sachs',
    accountName: 'Investment Portfolio',
    type: 'Brokerage',
    status: 'Active',
    lastSynced: 'Yesterday, 11:30 PM',
    icon: 'G',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: '3',
    institution: 'Fidelity Investments',
    accountName: '401(k) Retirement',
    type: 'Retirement',
    status: 'Pending',
    lastSynced: 'Oct 12, 2023',
    icon: 'F',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    id: '4',
    institution: 'Bank of America',
    accountName: 'Business Credit •••• 0021',
    type: 'Credit Card',
    status: 'Re-auth Required',
    lastSynced: 'Sync failed',
    icon: 'B',
    iconBg: 'bg-slate-100 text-slate-700',
    actionRequired: true,
  },
];
