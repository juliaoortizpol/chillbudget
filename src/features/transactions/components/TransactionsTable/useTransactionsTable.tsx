import * as React from "react"
import { format, parse } from "date-fns"
import { categories, type TransactionCategory, type Transaction } from "../../data/mock-transactions"
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

export function useEditableCategoryCell(initialValue: TransactionCategory, onSave: (val: TransactionCategory) => void) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
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
  const [amount, setAmount] = React.useState("")

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
    handleInteraction,
    handleAmountChange
  }
}

export function useTransactionsTable(onUpdateItem?: (id: string, updates: any) => void) {
  const safeOnUpdateItem = onUpdateItem || (() => {})

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
      cell: () => null,
    },
  ], [safeOnUpdateItem])

  return {
    columns
  }
}
