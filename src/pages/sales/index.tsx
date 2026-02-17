import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from "@/components/common/PageHeader"
import { SalesTable } from "@/components/features/sales/SalesTable"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"

import { useRouter } from "next/router"

/**
 * Sales Page - Penjualan Unit
 * Halaman untuk mengelola dan melacak semua penjualan unit
 */
export default function SalesPage() {
    const router = useRouter()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <PageHeader
                        title="Penjualan Unit"
                        description="Kelola dan lacak semua penjualan unit"
                    />

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>

                        <Button size="sm" onClick={() => router.push("/sales/create")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah
                        </Button>
                    </div>
                </div>

                {/* Sales Table */}
                <SalesTable />
            </div>
        </DashboardLayout>
    )
}
