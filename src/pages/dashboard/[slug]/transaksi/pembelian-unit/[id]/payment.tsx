"use client"

import { useMemo } from 'react';
import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PurchasePaymentForm } from "@/components/features/purchase/PurchasePaymentForm"
import { usePurchaseById } from '@/hooks/useUnitTransaction';
import { useCreateBilling, useUnitBillings, useUpdateBilling } from '@/hooks/useUnitBilling';
import { UpsertUnitBillingPayload } from '@/@types/unit-billing.types';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function PurchasePaymentPage() {
    const router = useRouter()
    const { slug, id } = router.query
        const purchaseId = String(id ?? '');
        const { companyId } = useCompany();
        const { data: purchase, isLoading: purchaseLoading } = usePurchaseById(purchaseId)
        const { data: billings = [], isLoading: billingLoading } = useUnitBillings(purchaseId);
        const createBilling = useCreateBilling();
        const updateBilling = useUpdateBilling();

        const totalTagihan = Number(purchase?.unit_transaction_bruto_total ?? purchase?.unit_transaction_item_bruto_total ?? 0);
        const totalPaid = useMemo(
            () => billings.reduce((acc, item) => acc + Number(item.bca_payment ?? 0) + Number(item.cash_payment ?? 0) + Number(item.bca_payment_2 ?? 0), 0),
            [billings],
        );
        const remainingPayment = Math.max(0, totalTagihan - totalPaid);

        const calculatePaymentState = (nextTotalPaid: number) => {
            const isPaid = nextTotalPaid >= totalTagihan && totalTagihan > 0;
            return {
                isPaid,
                nextTotalPaid,
                nextRemaining: Math.max(0, totalTagihan - nextTotalPaid),
            };
        };

        const ensurePaymentWithinBruto = (total: number, currentTotalPaid: number, submittedTotal: number, existingBillingTotal = 0) => {
            if (submittedTotal < 0) {
                toast.error('Total pembayaran tidak valid.');
                return false;
            }

            const afterSubmitTotal = currentTotalPaid - existingBillingTotal + submittedTotal;
            if (afterSubmitTotal > total) {
                toast.error('Total pembayaran tidak boleh melebihi nilai bruto transaksi.');
                return false;
            }

            if (afterSubmitTotal < 0) {
                toast.error('Total pembayaran setelah update tidak valid.');
                return false;
            }

            return true;
        };

        const ensureNonNegativeChannels = (total: number, bcaPayment: number, cashPayment: number, bcaPayment2: number) => {
            if (bcaPayment < 0 || cashPayment < 0 || bcaPayment2 < 0) {
                toast.error('Nilai pembayaran tidak boleh negatif.');
                return false;
            }

            if (bcaPayment > total) {
                toast.error('Total IDR Bca payment (BCA) tidak boleh melebihi nilai bruto transaksi.');
                return false;
            }
            if (cashPayment > total) {
                toast.error('Total IDR Cash payment (Cash) tidak boleh melebihi nilai bruto transaksi.');
                return false;
            }
            if (bcaPayment + cashPayment > total) {
                toast.error('Total pembayaran IDR tidak boleh melebihi nilai bruto transaksi.');
                return false;
            }
            return true;
        };

        const buildPayload = (data: {
            bcaPayment: number;
            cashPayment: number;
            bcaPayment2: number;
            paymentDate: string;
            isPaid: boolean;
        }): UpsertUnitBillingPayload | null => {
            if (!companyId) {
                toast.error('Company belum dipilih');
                return null;
            }

            return {
                company_id: String(companyId),
                unit_transaction_id: purchaseId,
                bca_payment: Number(data.bcaPayment ?? 0),
                cash_payment: Number(data.cashPayment ?? 0),
                bca_payment_2: Number(data.bcaPayment2 ?? 0),
                payment_date: data.paymentDate,
                is_paid: Boolean(data.isPaid),
            };
        };

        const handleCreate = async (data: {
            bcaPayment: number;
            cashPayment: number;
            bcaPayment2: number;
            paymentDate: string;
            isPaid: boolean;
        }) => {
        try {
            const bcaPayment = Number(data.bcaPayment ?? 0);
            const cashPayment = Number(data.cashPayment ?? 0);
            const bcaPayment2 = Number(data.bcaPayment2 ?? 0);
            const submittedTotal = bcaPayment + cashPayment + bcaPayment2;
                const paymentState = calculatePaymentState(totalPaid + submittedTotal);
            if (!ensureNonNegativeChannels(totalTagihan, bcaPayment, cashPayment, bcaPayment2)) return;
            if (!ensurePaymentWithinBruto(totalTagihan, totalPaid, submittedTotal)) return;
                        const payload = buildPayload(data);
                        if (!payload) return;
                payload.is_paid = paymentState.isPaid;
                        await createBilling.mutateAsync(payload);
                toast.success("Pembayaran berhasil disimpan")
                } catch (error: any) {
                        toast.error(error?.message || "Gagal menyimpan pembayaran")
                }
        }

        const handleUpdate = async (
            billingId: string,
            data: {
                bcaPayment: number;
                cashPayment: number;
                bcaPayment2: number;
                paymentDate: string;
                isPaid: boolean;
            },
        ) => {
                try {
                const wasPaidBefore = totalPaid >= totalTagihan && totalTagihan > 0;
                const currentBilling = billings.find((item) => item.id === billingId);
                const existingBillingTotal = currentBilling
                    ? Number(currentBilling.bca_payment ?? 0) + Number(currentBilling.cash_payment ?? 0) + Number(currentBilling.bca_payment_2 ?? 0)
                    : 0;
                const bcaPayment = Number(data.bcaPayment ?? 0);
                const cashPayment = Number(data.cashPayment ?? 0);
                const bcaPayment2 = Number(data.bcaPayment2 ?? 0);
                const submittedTotal = bcaPayment + cashPayment + bcaPayment2;
                const paymentState = calculatePaymentState(totalPaid - existingBillingTotal + submittedTotal);
                if (!ensureNonNegativeChannels(totalTagihan, bcaPayment, cashPayment, bcaPayment2)) return;
                if (!ensurePaymentWithinBruto(totalTagihan, totalPaid, submittedTotal, existingBillingTotal)) return;
                        const payload = buildPayload(data);
                        if (!payload) return;
                payload.is_paid = paymentState.isPaid;
                        await updateBilling.mutateAsync({ id: billingId, payload });

                if (!wasPaidBefore && paymentState.isPaid) {
                    toast.success("Pembayaran berhasil diperbarui. Silakan klik Terima Barang pada halaman detail pembelian untuk sinkronisasi stok.")
                    return;
                }

                        toast.success("Pembayaran berhasil diperbarui")
                } catch (error: any) {
                        toast.error(error?.message || "Gagal menyimpan pembayaran")
        }
    }

        if (purchaseLoading || billingLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    if (!purchase) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">Pembelian tidak ditemukan</p>
                    <Button onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
                        Kembali ke List
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-semibold tracking-tight">Pembayaran Unit</h1>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-7 text-xs">
                        <span className="text-muted-foreground">Kode Beli</span>
                        <span className="text-blue-500 font-medium">{purchase.code}</span>
                    </div>
                </div>

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <PurchasePaymentForm
                            purchaseCode={purchase.code}
                            totalTagihan={totalTagihan}
                            totalPaid={totalPaid}
                            remainingPayment={remainingPayment}
                            billings={billings}
                            onCreate={handleCreate}
                            onUpdate={handleUpdate}
                            onCancel={() => router.back()}
                            loading={createBilling.isPending || updateBilling.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
