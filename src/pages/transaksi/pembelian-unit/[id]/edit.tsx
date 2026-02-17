"use client"

import { useRouter } from "next/router"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import PurchaseForm from "@/components/features/purchase/PurchaseForm"
import {
    usePurchaseById,
    useUpdatePurchase
} from "@/hooks/usePurchase"

export default function EditPurchasePage() {
    const router = useRouter()
    const { id } = router.query

    const { data, isLoading } = usePurchaseById(id as string)
    const mutation = useUpdatePurchase()

    const handleSubmit = async (formData: any) => {
        try {
            await mutation.mutateAsync({
                id: id as string,
                payload: formData
            })

            toast.success("Data berhasil diperbarui")
            router.push(
                `/transaksi/pembelian-unit/${id}/detail`
            )
        } catch {
            toast.error("Gagal update data")
        }
    }

    if (isLoading) return <DashboardLayout>Loading...</DashboardLayout>

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div>
                    <h1 className="text-xl font-semibold">
                        Edit Pembelian Unit
                    </h1>
                </div>

                <PurchaseForm
                    defaultValues={data}
                    onSubmit={handleSubmit}
                />
            </div>
        </DashboardLayout>
    )
}
