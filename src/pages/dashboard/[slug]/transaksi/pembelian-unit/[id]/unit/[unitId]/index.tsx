import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PurchaseDetailCards } from "@/components/features/purchase/PurchaseDetailCards"
import PurchaseUnitTable from "@/components/features/purchase/PurchaseUnitTable"
import { usePurchaseById } from "@/hooks/usePurchase"
import { toast } from "sonner"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function UnitPurchaseDetailPage() {
    const router = useRouter()
    const { slug, id, unitId } = router.query

    // Using existing hook logic - typically we'd fetch specific unit or parent.
    // For parity with Sales mock, we fetch parent Purchase.
    const { data: purchase, isLoading } = usePurchaseById(id as string)

    useEffect(() => {
        if (!isLoading && !purchase) {
            toast.error("Data pembelian tidak ditemukan")
            router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)
        }
    }, [isLoading, purchase, router, slug])

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
                    <p className="text-muted-foreground">Data tidak ditemukan</p>
                    <Button onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
                        Kembali ke List
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <button
                            onClick={() => router.back()}
                            className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Detail Pembelian Unit</h1>
                        <p className="text-sm text-muted-foreground">
                            Invoice <span className="text-blue-600 font-medium cursor-pointer hover:underline">{purchase.code}</span>
                        </p>
                    </div>
                </div>

                {/* 3 Info Cards (Reusing Component) */}
                <PurchaseDetailCards data={purchase} />

                {/* Detail Unit Table (Reusing Component) */}
                <PurchaseUnitTable
                    units={purchase.units}
                    purchaseId={purchase.id}
                    slug={slug as string}
                />
            </div>
        </DashboardLayout>
    )
}
