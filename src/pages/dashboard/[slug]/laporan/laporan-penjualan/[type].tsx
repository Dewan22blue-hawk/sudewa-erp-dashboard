"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPenjualan } from "@/services/laporan-penjualan.service"
import LaporanPenjualanHeaderAction from "@/components/features/laporan-penjualan/LaporanPenjualanHeaderAction"
import LaporanPenjualanPerNotaView from "@/components/features/laporan-penjualan/LaporanPenjualanPerNotaView"
import LaporanPenjualanPerTypeView from "@/components/features/laporan-penjualan/LaporanPenjualanPerTypeView"
import LaporanPenjualanPerSupplierView from "@/components/features/laporan-penjualan/LaporanPenjualanPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
                start_date: awal,
                end_date: akhir,
            } as any),
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
            <div className="space-y-6">

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button onClick={() => router.push(`/dashboard/${slug}/laporan/laporan-penjualan`)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                            <ArrowLeft className="h-5 w-5 text-slate-700" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {getReportTitle()}
                            </h1>
                            <p className="text-sm text-muted-foreground">
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