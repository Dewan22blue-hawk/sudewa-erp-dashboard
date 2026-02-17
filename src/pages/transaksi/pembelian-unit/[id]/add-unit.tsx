"use client"

import { useRouter } from "next/router"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import PurchaseUnitForm from "@/components/features/purchase/PurchaseUnitForm"
import { useAddPurchaseUnit } from "@/hooks/usePurchase"

export default function AddUnitPage() {
    const router = useRouter()
    const { id } = router.query
    const mutation = useAddPurchaseUnit()

    const handleSubmit = async (formData: any) => {
        try {
            await mutation.mutateAsync({
                purchaseId: id as string,
                ...formData
            })

            toast.success("Unit berhasil ditambahkan")
            router.push(`/transaksi/pembelian-unit/${id}/detail`)
        } catch {
            toast.error("Gagal menambahkan unit")
        }
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div>
                    <h1 className="text-xl font-semibold">
                        Tambah Unit Pembelian
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Masukkan detail unit
                    </p>
                </div>

                <PurchaseUnitForm onSubmit={handleSubmit} />
            </div>
        </DashboardLayout>
    )
}
