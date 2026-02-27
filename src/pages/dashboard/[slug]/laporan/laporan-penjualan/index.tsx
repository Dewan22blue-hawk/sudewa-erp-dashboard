"use client"

import LaporanPenjualanFilterCard from "@/components/features/laporan-penjualan/LaporanPenjualanFilterCard"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function LaporanPenjualanPage() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div>
                    <h1 className="text-2xl font-semibold">
                        Laporan Penjualan
                    </h1>
                    <p className="text-sm text-gray-500">
                        Lihat detail laporan penjualan
                    </p>
                </div>

                <LaporanPenjualanFilterCard />

            </div>
        </DashboardLayout>
    )
}