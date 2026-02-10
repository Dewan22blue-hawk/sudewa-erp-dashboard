/**
 * Dashboard Data Hook
 * React Query hook untuk data fetching dengan caching dan refetching
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { DashboardApiResponse } from '@/@types/dashboard'
import { dashboardService } from '@/lib/api/dashboard.service'

/**
 * Query keys untuk React Query cache management
 */
export const dashboardKeys = {
    all: ['dashboard'] as const,
    data: () => [...dashboardKeys.all, 'data'] as const,
}

/**
 * Hook untuk fetch dashboard data
 * Includes automatic refetching, caching, dan error handling
 */
export function useDashboardData(): UseQueryResult<DashboardApiResponse, Error> {
    return useQuery({
        queryKey: dashboardKeys.data(),
        queryFn: dashboardService.getDashboardData,
        staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Cache kept for 10 minutes (previously cacheTime)
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 2,
    })
}
