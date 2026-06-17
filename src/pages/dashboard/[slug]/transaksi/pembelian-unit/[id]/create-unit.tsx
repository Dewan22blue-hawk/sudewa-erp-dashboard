'use client';

import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PurchaseUnitForm from '@/components/features/purchase/PurchaseUnitForm';
import { usePurchaseById } from '@/hooks/useUnitTransaction';
import { useCreateUnitItem, usePurchaseUnitItems } from '@/hooks/useUnitTransactionItem';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePurchaseUnitFormValues } from '@/scheme/purchase.schema';
import { useMemo } from 'react';

const parseApiError = (err: any): string => {
  const details = err?.details ?? err?.response?.data?.errors;
  if (typeof details === 'string') return details;
  if (details && typeof details === 'object') {
    return Object.entries(details)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : String(v)}`)
      .join(', ');
  }

  const responseMessage = err?.response?.data?.message;
  if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;

  return err?.message || 'Gagal menambahkan unit';
};

export default function CreatePurchaseUnitPage() {
  const router = useRouter();
  const { slug, id } = router.query;

  const { data: purchase, isLoading } = usePurchaseById(id as string);
  const { data: existingItems } = usePurchaseUnitItems(id as string);
  const addUnitMutation = useCreateUnitItem();

  const existingTypeUnitIds = useMemo(
    () =>
      (existingItems?.data ?? [])
        .map((item) => (item.unit_type_id ? String(item.unit_type_id) : ''))
        .filter((value): value is string => Boolean(value)),
    [existingItems]
  );

  const handleSubmit = async (data: CreatePurchaseUnitFormValues) => {
    try {
      if (!data.typeUnitId) {
        toast.error('Tipe unit wajib dipilih');
        return;
      }

      if (existingTypeUnitIds.includes(String(data.typeUnitId))) {
        toast.error('Tipe unit sudah ada di transaksi ini. Pilih tipe unit lain.');
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

      if (![price, bbn, expedition, other].every((v) => Number.isFinite(v) && v >= 0)) {
        toast.error('Harga dan biaya harus berupa angka valid');
        return;
      }

      const maxCapacity = Number(purchase?.max_capacity ?? 0);
      const usedQty = (existingItems?.data ?? []).reduce((acc, item) => acc + Number(item.qty_total ?? 0), 0);
      const remainingCapacity = Math.max(0, maxCapacity - usedQty);

      if (maxCapacity > 0 && qty > remainingCapacity) {
        toast.error(`Qty melebihi kapasitas sisa transaksi. Sisa kapasitas: ${remainingCapacity}`);
        return;
      }

      await addUnitMutation.mutateAsync({
        unit_transaction_id: id as string,
        unit_type_id: data.typeUnitId,
        sparepart_id: data.sparepartId,
        qty_total: qty,
        price,
        bbn_price: bbn,
        expedition_fee: expedition,
        other_fee: other,
      });
      toast.success('Unit berhasil ditambahkan');
      router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${id}`);
    } catch (err: any) {
      toast.error(parseApiError(err));
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Tambah Unit</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kode Pembelian</span>
              <span className="text-blue-600 font-medium">{purchase?.code ?? '-'}</span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <PurchaseUnitForm
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              loading={addUnitMutation.isPending}
              excludedTypeUnitIds={existingTypeUnitIds}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
