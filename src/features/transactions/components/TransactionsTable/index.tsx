import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, ChevronDown, Plus } from "lucide-react"
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



function AppendTransactionRow({ categories, onAppend }: { categories: Record<string, TransactionCategory>, onAppend?: (data: any) => void }) {
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
    <div className="grid grid-cols-1 gap-3 border-t border-border bg-[#f4f7f4]/40 p-3 sm:grid-cols-2 xl:grid-cols-[132px_minmax(180px,1fr)_minmax(160px,0.8fr)_144px_44px] xl:items-center xl:gap-2 xl:py-2 xl:pl-4 xl:pr-3">
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
      <div className="sm:col-span-2 xl:col-span-1">
        <Button 
          type="button"
          size="icon" 
          className="h-9 w-full shrink-0 rounded-lg bg-primary text-white hover:bg-ds-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 xl:w-9"
          aria-label={addButtonLabel}
          title={addButtonLabel}
          onClick={() => {
            if (onAppend && description && hasAmount && categoryKey) {
              onAppend({ date, description, categoryKey, amount });
              // Reset
              setDescription("");
              setAmount("");
              setCategoryKey("");
            }
          }}
          disabled={!canAppend}
        >
          <Plus className="w-5 h-5" />
          <span className="xl:hidden">Add transaction</span>
        </Button>
      </div>
    </div>
  )
}

interface TransactionsTableProps {
  data: Transaction[]
  onUpdateItem?: (id: string, updates: any) => void
  onDeleteItem?: (id: string) => void
  onAppendItem?: (data: any) => void
  categories?: Record<string, TransactionCategory>
  emptyTitle?: string
  emptyDescription?: string
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
      <DataTable 
        columns={columns} 
        data={data} 
        containerClassName="max-h-none h-auto [&_table]:min-w-[700px]"
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      <AppendTransactionRow categories={categories} onAppend={onAppendItem} />
    </div>
  )
}
