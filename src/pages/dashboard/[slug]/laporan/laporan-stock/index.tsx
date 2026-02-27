"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import LaporanStockFilterCard from "@/components/features/laporan-stock/LaporanStockFilterCard"

export default function LaporanStockPage() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Laporan Stock</h1>
                    <p className="text-sm text-gray-500">
                        Lihat detail laporan stock gudang dan order transaksi
                    </p>
                </div>

                <LaporanStockFilterCard />
            </div>
        </DashboardLayout>
    )
}
