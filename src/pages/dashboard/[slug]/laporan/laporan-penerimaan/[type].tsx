"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPenerimaan } from "@/services/laporan-penerimaan.service"
import LaporanPenerimaanHeaderAction from "@/components/features/laporan-penerimaan/LaporanPenerimaanHeaderAction"
import LaporanPenerimaanPerNotaView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerNotaView"
import LaporanPenerimaanPerTypeView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerTypeView"
import LaporanPenerimaanPerSupplierView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
            <div className="space-y-6">

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button onClick={() => router.push(`/dashboard/${slug}/laporan/laporan-penerimaan`)} variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
                            <ArrowLeft className="h-5 w-5 text-slate-700" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {getReportTitle()}
                            </h1>
                            <p className="text-sm text-muted-foreground">
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
