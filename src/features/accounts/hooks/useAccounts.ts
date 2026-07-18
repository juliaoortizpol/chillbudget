import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";

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

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
  };
}
