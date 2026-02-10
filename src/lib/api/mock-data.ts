/**
 * Mock Data untuk Development
 * Data dummy yang structure-nya sesuai dengan expected API response
 */

import { DashboardApiResponse } from '@/@types/dashboard'

export const MOCK_DASHBOARD_DATA: DashboardApiResponse = {
    kpis: [
        {
            id: 'bca-idr',
            title: 'BCA',
            value: 893000000,
            currency: 'IDR',
            trend: 'up',
            trendPercentage: 16,
            trendLabel: 'Naik dibanding bulan lalu',
        },
        {
            id: 'bca-usd',
            title: 'BCA',
            value: 12222,
            currency: 'USD',
            trend: 'up',
            trendPercentage: 16,
            trendLabel: 'Naik dibanding bulan lalu',
        },
        {
            id: 'cash',
            title: 'Cash',
            value: 893000000,
            currency: 'USD',
            trend: 'down',
            trendPercentage: 16,
            trendLabel: 'Turun dibanding bulan lalu',
        },
        {
            id: 'net-worth',
            title: 'Net Worth',
            value: 893000000,
            currency: 'IDR',
            trend: 'down',
            trendPercentage: 16,
            trendLabel: 'Turun dibanding bulan lalu',
        },
    ],
    monthlyRevenue: [
        { month: 'Jan', bcaIdr: 40, bcaUsd: 30, cash: 20 },
        { month: 'Feb', bcaIdr: 20, bcaUsd: 50, cash: 30 },
        { month: 'Mar', bcaIdr: 35, bcaUsd: 45, cash: 25 },
        { month: 'Apr', bcaIdr: 30, bcaUsd: 20, cash: 50 },
        { month: 'May', bcaIdr: 45, bcaUsd: 35, cash: 30 },
        { month: 'Jun', bcaIdr: 25, bcaUsd: 40, cash: 35 },
        { month: 'Jul', bcaIdr: 50, bcaUsd: 30, cash: 25 },
        { month: 'Aug', bcaIdr: 35, bcaUsd: 45, cash: 30 },
        { month: 'Sep', bcaIdr: 40, bcaUsd: 35, cash: 40 },
        { month: 'Oct', bcaIdr: 30, bcaUsd: 50, cash: 35 },
        { month: 'Nov', bcaIdr: 45, bcaUsd: 40, cash: 30 },
        { month: 'Dec', bcaIdr: 35, bcaUsd: 35, cash: 45 },
    ],
    incomeBreakdown: [
        {
            category: 'BCA IDR',
            value: 893000000,
            percentage: 45,
            color: '#2D4263',
        },
        {
            category: 'BCA USD',
            value: 12222,
            percentage: 35,
            color: '#E4A853',
        },
        {
            category: 'Cash',
            value: 893000000,
            percentage: 20,
            color: '#C84B31',
        },
    ],
    lastUpdated: new Date().toISOString(),
}
