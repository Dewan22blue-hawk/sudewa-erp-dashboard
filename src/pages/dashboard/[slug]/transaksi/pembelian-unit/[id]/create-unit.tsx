"use client"

import { useRouter } from "next/router"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import PurchaseUnitForm from "@/components/features/purchase/PurchaseUnitForm"
import { useAddPurchaseUnit, usePurchaseById } from "@/hooks/usePurchase"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function CreatePurchaseUnitPage() {
    const router = useRouter()
    const { slug, id } = router.query

    const { data: purchase, isLoading } = usePurchaseById(id as string)
    const addUnitMutation = useAddPurchaseUnit()

    const handleSubmit = async (data: any) => {
        try {
            await addUnitMutation.mutateAsync({
                purchaseId: id as string,
                ...data
            })
            toast.success("Unit berhasil ditambahkan")
            router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${id}`)
        } catch (error) {
            toast.error("Gagal menambahkan unit")
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
                        <h1 className="text-2xl font-bold tracking-tight">Tambah Unit</h1>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Kode Pembelian</span>
                            <span className="text-blue-600 font-medium">{purchase?.code}</span>
                        </div>
                    </div>
                </div>

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <PurchaseUnitForm
                            onSubmit={handleSubmit}
                            // need to update PurchaseUnitForm to accept these
                            onCancel={() => router.back()}
                            loading={addUnitMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
