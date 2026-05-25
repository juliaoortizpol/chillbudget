import { useState, useCallback } from 'react';
import { useFetch } from '../../../hooks/useFetch';

export interface BudgetItem {
  _id?: string;
  budgetId?: string;
  name: string;
  description?: string;
  type: string;
  icon?: string;
  color?: string;
  plannedAmount: number;
  alertEnabled?: boolean;
  spent?: number;
}

export interface Budget {
  _id: string;
  name: string;
  periodType: 'monthly' | 'weekly' | 'custom';
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  name: string;
  periodType: string;
  startDate: string;
  endDate: string;
  status: string;
  items?: Omit<BudgetItem, '_id' | 'budgetId'>[];
}

export interface UpdateBudgetItemDto {
  plannedAmount?: number;
  alertEnabled?: boolean;
}

function useGetBudgets() {
  const { fetchApi } = useFetch();
  const [data, setData] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<Budget[]>('/budgets', { method: 'GET' });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budgets');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { data, fetchBudgets, isLoading, error };
}

function useGetBudgetById() {
  const { fetchApi } = useFetch();
  const [data, setData] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<Budget>(`/budgets/${id}`, { method: 'GET' });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budget');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { data, fetchBudget, isLoading, error };
}

function useUpdateBudgetItem() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBudgetItem = useCallback(async (budgetId: string, itemId: string, dto: UpdateBudgetItemDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<BudgetItem>(`/budgets/${budgetId}/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update budget item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { updateBudgetItem, isLoading, error };
}

function useAddBudgetItem() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBudgetItem = useCallback(async (budgetId: string, dto: Omit<BudgetItem, '_id' | 'budgetId'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<BudgetItem>(`/budgets/${budgetId}/items`, {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to add budget item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { addBudgetItem, isLoading, error };
}

function useCreateBudget() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBudget = useCallback(async (dto: CreateBudgetDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<Budget>('/budgets', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { createBudget, isLoading, error };
}

export interface UpdateBudgetDto {
  name?: string;
  periodType?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  items?: Omit<BudgetItem, '_id' | 'budgetId'>[];
}

function useUpdateBudget() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBudget = useCallback(async (id: string, dto: UpdateBudgetDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<Budget>(`/budgets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { updateBudget, isLoading, error };
}

function useDeleteBudgetItem() {
  const { fetchApi } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBudgetItem = useCallback(async (budgetId: string, itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<any>(`/budgets/${budgetId}/items/${itemId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  return { deleteBudgetItem, isLoading, error };
}

export function useBudget() {
  const getBudgets = useGetBudgets();
  const getBudgetById = useGetBudgetById();
  const updateBudgetItemHook = useUpdateBudgetItem();
  const updateBudgetHook = useUpdateBudget();
  const createBudgetHook = useCreateBudget();
  const deleteBudgetItemHook = useDeleteBudgetItem();
  const addBudgetItemHook = useAddBudgetItem();

  return {
    budgets: getBudgets.data,
    isFetchingBudgets: getBudgets.isLoading,
    fetchBudgetsError: getBudgets.error,
    fetchBudgets: getBudgets.fetchBudgets,

    activeBudget: getBudgetById.data,
    isFetchingActiveBudget: getBudgetById.isLoading,
    fetchActiveBudget: getBudgetById.fetchBudget,

    updateBudgetItem: updateBudgetItemHook.updateBudgetItem,
    isUpdatingBudgetItem: updateBudgetItemHook.isLoading,

    updateBudget: updateBudgetHook.updateBudget,
    isUpdatingBudget: updateBudgetHook.isLoading,

    createBudget: createBudgetHook.createBudget,
    isCreatingBudget: createBudgetHook.isLoading,

    deleteBudgetItem: deleteBudgetItemHook.deleteBudgetItem,
    isDeletingBudgetItem: deleteBudgetItemHook.isLoading,

    addBudgetItem: addBudgetItemHook.addBudgetItem,
    isAddingBudgetItem: addBudgetItemHook.isLoading,
  };
}
