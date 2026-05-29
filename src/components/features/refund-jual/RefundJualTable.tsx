import type { RefundJual, RefundJualPagination } from '@/@types/refund-jual.types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SortableHeader } from '@/components/ui/sortable-header';
import type { SortOrder } from '@/hooks/useTableSort';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import FinanceRefundApprovalModal from '../refund-beli/FinanceRefundApprovalModal';

interface Props {
  data: RefundJual[];
  pagination: RefundJualPagination;
  sortKey: string | undefined;
  sortOrder: SortOrder;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSort: (key: keyof RefundJual) => void;
  onPageChange: (page: number) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('id-ID');
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: 7 }).map((_, index) => (
      <td key={index} className="px-4 py-4">
        <Skeleton className="h-4 w-full max-w-[140px]" />
      </td>
    ))}
  </tr>
);

const getPaginationItems = (currentPage: number, lastPage: number): Array<number | 'ellipsis-left' | 'ellipsis-right'> => {
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis-right', lastPage];
  }

  if (currentPage >= lastPage - 2) {
    return [1, 'ellipsis-left', lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
  }

  return [1, 'ellipsis-left', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-right', lastPage];
};

export default function RefundJualTable({ data, pagination, sortKey, sortOrder, isLoading, isFetching, error, onRetry, onSort, onPageChange }: Props) {
  const [selectedRefundId, setSelectedRefundId] = useState<number | null>(null);
  const canGoPrevious = pagination.currentPage > 1;
  const canGoNext = pagination.currentPage < pagination.lastPage;
  const paginationItems = getPaginationItems(pagination.currentPage, pagination.lastPage);

  return (
    <div className="space-y-4">
      <div className="relative overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {isFetching && !isLoading ? (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center bg-white/70 py-2 text-xs text-slate-700 backdrop-blur-sm">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Memperbarui data...
          </div>
        ) : null}

        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 uppercase text-sm font-semibold text-gray-900">
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left">
                <SortableHeader title="No Penjualan" sortKey="noPenjualan" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Tanggal" sortKey="tanggal" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Nama Customer" sortKey="namaCustomer" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="Total Penjualan" sortKey="totalPenjualan" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-end w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="Total Refund" sortKey="totalRefund" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-end w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Kas Keluar" sortKey="kasKeluar" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Keterangan" sortKey="keterangan" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-right px-4">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">{error}</p>
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
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.noPenjualan}</td>
                  <td className="px-4 py-3">{formatDate(item.tanggal)}</td>
                  <td className="px-4 py-3">{item.namaCustomer}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.totalPenjualan)}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(item.totalRefund)}</td>
                  <td className="px-4 py-3">{item.kasKeluar}</td>
                  <td className="px-4 py-3 text-gray-500">{item.keterangan}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => setSelectedRefundId(item.id)}>
                          Approval
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRefundId !== null && (
        <FinanceRefundApprovalModal 
          open={true} 
          onClose={() => setSelectedRefundId(null)} 
          refundId={selectedRefundId}
          onSuccess={() => {
            setSelectedRefundId(null);
            if (onRetry) onRetry();
          }}
        />
      )}

      <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <div>
          Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total} data
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={!canGoPrevious}>
            Previous
          </Button>
          {paginationItems.map((item, index) =>
            typeof item === 'number' ? (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                className={item === pagination.currentPage ? 'bg-gray-100' : ''}
                onClick={() => onPageChange(item)}
                disabled={item === pagination.currentPage}
              >
                {item}
              </Button>
            ) : (
              <span key={`${item}-${index}`} className="px-1 text-gray-400">
                ...
              </span>
            ),
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={!canGoNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
