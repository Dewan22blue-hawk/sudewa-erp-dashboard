"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPenerimaan } from "@/services/laporan-penerimaan.service"
import LaporanPenerimaanHeaderAction from "@/components/features/laporan-penerimaan/LaporanPenerimaanHeaderAction"
import LaporanPenerimaanPerNotaView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerNotaView"
import LaporanPenerimaanPerTypeView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerTypeView"
import LaporanPenerimaanPerSupplierView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DetailLaporanPenerimaanPage() {
    const params = useParams()
    const router = useRouter()
    const search = useSearchParams()

    const type = params?.type as string
    const slug = params?.slug as string

    const awal = search.get("awal") || ""
    const akhir = search.get("akhir") || ""

    const { data } = useQuery({
        queryKey: ["laporan-penerimaan", type, awal, akhir],
        queryFn: () =>
            getLaporanPenerimaan({
                start_date: awal,
                end_date: akhir,
            } as any),
    })

    const getReportTitle = () => {
        switch (type) {
            case "per-nota": return "Laporan Penerimaan Per Nota"
            case "per-type": return "Laporan Penerimaan Per Type"
            case "per-supplier": return "Laporan Penerimaan Per Supplier"
            default: return "Laporan Penerimaan"
        }
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/dashboard/${slug}/laporan/laporan-penerimaan`)}
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {getReportTitle()}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Lihat detail laporan penerimaan barang
                            </p>
                        </div>
                    </div>

                    <LaporanPenerimaanHeaderAction />
                </div>

                {type === "per-nota" && (
                    <LaporanPenerimaanPerNotaView data={(data as any) || []} />
                )}

                {type === "per-type" && (
                    <LaporanPenerimaanPerTypeView data={(data as any) || []} />
                )}

                {type === "per-supplier" && (
                    <LaporanPenerimaanPerSupplierView data={(data as any) || []} />
                )}

            </div>
        </DashboardLayout>
    )
}
