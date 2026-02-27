"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import LaporanPenerimaanFilterCard from "@/components/features/laporan-penerimaan/LaporanPenerimaanFilterCard"

export default function LaporanPenerimaanPage() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Laporan Penerimaan</h1>
                    <p className="text-sm text-gray-500">
                        Lihat detail laporan penerimaan barang
                    </p>
                </div>

                <LaporanPenerimaanFilterCard />
            </div>
        </DashboardLayout>
    )
}
