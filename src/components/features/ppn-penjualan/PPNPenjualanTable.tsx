import type { PPNPenjualan } from '@/@types/ppn-penjualan.types';
import type { PaginationMeta } from '@/@types/pagination.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { SortableHeader } from '@/components/ui/sortable-header';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';

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
  <tr className="border-b border-gray-200">
    {Array.from({ length: 12 }).map((_, index) => (
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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border overflow-x-auto">
        {isFetching && !isLoading ? (
          <div className="border-b bg-blue-50 px-4 py-2 text-xs text-blue-700">
            Memperbarui data...
          </div>
        ) : null}
        <table className="min-w-[1800px] w-full text-sm">
          <thead className="bg-gray-50/50 uppercase text-sm font-semibold text-gray-900">
            <tr className="text-center border-b border-gray-200">
              <th className="py-2 text-left">
                <SortableHeader title="Kode Invoice" sortKey="code" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Tanggal Beli" sortKey="buy_date" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Customer" sortKey="supplier" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Tanggal FPM" sortKey="fpm_date" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Usia NSFPM" sortKey="nsfpm_age" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Input NSFPM" sortKey="nsfpm_input" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="QTY" sortKey="qty" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-end w-full px-4" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Tipe Unit" sortKey="unit_type.name" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-start w-full px-4" />
              </th>
              <th className="py-2 text-left">No Mesin</th>
              <th className="py-2 text-left">No Rangka</th>
              <th className="py-2 text-right">
                <SortableHeader title="Harga Unit" sortKey="unit_price" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-end w-full px-4" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="DPP" sortKey="dpp_amount" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-end w-full px-4" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="PPN 11%" sortKey="ppn_11" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-end w-full px-4" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="Total Bayar" sortKey="payment_amount" currentSortKey={sortBy} sortOrder={sortDirection} onSort={onSortChange} className="text-gray-900 justify-end w-full px-4" />
              </th>
              <th className="px-4 py-3 text-center">Action</th>
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
                <td colSpan={15} className="px-4 py-10 text-center text-gray-500">
                  Tidak ada data PPN penjualan
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const hasFpm = Boolean(item.fpm_date);
                const hasNsfpmAge = Boolean(item.nsfpm_age);
                const hasNsfpmInput = item.nsfpm_input > 0;

                return (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{item.code}</td>
                    <td className="px-4 py-3">{formatDate(item.buy_date)}</td>
                    <td className="px-4 py-3">{item.supplier}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div>{formatDate(item.fpm_date)}</div>
                        {renderStatusBadge(hasFpm, 'FPM Terisi', 'Belum FPM')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div>{formatDate(item.nsfpm_age)}</div>
                        {renderStatusBadge(hasNsfpmAge, 'NSFPM Terisi', 'Belum NSFPM')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div>{formatCurrency(item.nsfpm_input)}</div>
                        {renderStatusBadge(hasNsfpmInput, 'Sudah Input', 'Belum Input')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{item.qty}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.unit_type.name}</div>
                      <div className="text-xs text-gray-500">{item.unit_type.code}</div>
                    </td>
                    <td className="px-4 py-3">{item.unit_transaction_item_detail.machine_number}</td>
                    <td className="px-4 py-3">{item.unit_transaction_item_detail.chassis_number}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.dpp_amount)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.ppn_11)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.payment_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
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
