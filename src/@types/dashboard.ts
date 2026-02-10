/**
 * Dashboard Type Definitions
 * Type-safe interfaces untuk semua data structures pada dashboard
 */

export type Currency = 'IDR' | 'USD'
export type TrendDirection = 'up' | 'down'

/**
 * KPI (Key Performance Indicator) Data Structure
 */
export interface KpiData {
    id: string
    title: string
    value: number
    currency: Currency
    trend: TrendDirection
    trendPercentage: number
    trendLabel: string
}

/**
 * Monthly Revenue Data untuk Bar Chart
 */
export interface MonthlyRevenueData {
    month: string
    bcaIdr: number
    bcaUsd: number
    cash: number
}

/**
 * Income Breakdown Data untuk Donut Chart
 */
export interface IncomeBreakdownData {
    category: string
    value: number
    percentage: number
    color: string
}

/**
 * Complete Dashboard API Response
 */
export interface DashboardApiResponse {
    kpis: KpiData[]
    monthlyRevenue: MonthlyRevenueData[]
    incomeBreakdown: IncomeBreakdownData[]
    lastUpdated: string
}

/**
 * Dashboard Statistics Summary
 */
export interface DashboardStats {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    monthlyGrowth: number
}
