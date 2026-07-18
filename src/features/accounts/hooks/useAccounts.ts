import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import type { CreateAccountDto } from "../types/accounts";

export type AccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "investment"
  | "loan"
  | "brokerage"
  | "retirement"
  | "other";

export type AccountStatus = "active" | "pending" | "re_auth_required";

export interface Account {
  _id: string;
  name: string;
  institution: string;
  institutionId?: string;
  type?: AccountType;
  maxBalance?: number;
  last4Digits?: string;
  status?: AccountStatus;
  lastSynced?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAccounts() {
  const { fetchApi } = useFetch();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchApi<Account[]>("/accounts");
      setAccounts(response);
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch accounts";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    // Fetching on mount intentionally updates this hook's request state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = useCallback(
    async (dto: CreateAccountDto) => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const account = await fetchApi<Account>("/accounts", {
          method: "POST",
          body: JSON.stringify(dto),
        });
        setAccounts((current) => [...current, account]);
        return account;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create account";
        setCreateError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchApi],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      setDeletingAccountId(accountId);
      setDeleteError(null);

      try {
        await fetchApi(`/accounts/${accountId}`, { method: "DELETE" });
        setAccounts((current) =>
          current.filter((account) => account._id !== accountId),
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete account";
        setDeleteError(message);
        throw err;
      } finally {
        setDeletingAccountId(null);
      }
    },
    [fetchApi],
  );

  return {
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
  };
}
