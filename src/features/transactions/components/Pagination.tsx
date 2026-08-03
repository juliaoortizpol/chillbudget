import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate page numbers to show, e.g. [1, 2, 3, '...', totalPages]
  const getPagesToShow = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPagesToShow();

  return (
    <div className="flex items-center justify-between w-full mt-4 animate-in fade-in duration-300">
      <span className="text-[13px] font-medium text-muted-foreground">
        Showing <strong className="text-foreground">{startItem}-{endItem}</strong> of <strong className="text-foreground">{totalItems}</strong> transactions
      </span>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground border-transparent hover:border-border"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className="text-muted-foreground font-medium mx-1 select-none">...</span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <Button
              key={`page-${p}`}
              variant={isCurrent ? "default" : "ghost"}
              size="sm"
              className={isCurrent 
                ? "h-8 w-8 bg-primary hover:bg-ds-primary-hover text-white p-0 font-bold"
                : "h-8 w-8 text-muted-foreground font-medium p-0 hover:bg-muted/50"
              }
              onClick={() => onPageChange(Number(p))}
            >
              {p}
            </Button>
          );
        })}

        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground border-transparent hover:border-border"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
