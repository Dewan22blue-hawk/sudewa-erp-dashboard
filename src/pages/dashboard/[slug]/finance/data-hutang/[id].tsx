import { useRouter } from "next/router"
import { useHutangDetail, useHutangPayments } from "@/hooks/useHutang"
import BayarHutangDialog from "@/components/features/hutang/BayarHutangDialog"
import HutangPaymentTable from "@/components/features/hutang/HutangPaymentTable"
import HutangDetailHeader from "@/components/features/hutang/HutangDetailHeader"
import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Wallet } from "lucide-react"

export default function HutangDetailPage() {
    const router = useRouter()
    const { id } = router.query as { id: string }

    const { data } = useHutangDetail(id)
    const { data: payments } = useHutangPayments(id)

    const [open, setOpen] = useState(false)

    if (!data) return null

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Data Hutang</h1>
                            <div className="flex gap-1 text-sm text-gray-500">
                                <span>No Pembelian</span>
                                <span className="text-blue-600">{data.noPembelian}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-green-500 hover:bg-green-600 text-white gap-2"
                    >
                        <Wallet size={16} />
                        Bayar
                    </Button>
                </div>

                <HutangDetailHeader data={data} />

                <HutangPaymentTable data={payments || []} />

                <BayarHutangDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    hutangId={id}
                />
            </div>
        </DashboardLayout >
    )
}
