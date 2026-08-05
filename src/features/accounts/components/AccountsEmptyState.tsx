import { Landmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountsEmptyStateProps {
  onAddAccount: () => void;
}

export function AccountsEmptyState({
  onAddAccount,
}: AccountsEmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[340px] sm:px-6 sm:py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Landmark className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900">
        No financial accounts yet
      </h3>
      <p className="mt-2 w-full max-w-md text-sm leading-6 text-slate-500">
        Add an account to organize imported transactions and connect them with
        the correct financial institution.
      </p>
      <Button
        type="button"
        onClick={onAddAccount}
        className="mt-6 h-10 bg-primary px-5 font-semibold text-white hover:bg-ds-primary-hover"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Account
      </Button>
    </div>
  );
}
