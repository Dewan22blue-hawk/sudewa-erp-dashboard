import { useHutang } from "@/hooks/useHutang"
import HutangTable from "@/components/features/hutang/HutangTable"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DataHutangPage() {
    const { data } = useHutang()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Data Hutang</h1>
                    <p className="text-sm text-gray-500">Kelola data hutang</p>
                </div>

                <HutangTable data={data || []} />
            </div>
        </DashboardLayout>
    )
}
