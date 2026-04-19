import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { StockStatus, StockUnit } from '@/@types/stock-unit.types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';

interface Props {
  data: StockUnit[];
  isLoading: boolean;
  page: number;
  perPage: number;
  totalData: number;
  statusTabs?: ReactNode;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const statusLabel: Record<StockStatus, string> = {
  draft: 'draft',
  cancel: 'cancel',
  rejected: 'rejected',
  prepare: 'prepare',
  inbound_purcase_order: 'purchase order',
  inbound_incoming_goods: 'in transit',
  inbound_receipt: 'available',
  inbound_return: 'refund',
  outbound_reserved: 'reserved',
  outbound_in_transit: 'in transit',
  outbound_delivered: 'delivered',
  outbound_return: 'return',
};

const statusBadgeClasses: Record<StockStatus, string> = {
  draft: 'border border-gray-300 bg-gray-50 text-gray-700',
  cancel: 'border border-red-200 bg-red-50 text-red-600',
  rejected: 'border border-red-200 bg-red-50 text-red-600',
  prepare: 'border border-amber-200 bg-amber-50 text-amber-700',
  inbound_purcase_order: 'border border-blue-200 bg-blue-50 text-blue-600',
  inbound_incoming_goods: 'border border-blue-200 bg-blue-50 text-blue-600',
  inbound_receipt: 'border border-emerald-200 bg-emerald-50 text-emerald-600',
  inbound_return: 'border border-orange-200 bg-orange-50 text-orange-600',
  outbound_reserved: 'border border-orange-200 bg-orange-50 text-orange-600',
  outbound_in_transit: 'border border-indigo-200 bg-indigo-50 text-indigo-600',
  outbound_delivered: 'border border-emerald-200 bg-emerald-50 text-emerald-600',
  outbound_return: 'border border-rose-200 bg-rose-50 text-rose-600',
};

export default function StockUnitTable({
  data,
  isLoading,
  page,
  perPage,
  totalData,
  statusTabs,
  onPageChange,
  onPerPageChange,
  search,
  onSearchChange,
}: Props) {
  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: data,
  });

  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const startIndex = totalData === 0 ? 0 : (page - 1) * perPage;
  const endIndex = totalData === 0 ? 0 : Math.min(startIndex + perPage, totalData);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= Math.ceil(maxPagesToShow / 2)) {
        for (let i = 1; i <= maxPagesToShow - 1; i++) pages.push(i);
        pages.push('...', totalPages);
      } else if (page >= totalPages - Math.floor(maxPagesToShow / 2)) {
        pages.push(1, '...');
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const renderStatus = (status: StockStatus) => {
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusBadgeClasses[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {statusLabel[status] ?? status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          {statusTabs && <div className="min-w-0 flex-1">{statusTabs}</div>}

          <div className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
            <span>Show</span>
            <Select
              value={String(perPage)}
              onValueChange={(val) => {
                onPerPageChange(Number(val));
              }}
            >
              <SelectTrigger className="h-10 w-20 border-gray-300 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>Page</span>
          </div>
        </div>
        <div className="w-full lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(e) => onSearchChange(e.target.value)} className="h-10 border-gray-300 bg-white pl-9" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 uppercase text-xs font-semibold tracking-wide text-gray-900">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">No</th>
              <th className="p-0 text-left">
                <SortableHeader title="Tipe Unit" sortKey="tipeUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Warna" sortKey="warna" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Nomor Mesin" sortKey="noMesin" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Nomor Rangka" sortKey="noRangka" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Status" sortKey="status" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : data.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{(page - 1) * perPage + index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.tipeUnit}</td>
                  <td className="px-4 py-3">{item.warna}</td>
                  <td className="px-4 py-3">{item.noMesin}</td>
                  <td className="px-4 py-3">{item.noRangka}</td>
                  <td className="px-4 py-3">{renderStatus(item.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          Showing {totalData === 0 ? 0 : startIndex + 1}-{endIndex} of {totalData} data
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1 || isLoading} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>

          {getPageNumbers().map((pageNum, idx) => (
            <Button
              key={idx}
              variant={pageNum === page ? 'outline' : 'ghost'}
              size="sm"
              className={pageNum === page ? 'bg-gray-100' : ''}
              onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
              disabled={typeof pageNum !== 'number' || isLoading}
            >
              {pageNum}
            </Button>
          ))}

          <Button variant="outline" size="sm" disabled={page === totalPages || totalData === 0 || isLoading} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}