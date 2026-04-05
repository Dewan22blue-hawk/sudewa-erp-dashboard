import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { StockStatus, StockUnit } from '@/@types/stock-unit.types';
import StockUnitFilterTabs from './StockUnitFilterTabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableHeader } from '@/components/ui/sortable-header';

type StatusFilter = StockStatus | 'all';

interface Props {
  data: StockUnit[];
}

const statusLabel: Record<StockStatus, string> = {
  in_transit: 'Transit',
  available: 'Free',
  reserved: 'Out',
};

const statusBadgeClasses: Record<StockStatus, string> = {
  in_transit: 'bg-blue-100 text-blue-600',
  available: 'bg-green-100 text-green-600',
  reserved: 'bg-orange-100 text-orange-600',
};

export default function StockUnitTable({ data }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return data
      .filter((item) => (statusFilter === 'all' ? true : item.status === statusFilter))
      .filter((item) => [item.tipeUnit, item.warna, item.noMesin, item.noRangka, item.supplier, item.customer ?? ''].join(' ').toLowerCase().includes(normalizedSearch));
  }, [data, search, statusFilter]);

  const perPage = Number(itemsPerPage);
  const totalItems = filteredData.length;

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: filteredData,
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * perPage;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + perPage, totalItems);
  const paginatedData = sortedData.slice(startIndex, startIndex + perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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

  const renderStatus = (status: StockStatus) => <span className={`text-xs px-2 py-1 rounded-full ${statusBadgeClasses[status]}`}>{statusLabel[status]}</span>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div className="flex flex-wrap items-center gap-4">
          <StockUnitFilterTabs active={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)} />
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <Select
              value={itemsPerPage}
              onValueChange={(val) => {
                setItemsPerPage(val);
              }}
            >
              <SelectTrigger className="h-10 w-20">
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-200/50 uppercase text-xs font-semibold text-gray-900">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">No</th>
              <th className="p-0 text-left">
                <SortableHeader title="Tipe Unit" sortKey="tipeUnit" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Warna" sortKey="warna" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="No Mesin" sortKey="noMesin" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="No Rangka" sortKey="noRangka" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Supplier" sortKey="supplier" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Customer" sortKey="customer" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
              <th className="p-0 text-left">
                <SortableHeader title="Status" sortKey="status" currentSortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort} className="w-full justify-start px-4 text-gray-900 uppercase" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.tipeUnit}</td>
                  <td className="px-4 py-3">{item.warna}</td>
                  <td className="px-4 py-3">{item.noMesin}</td>
                  <td className="px-4 py-3">{item.noRangka}</td>
                  <td className="px-4 py-3">{item.supplier}</td>
                  <td className="px-4 py-3">{item.customer ?? '-'}</td>
                  <td className="px-4 py-3">{renderStatus(item.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} data
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </Button>

          {getPageNumbers().map((page, idx) => (
            <Button
              key={idx}
              variant={page === currentPage ? 'outline' : 'ghost'}
              size="sm"
              className={page === currentPage ? 'bg-gray-100' : ''}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={typeof page !== 'number'}
            >
              {page}
            </Button>
          ))}

          <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalItems === 0} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
