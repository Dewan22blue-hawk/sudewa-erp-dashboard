import RefundJualTable from "@/components/features/refund-jual/RefundJualTable"
import { useRefundJual } from "@/hooks/useRefundJual"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useRouter } from "next/router"

export default function RefundJualPage() {
    const { data = [], isLoading } = useRefundJual()

    if (isLoading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Data Refund Penjualan
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola arus transaksi refund penjualan
                    </p>
                </div>

                <RefundJualTable data={data} />
            </div>
        </DashboardLayout>
    )
}
