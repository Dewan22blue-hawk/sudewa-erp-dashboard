import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  header: React.ReactNode;
  id?: string;
  accessorKey?: string; // Optional key for sorting (or path)
  sortable?: boolean; // If true, this column can be sorted
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  cell: (item: T, index: number) => React.ReactNode;
  sticky?: 'left' | 'right'; // If provided, column will float/sticky
}

export interface BaseTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;

  // Header / Control bar props
  searchPlaceholder?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  headerActions?: React.ReactNode;

  // Show / Limit page props
  showLimitChange?: boolean;
  perPage?: number;
  onPerPageChange?: (value: number) => void;

  // Sorting props
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };

  // Pagination props
  meta?: {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
  };
  onPageChange?: (page: number) => void;

  // Custom styling
  headerRowClassName?: string; // e.g. bg-[#f8f9fa] or bg-[#E9EEF5]
  containerClassName?: string;
}

export default function BaseTable<T>({
  data,
  columns,
  loading,
  searchPlaceholder = 'Search...',
  search,
  onSearchChange,
  headerActions,
  showLimitChange = false,
  perPage = 25,
  onPerPageChange,
  sortBy,
  sortDirection,
  onSortChange,
  defaultSort,
  meta,
  onPageChange,
  headerRowClassName = 'bg-[#f8f9fa]',
  containerClassName,
}: BaseTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(search || '');
  const [internalSort, setInternalSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    defaultSort || null
  );

  // Sync search prop
  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== (search || '')) {
        onSearchChange(localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  const activeSort = onSortChange
    ? { key: sortBy || '', direction: sortDirection || 'asc' }
    : internalSort;

  const handleSort = (key: string) => {
    const nextDirection =
      activeSort?.key === key && activeSort.direction === 'asc' ? 'desc' : 'asc';

    if (onSortChange) {
      onSortChange(key, nextDirection);
    } else {
      setInternalSort({ key, direction: nextDirection });
    }
  };

  const sortedData = useMemo(() => {
    if (onSortChange || !activeSort || !activeSort.key) {
      return data;
    }

    const { key, direction } = activeSort;
    const factor = direction === 'asc' ? 1 : -1;

    return [...data].sort((a: any, b: any) => {
      // Resolve value from key (can be deep object path like supplier.name)
      const getValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
      };

      const valA = getValue(a, key);
      const valB = getValue(b, key);

      if (valA === undefined || valA === null) return 1 * factor;
      if (valB === undefined || valB === null) return -1 * factor;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * factor;
      }

      // Check if date
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && typeof valA === 'string' && valA.includes('-')) {
        return (dateA - dateB) * factor;
      }

      return String(valA).localeCompare(String(valB)) * factor;
    });
  }, [data, activeSort, onSortChange]);

  const currentPage = meta?.currentPage ?? 1;
  const itemsPerPage = meta?.perPage ?? perPage;
  const totalPages = meta?.lastPage ?? 1;
  const totalEntries = meta?.total ?? sortedData.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = startIndex === 0 ? 0 : startIndex + sortedData.length - 1;

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    onPerPageChange?.(Number(value));
  };

  const renderPageButtons = () => {
    const buttons = [] as number[];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else if (currentPage <= 3) {
      buttons.push(1, 2, 3, 4, 5);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
    }

    return buttons.map((pageNumber) => (
      <Button
        key={pageNumber}
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
          pageNumber === currentPage
            ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
            : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
        )}
        onClick={() => handlePageChange(pageNumber)}
      >
        {pageNumber}
      </Button>
    ));
  };

  const hasControls = Boolean(onSearchChange || headerActions || showLimitChange);
  const showDefaultControls = Boolean(onSearchChange || showLimitChange);

  return (
    <div className="space-y-4">
      {hasControls && (
        showDefaultControls ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {onSearchChange && (
                <div className="relative w-full sm:w-[240px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="pl-8 bg-white h-9 border-slate-300"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                  />
                </div>
              )}

              {showLimitChange && onPerPageChange && (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-sm font-medium text-slate-700">Show</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[70px] bg-white h-9 border-slate-300">
                      <SelectValue placeholder="25" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm font-medium text-slate-700">Page</span>
                </div>
              )}
            </div>

            {headerActions && (
              <div className="w-full sm:w-auto">
                {headerActions}
              </div>
            )}
          </div>
        ) : (
          headerActions
        )
      )}

      <div className={cn('relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none', containerClassName)}>
        <Table className="w-max min-w-full">
          <TableHeader className={cn('border-b border-gray-200', headerRowClassName)}>
            <TableRow className="hover:bg-transparent border-none">
              {columns.map((col, idx) => {
                const alignment = col.alignment ?? 'left';
                const textAlignment = alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left';
                const justifyClass = alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start';

                const isSortable = col.sortable && col.accessorKey;
                const sortKey = String(col.accessorKey || col.id || '');
                const isSorted = activeSort?.key === sortKey;

                return (
                  <TableHead
                    key={col.id || idx}
                    onClick={() => isSortable && handleSort(sortKey)}
                    className={cn(
                      'px-4 py-4 text-xs font-semibold uppercase text-slate-500 whitespace-nowrap',
                      isSortable && 'cursor-pointer select-none group',
                      col.sticky === 'right' && cn('sticky right-0 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)] w-[80px] min-w-[80px] max-w-[80px]', headerRowClassName),
                      col.sticky === 'left' && cn('sticky left-0 z-10 border-r border-slate-200 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.05)] w-[80px] min-w-[80px] max-w-[80px]', headerRowClassName),
                      textAlignment,
                      col.headerClassName
                    )}
                  >
                    <div className={cn('flex items-center gap-1', justifyClass)}>
                      <span>{col.header}</span>
                      {isSortable && (
                        isSorted ? (
                          activeSort.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0" />
                        )
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={columns.length} className="text-center px-4 py-16 bg-white border-none">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, rowIdx) => (
                <TableRow key={rowIdx} className="group border-b bg-white hover:bg-slate-50 border-slate-100 transition-colors">
                  {columns.map((col, colIdx) => {
                    const alignment = col.alignment ?? 'left';
                    const textAlignment = alignment === 'right' ? 'text-right' : alignment === 'center' ? 'text-center' : 'text-left';

                    return (
                      <TableCell
                        key={col.id || colIdx}
                        className={cn(
                          'px-4 py-4 text-sm text-slate-700 transition-colors',
                          col.sticky === 'right' && 'sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)] w-[80px] min-w-[80px] max-w-[80px]',
                          col.sticky === 'left' && 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.05)] w-[80px] min-w-[80px] max-w-[80px]',
                          textAlignment,
                          col.className
                        )}
                      >
                        {col.cell(item, rowIdx)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Memuat data...</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      {onPageChange && sortedData.length > 0 && (
        <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between py-2">
          <p>Showing {startIndex}-{endIndex} of {totalEntries} data</p>
          <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {renderPageButtons()}

            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
