import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LaporanBuktiPotongTable from '@/components/features/laporan-bukti-potong/LaporanBuktiPotongTable';
import { LaporanBuktiPotongDeleteDialog } from '@/components/features/laporan-bukti-potong/LaporanBuktiPotongDeleteDialog';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useWithholdingTaxReports, useDeleteWithholdingTaxReport } from '@/hooks/useLaporanBuktiPotong';
import type { WithholdingTaxReport } from '@/@types/laporan-bukti-potong.types';

export default function LaporanBuktiPotongPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WithholdingTaxReport | null>(null);

  // In a real scenario, get company_id from context or slug. Using 1 for dummy.
  const companyId = 1;

  const { data: queryResult, isLoading } = useWithholdingTaxReports({
    company_id: companyId,
    page,
    per_page: perPage,
    search: debouncedSearch,
  });

  const deleteMutation = useDeleteWithholdingTaxReport();

  const handleEdit = (item: WithholdingTaxReport) => {
    if (!slug) return;
    void router.push(`/dashboard/${slug}/finance/laporan-bukti-potong/edit/${item.id}`);
  };

  const handleDeleteClick = (item: WithholdingTaxReport) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Data bukti potong berhasil dihapus');
      setDeleteOpen(false);
      setSelectedItem(null);
      // If deleting the last item on the page, go to previous page
      if (queryResult?.data?.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data');
    }
  };

  return (
    <DashboardLayout>
      <LaporanBuktiPotongTable
        data={queryResult?.data || []}
        meta={queryResult?.meta || null}
        loading={isLoading}
        search={searchInput}
        currentPage={page}
        perPage={perPage}
        onSearchChange={(val) => {
          setSearchInput(val);
          setPage(1);
        }}
        onPageChange={setPage}
        onPerPageChange={(val) => {
          setPerPage(val);
          setPage(1);
        }}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <LaporanBuktiPotongDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
