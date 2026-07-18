import type { AccountType } from "../hooks/useInstitutions";

export interface CreateAccountDto {
  name: string;
  institutionId?: string;
  institution?: string;
  type: AccountType;
  last4Digits?: string;
}
