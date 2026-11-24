import { purchaseAmount } from '@/features/budget/utils/reportMoney';

interface TransactionsSummaryProps {
  totalSpent: number;
  monthlyBudget?: number;
  currency?: string;
  maxTransaction: number;
  totalTransactions: number;
  budgetUsed?: number;
}

export function TransactionsSummary({
  totalSpent,
  monthlyBudget,
  currency,
  maxTransaction,
  totalTransactions,
  budgetUsed,
}: TransactionsSummaryProps) {
  const shownAmount = (value: number) => currency ? purchaseAmount(value, currency) :
    totalTransactions ? 'Mixed or unavailable currencies' : '—';
  return (
    <div className="hidden grid-cols-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm md:grid lg:grid-cols-4">
      <div className="px-4 py-4 sm:px-6">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Spent in Shown Rows
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
            {shownAmount(totalSpent)}
          </span>
          {budgetUsed !== undefined && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
              {Math.round(budgetUsed)}% used
            </span>
          )}
        </div>
      </div>

      <div className="border-l border-border px-4 py-4 sm:px-6">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Monthly Budget
        </div>
        <div className="mt-1 text-lg font-bold tabular-nums text-foreground sm:text-xl">
          {monthlyBudget === undefined ? '—' : purchaseAmount(monthlyBudget, 'DOP')}
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 sm:px-6 lg:border-l lg:border-t-0">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Max in Shown Rows
        </div>
        <div className="mt-1 text-lg font-bold tabular-nums text-foreground sm:text-xl">
          {shownAmount(maxTransaction)}
        </div>
      </div>

      <div className="border-l border-t border-border px-4 py-4 sm:px-6 lg:border-t-0">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Transactions Shown
        </div>
        <div className="mt-1 text-lg font-bold tabular-nums text-foreground sm:text-xl">
          {totalTransactions.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
