"use client"

import LaporanPembelianFilterCard from "@/components/features/laporan-pembelian/LaporanPembelianFilterCard"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function LaporanPembelianPage() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div>
                    <h1 className="text-2xl font-semibold">
                        Laporan Pembelian
                    </h1>
                    <p className="text-sm text-gray-500">
                        Lihat detail laporan pembelian
                    </p>
                </div>

                <LaporanPembelianFilterCard />

            </div>
        </DashboardLayout>
    )
}