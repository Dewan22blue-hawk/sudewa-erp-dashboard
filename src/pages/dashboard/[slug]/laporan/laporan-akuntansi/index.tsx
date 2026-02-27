"use client"

import LaporanFilterCard from "@/components/features/laporan/LaporanFilterCard"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function LaporanAkuntansiPage() {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Laporan Akuntansi
                    </h1>
                    <p className="text-sm text-gray-500">
                        Lihat detail laporan akuntansi
                    </p>
                </div>

                <LaporanFilterCard />
            </div>
        </DashboardLayout>
    )
}