import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PurchaseUnitForm from '@/components/features/purchase/PurchaseUnitForm';
import { usePurchaseById } from '@/hooks/useUnitTransaction';
import {
  usePurchaseUnitItems,
  useUpdateUnitItem,
} from '@/hooks/useUnitTransactionItem';
import { toast } from 'sonner';
import { CreatePurchaseUnitFormValues } from '@/scheme/purchase.schema';

// ======================
// ERROR PARSER
// ======================
const parseApiError = (err: any): string => {
  const details = err?.details ?? err?.response?.data?.errors;

  if (typeof details === 'string') return details;

  if (details && typeof details === 'object') {
    return Object.entries(details)
      .map(
        ([field, value]) =>
          `${field}: ${
            Array.isArray(value) ? value[0] : String(value)
          }`
      )
      .join(', ');
  }

  const responseMessage = err?.response?.data?.message;
  if (
    typeof responseMessage === 'string' &&
    responseMessage.trim()
  )
    return responseMessage;

  return err?.message || 'Gagal memperbarui unit';
};

// ======================
// COMPONENT
// ======================
export default function EditNestedUnitPage() {
  const router = useRouter();
  const { slug, id, unitId } = router.query;

  const { data: purchase, isLoading } = usePurchaseById(
    id as string
  );

  const { data: unitItems, isLoading: isUnitLoading } =
    usePurchaseUnitItems(id as string);

  const updateUnitMutation = useUpdateUnitItem();

  const unit = unitItems?.data?.find(
    (item) => item.id === String(unitId)
  );

  const parentTransactionId = String(
    unit?.unit_transaction_id ?? id ?? ''
  );

  const excludedTypeUnitIds = (unitItems?.data ?? [])
    .filter(
      (item) =>
        item.id !== String(unitId) && item.unit_type_id
    )
    .map((item) => String(item.unit_type_id));

  // ======================
  // SUBMIT HANDLER
  // ======================
  const handleSubmit = async (
    data: CreatePurchaseUnitFormValues
  ) => {
    try {
      if (!unitId) {
        toast.error('Unit item tidak ditemukan');
        return;
      }

      // ======================
      // NORMALIZE INPUT
      // ======================
      const selectedTypeUnitId =
        data.typeUnitId !== undefined &&
        data.typeUnitId !== null
          ? String(data.typeUnitId)
          : '';

      const qty = Number(data.qty ?? 0);
      const price = Number(data.price ?? 0);
      const bbn = Number(data.biayaBBN ?? 0);
      const expedition = Number(data.biayaEkspedisi ?? 0);
      const other = Number(data.biayaLain ?? 0);

      // ======================
      // VALIDATION
      // ======================
      if (!Number.isFinite(qty) || qty <= 0) {
        toast.error('Qty wajib lebih dari 0');
        return;
      }

      if (
        ![price, bbn, expedition, other].every(
          (v) => Number.isFinite(v) && v >= 0
        )
      ) {
        toast.error('Harga dan biaya harus berupa angka valid');
        return;
      }

      if (
        selectedTypeUnitId &&
        excludedTypeUnitIds.includes(selectedTypeUnitId)
      ) {
        toast.error(
          'Tipe unit sudah digunakan oleh item lain di transaksi ini'
        );
        return;
      }

      // ======================
      // CURRENT VALUES
      // ======================
      const currentTypeUnitId = unit?.unit_type_id
        ? String(unit.unit_type_id)
        : '';
      const currentSparepartId = unit?.sparepart_id
        ? String(unit.sparepart_id)
        : '';

      const currentQty = Number(unit?.qty_total ?? 0);
      const currentPrice = Number(unit?.price ?? 0);
      const currentBbn = Number(unit?.bbn_price ?? 0);
      const currentExpedition = Number(
        unit?.expedition_fee ?? 0
      );
      const currentOther = Number(unit?.other_fee ?? 0);

      const isSame = (a: number, b: number) =>
        Math.abs(a - b) < 0.000001;

      // ======================
      // CAPACITY VALIDATION
      // ======================
      const maxCapacity = Number(purchase?.max_capacity ?? 0);

      const totalQtyAllItems = (unitItems?.data ?? []).reduce(
        (acc, item) =>
          acc + Number(item.qty_total ?? 0),
        0
      );

      const remainingCapacityForThisItem = Math.max(
        0,
        maxCapacity - (totalQtyAllItems - currentQty)
      );

      if (maxCapacity > 0 && qty > remainingCapacityForThisItem) {
        toast.error(
          `Qty melebihi kapasitas sisa transaksi. Sisa kapasitas untuk item ini: ${remainingCapacityForThisItem}`
        );
        return;
      }

      // ======================
      // BUILD PAYLOAD (DIFF)
      // ======================
      const payload: any = {
        unit_transaction_id: parentTransactionId,
      };

      if (
        selectedTypeUnitId &&
        selectedTypeUnitId !== currentTypeUnitId
      ) {
        payload.unit_type_id = selectedTypeUnitId;
      }

      if ((data.sparepartId || '') !== currentSparepartId) {
        payload.sparepart_id = data.sparepartId || '';
      }

      if (!isSame(qty, currentQty)) {
        payload.qty_total = qty;
      }

      if (!isSame(price, currentPrice)) {
        payload.price = price;
      }

      if (!isSame(bbn, currentBbn)) {
        payload.bbn_price = bbn;
      }

      if (!isSame(expedition, currentExpedition)) {
        payload.expedition_fee = expedition;
      }

      if (!isSame(other, currentOther)) {
        payload.other_fee = other;
      }

      // ======================
      // CHECK CHANGES
      // ======================
      const hasChanges =
        Object.keys(payload).length > 1;

      if (!hasChanges) {
        toast.info('Tidak ada perubahan data');
        return;
      }

      // ======================
      // API CALL
      // ======================
      await updateUnitMutation.mutateAsync({
        id: String(unitId),
        payload,
      });

      toast.success('Unit berhasil diperbarui');

      router.push(
        `/dashboard/${slug}/transaksi/pembelian-unit/${parentTransactionId}`
      );
    } catch (err: any) {
      toast.error(parseApiError(err));
    }
  };

  // ======================
  // LOADING STATE
  // ======================
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
          <p className="text-muted-foreground">
            Unit item tidak ditemukan
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ======================
  // RENDER
  // ======================
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Unit
            </h1>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Kode Pembelian
              </span>
              <span className="font-medium text-blue-600">
                {purchase.code}
              </span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <PurchaseUnitForm
              defaultValues={{
                typeUnitId: unit.unit_type_id ?? '',
                sparepartId: unit.sparepart_id ?? '',
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
