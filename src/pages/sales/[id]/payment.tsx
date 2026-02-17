import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { PaymentForm } from "@/components/features/sales/payment/PaymentForm"
import { SALES_DATA } from "@/components/features/sales/sales.data"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { SalesItem } from "@/components/features/sales/sales.data"

/**
 * Pembayaran Unit Page
 */
export default function PaymentPage() {
    const router = useRouter()
    const { id } = router.query
    const [isLoading, setIsLoading] = useState(true)
    const [salesData, setSalesData] = useState<SalesItem | null>(null)

    useEffect(() => {
        if (!id) return

        const item = SALES_DATA.find(d => d.id === id)
        if (item) {
            setSalesData(item)
        } else {
            toast.error("Data penjualan tidak ditemukan")
            // router.push("/sales")
        }
        setIsLoading(false)
    }, [id])

    const handleSubmit = async (data: any) => {
        try {
            console.log("=== PAYMENT DATA ===")
            console.log("Sales ID:", id)
            console.log("Payment Data:", data)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success("Pembayaran berhasil disimpan!")
            router.push(`/sales/${id}`)

        } catch (error) {
            console.error("Error saving payment:", error)
            toast.error("Gagal menyimpan pembayaran.")
        }
    }

    if (isLoading || !salesData) {
        return (
            <DashboardLayout>
                <div className="p-6">Loading data...</div>
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
                            <span className="text-muted-foreground">Kode Jual</span>
                            <span className="text-blue-600 font-medium">{salesData.kodeJual}</span>
                        </div>
                    </div>
                </div>

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <PaymentForm
                            salesData={salesData}
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
