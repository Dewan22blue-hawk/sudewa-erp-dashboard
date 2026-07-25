"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPenjualan } from "@/services/laporan-penjualan.service"
import LaporanPenjualanHeaderAction from "@/components/features/laporan-penjualan/LaporanPenjualanHeaderAction"
import LaporanPenjualanPerNotaView from "@/components/features/laporan-penjualan/LaporanPenjualanPerNotaView"
import LaporanPenjualanPerTypeView from "@/components/features/laporan-penjualan/LaporanPenjualanPerTypeView"
import LaporanPenjualanPerSupplierView from "@/components/features/laporan-penjualan/LaporanPenjualanPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from '@/components/ui/page-header';
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
                <PageHeader
                    breadcrumbs={[
                        { label: 'Laporan Penjualan', onClick: () => router.push(`/dashboard/${slug}/laporan/laporan-penjualan`) },
                        { label: 'Detail Laporan' }
                    ]}
                    title={getReportTitle()}
                    subtitle="Lihat detail laporan penjualan"
                    onBack={() => router.push(`/dashboard/${slug}/laporan/laporan-penjualan`)}
                    actions={<LaporanPenjualanHeaderAction />}
                />

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