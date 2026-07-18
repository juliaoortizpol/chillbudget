import { Search } from "lucide-react";
import type { Institution } from "../hooks/useInstitutions";
import { formatAccountType } from "../hooks/useInstitutionSelector";

interface InstitutionSelectorProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedInstitution: Institution | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  institutions: Institution[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelect: (institution: Institution) => void;
}

export function InstitutionSelector({
  search,
  onSearchChange,
  selectedInstitution,
  isOpen,
  onOpen,
  onClose,
  institutions,
  isLoading,
  error,
  onRetry,
  onSelect,
}: InstitutionSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold tracking-wider text-slate-600 uppercase">
        Bank or Institution Name
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search or type bank name..."
          className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]"
          value={search}
          onFocus={onOpen}
          onBlur={onClose}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />

        {isOpen && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Loading institutions...
              </div>
            ) : error ? (
              <div className="px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  className="mt-1 text-xs font-bold text-[#0f766e]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onRetry}
                >
                  Try again
                </button>
              </div>
            ) : institutions.length ? (
              institutions.map((institution) => (
                <button
                  type="button"
                  key={institution._id}
                  className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-slate-50"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(institution)}
                >
                  <span className="text-sm font-medium text-slate-900">
                    {institution.name}
                  </span>
                  <span className="text-right text-xs text-slate-400">
                    {institution.supportedAccountTypes
                      .map(formatAccountType)
                      .join(", ")}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm text-slate-700">
                  Use “{search.trim()}” as a custom institution
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Custom institutions do not support automatic mail import.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedInstitution && (
        <p className="text-[11px] font-medium text-[#0f766e]">
          Supported institution selected
        </p>
      )}
    </div>
  );
}
