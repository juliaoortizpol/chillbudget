interface TransactionsSummaryProps {
  totalSpent: number;
  monthlyBudget: number;
  maxTransaction: number;
  totalTransactions: number;
  budgetUsed: number;
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TransactionsSummary({
  totalSpent,
  monthlyBudget,
  maxTransaction,
  totalTransactions,
  budgetUsed,
}: TransactionsSummaryProps) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <div className="px-6 py-4">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Spent in Shown Rows
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(totalSpent)}
          </span>
          {monthlyBudget > 0 && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
              {Math.round(budgetUsed)}% used
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-border px-6 py-4 sm:border-l sm:border-t-0">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Monthly Budget
        </div>
        <div className="mt-1 text-xl font-bold text-foreground">
          {formatCurrency(monthlyBudget)}
        </div>
      </div>

      <div className="border-t border-border px-6 py-4 lg:border-l lg:border-t-0">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Max in Shown Rows
        </div>
        <div className="mt-1 text-xl font-bold text-foreground">
          {formatCurrency(maxTransaction)}
        </div>
      </div>

      <div className="border-t border-border px-6 py-4 sm:border-l lg:border-t-0">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Transactions Shown
        </div>
        <div className="mt-1 text-xl font-bold text-foreground">
          {totalTransactions.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
