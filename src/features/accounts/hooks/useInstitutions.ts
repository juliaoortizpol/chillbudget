import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "credit_card",
  "investment",
  "loan",
  "brokerage",
  "retirement",
  "other",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface Institution {
  _id: string;
  name: string;
  slug: string;
  aliases: string[];
  supportedAccountTypes: AccountType[];
  enabled: boolean;
}

export function useInstitutions() {
  const { fetchApi } = useFetch();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstitutions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApi<Institution[]>("/institutions");
      setInstitutions(data);
      return data;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load institutions"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    // The hook owns the request lifecycle and loads its remote resource on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInstitutions();
  }, [fetchInstitutions]);

  return { institutions, isLoading, error, fetchInstitutions };
}
