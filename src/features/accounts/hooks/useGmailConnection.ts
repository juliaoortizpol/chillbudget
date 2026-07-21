import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";

export interface GmailConnectionStatus {
  connected: boolean;
  email?: string;
  status?: "active" | "disconnected" | "re_auth_required";
  lastReadAt?: string;
}

export function useGmailConnection() {
  const { fetchApi } = useFetch();
  const [connection, setConnection] = useState<GmailConnectionStatus>({
    connected: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status =
        await fetchApi<GmailConnectionStatus>("/gmail-reader/status");
      setConnection(status);
      return status;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load Gmail status",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    // Load the remote connection state when the Accounts page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
  }, [fetchStatus]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { url } = await fetchApi<{ url: string }>(
        "/gmail-reader/auth-url",
      );
      window.location.assign(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start Gmail connection",
      );
      setIsConnecting(false);
    }
  }, [fetchApi]);

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    setError(null);
    try {
      const status = await fetchApi<GmailConnectionStatus>(
        "/gmail-reader/connection",
        { method: "DELETE" },
      );
      setConnection(status);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect Gmail",
      );
    } finally {
      setIsDisconnecting(false);
    }
  }, [fetchApi]);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    setSyncMessage(null);
    try {
      const result = await fetchApi<{
        persistence?: { transactionsCreated?: number; duplicatesSkipped?: number };
      }>("/transaction-mail-import/sync", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const created = result.persistence?.transactionsCreated || 0;
      const duplicates = result.persistence?.duplicatesSkipped || 0;
      setSyncMessage(
        `Sync complete: ${created} transaction${created === 1 ? "" : "s"} added, ${duplicates} duplicate${duplicates === 1 ? "" : "s"} skipped.`,
      );
      await fetchStatus();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gmail sync failed");
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [fetchApi, fetchStatus]);

  return {
    connection,
    isLoading,
    isConnecting,
    isDisconnecting,
    isSyncing,
    error,
    syncMessage,
    fetchStatus,
    connect,
    disconnect,
    sync,
  };
}
