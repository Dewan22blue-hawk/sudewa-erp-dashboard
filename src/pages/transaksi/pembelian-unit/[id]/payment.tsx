"use client"

import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PurchasePaymentForm } from "@/components/features/purchase/PurchasePaymentForm"
import { usePurchaseById, useUpdatePayment } from "@/hooks/usePurchase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function PurchasePaymentPage() {
    const router = useRouter()
    const { id } = router.query
    const { data: purchase, isLoading } = usePurchaseById(id as string)
    const updatePayment = useUpdatePayment()

    const handleSubmit = async (data: any) => {
        try {
            await updatePayment.mutateAsync({
                id: id as string,
                payload: {
                    bca: data.paymentBca,
                    bcaUsd: data.paymentBcaUsd,
                    cash: data.paymentCash,
                },
            })
            toast.success("Pembayaran berhasil disimpan")
            router.back()
        } catch {
            toast.error("Gagal menyimpan pembayaran")
        }
    }

    if (isLoading) {
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
                    <Button onClick={() => router.push("/transaksi/pembelian-unit")}>
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
                    <button
                        onClick={() => router.back()}
                        className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>

                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">Pembayaran Unit</h1>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Kode Pembelian</span>
                            <span className="text-blue-600 font-medium">{purchase.code}</span>
                        </div>
                    </div>
                </div>

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <PurchasePaymentForm
                            purchaseData={purchase}
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                            loading={updatePayment.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
