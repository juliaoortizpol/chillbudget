import type { Transaction } from "../data/mock-transactions"

export type TransactionUpdates = Partial<Pick<Transaction, "date" | "description" | "category" | "amount">>

export interface AppendTransactionData {
  date: Date | undefined
  description: string
  categoryKey: string
  amount: string
}
