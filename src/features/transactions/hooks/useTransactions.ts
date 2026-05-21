import { useState, useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';

export interface Transaction {
  _id: string;
  userId: string;
  accountId?: string;
  budgetItemId?: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  relationCode?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  accountId?: string;
  budgetItemId?: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  relationCode?: string;
  date: string;
  notes?: string;
}

export interface UpdateTransactionDto {
  accountId?: string;
  budgetItemId?: string;
  name?: string;
  amount?: number;
  type?: 'expense' | 'income';
  relationCode?: string;
  date?: string;
  notes?: string;
}

export interface GetTransactionsFilterDto {
  accountId?: string;
  budgetItemId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'expense' | 'income';
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function useGetTransactions() {
  const { fetchApi } = useFetch();
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (filter?: GetTransactionsFilterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = '';
      if (filter) {
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
        query = `?${params.toString()}`;
      }
      
      const response = await fetchApi<PaginatedTransactions>(`/transactions${query}`, { method: 'GET' });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { data, fetchTransactions, isLoading, error };
}

function useCreateTransaction() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = useCallback(async (dto: CreateTransactionDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { createTransaction, isLoading, error };
}

function useUpdateTransaction() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTransaction = useCallback(async (id: string, dto: UpdateTransactionDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<Transaction>(`/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { updateTransaction, isLoading, error };
}

function useDeleteTransaction() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTransaction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<any>(`/transactions/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { deleteTransaction, isLoading, error };
}

export function useTransactions() {
  const getTransactions = useGetTransactions();
  const createTransactionHook = useCreateTransaction();
  const updateTransactionHook = useUpdateTransaction();
  const deleteTransactionHook = useDeleteTransaction();

  return {
    transactionsData: getTransactions.data,
    isFetchingTransactions: getTransactions.isLoading,
    fetchTransactionsError: getTransactions.error,
    fetchTransactions: getTransactions.fetchTransactions,

    createTransaction: createTransactionHook.createTransaction,
    isCreatingTransaction: createTransactionHook.isLoading,
    createTransactionError: createTransactionHook.error,

    updateTransaction: updateTransactionHook.updateTransaction,
    isUpdatingTransaction: updateTransactionHook.isLoading,
    updateTransactionError: updateTransactionHook.error,

    deleteTransaction: deleteTransactionHook.deleteTransaction,
    isDeletingTransaction: deleteTransactionHook.isLoading,
    deleteTransactionError: deleteTransactionHook.error,
  };
}
