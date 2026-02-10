/**
 * Dashboard Validation Schemas
 * Zod schemas untuk runtime validation dan type inference
 */

import { z } from 'zod'

/**
 * KPI Data Schema
 */
export const kpiDataSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    value: z.number().nonnegative(),
    currency: z.enum(['IDR', 'USD']),
    trend: z.enum(['up', 'down']),
    trendPercentage: z.number().min(0).max(100),
    trendLabel: z.string(),
})

/**
 * Monthly Revenue Schema
 */
export const monthlyRevenueSchema = z.object({
    month: z.string().regex(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/),
    bcaIdr: z.number().nonnegative(),
    bcaUsd: z.number().nonnegative(),
    cash: z.number().nonnegative(),
})

/**
 * Income Breakdown Schema
 */
export const incomeBreakdownSchema = z.object({
    category: z.string().min(1),
    value: z.number().nonnegative(),
    percentage: z.number().min(0).max(100),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // Hex color validation
})

/**
 * Complete Dashboard Response Schema
 */
export const dashboardResponseSchema = z.object({
    kpis: z.array(kpiDataSchema).min(1),
    monthlyRevenue: z.array(monthlyRevenueSchema).min(1),
    incomeBreakdown: z.array(incomeBreakdownSchema).min(1),
    lastUpdated: z.string().datetime(),
})

/**
 * Type inference dari schemas
 */
export type KpiDataInput = z.infer<typeof kpiDataSchema>
export type MonthlyRevenueInput = z.infer<typeof monthlyRevenueSchema>
export type IncomeBreakdownInput = z.infer<typeof incomeBreakdownSchema>
export type DashboardResponseInput = z.infer<typeof dashboardResponseSchema>
