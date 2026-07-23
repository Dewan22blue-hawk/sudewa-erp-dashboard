import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PurchaseForm from '@/components/features/purchase/PurchaseForm';
import { usePurchaseById, useUpdatePurchase } from '@/hooks/usePurchase';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export default function EditPurchasePage() {
  const router = useRouter();
  const { companyId } = useCompany();
  const { slug, itemId } = router.query; // Changed from id to itemId to match folder structure

  // Note: usePurchaseById usually expects 'id'. We need to ensure logic handles 'itemId'
  const { data: purchase, isLoading } = usePurchaseById(itemId as string);
  const updateMutation = useUpdatePurchase();

  const defaultValues = useMemo(() => {
    if (!purchase) return undefined;
    return {
      supplierName: purchase.supplierName,
      date: purchase.date ? purchase.date.slice(0, 10) : '',
      code: purchase.code,
      supplierAddress: purchase.supplierAddress,
      supplierNpwp: purchase.supplierNpwp,
    };
  }, [purchase]);

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
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
            Pembelian Unit
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="font-medium text-foreground">Edit Pembelian</span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-950">Edit Pembelian</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Kode Beli</span>
            <span className="text-blue-600 font-medium">{purchase.code}</span>
          </div>
        </div>

        <Card className="rounded-md border border-gray-200 shadow-none">
          <CardContent className="p-6">
            <PurchaseForm defaultValues={defaultValues} onSubmit={handleSubmit} onCancel={() => router.back()} loading={updateMutation.isPending} companyId={companyId} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
