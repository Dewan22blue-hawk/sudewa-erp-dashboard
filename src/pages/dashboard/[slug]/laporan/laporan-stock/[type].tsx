"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanStock } from "@/services/laporan-stock.service"
import LaporanStockHeaderAction from "@/components/features/laporan-stock/LaporanStockHeaderAction"
import LaporanStockView from "@/components/features/laporan-stock/LaporanStockView"
import LaporanStockDetailView from "@/components/features/laporan-stock/LaporanStockDetailView"
import POOutstandingView from "@/components/features/laporan-stock/POOutstandingView"
import SOOutstandingView from "@/components/features/laporan-stock/SOOutstandingView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DetailLaporanStockPage() {
    const params = useParams()
    const router = useRouter()
    const search = useSearchParams()

    const type = params?.type as string
    const slug = params?.slug as string

    const awal = search.get("awal") || ""
    const akhir = search.get("akhir") || ""

    const { data } = useQuery({
        queryKey: ["laporan-stock", type, awal, akhir],
        queryFn: () =>
            getLaporanStock({
                jenis: type as any,
                periodeAwal: awal,
                periodeAkhir: akhir,
            }),
    })

    const getReportTitle = () => {
        switch (type) {
            case "laporan-stock": return "Laporan Stock"
            case "laporan-stock-detail": return "Laporan Stock Detail"
            case "po-outstanding": return "Purchase Order Outstanding"
            case "so-outstanding": return "Sales Order Outstanding"
            default: return "Laporan Stock"
        }
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/dashboard/${slug}/laporan/laporan-stock`)}
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {getReportTitle()}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Lihat detail laporan stock gudang dan order transaksi
                            </p>
                        </div>
                    </div>

                    <LaporanStockHeaderAction />
                </div>

                {type === "laporan-stock" && (
                    <LaporanStockView data={(data as any) || []} />
                )}

                {type === "laporan-stock-detail" && (
                    <LaporanStockDetailView data={(data as any) || []} />
                )}

                {type === "po-outstanding" && (
                    <POOutstandingView data={(data as any) || []} />
                )}

                {type === "so-outstanding" && (
                    <SOOutstandingView data={(data as any) || []} />
                )}

            </div>
        </DashboardLayout>
    )
}
