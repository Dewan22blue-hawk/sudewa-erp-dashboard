"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPenjualan } from "@/services/laporan-penjualan.service"
import LaporanPenjualanHeaderAction from "@/components/features/laporan-penjualan/LaporanPenjualanHeaderAction"
import LaporanPenjualanPerNotaView from "@/components/features/laporan-penjualan/LaporanPenjualanPerNotaView"
import LaporanPenjualanPerTypeView from "@/components/features/laporan-penjualan/LaporanPenjualanPerTypeView"
import LaporanPenjualanPerSupplierView from "@/components/features/laporan-penjualan/LaporanPenjualanPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DetailLaporanPenjualanPage() {
    const params = useParams()
    const router = useRouter()
    const search = useSearchParams()

    const type = params?.type as string
    const slug = params?.slug as string

    const awal = search.get("awal") || ""
    const akhir = search.get("akhir") || ""

    const { data } = useQuery({
        queryKey: ["laporan-penjualan", type, awal, akhir],
        queryFn: () =>
            getLaporanPenjualan({
                jenis: type as any,
                periodeAwal: awal,
                periodeAkhir: akhir,
            }),
    })

    const getReportTitle = () => {
        switch (type) {
            case "per-nota": return "Laporan Penjualan Per Nota"
            case "per-type": return "Laporan Penjualan Per Type"
            case "per-supplier": return "Laporan Penjualan Per Supplier"
            default: return "Laporan Penjualan"
        }
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/dashboard/${slug}/laporan/laporan-penjualan`)}
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {getReportTitle()}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Lihat detail laporan penjualan
                            </p>
                        </div>
                    </div>

                    <LaporanPenjualanHeaderAction />
                </div>

                {type === "per-nota" && (
                    <LaporanPenjualanPerNotaView data={(data as any) || []} />
                )}

                {type === "per-type" && (
                    <LaporanPenjualanPerTypeView data={(data as any) || []} />
                )}

                {type === "per-supplier" && (
                    <LaporanPenjualanPerSupplierView data={(data as any) || []} />
                )}

            </div>
        </DashboardLayout>
    )
}