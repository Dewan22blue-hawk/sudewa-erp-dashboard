import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinanceBillingItemPayload } from '@/@types/finance-billing.types';
import { createFinanceBillingItem, fetchFinanceBilling, fetchFinanceBillingDetail } from '@/services/financeBilling.service';

const FINANCE_BILLING_KEY = 'finance-billing';

export const financeBillingKeys = {
  all: [FINANCE_BILLING_KEY] as const,
  list: (params: { page?: number; per_page?: number; search?: string }) => [FINANCE_BILLING_KEY, 'list', params] as const,
  detail: (id: number | string | undefined) => [FINANCE_BILLING_KEY, 'detail', id] as const,
};

export function useFinanceBilling(params: { page?: number; per_page?: number; search?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: financeBillingKeys.list(params),
    queryFn: () => fetchFinanceBilling(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useFinanceBillingDetail(id?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: financeBillingKeys.detail(id),
    queryFn: () => fetchFinanceBillingDetail(id as number),
    enabled: (options?.enabled ?? true) && typeof id === 'number' && Number.isFinite(id),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFinanceBillingItem(id?: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FinanceBillingItemPayload) => createFinanceBillingItem(id as number, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeBillingKeys.all });
    },
  });
}
