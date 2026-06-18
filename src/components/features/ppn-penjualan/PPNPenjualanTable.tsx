import type { PPNPenjualan } from '@/@types/ppn-penjualan.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';

interface Props {
  data: PPNPenjualan[];
  meta: PaginationMeta;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  hasNextPage: boolean;
  isTotalExact: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onEdit: (item: PPNPenjualan) => void;
  onSortChange: (sortBy: string) => void;
  onPageChange: (page: number) => void;
}

const formatDate = (value: string | null) => {
  if (!value) return '-';

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'dd MMM yyyy');
};

const renderStatusBadge = (hasValue: boolean, readyLabel: string, emptyLabel: string) => (
  <Badge className={hasValue ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
    {hasValue ? readyLabel : emptyLabel}
  </Badge>
);

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: 15 }).map((_, index) => (
      <td key={index} className="px-4 py-4">
        <Skeleton className="h-4 w-full max-w-[140px]" />
      </td>
    ))}
  </tr>
);

export default function PPNPenjualanTable({ data, meta, sortBy, sortDirection, hasNextPage, isTotalExact, isLoading, isFetching, isError, errorMessage, onRetry, onEdit, onSortChange, onPageChange }: Props) {
  const page = meta.currentPage;
  const hasData = data.length > 0;
  const startIndex = hasData ? (page - 1) * meta.perPage + 1 : 0;
  const endIndex = hasData ? startIndex + data.length - 1 : 0;
  const canGoPrevious = page > 1;
  const canGoNext = isTotalExact ? page < meta.lastPage : hasNextPage;
  const pageNumbers = isTotalExact
    ? Array.from({ length: Math.min(5, meta.lastPage) }, (_, index) => {
        if (meta.lastPage <= 5) return index + 1;
        if (page <= 3) return index + 1;
        if (page >= meta.lastPage - 2) return meta.lastPage - 4 + index;
        return page - 2 + index;
      })
    : [page];

  const renderSortHeader = (title: string, sortKey: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isSorted = sortBy === sortKey;
    const justifyClass = align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start';
    return (
      <button
        type="button"
        className={`flex items-center gap-1 cursor-pointer select-none group w-full px-4 py-4 text-xs font-semibold uppercase ${isSorted ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'} ${justifyClass}`}
        onClick={() => onSortChange(sortKey)}
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
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-none">
        {isFetching && !isLoading ? (
          <div className="border-b bg-blue-50/50 px-4 py-2 text-xs text-blue-700">
            Memperbarui data...
          </div>
        ) : null}
        <table className="min-w-[1800px] w-full text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="p-0 text-left">{renderSortHeader('Kode Invoice', 'code', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('Tanggal Beli', 'buy_date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('Customer', 'supplier', 'left')}</th>
              <th className="p-0 text-left">{renderSortHeader('Tanggal FPM', 'fpm_date', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('MASA NSFPM', 'nsfpm_age', 'center')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">Nomor NSFP</th>
              <th className="p-0 text-left">{renderSortHeader('QTY', 'qty', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('Tipe Unit', 'unit_type.name', 'left')}</th>
              <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">No Mesin</th>
              <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500">No Rangka</th>
              <th className="p-0 text-left">{renderSortHeader('Harga Unit', 'unit_price', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('DPP', 'dpp_amount', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('PPN 11%', 'ppn_11', 'center')}</th>
              <th className="p-0 text-left">{renderSortHeader('Total Bayar', 'payment_amount', 'center')}</th>
              <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
            ) : isError ? (
              <tr>
                <td colSpan={15} className="px-4 py-10 text-center">
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{errorMessage ?? 'Gagal memuat data PPN penjualan'}</p>
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
                <td colSpan={15} className="px-4 py-10 text-center text-slate-500">
                  Tidak ada data PPN penjualan
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const hasFpm = Boolean(item.fpm_date);
                const hasNsfpmAge = Boolean(item.nsfpm_age);
                const hasNsfpNumber = Boolean(item.nsfp_number && item.nsfp_number.trim() !== '');

                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50/70 border-slate-100 transition-colors">
                    <td className="px-4 py-4 text-left font-medium text-blue-600 whitespace-nowrap">{item.code}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500 whitespace-nowrap">{formatDate(item.buy_date)}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.supplier}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      <div className="space-y-1">
                        <div>{formatDate(item.fpm_date)}</div>
                        {renderStatusBadge(hasFpm, 'FPM Terisi', 'Belum FPM')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      <div className="space-y-1">
                        <div>{formatDate(item.nsfpm_age)}</div>
                        {renderStatusBadge(hasNsfpmAge, 'NSFPM Terisi', 'Belum NSFPM')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      <div className="space-y-1">
                        <div>{item.nsfp_number || '-'}</div>
                        {renderStatusBadge(hasNsfpNumber, 'Sudah Input', 'Belum Input')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{item.qty}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">
                      <div className="font-medium text-slate-900">{item.unit_type.name}</div>
                      <div className="text-xs text-slate-500">{item.unit_type.code}</div>
                    </td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.unit_transaction_item_detail.machine_number}</td>
                    <td className="px-4 py-4 text-left text-sm text-slate-700">{item.unit_transaction_item_detail.chassis_number}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatCurrency(item.dpp_amount)}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatCurrency(item.ppn_11)}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">{formatCurrency(item.payment_amount)}</td>
                    <td className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[100px] rounded-2xl p-2">
                          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer rounded-xl px-3 py-2.5">Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <div>
          {isTotalExact
            ? `Showing ${startIndex}-${endIndex} of ${meta.total} data`
            : `Showing ${startIndex}-${endIndex} on page ${page}${hasNextPage ? ' (lebih banyak data tersedia)' : ''}`}
        </div>
        <div className="flex flex-wrap gap-2">
          {isTotalExact ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={!canGoPrevious}>
              First
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={!canGoPrevious}>
            Previous
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant="outline"
              size="sm"
              className={pageNumber === page ? 'bg-gray-100' : ''}
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === page}
            >
              {pageNumber}
            </Button>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={!canGoNext}>
            Next
          </Button>
          {isTotalExact ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(meta.lastPage)} disabled={!canGoNext}>
              Last
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
