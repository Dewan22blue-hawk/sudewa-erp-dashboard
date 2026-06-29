import { useMemo, useState } from 'react';
import type { KasHarianListItem } from '@/@types/kas-harian.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  data: KasHarianListItem[];
  meta: PaginationMeta;
  hasNextPage: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onView: (item: KasHarianListItem) => void;
  onPay: (item: KasHarianListItem) => void;
  onEdit: (item: KasHarianListItem) => void;
  onDelete: (item: KasHarianListItem) => void;
  onToggleStatus?: (item: KasHarianListItem) => void;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'dd MMM yyyy');
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-200">
    {Array.from({ length: 9 }).map((_, index) => (
      <td key={index} className="px-6 py-5">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default function KasHarianTable({
  data,
  meta,
  hasNextPage,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onView,
  onPay,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
}: Props) {
  const page = meta.currentPage;
  const hasData = data.length > 0;
  const startIndex = hasData ? (page - 1) * meta.perPage + 1 : 0;
  const endIndex = hasData ? startIndex + data.length - 1 : 0;
  const canGoPrevious = page > 1;
  const canGoNext = hasNextPage || page < meta.lastPage;

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    return [...data].sort((a, b) => {
      let aVal = (a as any)[sortBy];
      let bVal = (b as any)[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortDirection]);

  const pageNumbers = (() => {
    if (meta.lastPage <= 5) return Array.from({ length: meta.lastPage }, (_, index) => index + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', meta.lastPage];
    if (page >= meta.lastPage - 2) return [1, '...', meta.lastPage - 3, meta.lastPage - 2, meta.lastPage - 1, meta.lastPage];
    return [1, '...', page - 1, page, page + 1, '...', meta.lastPage];
  })();

  const renderSortHeader = (title: string, sortKey: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isSorted = sortBy === sortKey;
    const justifyClass = align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start';
    const textAlignment = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
      <button
        type="button"
        className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase ${isSorted ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'} ${justifyClass}`}
        onClick={() => handleSort(sortKey)}
      >
        <span>{title}</span>
        {isSorted ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0" />
          ) : (
            <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-150 shrink-0 text-slate-400" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="p-0 text-left">{renderSortHeader('TANGGAL', 'date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('NOTA REFF', 'code', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('KETERANGAN', 'note', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('DEBET', 'debet', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('KREDIT', 'credit', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('STATUS', 'is_paid', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('AKUN', 'accountName', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('KAS', 'cashName', 'left')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
            ) : isError ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center">
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{errorMessage ?? 'Gagal memuat data transaksi kas harian'}</p>
                    {onRetry ? (
                      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                        Retry
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  Belum ada data transaksi kas harian.
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr key={`${item.source}-${item.id}`} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                  <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">{item.code}</td>
                  <td className="px-4 py-4 text-left text-sm text-slate-700">{item.note || '-'}</td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-green-600">{formatCurrency(item.debet)}</td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-red-600">{formatCurrency(item.credit)}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                      item.is_paid
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    )}>
                      {item.is_paid ? 'Lunas' : 'Belum'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-left text-sm text-slate-700">{item.accountName}</td>
                  <td className="px-4 py-4 text-left text-sm text-slate-700">{item.cashName || '-'}</td>
                  <td className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                        {item.source === 'billing' ? (
                          <DropdownMenuItem onClick={() => onPay(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            Bayar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onView(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            Detail
                          </DropdownMenuItem>
                        )}
                        {item.cashFlowId ? (
                          <DropdownMenuItem onClick={() => onEdit(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer">
                            Edit
                          </DropdownMenuItem>
                        ) : null}
                        {item.cashFlowId && onToggleStatus ? (
                          <DropdownMenuItem onClick={() => onToggleStatus(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer font-medium">
                            {item.is_paid ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
                          </DropdownMenuItem>
                        ) : null}
                        {item.source === 'manual' ? (
                          <DropdownMenuItem onClick={() => onDelete(item)} className="rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                            Hapus
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between py-2">
        <p>Showing {startIndex}-{endIndex} of {meta.total} data</p>
        <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          {pageNumbers.map((pageNumber, index) =>
            typeof pageNumber === 'number' ? (
              <Button
                key={`${pageNumber}-${index}`}
                type="button"
                variant="ghost"
                size="sm"
                className={
                  pageNumber === page
                    ? 'h-9 min-w-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm'
                    : 'h-9 min-w-9 rounded-xl border border-transparent bg-transparent px-3 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white'
                }
                onClick={() => onPageChange(pageNumber)}
                disabled={pageNumber === page}
              >
                {pageNumber}
              </Button>
            ) : (
              <span key={`${pageNumber}-${index}`} className="px-2">
                ...
              </span>
            ),
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
