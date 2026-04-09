import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CashFlowFilterParams, CashFlowPayload } from '@/@types/kas-harian.types';
import { createCashFlow, deleteCashFlow, fetchCashFlow, updateCashFlow } from '@/services/cashFlowService';

const CASH_FLOW_KEY = 'cash-flow';

export const cashFlowKeys = {
  all: [CASH_FLOW_KEY] as const,
  list: (params: CashFlowFilterParams) => [CASH_FLOW_KEY, 'list', params] as const,
};

export function useKasHarian(params: CashFlowFilterParams) {
  return useQuery({
    queryKey: cashFlowKeys.list(params),
    queryFn: () => fetchCashFlow(params),
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useCreateKasHarian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CashFlowPayload) => createCashFlow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashFlowKeys.all });
    },
  });
}

export function useUpdateKasHarian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: CashFlowPayload }) => updateCashFlow(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashFlowKeys.all });
    },
  });
}

export function useDeleteKasHarian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteCashFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashFlowKeys.all });
    },
  });
}
