/**
 * Dashboard Data Hook
 * React Query hook untuk data fetching dengan toast error
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { DashboardApiResponse } from '@/@types/dashboard';
import { dashboardService } from '@/lib/api/dashboard.service';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { companyQueryKeys } from '@/lib/query/company-key';

export function useDashboardData(): UseQueryResult<DashboardApiResponse, Error> {
    const { companyId } = useCompany();
    const query = useQuery({
        queryKey: companyId ? companyQueryKeys.list(companyId, 'dashboard-overview') : ['company', 'unselected', 'dashboard-overview'],
        queryFn: () => dashboardService.getDashboardData(companyId as string),
        enabled: Boolean(companyId),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
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
