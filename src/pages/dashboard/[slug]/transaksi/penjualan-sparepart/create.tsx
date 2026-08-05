import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { SalesSparepartForm } from '@/components/features/sparepart-transaction/SalesSparepartForm';
import { useCreateSparepartTransaction } from '@/hooks/useSparepartTransaction';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

export default function CreateSalesSparepartPage() {
  const router = useRouter();
  const { slug } = router.query;
  const createMutation = useCreateSparepartTransaction();

  const handleCancel = () => {
    router.push(`/dashboard/${slug}/transaksi/penjualan-sparepart`);
  };

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        type: 'sales',
      });
      toast.success('Penjualan Sparepart berhasil ditambahkan');
      router.push(`/dashboard/${slug}/transaksi/penjualan-sparepart`);
    } catch {
      toast.error('Gagal menambahkan Penjualan Sparepart');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Tambah Penjualan Sparepart"
          onBack={handleCancel}
          breadcrumbs={[
            { label: 'Penjualan Sparepart', onClick: handleCancel },
            { label: 'Tambah Data' },
          ]}
        />

        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <SalesSparepartForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
