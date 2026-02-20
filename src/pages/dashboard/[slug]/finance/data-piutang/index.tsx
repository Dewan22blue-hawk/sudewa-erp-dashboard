"use client"

import PiutangTable from "@/components/features/piutang/PiutangTable"
import { usePiutang } from "@/hooks/usePiutang"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DataPiutangPage() {
    const { data } = usePiutang()

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Data Piutang</h1>
                    <p className="text-sm text-gray-500">
                        Kelola data pembayaran piutang
                    </p>
                </div>

                {/* Table */}
                <PiutangTable data={data} />
            </div>
        </DashboardLayout>
    )
}
