import React, { useState } from 'react';
import { AccountsHeader } from './components/AccountsHeader';
import { PortfolioToolbar } from './components/PortfolioToolbar';
import { AccountsTable } from './components/AccountsTable';
import { AddAccountForm } from './components/AddAccountForm';
import { mockAccounts } from './data/mock-accounts';

export function AccountsPage() {
  const [isAddingAccount, setIsAddingAccount] = useState(false);

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
          <AccountsTable accounts={mockAccounts} />
        </div>
      )}
    </div>
  );
}
