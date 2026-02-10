export interface MonthlyRevenue {
    month: string
    bcaIdr: number
    bcaUsd: number
    cash: number
}

export const MONTHLY_REVENUE: MonthlyRevenue[] = [
    { month: "Jan", bcaIdr: 40, bcaUsd: 30, cash: 20 },
    { month: "Feb", bcaIdr: 20, bcaUsd: 50, cash: 30 },
    { month: "Mar", bcaIdr: 35, bcaUsd: 45, cash: 25 },
    { month: "Apr", bcaIdr: 30, bcaUsd: 20, cash: 50 },
]

export const INCOME_BREAKDOWN = [
    { name: "BCA IDR", value: 893000000 },
    { name: "BCA USD", value: 12222 },
    { name: "Cash", value: 893000000 },
]
