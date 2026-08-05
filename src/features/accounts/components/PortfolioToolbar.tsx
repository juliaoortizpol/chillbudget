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
        ? "bg-white font-semibold text-primary shadow-sm"
        : "font-medium text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-6 sm:pb-4">
      <h2 className="text-lg font-bold text-slate-900">
        {activeView === "accounts" ? "Account Portfolio" : "Connections"}
      </h2>
      <div className="w-full sm:w-auto">
        <div className="grid w-full grid-cols-2 rounded-lg bg-slate-100 p-1 sm:flex sm:w-auto">
          <button type="button" onClick={() => onViewChange("accounts")} className={tabClass("accounts")}>
            All Accounts
          </button>
          <button type="button" onClick={() => onViewChange("connections")} className={tabClass("connections")}>
            Connections
          </button>
        </div>
      </div>
    </div>
  );
}
