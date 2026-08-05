import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Calendar as CalendarIcon, ChevronDown, Plus, Trash2, X } from "lucide-react"
import { useTableEditor } from "@/hooks/useTableEditor"
import { cn, formatMoneyInput } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { type Transaction, type TransactionCategory } from "../../data/mock-transactions"
import {
  useEditableDateCell,
  useEditableCategoryCell,
  useAppendTransactionRow,
  useTransactionsTable
} from "./useTransactionsTable"

export function EditableTextCell({ initialValue, onSave, className }: { initialValue: string, onSave: (val: string) => void, className?: string }) {
  const { isEditing, value, setValue, startEditing, saveEditing, handleKeyDown } = useTableEditor<string>(
    initialValue,
    onSave
  )

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={saveEditing}
        className={cn("h-7 px-2 py-0 text-sm", className)}
      />
    )
  }

  return (
    <div 
      className={cn("cursor-pointer hover:bg-muted/30 px-1 rounded transition-colors truncate", className)}
      onClick={startEditing}
    >
      {initialValue}
    </div>
  )
}

export function EditableDateCell({ initialValue, onSave, className }: { initialValue: string, onSave: (val: string) => void, className?: string }) {
  const { date, isOpen, setIsOpen, handleSelect } = useEditableDateCell(initialValue, onSave)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={
        <div className={cn("cursor-pointer hover:bg-muted/30 px-1 rounded transition-colors truncate w-fit", className)} />
      }>
        {date ? format(date, "MMM d, yyyy") : initialValue}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

export function EditableCurrencyCell({ initialValue, onSave, className }: { initialValue: number, onSave: (val: number) => void, className?: string }) {
  const { isEditing, value, setValue, startEditing, saveEditing, handleKeyDown } = useTableEditor<string>(
    formatMoneyInput(initialValue.toString()),
    (val) => onSave(Number(val.replace(/,/g, '')) || 0)
  )

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(formatMoneyInput(e.target.value))}
        onKeyDown={handleKeyDown}
        onBlur={saveEditing}
        className={cn("h-7 px-2 py-0 text-sm w-36", className)}
      />
    )
  }

  const isNegative = initialValue < 0
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always'
  }).format(initialValue)

  return (
    <div 
      className={cn(`cursor-pointer hover:bg-muted/30 px-1 rounded transition-colors ${isNegative ? "text-red-600" : "text-emerald-600"}`, className)}
      onClick={startEditing}
    >
      {formatted}
    </div>
  )
}

