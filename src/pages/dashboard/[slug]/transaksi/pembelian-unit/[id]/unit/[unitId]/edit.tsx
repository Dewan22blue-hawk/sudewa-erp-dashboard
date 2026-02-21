import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PurchaseUnitForm from '@/components/features/purchase/PurchaseUnitForm';
import { usePurchaseById } from '@/hooks/usePurchase';
import { toast } from 'sonner';
// useEffect/useState removed (not used)

export default function EditNestedUnitPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { data: purchase, isLoading } = usePurchaseById(id as string);

  const handleSubmit = async () => {
    try {
      // Mock update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Unit berhasil diperbarui');
      router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${id}`);
    } catch {
      toast.error('Gagal memperbarui unit');
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

  if (!purchase) return null;

  // Determine initial values or finding specific unit
  // unit lookup intentionally omitted (not required by mock page)
  // In real app we would pre-fill with 'unit' data.
  // PurchaseUnitForm might need adjustment to accept defaultValues matching Unit structure perfectly or mapped.
  // For now we render the form.

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Edit Unit</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Pembelian</span>
              <span className="text-blue-600 font-medium">{purchase.code}</span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <PurchaseUnitForm
              // initialValues={unit} // TODO: Implement if PurchaseUnitForm supports it
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
