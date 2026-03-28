"use client"

import { useMemo } from 'react';
import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PurchasePaymentForm } from "@/components/features/purchase/PurchasePaymentForm"
import { usePurchaseById, useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { useCreateBilling, useUnitBillings, useUpdateBilling } from '@/hooks/useUnitBilling';
import { UpsertUnitBillingPayload } from '@/@types/unit-billing.types';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const PURCHASE_RECEIPT_STATE = 'receipt';

export default function PurchasePaymentPage() {
    const router = useRouter()
    const { slug, id } = router.query
        const purchaseId = String(id ?? '');
        const { companyId } = useCompany();
        const { data: purchase, isLoading: purchaseLoading } = usePurchaseById(purchaseId)
        const { data: billings = [], isLoading: billingLoading } = useUnitBillings(purchaseId);
        const createBilling = useCreateBilling();
        const updateBilling = useUpdateBilling();
        const updateState = useUpdateUnitTransactionState();

        const totalTagihan = Number(purchase?.unit_transaction_item_bruto_total ?? 0);
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

        const syncPurchaseReceiptState = async (shouldMoveToReceipt: boolean) => {
            if (!shouldMoveToReceipt || !purchaseId) return;
            if (purchase?.stock_state === PURCHASE_RECEIPT_STATE) return;

            try {
                await updateState.mutateAsync({
                    id: purchaseId,
                    state: PURCHASE_RECEIPT_STATE,
                });
                toast.success('Status pembelian diperbarui ke receipt');
            } catch (error: any) {
                toast.error(error?.message || 'Payment tersimpan, namun update state gagal', {
                    action: {
                        label: 'Retry',
                        onClick: () => {
                            void syncPurchaseReceiptState(true);
                        },
                    },
                });
            }
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
                const submittedTotal = Number(data.bcaPayment ?? 0) + Number(data.cashPayment ?? 0) + Number(data.bcaPayment2 ?? 0);
                const paymentState = calculatePaymentState(totalPaid + submittedTotal);
                        const payload = buildPayload(data);
                        if (!payload) return;
                payload.is_paid = paymentState.isPaid;
                        await createBilling.mutateAsync(payload);
            toast.success("Pembayaran berhasil disimpan")
                await syncPurchaseReceiptState(paymentState.isPaid);
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
                const currentBilling = billings.find((item) => item.id === billingId);
                const existingBillingTotal = currentBilling
                    ? Number(currentBilling.bca_payment ?? 0) + Number(currentBilling.cash_payment ?? 0) + Number(currentBilling.bca_payment_2 ?? 0)
                    : 0;
                const submittedTotal = Number(data.bcaPayment ?? 0) + Number(data.cashPayment ?? 0) + Number(data.bcaPayment2 ?? 0);
                const paymentState = calculatePaymentState(totalPaid - existingBillingTotal + submittedTotal);
                        const payload = buildPayload(data);
                        if (!payload) return;
                payload.is_paid = paymentState.isPaid;
                        await updateBilling.mutateAsync({ id: billingId, payload });
                        toast.success("Pembayaran berhasil diperbarui")
                await syncPurchaseReceiptState(paymentState.isPaid);
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
                            loading={createBilling.isPending || updateBilling.isPending || updateState.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
