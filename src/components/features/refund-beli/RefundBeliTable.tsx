import type { RefundBeli, RefundBeliPagination } from '@/@types/refund-beli.types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SortableHeader } from '@/components/ui/sortable-header';
import type { SortOrder } from '@/hooks/useTableSort';

interface Props {
  data: RefundBeli[];
  pagination: RefundBeliPagination;
  sortKey: string | undefined;
  sortOrder: SortOrder;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSort: (key: keyof RefundBeli) => void;
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

export default function RefundBeliTable({ data, pagination, sortKey, sortOrder, isLoading, isFetching, error, onRetry, onSort, onPageChange }: Props) {
  const hasData = data.length > 0;
  const canGoPrevious = pagination.currentPage > 1;
  const canGoNext = pagination.currentPage < pagination.lastPage;
  const pageNumbers =
    pagination.lastPage > 0
      ? Array.from({ length: Math.min(5, pagination.lastPage) }, (_, index) => {
          if (pagination.lastPage <= 5) return index + 1;
          if (pagination.currentPage <= 3) return index + 1;
          if (pagination.currentPage >= pagination.lastPage - 2) return pagination.lastPage - 4 + index;
          return pagination.currentPage - 2 + index;
        })
      : [];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {isFetching && !isLoading ? (
          <div className="border-b bg-blue-50 px-4 py-2 text-xs text-blue-700">Memperbarui data...</div>
        ) : null}

        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 uppercase text-sm font-semibold text-gray-900">
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left">
                <SortableHeader title="No Pembelian" sortKey="noPembelian" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Tanggal" sortKey="tanggal" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Nama Supplier" sortKey="namaSupplier" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="Total Pembelian" sortKey="totalPembelian" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-end w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-right">
                <SortableHeader title="Total Refund" sortKey="totalRefund" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-end w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Kas Masuk" sortKey="kasMasuk" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
              <th className="py-2 text-left">
                <SortableHeader title="Keterangan" sortKey="keterangan" currentSortKey={sortKey} sortOrder={sortOrder} onSort={onSort} className="justify-start w-full px-4 text-gray-900" />
              </th>
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
            ) : !hasData ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.noPembelian}</td>
                  <td className="px-4 py-3">{formatDate(item.tanggal)}</td>
                  <td className="px-4 py-3">{item.namaSupplier}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.totalPembelian)}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(item.totalRefund)}</td>
                  <td className="px-4 py-3">{item.kasMasuk}</td>
                  <td className="px-4 py-3 text-gray-500">{item.keterangan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <div>
          Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total} data
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={!canGoPrevious}>
            Previous
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant="outline"
              size="sm"
              className={pageNumber === pagination.currentPage ? 'bg-gray-100' : ''}
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === pagination.currentPage}
            >
              {pageNumber}
            </Button>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={!canGoNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
