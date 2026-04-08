/**
 * Dashboard Data Hook
 * React Query hook untuk data fetching dengan toast error
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { DashboardApiResponse } from '@/@types/dashboard';
import { dashboardService } from '@/lib/api/dashboard.service';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const dashboardKeys = {
    all: ['dashboard'] as const,
    data: () => [...dashboardKeys.all, 'data'] as const,
};

export function useDashboardData(): UseQueryResult<DashboardApiResponse, Error> {
    const query = useQuery({
        queryKey: dashboardKeys.data(),
        queryFn: dashboardService.getDashboardData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 1, // Retry once
    });

    useEffect(() => {
        if (query.isError) {
            const errorMsg = query.error?.message || 'Gagal memuat data dashboard, silakan refresh halaman';
            toast.error(errorMsg);
        }
    }, [query.isError, query.error]);

    return query;
}
