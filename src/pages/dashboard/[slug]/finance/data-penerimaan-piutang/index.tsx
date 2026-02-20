import { usePenerimaanPiutang } from "@/hooks/usePenerimaanPiutang"
import PenerimaanPiutangTable from "@/components/features/penerimaan-piutang/PenerimaanPiutangTable"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DataPenerimaanPiutangPage() {
    const { data, loading } = usePenerimaanPiutang()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Data Penerimaan Piutang
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola data penerimaan piutang
                    </p>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <PenerimaanPiutangTable data={data} />
                )}
            </div>
        </DashboardLayout>
    )
}
