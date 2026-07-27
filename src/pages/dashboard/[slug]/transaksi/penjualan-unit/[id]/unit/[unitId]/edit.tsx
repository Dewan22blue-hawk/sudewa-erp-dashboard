import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { EditUnitForm } from '@/components/features/sales/edit/EditUnitForm';
import { EditUnitFormData } from '@/components/features/sales/edit/edit-unit.schema';
import { toast } from 'sonner';
import { useSalesUnitItems, useUpdateUnitItem } from '@/hooks/useUnitTransactionItem';
import { useSalesDetail } from '@/hooks/useSales';
import { useTypeUnits } from '@/hooks/useTypeUnit';

/**
 * Edit Unit Page - Nested under Sales Detail
 */
export default function EditNestedUnitPage() {
    const router = useRouter();
    const { id, unitId, slug } = router.query;
    const salesId = Array.isArray(id) ? id[0] : id;
    const selectedUnitId = Array.isArray(unitId) ? unitId[0] : unitId;
    const slugValue = Array.isArray(slug) ? slug[0] : slug || '';

    const { data: salesDetail, isLoading: salesLoading } = useSalesDetail(salesId);
    const { data: itemResponse, isLoading: itemLoading } = useSalesUnitItems(salesId);
    const { data: unitTypes, isLoading: typeUnitLoading } = useTypeUnits();
    const updateMutation = useUpdateUnitItem();

    const item = (itemResponse?.data ?? []).find((row) => String(row.id) === String(selectedUnitId ?? ''));
    const invoiceCode = salesDetail?.raw?.code ?? '-';

    const productOptions = useMemo(
        () =>
            (unitTypes?.data ?? []).map((option) => ({
                value: String(option.id),
                label: option.name,
            })),
        [unitTypes?.data],
    );

    const formData: EditUnitFormData | null = useMemo(() => {
        if (!item) return null;
        const qty = Number(item.qty_total ?? 0) || 1;

        return {
            customer: salesDetail?.ui?.customer ?? '',
            tipeUnit: String(item.unit_type_id ?? ''),
            qty,
            harga: Number(item.price ?? 0),
            biayaBbn: Number(item.bbn_price ?? 0),
            biayaEkspedisi: Number(item.expedition_fee ?? 0),
            biayaLain: Number(item.other_fee ?? 0),
            hppSatuan: qty > 0 ? Number(item.hpp_total_price ?? 0) / qty : 0,
            totalHpp: Number(item.hpp_total_price ?? 0),
            dppSatuan: qty > 0 ? Number(item.dpp_total_price ?? 0) / qty : 0,
            totalDpp: Number(item.dpp_total_price ?? 0),
            ppnSatuan: qty > 0 ? Number(item.ppn_total_price ?? 0) / qty : 0,
            totalPpn: Number(item.ppn_total_price ?? 0),
            hargaUsd: item.price_usd ? Number(item.price_usd) : undefined,
            hargaPerUnitUsd: item.price_per_unit_usd ? Number(item.price_per_unit_usd) : undefined,
            dppTaxVersionId: item.dpp_tax_id ?? undefined,
            ppnTaxVersionId: item.ppn_tax_id ?? undefined,
        };
    }, [item, salesDetail?.ui?.customer]);

    const handleSubmit = async (values: EditUnitFormData) => {
        try {
            if (!selectedUnitId) {
                toast.error('Unit tidak valid');
                return;
            }

            // Omit unit_transaction_id and unit_type_id if they haven't changed to bypass backend unique constraint bug
            const isUnitTypeChanged = values.tipeUnit && String(values.tipeUnit) !== String(item?.unit_type_id);

            await updateMutation.mutateAsync({
                id: String(selectedUnitId),
                payload: {
                    unit_transaction_id: undefined,
                    unit_type_id: isUnitTypeChanged && String(values.tipeUnit) !== 'null' ? String(values.tipeUnit) : undefined,
                    sparepart_id: item?.sparepart_id && String(item.sparepart_id) !== 'null' ? String(item.sparepart_id) : undefined,
                    qty_total: Number(values.qty ?? 0),
                    price: Number(values.harga ?? 0),
                    bbn_price: Number(values.biayaBbn ?? 0),
                    expedition_fee: Number(values.biayaEkspedisi ?? 0),
                    other_fee: Number(values.biayaLain ?? 0),
                    price_usd: values.hargaUsd ? Number(values.hargaUsd) : undefined,
                    price_per_unit_usd: values.hargaPerUnitUsd ? Number(values.hargaPerUnitUsd) : undefined,
                    dpp_tax_id: values.dppTaxVersionId ? Number(values.dppTaxVersionId) : undefined,
                    ppn_tax_id: values.ppnTaxVersionId ? Number(values.ppnTaxVersionId) : undefined,
                },
            });

            toast.success('Unit berhasil diperbarui!');
            const basePath = slugValue ? `/dashboard/${slugValue}/transaksi/penjualan-unit` : '/transaksi/penjualan-unit';
            router.push(`${basePath}/${salesId}`);
        } catch (error: any) {
            const responseData = error?.response?.data;
            const errorMsg = responseData?.message || error?.message || 'Gagal memperbarui unit.';
            const validationErrors = responseData?.errors;

            if (validationErrors && typeof validationErrors === 'object') {
                const firstErrorKey = Object.keys(validationErrors)[0];
                const firstErrorArray = validationErrors[firstErrorKey];
                const firstErrorMessage = Array.isArray(firstErrorArray) ? firstErrorArray[0] : firstErrorArray;
                toast.error(`${errorMsg} - ${firstErrorMessage}`);
            } else {
                toast.error(errorMsg);
            }
        }
    };

    if (salesLoading || itemLoading || typeUnitLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    if (!formData) {
        return (
            <DashboardLayout>
                <div className="p-6 text-muted-foreground">Unit tidak ditemukan</div>
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
                            <span className="text-muted-foreground">Kode Jual</span>
                            <span className="text-blue-600 font-medium">{invoiceCode}</span>
                        </div>
                    </div>
                </div>

                <Card className="rounded-md">
                    <CardContent className="p-6">
                        <EditUnitForm
                            defaultValues={formData}
                            hideCustomerField
                            productOptions={productOptions}
                            searchableTypeUnit
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                            submitDisabled={updateMutation.isPending}
                            cancelDisabled={updateMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
