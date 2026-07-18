import { useMemo, useState } from "react";
import {
  ACCOUNT_TYPES,
  type AccountType,
  type Institution,
  useInstitutions,
} from "./useInstitutions";

export function formatAccountType(type: AccountType) {
  return type
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function useInstitutionSelector() {
  const { institutions, isLoading, error, fetchInstitutions } =
    useInstitutions();
  const [search, setSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("checking");

  const filteredInstitutions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return institutions;

    return institutions.filter(
      (institution) =>
        institution.name.toLowerCase().includes(query) ||
        institution.aliases.some((alias) =>
          alias.toLowerCase().includes(query)
        )
    );
  }, [institutions, search]);

  const availableAccountTypes =
    selectedInstitution?.supportedAccountTypes.length
      ? selectedInstitution.supportedAccountTypes
      : ACCOUNT_TYPES;

  const updateSearch = (value: string) => {
    setSearch(value);
    setSelectedInstitution(null);
    setIsOpen(true);
  };

  const selectInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    setSearch(institution.name);
    setIsOpen(false);

    if (!institution.supportedAccountTypes.includes(accountType)) {
      setAccountType(institution.supportedAccountTypes[0] || "other");
    }
  };

  const selectAccountType = (value: string) => {
    if (ACCOUNT_TYPES.includes(value as AccountType)) {
      setAccountType(value as AccountType);
    }
  };

  return {
    search,
    updateSearch,
    selectedInstitution,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    filteredInstitutions,
    isLoading,
    error,
    retry: fetchInstitutions,
    selectInstitution,
    accountType,
    selectAccountType,
    availableAccountTypes,
  };
}
