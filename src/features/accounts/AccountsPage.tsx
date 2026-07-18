import { useState } from 'react';
import { AccountsHeader } from './components/AccountsHeader';
import { PortfolioToolbar } from './components/PortfolioToolbar';
import { AccountsTable } from './components/AccountsTable';
import { AddAccountForm } from './components/AddAccountForm';
import { AccountsEmptyState } from './components/AccountsEmptyState';
import { useAccounts } from './hooks/useAccounts';
import type { CreateAccountDto } from './types/accounts';

export function AccountsPage() {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    createAccount,
    isCreating,
    createError,
    deleteAccount,
    deletingAccountId,
    deleteError,
  } = useAccounts();

  const handleCreateAccount = async (account: CreateAccountDto) => {
    await createAccount(account);
    setIsAddingAccount(false);
  };

  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find((item) => item._id === accountId);
    const confirmed = window.confirm(
      `Delete ${account?.name || 'this account'}? This action removes it from your account list.`,
    );
    if (!confirmed) return;

    try {
      await deleteAccount(accountId);
    } catch {
      // The hook exposes the request error below the table.
    }
  };

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
          onSave={handleCreateAccount}
          isSaving={isCreating}
          saveError={createError}
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
          ) : accounts.length === 0 ? (
            <AccountsEmptyState onAddAccount={() => setIsAddingAccount(true)} />
          ) : (
            <>
              <AccountsTable
                accounts={accounts}
                onDeleteAccount={handleDeleteAccount}
                deletingAccountId={deletingAccountId}
              />
              {deleteError && (
                <p className="border-t border-slate-100 px-6 py-3 text-sm text-red-600">
                  {deleteError}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
