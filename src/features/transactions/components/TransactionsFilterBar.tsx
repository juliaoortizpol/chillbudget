import { Search, Calendar, Shapes, CreditCard, ListFilter } from "lucide-react"
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
  
  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Description, vendor, or reference..." 
          className="pl-9 bg-muted/40 border-transparent focus-visible:bg-transparent transition-colors"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" className="gap-2 bg-background whitespace-nowrap shrink-0">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {dateRange}
              <span className="text-muted-foreground ml-1">v</span>
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
            <Button variant="outline" className="gap-2 bg-background whitespace-nowrap shrink-0">
              <Shapes className="w-4 h-4 text-muted-foreground" />
              {selectedCategoryName}
              <span className="text-muted-foreground ml-1">v</span>
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
            <Button variant="outline" className="gap-2 bg-background whitespace-nowrap shrink-0">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Type: {typeDisplay}
              <span className="text-muted-foreground ml-1">v</span>
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onTypeChange(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTypeChange('expense')}>Expense</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTypeChange('income')}>Income</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className="shrink-0 bg-background" onClick={onClearFilters}>
          <ListFilter className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}
