import { useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
// Sidebar removed as it is now in MainLayout

import { ListWidget, type ListItem } from "./components/ListWidget"
import { ExpensesChart } from "./components/ExpensesChart"
import { ShoppingBag } from "lucide-react"
import { useBudgetOverview } from "../budget/hooks/useBudgetOverview"
import { useTransactions } from "../transactions/hooks/useTransactions"

import { useAccounts } from "../accounts/hooks/useAccounts"
import { OnboardingProgress, type OnboardingStep } from "./components/OnboardingProgress"
import { OnboardingNextStep } from "./components/OnboardingNextStep"

export function DashboardLayout() {
  const navigate = useNavigate();
  const {
    activeBudget,
    tableData,
    isLoading: isLoadingBudget,
    error: budgetError,
    retry: retryBudget,
  } = useBudgetOverview();
  const {
    transactionsData,
    fetchTransactions,
    isFetchingTransactions,
    fetchTransactionsError,
  } = useTransactions();

  const { accounts, isLoading: isLoadingAccounts, error: accountsError, fetchAccounts } = useAccounts();
  const { transactionsData: expensesData, fetchTransactions: fetchExpenses, isFetchingTransactions: isLoadingExpenses, fetchTransactionsError: expensesError } = useTransactions();

  useEffect(() => {
    void fetchExpenses({ type: "expense", limit: 1 }).catch(() => undefined);
  }, [fetchExpenses]);

  const steps: OnboardingStep[] = [
    { label: "Presupuesto", complete: Boolean(activeBudget), title: "Crea tu primer presupuesto", description: "Define tus categorías y cuánto quieres destinar a cada una para empezar a organizar tu dinero.", action: "Crear presupuesto", href: "/budget" },
    { label: "Cuentas", complete: accounts.length > 0, title: "Agrega tu primera cuenta", description: "Registra una cuenta para organizar de dónde viene y a dónde va tu dinero.", action: "Agregar cuenta", href: "/accounts?create=1" },
    { label: "Transacciones", complete: (expensesData?.meta.total ?? 0) > 0, title: "Registra tu primer gasto", description: tableData.length ? "Añade un gasto para empezar a ver tu actividad y entender cómo usas tu presupuesto." : "Agrega una categoría a tu presupuesto para poder registrar tu primer gasto.", action: tableData.length ? "Registrar gasto" : "Agregar categoría", href: tableData.length ? "/transactions?create=1" : "/budget" },
  ];
  const nextStep = steps.find(step => !step.complete);
  const onboardingLoading = isLoadingBudget || isLoadingAccounts || isLoadingExpenses || (!expensesData && !expensesError);
  const onboardingError = budgetError || accountsError || expensesError;
  const expenseHref = !activeBudget || !tableData.length ? "/budget" : "/transactions?create=1";
  const expenseAction = !activeBudget || !tableData.length ? "Configurar presupuesto" : "Registrar gasto";
  const actionClass = "mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10";

  const loadTransactions = () => fetchTransactions({ limit: 100 });

  useEffect(() => {
    // One shared request supplies both transaction history and the expense chart.
    void fetchTransactions({ limit: 100 }).catch(() => undefined);
  }, [fetchTransactions]);

  const dynamicPopularCategories = useMemo<ListItem[]>(() => {
    // Sort by highest allocated amount to simulate "popular"
    const sorted = [...tableData].sort((a, b) => b.allocated - a.allocated);
    
    // Take top 5
    return sorted.slice(0, 5).map(cat => {
      // Assuming cat.iconColor is something like "#10b981", 
      // we can add an alpha for the background. 
      // The hook already generates an iconBgClass that is actually a color hex like #10b9811A.
      return {
        id: cat.id,
        icon: <div style={{ color: cat.iconColor }}>{cat.icon}</div>,
        iconBgColor: cat.iconBgClass, // Actually a hex color string with opacity like "#10b9811A"
        title: cat.name,
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cat.allocated),
        showChevron: true,
      };
    });
  }, [tableData]);

  const dynamicHistoryTransactions = useMemo<ListItem[]>(() => {
    if (!transactionsData?.data) return [];

    return transactionsData.data.slice(0, 5).map(t => {
      const category = tableData.find(cat => cat.id === t.budgetItemId);
      const icon = category ? category.icon : <ShoppingBag className="w-5 h-5 text-slate-600" />;
      const iconBgColor = category ? category.iconBgClass : undefined; 
      const iconBgClass = category ? "" : "bg-slate-100";

      return {
        id: t._id,
        icon: <div style={{ color: category?.iconColor || 'inherit' }}>{icon}</div>,
        iconBgColor,
        iconBgClass,
        title: t.name,
        subtitle: new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(t.amount)),
      };
    });
  }, [transactionsData, tableData]);

  const handleCategoryClick = () => {
    navigate("/budget");
  };

  const handleTransactionClick = () => {
    navigate("/transactions");
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">A quick look at your budget and recent activity.</p>
      </header>

      {onboardingLoading ? (
        <div role="status" className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">Cargando tu progreso…</div>
      ) : onboardingError ? (
        <div role="alert" className="rounded-lg border border-border bg-card p-6 text-sm">
          <p>No pudimos cargar tu progreso de configuración.</p>
          <button type="button" className={actionClass} onClick={() => {
            void retryBudget().catch(() => undefined);
            void fetchAccounts();
            void fetchExpenses({ type: "expense", limit: 1 }).catch(() => undefined);
          }}>Reintentar</button>
        </div>
      ) : nextStep ? (
        <>
          <OnboardingProgress steps={steps} />
          <OnboardingNextStep step={nextStep} />
        </>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* Column 1 */}
      <div className="flex flex-col gap-6">

        <ListWidget 
          title="TOP BUDGET CATEGORIES"
          items={dynamicPopularCategories} 
          isLoading={isLoadingBudget}
          error={budgetError}
          emptyMessage="No budget categories yet"
          emptyAction={<Link className={actionClass} to="/budget">{activeBudget ? "Agregar categoría" : "Crear presupuesto"}</Link>}
          onRetry={() => void retryBudget().catch(() => undefined)}
          onItemClick={handleCategoryClick} 
        />
      </div>

      {/* Column 2 */}
      <div className="flex flex-col gap-6">
        <ExpensesChart
          transactions={transactionsData?.data || []}
          emptyAction={!onboardingLoading && !onboardingError && <Link className={actionClass} to={expenseHref}>{expenseAction}</Link>}
          isLoading={isFetchingTransactions || (!transactionsData && !fetchTransactionsError)}
          error={fetchTransactionsError}
          onRetry={() => void loadTransactions().catch(() => undefined)}
        />
      </div>

      {/* Column 3 */}
      <div className="flex flex-col gap-6">
        <ListWidget 
          title="RECENT TRANSACTIONS"
          items={dynamicHistoryTransactions} 
          isLoading={isFetchingTransactions || (!transactionsData && !fetchTransactionsError)}
          error={fetchTransactionsError}
          emptyMessage="No transactions yet"
          emptyAction={!onboardingLoading && !onboardingError && <Link className={actionClass} to={expenseHref}>{expenseAction}</Link>}
          onRetry={() => void loadTransactions().catch(() => undefined)}
          onItemClick={handleTransactionClick}
        />
      </div>

      </div>
    </div>
  )
}
