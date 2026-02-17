import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, CreditCard } from "lucide-react"
import { SALES_DATA } from "@/components/features/sales/sales.data"
import { SalesDetailCards } from "@/components/features/sales/detail/SalesDetailCards"
import { SalesUnitTable } from "@/components/features/sales/detail/SalesUnitTable"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { SalesItem } from "@/components/features/sales/sales.data"

/**
 * Detail Data Penjualan Unit - Image 4
 */
export default function SalesDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const [isLoading, setIsLoading] = useState(true)
    const [salesData, setSalesData] = useState<SalesItem | null>(null)

    useEffect(() => {
        if (!id) return

        const data = SALES_DATA.find(item => item.id === id)
        if (data) {
            setSalesData(data)
        } else {
            toast.error("Data penjualan tidak ditemukan")
            // router.push("/sales") // Comment out for dev/debug easier
        }
        setIsLoading(false)
    }, [id])

    const handleCreateUnit = () => {
        router.push(`/sales/${id}/create-unit`)
    }

    const handlePayment = () => {
        router.push(`/sales/${id}/payment`)
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
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <button
                            onClick={() => router.back()}
                            className="mb-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </button>
                        <h1 className="text-2xl font-semibold">Detail Penjualan Unit</h1>
                        <p className="text-sm text-blue-600 font-medium">
                            Kode Jual {salesData.kodeJual}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePayment}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Bayar
                        </Button>
                        <Button size="sm" onClick={handleCreateUnit}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Unit
                        </Button>
                    </div>
                </div>

                {/* 3 Info Cards */}
                <SalesDetailCards data={salesData} />

                {/* Detail Unit Table */}
                <SalesUnitTable units={salesData.units} salesId={salesData.id} />
            </div>
        </DashboardLayout>
    )
}
