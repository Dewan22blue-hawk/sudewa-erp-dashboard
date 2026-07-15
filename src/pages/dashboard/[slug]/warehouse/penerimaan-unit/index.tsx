'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import PenerimaanUnitTable from '@/components/features/penerimaan-unit/PenerimaanUnitTable';
import PenerimaanUnitFormDialog from '@/components/features/penerimaan-unit/PenerimaanUnitFormDialog';
import { useWarehouseActivities } from '@/hooks/useWarehouseActivity';
import { cn } from '@/lib/utils';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function PenerimaanUnitPage() {
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [currentPage, setCurrentPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const perPage = Number(itemsPerPage);

  const { data: activities, isLoading, isError, error } = useWarehouseActivities({
    activityType: 'receipt',
    perPage: 10000,
  });

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('master-data:create');
  const canEdit = hasPermission('master-data:edit');
  const canDelete = hasPermission('master-data:delete');

  const allData = useMemo(() => activities?.data ?? [], [activities?.data]);

  const filteredData = useMemo(() => {
    if (!search) return allData;
    const lowerSearch = search.toLowerCase();
    return allData.filter((item) => {
      const matchNo = item.noPenerimaan?.toLowerCase().includes(lowerSearch);
      const matchSupplier = item.supplier?.toLowerCase().includes(lowerSearch);
      const matchKet = item.keterangan?.toLowerCase().includes(lowerSearch);
      const matchDate = item.tanggal?.toLowerCase().includes(lowerSearch);
      return matchNo || matchSupplier || matchKet || matchDate;
    });
  }, [allData, search]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);
  const data = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const apiErrorMessage = useMemo(() => {
    if (!isError) return '';
    const err = error as { message?: string } | null;
    return err?.message || 'Gagal memuat data penerimaan unit';
  }, [error, isError]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Data Penerimaan Unit</h1>
          <p className="text-sm text-muted-foreground">Kelola dan lacak semua data penerimaan stock unit</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search here"
                  className="pl-9 bg-white"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                <span>Show</span>
                <Select
                  value={itemsPerPage}
                  onValueChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] bg-white">
                    <SelectValue placeholder="25" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>Page</span>
              </div>
            </div>

            <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]" onClick={() => setOpenForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">Loading...</div>
          ) : isError ? (
            <div className="bg-white rounded-xl border p-8 text-center text-red-500">{apiErrorMessage}</div>
          ) : (
            <PenerimaanUnitTable data={data} />
          )}

          <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
            <p>
              Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} data
            </p>
            <div className="flex flex-wrap items-center justify-end gap-1 text-slate-800">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              {getPageNumbers().map((page, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 min-w-9 rounded-xl border px-3 text-sm font-medium shadow-none',
                    page === currentPage
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white',
                  )}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={typeof page !== 'number'}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl px-2 text-sm font-medium hover:bg-transparent disabled:text-slate-300"
                disabled={currentPage === totalPages || totalItems === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <PenerimaanUnitFormDialog open={openForm} onClose={() => setOpenForm(false)} />
      </div>
    </DashboardLayout>
  );
}
