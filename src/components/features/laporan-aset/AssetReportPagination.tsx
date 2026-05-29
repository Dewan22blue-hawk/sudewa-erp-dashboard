import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetReportPaginationProps {
  currentPage: number;
  totalPages: number;
  totalData: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function AssetReportPagination({
  currentPage,
  totalPages,
  totalData,
  perPage,
  onPageChange,
}: AssetReportPaginationProps) {
  
  const startItem = Math.min(totalData, (currentPage - 1) * perPage + 1);
  const endItem = Math.min(totalData, currentPage * perPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalData === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-6">
      <div className="text-[13px] text-gray-500 mb-4 sm:mb-0">
        Showing {startItem}–{endItem} of {totalData} data
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 font-medium px-3 text-[13px] hover:bg-gray-100"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-[13px] font-medium rounded-lg",
                    currentPage === page 
                      ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 hover:bg-gray-50" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 font-medium px-3 text-[13px] hover:bg-gray-100"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
