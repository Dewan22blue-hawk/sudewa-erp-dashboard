"use client"

import { useRouter } from "next/router"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from "@/components/common/PageHeader"
import { EditUnitForm } from "@/components/features/sales/edit/EditUnitForm"
import { ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function CreateSalesPage() {
    const router = useRouter()

    const handleSubmit = (data: any) => {
        console.log("Submitting sales data:", data)
        // Simulation of API call
        setTimeout(() => {
            toast.success("Penjualan unit berhasil ditambahkan")
            router.push("/sales")
        }, 1000)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* BREADCRUMB HEADER */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                        className="hover:text-foreground cursor-pointer"
                        onClick={() => router.push("/sales")}
                    >
                        Penjualan Unit
                    </span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-medium text-foreground">Tambah Penjualan</span>
                </div>

                <div className="flex flex-col gap-1">
                    <PageHeader
                        title="Tambah Penjualan Unit"
                        description=""
                    />
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Kode Jual</span>
                        <span className="text-blue-600 font-medium">INV-WIN/20260216-0001</span>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-6 md:p-8">
                    <EditUnitForm
                        defaultValues={{
                            tipeUnit: "",
                            qty: 1,
                            harga: 0,
                            hppSatuan: 0,
                            totalHpp: 0,
                            dppSatuan: 0,
                            totalDpp: 0,
                            ppnSatuan: 0,
                            totalPpn: 0,
                            biayaBbn: 0,
                            biayaEkspedisi: 0,
                            biayaLain: 0,
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/sales")}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
