import { KpiData } from "@/@types/dashboard"
import { KpiCard } from "./KpiCard"
import { useDashboardData } from "@/hooks/useDashboardData"

export function KpiGrid() {
    const { data, isLoading } = useDashboardData()

    if (isLoading) {
        return (
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[140px] animate-pulse rounded-xl bg-muted" />
                ))}
            </section>
        )
    }

    if (!data) return null

    return (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.kpis.map((kpi) => (
                <KpiCard key={kpi.id} data={kpi} />
            ))}
        </section>
    )
}
