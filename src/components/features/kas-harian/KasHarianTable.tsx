import { useMemo, useState } from 'react';
import type { KasHarianListItem } from '@/@types/kas-harian.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { currenciesFormat } from '@/components/ui/currenciesFormat';
import { format } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Info, CheckCircle, Loader2, Search } from 'lucide-react';
import { CopyBox } from '@/components/ui/copy-box';
import { TextTruncate } from '@/components/ui/text-truncate';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 sticky right-0 bg-[#f8f9fa] z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={100} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-3 opacity-0 animate-in fade-in duration-500">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="text-sm font-medium text-slate-500">Memuat data...</span>
                  </div>
                </td>
              </tr>
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
                <td colSpan={100} className="px-4 py-16 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-50 p-4 mb-2">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-sm text-slate-500">Belum ada data atau coba gunakan kata kunci pencarian lain.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr key={`${item.source}-${item.id}`} className="group border-b bg-white hover:bg-slate-50 border-slate-100 transition-colors">
                  <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="px-4 py-4 text-left text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {(item.unitTransactionBillingId || item.goodsTransactionBillingId) ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-help text-[#18385b] hover:text-[#102843] transition-colors flex items-center shrink-0">
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="max-w-xs bg-slate-900 text-white rounded-lg p-2 text-xs shadow-md">
                              Data Arus Transaksi Kas Harian ini terhubung dengan data Administrasi
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      <CopyBox text={`${item.code || '-'}`} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-left text-sm text-slate-700"><TextTruncate text={item.note || '-'} maxLength={15} /></td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-green-600 align-middle">
                    <div className="flex items-center justify-center gap-1">
                      {item.isValid === true && item.debet > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-help text-green-400 hover:text-green-600 transition-colors">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="max-w-xs bg-slate-900 text-white rounded-lg p-2 text-xs shadow-md">
                              Nominal telah disesuaikan
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      <span>{currenciesFormat('idr', item.debet)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-red-600 align-middle">
                    <div className="flex items-center justify-center gap-1">
                      {item.isValid === true && item.credit > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="cursor-help text-green-400 hover:text-green-600 transition-colors">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="max-w-xs bg-slate-900 text-white rounded-lg p-2 text-xs shadow-md">
                              Nominal telah disesuaikan
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      <span>{currenciesFormat('idr', item.credit)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                      item.is_paid
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    )}>
                      {item.is_paid ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.05)]">
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
                          <>
                            {item.isValid || !item.is_paid ? (
                              <DropdownMenuItem onClick={() => onToggleStatus(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer font-medium">
                                Tandai Lunas
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => onToggleStatus(item)} className="rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-slate-50 cursor-pointer font-medium">
                                Tandai Belum Lunas
                              </DropdownMenuItem>
                            )}
                          </>
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
