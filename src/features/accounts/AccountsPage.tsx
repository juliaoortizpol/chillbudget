import { useState } from 'react';
import { AccountsHeader } from './components/AccountsHeader';
import { PortfolioToolbar } from './components/PortfolioToolbar';
import { AccountsTable } from './components/AccountsTable';
import { AddAccountForm } from './components/AddAccountForm';
import { useAccounts } from './hooks/useAccounts';

export function AccountsPage() {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const { accounts, isLoading, error, fetchAccounts } = useAccounts();

  return (
    <div className="flex flex-col max-w-7xl mx-auto gap-6">
      
      {/* Page Header */}
      <AccountsHeader 
        isAddingAccount={isAddingAccount} 
        onToggleAddAccount={() => setIsAddingAccount(!isAddingAccount)} 
      />

      {isAddingAccount ? (
        <AddAccountForm 
          onCancel={() => setIsAddingAccount(false)} 
          onSave={() => setIsAddingAccount(false)} 
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header Toolbar */}
          <PortfolioToolbar />
          {/* Table */}
          {isLoading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading accounts...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={fetchAccounts}
                className="text-sm font-semibold text-[#0f766e] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <AccountsTable accounts={accounts} />
          )}
        </div>
      )}
    </div>
  );
}
