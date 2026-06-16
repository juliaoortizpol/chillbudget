import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Account } from '../data/mock-accounts';

interface AccountsTableProps {
  accounts: Account[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
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
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${account.iconBg}`}>
                    {account.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{account.institution}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{account.accountName}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-slate-700 font-medium">{account.type}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    account.status === 'Active' ? 'bg-[#0f766e]' : 
                    account.status === 'Pending' ? 'bg-slate-300' : 
                    'bg-red-500'
                  }`} />
                  <span className={`font-semibold ${
                    account.status === 'Active' ? 'text-[#0f766e]' : 
                    account.status === 'Pending' ? 'text-slate-500' : 
                    'text-red-600'
                  }`}>
                    {account.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`${account.status === 'Re-auth Required' ? 'text-slate-500 italic' : 'text-slate-700'}`}>
                  {account.lastSynced}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {account.actionRequired ? (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
