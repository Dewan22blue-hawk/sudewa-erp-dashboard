import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PurchaseUnitForm from '@/components/features/purchase/PurchaseUnitForm';
import { usePurchaseById } from '@/hooks/useUnitTransaction';
import { usePurchaseUnitItems, useUpdateUnitItem } from '@/hooks/useUnitTransactionItem';
import { toast } from 'sonner';
import { CreatePurchaseUnitFormValues } from '@/scheme/purchase.schema';

export default function EditNestedUnitPage() {
  const router = useRouter();
  const { slug, id, unitId } = router.query;
  const { data: purchase, isLoading } = usePurchaseById(id as string);
  const { data: unitItems, isLoading: isUnitLoading } = usePurchaseUnitItems(id as string);
  const updateUnitMutation = useUpdateUnitItem();

  const unit = unitItems?.data?.find((item) => item.id === String(unitId));

  const handleSubmit = async (data: CreatePurchaseUnitFormValues) => {
    try {
      if (!unitId) {
        toast.error('Unit item tidak ditemukan');
        return;
      }
      if (!data.typeUnitId) {
        toast.error('Tipe unit wajib dipilih');
        return;
      }

      await updateUnitMutation.mutateAsync({
        id: String(unitId),
        payload: {
          unit_transaction_id: String(id),
          unit_type_id: data.typeUnitId,
          qty_total: Number(data.qty ?? 0),
          price: Number(data.price ?? 0),
          bbn_price: Number(data.biayaBBN ?? 0),
          expedition_fee: Number(data.biayaEkspedisi ?? 0),
          other_fee: Number(data.biayaLain ?? 0),
        },
      });

      toast.success('Unit berhasil diperbarui');
      router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${id}`);
    } catch {
      toast.error('Gagal memperbarui unit');
    }
  };

  if (isLoading || isUnitLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!purchase) return null;

  if (!unit) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Unit item tidak ditemukan</p>
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
              defaultValues={{
                typeUnitId: unit.unit_type_id ?? '',
                qty: unit.qty_total,
                price: unit.price,
                biayaBBN: unit.bbn_price,
                biayaEkspedisi: unit.expedition_fee,
                biayaLain: unit.other_fee,
              }}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              loading={updateUnitMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
