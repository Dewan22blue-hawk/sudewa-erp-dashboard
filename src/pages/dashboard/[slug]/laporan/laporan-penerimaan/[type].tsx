"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getLaporanPenerimaan } from "@/services/laporan-penerimaan.service"
import LaporanPenerimaanHeaderAction from "@/components/features/laporan-penerimaan/LaporanPenerimaanHeaderAction"
import LaporanPenerimaanPerNotaView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerNotaView"
import LaporanPenerimaanPerTypeView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerTypeView"
import LaporanPenerimaanPerSupplierView from "@/components/features/laporan-penerimaan/LaporanPenerimaanPerSupplierView"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from '@/components/ui/page-header';
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
                <PageHeader
                    breadcrumbs={[
                        { label: 'Laporan Penerimaan', onClick: () => router.push(`/dashboard/${slug}/laporan/laporan-penerimaan`) },
                        { label: 'Detail Laporan' }
                    ]}
                    title={getReportTitle()}
                    subtitle="Lihat detail laporan penerimaan barang"
                    onBack={() => router.push(`/dashboard/${slug}/laporan/laporan-penerimaan`)}
                    actions={<LaporanPenerimaanHeaderAction />}
                />

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
