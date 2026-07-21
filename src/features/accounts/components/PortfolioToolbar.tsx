import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AccountsView = "accounts" | "connections";

export function PortfolioToolbar({
  activeView,
  onViewChange,
}: {
  activeView: AccountsView;
  onViewChange: (view: AccountsView) => void;
}) {
  const tabClass = (view: AccountsView) =>
    `rounded-md px-4 py-1.5 text-sm ${
      activeView === view
        ? "bg-white font-semibold text-[#0f766e] shadow-sm"
        : "font-medium text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 p-6 pb-4 sm:flex-row sm:items-center">
      <h2 className="text-lg font-bold text-slate-900">
        {activeView === "accounts" ? "Account Portfolio" : "Connections"}
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button type="button" onClick={() => onViewChange("accounts")} className={tabClass("accounts")}>
            All Accounts
          </button>
          <button type="button" onClick={() => onViewChange("connections")} className={tabClass("connections")}>
            Connections
          </button>
        </div>
        {activeView === "accounts" && (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <ListFilter className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
