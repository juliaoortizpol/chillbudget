import { Mail, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GmailConnectionStatus } from "../hooks/useGmailConnection";

interface ConnectionsPanelProps {
  connection: GmailConnectionStatus;
  isLoading: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRetry: () => void;
}

export function ConnectionsPanel({
  connection,
  isLoading,
  isConnecting,
  isDisconnecting,
  error,
  onConnect,
  onDisconnect,
  onRetry,
}: ConnectionsPanelProps) {
  if (isLoading) {
    return <div className="p-10 text-center text-sm text-slate-500">Loading connections...</div>;
  }

  if (error && !connection.email) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  if (!connection.email) {
    return (
      <div className="m-6 flex flex-col items-start justify-between gap-5 rounded-xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white p-3 text-[#0f766e] shadow-sm">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Connect Gmail</h3>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Import supported financial transaction emails and match them to your accounts.
            </p>
          </div>
        </div>
        <Button onClick={onConnect} disabled={isConnecting} className="bg-[#0f766e] text-white hover:bg-[#0d645e]">
          <Plus className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Add Gmail Connection"}
        </Button>
      </div>
    );
  }

  const needsReconnect =
    !connection.connected || connection.status === "re_auth_required";

  return (
    <div>
      {error && <p className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4">Connection</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Read</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4 font-semibold text-slate-900">
                <span className="inline-flex items-center gap-3"><Mail className="h-5 w-5 text-red-500" />Gmail</span>
              </td>
              <td className="px-6 py-4 text-slate-600">{connection.email}</td>
              <td className="px-6 py-4">
                <span className={needsReconnect ? "font-semibold text-amber-600" : "font-semibold text-[#0f766e]"}>
                  {needsReconnect ? "Reconnect required" : "Connected"}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600">
                {connection.lastReadAt ? new Date(connection.lastReadAt).toLocaleString() : "Never"}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  {needsReconnect && (
                    <Button variant="outline" onClick={onConnect} disabled={isConnecting}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {isConnecting ? "Connecting..." : "Reconnect"}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={onDisconnect} disabled={isDisconnecting} className="text-slate-400 hover:bg-red-50 hover:text-red-600" title="Disconnect Gmail">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
