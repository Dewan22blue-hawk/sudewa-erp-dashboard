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

export function useDashboardData(startDate?: string | null, endDate?: string | null): UseQueryResult<DashboardApiResponse, Error> {
    const { companyId } = useCompany();
    const query = useQuery({
        queryKey: companyId ? [...companyQueryKeys.list(companyId, 'dashboard-overview'), startDate, endDate] : ['company', 'unselected', 'dashboard-overview', startDate, endDate],
        queryFn: () => dashboardService.getDashboardData(companyId as string, startDate, endDate),
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

export function useUnitTypeSalesTrend(params: {
  company_id?: string | number;
  warehouse_id?: string | number;
  unit_type_id?: string | number;
  range?: string;
  start_date?: string;
  end_date?: string;
}) {
  const { companyId } = useCompany();
  return useQuery({
    queryKey: ['unit-type-sales-trend', companyId, params],
    queryFn: () => dashboardService.getUnitTypeSalesTrend({ company_id: companyId || params.company_id, ...params }),
    enabled: Boolean(companyId || params.company_id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
