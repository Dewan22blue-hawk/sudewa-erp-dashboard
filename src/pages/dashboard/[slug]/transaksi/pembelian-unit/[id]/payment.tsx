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
    const { slug, id } = router.query
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
