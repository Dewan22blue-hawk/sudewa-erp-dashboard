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
                    </div>
                </div>

                {/* Sales Table */}
                <SalesTable onAdd={() => {
                    const slugQuery = router.query.slug
                    const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || ""
                    router.push(slug ? `/dashboard/${slug}/sales/create` : "/sales/create")
                }} />
            </div>
        </DashboardLayout>
    )
}
