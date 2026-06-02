"use client"

import { useState } from 'react';
import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PaymentFormData, PurchasePaymentForm } from "@/components/features/purchase/PurchasePaymentForm"
import { usePurchaseById } from '@/hooks/useUnitTransaction';
import {
    useBillingHistory,
    useBillingValidation,
    useCreateBillingHistory,
    useCreateBillingV2,
    useCurrentBilling,
} from '@/hooks/useUnitBilling';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const readApiError = (error: any): string => {
    const stringifyDetail = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    };

    const details = error?.details ?? error?.response?.data?.errors;
    if (typeof details === 'string' && details.trim()) return details;
    if (details && typeof details === 'object') {
        const text = Object.entries(details)
            .map(([field, value]) => {
                if (Array.isArray(value)) {
                    return `${field}: ${value.map((item) => stringifyDetail(item)).join(' | ')}`;
                }
                return `${field}: ${stringifyDetail(value)}`;
            })
            .join(', ')
            .trim();
        if (text) return text;
    }
    return error?.response?.data?.message || error?.message || 'Unexpected server error';
};

const readCheckRightAmountError = (error: any): string => {
    const payload = error?.response?.data ?? {};
    const errors = payload?.errors ?? error?.details;

    const invalidItems = errors?.invalid_items;
    const summary = errors?.summary;
    const hint = errors?.hint;

    if (!invalidItems && !summary && !hint) {
        return readApiError(error);
    }

    const invalidArray = Array.isArray(invalidItems)
        ? invalidItems
        : Array.isArray(summary)
            ? summary.filter((item: any) => item?.is_valid === false)
            : [];

    if (invalidArray.length === 0) {
        return hint ? `Validasi billing gagal. ${String(hint)}` : 'Validasi billing gagal. Lengkapi detail unit terlebih dahulu.';
    }

    const detailText = invalidArray
        .map((item: any) => {
            const itemId = item?.item_id ?? item?.unit_transaction_item_id ?? '-';
            const diff = item?.difference ?? (Number(item?.qty_input ?? 0) - Number(item?.qty_actual ?? 0));
            return `Item ${itemId}: kurang ${Number(diff) > 0 ? Number(diff) : 0} unit`;
        })
        .join('; ');

    return `Pembayaran belum bisa diproses. Detail unit belum lengkap -> ${detailText}.`;
};

const getInvalidItemIds = (error: any): string[] => {
    const payload = error?.response?.data ?? {};
    const errors = payload?.errors ?? error?.details;

    const invalidItems = Array.isArray(errors?.invalid_items) ? errors.invalid_items : [];
    const summaryItems = Array.isArray(errors?.summary)
        ? errors.summary.filter((item: any) => item?.is_valid === false)
        : [];

    const idsFromInvalid = invalidItems
        .map((item: any) => item?.item_id ?? item?.unit_transaction_item_id)
        .filter((id: any) => id !== undefined && id !== null)
        .map((id: any) => String(id));

    const idsFromSummary = summaryItems
        .map((item: any) => item?.item_id ?? item?.unit_transaction_item_id)
        .filter((id: any) => id !== undefined && id !== null)
        .map((id: any) => String(id));

    return Array.from(new Set([...idsFromInvalid, ...idsFromSummary]));
};

