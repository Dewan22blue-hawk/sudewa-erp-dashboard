import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PurchaseUnitForm from '@/components/features/purchase/PurchaseUnitForm';
import { usePurchaseById } from '@/hooks/useUnitTransaction';
import { usePurchaseUnitItems, useUpdateUnitItem } from '@/hooks/useUnitTransactionItem';
import { toast } from 'sonner';
import { CreatePurchaseUnitFormValues } from '@/scheme/purchase.schema';

const parseApiError = (err: any): string => {
  const details = err?.details ?? err?.response?.data?.errors;
  if (typeof details === 'string') return details;
  if (details && typeof details === 'object') {
    return Object.entries(details)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value[0] : String(value)}`)
      .join(', ');
  }
  return err?.message || 'Gagal memperbarui unit';
};

export default function EditNestedUnitPage() {
  const router = useRouter();
  const { slug, id, unitId } = router.query;
  const { data: purchase, isLoading } = usePurchaseById(id as string);
  const { data: unitItems, isLoading: isUnitLoading } = usePurchaseUnitItems(id as string);
  const updateUnitMutation = useUpdateUnitItem();

  const unit = unitItems?.data?.find((item) => item.id === String(unitId));
  const excludedTypeUnitIds = (unitItems?.data ?? [])
    .filter((item) => item.id !== String(unitId) && item.unit_type_id)
    .map((item) => String(item.unit_type_id));

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

      const selectedTypeUnitId = String(data.typeUnitId);
      if (excludedTypeUnitIds.includes(selectedTypeUnitId)) {
        toast.error('Tipe unit sudah digunakan oleh item lain di transaksi ini');
        return;
      }

      const qty = Number(data.qty ?? 0);
      const price = Number(data.price ?? 0);
      const bbn = Number(data.biayaBBN ?? 0);
      const expedition = Number(data.biayaEkspedisi ?? 0);
      const other = Number(data.biayaLain ?? 0);

      if (!Number.isFinite(qty) || qty <= 0) {
        toast.error('Qty wajib lebih dari 0');
        return;
      }

      if (![price, bbn, expedition, other].every((value) => Number.isFinite(value) && value >= 0)) {
        toast.error('Harga dan biaya harus berupa angka valid');
        return;
      }

      const currentTypeUnitId = unit?.unit_type_id ? String(unit.unit_type_id) : '';
      const shouldSendTypeUnitId = selectedTypeUnitId !== currentTypeUnitId;

      const currentQty = Number(unit?.qty_total ?? 0);
      const currentPrice = Number(unit?.price ?? 0);
      const currentBbn = Number(unit?.bbn_price ?? 0);
      const currentExpedition = Number(unit?.expedition_fee ?? 0);
      const currentOther = Number(unit?.other_fee ?? 0);

      const changedPayload = {
        unit_transaction_id: String(id),
        // Send unit_type_id only when changed to avoid backend unique false-positive on same record.
        unit_type_id: shouldSendTypeUnitId ? selectedTypeUnitId : undefined,
        qty_total: qty,
        price: price !== currentPrice ? price : undefined,
        bbn_price: bbn !== currentBbn ? bbn : undefined,
        expedition_fee: expedition !== currentExpedition ? expedition : undefined,
        other_fee: other !== currentOther ? other : undefined,
      };

      const hasChanges =
        changedPayload.price !== undefined ||
        changedPayload.bbn_price !== undefined ||
        changedPayload.expedition_fee !== undefined ||
        changedPayload.other_fee !== undefined ||
        shouldSendTypeUnitId ||
        qty !== currentQty;

      if (!hasChanges) {
        toast.info('Tidak ada perubahan data');
        return;
      }

      await updateUnitMutation.mutateAsync({
        id: String(unitId),
        payload: changedPayload,
      });

      toast.success('Unit berhasil diperbarui');
      router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${id}`);
    } catch (err: any) {
      toast.error(parseApiError(err));
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
              excludedTypeUnitIds={excludedTypeUnitIds}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
