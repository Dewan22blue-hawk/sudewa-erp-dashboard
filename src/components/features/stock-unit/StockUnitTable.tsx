import { Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { StockStatus, StockUnit } from '@/@types/stock-unit.types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTableSort } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';

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

const statusTextClasses: Record<StockStatus, string> = {
  draft: 'text-gray-500 font-medium',
  cancel: 'text-red-600 font-medium',
  rejected: 'text-red-600 font-medium',
  prepare: 'text-amber-600 font-medium',
  inbound_purcase_order: 'text-blue-600 font-medium',
  inbound_incoming_goods: 'text-blue-600 font-medium',
  inbound_receipt: 'text-emerald-600 font-medium',
  inbound_return: 'text-orange-600 font-medium',
  outbound_reserved: 'text-orange-600 font-medium',
  outbound_in_transit: 'text-indigo-600 font-medium',
  outbound_delivered: 'text-emerald-600 font-medium',
  outbound_return: 'text-rose-600 font-medium',
};

function SortIcon({ sortKey, currentSortKey, sortOrder }: { sortKey: string; currentSortKey: string; sortOrder: any }) {
  const isActive = currentSortKey === sortKey;
  if (isActive && sortOrder === 'asc')
    return <ArrowUp className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  if (isActive && sortOrder === 'desc')
    return <ArrowDown className="h-3 w-3 text-indigo-500 shrink-0 transition-colors" />;
  return <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity duration-150" />;
}

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
      <span className={cn('text-sm', statusTextClasses[status] ?? 'text-gray-600')}>
        {statusLabel[status] ?? status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 bg-white" />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <Select
              value={String(perPage)}
              onValueChange={(val) => {
                onPerPageChange(Number(val));
              }}
            >
              <SelectTrigger className="w-[70px] bg-white">
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

        {statusTabs && <div className="flex-shrink-0 w-full sm:w-auto flex justify-end">{statusTabs}</div>}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr className="hover:bg-[#f8f9fa]">
              {/* No */}
              <th className="text-xs font-semibold text-gray-500 uppercase px-4 py-4 text-left w-[60px]">No</th>

              {/* Nama Unit */}
              <th
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'namaUnit' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('namaUnit')}
              >
                <div className="flex items-center gap-1">
                  Nama Unit
                  <SortIcon sortKey="namaUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </th>

              {/* Warna */}
              <th
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'warna' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('warna')}
              >
                <div className="flex items-center gap-1">
                  Warna
                  <SortIcon sortKey="warna" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </th>

              {/* Nomor Mesin */}
              <th
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'noMesin' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('noMesin')}
              >
                <div className="flex items-center gap-1">
                  Nomor Mesin
                  <SortIcon sortKey="noMesin" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </th>

              {/* Nomor Rangka */}
              <th
                className={cn(
                  'group px-4 py-4 text-left text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'noRangka' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('noRangka')}
              >
                <div className="flex items-center gap-1">
                  Nomor Rangka
                  <SortIcon sortKey="noRangka" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
              </th>

              {/* Status */}
              <th
                className={cn(
                  'group px-4 py-4 text-center text-xs font-semibold uppercase cursor-pointer select-none transition-colors',
                  sortKey === 'status' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
                onClick={() => handleSort('status')}
              >
                <div className="inline-flex items-center">
                  <span className="w-3 shrink-0" />
                  <span>Status</span>
                  <SortIcon sortKey="status" currentSortKey={sortKey as string} sortOrder={sortOrder} />
                </div>
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
                  <td className="px-4 py-4 text-sm text-left text-gray-600">{(page - 1) * perPage + index + 1}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 text-left">{item.namaUnit}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-left">{item.warna}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-left">{item.noMesin}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-left">{item.noRangka}</td>
                  <td className="px-4 py-4 text-sm text-center">{renderStatus(item.status)}</td>
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

      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div>
          Showing {totalData === 0 ? 0 : startIndex + 1}-{endIndex} of {totalData} data
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          {getPageNumbers().map((pageNum, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                pageNum === page
                  ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                  : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
              )}
              onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
              disabled={typeof pageNum !== 'number' || isLoading}
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
            disabled={page === totalPages || totalData === 0 || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
