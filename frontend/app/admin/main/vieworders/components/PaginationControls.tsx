import { Button } from "@/components/ui/button"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalOrders: number
  ordersPerPage: number
  ordersOnCurrentPage: number
  onPrevPage: () => void
  onNextPage: () => void
  onPageClick: (page: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalOrders,
  ordersPerPage,
  ordersOnCurrentPage,
  onPrevPage,
  onNextPage,
  onPageClick,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div className="p-4 border-t flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          variant="outline"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        
        {/* Page numbers */}
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                onClick={() => onPageClick(pageNum)}
                variant={currentPage === pageNum ? "default" : "outline"}
                className="w-10"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
