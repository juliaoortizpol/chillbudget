import { RefreshCw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';

interface AccountsHeaderProps {
  isAddingAccount: boolean;
  onToggleAddAccount: () => void;
  showAddAccountAction: boolean;
  canRefresh: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AccountsHeader({ isAddingAccount, onToggleAddAccount, showAddAccountAction, canRefresh, isRefreshing, onRefresh }: AccountsHeaderProps) {
  return (
    <PageHeader 
      title="Financial Accounts" 
      subtitle="Manage your accounts and connected institutions."
    >
      {(canRefresh || showAddAccountAction) && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {canRefresh && (
        <Button onClick={onRefresh} disabled={isRefreshing} variant="outline" className="h-10 w-full rounded-md border-slate-200 bg-white px-4 font-medium text-slate-700 shadow-sm sm:w-auto">
          <RefreshCw className={`w-4 h-4 mr-2 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh All"}
        </Button>
        )}
        {showAddAccountAction && (
        <Button 
          onClick={onToggleAddAccount}
          variant={isAddingAccount ? "outline" : "default"}
          className={isAddingAccount ? "bg-white text-slate-700 font-medium h-10 px-4 rounded-md shadow-sm border-slate-200 hover:bg-slate-50" : "bg-primary hover:bg-ds-primary-hover text-white font-medium h-10 px-4 rounded-md shadow-sm"}
        >
          {isAddingAccount ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </>
          )}
        </Button>
        )}
        </div>
      )}
    </PageHeader>
  );
}
