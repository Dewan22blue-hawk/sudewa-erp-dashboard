import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { useSalesDetail } from '@/hooks/useSales';
import { useCreateUnitItem, useSalesItemsByWarehouse } from '@/hooks/useUnitTransactionItem';
import { useTypeUnits } from '@/hooks/useTypeUnit';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Tambah Unit Page - Nested under Sales Detail
 */
export default function CreateUnitPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const salesId = Array.isArray(id) ? id[0] : id;
  const { data: salesDetail, isLoading: isLoadingDetail } = useSalesDetail(salesId);
  const createItemMutation = useCreateUnitItem();
  const { data: typeUnitData, isLoading: isLoadingTypeUnits } = useTypeUnits();

  const warehouseId = salesDetail?.raw?.warehouse?.id ?? salesDetail?.raw?.warehouse_id;

  const { data: stockItems, isLoading: isLoadingStockItems } = useSalesItemsByWarehouse(warehouseId);

  const availableTypeIds = useMemo(() => {
    return new Set((stockItems ?? []).map((item) => String(item.unit_type_id ?? '')).filter(Boolean));
  }, [stockItems]);

  const productOptions = useMemo(() => {
    return (typeUnitData?.data ?? []).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [typeUnitData?.data]);

  const invoiceCode = salesDetail?.raw?.code ?? '-';

  const handleSubmit = async (data: EditUnitFormData) => {
    try {
      if (!salesId) {
        toast.error('ID penjualan tidak valid');
        return;
      }

      const unitTypeId = String(data.tipeUnit ?? '').trim();
      const qty = Number(data.qty ?? 0);

      if (!unitTypeId) {
        toast.error('Tipe Unit wajib dipilih');
        return;
      }

      if (qty <= 0) {
        toast.error('QTY minimal 1');
        return;
      }

      if (availableTypeIds.size > 0 && !availableTypeIds.has(unitTypeId)) {
        toast.error('Unit tidak tersedia di gudang');
        return;
      }

      await createItemMutation.mutateAsync({
        unit_transaction_id: salesId,
        unit_type_id: unitTypeId,
        qty_total: qty,
        price: Number(data.harga ?? 0),
        bbn_price: Number(data.biayaBbn ?? 0),
        expedition_fee: Number(data.biayaEkspedisi ?? 0),
        other_fee: Number(data.biayaLain ?? 0),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sales-transaction', salesId] }),
        queryClient.invalidateQueries({ queryKey: ['sales-transactions'] }),
      ]);

      toast.success('Unit berhasil ditambahkan!');
      const slugQuery = router.query.slug;
      const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
      const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
      router.push(`${basePath}/${salesId}`);
    } catch (error: any) {
      const status = error?.statusCode ?? error?.response?.status;
      if (status === 422) {
        toast.error('Stock tidak tersedia di warehouse. Silakan lakukan pembelian terlebih dahulu.');
        return;
      }

      const detail = error?.details;
      const message =
        typeof detail === 'string'
          ? detail
          : error?.message || 'Gagal menambahkan unit.';

      toast.error(message);
    }
  };

  if (isLoadingDetail) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading data...</div>
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
              <span className="text-muted-foreground">Kode Jual</span>
              <span className="text-blue-600 font-medium">{invoiceCode}</span>
            </div>
          </div>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <EditUnitForm
              defaultValues={{
                customer: salesDetail?.ui?.customer ?? '',
                tipeUnit: '',
                qty: 1,
                harga: 0,
                biayaBbn: 0,
                biayaEkspedisi: 0,
                biayaLain: 0,
                totalHpp: 0,
                totalDpp: 0,
                totalPpn: 0,
                hppSatuan: 0,
                dppSatuan: 0,
                ppnSatuan: 0,
              }}
              productOptions={productOptions}
              searchableTypeUnit
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              submitDisabled={createItemMutation.isPending || isLoadingTypeUnits || isLoadingStockItems}
              cancelDisabled={createItemMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
