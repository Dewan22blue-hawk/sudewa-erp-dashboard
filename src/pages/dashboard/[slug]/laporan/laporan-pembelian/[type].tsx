"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPembelian } from "@/services/laporan-pembelian.service"
import LaporanPembelianHeaderAction from "@/components/features/laporan-pembelian/LaporanPembelianHeaderAction"
import LaporanPembelianPerNotaView from "@/components/features/laporan-pembelian/LaporanPembelianPerNotaView"
import LaporanPembelianPerTypeView from "@/components/features/laporan-pembelian/LaporanPembelianPerTypeView"
import LaporanPembelianPerSupplierView from "@/components/features/laporan-pembelian/LaporanPembelianPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DetailLaporanPembelianPage() {
    const params = useParams()
    const router = useRouter()
    const search = useSearchParams()

    const type = params?.type as string
    const slug = params?.slug as string

    const awal = search.get("awal") || ""
    const akhir = search.get("akhir") || ""

    const { data } = useQuery({
        queryKey: ["laporan-pembelian", type, awal, akhir],
        queryFn: () =>
            getLaporanPembelian({
                start_date: awal,
                end_date: akhir,
            }),
    })

    const getReportTitle = () => {
        switch (type) {
            case "per-nota": return "Laporan Pembelian Per Nota"
            case "per-type": return "Laporan Pembelian Per Type"
            case "per-supplier": return "Laporan Pembelian Per Supplier"
            default: return "Laporan Pembelian"
        }
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/dashboard/${slug}/laporan/laporan-pembelian`)}
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {getReportTitle()}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Lihat detail laporan pembelian
                            </p>
                        </div>
                    </div>

                    <LaporanPembelianHeaderAction />
                </div>

                {type === "per-nota" && (
                    <LaporanPembelianPerNotaView data={(data as any) || []} />
                )}

                {type === "per-type" && (
                    <LaporanPembelianPerTypeView data={(data as any) || []} />
                )}

                {type === "per-supplier" && (
                    <LaporanPembelianPerSupplierView data={(data as any) || []} />
                )}

            </div>
        </DashboardLayout>
    )
}