export default function PurchasePaymentPage() {
    const router = useRouter()
    const { slug, id } = router.query
        const purchaseId = String(id ?? '');
        const { companyId } = useCompany();
        const { data: purchase, isLoading: purchaseLoading } = usePurchaseById(purchaseId)
        const { refetch: revalidateAmount } = useBillingValidation(
            companyId ? String(companyId) : undefined,
            purchaseId,
            { enabled: false },
        );
        const { data: currentBilling, isLoading: billingLoading, refetch: refetchCurrentBilling } = useCurrentBilling(purchaseId);
        const billingId = String(currentBilling?.id ?? '');
        const { data: billingHistories = [], isLoading: historyLoading, refetch: refetchBillingHistory } = useBillingHistory(billingId || undefined, purchaseId);
        const createBilling = useCreateBillingV2();
        const createBillingHistory = useCreateBillingHistory();
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [validationMessage, setValidationMessage] = useState<string | undefined>(undefined);

        const purchaseBruto = Number(purchase?.unit_transaction_bruto_total ?? purchase?.unit_transaction_item_bruto_total ?? 0);
        const billingGrandTotal = Number(currentBilling?.grand_total ?? 0);
        const totalTagihan = billingGrandTotal > 0 ? billingGrandTotal : purchaseBruto;
        const totalPpn = Number((purchase as any)?.unit_transaction_item_total_ppn ?? (purchase as any)?.transaction_ppn_total ?? (purchase as any)?.unit_transaction_ppn_total ?? 0);

        const historyPaid = (billingHistories ?? []).reduce(
            (acc, item) => acc + Number(item.bca_payment_amount ?? 0) + Number(item.cash_payment_amount ?? 0) + Number(item.bca_payment_usd_amount ?? 0),
            0,
        );
        const totalPaidFromBilling = Number(currentBilling?.total_paid ?? (Number(currentBilling?.bca_payment ?? 0) + Number(currentBilling?.cash_payment ?? 0) + Number(currentBilling?.bca_payment_2 ?? 0)));
        const totalPaid = currentBilling?.is_paid ? Math.max(totalPaidFromBilling, historyPaid) : historyPaid;

        const ensureBaseData = () => {
            if (!companyId) {
                toast.error('Company belum dipilih');
                return false;
            }
            if (!purchaseId) {
                toast.error('ID transaksi tidak valid');
                return false;
            }
            return true;
        };

        const handleSubmitPayment = async (data: PaymentFormData) => {
            if (!ensureBaseData()) return;

            setIsSubmitting(true);
            setValidationMessage(undefined);
            try {
                const refreshedBilling = await refetchCurrentBilling();
                const latestBilling = refreshedBilling.data ?? currentBilling;
                const latestGrandTotal = Number(latestBilling?.grand_total ?? totalTagihan);
                const latestPaid = Number(latestBilling?.total_paid ?? totalPaid);
                const latestRemaining = latestBilling?.is_paid
                    ? 0
                    : Math.max(0, Number(latestBilling?.remaining_payment ?? (latestGrandTotal - latestPaid)));

                const inputPayment = Number(data.bcaPayment ?? 0) + Number(data.cashPayment ?? 0) + Number(data.bcaPayment2 ?? 0);
                if (inputPayment > latestRemaining) {
                    throw new Error('Nominal pembayaran melebihi total bruto/tagihan transaksi.');
                }

                const validationResult = await revalidateAmount();
                if (validationResult.error) {
                    const message = readCheckRightAmountError(validationResult.error);
                    setValidationMessage(message);
                    const invalidItemIds = getInvalidItemIds(validationResult.error);

                    if (invalidItemIds.length > 0) {
                        toast.error(message, {
                            action: {
                                label: 'Lengkapi Detail',
                                onClick: () => {
                                    router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchaseId}/unit/${invalidItemIds[0]}`);
                                },
                            },
                        });
                        return;
                    }

                    throw new Error(message);
                }

                let billing = latestBilling ?? currentBilling;
                if (!billing) {
                    try {
                        billing = await createBilling.mutateAsync({
                            company_id: String(companyId),
                            unit_transaction_id: purchaseId,
                            is_paid: false,
                        });
                    } catch (err: any) {
                        const statusCode = err?.statusCode ?? err?.response?.status;
                        if (statusCode === 422) {
                            const existing = await refetchCurrentBilling();
                            billing = existing.data ?? null;
                        } else {
                            throw err;
                        }
                    }
                }

                if (!billing?.id) {
                    const createdSnapshot = await refetchCurrentBilling();
                    billing = createdSnapshot.data ?? billing ?? null;
                }

                if (!billing?.id) {
                    throw new Error('Billing utama tidak ditemukan.');
                }

                await createBillingHistory.mutateAsync({
                    unit_transaction_billing_id: String(billing.id),
                    bca_payment_amount: Number(data.bcaPayment ?? 0),
                    cash_payment_amount: Number(data.cashPayment ?? 0),
                    bca_payment_usd_amount: Number(data.bcaPayment2 ?? 0),
                    payment_at: data.paymentDate,   
                    note: data.note,
                });

                await Promise.all([refetchCurrentBilling(), refetchBillingHistory(), revalidateAmount()]);
                toast.success('Pembayaran berhasil disimpan ke histori');
            } catch (error: any) {
                const message = readApiError(error);
                if (message.toLowerCase().includes('total payment exceeds grand total')) {
                    toast.error('Nominal pembayaran melebihi sisa tagihan saat ini. Silakan refresh lalu gunakan nominal sesuai Sisa Bayar.');
                    return;
                }
                toast.error(message);
            } finally {
                setIsSubmitting(false);
            }
        }

        if (purchaseLoading || billingLoading || historyLoading) {
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
                            totalPpn={totalPpn}
                            billing={currentBilling ?? null}
                            histories={billingHistories}
                            onSubmitPayment={handleSubmitPayment}
                            onCancel={() => router.back()}
                            loading={isSubmitting || createBilling.isPending || createBillingHistory.isPending}
                            canSubmit={true}
                            validationMessage={validationMessage}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
