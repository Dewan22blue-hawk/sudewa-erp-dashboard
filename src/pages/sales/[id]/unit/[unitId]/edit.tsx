import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { EditUnitForm } from "@/components/features/sales/edit/EditUnitForm"
import { EditUnitFormData } from "@/components/features/sales/edit/edit-unit.schema"
import { SALES_DATA } from "@/components/features/sales/sales.data"
import { useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * Edit Unit Page - Nested under Sales Detail
 */
export default function EditNestedUnitPage() {
    const router = useRouter()
    const { id, unitId } = router.query
    const [invoiceCode, setInvoiceCode] = useState("")
    const [formData, setFormData] = useState<EditUnitFormData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!id || !unitId) return

        const item = SALES_DATA.find(d => d.id === id)
        if (item) {
            setInvoiceCode(item.kodeJual)

            // Find specific unit data if available, or mock it based on parent
            // In real app, we fetch /api/sales/{id}/unit/{unitId}
            const unit = item.units.find(u => u.id === unitId)

            if (unit) {
                // Determine mock values for form based on unit or parent
                // Ideally `unit` object should have all these fields. 
                // Since our mock `UnitItem` is limited, we use parent totals / qty or defaults

                setFormData({
                    tipeUnit: item.tipeUnit,
                    qty: 1, // Editing single unit usually involves qty 1 or the specific qty of that row
                    harga: item.hargaSatuan,

                    biayaBbn: item.biayaBbn / item.qty,
                    biayaEkspedisi: item.biayaEkspedisi / item.qty,
                    biayaLain: item.biayaLain / item.qty,

                    totalHpp: item.totalHpp / item.qty,
                    totalDpp: item.totalDpp / item.qty,
                    totalPpn: item.totalPpn / item.qty,

                    hppSatuan: item.totalHpp / item.qty,
                    dppSatuan: item.totalDpp / item.qty,
                    ppnSatuan: item.totalPpn / item.qty,
                })
            } else {
                toast.error("Unit tidak ditemukan")
                router.push(`/sales/${id}`)
            }
        }
        setIsLoading(false)
    }, [id, unitId, router])

    const handleSubmit = async (data: EditUnitFormData) => {
        try {
            console.log("=== UPDATE UNIT DATA ===")
            console.log("Sales ID:", id)
            console.log("Unit ID:", unitId)
            console.log("Form Data:", data)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success("Unit berhasil diperbarui!")
            router.push(`/sales/${id}`)

        } catch (error) {
            console.error("Error updating unit:", error)
            toast.error("Gagal memperbarui unit.")
        }
    }

    if (isLoading || !formData) {
        return (
            <DashboardLayout>
                <div className="p-6">Loading unit data...</div>
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
                        <h1 className="text-2xl font-bold tracking-tight">Edit Unit</h1>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Kode Jual</span>
                            <span className="text-blue-600 font-medium">{invoiceCode}</span>
                        </div>
                    </div>
                </div>

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <EditUnitForm
                            defaultValues={formData}
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
