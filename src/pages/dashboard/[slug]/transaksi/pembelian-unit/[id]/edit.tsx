"use client"

import { useRouter } from "next/router"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import PurchaseForm from "@/components/features/purchase/PurchaseForm"
import {
    usePurchaseById,
    useUpdatePurchase
} from "@/hooks/usePurchase"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"

export default function EditPurchasePage() {
    const router = useRouter()
    const { slug, id } = router.query

    const slugStr = Array.isArray(slug) ? slug[0] : slug || ''
    const basePath = slugStr ? `/dashboard/${slugStr}/transaksi/pembelian-unit` : '/transaksi/pembelian-unit'

    const { data, isLoading } = usePurchaseById(id as string)
    const mutation = useUpdatePurchase()

    const handleSubmit = async (formData: any) => {
        try {
            await mutation.mutateAsync({
                id: id as string,
                payload: formData
            })

            toast.success("Data berhasil diperbarui")
            router.push(`${basePath}/${id}`)
        } catch {
            toast.error("Gagal update data")
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <LoadingState variant="page" />
                </div>
            </DashboardLayout>
        )
    }

    const invoiceCode = data?.code ?? ''

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    breadcrumbs={[
                        { label: 'Pembelian Unit', onClick: () => router.push(basePath) },
                        { label: 'Edit Pembelian' }
                    ]}
                    title="Edit Pembelian Unit"
                    subtitle={invoiceCode ? (
                        <>
                            <span>Kode Beli:</span>
                            <span className="text-blue-600 font-medium">{invoiceCode}</span>
                        </>
                    ) : undefined}
                    onBack={() => router.push(basePath)}
                />

                <Card className="rounded-md border border-gray-200 shadow-none">
                    <CardContent className="p-6">
                        <PurchaseForm
                            defaultValues={data}
                            onSubmit={handleSubmit}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

