import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Account, AccountStatus, AccountType } from '../hooks/useAccounts';

interface AccountsTableProps {
  accounts: Account[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  const formatAccountType = (type?: AccountType) =>
    type
      ? type
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Other';

  const formatStatus = (status?: AccountStatus) => {
    if (status === 're_auth_required') return 'Re-auth Required';
    if (status === 'pending') return 'Pending';
    return 'Active';
  };

  const formatLastSynced = (lastSynced?: string) => {
    if (!lastSynced) return 'Never';
    return new Date(lastSynced).toLocaleString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 tracking-wider uppercase">
            <th className="px-6 py-4">Institution & Bank Name</th>
            <th className="px-6 py-4">Account Type</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Last Synced</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {accounts.map((account) => {
            const status = formatStatus(account.status);
            const accountDetail = account.last4Digits
              ? `${formatAccountType(account.type)} •••• ${account.last4Digits}`
              : account.name;

            return (
            <tr key={account._id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg bg-emerald-100 text-emerald-700">
                    {account.institution.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{account.institution}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{accountDetail}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-slate-700 font-medium">{formatAccountType(account.type)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'Active' ? 'bg-[#0f766e]' :
                    status === 'Pending' ? 'bg-slate-300' :
                    'bg-red-500'
                  }`} />
                  <span className={`font-semibold ${
                    status === 'Active' ? 'text-[#0f766e]' :
                    status === 'Pending' ? 'text-slate-500' :
                    'text-red-600'
                  }`}>
                    {status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`${status === 'Re-auth Required' ? 'text-slate-500 italic' : 'text-slate-700'}`}>
                  {formatLastSynced(account.lastSynced)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {status === 'Re-auth Required' ? (
                  <button className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                    Fix Connection
                  </button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                )}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
