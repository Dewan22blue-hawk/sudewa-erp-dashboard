import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import PembayaranHutangDetailHeader from "@/components/features/pembayaran-hutang/PembayaranHutangDetailHeader"
import PembayaranHutangListTable from "@/components/features/pembayaran-hutang/PembayaranHutangListTable"
import { PembayaranHutangService } from "@/services/pembayaran-hutang.service"
import { PembayaranHutangDetail } from "@/types/pembayaran-hutang.types"

export default function PembayaranHutangDetailPage() {
    const router = useRouter()
    const { id } = router.query as { id: string }
    const [data, setData] = useState<PembayaranHutangDetail | null>(null)

    useEffect(() => {
        if (!id) return

        // In real app, this ID usually refers to the Purchase ID or Payment ID depending on architecture
        // Here we simulate getting Detail by ID
        const result = PembayaranHutangService.getById(id)
        setData(result)
    }, [id])

    if (!data) return null

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PembayaranHutangDetailHeader data={data} />
                <PembayaranHutangListTable data={data.historyPembayaran} />
            </div>
        </DashboardLayout>
    )
}
