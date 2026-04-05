'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PurchaseTable from '@/components/features/purchase/PurchaseTable';
import DeletePurchaseDialog from '@/components/features/purchase/DeletePurchaseDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { useDeletePurchase } from '@/hooks/usePurchase';
import { useUnitTransactions } from '@/hooks/useUnitTransaction';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

export default function PurchasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { slug } = router.query;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
<<<<<<< HEAD
  const { data, isLoading, isFetching } = useUnitTransactions({ page, perPage });
=======
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching } = useUnitTransactions({ page, perPage, search });
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
  const deleteMutation = useDeletePurchase();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteMutation.mutateAsync(selectedId);
      await queryClient.invalidateQueries({ queryKey: ['unit-transactions'] });
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
            loading={isLoading && isFetching}
          />
        )}
        <DeletePurchaseDialog open={!!selectedId} onClose={() => setSelectedId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
      </div>
    </DashboardLayout>
  );
}
