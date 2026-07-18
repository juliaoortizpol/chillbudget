import { RefreshCw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';

interface AccountsHeaderProps {
  isAddingAccount: boolean;
  onToggleAddAccount: () => void;
}

export function AccountsHeader({ isAddingAccount, onToggleAddAccount }: AccountsHeaderProps) {
  return (
    <PageHeader 
      title="Financial Accounts" 
      subtitle="Manage your connected institutions and liquidity."
    >
        <Button variant="outline" className="bg-white text-slate-700 font-medium h-10 px-4 rounded-md shadow-sm border-slate-200">
          <RefreshCw className="w-4 h-4 mr-2 text-slate-500" />
          Refresh All
        </Button>
        <Button 
          onClick={onToggleAddAccount}
          variant={isAddingAccount ? "outline" : "default"}
          className={isAddingAccount ? "bg-white text-slate-700 font-medium h-10 px-4 rounded-md shadow-sm border-slate-200 hover:bg-slate-50" : "bg-[#0f766e] hover:bg-[#0d645e] text-white font-medium h-10 px-4 rounded-md shadow-sm"}
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
    </PageHeader>
  );
}
