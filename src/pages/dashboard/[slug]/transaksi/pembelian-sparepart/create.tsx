import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { PurchaseSparepartForm } from '@/components/features/sparepart-transaction/PurchaseSparepartForm';
import { useCreateSparepartTransaction } from '@/hooks/useSparepartTransaction';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

export default function CreatePurchaseSparepartPage() {
  const router = useRouter();
  const { slug } = router.query;
  const createMutation = useCreateSparepartTransaction();

  const handleCancel = () => {
    router.push(`/dashboard/${slug}/transaksi/pembelian-sparepart`);
  };

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        type: 'purchase',
      });
      toast.success('Pembelian Sparepart berhasil ditambahkan');
      router.push(`/dashboard/${slug}/transaksi/pembelian-sparepart`);
    } catch {
      toast.error('Gagal menambahkan Pembelian Sparepart');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Tambah Pembelian Sparepart" 
          description="Masukkan data pembelian sparepart baru ke dalam sistem"
          onBack={handleCancel}
          breadcrumbs={[
            { label: 'Pembelian Sparepart', onClick: handleCancel },
            { label: 'Tambah Data' },
          ]}
        />
        
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <PurchaseSparepartForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
