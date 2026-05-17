import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { useTableEditor } from "@/hooks/useTableEditor"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { type Transaction, categories, type TransactionCategory } from "../data/mock-transactions"

function EditableTextCell({ initialValue, onSave, className }: { initialValue: string, onSave: (val: string) => void, className?: string }) {
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

function EditableDateCell({ initialValue, onSave, className }: { initialValue: string, onSave: (val: string) => void, className?: string }) {
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

function EditableCurrencyCell({ initialValue, onSave, className }: { initialValue: number, onSave: (val: number) => void, className?: string }) {
  const { isEditing, value, setValue, startEditing, saveEditing, handleKeyDown } = useTableEditor<string>(
    initialValue.toString(),
    (val) => onSave(Number(val) || 0)
  )

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={saveEditing}
        className={cn("h-7 px-2 py-0 text-sm w-24", className)}
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

function EditableCategoryCell({ initialValue, onSave }: { initialValue: TransactionCategory, onSave: (val: TransactionCategory) => void }) {
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

function getColumns(onUpdateItem: (id: string, updates: any) => void): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "date",
      header: () => <div className="px-1">DATE</div>,
      cell: ({ row }) => (
        <EditableDateCell 
          initialValue={row.original.date}
          onSave={(val) => onUpdateItem(row.original.id, { date: val })}
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
          onSave={(val) => onUpdateItem(row.original.id, { description: val })}
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
          onSave={(val) => onUpdateItem(row.original.id, { category: val })}
        />
      ),
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <EditableCurrencyCell 
          initialValue={row.original.amount}
          onSave={(val) => onUpdateItem(row.original.id, { amount: val })}
          className="font-bold"
        />
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: () => null,
    },
  ]
}

function AppendTransactionRow() {
  const [date, setDate] = React.useState<Date | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  return (
    <tr className="border-t-0 bg-[#f4f7f4]/40">
      <td className="p-2 pl-4">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger render={
            <Button
              variant="outline"
              className={cn(
                "h-9 w-32 justify-start text-left font-normal bg-background border-input px-3",
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
      </td>
      <td className="p-2">
        <Input placeholder="Enter description..." className="h-9 bg-background" />
      </td>
      <td className="p-2">
        <div className="relative">
          <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
            <option value="" disabled selected hidden>Select Category</option>
            <option value="tech">Technology</option>
            <option value="food">Dining</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">v</span>
        </div>
      </td>
      <td className="p-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
          <Input placeholder="0.00" className="h-9 w-24 bg-background pl-7 font-medium" />
        </div>
      </td>
      <td className="p-2 pr-4 text-right">
        <Button size="icon" className="h-9 w-9 bg-[#05603A] hover:bg-[#05603A]/90 text-white rounded-lg shrink-0">
          <Plus className="w-5 h-5" />
        </Button>
      </td>
    </tr>
  )
}

export function TransactionsTable({ data, onUpdateItem }: { data: Transaction[], onUpdateItem?: (id: string, updates: any) => void }) {
  const columns = React.useMemo(() => getColumns(onUpdateItem || (() => {})), [onUpdateItem])

  return (
    <div className="border border-border shadow-sm rounded-xl bg-card relative overflow-hidden flex flex-col">
      <DataTable 
        columns={columns} 
        data={data} 
        containerClassName="max-h-none h-auto"
        appendRowComponent={<AppendTransactionRow />}
      />
    </div>
  )
}
