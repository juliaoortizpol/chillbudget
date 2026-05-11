import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { useTableEditor } from "@/hooks/useTableEditor"
import { Input } from "@/components/ui/input"
import { DashboardCard } from "@/features/dashboard/components/DashboardCard"
import { CheckCircle2, AlertTriangle, Filter, MoreVertical, Plus, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type BudgetCategory = {
  id: string
  name: string
  description: string
  allocated: number
  spent: number
  icon: React.ReactNode
  iconBgClass: string
  iconColor: string
}

// Editable Cell Component
function EditableCurrencyCell({ initialValue, onSave }: { initialValue: number, onSave: (val: number) => void }) {
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
        className="w-24 h-8 text-sm font-bold mx-auto text-center"
      />
    )
  }

  return (
    <div 
      className="cursor-pointer hover:bg-muted/50 p-1.5 rounded-md border border-transparent hover:border-border transition-colors w-24 text-center font-bold mx-auto"
      onClick={startEditing}
    >
      ${initialValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  )
}

function getColumns(
  onUpdateAllocated: (id: string, amount: number) => void,
  onDeleteItem: (id: string) => void
): ColumnDef<BudgetCategory>[] {
  return [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }) => {
        const category = row.original
        const isZero = category.allocated === 0
        return (
          <div className={`flex items-center gap-4 py-1 pl-2 ${isZero ? 'opacity-50 grayscale transition-opacity hover:opacity-80' : ''}`}>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: category.iconBgClass, color: category.iconColor }}
            >
              {category.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-foreground">{category.name}</span>
              <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
                {isZero ? "Disabled (No Budget)" : category.description}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "allocated",
      header: () => <div className="text-center w-full">Allocated</div>,
      cell: ({ row }) => {
        const isZero = row.original.allocated === 0
        return (
          <div className={isZero ? 'opacity-60' : ''}>
            <EditableCurrencyCell 
              initialValue={row.original.allocated} 
              onSave={(val) => onUpdateAllocated(row.original.id, val)} 
            />
          </div>
        )
      },
    },
    {
      accessorKey: "spent",
      header: () => <div className="text-center w-full">Spent</div>,
      cell: ({ row }) => {
        const { spent, allocated } = row.original
        const isOverBudget = spent > allocated
        const isZero = allocated === 0
        return (
          <div className={`text-center font-bold p-1.5 ${isZero ? 'opacity-40 grayscale' : ''}`}>
            <span className={isOverBudget && !isZero ? "text-red-600" : "text-emerald-600"}>
              ${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )
      },
    },
    {
      id: "contrast",
      header: () => <div className="text-center w-full">Contrast Visualization</div>,
      cell: ({ row }) => {
        const { allocated, spent } = row.original
        const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0
        const isOverBudget = spent > allocated
        const isZero = allocated === 0
        
        return (
          <div className={`flex justify-center w-full ${isZero ? 'opacity-30 grayscale' : ''}`}>
            <div className="w-full max-w-[140px] h-2 bg-muted/60 rounded-full overflow-hidden flex">
              <div 
                className={`h-full ${isOverBudget ? "bg-red-700" : "bg-emerald-700"}`} 
                style={{ width: `${percent}%` }} 
              />
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right w-full pr-6">Status / Actions</div>,
      cell: ({ row }) => {
        const category = row.original
        const isOverBudget = category.spent > category.allocated
        const isZero = category.allocated === 0

        return (
          <div className="flex items-center justify-end pr-2 gap-3">
            {!isZero && isOverBudget ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : !isZero ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <div className="w-5 h-5" /> // Spacer for alignment
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 font-medium">
                <DropdownMenuItem 
                  onClick={() => onDeleteItem(category.id)}
                  className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

function AppendCategoryRow({ onCreate }: { onCreate: (name: string, description: string, allocated: number) => void }) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [allocated, setAllocated] = React.useState("")

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      onCreate(name, description, Number(allocated) || 0)
      setName("")
      setDescription("")
      setAllocated("")
    }
  }

  return (
    <TableRow className="border-b-0 hover:bg-transparent opacity-60 focus-within:opacity-100 transition-opacity group">
      <TableCell className="py-4">
        <div className="flex items-center gap-4 pl-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/80">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1 w-full max-w-[200px]">
            <Input 
              placeholder="New Item Name" 
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 text-[15px] font-bold border-transparent bg-muted/40 focus-visible:bg-muted/80 px-2 rounded-md shadow-none"
            />
            <Input 
              placeholder="Brief description..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-5 text-[11px] font-medium text-muted-foreground border-transparent bg-transparent focus-visible:bg-muted/40 px-2 rounded-md shadow-none"
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center py-4">
        <div className="relative w-24 mx-auto">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
          <Input 
            placeholder="0.00" 
            value={allocated}
            onChange={e => setAllocated(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 pl-6 text-sm font-bold border-transparent bg-muted/40 focus-visible:bg-muted/80 rounded-md shadow-none"
          />
        </div>
      </TableCell>
      <TableCell className="text-center py-4 font-bold text-muted-foreground opacity-50">
        $0.00
      </TableCell>
      <TableCell className="py-4">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-[140px] h-2 bg-muted/40 rounded-full"></div>
        </div>
      </TableCell>
      <TableCell className="text-right py-4 pr-6">
        <div className="flex justify-end pr-2">
          <div className="w-5 h-5" />
        </div>
      </TableCell>
    </TableRow>
  )
}

interface CategoryTableProps {
  categories: BudgetCategory[]
  onUpdateAllocated: (categoryId: string, amount: number) => void
  onCreateItem: (name: string, description: string, allocated: number) => void
  onDeleteItem: (categoryId: string) => void
  isLoading?: boolean
}

export function CategoryTable({ 
  categories, 
  onUpdateAllocated, 
  onCreateItem, 
  onDeleteItem,
  isLoading 
}: CategoryTableProps) {
  const columns = React.useMemo(() => getColumns(onUpdateAllocated, onDeleteItem), [onUpdateAllocated, onDeleteItem]);

  return (
    <DashboardCard className="border border-border shadow-sm p-1 relative" contentClassName="px-0 pt-0">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-xl">
          <div className="animate-pulse font-bold text-muted-foreground">Updating...</div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6 px-6 pt-6">
        <h2 className="text-xl font-extrabold tracking-tight">Budget Items</h2>
        <div className="flex gap-4">
          <Button className="bg-[#05603A] hover:bg-[#05603A]/90 text-white rounded-lg gap-2 h-9 px-4 font-bold tracking-wide">
            <Plus className="w-4 h-4" strokeWidth={3} /> Add Item
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <DataTable 
        columns={columns} 
        data={categories} 
        appendRowComponent={<AppendCategoryRow onCreate={onCreateItem} />}
      />

      <div className="mt-4 pt-4 border-t border-muted/40 flex justify-center pb-3">
        <Button variant="ghost" className="text-[#05603A] font-bold text-[11px] uppercase tracking-widest hover:text-[#05603A] hover:bg-emerald-50">
          View All {categories.length} Items
        </Button>
      </div>
    </DashboardCard>
  )
}
