'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PurchaseTable from '@/components/features/purchase/PurchaseTable';
import DeletePurchaseDialog from '@/components/features/purchase/DeletePurchaseDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { usePurchases, useDeletePurchase } from '@/hooks/usePurchase';
import { useCompany } from '@/contexts/CompanyContext';
import { useRouter } from 'next/router';

export default function PurchasePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { companyId } = useCompany();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching } = usePurchases(companyId, { page, perPage, search });
  const deleteMutation = useDeletePurchase();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteMutation.mutateAsync(selectedId);
      toast.success('Data berhasil dihapus');
      setSelectedId(null);
      // Refresh list after deletion
      setPage(1);
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <PageHeader title="Pembelian Unit" description="Kelola dan lacak semua pembelian unit" />

          <div className="flex gap-2"></div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <PurchaseTable
            data={data?.data ?? []}
            meta={data?.meta}
            onDelete={(id) => setSelectedId(id)}
            onAdd={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/create`)}
            slug={slug as string}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
            onSearch={setSearch}
            loading={isFetching}
          />
        )}

        <DeletePurchaseDialog open={!!selectedId} onClose={() => setSelectedId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
      </div>
    </DashboardLayout>
  );
}
