import { Search, Calendar, Shapes, CreditCard, ListFilter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function TransactionsFilterBar() {
  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Description, vendor, or reference..." 
          className="pl-9 bg-muted/40 border-transparent focus-visible:bg-transparent transition-colors"
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
        <Button variant="outline" className="gap-2 bg-background whitespace-nowrap shrink-0">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Last 30 Days
          <span className="text-muted-foreground ml-1">v</span>
        </Button>
        <Button variant="outline" className="gap-2 bg-background whitespace-nowrap shrink-0">
          <Shapes className="w-4 h-4 text-muted-foreground" />
          Category
          <span className="text-muted-foreground ml-1">v</span>
        </Button>
        <Button variant="outline" className="gap-2 bg-background whitespace-nowrap shrink-0">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          Type: All
          <span className="text-muted-foreground ml-1">v</span>
        </Button>
        <Button variant="outline" size="icon" className="shrink-0 bg-background">
          <ListFilter className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}
