import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from "@/components/common/PageHeader"
import { KpiGrid } from "@/components/features/dashboard/KpiGrid"
import { RevenueBarChart } from "@/components/features/dashboard/charts/RevenueBarChart"
import { IncomeDonutChart } from "@/components/features/dashboard/charts/IncomeDonutChart"

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader title="Overview Keuangan" />

                {/* KPI Cards */}
                <KpiGrid />

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RevenueBarChart />
                    </div>
                    <IncomeDonutChart />
                </div>
            </div>
        </DashboardLayout>
    )
}