export function EditableCategoryCell({ initialValue, onSave, categories }: { initialValue: TransactionCategory, onSave: (val: TransactionCategory) => void, categories: Record<string, TransactionCategory> }) {
  const { 
    isEditing, setIsEditing, value, startEditing, handleChange, bgClass, textClass 
  } = useEditableCategoryCell(initialValue, onSave, categories)

  if (isEditing) {
    return (
      <select 
        autoFocus
        value={Object.keys(categories).find(key => categories[key].name === value.name) || ""}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        className="flex h-7 w-full max-w-[140px] items-center justify-between rounded-md border border-input bg-background px-2 py-0 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <option value="" disabled hidden>Select Category</option>
        {Object.entries(categories).map(([key, cat]) => (
          <option key={key} value={key}>{cat.name}</option>
        ))}
      </select>
    )
  }

  return (
    <div 
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit cursor-pointer hover:opacity-80 transition-opacity", bgClass)}
      onClick={startEditing}
    >
      <span className={textClass}>{value.icon}</span>
      <span className={textClass}>{value.name}</span>
      {value.budgetUsedPercentage !== undefined && (
        <svg className={cn("ml-1 w-3.5 h-3.5 transform -rotate-90", textClass)} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20" />
          <circle 
            cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="3" 
            strokeDasharray={`${2 * Math.PI * 8}`} 
            strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(value.budgetUsedPercentage, 100) / 100)}`} 
            strokeLinecap="round" 
          />
        </svg>
      )}
    </div>
  )
}



function AppendTransactionForm({ categories, onAppend, onComplete, inline = false }: { categories: Record<string, TransactionCategory>, onAppend?: (data: any) => void | Promise<void>, onComplete?: () => void, inline?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    date, setDate,
    isCalendarOpen, setIsCalendarOpen,
    amount, setAmount, handleInteraction, handleAmountChange, handleAmountFocus, handleAmountBlur, categoryKey, setCategoryKey,
    description, setDescription
  } = useAppendTransactionRow()

  const hasCategories = Object.keys(categories).length > 0;
  const hasAmount = amount !== "" && amount !== "-";
  const showCurrencySymbol = /\d/.test(amount);
  const canAppend = Boolean(description.trim() && hasAmount && categoryKey);
  const addButtonLabel = !description.trim()
    ? "Enter a description first"
    : !categoryKey
      ? "Select a category first"
      : !hasAmount
        ? "Enter an amount first"
        : "Add transaction";

  return (
    <div className={cn(
      "grid grid-cols-1 gap-3 bg-muted/35 p-3 sm:grid-cols-2",
      inline
        ? "border-t border-border lg:grid-cols-[120px_minmax(140px,1fr)_minmax(120px,0.8fr)_120px_36px] lg:items-center lg:gap-2 lg:py-2 lg:pl-4 lg:pr-3"
        : "rounded-xl"
    )}>
      <div className="min-w-0">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger render={
            <Button
              variant="outline"
              className={cn(
                "h-9 w-full justify-start border-input bg-background px-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            />
          }>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setIsCalendarOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="min-w-0">
        <Input 
          placeholder="Enter description..." 
          className="h-9 bg-background" 
          value={description}
          onChange={(e) => {
            handleInteraction();
            setDescription(e.target.value);
          }}
        />
      </div>
      <div className="min-w-0">
        <div className="relative">
          <select 
            aria-label="Transaction category"
            title={categoryKey ? categories[categoryKey]?.name : undefined}
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            onChange={(e) => {
              handleInteraction();
              setCategoryKey(e.target.value);
            }}
            value={categoryKey}
            disabled={!hasCategories}
          >
            <option value="" disabled hidden>{hasCategories ? "Select Category" : "No categories"}</option>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="relative">
          {showCurrencySymbol && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">$</span>
          )}
          <Input 
            placeholder="-0.00"
            className={cn(
              "h-9 w-full bg-background font-medium",
              showCurrencySymbol ? "pl-7" : "pl-3"
            )}
            value={amount}
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
            onChange={handleAmountChange}
          />
        </div>
      </div>
      <div className={cn("sm:col-span-2", inline && "lg:col-span-1")}>
        <Button 
          type="button"
          size="icon" 
          className={cn(
            "h-9 w-full shrink-0 rounded-lg bg-primary text-white hover:bg-ds-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100",
            inline && "lg:w-9"
          )}
          aria-label={addButtonLabel}
          title={addButtonLabel}
          onClick={async () => {
            if (onAppend && description && hasAmount && categoryKey) {
              setIsSubmitting(true)
              try {
                await onAppend({ date, description, categoryKey, amount });
                setDescription("");
                setAmount("");
                setCategoryKey("");
                onComplete?.()
              } finally {
                setIsSubmitting(false)
              }
            }
          }}
          disabled={!canAppend || isSubmitting}
        >
          <Plus className="w-5 h-5" />
          <span className={cn(inline && "lg:hidden")}>{isSubmitting ? "Adding..." : "Add transaction"}</span>
        </Button>
      </div>
    </div>
  )
}

interface TransactionsTableProps {
  data: Transaction[]
  onUpdateItem?: (id: string, updates: any) => void
  onDeleteItem?: (id: string) => void
  onAppendItem?: (data: any) => void | Promise<void>
  categories?: Record<string, TransactionCategory>
  emptyTitle?: string
  emptyDescription?: string
}

interface AddTransactionDialogProps {
  categories: Record<string, TransactionCategory>
  onAppend?: (data: any) => void | Promise<void>
}

export function AddTransactionDialog({ categories, onAppend }: AddTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <Button
        type="button"
        className="fixed bottom-4 right-4 z-30 h-11 bg-primary px-4 text-white shadow-lg hover:bg-ds-primary-hover md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add transaction
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="add-transaction-title">
          <button type="button" className="absolute inset-0 bg-[#0B2C40]/50 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} aria-label="Close add transaction dialog" />
          <div className="relative z-10 w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="add-transaction-title" className="text-xl font-bold text-foreground">Add transaction</h2>
                <p className="mt-1 text-sm text-muted-foreground">Keep the minus sign for an expense; remove it for income.</p>
              </div>
              <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setIsOpen(false)} aria-label="Close dialog">
                <X className="h-5 w-5" />
              </button>
            </div>
            <AppendTransactionForm categories={categories} onAppend={onAppend} onComplete={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

export function TransactionsTable({
  data,
  onUpdateItem,
  onDeleteItem,
  onAppendItem,
  categories = {},
  emptyTitle,
  emptyDescription,
}: TransactionsTableProps) {
  const { columns } = useTransactionsTable(onUpdateItem, onDeleteItem, categories)

  return (
    <div className="border border-border shadow-sm rounded-xl bg-card relative overflow-hidden flex flex-col">
      <div className="md:hidden">
        {data.length > 0 ? (
          <div className="divide-y divide-border">
            {data.map((transaction) => (
              <article key={transaction.id} className="p-3">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <EditableTextCell
                      initialValue={transaction.description}
                      onSave={(value) => onUpdateItem?.(transaction.id, { description: value })}
                      className="text-sm font-bold leading-tight text-foreground"
                    />

                    <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                      <EditableDateCell
                        initialValue={transaction.date}
                        onSave={(value) => onUpdateItem?.(transaction.id, { date: value })}
                        className="shrink-0 text-xs font-medium text-muted-foreground"
                      />
                      <span className="text-muted-foreground/40">•</span>
                      <div className="min-w-0 overflow-hidden [&>div]:max-w-full [&>div]:truncate [&>div]:px-2 [&>div]:py-0.5">
                    <EditableCategoryCell
                      initialValue={transaction.category}
                      onSave={(value) => onUpdateItem?.(transaction.id, { category: value })}
                      categories={categories}
                    />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <EditableCurrencyCell
                      initialValue={transaction.amount}
                      onSave={(value) => onUpdateItem?.(transaction.id, { amount: value })}
                      className="text-sm font-bold tabular-nums"
                    />
                    {onDeleteItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(transaction.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${transaction.description}`}
                        title="Delete transaction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center px-6 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">{emptyTitle || "No results"}</p>
            {emptyDescription && <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>}
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={data}
          containerClassName="max-h-none h-auto"
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          hideHeaderWhenEmpty
        />
      </div>
      <div className="hidden md:block">
        <AppendTransactionForm categories={categories} onAppend={onAppendItem} inline />
      </div>
    </div>
  )
}
