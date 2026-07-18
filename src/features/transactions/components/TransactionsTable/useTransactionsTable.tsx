import * as React from "react"
import { format, parse } from "date-fns"
import { type TransactionCategory, type Transaction } from "../../data/mock-transactions"
import { type ColumnDef } from "@tanstack/react-table"
import {
  EditableDateCell,
  EditableTextCell,
  EditableCategoryCell,
  EditableCurrencyCell
} from "./index"
import { formatMoneyInput } from "@/lib/utils"

export function useEditableDateCell(initialValue: string, onSave: (val: string) => void) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    try {
      const parsed = parse(initialValue, "MMM d, yyyy", new Date())
      if (!isNaN(parsed.getTime())) return parsed
    } catch(e) {}
    return undefined
  })
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      setIsOpen(false)
      const formattedStr = format(newDate, "MMM d, yyyy")
      if (formattedStr !== initialValue) {
        onSave(formattedStr)
      }
    }
  }

  return { date, isOpen, setIsOpen, handleSelect }
}

export function useEditableCategoryCell(initialValue: TransactionCategory, onSave: (val: TransactionCategory) => void, categories: Record<string, TransactionCategory>) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    // If the active budget changes, initialValue might not be valid anymore
    // but for now we just sync it
    setValue(initialValue)
  }, [initialValue])

  const startEditing = () => setIsEditing(true)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value
    const selectedCategory = categories[selectedKey]
    if (selectedCategory) {
      setValue(selectedCategory)
      setIsEditing(false)
      onSave(selectedCategory)
    }
  }

  const isOverBudget = value.budgetUsedPercentage !== undefined && value.budgetUsedPercentage >= 100
  const isUnderBudget = value.budgetUsedPercentage !== undefined && value.budgetUsedPercentage < 100

  let bgClass = value.iconBgClass
  let textClass = value.iconColor

  if (isOverBudget) {
    bgClass = "bg-red-500/10"
    textClass = "text-red-700"
  } else if (isUnderBudget) {
    bgClass = "bg-emerald-500/10"
    textClass = "text-emerald-700"
  }

  return {
    isEditing,
    setIsEditing,
    value,
    startEditing,
    handleChange,
    bgClass,
    textClass
  }
}

export function useAppendTransactionRow() {
  const [date, setDate] = React.useState<Date | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  // New transactions default to expenses. Removing the minus sign lets the
  // user explicitly enter a positive income amount.
  const [amount, setAmount] = React.useState("-")
  const [categoryKey, setCategoryKey] = React.useState("")
  const [description, setDescription] = React.useState("")

  const handleInteraction = () => {
    if (!date) {
      setDate(new Date())
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInteraction()
    setAmount(formatMoneyInput(e.target.value))
  }

  return {
    date,
    setDate,
    isCalendarOpen,
    setIsCalendarOpen,
    amount,
    setAmount,
    handleInteraction,
    handleAmountChange,
    categoryKey,
    setCategoryKey,
    description,
    setDescription,
  }
}

export function useTransactionsTable(onUpdateItem?: (id: string, updates: any) => void, onDeleteItem?: (id: string) => void, categories: Record<string, TransactionCategory> = {}) {
  const safeOnUpdateItem = onUpdateItem || (() => {})
  const safeOnDeleteItem = onDeleteItem || (() => {})

  const columns = React.useMemo<ColumnDef<Transaction>[]>(() => [
    {
      accessorKey: "date",
      header: () => <div className="px-1">DATE</div>,
      cell: ({ row }) => (
        <EditableDateCell 
          initialValue={row.original.date}
          onSave={(val) => safeOnUpdateItem(row.original.id, { date: val })}
          className="font-medium text-muted-foreground"
        />
      ),
    },
    {
      accessorKey: "description",
      header: "DESCRIPTION",
      cell: ({ row }) => (
        <EditableTextCell 
          initialValue={row.original.description}
          onSave={(val) => safeOnUpdateItem(row.original.id, { description: val })}
          className="font-bold text-foreground"
        />
      ),
    },
    {
      accessorKey: "category",
      header: "CATEGORY",
      cell: ({ row }) => (
        <EditableCategoryCell 
          initialValue={row.original.category}
          onSave={(val) => safeOnUpdateItem(row.original.id, { category: val })}
          categories={categories}
        />
      ),
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <EditableCurrencyCell 
          initialValue={row.original.amount}
          onSave={(val) => safeOnUpdateItem(row.original.id, { amount: val })}
          className="font-bold"
        />
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-end px-2">
          <button 
            onClick={() => safeOnDeleteItem(row.original.id)}
            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
            title="Delete transaction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      ),
    },
  ], [safeOnUpdateItem, safeOnDeleteItem, categories])

  return {
    columns
  }
}
