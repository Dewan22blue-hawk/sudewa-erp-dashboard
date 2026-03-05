'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useRefundBeli } from '@/hooks/useRefundBeli';
import RefundBeliTable from '@/components/features/refund-beli/RefundBeliTable';
import { useTableSort } from '@/hooks/useTableSort';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// ... imports

export default function RefundBeliPage() {
  const { data = [] } = useRefundBeli();

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter((item) => item.namaSupplier.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort({
    data: filteredData,
    defaultSortKey: 'tanggal',
    defaultSortOrder: 'asc'
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Data Refund Pembelian</h1>
          <p className="text-sm text-gray-500">Kelola arus transaksi refund pembelian</p>
        </div>

        {/* FILTER */}
        <div className="flex justify-start gap-4 items-center">
          <div className="relative w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
              <SelectTrigger className="h-10 w-[70px]">
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

        {/* TABLE */}
        <RefundBeliTable data={paginatedData} sortKey={sortKey as string} sortOrder={sortOrder} onSort={handleSort as any} />

        {/* PAGINATION */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} data
          </div>

          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-md ${currentPage === i + 1 ? 'bg-gray-200' : ''}`}>
                {i + 1}
              </button>
            ))}

            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
