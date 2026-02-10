import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export type KpiTrend = "up" | "down"

export interface KpiConfig {
    key: string
    title: string
    value: string
    unit?: string
    trend: KpiTrend
    percentage: number
    icon: React.ComponentType<{ className?: string }>
}

export const KPI_DATA: KpiConfig[] = [
    {
        key: "bca-idr",
        title: "BCA (IDR)",
        value: "893.000.000",
        unit: "IDR",
        trend: "up",
        percentage: 15,
        icon: ArrowUpRight,
    },
    {
        key: "bca-usd",
        title: "BCA (USD)",
        value: "12.222",
        unit: "USD",
        trend: "up",
        percentage: 15,
        icon: ArrowUpRight,
    },
    {
        key: "cash",
        title: "Cash",
        value: "893.000.000",
        unit: "USD",
        trend: "down",
        percentage: 15,
        icon: ArrowDownRight,
    },
    {
        key: "net-worth",
        title: "Net Worth",
        value: "893.000.000",
        unit: "IDR",
        trend: "down",
        percentage: 15,
        icon: ArrowDownRight,
    },
]
