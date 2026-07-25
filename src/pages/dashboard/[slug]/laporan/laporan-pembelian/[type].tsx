"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPembelian } from "@/services/laporan-pembelian.service"
import LaporanPembelianHeaderAction from "@/components/features/laporan-pembelian/LaporanPembelianHeaderAction"
import LaporanPembelianPerNotaView from "@/components/features/laporan-pembelian/LaporanPembelianPerNotaView"
import LaporanPembelianPerTypeView from "@/components/features/laporan-pembelian/LaporanPembelianPerTypeView"
import LaporanPembelianPerSupplierView from "@/components/features/laporan-pembelian/LaporanPembelianPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from '@/components/ui/page-header';
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
            } as any),
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
            <div className="space-y-6">
                <PageHeader
                    breadcrumbs={[
                        { label: 'Laporan Pembelian', onClick: () => router.push(`/dashboard/${slug}/laporan/laporan-pembelian`) },
                        { label: 'Detail Laporan' }
                    ]}
                    title={getReportTitle()}
                    subtitle="Lihat detail laporan pembelian"
                    onBack={() => router.push(`/dashboard/${slug}/laporan/laporan-pembelian`)}
                    actions={<LaporanPembelianHeaderAction />}
                />

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