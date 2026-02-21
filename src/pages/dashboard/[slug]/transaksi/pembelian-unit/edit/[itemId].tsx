import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PurchaseForm from '@/components/features/purchase/PurchaseForm';
import { usePurchaseById, useUpdatePurchase } from '@/hooks/usePurchase';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditPurchasePage() {
  const router = useRouter();
  const { slug, itemId } = router.query; // Changed from id to itemId to match folder structure

  // Note: usePurchaseById usually expects 'id'. We need to ensure logic handles 'itemId'
  const { data: purchase, isLoading } = usePurchaseById(itemId as string);
  const updateMutation = useUpdatePurchase();

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({
        id: itemId as string,
        payload: data,
      });
      toast.success('Pembelian berhasil diperbarui');
      router.push(`/dashboard/${slug}/transaksi/pembelian-unit`);
    } catch {
      toast.error('Gagal memperbarui pembelian');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!purchase) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Data tidak ditemukan</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Edit Pembelian</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Pembelian</span>
              <span className="text-blue-600 font-medium">{purchase.code}</span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <PurchaseForm defaultValues={purchase} onSubmit={handleSubmit} onCancel={() => router.back()} loading={updateMutation.isPending} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
