import { useFetch } from '@/hooks/useFetch';
import type { Budget } from './useBudget';

export interface ReportPage<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export type HistoryEntry = Omit<Budget, 'items'> & {
  reportStatus: 'final' | 'unavailable';
  reportId: string | null;
};

export interface PurchaseEvidence {
  transactionId: string;
  budgetItemId: string | null;
  name: string;
  date: string;
  amount: number;
  type: string;
  currency: string | null;
  currencyOrigin?: string;
  matchingStatus?: string;
  matchingSource?: string;
  rawDescription?: string;
}

export interface ReportException {
  _id: string;
  transactionId: string;
  createdAt: string;
  kind: string;
  includedInSnapshot: boolean;
  inCoverageAfter: boolean;
  before: PurchaseEvidence | null;
  after: PurchaseEvidence | null;
}

export interface ReportFigures {
  budgetId: string;
  budgetName: string;
  startDate: string;
  actualCutoffDate: string;
  plannedEndDate?: string | null;
  timezone?: string;
  items: {
    budgetItemId: string;
    categoryName: string;
    type?: string;
    plannedAmount: number;
    actualAmount: number;
    variance: number;
  }[];
  totals: {
    totalPlanned: number;
    totalActualIncome: number;
    totalActualExpense: number;
    totalVariance: number;
  };
  transactions: PurchaseEvidence[];
}

export interface ClosePreview extends ReportFigures {
  actualsCurrency: string;
  planningCurrencyContext?: { currency: string; origin: string };
  blockers: { code: string; transactionId?: string; currency?: string | null }[];
  previewToken: string;
}

export interface SavedReport extends ReportFigures {
  _id: string;
  closedAt: string;
  currencyContext: {
    actualsCurrency: string;
    planning: { currency: string; origin: string };
    transactions: { transactionId: string; currency: string; origin: string; version: number }[];
  };
}

export type Cutoff = { closeThroughDate?: string; actualCutoffDate?: string };

export function useBudgetReports() {
  const { fetchApi } = useFetch();
  const post = <T,>(path: string, body: object) =>
    fetchApi<T>(path, { method: 'POST', body: JSON.stringify(body) });

  return {
    preview: (id: string, cutoff: Cutoff) => post<ClosePreview>(`/budgets/${id}/close-preview`, cutoff),
    close: (id: string, { actualCutoffDate, previewToken }: ClosePreview) =>
      post<{ reportId: string; budgetId: string; closedAt: string }>(`/budgets/${id}/close`, {
        confirmed: true, actualCutoffDate, previewToken,
      }),
    ownedBudget: (id: string) => fetchApi<Budget>(`/budgets/${id}`),
    history: (page: number) => fetchApi<ReportPage<HistoryEntry>>(`/budget-reports?page=${page}`),
    report: (id: string) => fetchApi<SavedReport>(`/budget-reports/${id}`),
    purchase: (id: string, transactionId: string) =>
      fetchApi<PurchaseEvidence>(`/budget-reports/${id}/transactions/${transactionId}`),
    exceptions: (id: string, page: number) =>
      fetchApi<ReportPage<ReportException>>(`/budget-reports/${id}/exceptions?page=${page}`),
  };
}
