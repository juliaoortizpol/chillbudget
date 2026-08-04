import { Search, Calendar, Shapes, CreditCard, ListX, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Category {
  id: string;
  name: string;
}

interface TransactionsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  type: string | null;
  onTypeChange: (type: string | null) => void;
  categories: Category[];
  onClearFilters: () => void;
}

export function TransactionsFilterBar({
  searchQuery, onSearchChange,
  dateRange, onDateRangeChange,
  categoryId, onCategoryChange,
  type, onTypeChange,
  categories, onClearFilters
}: TransactionsFilterBarProps) {
  
  const selectedCategoryName = categoryId ? categories.find(c => c.id === categoryId)?.name || "Category" : "Category";
  const typeDisplay = type ? (type === 'expense' ? "Expense" : "Income") : "All";
  const hasActiveFilters = Boolean(searchQuery.trim() || dateRange !== "All Time" || categoryId || type);
  
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4 xl:flex-row xl:items-center xl:gap-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          aria-label="Search transactions"
          placeholder="Search transactions..."
          className="pl-9 bg-muted/40 border-transparent focus-visible:bg-transparent transition-colors"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:w-auto xl:flex-nowrap">
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" className="w-full justify-between gap-2 whitespace-nowrap bg-background sm:w-auto">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {dateRange}
              <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDateRangeChange('All Time')}>All Time</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange('Last 7 Days')}>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange('Last 30 Days')}>Last 30 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange('This Month')}>This Month</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" className="w-full min-w-0 justify-between gap-2 whitespace-nowrap bg-background sm:w-auto sm:max-w-56" title={selectedCategoryName}>
              <Shapes className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{selectedCategoryName}</span>
              <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCategoryChange(null)}>All Categories</DropdownMenuItem>
            {categories.map(c => (
              <DropdownMenuItem key={c.id} onClick={() => onCategoryChange(c.id)}>
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" className="w-full justify-between gap-2 whitespace-nowrap bg-background sm:w-auto">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Type: {typeDisplay}
              <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onTypeChange(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTypeChange('expense')}>Expense</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTypeChange('income')}>Income</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="w-full bg-background disabled:opacity-50 sm:w-auto lg:w-10 lg:px-0"
          onClick={onClearFilters}
          aria-label="Clear filters"
          title={hasActiveFilters ? "Clear filters" : "No filters to clear"}
          disabled={!hasActiveFilters}
        >
          <ListX className="h-4 w-4 text-muted-foreground" />
          <span className="lg:hidden">Clear filters</span>
        </Button>
      </div>
    </div>
  )
}
