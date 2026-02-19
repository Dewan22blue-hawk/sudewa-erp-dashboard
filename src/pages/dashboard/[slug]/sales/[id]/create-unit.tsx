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
 * Tambah Unit Page - Nested under Sales Detail
 */
export default function CreateUnitPage() {
    const router = useRouter()
    const { id } = router.query
    const [invoiceCode, setInvoiceCode] = useState("")

    useEffect(() => {
        if (!id) return

        const item = SALES_DATA.find(d => d.id === id)
        if (item) {
            setInvoiceCode(item.kodeJual)
        }
    }, [id])

    const handleSubmit = async (data: EditUnitFormData) => {
        try {
            console.log("=== ADD UNIT DATA ===")
            console.log("Sales ID:", id)
            console.log("Form Data:", data)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success("Unit berhasil ditambahkan!")
            router.push(`/sales/${id}`)

        } catch (error) {
            console.error("Error adding unit:", error)
            toast.error("Gagal menambahkan unit.")
        }
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
                            <span className="text-muted-foreground">Kode Jual</span>
                            <span className="text-blue-600 font-medium">{invoiceCode}</span>
                        </div>
                    </div>
                </div>

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <EditUnitForm
                            defaultValues={{
                                tipeUnit: "",
                                qty: 1,
                                harga: 0,
                                biayaBbn: 0,
                                biayaEkspedisi: 0,
                                biayaLain: 0,
                                totalHpp: 0,
                                totalDpp: 0,
                                totalPpn: 0,
                                hppSatuan: 0,
                                dppSatuan: 0,
                                ppnSatuan: 0,
                            }}
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
