import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitTransactionService } from '@/services/unitTransaction.service';
import { useCompany } from '@/contexts/CompanyContext';
import { companyQueryKeys } from '@/lib/query/company-key';

export const useUnitTransactions = (options: { page?: number; perPage?: number; search?: string } = {}) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId
      ? companyQueryKeys.list(companyId, 'unit-transactions', { page: options.page, perPage: options.perPage, search: options.search })
      : ['unit-transactions', 'unscoped', options],
    queryFn: () => unitTransactionService.getUnitTransactions({ page: options.page, perPage: options.perPage, search: options.search, company_id: companyId ?? undefined }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(companyId),
  });
};

export const useUnitTransactionDetail = (id?: string) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId ? companyQueryKeys.detail(companyId, 'unit-transactions', id ?? '') : ['unit-transaction', 'unscoped', id],
    queryFn: () => unitTransactionService.getUnitTransactionDetail(id as string, companyId ?? undefined),
    enabled: !!id && Boolean(companyId),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePurchaseById = (id?: string) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId ? companyQueryKeys.detail(companyId, 'purchase-by-id', id ?? '') : ['purchase-by-id', 'unscoped', id],
    queryFn: () => unitTransactionService.getUnitTransactionDetail(id as string, companyId ?? undefined),
    enabled: !!id && Boolean(companyId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateUnitTransactionState = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: ({
      id,
      stockState,
      unitTransactionDetails,
      cashId,
      description,
    }: {
      id: string;
      stockState?: string;
      unitTransactionDetails?: Array<string | number>;
      cashId?: string | number;
      description?: string;
    }) =>
      unitTransactionService.updateUnitTransactionState(id, {
        stockState,
        unitTransactionDetails,
        cashId,
        description,
      }),
    onSuccess: (data) => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      }
      queryClient.invalidateQueries({ queryKey: ['unit-billings', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', data.id] });
    },
  });
};

export const useSubmitTransactionAdjustment = () => {
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { cashId: string; amount: number; description: string; itemDetailIds: string[] } }) =>
      unitTransactionService.submitTransactionAdjustment(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unit-transaction', variables.id] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.companyScope(companyId) });
      }
      queryClient.invalidateQueries({ queryKey: ['transaction-adjustments', variables.id] });
    },
  });
};

export const useTransactionAdjustments = (transactionId?: string) => {
  const { companyId } = useCompany();

  return useQuery({
    queryKey: companyId ? companyQueryKeys.detail(companyId, 'transaction-adjustments', transactionId ?? '') : ['transaction-adjustments', 'unscoped', transactionId],
    queryFn: () => unitTransactionService.getTransactionAdjustments(transactionId as string, companyId ?? undefined),
    enabled: !!transactionId && Boolean(companyId),
    staleTime: 1000 * 60 * 2,
  });
};
