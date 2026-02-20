import { DashboardLayout } from "@/components/layout/DashboardLayout"
import PembayaranHutangTable from "@/components/features/pembayaran-hutang/PembayaranHutangTable"
import { usePembayaranHutang } from "@/hooks/usePembayaranHutang"

export default function DataPembayaranHutangPage() {
    const { data, loading } = usePembayaranHutang()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Data Pembayaran Hutang
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola data pembayaran hutang
                    </p>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <PembayaranHutangTable data={data} />
                )}
            </div>
        </DashboardLayout>
    )
}
