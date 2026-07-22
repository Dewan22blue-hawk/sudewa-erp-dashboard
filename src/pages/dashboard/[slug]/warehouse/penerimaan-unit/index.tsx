'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import PenerimaanUnitTable from '@/components/features/penerimaan-unit/PenerimaanUnitTable';
import PenerimaanUnitFormDialog from '@/components/features/penerimaan-unit/PenerimaanUnitFormDialog';
import { useWarehouseActivities } from '@/hooks/useWarehouseActivity';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { PageHeader } from '@/components/common/PageHeader';

export default function PenerimaanUnitPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [openForm, setOpenForm] = useState(false);

  const { data: activities, isLoading, isError, error } = useWarehouseActivities({
    activityType: 'receipt',
    perPage: 10000,
  });

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('warehouse:create');

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
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);
  const data = filteredData.slice(startIndex, endIndex);

  const meta = {
    currentPage: safeCurrentPage,
    perPage,
    lastPage: totalPages,
    total: totalItems,
  };

  const apiErrorMessage = useMemo(() => {
    if (!isError) return '';
    const err = error as { message?: string } | null;
    return err?.message || 'Gagal memuat data penerimaan unit';
  }, [error, isError]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Penerimaan Unit"
          description="Kelola dan lacak semua data penerimaan stock unit"
        />

        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">Loading...</div>
          ) : isError ? (
            <div className="bg-white rounded-xl border p-8 text-center text-red-500">{apiErrorMessage}</div>
          ) : (
            <PenerimaanUnitTable
              data={data}
              meta={meta}
              isLoading={isLoading}
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setCurrentPage(1);
              }}
              perPage={perPage}
              onPerPageChange={(pp) => {
                setPerPage(pp);
                setCurrentPage(1);
              }}
              onPageChange={setCurrentPage}
              headerActions={
                canCreate && (
                  <Button onClick={() => setOpenForm(true)} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Penerimaan Unit
                  </Button>
                )
              }
            />
          )}
        </div>

        <PenerimaanUnitFormDialog open={openForm} onClose={() => setOpenForm(false)} />
      </div>
    </DashboardLayout>
  );
}
