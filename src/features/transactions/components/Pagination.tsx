import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination() {
  return (
    <div className="flex items-center justify-between w-full mt-4">
      <span className="text-[13px] font-medium text-muted-foreground">
        Showing <strong className="text-foreground">1-6</strong> of <strong className="text-foreground">48</strong> transactions
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground border-transparent hover:border-border">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="default" size="sm" className="h-8 w-8 bg-[#05603A] hover:bg-[#05603A]/90 text-white p-0">
          1
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground font-medium p-0 hover:bg-muted/50">
          2
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground font-medium p-0 hover:bg-muted/50">
          3
        </Button>
        <span className="text-muted-foreground font-medium mx-1">...</span>
        <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground font-medium p-0 hover:bg-muted/50">
          8
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground border-transparent hover:border-border">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
