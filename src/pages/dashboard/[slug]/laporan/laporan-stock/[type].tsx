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
import { PageHeader } from '@/components/ui/page-header';
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
                start_date: awal,
                end_date: akhir,
            } as any),
    })

    const getReportTitle = () => {
        switch (type) {
            case "laporan-stock": return "Laporan Jumlah Stock"
            case "laporan-stock-detail": return "Laporan Stock Detail"
            case "purchase-order": return "Laporan Purchase Order Outstanding"
            case "sales-order": return "Laporan Sales Order Outstanding"
            default: return "Laporan Stock"
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    breadcrumbs={[
                        { label: 'Laporan Stock', onClick: () => router.push(`/dashboard/${slug}/laporan/laporan-stock`) },
                        { label: 'Detail Laporan' }
                    ]}
                    title={getReportTitle()}
                    subtitle="Lihat detail laporan stock gudang dan order transaksi"
                    onBack={() => router.push(`/dashboard/${slug}/laporan/laporan-stock`)}
                    actions={<LaporanStockHeaderAction />}
                />

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
